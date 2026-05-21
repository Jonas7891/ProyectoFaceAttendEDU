// ============================================================
//  FaceAttend EDU — Dashboard View
//  Colores desde useTheme() — sin imports de Colors.
// ============================================================

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, StatCard, Badge, Avatar, PageHeader, UIButton, ProgressBar } from "../ui/UI";
import { useTheme } from "../../hooks/useTheme";
import {
    mockAttendanceByDay, mockAttendanceByWeek,
    mockCourseAttendance, mockRecentActivity,
    mockCourses, mockStudents,
} from "../../constants/mockData";
import { useResponsive } from "../../hooks/useResponsive";

// ── Gráfica de barras agrupadas ──────────────────────────────

function DailyBarChart({ data }: { data: typeof mockAttendanceByDay }) {
    const { theme } = useTheme();
    const c         = theme.colors;
    const maxVal    = Math.max(...data.flatMap(d => [d.present, d.late, d.absent]));
    const HEIGHT    = 100;

    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: HEIGHT + 20 }}>
            {data.map((item) => (
                <View key={item.day} style={{ flex: 1, alignItems: "center", gap: 2 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: HEIGHT }}>
                        {[
                            { val: item.present, color: c.states.success },
                            { val: item.late,    color: c.states.warning },
                            { val: item.absent,  color: c.states.danger  },
                        ].map(({ val, color }, i) => (
                            <View key={i} style={{
                                width:           8,
                                height:          Math.max(3, (val / maxVal) * HEIGHT),
                                backgroundColor: color,
                                borderRadius:    2,
                            }} />
                        ))}
                    </View>
                    <Text style={{ fontSize: 10, color: c.text.secondary }}>{item.day}</Text>
                </View>
            ))}
        </View>
    );
}

// ── Tendencia semanal ────────────────────────────────────────

function WeeklyTrend({ data }: { data: typeof mockAttendanceByWeek }) {
    const { theme } = useTheme();
    const c         = theme.colors;

    return (
        <View style={{ gap: 6 }}>
            {data.slice(-5).map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ fontSize: 10, color: c.text.secondary, width: 42 }}>{item.week}</Text>
                    <View style={{ flex: 1, height: 6, backgroundColor: c.border.primary, borderRadius: 99 }}>
                        <View style={{
                            height:          "100%",
                            width:           `${item.rate}%` as any,
                            backgroundColor: c.brand.primary,
                            borderRadius:    99,
                        }} />
                    </View>
                    <Text style={{
                        fontSize: 11, fontWeight: "700",
                        color: c.text.primary, width: 36, textAlign: "right",
                    }}>
                        {item.rate}%
                    </Text>
                </View>
            ))}
        </View>
    );
}

// ── Íconos de actividad ──────────────────────────────────────

function ActivityIcon({ status }: { status: string }) {
    const { theme } = useTheme();
    const c         = theme.colors;
    if (status === "on_time") return <Feather name="check-circle" size={16} color={c.states.success} />;
    if (status === "late")    return <Feather name="clock"        size={16} color={c.states.warning} />;
    return                           <Feather name="x-circle"     size={16} color={c.states.danger}  />;
}

function activityBadge(status: string) {
    if (status === "on_time") return <Badge variant="success">A tiempo</Badge>;
    if (status === "late")    return <Badge variant="warning">Tardanza</Badge>;
    return                           <Badge variant="danger">Ausente</Badge>;
}

// ── MAIN ─────────────────────────────────────────────────────

export default function DashboardView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;

    const today = new Date().toLocaleDateString("es-CO", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            <PageHeader
                title="Dashboard"
                subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
                actions={
                    <UIButton variant="primary" size="sm">
                        Tomar asistencia
                    </UIButton>
                }
            />

            {/* Stat cards */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {[
                    {
                        label: "Total estudiantes",
                        value: mockStudents.length,
                        change: 2.4, changeLabel: "este mes",
                        color: c.brand.primary,
                        icon: <Feather name="users" size={20} color={c.brand.primary} />,
                    },
                    {
                        label: "Cursos activos",
                        value: mockCourses.length,
                        color: c.states.success,
                        icon: <Feather name="book-open" size={20} color={c.states.success} />,
                    },
                    {
                        label: "Asistencia prom.",
                        value: "85.4%",
                        change: 1.2, changeLabel: "vs sem. ant.",
                        color: "#8B5CF6",
                        icon: <Feather name="trending-up" size={20} color="#8B5CF6" />,
                    },
                    {
                        label: "Alertas",
                        value: "3",
                        change: -8, changeLabel: "vs sem. ant.",
                        color: c.states.warning,
                        icon: <Feather name="alert-circle" size={20} color={c.states.warning} />,
                    },
                ].map((stat) => (
                    <View key={stat.label} style={{ flexBasis: isSmall ? "47%" : "23%", flexGrow: 1 }}>
                        <StatCard {...stat} />
                    </View>
                ))}
            </View>

            {/* Gráficas */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                        Tendencia semanal
                    </Text>
                    <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>
                        Últimas 5 semanas
                    </Text>
                    <WeeklyTrend data={mockAttendanceByWeek} />
                </Card>

                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                        Asistencia por día
                    </Text>
                    <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>
                        Esta semana · Presentes / Tardanzas / Ausentes
                    </Text>
                    <DailyBarChart data={mockAttendanceByDay} />
                    <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                        {[
                            [c.states.success, "Presentes"],
                            [c.states.warning, "Tardanzas"],
                            [c.states.danger,  "Ausentes" ],
                        ].map(([color, label]) => (
                            <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
                                <Text style={{ fontSize: 11, color: c.text.secondary }}>{label}</Text>
                            </View>
                        ))}
                    </View>
                </Card>
            </View>

            {/* Asistencia por curso + Actividad reciente */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 16 }}>
                        Asistencia por curso
                    </Text>
                    <View style={{ gap: 14 }}>
                        {mockCourseAttendance.map(item => {
                            const course = mockCourses.find(c2 => c2.code === item.course);
                            const barColor = item.rate >= 85 ? c.states.success : item.rate >= 75 ? c.states.warning : c.states.danger;
                            return (
                                <View key={item.course}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                                        <Text style={{
                                            fontSize: 13, fontWeight: "500",
                                            color: c.text.primary, flex: 1,
                                        }} numberOfLines={1}>
                                            {course?.name || item.course}
                                        </Text>
                                        <Text style={{ fontSize: 13, fontWeight: "700", color: barColor, marginLeft: 8 }}>
                                            {item.rate}%
                                        </Text>
                                    </View>
                                    <ProgressBar value={item.rate} color={barColor} />
                                </View>
                            );
                        })}
                    </View>
                </Card>

                <Card style={isSmall ? undefined : { width: 300 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 16 }}>
                        Actividad reciente
                    </Text>
                    <View style={{ gap: 12 }}>
                        {mockRecentActivity.map(item => (
                            <View key={item.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                                <View style={{ marginTop: 2 }}>
                                    <ActivityIcon status={item.status} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary }}>
                                        {item.student}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                        {item.course} · {item.time}
                                    </Text>
                                </View>
                                {activityBadge(item.status)}
                            </View>
                        ))}
                    </View>
                    <View style={{
                        marginTop: 16, paddingTop: 12,
                        borderTopWidth: 1, borderTopColor: c.border.primary,
                    }}>
                        <TouchableOpacity>
                            <Text style={{ fontSize: 12, color: c.brand.primary, fontWeight: "500" }}>
                                Ver toda la actividad →
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}
