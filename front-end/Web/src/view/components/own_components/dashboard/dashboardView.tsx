// ============================================================
//  FaceAttend EDU — Dashboard View (React Native)
// ============================================================
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Card, StatCard, Badge, Avatar, PageHeader, UIButton, ProgressBar } from "../ui/UI";
import Colors from "../../constants/colors";
import {
    mockAttendanceByDay, mockAttendanceByWeek,
    mockCourseAttendance, mockRecentActivity,
    mockCourses, mockStudents,
} from "../../constants/mockData";

function activityBadge(status: string) {
    if (status === "on_time") return <Badge variant="success">A tiempo</Badge>;
    if (status === "late")    return <Badge variant="warning">Tardanza</Badge>;
    return <Badge variant="danger">Ausente</Badge>;
}

function activityIcon(status: string) {
    if (status === "on_time") return "✅";
    if (status === "late")    return "⏰";
    return "❌";
}

// Simple bar chart en React Native
function SimpleBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
    const max = Math.max(...data.map(d => d.value));
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, height: 80 }}>
            {data.map((item, i) => (
                <View key={i} style={{ flex: 1, alignItems: "center" }}>
                    <View style={{
                        width: "100%",
                        height: Math.max(4, (item.value / max) * 70),
                        backgroundColor: item.color,
                        borderRadius: 4,
                        marginBottom: 4,
                    }} />
                    <Text style={{ fontSize: 10, color: Colors.muted }}>{item.label}</Text>
                </View>
            ))}
        </View>
    );
}

// Gráfica de tendencia simple
function SimpleTrend({ data }: { data: { week: string; rate: number }[] }) {
    return (
        <View style={{ gap: 6 }}>
            {data.slice(-4).map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ fontSize: 11, color: Colors.muted, width: 50 }}>{item.week}</Text>
                    <View style={{ flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 99 }}>
                        <View style={{ height: "100%", width: `${item.rate}%` as any, backgroundColor: Colors.primary, borderRadius: 99 }} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.text, width: 36, textAlign: "right" }}>
                        {item.rate}%
                    </Text>
                </View>
            ))}
        </View>
    );
}

export default function DashboardView() {
    const today = new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    const dailyChartData = mockAttendanceByDay.map(d => ({
        label: d.day,
        value: d.present,
        color: Colors.primary,
    }));

    return (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} showsVerticalScrollIndicator={false}>
            <PageHeader
                title="Dashboard"
                subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
                actions={
                    <UIButton variant="primary" size="sm">🎭 Tomar asistencia</UIButton>
                }
            />

            {/* Stat cards */}
            <View style={{ flexDirection: "row", gap: 12 }}>
                <StatCard label="Estudiantes"         value={mockStudents.length}   change={2.4}  changeLabel="este mes"        color={Colors.primary}    />
                <StatCard label="Cursos activos"      value={mockCourses.length}                                                color="#10B981"           />
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
                <StatCard label="Asistencia prom."    value="85.4%"                  change={1.2}  changeLabel="vs sem. ant."   color="#8B5CF6"           />
                <StatCard label="Alertas"             value="3"                      change={-8}   changeLabel="vs sem. ant."   color="#F59E0B"           />
            </View>

            {/* Tendencia semanal */}
            <Card>
                <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 4, color: Colors.text }}>
                    Tendencia semanal
                </Text>
                <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 16 }}>Últimas 4 semanas</Text>
                <SimpleTrend data={mockAttendanceByWeek} />
            </Card>

            {/* Asistencia diaria */}
            <Card>
                <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 4, color: Colors.text }}>
                    Asistencia esta semana
                </Text>
                <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 12 }}>Alumnos presentes por día</Text>
                <SimpleBarChart data={dailyChartData} />
            </Card>

            {/* Asistencia por curso */}
            <Card>
                <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 16, color: Colors.text }}>
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
                                    <Text style={{ fontSize: 13, fontWeight: "700", color, marginLeft: 8 }}>{item.rate}%</Text>
                                </View>
                                <ProgressBar value={item.rate} color={color} />
                            </View>
                        );
                    })}
                </View>
            </Card>

            {/* Actividad reciente */}
            <Card>
                <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 16, color: Colors.text }}>
                    Actividad reciente
                </Text>
                <View style={{ gap: 12 }}>
                    {mockRecentActivity.map(item => (
                        <View key={item.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                            <Text style={{ fontSize: 16, marginTop: 2 }}>{activityIcon(item.status)}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.text }}>{item.student}</Text>
                                <Text style={{ fontSize: 11, color: Colors.muted }}>{item.course} · {item.time}</Text>
                            </View>
                            {activityBadge(item.status)}
                        </View>
                    ))}
                </View>
            </Card>
        </ScrollView>
    );
}
