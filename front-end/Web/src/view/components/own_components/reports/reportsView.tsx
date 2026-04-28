// ============================================================
//  FaceAttend EDU — Reports View (React Native)
// ============================================================
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Card, Badge, PageHeader, UIButton, ProgressBar, StatCard } from "../ui/UI";
import Colors from "../../constants/colors";
import {
    mockAttendanceByWeek, mockAttendanceByDay,
    mockCourseAttendance, mockCourses, mockStudents,
} from "../../constants/mockData";

const atRiskStudents = mockStudents.filter(s => s.attendance < 75);

const PERIODS = [
    { value: "week",     label: "Esta semana" },
    { value: "month",    label: "Este mes"    },
    { value: "semester", label: "Semestre"    },
];

// Mini sparkline de barras
function Sparkline({ data }: { data: { week: string; rate: number }[] }) {
    const max = Math.max(...data.map(d => d.rate));
    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 60 }}>
            {data.map((item, i) => (
                <View key={i} style={{ flex: 1, alignItems: "center" }}>
                    <View style={{
                        width: "100%",
                        height: Math.max(4, (item.rate / max) * 50),
                        backgroundColor: i === data.length - 1 ? Colors.primary : Colors.primaryLight,
                        borderRadius: 3,
                        marginBottom: 3,
                    }} />
                    <Text style={{ fontSize: 9, color: Colors.muted }}>{item.week.replace("Sem ", "S")}</Text>
                </View>
            ))}
        </View>
    );
}

// Distribución circular simple (porcentajes)
const pieData = [
    { name: "A tiempo",  value: 72, color: "#10B981" },
    { name: "Tardanzas", value: 13, color: "#F59E0B" },
    { name: "Ausentes",  value: 15, color: "#EF4444" },
];

export default function ReportsView() {
    const [period, setPeriod] = useState("semester");

    return (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} showsVerticalScrollIndicator={false}>
            <PageHeader
                title="Reportes"
                subtitle="Análisis de asistencia por período académico"
                actions={<UIButton variant="ghost" size="sm">⬇ Exportar</UIButton>}
            />

            {/* Selector de período */}
            <Card padding={12}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {PERIODS.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => setPeriod(opt.value)}
                            style={{
                                flex: 1, paddingVertical: 8, borderRadius: 99, alignItems: "center",
                                backgroundColor: period === opt.value ? Colors.primary : Colors.border,
                            }}
                        >
                            <Text style={{ fontSize: 12, fontWeight: "600", color: period === opt.value ? "#fff" : Colors.muted }}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>

            {/* Stats resumen */}
            <View style={{ flexDirection: "row", gap: 12 }}>
                <StatCard label="Asistencia global"  value="85.4%"     change={1.2}  changeLabel="vs período ant." color={Colors.primary}  />
                <StatCard label="Total registros"     value="2,847"     change={5.8}  changeLabel="vs período ant." color="#10B981"         />
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
                <StatCard label="Tardanzas"           value="324"       change={-3.1} changeLabel="vs período ant." color="#F59E0B"         />
                <StatCard label="En riesgo"           value={atRiskStudents.length}                                 color="#EF4444"         />
            </View>

            {/* Tendencia semanal */}
            <Card>
                <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 4, color: Colors.text }}>
                    Evolución de asistencia
                </Text>
                <Text style={{ fontSize: 12, color: Colors.muted, marginBottom: 16 }}>Últimas 8 semanas</Text>
                <Sparkline data={mockAttendanceByWeek} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                    <Text style={{ fontSize: 11, color: Colors.muted }}>Mín: {Math.min(...mockAttendanceByWeek.map(d => d.rate))}%</Text>
                    <Text style={{ fontSize: 11, color: Colors.muted }}>Máx: {Math.max(...mockAttendanceByWeek.map(d => d.rate))}%</Text>
                </View>
            </Card>

            {/* Distribución */}
            <Card>
                <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 16, color: Colors.text }}>
                    Distribución de asistencia
                </Text>
                <View style={{ gap: 12 }}>
                    {pieData.map(item => (
                        <View key={item.name} style={{ gap: 6 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                    <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: item.color }} />
                                    <Text style={{ fontSize: 13, color: Colors.text }}>{item.name}</Text>
                                </View>
                                <Text style={{ fontSize: 13, fontWeight: "700", color: item.color }}>{item.value}%</Text>
                            </View>
                            <ProgressBar value={item.value} color={item.color} />
                        </View>
                    ))}
                </View>
            </Card>

            {/* Ranking por curso */}
            <Card>
                <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 16, color: Colors.text }}>
                    Ranking por curso
                </Text>
                <View style={{ gap: 14 }}>
                    {mockCourseAttendance.map((item, rank) => {
                        const course = mockCourses.find(c => c.code === item.course);
                        const color = item.rate >= 85 ? "#10B981" : "#F59E0B";
                        return (
                            <View key={item.course} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                <View style={{
                                    width: 24, height: 24, borderRadius: 12,
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

            {/* Asistencia diaria */}
            <Card>
                <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 16, color: Colors.text }}>
                    Asistencia por día (esta semana)
                </Text>
                <View style={{ gap: 10 }}>
                    {mockAttendanceByDay.map(item => (
                        <View key={item.day} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.text, width: 36 }}>{item.day}</Text>
                            <View style={{ flex: 1, gap: 4 }}>
                                <View style={{ flexDirection: "row", gap: 4 }}>
                                    <View style={{ height: 8, flex: item.present, backgroundColor: "#10B981", borderRadius: 2 }} />
                                    <View style={{ height: 8, flex: item.late, backgroundColor: "#F59E0B", borderRadius: 2 }} />
                                    <View style={{ height: 8, flex: item.absent, backgroundColor: "#EF4444", borderRadius: 2 }} />
                                </View>
                            </View>
                            <Text style={{ fontSize: 11, color: Colors.muted, width: 60, textAlign: "right" }}>
                                {item.present}P · {item.absent}A
                            </Text>
                        </View>
                    ))}
                </View>
                <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
                    {[["#10B981","Presentes"],["#F59E0B","Tardanzas"],["#EF4444","Ausentes"]].map(([color, label]) => (
                        <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
                            <Text style={{ fontSize: 11, color: Colors.muted }}>{label}</Text>
                        </View>
                    ))}
                </View>
            </Card>

            {/* Estudiantes en riesgo */}
            <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.text }}>Estudiantes en riesgo</Text>
                        <Text style={{ fontSize: 12, color: Colors.muted }}>Asistencia por debajo del 75%</Text>
                    </View>
                    <UIButton variant="danger" size="sm">Notificar</UIButton>
                </View>

                {atRiskStudents.length === 0 ? (
                    <Text style={{ fontSize: 13, color: Colors.muted, textAlign: "center", paddingVertical: 24 }}>
                        ✅ No hay estudiantes en riesgo
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
                                    <Text style={{ fontSize: 11, color: Colors.muted }}>{student.course}</Text>
                                </View>
                                <Badge variant="danger">{student.attendance}%</Badge>
                            </View>
                        ))}
                    </View>
                )}
            </Card>
        </ScrollView>
    );
}
