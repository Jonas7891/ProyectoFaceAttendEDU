import { useMemo } from "react";
import { useTheme } from "../view/components/hooks/useTheme";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { useDateFormat } from "../view/components/hooks/useDateFormat";
import {
    mockAttendanceByDay,
    mockAttendanceByWeek,
    mockCourseAttendance,
    mockRecentActivity,
} from "../models/data/mockData";
import {
    getAtRiskStudents,
    getPerfectAttendanceStudents,
    getInstructorAttendance,
    getAttendanceThresholds,
} from "../models/data/userDerivedData";
import { getInstitutionConfig } from "../core/config/institutionConfig";

/**
 * Formatear números enteros con separadores de miles
 * @param {number} value - Valor a formatear
 * @returns {string} - Número formateado
 */
function formatNumber(value) {
    if (typeof value !== 'number' || isNaN(value)) return "0";
    return Math.round(value).toLocaleString();
}

/**
 * Formatear porcentajes con redondeo matemáticamente correcto
 * Aplica banker's rounding: si el decimal es exactamente 0.5, redondea hacia el número par más cercano
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (máximo 2)
 * @returns {string} - Porcentaje formateado
 */
function formatPercentage(value, decimals = 1) {
    if (typeof value !== 'number' || isNaN(value)) return "0.0";
    
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
    const { fichas, students, teachers, courses } = useAppData();
    const { formatDate } = useDateFormat();
    const c = theme.colors;

    const userRole = user?.role || "student";
    
    // Obtener configuración institucional para dependencias reactivas
    const institutionConfig = getInstitutionConfig();

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

        // Calcular datos derivados dinámicamente usando funciones centralizadas
        const minAttendanceThreshold = institutionConfig.minAttendance || 80;
        
        const atRiskStudents = getAtRiskStudents(students, minAttendanceThreshold);
        const perfectAttendanceStudents = getPerfectAttendanceStudents(students, minAttendanceThreshold);
        const instructorAttendance = getInstructorAttendance(teachers);

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
                
                if (fichaStudents.length > 0) {
                    // Calcular promedio de asistencia real de los estudiantes de esta ficha
                    const totalAttendance = fichaStudents.reduce((sum, student) => sum + (student.attendance || 0), 0);
                    const avgAttendance = totalAttendance / fichaStudents.length;
                    realFichaAttendance[fichaCode] = avgAttendance;
                }
            });
        }
        
        // Calcular asistencia global con promedios reales
        const attendanceValues = Object.values(realFichaAttendance);
        const globalAvgAttendance = attendanceValues.length > 0 
            ? attendanceValues.reduce((sum, avg) => sum + avg, 0) / attendanceValues.length
            : 0;
        
        // Calcular asistencia del día basándose en estudiantes reales
        let todayAttendanceStats = { present: 0, late: 0, absent: 0 };
        
        if (students && students.length > 0) {
            // Por ahora usamos los datos mock para simular, pero en producción esto vendría de registros reales
            // Se puede calcular basándose en los estudiantes activos y sus patrones de asistencia
            const activeStudentsCount = students.filter(s => s.status === "active").length;
            
            if (activeStudentsCount > 0) {
                // Simular distribución realista basándose en el patrón de asistencia de los estudiantes
                const avgAttendanceRate = students.reduce((sum, s) => sum + (s.attendance || 0), 0) / students.length;
                
                // Calcular distribución proporcional
                const presentRate = avgAttendanceRate / 100;  // % que normalmente asiste
                const lateRate = Math.min(0.08, (100 - avgAttendanceRate) / 300); // ~8% máximo tardanzas
                const absentRate = 1 - presentRate - lateRate;
                
                todayAttendanceStats = {
                    present: Math.round(activeStudentsCount * presentRate),
                    late: Math.round(activeStudentsCount * lateRate),
                    absent: Math.round(activeStudentsCount * absentRate)
                };
            }
        }
        
        const todayTotalStudents = todayAttendanceStats.present + todayAttendanceStats.late + todayAttendanceStats.absent;
        const todayPresent = todayAttendanceStats.present + todayAttendanceStats.late;
        const todayAttendanceRate = todayTotalStudents > 0 
            ? (todayPresent / todayTotalStudents) * 100
            : 0;
        
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
        
        // Calcular tasa de puntualidad basándose en estudiantes reales
        // En producción esto vendría de registros de asistencia reales de la semana
        let weeklyPunctualityStats = { totalPresent: 0, totalLate: 0 };
        
        if (students && students.length > 0) {
            const activeStudentsCount = students.filter(s => s.status === "active").length;
            
            if (activeStudentsCount > 0) {
                // Simular datos de puntualidad semanal basándose en patrones de estudiantes
                const daysInWeek = 5;
                const avgAttendanceRate = students.reduce((sum, s) => sum + (s.attendance || 0), 0) / students.length;
                
                // Estudiantes que asisten por día (promedio semanal)
                const avgDailyAttending = Math.round(activeStudentsCount * (avgAttendanceRate / 100));
                
                // De los que asisten, calcular cuántos llegan tarde (basado en puntualidad individual)
                const avgLateRate = 0.08; // ~8% de tardanzas promedio
                const avgDailyLate = Math.round(avgDailyAttending * avgLateRate);
                const avgDailyOnTime = avgDailyAttending - avgDailyLate;
                
                weeklyPunctualityStats = {
                    totalPresent: avgDailyOnTime * daysInWeek,
                    totalLate: avgDailyLate * daysInWeek
                };
            }
        }
        
        const totalAttending = weeklyPunctualityStats.totalPresent + weeklyPunctualityStats.totalLate;
        const punctualityRate = totalAttending > 0 
            ? (weeklyPunctualityStats.totalPresent / totalAttending) * 100
            : 0;

        // Obtener umbrales dinámicos
        const thresholds = getAttendanceThresholds();

        return [
            {
                label: t("Asistencia hoy"),
                value: `${formatPercentage(todayAttendanceRate)}%`,
                subtitle: `${todayPresent}/${todayTotalStudents} ${t("estudiantes")}`,
                change: todayAttendanceRate >= thresholds.excellent ? 2.3 : 
                        todayAttendanceRate >= thresholds.warning ? 1.5 : 
                        todayAttendanceRate >= thresholds.danger ? 0 : -1.5,
                color: todayAttendanceRate >= thresholds.warning ? c.status.success : c.status.warning,
                icon: "calendar",
            },
            {
                label: t("Asistencia global"),
                value: `${formatPercentage(globalAvgAttendance)}%`,
                subtitle: t("Promedio general"),
                change: globalAvgAttendance >= thresholds.warning ? 
                    parseFloat(Math.min(2.5, (globalAvgAttendance - thresholds.warning + 2) * 0.5).toFixed(1)) : 
                    parseFloat(Math.max(-2.5, (globalAvgAttendance - thresholds.warning) * 0.3).toFixed(1)),
                color: globalAvgAttendance >= thresholds.warning ? c.status.success : c.status.warning,
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
                label: t("Fichas activas"),
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
                value: `${formatPercentage(punctualityRate)}%`,
                subtitle: t("Estudiantes a tiempo"),
                change: punctualityRate >= 95 ? 1.2 :
                        punctualityRate >= 90 ? 0.8 : 
                        punctualityRate >= 85 ? 0.3 : -0.5,
                color: punctualityRate >= 90 ? c.status.success : c.status.warning,
                icon: "clock",
            },
        ];
    }, [c, t, userRole, fichas, students, teachers]);

    // ── TEACHER: Métricas de sus cursos/fichas asignadas ──────

    const teacherStats = useMemo(() => {
        if (userRole !== "teacher") return [];

        // Calcular datos derivados dinámicamente usando funciones centralizadas
        const minAttendanceThreshold = institutionConfig.minAttendance || 80;
        
        const atRiskStudents = getAtRiskStudents(students, minAttendanceThreshold);

        // Validaciones defensivas
        if (!fichas || fichas.length === 0) return [];
        if (!atRiskStudents) return [];

        // Mock: Filtrar solo las fichas asignadas al instructor
        // TODO: En producción, filtrar por user.assignedFichas o similar
        const teacherFichas = fichas.slice(0, 2);
        const totalStudents = teacherFichas.reduce((sum, f) => sum + (f.totalStudents || 0), 0);
        const activeStudents = teacherFichas.reduce((sum, f) => sum + (f.activeStudents || 0), 0);
        const avgAttendance = teacherFichas.reduce((sum, f) => sum + (f.avgAttendance || 0), 0) / (teacherFichas.length || 1);
        
        // Estudiantes en riesgo de mis fichas
        const myAtRiskStudents = atRiskStudents.filter(s =>
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
                value: `${formatPercentage(todayAvg)}%`,
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
                value: `${formatPercentage(avgAttendance)}%`,
                subtitle: t("General"),
                change: avgAttendance >= thresholds.excellent ? 2.5 : 
                        avgAttendance >= thresholds.warning ? 1.5 : 
                        avgAttendance >= thresholds.danger ? 0.5 : -1.0,
                color: avgAttendance >= thresholds.warning ? c.status.success : c.status.warning,
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
    }, [c, t, userRole, fichas, students, institutionConfig.minAttendance, institutionConfig.daysUntilSanction, institutionConfig.consecutiveDaysForSanction]);

    // ── STUDENT: Métricas personales del día ──────────────────

    const studentStats = useMemo(() => {
        if (userRole !== "student") return [];

        // Calcular datos derivados dinámicamente
        const instructorAttendance = getInstructorAttendance(teachers);

        // Validaciones defensivas
        if (!students || students.length === 0) return [];
        if (!courses || courses.length === 0) return [];
        if (!instructorAttendance || instructorAttendance.length === 0) return [];

        // Mock: datos del estudiante actual
        const studentData = students[0];
        
        // Mock: Datos del día actual (usando formato configurado)
        const today = new Date();
        const todayDate = `${today.toLocaleDateString("es-CO", { weekday: "long" })}, ${formatDate(today)}`;
        
        // Mock: Información de la clase/ambiente actual
        const currentClass = courses[0]; // Primera clase del día
        const currentInstructor = instructorAttendance[0]; // Primer instructor
        
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
                value: `${formatPercentage(monthAttendance)}%`,
                subtitle: t("Este mes"),
                change: monthAttendance >= thresholds.excellent ? 2.4 :
                        monthAttendance >= (thresholds.warning + thresholds.excellent) / 2 ? 1.8 :
                        monthAttendance >= thresholds.warning ? 1.0 :
                        monthAttendance >= thresholds.danger ? 0 : -1.2,
                color: monthAttendance >= (thresholds.warning + thresholds.excellent) / 2 ? c.status.success : 
                       monthAttendance >= thresholds.danger ? c.status.warning : c.status.danger,
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
                value: courses?.length || 0,
                subtitle: t("Inscritos"),
                color: c.status.success,
                icon: "book-open",
            },
        ];
    }, [c, t, userRole, students, teachers, courses]);

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
            const baseAttendance = students?.[0]?.attendance || 85;
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
            if (!fichas || fichas.length === 0) return [];
            const teacherFichas = fichas.slice(0, 2);
            courses = mockCourseAttendance
                .filter(item => teacherFichas.some(f => f.code === item.course))
                .slice(0, 3);
        }

        // Student: solo sus cursos inscritos
        if (userRole === "student") {
            courses = mockCourseAttendance.slice(0, 4);
        }

        return courses.map((item) => {
            const course = courses?.find((x) => x.code === item.course);
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
    }, [c, userRole, courses]);

    // ── Datos específicos de ADMIN ────────────────────────────

    const adminData = useMemo(() => {
        if (userRole !== "admin") return null;
        
        // Obtener configuración dinámica
        const minAttendanceThreshold = institutionConfig.minAttendance || 80;
        
        // Calcular datos derivados dinámicamente
        const instructorAttendance = getInstructorAttendance(teachers);
        const atRiskStudents = getAtRiskStudents(students, minAttendanceThreshold);
        const perfectAttendanceStudents = getPerfectAttendanceStudents(students, minAttendanceThreshold);
        
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
    }, [userRole, fichas, students, teachers, institutionConfig.minAttendance, institutionConfig.daysUntilSanction, institutionConfig.consecutiveDaysForSanction]);

    // ── Datos específicos de TEACHER ──────────────────────────

    const teacherData = useMemo(() => {
        if (userRole !== "teacher") return null;
        
        // Obtener configuración dinámica
        const minAttendanceThreshold = institutionConfig.minAttendance || 80;
        
        // Calcular datos derivados dinámicamente
        const atRiskStudents = getAtRiskStudents(students, minAttendanceThreshold);
        
        // Validaciones defensivas
        if (!fichas || fichas.length === 0) return null;

        // Mock: fichas del teacher
        const teacherFichas = fichas.slice(0, 2);
        
        // Estudiantes en riesgo de las fichas del teacher
        const teacherAtRiskStudents = (atRiskStudents || []).filter(s =>
            teacherFichas.some(f => f.code === s.ficha)
        );

        return {
            myFichas: teacherFichas,
            myAtRiskStudents: teacherAtRiskStudents,
        };
    }, [userRole, fichas, students, institutionConfig.minAttendance, institutionConfig.daysUntilSanction, institutionConfig.consecutiveDaysForSanction]);

    // ── Datos específicos de STUDENT ──────────────────────────

    const studentData = useMemo(() => {
        if (userRole !== "student") return null;
        
        // Validaciones defensivas
        if (!students || students.length === 0) return null;
        if (!courses || courses.length === 0) return null;

        const studentInfo = students[0];

        return {
            personalInfo: studentInfo,
            upcomingClasses: courses.slice(0, 3),
        };
    }, [userRole, students, courses]);

    return {
        // Datos comunes
        userRole,
        todayLabel,
        stats: stats || [],
        attendanceByDay: attendanceByDay || [],      // Datos filtrados por rol
        attendanceByWeek: attendanceByWeek || [],     // Datos filtrados por rol
        courseAttendance: courseAttendance || [],     // Datos filtrados por rol
        recentActivity: mockRecentActivity || [],

        // Datos por rol
        adminData: adminData || null,
        teacherData: teacherData || null,
        studentData: studentData || null,
    };
}

