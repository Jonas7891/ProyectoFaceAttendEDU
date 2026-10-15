import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../view/components/hooks/useTheme";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { useDateFormat } from "../core/utils/hooks/useDateFormat";
import { dashboardSeries, recentActivity } from "../services/api/dashboardSeries";
import {
    getAtRiskStudents,
    getPerfectAttendanceStudents,
    getInstructorAttendance,
} from "../models/data/userDerivedData";

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

    const todayLabel = useMemo(() => {
        const d = formatDate(new Date());
        const today = new Date();
        const weekday = today.toLocaleDateString("es-CO", { weekday: "long" });
        const fullLabel = `${weekday}, ${d}`;
        return fullLabel.charAt(0).toUpperCase() + fullLabel.slice(1);
    }, [formatDate]);

    // ── ADMIN: Métricas globales del sistema (detalladas) ─────

    const adminStats = useMemo(() => {
        if (userRole !== "admin") return [];

        // Calcular datos derivados dinámicamente
        const instructorAttendance = getInstructorAttendance(teachers);
        const atRiskStudents = getAtRiskStudents(students);
        const perfectAttendanceStudents = getPerfectAttendanceStudents(students);

        // Validaciones defensivas
        if (!instructorAttendance || instructorAttendance.length === 0) return [];
        if (!fichas || fichas.length === 0) return [];

        const totalInstructors = instructorAttendance.length;
        const totalFichas = fichas.length;
        const totalStudents = fichas.reduce((sum, f) => sum + (f.totalStudents || 0), 0);
        const activeStudents = fichas.reduce((sum, f) => sum + (f.activeStudents || 0), 0);
        const atRiskCount = atRiskStudents?.length || 0;
        const perfectCount = perfectAttendanceStudents?.length || 0;

        // Calcular asistencia promedio global
        const globalAvgAttendance = fichas.reduce((sum, f) => sum + (f.avgAttendance || 0), 0) / (fichas.length || 1);

        // Asistencia de hoy desde la serie real (último día con sesión).
        const lastDay = series.daily.length > 0 ? series.daily[series.daily.length - 1] : null;
        const todayTotalStudents = lastDay
            ? (lastDay.present || 0) + (lastDay.late || 0) + (lastDay.absent || 0)
            : 0;
        const todayPresent = lastDay ? (lastDay.present || 0) + (lastDay.late || 0) : 0;
        const todayAttendanceRate = todayTotalStudents > 0
            ? ((todayPresent / todayTotalStudents) * 100).toFixed(1)
            : "0";

        // Puntualidad real: tardanzas sobre registros con sesión.
        const lateTotal = series.daily.reduce((sum, d) => sum + (d.late || 0), 0);
        const recordedTotal = series.daily.reduce(
            (sum, d) => sum + (d.present || 0) + (d.late || 0) + (d.absent || 0),
            0
        );
        const punctualityRate = recordedTotal > 0
            ? (((recordedTotal - lateTotal) / recordedTotal) * 100).toFixed(1)
            : "0";

        // Fichas con problemas (asistencia < 75%)
        const problematicFichas = fichas.filter(f => (f.avgAttendance || 0) < 75).length;

        // Tasa de retención (estudiantes activos / total)
        const retentionRate = totalStudents > 0
            ? ((activeStudents / totalStudents) * 100).toFixed(1)
            : "0";

        return [
            {
                label: t("Asistencia hoy"),
                value: `${todayAttendanceRate}%`,
                subtitle: `${Math.round(todayPresent)}/${Math.round(todayTotalStudents)} ${t("estudiantes")}`,
                change: parseFloat(todayAttendanceRate) >= 85 ? 2.3 : -1.5,
                color: parseFloat(todayAttendanceRate) >= 85 ? c.status.success : c.status.warning,
                icon: "calendar",
            },
            {
                label: t("Asistencia global"),
                value: `${globalAvgAttendance.toFixed(1)}%`,
                subtitle: t("Promedio general"),
                change: 1.2,
                color: globalAvgAttendance >= 85 ? c.status.success : c.status.warning,
                icon: "trending-up",
            },
            {
                label: t("Total estudiantes"),
                value: totalStudents,
                subtitle: `${activeStudents} ${t("activos")} (${retentionRate}%)`,
                color: c.brand.primary,
                icon: "users",
            },
            {
                label: t("Fichas activas"),
                value: totalFichas,
                subtitle: problematicFichas > 0 ? `${problematicFichas} ${t("requieren atención")}` : t("Todas OK"),
                color: problematicFichas > 0 ? c.status.warning : c.status.success,
                icon: "book-open",
            },
            {
                label: t("Instructores"),
                value: totalInstructors,
                subtitle: `${totalInstructors} ${t("registrados")}`,
                color: c.brand.primary,
                icon: "briefcase",
            },
            {
                label: t("Estudiantes en riesgo"),
                value: atRiskCount,
                subtitle: t("Requieren intervención"),
                color: c.status.danger,
                icon: "alert-circle",
            },
            {
                label: t("Asistencia perfecta"),
                value: perfectCount,
                subtitle: t("Este mes"),
                color: c.status.success,
                icon: "award",
            },
            {
                label: t("Tasa de puntualidad"),
                value: `${punctualityRate}%`,
                subtitle: t("Registros a tiempo"),
                change: 0.8,
                color: c.brand.primary,
                icon: "clock",
            },
        ];
    }, [c, t, userRole, fichas, students, teachers, series]);

    // ── TEACHER: Métricas de sus cursos/fichas asignadas ──────

    const teacherStats = useMemo(() => {
        if (userRole !== "teacher") return [];

        // Calcular datos derivados dinámicamente
        const atRiskStudents = getAtRiskStudents(students);

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
        const avgAttendance = teacherFichas.reduce((sum, f) => sum + (f.avgAttendance || 0), 0) / (teacherFichas.length || 1);

        // Estudiantes en riesgo de mis fichas
        const myAtRiskStudents = atRiskStudents.filter(s =>
            teacherFichas.some(f => f.code === s.ficha)
        );

        // Asistencia hoy de mis fichas (último día con sesión real).
        const lastDay = series.daily.length > 0 ? series.daily[series.daily.length - 1] : null;
        const lastTotal = lastDay
            ? (lastDay.present || 0) + (lastDay.late || 0) + (lastDay.absent || 0)
            : 0;
        const todayAvg = lastTotal > 0
            ? (((lastDay.present || 0) + (lastDay.late || 0)) / lastTotal) * 100
            : 0;

        // Clases de hoy (sesiones reales de sus bloques).
        const classesToday = series.meta.sessionsToday || 0;
        const completedClasses = series.meta.sessionsClosedToday || 0;

        return [
            {
                label: t("Asistencia hoy"),
                value: `${todayAvg.toFixed(1)}%`,
                subtitle: `${t("En mis fichas")}`,
                color: todayAvg >= 85 ? c.status.success : c.status.warning,
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
                value: `${avgAttendance.toFixed(1)}%`,
                subtitle: t("General"),
                change: 2.1,
                color: avgAttendance >= 85 ? c.status.success : c.status.warning,
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
    }, [c, t, userRole, user, fichas, students, series]);

    // ── STUDENT: Métricas personales del día ──────────────────

    const studentStats = useMemo(() => {
        if (userRole !== "student") return [];

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

        // Estado de hoy desde su serie real (último día con registro).
        const lastDay = series.daily.length > 0 ? series.daily[series.daily.length - 1] : null;
        const todayStatus =
            !lastDay || (lastDay.present === 0 && lastDay.late === 0 && lastDay.absent === 0)
                ? "pending"
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
        }[todayStatus] || t("Pendiente");

        const todayStatusColor = {
            present: c.status.success,
            late: c.status.warning,
            absent: c.status.danger,
            pending: c.text.secondary,
        }[todayStatus] || c.text.secondary;

        // Asistencia del mes actual
        const monthAttendance = studentData?.attendance || 0;

        // Clases de hoy de su ficha (sesiones reales) y sus registros.
        const classesToday = series.meta.sessionsToday || 0;
        const attendedToday = lastDay
            ? (lastDay.present || 0) + (lastDay.late || 0) + (lastDay.absent || 0)
            : 0;
        const pendingToday = Math.max(0, classesToday - attendedToday);

        const currentClass = ownCourses[0] || null;

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
                value: `${monthAttendance}%`,
                subtitle: t("Este mes"),
                change: monthAttendance >= 90 ? 2.4 : -1.2,
                color: monthAttendance >= 90 ? c.status.success : 
                       monthAttendance >= 75 ? c.status.warning : c.status.danger,
                icon: "trending-up",
            },
            {
                label: t("Ambiente actual"),
                value: currentClass?.code || "N/A",
                subtitle: currentClass?.name || t("Sin asignar"),
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
        
        // Calcular datos derivados dinámicamente
        const instructorAttendance = getInstructorAttendance(teachers);
        const atRiskStudents = getAtRiskStudents(students);
        const perfectAttendanceStudents = getPerfectAttendanceStudents(students);
        
        // Validaciones defensivas
        if (!fichas || fichas.length === 0) return null;

        return {
            instructorAttendance: instructorAttendance || [],
            fichas: fichas || [],
            atRiskStudents: atRiskStudents || [],
            perfectAttendanceStudents: perfectAttendanceStudents || [],
            
            // Top 5 fichas
            topFichas: [...fichas]
                .sort((a, b) => (b.avgAttendance || 0) - (a.avgAttendance || 0))
                .slice(0, 5),
            
            // Bottom 3 fichas
            bottomFichas: [...fichas]
                .sort((a, b) => (a.avgAttendance || 0) - (b.avgAttendance || 0))
                .slice(0, 3),
        };
    }, [userRole, fichas, students, teachers]);

    // ── Datos específicos de TEACHER ──────────────────────────

    const teacherData = useMemo(() => {
        if (userRole !== "teacher") return null;

        // Calcular datos derivados dinámicamente
        const atRiskStudents = getAtRiskStudents(students);

        // Validaciones defensivas
        if (!fichas || fichas.length === 0) return null;

        // Fichas a cargo del docente (por su cuenta de usuario).
        const teacherFichas = (fichas || []).filter(
            (f) => f.instructorId && user?.id && String(f.instructorId) === String(user.id)
        );

        // Estudiantes en riesgo de las fichas del teacher
        const teacherAtRiskStudents = (atRiskStudents || []).filter(s =>
            teacherFichas.some(f => f.code === s.ficha)
        );

        return {
            myFichas: teacherFichas,
            myAtRiskStudents: teacherAtRiskStudents,
        };
    }, [userRole, user, fichas, students]);

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

