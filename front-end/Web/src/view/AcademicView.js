// ============================================================
//  FaceAttend EDU — Academic VIEW (Presentation Layer)
//
//  RESPONSABILIDAD: Sección académica en modo solo lectura
//  (nav-map /academic): programas, períodos, fichas y cursos.
//
//  Toda la lógica de negocio está en useAcademicViewModel.
// ============================================================

import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Alert, Badge, Card, EmptyState, PageHeader } from "./components/common";
import { useTheme } from "./components/hooks/useTheme";
import { useResponsive } from "./components/hooks/useResponsive";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useAcademicViewModel } from "../viewmodels/useAcademicViewModel";

function SectionTitle({ icon, title, count }) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Feather name={icon} size={16} color={c.brand.primary} />
            <Text style={{ fontSize: 16, fontWeight: "800", color: c.text.primary }}>{title}</Text>
            {count != null && (
                <Text style={{ fontSize: 13, color: c.text.secondary }}>({count})</Text>
            )}
        </View>
    );
}

function Item({ title, subtitle, badge }) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <Card variant="outlined" style={{ flexBasis: 260, flexGrow: 1 }}>
            <View style={{ gap: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                    <Text style={{ fontWeight: "700", color: c.text.primary, flex: 1 }} numberOfLines={2}>
                        {title}
                    </Text>
                    {badge}
                </View>
                {subtitle ? (
                    <Text style={{ color: c.text.secondary, fontSize: 12 }}>{subtitle}</Text>
                ) : null}
            </View>
        </Card>
    );
}

export default function AcademicView() {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const { t } = useTranslation();
    const vm = useAcademicViewModel();

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    const isEmpty =
        vm.programs.length === 0 &&
        vm.periods.length === 0 &&
        vm.cohorts.length === 0 &&
        vm.courses.length === 0;

    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <PageHeader title={t("Sección académica")} subtitle={t("Estructura académica de tu sede")} />

            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {vm.error && <Alert type="error" title={t("No se pudo cargar")} message={vm.error} closable />}

                {isEmpty && !vm.error ? (
                    <EmptyState
                        icon="book-open"
                        title={t("Sin información académica")}
                        message={t("Aún no hay programas, períodos, fichas o cursos registrados")}
                    />
                ) : (
                    <>
                        {/* Programas */}
                        <View style={{ gap: 12 }}>
                            <SectionTitle icon="layers" title={t("Programas")} count={vm.programs.length} />
                            {vm.programs.length === 0 ? (
                                <Text style={{ color: c.text.secondary, fontSize: 13 }}>
                                    {t("Sin programas registrados")}
                                </Text>
                            ) : (
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                                    {vm.programs.map((program) => (
                                        <Item
                                            key={program.programId}
                                            title={program.name}
                                            subtitle={`${t("Código")}: ${program.code || "—"}`}
                                            badge={
                                                <Badge
                                                    variant={program.status === false ? "default" : "success"}
                                                    size="sm"
                                                >
                                                    {program.status === false ? t("Inactivo") : t("Activo")}
                                                </Badge>
                                            }
                                        />
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Períodos */}
                        <View style={{ gap: 12 }}>
                            <SectionTitle icon="calendar" title={t("Períodos académicos")} count={vm.periods.length} />
                            {vm.periods.length === 0 ? (
                                <Text style={{ color: c.text.secondary, fontSize: 13 }}>
                                    {t("Sin períodos registrados")}
                                </Text>
                            ) : (
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                                    {vm.periods.map((period) => (
                                        <Item
                                            key={period.academicPeriodId}
                                            title={period.name}
                                            subtitle={`${period.startsOn || "—"} → ${period.endsOn || "—"}`}
                                            badge={
                                                <Badge
                                                    variant={period.isActive ? "success" : "default"}
                                                    size="sm"
                                                    icon={period.isActive ? "check-circle" : undefined}
                                                >
                                                    {period.isActive ? t("Activo") : t("Cerrado")}
                                                </Badge>
                                            }
                                        />
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Fichas */}
                        <View style={{ gap: 12 }}>
                            <SectionTitle icon="users" title={t("Fichas")} count={vm.cohorts.length} />
                            {vm.cohorts.length === 0 ? (
                                <Text style={{ color: c.text.secondary, fontSize: 13 }}>
                                    {t("Sin fichas registradas")}
                                </Text>
                            ) : (
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                                    {vm.cohorts.map((cohort) => (
                                        <Item
                                            key={cohort.cohortId}
                                            title={cohort.code}
                                            subtitle={`${t("Programa")}: ${vm.programName(cohort.programId)}`}
                                            badge={
                                                <Badge variant={cohort.status === false ? "default" : "success"} size="sm">
                                                    {cohort.status === false ? t("Inactiva") : t("Activa")}
                                                </Badge>
                                            }
                                        />
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Cursos */}
                        <View style={{ gap: 12 }}>
                            <SectionTitle icon="book-open" title={t("Cursos")} count={vm.courses.length} />
                            {vm.courses.length === 0 ? (
                                <Text style={{ color: c.text.secondary, fontSize: 13 }}>
                                    {t("Sin cursos registrados")}
                                </Text>
                            ) : (
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                                    {vm.courses.map((course) => (
                                        <Item
                                            key={course.courseId}
                                            title={course.name}
                                            subtitle={`${t("Código")}: ${course.code || "—"} · ${t("Programa")}: ${vm.programName(
                                                course.programId
                                            )}`}
                                            badge={
                                                <Badge variant="info" size="sm">
                                                    {`${course.creditHours ?? "—"} ${t("créditos")}`}
                                                </Badge>
                                            }
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    );
}
