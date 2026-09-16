import { useState, useMemo } from "react";
import { useTheme } from "../view/components/hooks/useTheme";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../context/AppDataContext";
import { mockAttendanceByDay, mockAttendanceByWeek } from "../models/data/mockData";
import { exportToExcel, exportToPDF, buildReportHTML, buildHTMLTable, formatPercentageWithColor, formatStatusBadge } from "../core/utils/exportHelpers";

// ── xlsx (solo se importa en runtime para evitar problemas SSR) ──
// Se usa dynamic require para mantener compatibilidad con Expo web.

// ── Tipos públicos ────────────────────────────────────────────

export const PERIOD_OPTIONS = [
    { value: "week", label: "Esta semana" },
    { value: "month", label: "Este mes" },
    { value: "semester", label: "Semestre" },
];

// ── Filtros ───────────────────────────────────────────────────

export const DEFAULT_FILTERS = {
    courseCode: "",
    attendanceMin: 0,
    attendanceMax: 100,
    statusFilter: "all",
    showAtRiskOnly: false,
};

// ── Helpers de label ─────────────────────────────────────────

function periodLabel(p) {
    if (p === "week") return "Esta semana";
    if (p === "month") return "Este mes";
    return "Semestre 2024-2";
}

// ── Generación de datos por período ──────────────────────────

function weekDataForPeriod(period) {
    if (period === "week") return mockAttendanceByWeek.slice(0, 1);
    if (period === "month") return mockAttendanceByWeek.slice(0, 4);
    return mockAttendanceByWeek;
}

function dailyDataForPeriod(_period) {
    return mockAttendanceByDay;
}

// ── Export helpers ────────────────────────────────────────────

function buildExcelRows(students, period, _filters) {
    return students.map((s) => ({
        Código: s.code,
        Nombre: s.name,
        Programa: s.course,
        "Ficha/Semestre": s.grade,
        "Asistencia (%)": s.attendance,
        Estado: s.status === "active" ? "Activo" : "Inactivo",
        "Facial reg.": s.registered ? "Sí" : "No",
        Período: periodLabel(period),
    }));
}

// ── ViewModel ────────────────────────────────────────────────

export function useReportsViewModel() {
    const [period, setPeriod] = useState("semester");
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [showFilters, setShowFilters] = useState(false);

    const { theme } = useTheme();
    const { t } = useTranslation();
    const appData = useAppData();
    const c = theme.colors;

    // Datos vienen del contexto global — sin carga local
    const students = appData.students;
    const isLoading = appData.isLoading;

    // ── Programas disponibles (dinámico desde contexto) ──────
    const availableCourses = useMemo(() => appData.programs.map((p) => p.name), [appData.programs]);

    // ── Datos derivados del período ──────────────────────────

    const attendanceByWeek = useMemo(() => weekDataForPeriod(period), [period]);
    const attendanceByDay = useMemo(() => dailyDataForPeriod(period), [period]);

    // ── Filtros activos ──────────────────────────────────────

    const filtersActive = useMemo(
        () =>
            filters.courseCode !== DEFAULT_FILTERS.courseCode ||
            filters.attendanceMin !== DEFAULT_FILTERS.attendanceMin ||
            filters.attendanceMax !== DEFAULT_FILTERS.attendanceMax ||
            filters.statusFilter !== DEFAULT_FILTERS.statusFilter ||
            filters.showAtRiskOnly !== DEFAULT_FILTERS.showAtRiskOnly,
        [filters]
    );

    const resetFilters = () => setFilters({ ...DEFAULT_FILTERS });

    // ── Estudiantes filtrados (sobre datos reales) ────────────

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            if (filters.courseCode && s.course !== filters.courseCode) return false;
            if (s.attendance < filters.attendanceMin) return false;
            if (s.attendance > filters.attendanceMax) return false;
            if (filters.statusFilter !== "all" && s.status !== filters.statusFilter) return false;
            if (filters.showAtRiskOnly && s.attendance >= 75) return false;
            return true;
        });
    }, [students, filters]);

    const atRiskStudents = useMemo(() => filteredStudents.filter((s) => s.attendance < 75), [filteredStudents]);

    // ── Stats calculadas sobre datos reales ──────────────────

    const stats = useMemo(() => {
        if (students.length === 0) {
            return [
                { label: t("Asistencia global"), value: "—", color: c.brand.primary, icon: "trending-up" },
                { label: t("Total aprendices"), value: "0", color: c.status.success, icon: "users" },
                { label: t("En riesgo"), value: "0", color: c.status.danger, icon: "alert-circle" },
                { label: t("Programas"), value: "0", color: c.status.warning, icon: "book-open" },
            ];
        }

        const activeStudents = students.filter((s) => s.status === "active");
        const avgAttendance = Math.round(
            activeStudents.reduce((sum, s) => sum + s.attendance, 0) / (activeStudents.length || 1)
        );
        const atRiskCount = students.filter((s) => s.attendance < 75).length;
        const programCount = availableCourses.length;

        // Factor de escala según período para simular variación
        const factor = period === "week" ? 1.03 : period === "month" ? 1.01 : 1;
        const displayRate = Math.min(100, Math.round(avgAttendance * factor));

        const change = period === "week" ? 1.2 : period === "month" ? 0.8 : 0;

        return [
            {
                label: t("Asistencia global"),
                value: `${displayRate}%`,
                change: change,
                changeLabel: t("vs período ant."),
                color: c.brand.primary,
                icon: "trending-up",
            },
            {
                label: t("Total aprendices"),
                value: students.length,
                change: 0,
                color: c.status.success,
                icon: "users",
            },
            {
                label: t("En riesgo"),
                value: atRiskCount,
                color: c.status.danger,
                icon: "alert-circle",
            },
            {
                label: t("Programas"),
                value: programCount,
                color: c.status.warning,
                icon: "book-open",
            },
        ];
    }, [c, t, period, students, availableCourses]);

    const distribution = useMemo(() => {
        if (students.length === 0)
            return [
                { name: t("A tiempo"), value: 0, color: c.status.success },
                { name: t("Tardanzas"), value: 0, color: c.status.warning },
                { name: t("Ausentes"), value: 0, color: c.status.danger },
            ];

        const onTime = students.filter((s) => s.attendance >= 85).length;
        const late = students.filter((s) => s.attendance >= 75 && s.attendance < 85).length;
        const absent = students.filter((s) => s.attendance < 75).length;
        const total = students.length;

        return [
            { name: t("A tiempo"), value: Math.round((onTime / total) * 100), color: c.status.success },
            { name: t("Tardanzas"), value: Math.round((late / total) * 100), color: c.status.warning },
            { name: t("Ausentes"), value: Math.round((absent / total) * 100), color: c.status.danger },
        ];
    }, [c, t, students]);

    // ── Ranking por programa (derivado de estudiantes reales) ─

    const courseRanking = useMemo(() => {
        if (students.length === 0) return [];

        // Agrupa estudiantes por programa y calcula promedio de asistencia
        const byProgram = new Map();
        for (const s of students) {
            if (!s.course) continue;
            if (!byProgram.has(s.course)) byProgram.set(s.course, []);
            byProgram.get(s.course).push(s.attendance);
        }

        return Array.from(byProgram.entries())
            .map(([name, rates]) => ({
                code: name.slice(0, 8).toUpperCase().replace(/ /g, "-"),
                courseName: name,
                rate: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length),
            }))
            .sort((a, b) => b.rate - a.rate)
            .map((item, idx) => ({
                ...item,
                rank: idx + 1,
                barColor: item.rate >= 85 ? c.status.success : c.status.warning,
            }));
    }, [c, students]);

    // ── Exportar Excel ───────────────────────────────────────

    const exportExcel = () => {
        const rows = buildExcelRows(filteredStudents, period, filters);

        // Hoja 2: evolución semanal
        const weeklyRows = attendanceByWeek.map((w) => ({
            Semana: w.week,
            "Tasa de Asistencia (%)": w.rate,
        }));

        // Hoja 3: ranking por programa
        const rankRows = courseRanking.map((r) => ({
            Posición: r.rank,
            Programa: r.courseName,
            "Promedio (%)": r.rate,
        }));

        // Configurar hojas con anchos de columna
        const sheets = [
            {
                name: "Aprendices",
                data: rows,
                columns: [
                    { wch: 12 }, // Código
                    { wch: 32 }, // Nombre
                    { wch: 32 }, // Programa
                    { wch: 18 }, // Ficha/Semestre
                    { wch: 16 }, // Asistencia (%)
                    { wch: 12 }, // Estado
                    { wch: 12 }, // Facial reg.
                    { wch: 20 }, // Período
                ],
            },
            {
                name: "Evolución Semanal",
                data: weeklyRows,
            },
            {
                name: "Ranking Programas",
                data: rankRows,
            },
        ];

        const filename = `Reporte_Asistencia_${periodLabel(period).replace(/ /g, "_")}.xlsx`;
        const result = exportToExcel(sheets, filename);
        
        if (!result.success) {
            console.error("Error al exportar Excel:", result.error);
        }
    };

    // ── Exportar PDF ─────────────────────────────────────────

    const exportPDF = () => {
        const periodText = periodLabel(period);
        
        // Construir notas de filtros
        const filterNotes = [];
        if (filters.courseCode) filterNotes.push(`Programa: ${filters.courseCode}`);
        if (filters.showAtRiskOnly) filterNotes.push("Solo en riesgo");
        if (filters.statusFilter !== "all") filterNotes.push(`Estado: ${filters.statusFilter}`);
        if (filters.attendanceMin > 0 || filters.attendanceMax < 100)
            filterNotes.push(`Asistencia: ${filters.attendanceMin}%–${filters.attendanceMax}%`);

        // Construir tabla de estudiantes
        const studentsTable = buildHTMLTable(
            filteredStudents,
            [
                { key: "code", label: "Código" },
                { key: "name", label: "Nombre" },
                { key: "course", label: "Programa" },
                { key: "grade", label: "Ficha/Semestre" },
                { 
                    key: "attendance", 
                    label: "Asistencia", 
                    align: "center",
                    render: (value) => formatPercentageWithColor(value, 75, 60)
                },
                { 
                    key: "status", 
                    label: "Estado",
                    render: (value) => formatStatusBadge(value, {
                        active: { text: "Activo", color: "#10B981" },
                        inactive: { text: "Inactivo", color: "#6B7280" }
                    })
                },
            ]
        );

        // Construir tabla de evolución semanal
        const weeklyTable = buildHTMLTable(
            attendanceByWeek,
            [
                { key: "week", label: "Semana" },
                { 
                    key: "rate", 
                    label: "Tasa", 
                    align: "center",
                    render: (value) => `${value}%`
                },
            ]
        );

        // Construir HTML completo del reporte
        const html = buildReportHTML({
            title: "Reporte de Asistencia — FaceAttend EDU",
            subtitle: `Período: ${periodText}`,
            filters: filterNotes,
            sections: [
                {
                    title: `Detalle de Aprendices (${filteredStudents.length})`,
                    content: studentsTable,
                },
                {
                    title: "Evolución Semanal",
                    content: `<div style="max-width:320px">${weeklyTable}</div>`,
                },
            ],
            footer: "FaceAttend EDU — Reporte generado automáticamente",
        });

        const result = exportToPDF(html, `Reporte_${periodText}`);
        
        if (!result.success) {
            console.warn("Error al exportar PDF:", result.error);
        }
    };

    return {
        period,
        setPeriod,
        filters,
        setFilters,
        filtersActive,
        resetFilters,
        showFilters,
        openFilters: () => setShowFilters(true),
        closeFilters: () => setShowFilters(false),
        stats: stats || [],
        distribution: distribution || [],
        attendanceByDay: attendanceByDay || [],
        attendanceByWeek: attendanceByWeek || [],
        courseRanking: courseRanking || [],
        atRiskStudents: atRiskStudents || [],
        filteredStudents: filteredStudents || [],
        availableCourses: availableCourses || [],
        isLoading,
        exportExcel,
        exportPDF,
    };
}
