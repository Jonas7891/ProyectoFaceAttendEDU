// ============================================================
//  FaceAttend EDU — Reports ViewModel
// ============================================================
//  RESPONSABILIDAD: Lógica de negocio para reportes ("qué hacer")
//
//  Este ViewModel:
//  ✓ Gestiona estado de filtros y período
//  ✓ Procesa y calcula datos de reportes
//  ✓ Orquesta exportaciones (delega a servicio)
//  ✓ Optimiza renders con useMemo y useCallback
//
//  NO debe:
//  ✗ Renderizar UI (responsabilidad de la View)
//  ✗ Formatear datos para exportación (responsabilidad de servicio)
//
//  Patrón MVVM: ViewModel = lógica + estado
// ============================================================

import { useState, useMemo, useCallback } from "react";
import { useTheme } from "../view/components/hooks/useTheme";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../context/AppDataContext";
import { mockAttendanceByDay, mockAttendanceByWeek } from "../models/data/mockData";
import { exportToExcel, exportToPDF, buildReportHTML, buildHTMLTable, formatPercentageWithColor, formatStatusBadge } from "../core/utils/exportHelpers";

// ══════════════════════════════════════════════════════════
// CONSTANTES Y TIPOS PÚBLICOS
// ══════════════════════════════════════════════════════════

/**
 * Opciones de período disponibles para reportes
 */
export const PERIOD_OPTIONS = [
    { value: "week", label: "Esta semana" },
    { value: "month", label: "Este mes" },
    { value: "semester", label: "Semestre" },
];

/**
 * Filtros por defecto para reportes
 */
export const DEFAULT_FILTERS = {
    courseCode: "",
    attendanceMin: 0,
    attendanceMax: 100,
    statusFilter: "all",
    showAtRiskOnly: false,
};

// ══════════════════════════════════════════════════════════
// HELPERS INTERNOS
// ══════════════════════════════════════════════════════════

/**
 * Genera label amigable del período actual
 * @private
 */
function periodLabel(p) {
    if (p === "week") return "Esta semana";
    if (p === "month") return "Este mes";
    return "Semestre 2024-2";
}

/**
 * Filtra datos semanales según período seleccionado
 * @private
 */
function weekDataForPeriod(period) {
    if (period === "week") return mockAttendanceByWeek.slice(0, 1);
    if (period === "month") return mockAttendanceByWeek.slice(0, 4);
    return mockAttendanceByWeek;
}

/**
 * Obtiene datos diarios según período
 * @private
 */
function dailyDataForPeriod(_period) {
    return mockAttendanceByDay;
}

/**
 * Construye filas para exportación a Excel
 * @private
 */
function buildExcelRows(students, period, _filters) {
    return students.map((s) => ({
        Código: s.code,
        Nombre: s.name,
        Programa: s.courseName || s.course, // Usar nombre completo del curso
        "Ficha/Semestre": s.grade,
        "Asistencia (%)": s.attendance,
        Estado: s.status === "active" ? "Activo" : "Inactivo",
        "Facial reg.": s.registered ? "Sí" : "No",
        Período: periodLabel(period),
    }));
}

// ══════════════════════════════════════════════════════════
// VIEWMODEL PRINCIPAL
// ══════════════════════════════════════════════════════════

/**
 * Hook principal del ViewModel de Reportes
 * 
 * Gestiona la lógica de reportes y sanciones, incluyendo filtrado
 * por tipo, ficha, usuario y umbral de asistencia.
 * 
 * @param {string} filterType - Tipo de filtro ("at-risk" | "ficha" | "user" | null)
 * @param {string} fichaId - ID de ficha específica
 * @param {string} userId - ID de usuario específico
 * @param {number} attendanceThreshold - Umbral de asistencia (default: 75)
 * @returns {object} Estado y métodos del ViewModel
 * 
 * @example
 * // Uso básico - todos los estudiantes
 * const vm = useReportsViewModel();
 * 
 * @example
 * // Filtrar estudiantes en riesgo
 * const vm = useReportsViewModel("at-risk", null, null, 75);
 * 
 * @example
 * // Estudiantes de una ficha específica
 * const vm = useReportsViewModel("ficha", "2640001", null, 75);
 */
export function useReportsViewModel(
    filterType = null,
    fichaId = null,
    userId = null,
    attendanceThreshold = 75
) {
    // ── Estado local ──────────────────────────────────────────
    const [period, setPeriod] = useState("semester");
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState("");
    const [fichaFilter, setFichaFilter] = useState(fichaId || "");
    const [statusFilter, setStatusFilter] = useState("active");

    // ── Hooks de contexto ─────────────────────────────────────
    const { theme } = useTheme();
    const { t } = useTranslation();
    const appData = useAppData();
    const c = theme.colors;

    // ── Datos del contexto global ─────────────────────────────
    const students = appData.students;
    const courses = appData.courses;
    const isLoading = appData.isLoading;

    /**
     * Helper: obtener nombre completo del curso desde su código o nombre
     */
    const getCourseName = useCallback((courseCodeOrName) => {
        if (!courseCodeOrName) return '—';
        const course = courses.find(c => c.code === courseCodeOrName || c.name === courseCodeOrName);
        return course ? course.name : courseCodeOrName;
    }, [courses]);

    // ══════════════════════════════════════════════════════════
    // DATOS DERIVADOS MEMOIZADOS
    // ══════════════════════════════════════════════════════════

    /**
     * Fichas/programas disponibles para filtrado
     */
    const availableFichas = useMemo(
        () => [
            { value: "", label: t("Todas las fichas") },
            ...appData.programs.map((p) => ({
                value: p.code || p.name,
                label: `${p.code || ""} - ${p.name}`,
            })),
        ],
        [appData.programs, t]
    );

    /**
     * Nombre de la ficha actual (para subtítulo)
     */
    const fichaName = useMemo(() => {
        if (!fichaFilter) return null;
        const ficha = appData.programs.find(p => p.code === fichaFilter || p.name === fichaFilter);
        return ficha ? ficha.name : fichaFilter;
    }, [fichaFilter, appData.programs]);

    /**
     * Datos de asistencia semanal según período
     */
    const attendanceByWeek = useMemo(
        () => weekDataForPeriod(period),
        [period]
    );

    /**
     * Datos de asistencia diaria
     */
    const attendanceByDay = useMemo(
        () => dailyDataForPeriod(period),
        [period]
    );

    /**
     * Verifica si hay filtros activos
     */
    const filtersActive = useMemo(
        () =>
            filters.courseCode !== DEFAULT_FILTERS.courseCode ||
            filters.attendanceMin !== DEFAULT_FILTERS.attendanceMin ||
            filters.attendanceMax !== DEFAULT_FILTERS.attendanceMax ||
            filters.statusFilter !== DEFAULT_FILTERS.statusFilter ||
            filters.showAtRiskOnly !== DEFAULT_FILTERS.showAtRiskOnly,
        [filters]
    );

    /**
     * Estudiantes filtrados según todos los criterios
     * - filterType (at-risk, ficha, user)
     * - fichaId
     * - userId
     * - attendanceThreshold
     * - search
     * - statusFilter
     * 
     * Enriquecidos con:
     * - courseName: nombre completo del curso
     */
    const filteredStudents = useMemo(() => {
        let result = students;

        // Filtro por tipo
        if (filterType === "at-risk") {
            result = result.filter(s => s.attendance < attendanceThreshold);
        }

        // Filtro por ficha
        if (fichaId || fichaFilter) {
            const targetFicha = fichaId || fichaFilter;
            result = result.filter(s => s.course === targetFicha || s.grade === targetFicha);
        }

        // Filtro por usuario específico
        if (userId) {
            result = result.filter(s => s.id === userId);
        }

        // Filtro por búsqueda
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(s =>
                s.name.toLowerCase().includes(searchLower) ||
                s.code?.toLowerCase().includes(searchLower) ||
                s.document?.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por estado
        if (statusFilter !== "all") {
            result = result.filter(s => s.status === statusFilter);
        }

        // Enriquecer con nombre completo del curso
        return result.map(student => ({
            ...student,
            courseName: getCourseName(student.course),
        }));
    }, [students, filterType, fichaId, fichaFilter, userId, attendanceThreshold, search, statusFilter, getCourseName]);

    /**
     * Estudiantes en riesgo (asistencia < 75%)
     */
    const atRiskStudents = useMemo(
        () => filteredStudents.filter((s) => s.attendance < 75),
        [filteredStudents]
    );

    /**
     * Estadísticas principales del dashboard
     * Calcula métricas globales con factor de período
     */
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
            activeStudents.reduce((sum, s) => sum + s.attendance, 0) /
                (activeStudents.length || 1)
        );
        const atRiskCount = students.filter((s) => s.attendance < 75).length;
        const programCount = appData.programs.length;

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
    }, [c, t, period, students, appData.programs]);

    /**
     * Distribución de asistencia por categorías
     */
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

    /**
     * Ranking de programas por asistencia promedio
     * Agrupa estudiantes y calcula promedios
     */
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

    // ══════════════════════════════════════════════════════════
    // HANDLERS MEMOIZADOS (OPTIMIZACIÓN DE PERFORMANCE)
    // ══════════════════════════════════════════════════════════

    /**
     * Resetea filtros a valores por defecto
     * useCallback evita recreación en cada render
     */
    const resetFilters = useCallback(() => {
        setFilters({ ...DEFAULT_FILTERS });
    }, []);

    /**
     * Toggle filtros de búsqueda
     */
    const toggleFilters = useCallback(() => {
        setShowFilters(prev => !prev);
    }, []);

    /**
     * Notificar a un estudiante individual
     */
    const notifyStudent = useCallback((studentId) => {
        console.log("Notificar estudiante:", studentId);
        // TODO: Implementar lógica de notificación
    }, []);

    /**
     * Notificar a todos los estudiantes filtrados
     */
    const notifyAll = useCallback(() => {
        console.log("Notificar a todos:", filteredStudents.length, "estudiantes");
        // TODO: Implementar lógica de notificación masiva
    }, [filteredStudents]);

    /**
     * Ver detalles de un estudiante
     */
    const viewStudentDetails = useCallback((studentId) => {
        console.log("Ver detalles de estudiante:", studentId);
        // TODO: Navegar a detalle de estudiante
    }, []);

    /**
     * Ver historial completo
     */
    const viewFullHistory = useCallback(() => {
        console.log("Ver historial completo");
        // TODO: Navegar a vista de historial
    }, []);

    /**
     * Exporta datos a Excel
     * Orquesta la exportación delegando formato a servicio
     */
    const exportExcel = useCallback(() => {
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
    }, [filteredStudents, period, filters, attendanceByWeek, courseRanking]);

    /**
     * Exporta datos a PDF
     * Construye HTML y delega exportación a servicio
     */
    const exportPDF = useCallback(() => {
        const periodText = periodLabel(period);

        // Construir notas de filtros
        const filterNotes = [];
        if (filters.courseCode) filterNotes.push(`Programa: ${filters.courseCode}`);
        if (filters.showAtRiskOnly) filterNotes.push("Solo en riesgo");
        if (filters.statusFilter !== "all")
            filterNotes.push(`Estado: ${filters.statusFilter}`);
        if (filters.attendanceMin > 0 || filters.attendanceMax < 100)
            filterNotes.push(
                `Asistencia: ${filters.attendanceMin}%–${filters.attendanceMax}%`
            );

        // Construir tabla de estudiantes
        const studentsTable = buildHTMLTable(filteredStudents, [
            { key: "code", label: "Código" },
            { key: "name", label: "Nombre" },
            { key: "courseName", label: "Programa", render: (value, row) => value || row.course },
            { key: "grade", label: "Ficha/Semestre" },
            {
                key: "attendance",
                label: "Asistencia",
                align: "center",
                render: (value) => formatPercentageWithColor(value, 75, 60),
            },
            {
                key: "status",
                label: "Estado",
                render: (value) => {
                    return formatStatusBadge(value, {
                        active: { text: "Activo", color: c.status.success },
                        inactive: { text: "Inactivo", color: c.text.disabled },
                    });
                },
            },
        ]);

        // Construir tabla de evolución semanal
        const weeklyTable = buildHTMLTable(attendanceByWeek, [
            { key: "week", label: "Semana" },
            {
                key: "rate",
                label: "Tasa",
                align: "center",
                render: (value) => `${value}%`,
            },
        ]);

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
    }, [filteredStudents, period, filters, attendanceByWeek, c]);

    /**
     * Exportar selección actual
     */
    const exportSelection = useCallback(() => {
        exportExcel();
    }, [exportExcel]);

    // ══════════════════════════════════════════════════════════
    // RETORNO DEL VIEWMODEL
    // ══════════════════════════════════════════════════════════

    return {
        // Estado básico
        period,
        setPeriod,
        filters,
        setFilters,
        filtersActive,
        showFilters,
        search,
        setSearch,
        fichaFilter,
        setFichaFilter,
        statusFilter,
        setStatusFilter,
        fichaName,

        // Acciones memoizadas
        resetFilters,
        toggleFilters,
        exportExcel,
        exportPDF,
        notifyStudent,
        notifyAll,
        viewStudentDetails,
        exportSelection,
        viewFullHistory,

        // Datos derivados memoizados
        stats: stats || [],
        distribution: distribution || [],
        attendanceByDay: attendanceByDay || [],
        attendanceByWeek: attendanceByWeek || [],
        courseRanking: courseRanking || [],
        atRiskStudents: atRiskStudents || [],
        filteredStudents: filteredStudents || [],
        availableFichas: availableFichas || [],

        // Estado de carga
        isLoading,
    };
}
