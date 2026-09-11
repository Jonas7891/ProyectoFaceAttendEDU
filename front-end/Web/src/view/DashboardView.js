// ============================================================
//  FaceAttend EDU — Dashboard VIEW (Tab Principal)
// ============================================================
//  RESPONSABILIDAD: Presentación y UI ("cómo se presenta")
//
//  Este componente:
//  ✓ Renderiza el contenido del tab principal del Dashboard
//  ✓ Muestra dashboards diferenciados por rol (Admin/Teacher/Student)
//  ✓ Maneja la presentación visual de datos del dashboard
//  ✓ Coordina hooks de presentación (useDashboardViewModel)
//
//  Dashboard por rol:
//  - ADMIN: Vista completa del sistema (instructores, fichas, estudiantes)
//  - TEACHER: Vista de sus cursos y estudiantes
//  - STUDENT: Vista personal
// ============================================================

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
    Card,
    StatCard,
    Button,
    ProgressBar,
    AttendanceStatusIcon,
    AttendanceStatusBadge,
} from "./components/common";
import {
    DailyBarChart,
    WeeklyTrend,
    useWeeklyAttendanceController,
    InstructorAttendanceList,
    TopPerformingGroups,
    AtRiskStudentsList,
    PerfectAttendanceList,
} from "./components/dashboard";
import { useTheme }              from "./components/hooks/useTheme";
import { useResponsive }         from "./components/hooks/useResponsive";
import { useDashboardViewModel } from "../viewmodels/useDashboardViewModel";
import { useRolePermissions }    from "./hooks/useRolePermissions";
import { useTranslation }        from "../i18n/hooks/useTranslation";
import { 
    DEFAULT_ACADEMIC_PERIOD,
    getCurrentPeriod,
    getAcademicPeriodConfig
} from "../core/constants/academicPeriods";

// ──────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────

/**
 * Genera el subtítulo dinámico para la sección de tendencia semanal
 * según el período académico configurado (viene de Settings)
 * 
 * @param {string} periodType - Tipo de período académico
 * @param {Function} t - Función de traducción
 * @returns {string} Subtítulo formateado
 */
function getWeeklyTrendSubtitle(periodType, t) {
    const currentPeriod = getCurrentPeriod(periodType);
    const config = getAcademicPeriodConfig(periodType);
    
    if (!currentPeriod || !config) {
        return `${t("Selecciona para ver detalles")}`;
    }
    
    // Formatear el label del período según el tipo
    let periodLabel;
    switch (periodType) {
        case "annual":
            periodLabel = t("Año actual");
            break;
        case "semestral":
            periodLabel = currentPeriod.periodNumber === 1 
                ? t("Primer semestre") 
                : t("Segundo semestre");
            break;
        case "quarterly":
            periodLabel = `${t("Cuatrimestre")} ${currentPeriod.periodNumber}`;
            break;
        case "trimestral":
            periodLabel = `${t("Trimestre")} ${currentPeriod.periodNumber}`;
            break;
        default:
            periodLabel = currentPeriod.label;
    }
    
    return `${periodLabel} (${config.label}) • ${t("Selecciona para ver detalles")}`;
}

// ──────────────────────────────────────────────────────────────
// ADMIN DASHBOARD — Vista completa del sistema
// ──────────────────────────────────────────────────────────────

function AdminDashboard({ vm, permissions, isSmall, c, t }) {
    // Hook para orquestar selección de semanas
    const {
        selectedWeek,
        handleWeekSelect,
        handleResetToCurrentWeek,
        weeklyTrendProps,
        dailyBarChartProps,
    } = useWeeklyAttendanceController(vm.attendanceByWeek, vm.attendanceByDay);
    
    if (!vm.adminData) return null;

    const weekLabel = selectedWeek ? selectedWeek.week : t("Esta semana");
    
    // TODO: Obtener de Settings cuando esté implementado
    const academicPeriod = DEFAULT_ACADEMIC_PERIOD;
    const weeklySubtitle = getWeeklyTrendSubtitle(academicPeriod, t);

    return (
        <>
            {/* Stats principales */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {vm.stats.map((stat) => (
                    <View key={stat.label} style={{ 
                        flexBasis: isSmall ? "47%" : "23%", 
                        flexGrow: 1,
                        minWidth: 160,
                    }}>
                        <StatCard
                            label={stat.label}
                            value={stat.value}
                            icon={<Feather name={stat.icon} size={20} color={stat.color} />}
                            trend={stat.change ? (stat.change > 0 ? "up" : "down") : undefined}
                            trendValue={stat.change ? `${Math.abs(stat.change)}%` : undefined}
                            color={stat.color}
                        />
                        {stat.subtitle && (
                            <Text style={{
                                fontSize: 11,
                                color: c.text.secondary,
                                marginTop: 4,
                                marginLeft: 16,
                            }}>
                                {stat.subtitle}
                            </Text>
                        )}
                    </View>
                ))}
            </View>

            {/* Sección: Asistencia de Instructores */}
            <View>
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                }}>
                    <View>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: c.text.primary,
                        }}>
                            {t("Asistencia de Instructores")}
                        </Text>
                        <Text style={{
                            fontSize: 13,
                            color: c.text.secondary,
                            marginTop: 2,
                        }}>
                            {t("Resumen de asistencia del personal docente")}
                        </Text>
                    </View>
                    <Button variant="ghost" size="sm">
                        {t("Ver todos")} →
                    </Button>
                </View>
                
                <InstructorAttendanceList
                    instructors={vm.adminData.instructorAttendance}
                    maxItems={5}
                    onInstructorPress={(instructor) => {
                        console.log("Ver detalle instructor:", instructor);
                    }}
                />
            </View>

            {/* Sección: Top Fichas */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: 12 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: c.text.primary,
                        }}>
                            {t("Mejores Fichas")} 🏆
                        </Text>
                        <Text style={{
                            fontSize: 13,
                            color: c.text.secondary,
                            marginTop: 2,
                        }}>
                            {t("Grupos con mejor asistencia")}
                        </Text>
                    </View>
                    
                    <TopPerformingGroups
                        fichas={vm.adminData.fichas}
                        mode="top"
                        maxItems={5}
                        onFichaPress={(ficha) => {
                            console.log("Ver detalle ficha:", ficha);
                        }}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: 12 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: c.text.primary,
                        }}>
                            {t("Fichas que Necesitan Atención")} ⚠️
                        </Text>
                        <Text style={{
                            fontSize: 13,
                            color: c.text.secondary,
                            marginTop: 2,
                        }}>
                            {t("Grupos con menor asistencia")}
                        </Text>
                    </View>
                    
                    <TopPerformingGroups
                        fichas={vm.adminData.fichas}
                        mode="bottom"
                        maxItems={3}
                        onFichaPress={(ficha) => {
                            console.log("Ver detalle ficha:", ficha);
                        }}
                    />
                </View>
            </View>

            {/* Gráficas de tendencias - Orquestadas por el hook */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: c.text.primary,
                        marginBottom: 4,
                    }}>
                        {t("Tendencia semanal")}
                    </Text>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                        marginBottom: 16,
                    }}>
                        {weeklySubtitle}
                    </Text>
                    <WeeklyTrend 
                        {...weeklyTrendProps}
                        maxWeeks={5}
                        showTrend={true}
                        colorByPerformance={true}
                        academicPeriod={academicPeriod}
                    />
                </Card>

                <Card style={{ flex: 1 }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4,
                        minHeight: 20,
                    }}>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: c.text.primary,
                        }}>
                            {t("Asistencia por día")}
                        </Text>
                        {selectedWeek && (
                            <TouchableOpacity
                                onPress={handleResetToCurrentWeek}
                                style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 2,
                                    borderRadius: 4,
                                    backgroundColor: c.status.info + "15",
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={{
                                    fontSize: 10,
                                    fontWeight: "600",
                                    color: c.status.info,
                                }}>
                                    {t("Ver semana actual")}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                        marginBottom: 16,
                        minHeight: 16,
                    }}>
                        {weekLabel}
                    </Text>
                    <DailyBarChart 
                        {...dailyBarChartProps}
                        height={100}
                        showLegend={true}
                        showSummary={true}
                    />
                </Card>
            </View>

            {/* Sección: Estudiantes en Riesgo y Destacados */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: 12 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: c.text.primary,
                        }}>
                            {t("Estudiantes en Riesgo")} 🚨
                        </Text>
                        <Text style={{
                            fontSize: 13,
                            color: c.text.secondary,
                            marginTop: 2,
                        }}>
                            {t("Requieren intervención urgente")}
                        </Text>
                    </View>
                    
                    <AtRiskStudentsList
                        students={vm.adminData.atRiskStudents}
                        maxItems={5}
                        onStudentPress={(student) => {
                            console.log("Ver detalle estudiante:", student);
                        }}
                    />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={{ marginBottom: 12 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: c.text.primary,
                        }}>
                            {t("Estudiantes Destacados")} ⭐
                        </Text>
                        <Text style={{
                            fontSize: 13,
                            color: c.text.secondary,
                            marginTop: 2,
                        }}>
                            {t("Excelencia en asistencia")}
                        </Text>
                    </View>
                    
                    <PerfectAttendanceList
                        students={vm.adminData.perfectAttendanceStudents}
                        maxItems={5}
                        onStudentPress={(student) => {
                            console.log("Ver detalle estudiante:", student);
                        }}
                    />
                </View>
            </View>
        </>
    );
}

// ──────────────────────────────────────────────────────────────
// TEACHER DASHBOARD — Vista de cursos del instructor
// ──────────────────────────────────────────────────────────────

function TeacherDashboard({ vm, permissions, isSmall, c, t }) {
    if (!vm.teacherData) return null;
    
    // TODO: Obtener de Settings cuando esté implementado
    const academicPeriod = DEFAULT_ACADEMIC_PERIOD;
    const weeklySubtitle = getWeeklyTrendSubtitle(academicPeriod, t);

    return (
        <>
            {/* Stats del teacher */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {vm.stats.map((stat) => (
                    <View key={stat.label} style={{ 
                        flexBasis: isSmall ? "47%" : "23%", 
                        flexGrow: 1 
                    }}>
                        <StatCard
                            label={stat.label}
                            value={stat.value}
                            icon={<Feather name={stat.icon} size={20} color={stat.color} />}
                            trend={stat.change ? (stat.change > 0 ? "up" : "down") : undefined}
                            trendValue={stat.change ? `${Math.abs(stat.change)}%` : undefined}
                            color={stat.color}
                        />
                    </View>
                ))}
            </View>

            {/* Mis fichas */}
            <View>
                <Text style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: c.text.primary,
                    marginBottom: 12,
                }}>
                    {t("Mis Fichas")}
                </Text>
                
                <TopPerformingGroups
                    fichas={vm.teacherData.myFichas}
                    mode="top"
                    maxItems={10}
                    onFichaPress={(ficha) => {
                        console.log("Ver detalle ficha:", ficha);
                    }}
                />
            </View>

            {/* Gráficas del teacher */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: c.text.primary,
                        marginBottom: 4,
                    }}>
                        {t("Asistencia por ficha")}
                    </Text>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                        marginBottom: 16,
                    }}>
                        {t("Mis fichas asignadas")}
                    </Text>
                    <View style={{ gap: 14 }}>
                        {vm.courseAttendance.map(item => (
                            <View key={item.course}>
                                <View style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 8,
                                }}>
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: "500",
                                        color: c.text.primary,
                                        flex: 1,
                                    }} numberOfLines={1}>
                                        {item.courseName}
                                    </Text>
                                    <Text style={{
                                        fontSize: 13,
                                        fontWeight: "700",
                                        color: item.barColor,
                                        marginLeft: 8,
                                    }}>
                                        {item.rate}%
                                    </Text>
                                </View>
                                <ProgressBar
                                    value={item.rate}
                                    color={item.barColor}
                                    size="md"
                                />
                            </View>
                        ))}
                    </View>
                </Card>
                
                {/* Vista integrada de tendencia semanal */}
                <Card style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: c.text.primary,
                        marginBottom: 4,
                    }}>
                        {t("Tendencia de mis fichas")}
                    </Text>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                        marginBottom: 16,
                    }}>
                        {weeklySubtitle}
                    </Text>
                    <WeeklyTrend 
                        data={vm.attendanceByWeek} 
                        maxWeeks={5}
                        showTrend={true}
                        colorByPerformance={true}
                        onWeekSelect={(weekData) => console.log("Semana seleccionada:", weekData)}
                        selectedWeek={null}
                        academicPeriod={academicPeriod}
                    />
                </Card>
            </View>

            {/* Vista integrada de asistencia diaria */}
            <WeeklyAttendanceView
                weeklyData={vm.attendanceByWeek}
                currentWeekData={vm.attendanceByDay}
                maxWeeks={5}
                showTrend={false}
                colorByPerformance={true}
                weeklyTitle={t("Tendencia de mis fichas")}
                weeklySubtitle={weeklySubtitle}
                dailyTitle={t("Asistencia por día")}
                currentWeekLabel={t("En mis fichas esta semana")}
                isSmall={isSmall}
            />

            {/* Estudiantes en riesgo del teacher */}
            {vm.teacherData.myAtRiskStudents.length > 0 && (
                <View>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: c.text.primary,
                        marginBottom: 12,
                    }}>
                        {t("Mis Estudiantes en Riesgo")}
                    </Text>
                    
                    <AtRiskStudentsList
                        students={vm.teacherData.myAtRiskStudents}
                        maxItems={10}
                        onStudentPress={(student) => {
                            console.log("Ver detalle estudiante:", student);
                        }}
                    />
                </View>
            )}
        </>
    );
}

// ──────────────────────────────────────────────────────────────
// STUDENT DASHBOARD — Vista personal del estudiante
// ──────────────────────────────────────────────────────────────

function StudentDashboard({ vm, permissions, isSmall, c, t }) {
    const [selectedWeek, setSelectedWeek] = React.useState(null);
    
    if (!vm.studentData) return null;

    // Determinar qué datos diarios mostrar
    const displayedDailyData = selectedWeek?.dailyData || vm.attendanceByDay;
    const weekLabel = selectedWeek ? selectedWeek.week : t("Esta semana");
    
    // TODO: Obtener de Settings cuando esté implementado
    const academicPeriod = DEFAULT_ACADEMIC_PERIOD;
    const weeklySubtitle = getWeeklyTrendSubtitle(academicPeriod, t);

    return (
        <>
            {/* Stats personales */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {vm.stats.map((stat) => (
                    <View key={stat.label} style={{ 
                        flexBasis: isSmall ? "47%" : "23%", 
                        flexGrow: 1 
                    }}>
                        <StatCard
                            label={stat.label}
                            value={stat.value}
                            icon={<Feather name={stat.icon} size={20} color={stat.color} />}
                            trend={stat.change ? (stat.change > 0 ? "up" : "down") : undefined}
                            trendValue={stat.change ? `${Math.abs(stat.change)}%` : undefined}
                            color={stat.color}
                        />
                    </View>
                ))}
            </View>

            {/* Gráficas personales del estudiante */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: c.text.primary,
                        marginBottom: 4,
                    }}>
                        {t("Mi asistencia semanal")}
                    </Text>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                        marginBottom: 16,
                    }}>
                        {weeklySubtitle}
                    </Text>
                    <WeeklyTrend 
                        data={vm.attendanceByWeek} 
                        maxWeeks={5}
                        showTrend={true}
                        colorByPerformance={true}
                        onWeekSelect={(weekData) => setSelectedWeek(weekData)}
                        selectedWeek={selectedWeek?.week}
                        academicPeriod={academicPeriod}
                    />
                </Card>

                <Card style={{ flex: 1 }}>
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 4,
                    }}>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: c.text.primary,
                        }}>
                            {t("Mi asistencia diaria")}
                        </Text>
                        {selectedWeek && (
                            <TouchableOpacity
                                onPress={() => setSelectedWeek(null)}
                                style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderRadius: 4,
                                    backgroundColor: c.status.info + "15",
                                }}
                            >
                                <Text style={{
                                    fontSize: 10,
                                    fontWeight: "600",
                                    color: c.status.info,
                                }}>
                                    {t("Ver semana actual")}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                        marginBottom: 16,
                    }}>
                        {weekLabel}
                    </Text>
                    <DailyBarChart 
                        data={displayedDailyData} 
                        height={100}
                        showLegend={true}
                        showSummary={true}
                    />
                </Card>
            </View>

            {/* Asistencia por curso del estudiante */}
            <Card>
                <Text style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: c.text.primary,
                    marginBottom: 4,
                }}>
                    {t("Asistencia por curso")}
                </Text>
                <Text style={{
                    fontSize: 12,
                    color: c.text.secondary,
                    marginBottom: 16,
                }}>
                    {t("Mi rendimiento en cada curso")}
                </Text>
                <View style={{ gap: 14 }}>
                    {vm.courseAttendance.map(item => (
                        <View key={item.course}>
                            <View style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                            }}>
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: "500",
                                    color: c.text.primary,
                                    flex: 1,
                                }} numberOfLines={1}>
                                    {item.courseName}
                                </Text>
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: "700",
                                    color: item.barColor,
                                    marginLeft: 8,
                                }}>
                                    {item.rate}%
                                </Text>
                            </View>
                            <ProgressBar
                                value={item.rate}
                                color={item.barColor}
                                size="md"
                            />
                        </View>
                    ))}
                </View>
            </Card>

            {/* Actividad reciente */}
            <Card>
                <Text style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: c.text.primary,
                    marginBottom: 16,
                }}>
                    {t("Actividad reciente")}
                </Text>
                <View style={{ gap: 12 }}>
                    {vm.recentActivity.slice(0, 5).map(item => (
                        <View key={item.id} style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            gap: 10,
                        }}>
                            <View style={{ marginTop: 2 }}>
                                <AttendanceStatusIcon status={item.status} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: "600",
                                    color: c.text.primary,
                                }}>
                                    {item.student}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    color: c.text.secondary,
                                }}>
                                    {item.course} — {item.time}
                                </Text>
                            </View>
                            <AttendanceStatusBadge status={item.status} />
                        </View>
                    ))}
                </View>
            </Card>
        </>
    );
}

// ──────────────────────────────────────────────────────────────
// DASHBOARD VIEW PRINCIPAL
// ──────────────────────────────────────────────────────────────

export default function DashboardView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useDashboardViewModel();
    const { t }       = useTranslation();
    const permissions = useRolePermissions();

    // Determinar título según rol
    const dashboardTitle = {
        admin: t("Panel de Administración"),
        teacher: t("Mi Panel de Instructor"),
        student: t("Mi Panel Personal"),
    }[vm.userRole] || t("Dashboard");

    const dashboardSubtitle = {
        admin: t("Vista completa del sistema"),
        teacher: t("Gestión de tus fichas y estudiantes"),
        student: t("Tu progreso y asistencia"),
    }[vm.userRole] || vm.todayLabel;

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 24 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header del Dashboard */}
            <View style={{ marginBottom: 8 }}>
                <View style={{
                    flexDirection: isSmall ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: isSmall ? "flex-start" : "center",
                    gap: isSmall ? 12 : 16,
                }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: isSmall ? 20 : 24,
                            fontWeight: "700",
                            color: c.text.primary,
                            marginBottom: 4,
                        }}>
                            {dashboardTitle}
                        </Text>
                        <Text style={{
                            fontSize: isSmall ? 13 : 14,
                            color: c.text.secondary,
                        }}>
                            {dashboardSubtitle}
                        </Text>
                    </View>
                    {permissions.canRegisterFace && (
                        <Button variant="primary" size="sm">
                            <Feather name="camera" size={16} color="#fff" /> {t("Tomar asistencia")}
                        </Button>
                    )}
                </View>
            </View>

            {/* Renderizar dashboard según rol */}
            {vm.userRole === "admin" && (
                <AdminDashboard 
                    vm={vm} 
                    permissions={permissions}
                    isSmall={isSmall}
                    c={c}
                    t={t}
                />
            )}

            {vm.userRole === "teacher" && (
                <TeacherDashboard 
                    vm={vm} 
                    permissions={permissions}
                    isSmall={isSmall}
                    c={c}
                    t={t}
                />
            )}

            {vm.userRole === "student" && (
                <StudentDashboard 
                    vm={vm} 
                    permissions={permissions}
                    isSmall={isSmall}
                    c={c}
                    t={t}
                />
            )}
        </ScrollView>
    );
}
