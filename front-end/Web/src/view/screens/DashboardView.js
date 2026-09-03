// ============================================================
//  FaceAttend EDU � Dashboard View (View Layer)
//  Toda l�gica en useDashboardViewModel.
//  El bot�n "Tomar asistencia" solo lo ven admin y teacher.
// ============================================================

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, StatCard, Badge, Button, ProgressBar, AttendanceStatusIcon, AttendanceStatusBadge } from "../components/common";
import { Navbar as PageHeader } from "../components/common/navigation/Navbar";
import { useTheme }              from "../components/hooks/useTheme";
import { useResponsive }         from "../components/hooks/useResponsive";
import { useDashboardViewModel } from "../../viewmodels/useDashboardViewModel";
import { useRolePermissions }    from "../hooks/useRolePermissions";
import { useTranslation }        from "../../i18n/hooks/useTranslation";

// -- DailyBarChart --------------------------------------------

export function DailyBarChart({ data }) {
    const { theme } = useTheme();
    const c = theme.colors;
    const maxVal = Math.max(...data.flatMap(d => [d.present, d.late, d.absent]));
    const HEIGHT = 100;

    return (
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: HEIGHT + 20 }}>
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
                                borderRadius: 14,
                            }} />
                        ))}
                    </View>
                    <Text style={{ fontSize: 11, color: c.text.secondary }}>{item.day}</Text>
                </View>
            ))}
        </View>
    );
}

// -- WeeklyTrend ----------------------------------------------

export function WeeklyTrend({ data }) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View style={{ gap: 6 }}>
            {data.slice(-5).map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ fontSize: 11, color: c.text.secondary, width: 42 }}>{item.week}</Text>
                    <View style={{ flex: 1, height: 5, backgroundColor: c.border.primary, borderRadius: 99 }}>
                        <View style={{
                            height: "100%",
                            width: `${item.rate}%`,
                            backgroundColor: c.brand.primary,
                            borderRadius: 14,
                        }} />
                    </View>
                    <Text style={{
                        fontSize: 10,
                        fontWeight: "700",
                        color: c.text.primary,
                        width: 40,
                        textAlign: "right",
                    }}>
                        {item.rate}%
                    </Text>
                </View>
            ))}
        </View>
    );
}

// -- DashboardView --------------------------------------------

export default function DashboardView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useDashboardViewModel();
    const { t }       = useTranslation();
    const permissions = useRolePermissions();

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            <PageHeader
                title={t("Dashboard")}
                subtitle={vm.todayLabel}
                actions={
                    /* Solo admin y teacher pueden tomar asistencia */
                    permissions.canRegisterFace
                        ? <Button variant="primary" size="sm">{t("Tomar asistencia")}</Button>
                        : undefined
                }
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
                            icon={<Feather name={stat.icon} size={20} color={stat.color} />}
                        />
                    </View>
                ))}
            </View>

            {/* Gr�ficas � solo si puede ver reportes */}
            {permissions.canViewReports && (
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                    <Card style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                            {t("Tendencia semanal")}
                        </Text>
                        <Text style={{ fontSize: 11, color: c.text.secondary, marginBottom: 16 }}>
                            {t("�ltimas 5 semanas")}
                        </Text>
                        <WeeklyTrend data={vm.attendanceByWeek} />
                    </Card>

                    <Card style={{ flex: 1 }}>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                            {t("Asistencia por d�a")}
                        </Text>
                        <Text style={{ fontSize: 11, color: c.text.secondary, marginBottom: 16 }}>
                            {t("Esta semana � Presentes / Tardanzas / Ausentes")}
                        </Text>
                        <DailyBarChart data={vm.attendanceByDay} />
                        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                            {[
                                [c.states.success, t("Presentes")],
                                [c.states.warning, t("Tardanzas")],
                                [c.states.danger,  t("Ausentes") ],
                            ].map(([color, label]) => (
                                <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 14, backgroundColor: color }} />
                                    <Text style={{ fontSize: 11, color: c.text.secondary }}>{label}</Text>
                                </View>
                            ))}
                        </View>
                    </Card>
                </View>
            )}

            {/* Asistencia por curso + Actividad reciente */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.primary, marginBottom: 16 }}>
                        {t("Asistencia por curso")}
                    </Text>
                    <View style={{ gap: 14 }}>
                        {vm.courseAttendance.map(item => (
                            <View key={item.course}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                                    <Text style={{
                                        fontSize: 10,
                                        fontWeight: "500",
                                        color: c.text.primary,
                                        flex: 1,
                                    }} numberOfLines={1}>
                                        {item.courseName}
                                    </Text>
                                    <Text style={{ fontSize: 10, fontWeight: "700", color: item.barColor, marginLeft: 8 }}>
                                        {item.rate}%
                                    </Text>
                                </View>
                                <ProgressBar value={item.rate} color={item.barColor} />
                            </View>
                        ))}
                    </View>
                </Card>

                <Card style={isSmall ? undefined : { width: 300 }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.primary, marginBottom: 16 }}>
                        {t("Actividad reciente")}
                    </Text>
                    <View style={{ gap: 12 }}>
                        {vm.recentActivity.map(item => (
                            <View key={item.id} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                                <View style={{ marginTop: 2 }}>
                                    <AttendanceStatusIcon status={item.status} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.primary }}>
                                        {item.student}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                        {item.course} � {item.time}
                                    </Text>
                                </View>
                                <AttendanceStatusBadge status={item.status} />
                            </View>
                        ))}
                    </View>
                    {/* Enlace a reportes completos solo para quienes pueden verlos */}
                    {permissions.canViewAllReports && (
                        <View style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTopWidth: 1,
                            borderTopColor: c.border.primary,
                        }}>
                            <TouchableOpacity>
                                <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "500" }}>
                                    {t("Ver toda la actividad")} ?
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card>
            </View>
        </ScrollView>
    );
}
