// ============================================================
//  FaceAttend EDU — Reports Components (View Layer)
//  Toda lógica en useReportsViewModel.
// ============================================================

import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, PageHeader, UIButton, ProgressBar, StatCard } from "../ui/UI";
import { Avatar }        from "../ui/UI";
import { useTheme }      from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";
import { useReportsViewModel, PERIOD_OPTIONS } from "../../../viewmodels/useReportsViewModel";
import { useTranslation }                              from "../../../i18n/hooks/useTranslation";
import type { DailyAttendance, WeeklyAttendance } from "../../../models/types";

// ── WeeklySparkline ──────────────────────────────────────────

function WeeklySparkline({ data }: { data: WeeklyAttendance[] }) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{ gap: 8 }}>
            {data.map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ fontSize: 10, color: c.text.secondary, width: 44 }}>{item.week}</Text>
                    <View style={{ flex: 1, height: 6, backgroundColor: c.border.primary, borderRadius: 99 }}>
                        <View style={{
                            height: "100%", width: `${item.rate}%` as any,
                            backgroundColor: c.brand.primary, borderRadius: 99,
                        }} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: c.text.primary, width: 36, textAlign: "right" }}>
                        {item.rate}%
                    </Text>
                </View>
            ))}
        </View>
    );
}

// ── DailyBars ────────────────────────────────────────────────

function DailyBars({ data }: { data: DailyAttendance[] }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;
    return (
        <View style={{ gap: 10 }}>
            {data.map(item => (
                <View key={item.day} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary, width: 32 }}>
                        {item.day}
                    </Text>
                    <View style={{
                        flex: 1, flexDirection: "row", height: 10,
                        borderRadius: 5, overflow: "hidden",
                        backgroundColor: c.border.primary,
                    }}>
                        <View style={{ flex: item.present, backgroundColor: c.states.success }} />
                        <View style={{ flex: item.late,    backgroundColor: c.states.warning }} />
                        <View style={{ flex: item.absent,  backgroundColor: c.states.danger  }} />
                    </View>
                    <Text style={{ fontSize: 11, color: c.text.secondary, width: 70, textAlign: "right" }}>
                        {item.present}P · {item.absent}A
                    </Text>
                </View>
            ))}
            <View style={{ flexDirection: "row", gap: 14, marginTop: 4 }}>
                {[
                    [c.states.success, t("Presentes")],
                    [c.states.warning, t("Tardanzas")],
                    [c.states.danger,  t("Ausentes") ],
                ].map(([color, label]) => (
                    <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
                        <Text style={{ fontSize: 11, color: c.text.secondary }}>{label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ── ReportsView ──────────────────────────────────────────────

export default function ReportsView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useReportsViewModel();
    const { t }       = useTranslation();

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            <PageHeader
                title={t("Reportes y estadísticas")}
                subtitle={t("Análisis de asistencia por período académico")}
                actions={<>
                    <UIButton variant="ghost" size="sm">{t("Filtros")}</UIButton>
                    <UIButton variant="ghost" size="sm">{t("Exportar PDF")}</UIButton>
                    <UIButton variant="primary" size="sm">{t("Exportar Excel")}</UIButton>
                </>}
            />

            {/* Selector de período */}
            <Card padding={14}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Feather name="calendar" size={14} color={c.text.secondary} />
                        <Text style={{ fontSize: 13, fontWeight: "500", color: c.text.secondary }}>{t("Período:")}</Text>
                    </View>
                    {PERIOD_OPTIONS.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => vm.setPeriod(opt.value)}
                            style={{
                                paddingVertical: 6, paddingHorizontal: 14, borderRadius: 99,
                                backgroundColor: vm.period === opt.value ? c.brand.primary : c.interactive.disabled,
                            }}
                        >
                            <Text style={{
                                fontSize: 12,
                                fontWeight: vm.period === opt.value ? "600" : "400",
                                color: vm.period === opt.value ? c.text.onBrand : c.text.secondary,
                            }}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>

            {/* Stats */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {vm.stats.map(stat => (
                    <View key={stat.label} style={{ flexBasis: isSmall ? "47%" : "23%", flexGrow: 1 }}>
                        <StatCard
                            label={stat.label} value={stat.value}
                            change={stat.change} changeLabel={stat.changeLabel}
                            color={stat.color}
                            icon={<Feather name={stat.icon as any} size={18} color={stat.color} />}
                        />
                    </View>
                ))}
            </View>

            {/* Evolución + Distribución */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                        {t("Evolución de asistencia")}
                    </Text>
                    <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>
                        {t("Porcentaje por semana")}
                    </Text>
                    <WeeklySparkline data={vm.attendanceByWeek} />
                </Card>

                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                        Distribución
                    </Text>
                    <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>
                        {t("Estado de asistencia")}
                    </Text>
                    <View style={{ gap: 14 }}>
                        {vm.distribution.map(item => (
                            <View key={item.name} style={{ gap: 6 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                        <View style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: item.color }} />
                                        <Text style={{ fontSize: 13, color: c.text.secondary }}>{item.name}</Text>
                                    </View>
                                    <Text style={{ fontSize: 13, fontWeight: "700", color: item.color }}>
                                        {item.value}%
                                    </Text>
                                </View>
                                <ProgressBar value={item.value} color={item.color} height={6} />
                            </View>
                        ))}
                    </View>
                </Card>
            </View>

            {/* Asistencia diaria + Ranking */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 16 }}>
                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                        Asistencia por día
                    </Text>
                    <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>{t("Esta semana")}</Text>
                    <DailyBars data={vm.attendanceByDay} />
                </Card>

                <Card style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                        Ranking por curso
                    </Text>
                    <Text style={{ fontSize: 12, color: c.text.secondary, marginBottom: 16 }}>
                        {t("Asistencia promedio")}
                    </Text>
                    <View style={{ gap: 14 }}>
                        {vm.courseRanking.map(item => (
                            <View key={item.code} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                <View style={{
                                    width: 22, height: 22, borderRadius: 11,
                                    backgroundColor: item.rank === 1 ? c.states.warning : c.interactive.disabled,
                                    alignItems: "center", justifyContent: "center",
                                }}>
                                    <Text style={{
                                        fontSize: 11, fontWeight: "700",
                                        color: item.rank === 1 ? c.text.onBrand : c.text.secondary,
                                    }}>
                                        {item.rank}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                                        <Text style={{
                                            fontSize: 12, fontWeight: "500",
                                            color: c.text.primary, flex: 1,
                                        }} numberOfLines={1}>
                                            {item.courseName}
                                        </Text>
                                        <Text style={{ fontSize: 12, fontWeight: "700", color: item.barColor, marginLeft: 8 }}>
                                            {item.rate}%
                                        </Text>
                                    </View>
                                    <ProgressBar value={item.rate} color={item.barColor} height={4} />
                                </View>
                            </View>
                        ))}
                    </View>
                </Card>
            </View>

            {/* {t("Estudiantes en riesgo")} */}
            <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <View>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary }}>
                            {t("Estudiantes en riesgo")}
                        </Text>
                        <Text style={{ fontSize: 12, color: c.text.secondary }}>
                            {t("Asistencia por debajo del 75%")}
                        </Text>
                    </View>
                    <UIButton variant="danger" size="sm">{t("Notificar a todos")}</UIButton>
                </View>

                {vm.atRiskStudents.length === 0 ? (
                    <Text style={{ fontSize: 13, color: c.text.secondary, textAlign: "center", paddingVertical: 24 }}>
                        {t("No hay estudiantes en riesgo actualmente")}
                    </Text>
                ) : (
                    <View style={{ gap: 10 }}>
                        {vm.atRiskStudents.map(student => (
                            <View key={student.id} style={{
                                flexDirection: "row", alignItems: "center", gap: 12,
                                padding: 12, backgroundColor: c.states.dangerLight, borderRadius: 8,
                            }}>
                                <Avatar name={student.name} size={36} color={c.states.danger} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary }}>
                                        {student.name}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                        {student.course} · {student.grade}
                                    </Text>
                                </View>
                                <Badge variant="danger">{student.attendance}%</Badge>
                                <UIButton variant="ghost" size="sm">{t("Notificar")}</UIButton>
                            </View>
                        ))}
                    </View>
                )}
            </Card>
        </ScrollView>
    );
}
