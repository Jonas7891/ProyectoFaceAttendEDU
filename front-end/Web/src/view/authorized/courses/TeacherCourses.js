// ============================================================
//  FaceAttend EDU — TeacherCourses
//
//  Vista de fichas para instructores: solo las fichas donde el
//  profesor es el instructor asignado (instructorActorIds),
//  sin acciones de gestión (crear/importar son solo de admin).
// ============================================================

import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Card, EmptyState } from "../../components/common";
import { useTheme } from "../../components/hooks/useTheme";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useCoursesViewModel } from "../../../viewmodels/useCoursesViewModel";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { CourseCard } from "./AdminCourses";
import { CourseDetailModal } from "./modals";

export function TeacherCourses({ vm: vmProp }) {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const vmLocal = useCoursesViewModel();
    const vm = vmProp || vmLocal;
    const { t } = useTranslation();
    const navigation = useNavigation();

    const handleNavigateToStudents = React.useCallback(
        (course) => {
            navigation.navigate("Users", {
                section: "students",
                searchQuery: course.code,
                sortBy: "name",
                sortOrder: "asc",
                filterColumn: "name",
            });
        },
        [navigation]
    );

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    const statCards = [
        { label: t("Mis fichas"), value: vm.myStats.total, color: c.brand.primary, icon: "book-open" },
        { label: t("Mis estudiantes"), value: vm.myStats.totalStudents, color: c.status.success, icon: "users" },
        { label: t("Asistencia prom."), value: `${vm.myStats.avgAttendance}%`, color: c.brand.primary, icon: "percent" },
        { label: t("Con alerta"), value: vm.myStats.alertCount, color: c.status.warning, icon: "alert-triangle" },
    ];

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Mini stats de mis fichas */}
            <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                {statCards.map(({ label, value, color, icon }) => (
                    <View
                        key={label}
                        style={{
                            flexBasis: isSmall ? "47%" : "23%",
                            flexGrow: 1,
                            backgroundColor: c.background.surface,
                            borderRadius: 12,
                            padding: 14,
                            gap: 6,
                            borderWidth: 1,
                            borderColor: c.border.primary + "40",
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Feather name={icon} size={14} color={color} />
                            <Text
                                style={{
                                    fontSize: 11,
                                    fontWeight: "600",
                                    color: c.text.secondary,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.3,
                                }}
                            >
                                {label}
                            </Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: "800", color: c.text.primary }}>{value}</Text>
                    </View>
                ))}
            </View>

            {/* Grid de mis fichas */}
            {vm.myFiltered.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<Feather name="book-open" size={40} color={c.text.secondary} />}
                        title={t("Sin fichas asignadas")}
                        description={t("Aún no tienes fichas asignadas como instructor")}
                    />
                </Card>
            ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                    {vm.myFiltered.map((course) => (
                        <View key={course.id} style={{ flexBasis: isSmall ? "100%" : "30%", flexGrow: 1 }}>
                            <CourseCard
                                course={course}
                                onPress={() => vm.selectCourse(course)}
                                onStudentsPress={handleNavigateToStudents}
                            />
                        </View>
                    ))}
                </View>
            )}

            {/* Modal de detalle (solo lectura: canManage=false) */}
            <CourseDetailModal course={vm.selected} onClose={vm.clearSelection} canManage={false} />
        </ScrollView>
    );
}

export default TeacherCourses;
