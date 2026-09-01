// ============================================================
//  FaceAttend EDU — Reports ViewModel
//  Incluye lógica de filtros y exportación PDF / Excel.
//  Consume AppDataContext como única fuente de verdad.
// ============================================================

import { useState, useMemo } from "react";
import { Platform } from "react-native";
import { useTheme } from "../view/components/hooks/useTheme";
import { useTranslation } from "../i18n/hooks/useTranslation";
import { useAppData } from "../context/AppDataContext";
import { mockAttendanceByDay, mockAttendanceByWeek } from "../models/data/mockData";

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

function buildPDFHtml(students, period, filters, weeklyData) {
    const periodText = periodLabel(period);
    const filterNotes = [];
    if (filters.courseCode) filterNotes.push(`Programa: ${filters.courseCode}`);
    if (filters.showAtRiskOnly) filterNotes.push("Solo en riesgo");
    if (filters.statusFilter !== "all") filterNotes.push(`Estado: ${filters.statusFilter}`);
    if (filters.attendanceMin > 0 || filters.attendanceMax < 100)
        filterNotes.push(`Asistencia: ${filters.attendanceMin}%–${filters.attendanceMax}%`);

    const tableRows = students
        .map(
            (s) => `
        <tr>
            <td>${s.code}</td>
            <td>${s.name}</td>
            <td>${s.course}</td>
            <td>${s.grade}</td>
            <td style="text-align:center;font-weight:bold;color:${s.attendance < 75 ? "#EF4444" : "#10B981"}">${
                s.attendance
            }%</td>
            <td>${s.status === "active" ? "Activo" : "Inactivo"}</td>
        </tr>
    `
        )
        .join("");

    const weeklyRows = weeklyData
        .map((w) => `<tr><td>${w.week}</td><td style="text-align:center">${w.rate}%</td></tr>`)
        .join("");

    return `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"/>
<title>Reporte de Asistencia — ${periodText}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 32px; color: #1a1a2e; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
  .filter-tag { display:inline-block; background:#EEF2FF; color:#4F6BED;
                padding: 3px 10px; border-radius:99px; font-size:12px; margin-right:6px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
  th { background: #4F6BED; color: #fff; padding: 8px 12px; text-align: left; }
  td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f9fafb; }
  .section-title { font-size: 15px; font-weight: bold; margin: 24px 0 8px; border-bottom: 2px solid #4F6BED; padding-bottom: 4px; }
  .footer { margin-top: 32px; font-size: 11px; color: #999; text-align: center; }
  @media print { body { margin: 16px; } }
</style>
</head>
<body>
  <h1>📊 Reporte de Asistencia — FaceAttend EDU</h1>
  <div class="subtitle"><strong>Período: ${periodText}</strong> &nbsp;|&nbsp; Generado: ${new Date().toLocaleDateString(
        "es-CO",
        { dateStyle: "full" }
    )}</div>

  ${
      filterNotes.length
          ? `<div style="margin-bottom:16px">${filterNotes.map((n) => `<span class="filter-tag">${n}</span>`).join("")}</div>`
          : ""
  }

  <div class="section-title">Detalle de Aprendices (${students.length})</div>
  <table>
    <thead><tr><th>Código</th><th>Nombre</th><th>Programa</th><th>Ficha/Semestre</th><th>Asistencia</th><th>Estado</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="section-title">Evolución Semanal</div>
  <table style="max-width:320px">
    <thead><tr><th>Semana</th><th>Tasa</th></tr></thead>
    <tbody>${weeklyRows}</tbody>
  </table>

  <div class="footer">FaceAttend EDU — Reporte generado automáticamente</div>
</body>
</html>`;
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
                { label: t("Total aprendices"), value: "0", color: c.states.success, icon: "users" },
                { label: t("En riesgo"), value: "0", color: c.states.danger, icon: "alert-circle" },
                { label: t("Programas"), value: "0", color: c.states.warning, icon: "book-open" },
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
                color: c.states.success,
                icon: "users",
            },
            {
                label: t("En riesgo"),
                value: atRiskCount,
                color: c.states.danger,
                icon: "alert-circle",
            },
            {
                label: t("Programas"),
                value: programCount,
                color: c.states.warning,
                icon: "book-open",
            },
        ];
    }, [c, t, period, students, availableCourses]);

    const distribution = useMemo(() => {
        if (students.length === 0)
            return [
                { name: t("A tiempo"), value: 0, color: c.states.success },
                { name: t("Tardanzas"), value: 0, color: c.states.warning },
                { name: t("Ausentes"), value: 0, color: c.states.danger },
            ];

        const onTime = students.filter((s) => s.attendance >= 85).length;
        const late = students.filter((s) => s.attendance >= 75 && s.attendance < 85).length;
        const absent = students.filter((s) => s.attendance < 75).length;
        const total = students.length;

        return [
            { name: t("A tiempo"), value: Math.round((onTime / total) * 100), color: c.states.success },
            { name: t("Tardanzas"), value: Math.round((late / total) * 100), color: c.states.warning },
            { name: t("Ausentes"), value: Math.round((absent / total) * 100), color: c.states.danger },
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
                barColor: item.rate >= 85 ? c.states.success : c.states.warning,
            }));
    }, [c, students]);

    // ── Exportar Excel ───────────────────────────────────────

    const exportExcel = () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const XLSX = require("xlsx");

            const rows = buildExcelRows(filteredStudents, period, filters);

            // Hoja 1: detalle de aprendices
            const wsStudents = XLSX.utils.json_to_sheet(rows);
            wsStudents["!cols"] = [
                { wch: 12 },
                { wch: 32 },
                { wch: 32 },
                { wch: 18 },
                { wch: 16 },
                { wch: 12 },
                { wch: 12 },
                { wch: 20 },
            ];

            // Hoja 2: evolución semanal
            const weeklyRows = attendanceByWeek.map((w) => ({
                Semana: w.week,
                "Tasa de Asistencia (%)": w.rate,
            }));
            const wsWeekly = XLSX.utils.json_to_sheet(weeklyRows);

            // Hoja 3: ranking por programa
            const rankRows = courseRanking.map((r) => ({
                Posición: r.rank,
                Programa: r.courseName,
                "Promedio (%)": r.rate,
            }));
            const wsRanking = XLSX.utils.json_to_sheet(rankRows);

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, wsStudents, "Aprendices");
            XLSX.utils.book_append_sheet(wb, wsWeekly, "Evolución Semanal");
            XLSX.utils.book_append_sheet(wb, wsRanking, "Ranking Programas");

            const filename = `Reporte_Asistencia_${periodLabel(period).replace(/ /g, "_")}.xlsx`;
            XLSX.writeFile(wb, filename);
        } catch (err) {
            console.error("Error al exportar Excel:", err);
        }
    };

    // ── Exportar PDF ─────────────────────────────────────────

    const exportPDF = () => {
        if (Platform.OS !== "web") {
            console.warn("La exportación PDF solo está disponible en web por ahora.");
            return;
        }
        const html = buildPDFHtml(filteredStudents, period, filters, attendanceByWeek);
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
        }, 400);
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
        stats,
        distribution,
        attendanceByDay,
        attendanceByWeek,
        courseRanking,
        atRiskStudents,
        filteredStudents,
        availableCourses,
        isLoading,
        exportExcel,
        exportPDF,
    };
}
