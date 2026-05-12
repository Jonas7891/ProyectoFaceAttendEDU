import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, StatCard, Badge, Avatar, PageHeader, UIButton, ProgressBar } from "../ui/UI";
import Colors from "../../constants/colors";
import {
    mockAttendanceByDay, mockAttendanceByWeek,
    mockCourseAttendance, mockRecentActivity,
    mockCourses, mockStudents,
} from "../../constants/mockData";
import { useResponsive } from "../../hooks/useResponsive";

// ── Mini gráfica de barras agrupadas ────────────────────────
function DailyBarChart({ data }: { data: typeof mockAttendanceByDay }) {
    const maxVal = Math.max(...data.flatMap(d => [d.present, d.late, d.absent]));
    const HEIGHT = 100;
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: HEIGHT + 20 }}>
            {data.map((item) => (
                <View key={item.day} style={{ flex: 1, alignItems: "center", gap: 2 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, height: HEIGHT }}>
                        {[
                            { val: item.present, color: "#10B981" },
                            { val: item.late,    color: "#F59E0B" },
                            { val: item.absent,  color: "#EF4444" },
                        ].map(({ val, color }, i) => (
                            <View key={i} style={{
                                width: 8,
                                height: Math.max(3, (val / maxVal) * HEIGHT),
                                backgroundColor: color,
                                borderRadius: 2,
                            }} />
                        ))}
                    </View>
                    <Text style={{ fontSize: 10, color: Colors.muted }}>{item.day}</Text>
                </View>
            ))}
        </View>
    );
}

// ── Mini sparkline de línea (tendencia) ─────────────────────
function WeeklyTrend({ data }: { data: typeof mockAttendanceByWeek }) {
    const max = Math.max(...data.map(d => d.rate));
    const min = Math.min(...data.map(d => d.rate));
    const HEIGHT = 80;
    return (
        <View style={{ gap: 6 }}>
            {data.slice(-5).map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ fontSize: 10, color: Colors.muted, width: 42 }}>{item.week}</Text>
                    <View style={{ flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 99 }}>
                        <View style={{
                            height: "100%",
                            width: `${item.rate}%` as any,
                            backgroundColor: Colors.primary,
                            borderRadius: 99,
                        }} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.text, width: 36, textAlign: "right" }}>
                        {item.rate}%
                    </Text>
                </View>
            ))}
        </View>
    );
}

// ── Item de actividad reciente ───────────────────────────────
function ActivityIcon({ status }: { status: string }) {
    if (status === "on_time") return <Feather name="check-circle" size={16} color="#10B981" />;
    if (status === "late")    return <Feather name="clock"        size={16} color="#F59E0B" />;
    return                           <Feather name="x-circle"     size={16} color="#EF4444" />;
}
function activityBadge(status: string) {
    if (status === "on_time") return <Badge variant="success">A tiempo</Badge>;
    if (status === "late")    return <Badge variant="warning">Tardanza</Badge>;
    return                           <Badge variant="danger">Ausente</Badge>;
}

// ── MAIN ────────────────────────────────────────────────────
export default function DashboardView() {
    const { isSmall } = useResponsive();
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

            {/* ── Stat cards: 2 por fila en móvil, 4 en desktop ── */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                <View style={{ flexBasis: isSmall ? "47%" : "23%", flexGrow: 1 }}>
                    <StatCard
                        label="Total estudiantes"
                        value={mockStudents.length}
                        change={2.4} changeLabel="este mes"
                        color={Colors.primary}
                        icon={<Feather name="users" size={20} color={Colors.primary} />}
                    />
                </View>
                <View style={{ flexBasis: isSmall ? "47%" : "23%", flexGrow: 1 }}>
                    <StatCard
                        label="Cursos activos"
                        value={mockCourses.length}
                        color="#10B981"
                        icon={<Feather name="book-open" size={20} color="#10B981" />}
                    />
                </View>
                <View style={{ flexBasis: isSmall ? "47%" : "23%", flexGrow: 1 }}>
                    <StatCard
                        label="Asistencia prom."
                        value="85.4%"
                        change={1.2} changeLabel="vs sem. ant."
                        color="#8B5CF6"
                        icon={<Feather name="trending-up" size={20} color="#8B5CF6" />}
                    />
                </View>
                <View style={{ flexBasis: isSmall ? "47%" : "23%", flexGrow: 1 }}>
                    <StatCard
                        label="Alertas"
                        value="3"
                        change={-8} changeLabel="vs sem. ant."
                        color="#F59E0B"
                        icon={<Feather name="alert-circle" size={20} color="#F59E0B" />}
                    />
                </View>
            </View>

            {/* ── Gráficas: en desktop lado a lado, en móvil apiladas ── */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 4 }}>
                        Tendencia semanal
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 16 }}>
                        Últimas 5 semanas
                    </Text>
                    <WeeklyTrend data={mockAttendanceByWeek} />
                </Card>

                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 4 }}>
                        Asistencia por día
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 16 }}>
                        Esta semana · Presentes / Tardanzas / Ausentes
                    </Text>
                    <DailyBarChart data={mockAttendanceByDay} />
                    <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                        {[["#10B981","Presentes"],["#F59E0B","Tardanzas"],["#EF4444","Ausentes"]].map(([c, l]) => (
                            <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: c }} />
                                <Text style={{ fontSize: 11, color: Colors.muted }}>{l}</Text>
                            </View>
                        ))}
                    </View>
                </Card>
            </View>

            {/* ── Asistencia por curso + Actividad reciente ── */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                {/* Asistencia por curso */}
                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 16 }}>
                        Asistencia por curso
                    </Text>
                    <View style={{ gap: 14 }}>
                        {mockCourseAttendance.map(item => {
                            const course = mockCourses.find(c => c.code === item.course);
                            const color = item.rate >= 85 ? "#10B981" : item.rate >= 75 ? "#F59E0B" : "#EF4444";
                            return (
                                <View key={item.course}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                                        <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.text, flex: 1 }} numberOfLines={1}>
                                            {course?.name || item.course}
                                        </Text>
                                        <Text style={{ fontSize: 13, fontWeight: "700", color, marginLeft: 8 }}>
                                            {item.rate}%
                                        </Text>
                                    </View>
                                    <ProgressBar value={item.rate} color={color} />
                                </View>
                            );
                        })}
                    </View>
                </Card>

                {/* Actividad reciente */}
                <Card style={isSmall ? undefined : { width: 300 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 16 }}>
                        Actividad reciente
                    </Text>
                    <View style={{ gap: 12 }}>
                        {mockRecentActivity.map(item => (
                            <View key={item.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                                <View style={{ marginTop: 2 }}>
                                    <ActivityIcon status={item.status} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.text }}>{item.student}</Text>
                                    <Text style={{ fontSize: 11, color: Colors.muted }}>{item.course} · {item.time}</Text>
                                </View>
                                {activityBadge(item.status)}
                            </View>
                        ))}
                    </View>
                    <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border }}>
                        <TouchableOpacity>
                            <Text style={{ fontSize: 12, color: Colors.primary, fontWeight: "500" }}>
                                Ver toda la actividad →
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Card>
            </View>
        </ScrollView>
    );
}
