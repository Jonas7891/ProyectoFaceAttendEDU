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

    // ── ADMIN: Métricas globales del sistema (detalladas) ─────

    const adminStats = useMemo(() => {
        if (userRole !== "admin") return [];

        // Validaciones defensivas
        if (!mockInstructorAttendance || mockInstructorAttendance.length === 0) return [];
        if (!mockFichas || mockFichas.length === 0) return [];
        if (!mockAttendanceByDay || mockAttendanceByDay.length === 0) return [];

        const totalInstructors = mockInstructorAttendance.length;
        const totalFichas = mockFichas.length;
        const totalStudents = mockFichas.reduce((sum, f) => sum + (f.totalStudents || 0), 0);
        const activeStudents = mockFichas.reduce((sum, f) => sum + (f.activeStudents || 0), 0);
        const atRiskCount = mockAtRiskStudents?.length || 0;
        const perfectCount = mockPerfectAttendanceStudents?.length || 0;

        // Calcular asistencia promedio global
        const globalAvgAttendance = mockFichas.reduce((sum, f) => sum + (f.avgAttendance || 0), 0) / (mockFichas.length || 1);
        
        // Asistencia del día (suma de presentes + tardanzas en todos los días)
        const todayTotalStudents = mockAttendanceByDay.reduce((sum, day) => 
            sum + (day.present || 0) + (day.late || 0) + (day.absent || 0), 0
        ) / (mockAttendanceByDay.length || 1);
        const todayPresent = mockAttendanceByDay.reduce((sum, day) => 
            sum + (day.present || 0) + (day.late || 0), 0
        ) / (mockAttendanceByDay.length || 1);
        const todayAttendanceRate = todayTotalStudents > 0 
            ? ((todayPresent / todayTotalStudents) * 100).toFixed(1) 
            : "0";
        
        // Instructores presentes hoy (mock: 85% de instructores)
        const instructorsToday = Math.round(totalInstructors * 0.85);
        
        // Fichas con problemas (asistencia < 75%)
        const problematicFichas = mockFichas.filter(f => (f.avgAttendance || 0) < 75).length;
        
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
                subtitle: `${instructorsToday} ${t("presentes hoy")}`,
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
                color: "#10B981",
                icon: "award",
            },
            {
                label: t("Tasa de puntualidad"),
                value: "91.5%",
                subtitle: t("Estudiantes a tiempo"),
                change: 0.8,
                color: "#8B5CF6",
                icon: "clock",
            },
        ];
    }, [c, t, userRole]);

    // ── TEACHER: Métricas de sus cursos/fichas asignadas ──────

    const teacherStats = useMemo(() => {
        if (userRole !== "teacher") return [];

        // Validaciones defensivas
        if (!mockFichas || mockFichas.length === 0) return [];
        if (!mockAtRiskStudents) return [];

        // Mock: Filtrar solo las fichas asignadas al instructor
        // TODO: En producción, filtrar por user.assignedFichas o similar
        const teacherFichas = mockFichas.slice(0, 2);
        const totalStudents = teacherFichas.reduce((sum, f) => sum + (f.totalStudents || 0), 0);
        const activeStudents = teacherFichas.reduce((sum, f) => sum + (f.activeStudents || 0), 0);
        const avgAttendance = teacherFichas.reduce((sum, f) => sum + (f.avgAttendance || 0), 0) / (teacherFichas.length || 1);
        
        // Estudiantes en riesgo de mis fichas
        const myAtRiskStudents = mockAtRiskStudents.filter(s =>
            teacherFichas.some(f => f.code === s.ficha)
        );
        
        // Asistencia hoy de mis fichas (promedio de las últimas entradas)
        const todayAttendanceData = teacherFichas.map(f => f.avgAttendance || 0);
        const todayAvg = todayAttendanceData.reduce((a, b) => a + b, 0) / (todayAttendanceData.length || 1);
        
        // Próximas clases hoy (mock)
        const classesToday = 3;
        const completedClasses = 1;

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
    }, [c, t, userRole]);

    // ── STUDENT: Métricas personales del día ──────────────────

    const studentStats = useMemo(() => {
        if (userRole !== "student") return [];

        // Validaciones defensivas
        if (!mockStudents || mockStudents.length === 0) return [];
        if (!mockCourses || mockCourses.length === 0) return [];
        if (!mockInstructorAttendance || mockInstructorAttendance.length === 0) return [];

        // Mock: datos del estudiante actual
        const studentData = mockStudents[0];
        
        // Mock: Datos del día actual
        const todayDate = new Date().toLocaleDateString("es-CO", { 
            weekday: "long", 
            day: "numeric", 
            month: "long" 
        });
        
        // Mock: Información de la clase/ambiente actual
        const currentClass = mockCourses[0]; // Primera clase del día
        const currentInstructor = mockInstructorAttendance[0]; // Primer instructor
        
        // Estado de asistencia hoy
        const todayStatus = "present"; // mock: puede ser "present", "late", "absent", "pending"
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
        
        // Clases del día (mock)
        const classesToday = 4;
        const attendedToday = 2;
        const pendingToday = classesToday - attendedToday;

        return [
            {
                label: t("Estado hoy"),
                value: todayStatusLabel,
                subtitle: todayDate,
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
                value: currentInstructor?.name?.split(" ")[0] || t("Sin asignar"), // Primer nombre
                subtitle: currentInstructor?.name || t("Sin instructor"),
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
                value: mockCourses?.length || 0,
                subtitle: t("Inscritos"),
                color: c.status.success,
                icon: "book-open",
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

    // ── Asistencia por día (filtrado por rol) ─────────────────

    const attendanceByDay = useMemo(() => {
        // Validación defensiva
        if (!mockAttendanceByDay || mockAttendanceByDay.length === 0) {
            return [];
        }

        // Admin: datos globales
        if (userRole === "admin") {
            return mockAttendanceByDay;
        }

        // Teacher: solo datos de sus fichas
        if (userRole === "teacher") {
            // Mock: simular datos filtrados de sus fichas
            // En producción, filtrar por las fichas asignadas al teacher
            return mockAttendanceByDay.map(day => ({
                ...day,
                // Reducir valores para simular datos específicos del teacher
                present: Math.round((day.present || 0) * 0.4),
                late: Math.round((day.late || 0) * 0.4),
                absent: Math.round((day.absent || 0) * 0.4),
            }));
        }

        // Student: solo sus datos personales
        if (userRole === "student") {
            // Mock: convertir a formato personal (presente/ausente por día)
            return mockAttendanceByDay.map(day => ({
                day: day.day,
                present: Math.random() > 0.2 ? 1 : 0, // 80% presente
                late: Math.random() > 0.9 ? 1 : 0,    // 10% tarde
                absent: Math.random() > 0.9 ? 1 : 0,  // 10% ausente
            }));
        }

        return mockAttendanceByDay;
    }, [userRole]);

    // ── Asistencia por semana (filtrado por rol) ──────────────

    const attendanceByWeek = useMemo(() => {
        // Validación defensiva
        if (!mockAttendanceByWeek || mockAttendanceByWeek.length === 0) {
            return [];
        }

        // Admin: datos globales
        if (userRole === "admin") {
            return mockAttendanceByWeek;
        }

        // Teacher: solo datos de sus fichas
        if (userRole === "teacher") {
            // Mock: simular datos de sus fichas (ajustar valores)
            return mockAttendanceByWeek.map(week => ({
                ...week,
                rate: Math.max(70, Math.min(95, (week.rate || 0) + (Math.random() * 10 - 5))),
            }));
        }

        // Student: sus datos personales
        if (userRole === "student") {
            // Mock: datos personales del estudiante
            const baseAttendance = mockStudents?.[0]?.attendance || 85;
            return mockAttendanceByWeek.map((week, index) => ({
                week: week.week,
                rate: Math.max(60, Math.min(100, baseAttendance + (Math.random() * 20 - 10))),
            }));
        }

        return mockAttendanceByWeek;
    }, [userRole]);

    // ── Asistencia por curso/ficha (filtrado por rol) ─────────

    const courseAttendance = useMemo(() => {
        // Validación defensiva
        if (!mockCourseAttendance || mockCourseAttendance.length === 0) {
            return [];
        }

        let courses = mockCourseAttendance;

        // Admin: todos los cursos/fichas
        if (userRole === "admin") {
            courses = mockCourseAttendance;
        }

        // Teacher: solo sus fichas asignadas
        if (userRole === "teacher") {
            // Mock: filtrar solo las fichas del teacher
            // En producción, usar user.assignedFichas
            if (!mockFichas || mockFichas.length === 0) return [];
            const teacherFichas = mockFichas.slice(0, 2);
            courses = mockCourseAttendance
                .filter(item => teacherFichas.some(f => f.code === item.course))
                .slice(0, 3);
        }

        // Student: solo sus cursos inscritos
        if (userRole === "student") {
            courses = mockCourseAttendance.slice(0, 4);
        }

        return courses.map((item) => {
            const course = mockCourses?.find((x) => x.code === item.course);
            const barColor =
                (item.rate || 0) >= 85
                    ? c.status.success
                    : (item.rate || 0) >= 75
                    ? c.status.warning
                    : c.status.danger;
            return { 
                ...item, 
                courseName: course?.name ?? item.course, 
                barColor 
            };
        });
    }, [c, userRole]);

    // ── Datos específicos de ADMIN ────────────────────────────

    const adminData = useMemo(() => {
        if (userRole !== "admin") return null;
        
        // Validaciones defensivas
        if (!mockFichas || mockFichas.length === 0) return null;

        return {
            instructorAttendance: mockInstructorAttendance || [],
            fichas: mockFichas || [],
            atRiskStudents: mockAtRiskStudents || [],
            perfectAttendanceStudents: mockPerfectAttendanceStudents || [],
            
            // Top 5 fichas
            topFichas: [...mockFichas]
                .sort((a, b) => (b.avgAttendance || 0) - (a.avgAttendance || 0))
                .slice(0, 5),
            
            // Bottom 3 fichas
            bottomFichas: [...mockFichas]
                .sort((a, b) => (a.avgAttendance || 0) - (b.avgAttendance || 0))
                .slice(0, 3),
        };
    }, [userRole]);

    // ── Datos específicos de TEACHER ──────────────────────────

    const teacherData = useMemo(() => {
        if (userRole !== "teacher") return null;
        
        // Validaciones defensivas
        if (!mockFichas || mockFichas.length === 0) return null;

        // Mock: fichas del teacher
        const teacherFichas = mockFichas.slice(0, 2);
        
        // Estudiantes en riesgo de las fichas del teacher
        const teacherAtRiskStudents = (mockAtRiskStudents || []).filter(s =>
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
        
        // Validaciones defensivas
        if (!mockStudents || mockStudents.length === 0) return null;
        if (!mockCourses || mockCourses.length === 0) return null;

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
        attendanceByDay,      // Datos filtrados por rol
        attendanceByWeek,     // Datos filtrados por rol
        courseAttendance,     // Datos filtrados por rol
        recentActivity: mockRecentActivity,

        // Datos por rol
        adminData,
        teacherData,
        studentData,
    };
}

