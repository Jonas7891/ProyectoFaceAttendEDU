import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../view/components/hooks/useTheme";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { getLocale } from "../core/utils/locale";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { useDateFormat } from "../view/components/hooks/useDateFormat";
import { dashboardSeries, instructorClassCounts, recentActivity } from "../services/api/dashboardSeries";
import {
    getAtRiskStudents,
    getPerfectAttendanceStudents,
    getInstructorAttendance,
    getAttendanceThresholds,
    averageAttendance,
} from "../models/data/userDerivedData";
import { getInstitutionConfig } from "../core/config/institutionConfig";

// Fecha local (YYYY-MM-DD): toISOString() es UTC y en UTC-5 ya es "mañana" desde las 7 pm.
function localIsoDate(date = new Date()) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Variación de la tasa entre las dos últimas semanas con registros reales
 * (puntos porcentuales, un decimal). Con menos de dos semanas reales no hay
 * nada que comparar: undefined, y la tarjeta no muestra tendencia.
 */
export function weeklyChange(weekly) {
    const real = (weekly || []).filter((w) => w && !w.isEmpty && Number.isFinite(w.rate));
    if (real.length < 2) return undefined;
    const delta = real[real.length - 1].rate - real[real.length - 2].rate;
    return Math.round(delta * 10) / 10;
}

/**
 * Alumnos de un curso y sus métricas. Promedio solo con alumnos que tienen registros
 * (null si ninguno); en riesgo solo cuenta a quien tiene un porcentaje real bajo el mínimo.
 */
function courseMetrics(course, students, minAttendance) {
    const courseStudents = (students || []).filter(
        (s) =>
            (Array.isArray(s.courseIds) && s.courseIds.includes(String(course.id))) ||
            s.course === course.code ||
            s.course === course.name ||
            s.course === course.id
    );
    return {
        totalStudents: courseStudents.length,
        activeStudents: courseStudents.filter((s) => s.status === "active").length,
        avgAttendance: averageAttendance(courseStudents),
        atRiskStudents: courseStudents.filter(
            (s) => Number.isFinite(s.attendance) && s.attendance < minAttendance
        ).length,
    };
}

/** Registro del día de hoy en la serie diaria, o null si hoy no hay registros. */
function todayEntry(daily) {
    const today = localIsoDate();
    return (daily || []).find((d) => d.date === today) ?? null;
}

/**
 * Formatear números enteros con separadores de miles
 * @param {number} value - Valor a formatear
 * @returns {string} - Número formateado
 */
function formatNumber(value) {
    if (typeof value !== 'number' || Number.isNaN(Number(value))) return "0";
    return Math.round(value).toLocaleString(getLocale());
}

/**
 * Formatear porcentajes con redondeo matemáticamente correcto
 * Aplica banker's rounding: si el decimal es exactamente 0.5, redondea hacia el número par más cercano
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (máximo 2)
 * @returns {string} - Porcentaje formateado
 */
function formatPercentage(value, decimals = 1) {
    if (typeof value !== 'number' || Number.isNaN(Number(value))) return "0.0";
    
    const maxDecimals = Math.min(Math.max(decimals, 0), 2);
    
    // Manejar casos extremos
    if (value === 0) return "0.0";
    if (value < 0) return "0.0";
    if (value > 100) return "100.0";
    
    // Banker's rounding implementation más robusta
    const multiplier = Math.pow(10, maxDecimals);
    const scaled = value * multiplier;
    const floor = Math.floor(scaled);
    const remainder = scaled - floor;
    
    let rounded;
    if (Math.abs(remainder - 0.5) < Number.EPSILON) {
        // Exactamente 0.5: redondear hacia el número par
        rounded = (floor % 2 === 0) ? floor : floor + 1;
    } else {
        // Redondeo normal
        rounded = Math.round(scaled);
    }
    
    const result = rounded / multiplier;
    return result.toFixed(maxDecimals);
}

/**
 * ViewModel del Dashboard con datos específicos por rol
 * 
 * ADMIN: Vista completa del sistema
 * - Asistencia de instructores
 * - Ranking de fichas (top y bottom)
 * - Estudiantes en riesgo y destacados
 * - Métricas globales del sistema
 * 
 * TEACHER: Vista de sus cursos
 * - Sus cursos asignados
 * - Estudiantes de sus cursos
 * - Asistencia de sus clases
 * 
 * STUDENT: Vista personal
 * - Su asistencia personal
 * - Sus cursos
 * - Su progreso
 */
export function useDashboardViewModel() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { fichas, students, teachers, courses, isLoading } = useAppData();
    const { formatDate } = useDateFormat();
    const c = theme.colors;

    const userRole = user?.role || "student";
    
    // Obtener configuración institucional para dependencias reactivas
    const institutionConfig = getInstitutionConfig();

    // Registro propio del estudiante (para acotar sus series y tarjetas).
    const ownStudent = useMemo(
        () =>
            (students || []).find((s) => s.personId && s.personId === user?.personId) || null,
        [students, user]
    );

    // Series del backend (sesiones + registros reales). Sin datos, las
    // gráficas pintan su estado vacío: nunca se inventan cifras.
    const [series, setSeries] = useState({
        daily: [],
        weekly: [],
        meta: { sessionsToday: 0, sessionsClosedToday: 0 },
    });
    const [activity, setActivity] = useState([]);
    // Clases dictadas/programadas por instructor (solo lo usa el administrador).
    const [classCounts, setClassCounts] = useState(new Map());
    useEffect(() => {
        if (userRole !== "admin") return undefined;
        let cancelled = false;
        instructorClassCounts().then(
            (counts) => {
                if (!cancelled) setClassCounts(counts);
            },
            () => {
                if (!cancelled) setClassCounts(new Map());
            }
        );
        return () => {
            cancelled = true;
        };
    }, [userRole]);

    useEffect(() => {
        let cancelled = false;
        const instructorActorId =
            userRole === "teacher" && user?.academicActorId != null
                ? Number(user.academicActorId)
                : null;
        const ownActorId = Number(ownStudent?.id);
        const academicActorId =
            userRole === "student" && Number.isInteger(ownActorId) ? ownActorId : null;
        dashboardSeries({
            role: userRole,
            instructorActorId,
            academicActorId,
            cohortId: userRole === "student" ? ownStudent?.cohortId ?? null : null,
        }).then(
            (result) => {
                if (!cancelled) setSeries(result);
            },
            () => {
                if (!cancelled) {
                    setSeries({ daily: [], weekly: [], meta: { sessionsToday: 0, sessionsClosedToday: 0 } });
                }
            }
        );
        if (userRole !== "student") {
            recentActivity({ limit: 5 }).then(
                (items) => {
                    if (!cancelled) setActivity(items);
                },
                () => {
                    if (!cancelled) setActivity([]);
                }
            );
        } else {
            setActivity([]);
        }
        return () => {
            cancelled = true;
        };
    }, [userRole, user, ownStudent]);

    // El locale entra como dependencia para recalcular al cambiar de idioma.
    const locale = getLocale();
    const todayLabel = useMemo(() => {
        const d = formatDate(new Date());
        const today = new Date();
        const weekday = today.toLocaleDateString(locale, { weekday: "long" });
        const fullLabel = `${weekday}, ${d}`;
        return fullLabel.charAt(0).toUpperCase() + fullLabel.slice(1);
    }, [formatDate, locale]);

    // ── ADMIN: Métricas globales del sistema (detalladas) ─────

    const adminStats = useMemo(() => {
        if (userRole !== "admin") return [];

        // Calcular datos derivados dinámicamente usando funciones centralizadas
        const minAttendanceThreshold = institutionConfig.minAttendance || 80;
        
        const atRiskStudents = getAtRiskStudents(students, minAttendanceThreshold);
        const perfectAttendanceStudents = getPerfectAttendanceStudents(students, minAttendanceThreshold);
        const instructorAttendance = getInstructorAttendance(teachers, classCounts);

        // Validaciones defensivas - verificar que tenemos datos básicos
        if (!instructorAttendance || instructorAttendance.length === 0) return [];
        if (!fichas || fichas.length === 0) return [];
        if (!students || students.length === 0) return [];

        const totalInstructors = instructorAttendance.length;
        
        // Calcular estudiantes REALES por ficha (no usar totalStudents hardcodeado)
        const studentsPerFicha = {};
        const activeStudentsPerFicha = {};
        
        // Contar estudiantes reales que pertenecen a cada ficha
        if (students && students.length > 0) {
            students.forEach(student => {
                const fichaCode = student.course || student.ficha; // Código de la ficha/curso
                if (fichaCode) {
                    // Contar total de estudiantes
                    studentsPerFicha[fichaCode] = (studentsPerFicha[fichaCode] || 0) + 1;
                    
                    // Contar estudiantes activos
                    if (student.status === "active") {
                        activeStudentsPerFicha[fichaCode] = (activeStudentsPerFicha[fichaCode] || 0) + 1;
                    }
                }
            });
        }
        
        const totalFichas = Object.keys(studentsPerFicha).length; // Solo fichas que tienen estudiantes reales
        
        // Calcular totales reales
        const totalStudents = Object.values(studentsPerFicha).reduce((sum, count) => sum + count, 0);
        const activeStudents = Object.values(activeStudentsPerFicha).reduce((sum, count) => sum + count, 0);
        
        const atRiskCount = atRiskStudents?.length || 0;
        const perfectCount = perfectAttendanceStudents?.length || 0;

        // Calcular asistencia promedio REAL por ficha basándose en estudiantes reales
        const realFichaAttendance = {};
        
        if (fichas && fichas.length > 0 && students && students.length > 0) {
            fichas.forEach(ficha => {
                const fichaCode = ficha.code;
                const fichaStudents = students.filter(s => s.course === fichaCode || s.ficha === fichaCode);
                
                // Solo alumnos con registros: un alumno sin datos no cuenta como 0 %.
                const fichaAverage = averageAttendance(fichaStudents);
                if (fichaAverage !== null) {
                    realFichaAttendance[fichaCode] = fichaAverage;
                }
            });
        }

        // Asistencia global: promedio de las fichas que tienen datos; sin ninguna, null.
        const attendanceValues = Object.values(realFichaAttendance);
        const globalAvgAttendance = attendanceValues.length > 0
            ? attendanceValues.reduce((sum, avg) => sum + avg, 0) / attendanceValues.length
            : null;

        // Asistencia de hoy: solo los registros reales de hoy en la serie de la sede.
        // Sin sesiones/registros hoy no hay cifra (antes se simulaba con el promedio).
        const todayRow = todayEntry(series.daily);
        const todayPresent = todayRow ? (todayRow.present || 0) + (todayRow.late || 0) : 0;
        const todayTotalStudents = todayRow ? todayPresent + (todayRow.absent || 0) : 0;
        const todayAttendanceRate = todayTotalStudents > 0
            ? (todayPresent / todayTotalStudents) * 100
            : null;
        
        // Instructores presentes hoy - calcular basándose en asistencia real
        // Consideramos "presente hoy" a instructores con asistencia >= 85%
        const instructorsToday = instructorAttendance.filter(instructor => 
            (instructor.attendanceRate || 0) >= 85
        ).length;
        
        // Calcular fichas problemáticas y activas basándose en datos reales
        let problematicFichas = 0;
        let activeFichas = 0;
        
        if (fichas && fichas.length > 0) {
            fichas.forEach(ficha => {
                const fichaCode = ficha.code;
                const realAttendance = realFichaAttendance[fichaCode];
                const studentsInFicha = studentsPerFicha[fichaCode] || 0;
                
                if (realAttendance !== undefined && studentsInFicha > 0) {
                    // Ficha activa si tiene estudiantes y asistencia >= 60%
                    if (realAttendance >= 60) {
                        activeFichas++;
                    }
                    
                    // Ficha problemática si asistencia < 75% o pocos estudiantes activos
                    const activeInFicha = activeStudentsPerFicha[fichaCode] || 0;
                    const retentionInFicha = studentsInFicha > 0 ? (activeInFicha / studentsInFicha) : 0;
                    
                    if (realAttendance < 75 || retentionInFicha < 0.8) {
                        problematicFichas++;
                    }
                }
            });
        }
        
        // Tasa de retención (estudiantes activos / total) con formateo correcto
        const retentionRate = totalStudents > 0 
            ? (activeStudents / totalStudents) * 100
            : 0;
        
        // Puntualidad: a tiempo / (a tiempo + tarde) sobre los registros reales de la
        // serie diaria. Sin asistentes registrados no hay tasa (antes se simulaba un 8 % de tardanzas).
        const punctualityTotals = (series.daily || []).reduce(
            (acc, d) => ({ onTime: acc.onTime + (d.present || 0), late: acc.late + (d.late || 0) }),
            { onTime: 0, late: 0 }
        );
        const totalAttending = punctualityTotals.onTime + punctualityTotals.late;
        const punctualityRate = totalAttending > 0
            ? (punctualityTotals.onTime / totalAttending) * 100
            : null;
        const noData = t("Sin datos");
        const pct = (rate) => (rate == null ? noData : `${formatPercentage(rate)}%`);

        // Obtener umbrales dinámicos
        const thresholds = getAttendanceThresholds();

        return [
            {
                label: t("Asistencia hoy"),
                value: pct(todayAttendanceRate),
                subtitle: todayAttendanceRate == null
                    ? t("Sin registros hoy")
                    : `${todayPresent}/${todayTotalStudents} ${t("estudiantes")}`,
                color: todayAttendanceRate == null
                    ? c.text.secondary
                    : todayAttendanceRate >= thresholds.warning ? c.status.success : c.status.warning,
                icon: "calendar",
            },
            {
                label: t("Asistencia global"),
                value: pct(globalAvgAttendance),
                subtitle: t("Promedio general"),
                color: globalAvgAttendance == null
                    ? c.text.secondary
                    : globalAvgAttendance >= thresholds.warning ? c.status.success : c.status.warning,
                icon: "trending-up",
            },
            {
                label: t("Total estudiantes"),
                value: formatNumber(totalStudents),
                subtitle: `${formatNumber(activeStudents)} ${t("activos")} (${formatPercentage(retentionRate)}%)`,
                color: c.brand.primary,
                icon: "users",
            },
            {
                label: t("Cursos activos"),
                value: `${activeFichas}/${totalFichas}`,
                subtitle: problematicFichas > 0 ? `${problematicFichas} ${t("requieren atención")}` : t("Todas OK"),
                color: problematicFichas > 0 ? c.status.warning : c.status.success,
                icon: "book-open",
            },
            {
                label: t("Instructores"),
                value: `${instructorsToday}/${totalInstructors}`,
                subtitle: `${t("presentes hoy")}`,
                color: c.brand.primary,
                icon: "briefcase",
            },
            {
                label: t("Estudiantes en riesgo"),
                value: formatNumber(atRiskCount),
                subtitle: t("Requieren intervención"),
                color: c.status.danger,
                icon: "alert-circle",
            },
            {
                label: t("Asistencia perfecta"),
                value: formatNumber(perfectCount),
                subtitle: t("Este mes"),
                color: c.status.success,
                icon: "award",
            },
            {
                label: t("Tasa de puntualidad"),
                value: pct(punctualityRate),
                subtitle: t("Estudiantes a tiempo"),
                color: punctualityRate == null
                    ? c.text.secondary
                    : punctualityRate >= 90 ? c.status.success : c.status.warning,
                icon: "clock",
            },
        ];
    }, [c, t, userRole, fichas, students, teachers, series, classCounts]);

    // ── TEACHER: Métricas de sus cursos/fichas asignadas ──────

    const teacherStats = useMemo(() => {
        if (userRole !== "teacher") return [];

        // Calcular datos derivados dinámicamente usando funciones centralizadas
        const minAttendanceThreshold = institutionConfig.minAttendance || 80;
        const thresholds = getAttendanceThresholds();

        const atRiskStudents = getAtRiskStudents(students, minAttendanceThreshold);

        // Validaciones defensivas
        if (!fichas || fichas.length === 0) return [];
        if (!atRiskStudents) return [];

        // Fichas a cargo del docente (por su cuenta de usuario).
        const teacherFichas = (fichas || []).filter(
            (f) => f.instructorId && user?.id && String(f.instructorId) === String(user.id)
        );
        if (teacherFichas.length === 0) return [];
        const totalStudents = teacherFichas.reduce((sum, f) => sum + (f.totalStudents || 0), 0);
        const activeStudents = teacherFichas.reduce((sum, f) => sum + (f.activeStudents || 0), 0);
        // Promedio de los alumnos de sus fichas que tienen registros; sin ninguno, null.
        const avgAttendance = averageAttendance(
            (students || []).filter((s) => teacherFichas.some((f) => f.code === s.ficha))
        );

        // Estudiantes en riesgo de mis fichas
        const myAtRiskStudents = atRiskStudents.filter(s =>
            teacherFichas.some(f => f.code === s.ficha)
        );

        // Asistencia de hoy de mis fichas: solo los registros reales de hoy.
        // Sin registros hoy no hay cifra (no se reutiliza el último día con sesión).
        const todayRow = todayEntry(series.daily);
        const lastTotal = todayRow
            ? (todayRow.present || 0) + (todayRow.late || 0) + (todayRow.absent || 0)
            : 0;
        const todayAvg = lastTotal > 0
            ? (((todayRow.present || 0) + (todayRow.late || 0)) / lastTotal) * 100
            : null;

        // Clases de hoy (sesiones reales de sus bloques).
        const classesToday = series.meta.sessionsToday || 0;
        const completedClasses = series.meta.sessionsClosedToday || 0;

        return [
            {
                label: t("Asistencia hoy"),
                value: todayAvg == null ? t("Sin datos") : `${formatPercentage(todayAvg)}%`,
                subtitle: `${t("En mis fichas")}`,
                color: todayAvg == null
                    ? c.text.secondary
                    : todayAvg >= 85 ? c.status.success : c.status.warning,
                icon: "calendar",
            },
            {
                label: t("Mis fichas"),
                value: teacherFichas.length,
                subtitle: t("Fichas asignadas"),
                color: c.brand.primary,
                icon: "book-open",
            },
            {
                label: t("Mis estudiantes"),
                value: totalStudents,
                subtitle: `${activeStudents} ${t("activos")}`,
                color: c.status.success,
                icon: "users",
            },
            {
                label: t("Asistencia promedio"),
                value: avgAttendance == null ? t("Sin datos") : `${formatPercentage(avgAttendance)}%`,
                subtitle: t("General"),
                color: avgAttendance == null
                    ? c.text.secondary
                    : avgAttendance >= thresholds.warning ? c.status.success : c.status.warning,
                icon: "trending-up",
            },
            {
                label: t("Clases hoy"),
                value: `${completedClasses}/${classesToday}`,
                subtitle: `${classesToday - completedClasses} ${t("pendientes")}`,
                color: c.brand.primary,
                icon: "clock",
            },
            {
                label: t("Estudiantes en riesgo"),
                value: myAtRiskStudents.length,
                subtitle: t("Requieren atención"),
                color: myAtRiskStudents.length > 0 ? c.status.danger : c.status.success,
                icon: "alert-circle",
            },
        ];
    }, [c, t, userRole, user, fichas, students, courses, teachers, series, institutionConfig.minAttendance, institutionConfig.daysUntilSanction, institutionConfig.consecutiveDaysForSanction]);

    // ── STUDENT: Métricas personales del día ──────────────────

    const studentStats = useMemo(() => {
        if (userRole !== "student") return [];

        const thresholds = getAttendanceThresholds();

        // Registro propio (no el primero de la lista).
        const studentData = ownStudent;
        if (!studentData) return [];
        if (!courses || courses.length === 0) return [];

        // Cursos propios por matrícula.
        const ownCourseIds = new Set((studentData.courseIds || []).map(String));
        const ownCourses = (courses || []).filter((course) =>
            ownCourseIds.size === 0
                ? course.code === studentData.course || String(course.id) === String(studentData.courseId)
                : ownCourseIds.has(String(course.id))
        );

        // Estado de hoy desde su serie real: solo el registro de HOY (no el último día
        // con registro). Sin registro de hoy: pendiente si hay clase hoy, "sin clases" si no.
        const lastDay = todayEntry(series.daily);
        const sessionsTodayCount = series.meta.sessionsToday || 0;
        const todayStatus =
            !lastDay || (lastDay.present === 0 && lastDay.late === 0 && lastDay.absent === 0)
                ? sessionsTodayCount > 0 ? "pending" : "noclass"
                : lastDay.absent > 0 && lastDay.present === 0 && lastDay.late === 0
                    ? "absent"
                    : lastDay.late > 0
                        ? "late"
                        : "present";
        const todayStatusLabel = {
            present: t("Presente"),
            late: t("Tardanza"),
            absent: t("Ausente"),
            pending: t("Pendiente"),
            noclass: t("Sin clases hoy"),
        }[todayStatus] || t("Pendiente");

        const todayStatusColor = {
            present: c.status.success,
            late: c.status.warning,
            absent: c.status.danger,
            pending: c.text.secondary,
            noclass: c.text.secondary,
        }[todayStatus] || c.text.secondary;

        // Asistencia propia sobre sus sesiones registradas (null si no tiene ninguna).
        const monthAttendance = Number.isFinite(studentData?.attendance) ? studentData.attendance : null;

        // Clases de hoy de su ficha (sesiones reales) y sus registros.
        const classesToday = series.meta.sessionsToday || 0;
        const attendedToday = lastDay
            ? (lastDay.present || 0) + (lastDay.late || 0) + (lastDay.absent || 0)
            : 0;
        const pendingToday = Math.max(0, classesToday - attendedToday);

        // Clase de hoy según el horario de su ficha. "Ambiente actual" es el aula del
        // bloque: sin bloque hoy o sin aula resuelta no se sustituye por el código del
        // curso (eran cosas distintas: QABD... en vez de QAAMB...).
        const todayClass = series.meta.currentClass || null;
        const fallbackCourse = ownCourses[0] || null;
        const environmentCode = todayClass?.environmentCode || null;
        const environmentName = todayClass?.environmentName || null;
        const currentClass = {
            professor: todayClass?.instructorName ?? fallbackCourse?.professor ?? null,
        };

        return [
            {
                label: t("Estado hoy"),
                value: todayStatusLabel,
                subtitle: todayLabel,
                color: todayStatusColor,
                icon: todayStatus === "present" ? "check-circle" : 
                      todayStatus === "late" ? "clock" : 
                      todayStatus === "absent" ? "x-circle" : "circle",
            },
            {
                label: t("Mi asistencia"),
                value: monthAttendance == null ? t("Sin datos") : `${formatPercentage(monthAttendance)}%`,
                subtitle: t("Sesiones registradas"),
                // Tendencia: solo con dos semanas reales que comparar (puntos entre las dos últimas).
                change: monthAttendance == null ? undefined : weeklyChange(series.weekly),
                color: monthAttendance == null
                    ? c.text.secondary
                    : monthAttendance >= (thresholds.warning + thresholds.excellent) / 2 ? c.status.success :
                      monthAttendance >= thresholds.danger ? c.status.warning : c.status.danger,
                icon: "trending-up",
            },
            {
                label: t("Ambiente actual"),
                value: environmentCode || "—",
                subtitle: environmentName || t("Sin asignar"),
                color: c.brand.primary,
                icon: "map-pin",
            },
            {
                label: t("Instructor"),
                value: currentClass?.professor?.split(",")[0]?.trim() || t("Sin asignar"),
                subtitle: currentClass?.professor || t("Sin instructor"),
                color: c.brand.primary,
                icon: "user",
            },
            {
                label: t("Clases hoy"),
                value: `${attendedToday}/${classesToday}`,
                subtitle: pendingToday > 0 ? `${pendingToday} ${t("pendientes")}` : t("Completadas"),
                color: pendingToday === 0 ? c.status.success : c.brand.primary,
                icon: "book",
            },
            {
                label: t("Mis cursos"),
                value: ownCourses.length || 0,
                subtitle: t("Inscritos"),
                color: c.status.success,
                icon: "book-open",
            },
        ];
    }, [c, t, userRole, ownStudent, courses, series]);

    // Seleccionar stats según rol
    const stats = useMemo(() => {
        switch (userRole) {
            case "admin":
                return adminStats;
            case "teacher":
                return teacherStats;
            case "student":
                return studentStats;
            default:
                return studentStats;
        }
    }, [userRole, adminStats, teacherStats, studentStats]);

    // ── Asistencia por día (serie real del backend) ───────────

    const attendanceByDay = useMemo(
        () =>
            (series.daily || []).map(({ day, present, late, absent }) => ({
                day,
                present: present || 0,
                late: late || 0,
                absent: absent || 0,
            })),
        [series]
    );

    // ── Asistencia por semana (serie real del backend) ────────

    const attendanceByWeek = useMemo(() => series.weekly || [], [series]);

    // ── Asistencia por curso/ficha (tasas reales por curso) ────

    const courseAttendance = useMemo(() => {
        // Alcance por rol (igual que Mis cursos): el docente solo ve sus
        // cursos (instructorActorIds), el estudiante los suyos. Sin esto el
        // panel mostraba todos los cursos como "Mis fichas asignadas".
        let scoped = courses || [];
        if (userRole === "teacher") {
            // Mismo criterio que Mis cursos: sin academicActorId no hay fichas
            // propias (no se debe listar el curso ajeno).
            const actorId = user?.academicActorId;
            scoped = (courses || []).filter(
                (course) =>
                    Array.isArray(course.instructorActorIds) &&
                    actorId != null &&
                    course.instructorActorIds.includes(actorId)
            );
        } else if (userRole === "student" && ownStudent) {
            const ownCourseIds = new Set((ownStudent.courseIds || []).map(String));
            scoped = (courses || []).filter((course) =>
                ownCourseIds.size === 0
                    ? course.code === ownStudent.course ||
                      String(course.id) === String(ownStudent.courseId)
                    : ownCourseIds.has(String(course.id))
            );
        }
        const source = scoped
            .filter((course) => course && (course.avgAttendance || 0) > 0)
            .slice(0, 8);
        return source.map((course) => {
            const rate = course.avgAttendance || 0;
            const barColor =
                rate >= 85
                    ? c.status.success
                    : rate >= 75
                    ? c.status.warning
                    : c.status.danger;
            return {
                course: course.code,
                courseName: course.name ?? course.code,
                rate,
                barColor,
            };
        });
    }, [c, courses, userRole, user, ownStudent]);

    // ── Datos específicos de ADMIN ────────────────────────────

    const adminData = useMemo(() => {
        if (userRole !== "admin") return null;
        
        // Obtener configuración dinámica
        const minAttendanceThreshold = institutionConfig.minAttendance || 80;
        
        // Calcular datos derivados dinámicamente
        const instructorAttendance = getInstructorAttendance(teachers, classCounts);
        const atRiskStudents = getAtRiskStudents(students, minAttendanceThreshold);
        const perfectAttendanceStudents = getPerfectAttendanceStudents(students, minAttendanceThreshold);
        
        // Validaciones defensivas
        if (!courses || courses.length === 0) return null;
        
        // ═══════════════════════════════════════════════════════════════════
        // CALCULAR FICHAS REALES DINÁMICAMENTE DESDE CURSOS
        // ═══════════════════════════════════════════════════════════════════
        const realCoursesData = courses.map(course => {
            const { totalStudents, activeStudents, avgAttendance, atRiskStudents: atRiskCount } =
                courseMetrics(course, students, minAttendanceThreshold);

            // Obtener instructor del curso
            const instructor = teachers.find(t => t.id === course.instructor);
            const instructorName = instructor ? instructor.name : "Sin asignar";
            
            return {
                id: course.id,
                code: course.code,
                name: course.name,
                program: course.name, // El nombre del curso es el programa
                color: course.color || "#3B82F6",
                instructor: instructorName,
                totalStudents,
                activeStudents,
                avgAttendance,
                atRiskStudents: atRiskCount,
            };
        });

        return {
            instructorAttendance: instructorAttendance || [],
            fichas: realCoursesData, // AHORA USA CURSOS REALES
            atRiskStudents: atRiskStudents || [],
            perfectAttendanceStudents: perfectAttendanceStudents || [],
            
            // Top 5 fichas (cursos con mejor asistencia)
            // (solo cursos con datos de asistencia reales)
            topFichas: realCoursesData
                .filter((f) => f.avgAttendance != null)
                .sort((a, b) => b.avgAttendance - a.avgAttendance)
                .slice(0, 5),

            // Bottom 3 fichas (cursos con peor asistencia)
            bottomFichas: realCoursesData
                .filter((f) => f.avgAttendance != null)
                .sort((a, b) => a.avgAttendance - b.avgAttendance)
                .slice(0, 3),
        };
    }, [userRole, courses, students, teachers, classCounts, institutionConfig.minAttendance, institutionConfig.daysUntilSanction, institutionConfig.consecutiveDaysForSanction]);

    // ── Datos específicos de TEACHER ──────────────────────────

    const teacherData = useMemo(() => {
        if (userRole !== "teacher") return null;
        
        // Obtener configuración dinámica
        const minAttendanceThreshold = institutionConfig.minAttendance || 80;
        
        // Calcular datos derivados dinámicamente
        const atRiskStudents = getAtRiskStudents(students, minAttendanceThreshold);
        
        // Validaciones defensivas
        if (!courses || courses.length === 0) return null;

        // Cursos del docente: solo aquellos donde es instructor de algún bloque
        // (instructorActorIds), el mismo alcance de «Mis cursos». Antes se tomaban
        // los dos primeros de la sede, incluido un curso ajeno (AUD-46).
        const actorId = user?.academicActorId;
        const ownCourses = actorId == null
            ? []
            : courses.filter(
                  (course) => Array.isArray(course.instructorActorIds) && course.instructorActorIds.includes(actorId)
              );
        const teacherCourses = ownCourses.map(course => {
            const { totalStudents, activeStudents, avgAttendance, atRiskStudents: atRiskCount } =
                courseMetrics(course, students, minAttendanceThreshold);

            // Obtener instructor del curso
            const instructor = teachers.find(t => t.id === course.instructor);
            const instructorName = instructor ? instructor.name : "Sin asignar";
            
            return {
                id: course.id,
                code: course.code,
                name: course.name,
                program: course.name,
                color: course.color || "#3B82F6",
                instructor: instructorName,
                totalStudents,
                activeStudents,
                avgAttendance,
                atRiskStudents: atRiskCount,
            };
        });
        
        // Estudiantes en riesgo de los cursos del teacher
        const teacherAtRiskStudents = (atRiskStudents || []).filter(s =>
            teacherCourses.some(c => c.code === s.course || c.code === s.ficha)
        );

        return {
            myFichas: teacherCourses,
            myAtRiskStudents: teacherAtRiskStudents,
        };
    }, [userRole, user, fichas, students, courses, teachers, institutionConfig.minAttendance, institutionConfig.daysUntilSanction, institutionConfig.consecutiveDaysForSanction]);

    // ── Datos específicos de STUDENT ──────────────────────────

    const studentData = useMemo(() => {
        if (userRole !== "student") return null;

        // Validaciones defensivas
        if (!ownStudent) return null;
        if (!courses || courses.length === 0) return null;

        const ownCourseIds = new Set((ownStudent.courseIds || []).map(String));
        const ownCourses = (courses || []).filter((course) =>
            ownCourseIds.size === 0
                ? course.code === ownStudent.course || String(course.id) === String(ownStudent.courseId)
                : ownCourseIds.has(String(course.id))
        );

        return {
            personalInfo: ownStudent,
            upcomingClasses: ownCourses.slice(0, 3),
        };
    }, [userRole, ownStudent, courses]);

    return {
        // Datos comunes
        userRole,
        isLoading, // AppDataContext todavía cargando el padrón de la sede
        todayLabel,
        stats: stats || [],
        attendanceByDay: attendanceByDay || [],      // Serie real del backend
        attendanceByWeek: attendanceByWeek || [],    // Serie real del backend
        courseAttendance: courseAttendance || [],    // Tasas reales por curso
        recentActivity: activity || [],              // Actividad real del backend

        // Datos por rol
        adminData: adminData || null,
        teacherData: teacherData || null,
        studentData: studentData || null,
    };
}

