// ============================================================
//  FaceAttend EDU — Reports ViewModel
//  Incluye lógica de filtros y exportación PDF / Excel.
// ============================================================

import { useState, useMemo } from "react";
import { Platform }          from "react-native";
import { useTheme }          from "../view/components/hooks/useTheme";
import { useTranslation }    from "../i18n/hooks/useTranslation";
import {
    mockStudents, mockCourses,
    mockAttendanceByDay, mockAttendanceByWeek, mockCourseAttendance,
} from "../models/data/mockData";
import type { Period, DailyAttendance, WeeklyAttendance } from "../models/types";

// ── xlsx (solo se importa en runtime para evitar problemas SSR) ──
// Se usa dynamic require para mantener compatibilidad con Expo web.

// ── Tipos públicos ────────────────────────────────────────────

export interface PeriodOption {
    value: Period;
    label: string;
}

export const PERIOD_OPTIONS: PeriodOption[] = [
    { value: "week",     label: "Esta semana" },
    { value: "month",    label: "Este mes"    },
    { value: "semester", label: "Semestre"    },
];

export interface ReportStat {
    label:        string;
    value:        string | number;
    change?:      number;
    changeLabel?: string;
    color:        string;
    icon:         string;
}

export interface DistributionItem {
    name:  string;
    value: number;
    color: string;
}

export interface CourseRankingItem {
    code:       string;
    courseName: string;
    rate:       number;
    barColor:   string;
    rank:       number;
}

// ── Filtros ───────────────────────────────────────────────────

export interface ReportFilters {
    courseCode:       string;   // "" = todos
    attendanceMin:    number;   // 0–100
    attendanceMax:    number;   // 0–100
    statusFilter:     "all" | "active" | "inactive";
    showAtRiskOnly:   boolean;
}

export const DEFAULT_FILTERS: ReportFilters = {
    courseCode:     "",
    attendanceMin:  0,
    attendanceMax:  100,
    statusFilter:   "all",
    showAtRiskOnly: false,
};

export interface ReportsViewModel {
    period:           Period;
    setPeriod:        (p: Period) => void;

    filters:          ReportFilters;
    setFilters:       (f: ReportFilters) => void;
    filtersActive:    boolean;
    resetFilters:     () => void;

    showFilters:      boolean;
    openFilters:      () => void;
    closeFilters:     () => void;

    stats:            ReportStat[];
    distribution:     DistributionItem[];
    attendanceByDay:  DailyAttendance[];
    attendanceByWeek: WeeklyAttendance[];
    courseRanking:    CourseRankingItem[];
    atRiskStudents:   typeof mockStudents;
    filteredStudents: typeof mockStudents;

    exportExcel:      () => void;
    exportPDF:        () => void;
}

// ── Helpers de label ─────────────────────────────────────────

function periodLabel(p: Period): string {
    if (p === "week")     return "Esta semana";
    if (p === "month")    return "Este mes";
    return "Semestre 2024-2";
}

// ── Generación de datos por período ──────────────────────────

function weekDataForPeriod(period: Period): WeeklyAttendance[] {
    if (period === "week")  return mockAttendanceByWeek.slice(0, 1);
    if (period === "month") return mockAttendanceByWeek.slice(0, 4);
    return mockAttendanceByWeek;
}

function dailyDataForPeriod(period: Period): DailyAttendance[] {
    // Todos los períodos usan la misma semana base (mock)
    return mockAttendanceByDay;
}

// ── Export helpers ────────────────────────────────────────────

function buildExcelRows(
    students: typeof mockStudents,
    period: Period,
    filters: ReportFilters
): Record<string, string | number>[] {
    const header = [
        { "Código": "Código", "Nombre": "Nombre", "Curso": "Curso", "Semestre": "Semestre",
          "Asistencia (%)": "Asistencia (%)", "Estado": "Estado", "Período": "Período" }
    ];
    const rows = students.map(s => ({
        "Código":           s.code,
        "Nombre":           s.name,
        "Curso":            s.course,
        "Semestre":         s.grade,
        "Asistencia (%)":   s.attendance,
        "Estado":           s.status === "active" ? "Activo" : "Inactivo",
        "Período":          periodLabel(period),
    }));
    return rows;
}

function buildPDFHtml(
    students: typeof mockStudents,
    period: Period,
    filters: ReportFilters,
    weeklyData: WeeklyAttendance[]
): string {
    const periodText = periodLabel(period);
    const filterNotes: string[] = [];
    if (filters.courseCode)   filterNotes.push(`Curso: ${filters.courseCode}`);
    if (filters.showAtRiskOnly) filterNotes.push("Solo en riesgo");
    if (filters.statusFilter !== "all") filterNotes.push(`Estado: ${filters.statusFilter}`);
    if (filters.attendanceMin > 0 || filters.attendanceMax < 100)
        filterNotes.push(`Asistencia: ${filters.attendanceMin}%–${filters.attendanceMax}%`);

    const tableRows = students.map(s => `
        <tr>
            <td>${s.code}</td>
            <td>${s.name}</td>
            <td>${s.course}</td>
            <td>${s.grade}</td>
            <td style="text-align:center; font-weight:bold; color:${s.attendance < 75 ? "#EF4444" : "#10B981"}">${s.attendance}%</td>
            <td>${s.status === "active" ? "Activo" : "Inactivo"}</td>
        </tr>
    `).join("");

    const weeklyRows = weeklyData.map(w => `
        <tr><td>${w.week}</td><td style="text-align:center">${w.rate}%</td></tr>
    `).join("");

    return `<!DOCTYPE html>
<html lang="es">
<head>
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
  <div class="subtitle">Período: <strong>${periodText}</strong> &nbsp;|&nbsp; Generado: ${new Date().toLocaleDateString("es-CO", { dateStyle: "full" })}</div>

  ${filterNotes.length ? `<div style="margin-bottom:16px">${filterNotes.map(n => `<span class="filter-tag">${n}</span>`).join("")}</div>` : ""}

  <div class="section-title">Detalle de Estudiantes</div>
  <table>
    <thead><tr><th>Código</th><th>Nombre</th><th>Curso</th><th>Semestre</th><th>Asistencia</th><th>Estado</th></tr></thead>
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

export function useReportsViewModel(): ReportsViewModel {
    const [period,      setPeriod]      = useState<Period>("semester");
    const [filters,     setFilters]     = useState<ReportFilters>(DEFAULT_FILTERS);
    const [showFilters, setShowFilters] = useState(false);

    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c = theme.colors;

    // ── Datos derivados del período ──────────────────────────

    const attendanceByWeek = useMemo(() => weekDataForPeriod(period), [period]);
    const attendanceByDay  = useMemo(() => dailyDataForPeriod(period), [period]);

    // ── Filtros activos ──────────────────────────────────────

    const filtersActive = useMemo(() =>
        filters.courseCode !== DEFAULT_FILTERS.courseCode ||
        filters.attendanceMin !== DEFAULT_FILTERS.attendanceMin ||
        filters.attendanceMax !== DEFAULT_FILTERS.attendanceMax ||
        filters.statusFilter  !== DEFAULT_FILTERS.statusFilter  ||
        filters.showAtRiskOnly !== DEFAULT_FILTERS.showAtRiskOnly,
        [filters]
    );

    const resetFilters = () => setFilters({ ...DEFAULT_FILTERS });

    // ── Estudiantes filtrados ────────────────────────────────

    const filteredStudents = useMemo(() => {
        return mockStudents.filter(s => {
            if (filters.courseCode && s.course !== filters.courseCode) return false;
            if (s.attendance < filters.attendanceMin)  return false;
            if (s.attendance > filters.attendanceMax)  return false;
            if (filters.statusFilter !== "all" && s.status !== filters.statusFilter) return false;
            if (filters.showAtRiskOnly && s.attendance >= 75) return false;
            return true;
        });
    }, [filters]);

    const atRiskStudents = useMemo(
        () => filteredStudents.filter(s => s.attendance < 75),
        [filteredStudents]
    );

    // ── Stats (reaccionan al período) ────────────────────────

    const stats: ReportStat[] = useMemo(() => {
        const baseRate = period === "week" ? "88.1%" : period === "month" ? "86.3%" : "85.4%";
        const records  = period === "week" ? "712"   : period === "month" ? "1,203" : "2,847";
        const delays   = period === "week" ? "48"    : period === "month" ? "132"   : "324";
        return [
            { label: t("Asistencia global"), value: baseRate, change: 1.2,  changeLabel: t("vs período ant."), color: c.brand.primary,  icon: "trending-up"  },
            { label: t("Total registros"),   value: records,  change: 5.8,  changeLabel: t("vs período ant."), color: c.states.success, icon: "users"         },
            { label: t("Tardanzas"),         value: delays,   change: -3.1, changeLabel: t("vs período ant."), color: c.states.warning, icon: "calendar"      },
            { label: t("En riesgo"),         value: atRiskStudents.length,  color: c.states.danger, icon: "alert-circle" },
        ];
    }, [c, t, period, atRiskStudents.length]);

    const distribution: DistributionItem[] = useMemo(() => [
        { name: t("A tiempo"),  value: 72, color: c.states.success },
        { name: t("Tardanzas"), value: 13, color: c.states.warning },
        { name: t("Ausentes"),  value: 15, color: c.states.danger  },
    ], [c, t]);

    const courseRanking: CourseRankingItem[] = useMemo(() =>
        mockCourseAttendance.map((item, rank) => {
            const course   = mockCourses.find(x => x.code === item.course);
            const barColor = item.rate >= 85 ? c.states.success : c.states.warning;
            return {
                code:       item.course,
                courseName: course?.name ?? item.course,
                rate:       item.rate,
                barColor,
                rank:       rank + 1,
            };
        }),
        [c]
    );

    // ── Exportar Excel ───────────────────────────────────────

    const exportExcel = () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const XLSX = require("xlsx");

            const rows = buildExcelRows(filteredStudents, period, filters);

            // Hoja 1: detalle de estudiantes
            const wsStudents = XLSX.utils.json_to_sheet(rows);
            wsStudents["!cols"] = [
                { wch: 10 }, { wch: 30 }, { wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 20 },
            ];

            // Hoja 2: evolución semanal
            const weeklyRows = attendanceByWeek.map(w => ({
                "Semana": w.week,
                "Tasa de Asistencia (%)": w.rate,
            }));
            const wsWeekly = XLSX.utils.json_to_sheet(weeklyRows);

            // Hoja 3: ranking por curso
            const rankRows = courseRanking.map(r => ({
                "Posición": r.rank,
                "Código":   r.code,
                "Curso":    r.courseName,
                "Promedio (%)": r.rate,
            }));
            const wsRanking = XLSX.utils.json_to_sheet(rankRows);

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, wsStudents, "Estudiantes");
            XLSX.utils.book_append_sheet(wb, wsWeekly,   "Evolución Semanal");
            XLSX.utils.book_append_sheet(wb, wsRanking,  "Ranking Cursos");

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
        const win  = window.open("", "_blank");
        if (!win) return;
        win.document.write(html);
        win.document.close();
        win.focus();
        // Pequeño delay para que carguen estilos antes de imprimir
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
        openFilters:  () => setShowFilters(true),
        closeFilters: () => setShowFilters(false),
        stats,
        distribution,
        attendanceByDay,
        attendanceByWeek,
        courseRanking,
        atRiskStudents,
        filteredStudents,
        exportExcel,
        exportPDF,
    };
}
