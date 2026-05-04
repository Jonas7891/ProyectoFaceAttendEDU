// ============================================================
//  FaceAttend EDU — Reports View (React Native)
//  Layout 2-col en desktop, con Feather icons — sin emojis
// ============================================================
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, PageHeader, UIButton, ProgressBar, StatCard } from "../ui/UI";
import Colors from "../../constants/colors";
import {
    mockAttendanceByWeek, mockAttendanceByDay,
    mockCourseAttendance, mockCourses, mockStudents,
} from "../../constants/mockData";
import { useResponsive } from "../../hooks/useResponsive";

const atRiskStudents = mockStudents.filter(s => s.attendance < 75);

const PERIODS = [
    { value: "week",     label: "Esta semana" },
    { value: "month",    label: "Este mes"    },
    { value: "semester", label: "Semestre"    },
];

const pieData = [
    { name: "A tiempo",  value: 72, color: "#10B981" },
    { name: "Tardanzas", value: 13, color: "#F59E0B" },
    { name: "Ausentes",  value: 15, color: "#EF4444" },
];

// ── Sparkline semanal ────────────────────────────────────────
function WeeklySparkline({ data }: { data: typeof mockAttendanceByWeek }) {
    return (
        <View style={{ gap: 8 }}>
            {data.map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ fontSize: 10, color: Colors.muted, width: 44 }}>{item.week}</Text>
                    <View style={{ flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 99 }}>
                        <View style={{
                            height: "100%", width: `${item.rate}%` as any,
                            backgroundColor: Colors.primary, borderRadius: 99,
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

// ── Barras diarias apiladas horizontalmente ─────────────────
function DailyBars({ data }: { data: typeof mockAttendanceByDay }) {
    const maxTotal = Math.max(...data.map(d => d.present + d.late + d.absent));
    return (
        <View style={{ gap: 10 }}>
            {data.map(item => {
                const total = item.present + item.late + item.absent;
                return (
                    <View key={item.day} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: Colors.text, width: 32 }}>{item.day}</Text>
                        <View style={{ flex: 1, flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: Colors.border }}>
                            <View style={{ flex: item.present, backgroundColor: "#10B981" }} />
                            <View style={{ flex: item.late,    backgroundColor: "#F59E0B" }} />
                            <View style={{ flex: item.absent,  backgroundColor: "#EF4444" }} />
                        </View>
                        <Text style={{ fontSize: 11, color: Colors.muted, width: 70, textAlign: "right" }}>
                            {item.present}P · {item.absent}A
                        </Text>
                    </View>
                );
            })}
            <View style={{ flexDirection: "row", gap: 14, marginTop: 4 }}>
                {[["#10B981","Presentes"],["#F59E0B","Tardanzas"],["#EF4444","Ausentes"]].map(([c, l]) => (
                    <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: c }} />
                        <Text style={{ fontSize: 11, color: Colors.muted }}>{l}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default function ReportsView() {
    const { isSmall } = useResponsive();
    const [period, setPeriod] = useState("semester");

    return (
        <ScrollView contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }} showsVerticalScrollIndicator={false}>
            <PageHeader
                title="Reportes y estadísticas"
                subtitle="Análisis de asistencia por período académico"
                actions={<>
                    <UIButton variant="ghost" size="sm">Filtros</UIButton>
                    <UIButton variant="ghost" size="sm">Exportar PDF</UIButton>
                    <UIButton variant="primary" size="sm">Exportar Excel</UIButton>
                </>}
            />

            {/* Selector de período */}
            <Card padding={14}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Feather name="calendar" size={14} color={Colors.muted} />
                        <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.muted }}>Período:</Text>
                    </View>
                    {PERIODS.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => setPeriod(opt.value)}
                            style={{
                                paddingVertical: 6, paddingHorizontal: 14, borderRadius: 99,
                                backgroundColor: period === opt.value ? Colors.primary : Colors.border,
                            }}
                        >
                            <Text style={{
                                fontSize: 12, fontWeight: period === opt.value ? "600" : "400",
                                color: period === opt.value ? "#fff" : Colors.muted,
                            }}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>

            {/* Stats — 2 × 2 en móvil, 4 en fila en desktop */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {[
                    { label: "Asistencia global", value: "85.4%", change: 1.2,  changeLabel: "vs período ant.", color: Colors.primary, icon: "trending-up"   },
                    { label: "Total registros",   value: "2,847", change: 5.8,  changeLabel: "vs período ant.", color: "#10B981",      icon: "users"          },
                    { label: "Tardanzas",         value: "324",   change: -3.1, changeLabel: "vs período ant.", color: "#F59E0B",      icon: "calendar"       },
                    { label: "En riesgo",         value: atRiskStudents.length, change: undefined, changeLabel: undefined, color: "#EF4444", icon: "alert-circle" },
                ].map(({ label, value, change, changeLabel, color, icon }) => (
                    <View key={label} style={{ flexBasis: isSmall ? "47%" : "23%", flexGrow: 1 }}>
                        <StatCard
                            label={label} value={value} change={change} changeLabel={changeLabel} color={color}
                            icon={<Feather name={icon as any} size={18} color={color} />}
                        />
                    </View>
                ))}
            </View>

            {/* Evolución + Distribución */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 4 }}>Evolución de asistencia</Text>
                    <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 16 }}>Porcentaje por semana</Text>
                    <WeeklySparkline data={mockAttendanceByWeek} />
                </Card>

                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 4 }}>Distribución</Text>
                    <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 16 }}>Estado de asistencia</Text>
                    <View style={{ gap: 14 }}>
                        {pieData.map(item => (
                            <View key={item.name} style={{ gap: 6 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                        <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: item.color }} />
                                        <Text style={{ fontSize: 13, color: Colors.muted }}>{item.name}</Text>
                                    </View>
                                    <Text style={{ fontSize: 13, fontWeight: "700", color: item.color }}>{item.value}%</Text>
                                </View>
                                <ProgressBar value={item.value} color={item.color} height={6} />
                            </View>
                        ))}
                    </View>
                </Card>
            </View>

            {/* Asistencia diaria + Ranking por curso */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 4 }}>Asistencia por día</Text>
                    <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 16 }}>Esta semana</Text>
                    <DailyBars data={mockAttendanceByDay} />
                </Card>

                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text, marginBottom: 4 }}>Ranking por curso</Text>
                    <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 16 }}>Asistencia promedio</Text>
                    <View style={{ gap: 14 }}>
                        {mockCourseAttendance.map((item, rank) => {
                            const course = mockCourses.find(c => c.code === item.course);
                            const color = item.rate >= 85 ? "#10B981" : "#F59E0B";
                            return (
                                <View key={item.course} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                    <View style={{
                                        width: 22, height: 22, borderRadius: 11,
                                        backgroundColor: rank === 0 ? "#F59E0B" : Colors.border,
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Text style={{ fontSize: 11, fontWeight: "700", color: rank === 0 ? "#fff" : Colors.muted }}>{rank + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                            <Text style={{ fontSize: 12, fontWeight: "500", color: Colors.text, flex: 1 }} numberOfLines={1}>
                                                {course?.name || item.course}
                                            </Text>
                                            <Text style={{ fontSize: 12, fontWeight: "700", color, marginLeft: 8 }}>{item.rate}%</Text>
                                        </View>
                                        <ProgressBar value={item.rate} color={color} height={4} />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </Card>
            </View>

            {/* Estudiantes en riesgo */}
            <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text }}>Estudiantes en riesgo</Text>
                        <Text style={{ fontSize: 12, color: Colors.muted }}>Asistencia por debajo del 75%</Text>
                    </View>
                    <UIButton variant="danger" size="sm">Notificar a todos</UIButton>
                </View>

                {atRiskStudents.length === 0 ? (
                    <Text style={{ fontSize: 13, color: Colors.muted, textAlign: "center", paddingVertical: 24 }}>
                        No hay estudiantes en riesgo actualmente
                    </Text>
                ) : (
                    <View style={{ gap: 10 }}>
                        {atRiskStudents.map(student => (
                            <View key={student.id} style={{
                                flexDirection: "row", alignItems: "center", gap: 12,
                                padding: 12, backgroundColor: "#FEE2E2", borderRadius: 8,
                            }}>
                                <View style={{
                                    width: 36, height: 36, borderRadius: 18,
                                    backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center",
                                }}>
                                    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                                        {student.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.text }}>{student.name}</Text>
                                    <Text style={{ fontSize: 11, color: Colors.muted }}>{student.course} · {student.grade}</Text>
                                </View>
                                <Badge variant="danger">{student.attendance}%</Badge>
                                <UIButton variant="ghost" size="sm">Notificar</UIButton>
                            </View>
                        ))}
                    </View>
                )}
            </Card>
        </ScrollView>
    );
}
