// ============================================================
//  FaceAttend EDU — Dashboard Components (View Layer)
//  Componentes de visualización. Toda lógica en useDashboardViewModel.
// ============================================================

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, StatCard, Badge, PageHeader, UIButton, ProgressBar } from "../ui/UI";
import { useTheme }      from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";
import { useDashboardViewModel } from "../../../viewmodels/useDashboardViewModel";
import type { DailyAttendance, WeeklyAttendance } from "../../../models/types";

// ── DailyBarChart ────────────────────────────────────────────

export function DailyBarChart({ data }: { data: DailyAttendance[] }) {
    const { theme } = useTheme();
    const c = theme.colors;
    const maxVal = Math.max(...data.flatMap(d => [d.present, d.late, d.absent]));
    const HEIGHT = 100;

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
                                width: 8,
                                height: Math.max(3, (val / maxVal) * HEIGHT),
                                backgroundColor: color,
                                borderRadius: 2,
                            }} />
                        ))}
                    </View>
                    <Text style={{ fontSize: 10, color: c.text.secondary }}>{item.day}</Text>
                </View>
            ))}
        </View>
    );
}

// ── WeeklyTrend ──────────────────────────────────────────────

export function WeeklyTrend({ data }: { data: WeeklyAttendance[] }) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View style={{ gap: 6 }}>
            {data.slice(-5).map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ fontSize: 10, color: c.text.secondary, width: 42 }}>{item.week}</Text>
                    <View style={{ flex: 1, height: 6, backgroundColor: c.border.primary, borderRadius: 99 }}>
                        <View style={{
                            height: "100%",
                            width: `${item.rate}%` as any,
                            backgroundColor: c.brand.primary,
                            borderRadius: 99,
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

// ── ActivityStatusIcon ───────────────────────────────────────

export function ActivityStatusIcon({ status }: { status: string }) {
    const { theme } = useTheme();
    const c = theme.colors;
    if (status === "on_time") return <Feather name="check-circle" size={16} color={c.states.success} />;
    if (status === "late")    return <Feather name="clock"        size={16} color={c.states.warning} />;
    return                           <Feather name="x-circle"     size={16} color={c.states.danger}  />;
}

export function ActivityBadge({ status }: { status: string }) {
    if (status === "on_time") return <Badge variant="success">A tiempo</Badge>;
    if (status === "late")    return <Badge variant="warning">Tardanza</Badge>;
    return                           <Badge variant="danger">Ausente</Badge>;
}

// ── DashboardView ────────────────────────────────────────────
// Vista principal — obtiene todo del ViewModel

export default function DashboardView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useDashboardViewModel();

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            <PageHeader
                title="Dashboard"
                subtitle={vm.todayLabel}
                actions={<UIButton variant="primary" size="sm">Tomar asistencia</UIButton>}
            />

            {/* Stat cards */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {vm.stats.map((stat) => (
                    <View key={stat.label} style={{ flexBasis: isSmall ? "47%" : "23%", flexGrow: 1 }}>
                        <StatCard
                            label={stat.label}
                            value={stat.value}
                            change={stat.change}
                            changeLabel={stat.changeLabel}
                            color={stat.color}
                            icon={<Feather name={stat.icon as any} size={20} color={stat.color} />}
                        />
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
                    <WeeklyTrend data={vm.attendanceByWeek} />
                </Card>

                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                        Asistencia por día
                    </Text>
                    <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>
                        Esta semana · Presentes / Tardanzas / Ausentes
                    </Text>
                    <DailyBarChart data={vm.attendanceByDay} />
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
                        {vm.courseAttendance.map(item => (
                            <View key={item.course}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                                    <Text style={{
                                        fontSize: 13, fontWeight: "500",
                                        color: c.text.primary, flex: 1,
                                    }} numberOfLines={1}>
                                        {item.courseName}
                                    </Text>
                                    <Text style={{ fontSize: 13, fontWeight: "700", color: item.barColor, marginLeft: 8 }}>
                                        {item.rate}%
                                    </Text>
                                </View>
                                <ProgressBar value={item.rate} color={item.barColor} />
                            </View>
                        ))}
                    </View>
                </Card>

                <Card style={isSmall ? undefined : { width: 300 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 16 }}>
                        Actividad reciente
                    </Text>
                    <View style={{ gap: 12 }}>
                        {vm.recentActivity.map(item => (
                            <View key={item.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                                <View style={{ marginTop: 2 }}>
                                    <ActivityStatusIcon status={item.status} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary }}>
                                        {item.student}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                        {item.course} · {item.time}
                                    </Text>
                                </View>
                                <ActivityBadge status={item.status} />
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
