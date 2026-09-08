import { useMemo } from "react";
import { useTheme } from "../view/components/hooks/useTheme";
import { useTranslation } from "../i18n/hooks/useTranslation";
import { useAuth } from "../context/AuthContext";
import {
    mockStudents,
    mockCourses,
    mockAttendanceByDay,
    mockAttendanceByWeek,
    mockCourseAttendance,
    mockRecentActivity,
    mockInstructorAttendance,
    mockFichas,
    mockAtRiskStudents,
    mockPerfectAttendanceStudents,
} from "../models/data/mockData";

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
    const c = theme.colors;

    const userRole = user?.role || "student";

    const todayLabel = useMemo(() => {
        const d = new Date().toLocaleDateString("es-CO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        return d.charAt(0).toUpperCase() + d.slice(1);
    }, []);

    // ── ADMIN: Métricas globales del sistema ──────────────────

    const adminStats = useMemo(() => {
        if (userRole !== "admin") return [];

        const totalInstructors = mockInstructorAttendance.length;
        const totalFichas = mockFichas.length;
        const totalStudents = mockFichas.reduce((sum, f) => sum + f.totalStudents, 0);
        const activeStudents = mockFichas.reduce((sum, f) => sum + f.activeStudents, 0);
        const atRiskCount = mockAtRiskStudents.length;
        const perfectCount = mockPerfectAttendanceStudents.length;

        // Calcular asistencia promedio global
        const globalAvgAttendance = mockFichas.reduce((sum, f) => sum + f.avgAttendance, 0) / mockFichas.length;

        return [
            {
                label: t("Total estudiantes"),
                value: totalStudents,
                subtitle: `${activeStudents} ${t("activos")}`,
                color: c.brand.primary,
                icon: "users",
            },
            {
                label: t("Fichas activas"),
                value: totalFichas,
                color: c.status.success,
                icon: "book-open",
            },
            {
                label: t("Asistencia global"),
                value: `${globalAvgAttendance.toFixed(1)}%`,
                change: 1.2,
                changeLabel: t("vs sem. ant."),
                color: "#8B5CF6",
                icon: "trending-up",
            },
            {
                label: t("Instructores"),
                value: totalInstructors,
                subtitle: t("activos"),
                color: c.brand.primary,
                icon: "briefcase",
            },
            {
                label: t("En riesgo"),
                value: atRiskCount,
                color: c.status.danger,
                icon: "alert-circle",
            },
            {
                label: t("Destacados"),
                value: perfectCount,
                color: "#FFD700",
                icon: "award",
            },
        ];
    }, [c, t, userRole]);

    // ── TEACHER: Métricas de sus cursos ───────────────────────

    const teacherStats = useMemo(() => {
        if (userRole !== "teacher") return [];

        // Filtrar fichas del instructor actual (mock: tomar 2 fichas)
        const teacherFichas = mockFichas.slice(0, 2);
        const totalStudents = teacherFichas.reduce((sum, f) => sum + f.totalStudents, 0);
        const avgAttendance = teacherFichas.reduce((sum, f) => sum + f.avgAttendance, 0) / teacherFichas.length;

        return [
            {
                label: t("Mis fichas"),
                value: teacherFichas.length,
                color: c.brand.primary,
                icon: "book-open",
            },
            {
                label: t("Mis estudiantes"),
                value: totalStudents,
                color: c.status.success,
                icon: "users",
            },
            {
                label: t("Asistencia prom."),
                value: `${avgAttendance.toFixed(1)}%`,
                change: 2.1,
                changeLabel: t("vs sem. ant."),
                color: "#8B5CF6",
                icon: "trending-up",
            },
            {
                label: t("Clases hoy"),
                value: "3",
                color: c.brand.primary,
                icon: "calendar",
            },
        ];
    }, [c, t, userRole]);

    // ── STUDENT: Métricas personales ──────────────────────────

    const studentStats = useMemo(() => {
        if (userRole !== "student") return [];

        // Mock: tomar datos del primer estudiante
        const studentData = mockStudents[0];

        return [
            {
                label: t("Mi asistencia"),
                value: `${studentData.attendance}%`,
                change: studentData.attendance >= 90 ? 2.4 : -1.2,
                changeLabel: t("este mes"),
                color: studentData.attendance >= 90 ? c.status.success : c.status.warning,
                icon: "trending-up",
            },
            {
                label: t("Mis cursos"),
                value: mockCourses.length,
                color: c.brand.primary,
                icon: "book-open",
            },
            {
                label: t("Clases asistidas"),
                value: "42/45",
                color: c.status.success,
                icon: "check-circle",
            },
            {
                label: t("Tardanzas"),
                value: "2",
                color: c.status.warning,
                icon: "clock",
            },
        ];
    }, [c, t, userRole, mockStudents]);

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

    // ── Asistencia por curso (adaptado por rol) ───────────────

    const courseAttendance = useMemo(() => {
        let courses = mockCourseAttendance;

        // Teacher: solo sus cursos
        if (userRole === "teacher") {
            courses = mockCourseAttendance.slice(0, 3);
        }

        // Student: solo sus cursos
        if (userRole === "student") {
            courses = mockCourseAttendance.slice(0, 4);
        }

        return courses.map((item) => {
            const course = mockCourses.find((x) => x.code === item.course);
            const barColor =
                item.rate >= 85
                    ? c.status.success
                    : item.rate >= 75
                    ? c.status.warning
                    : c.status.danger;
            return { ...item, courseName: course?.name ?? item.course, barColor };
        });
    }, [c, userRole]);

    // ── Datos específicos de ADMIN ────────────────────────────

    const adminData = useMemo(() => {
        if (userRole !== "admin") return null;

        return {
            instructorAttendance: mockInstructorAttendance,
            fichas: mockFichas,
            atRiskStudents: mockAtRiskStudents,
            perfectAttendanceStudents: mockPerfectAttendanceStudents,
            
            // Top 5 fichas
            topFichas: [...mockFichas]
                .sort((a, b) => b.avgAttendance - a.avgAttendance)
                .slice(0, 5),
            
            // Bottom 3 fichas
            bottomFichas: [...mockFichas]
                .sort((a, b) => a.avgAttendance - b.avgAttendance)
                .slice(0, 3),
        };
    }, [userRole]);

    // ── Datos específicos de TEACHER ──────────────────────────

    const teacherData = useMemo(() => {
        if (userRole !== "teacher") return null;

        // Mock: fichas del teacher
        const teacherFichas = mockFichas.slice(0, 2);
        
        // Estudiantes en riesgo de las fichas del teacher
        const teacherAtRiskStudents = mockAtRiskStudents.filter(s =>
            teacherFichas.some(f => f.code === s.ficha)
        );

        return {
            myFichas: teacherFichas,
            myAtRiskStudents: teacherAtRiskStudents,
        };
    }, [userRole]);

    // ── Datos específicos de STUDENT ──────────────────────────

    const studentData = useMemo(() => {
        if (userRole !== "student") return null;

        const studentInfo = mockStudents[0];

        return {
            personalInfo: studentInfo,
            upcomingClasses: mockCourses.slice(0, 3),
        };
    }, [userRole]);

    return {
        // Datos comunes
        userRole,
        todayLabel,
        stats,
        attendanceByDay: mockAttendanceByDay,
        attendanceByWeek: mockAttendanceByWeek,
        courseAttendance,
        recentActivity: mockRecentActivity,

        // Datos por rol
        adminData,
        teacherData,
        studentData,
    };
}

