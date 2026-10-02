// ============================================================
//  FaceAttend EDU — AdminCourses
//
//  Vista de gestión de cursos/fichas para administradores.
//  
//  Mantiene el diseño original de cards en grid.
//  Usa MVVM con useCoursesViewModel y componentes reutilizables.
//
//  Los modales están en /modals/
// ============================================================

import React from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, Button, ProgressBar, EmptyState, useAttendanceColor } from "../../components/common";
import { Navbar as PageHeader } from "../../components/common/navigation/Navbar";
import { useTheme } from "../../components/hooks/useTheme";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useCoursesViewModel } from "../../../viewmodels/useCoursesViewModel";
import { useRolePermissions } from "../../../viewmodels/useRolePermissions";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { CourseDetailModal, RegisterCourseModal, ImportCoursesModal } from "./modals";

// ── CourseCard (diseño original) ──────────────────────────

function CourseCard({ course, onPress }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;
    const barColor = useAttendanceColor(course.avgAttendance);

    return (
        <TouchableOpacity onPress={onPress} style={{ flex: 1, minWidth: 260 }}>
            <Card padding={0} style={{ overflow: "hidden", height: "100%" }}>
                <View style={{ height: 5, backgroundColor: course.color }} />
                <View style={{ padding: 16, flex: 1 }}>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 12,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 10,
                                fontWeight: "700",
                                color: course.color,
                                letterSpacing: 1,
                            }}
                        >
                            {course.code}
                        </Text>
                        <Badge variant="primary">{course.semester}</Badge>
                    </View>
                    <Text
                        style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: c.text.primary,
                            marginBottom: 8,
                            lineHeight: 20,
                        }}
                    >
                        {course.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.text.secondary, marginBottom: 14 }}>
                        {course.professor}
                    </Text>

                    <View style={{ gap: 8, marginBottom: 14 }}>
                        {[
                            { icon: "users", text: `${course.students} ${t("estudiantes")}` },
                            { icon: "clock", text: course.schedule },
                            { icon: "map-pin", text: course.room },
                        ].map(({ icon, text }) => (
                            <View
                                key={icon}
                                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                            >
                                <Feather name={icon} size={13} color={c.text.secondary} />
                                <Text style={{ fontSize: 11, color: c.text.secondary }}>{text}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ marginTop: "auto" }}>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: 6,
                            }}
                        >
                            <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                {t("Asistencia promedio")}
                            </Text>
                            <Text style={{ fontSize: 10, fontWeight: "700", color: barColor }}>
                                {course.avgAttendance}%
                            </Text>
                        </View>
                        <ProgressBar value={course.avgAttendance} color={barColor} height={5} />
                    </View>
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        borderTopWidth: 1,
                        borderTopColor: c.border.primary,
                    }}
                >
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: 12,
                        }}
                    >
                        <Feather name="bar-chart-2" size={13} color={c.text.secondary} />
                        <Text style={{ fontSize: 11, color: c.text.secondary }}>
                            {t("Reportes")}
                        </Text>
                    </TouchableOpacity>
                    <View style={{ width: 1, backgroundColor: c.border.primary }} />
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: 12,
                        }}
                    >
                        <Feather name="users" size={13} color={c.brand.primary} />
                        <Text
                            style={{
                                fontSize: 11,
                                color: c.brand.primary,
                                fontWeight: "600",
                            }}
                        >
                            {t("Estudiantes")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Card>
        </TouchableOpacity>
    );
}

// ── AdminCourses Component ────────────────────────────────

export function AdminCourses({ vm: vmProp }) {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const vmLocal = useCoursesViewModel();
    const vm = vmProp || vmLocal;
    const { t } = useTranslation();
    const permissions = useRolePermissions();

    const canManage = permissions.canManageCourses;

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Buscador + Métricas visuales (header superior) */}
            <View
                style={{
                    backgroundColor: c.background.surface,
                    borderRadius: 14,
                    padding: 16,
                    gap: 16,
                }}
            >
                {/* Búsqueda */}
                <View style={{ position: "relative", justifyContent: "center" }}>
                    <View style={{ position: "absolute", left: 14, zIndex: 1 }}>
                        <Feather name="search" size={16} color={c.text.secondary} />
                    </View>
                    <TextInput
                        placeholder={t("Buscar curso o código...")}
                        value={vm.search}
                        onChangeText={vm.setSearch}
                        style={{
                            height: 44,
                            borderWidth: 1,
                            borderColor: c.border.primary,
                            borderRadius: 10,
                            paddingLeft: 44,
                            paddingRight: 14,
                            fontSize: 14,
                            backgroundColor: c.background.app,
                            color: c.text.primary,
                        }}
                        placeholderTextColor={c.text.disabled}
                    />
                </View>

                {/* Métricas con barras de progreso */}
                <View style={{ flexDirection: "row", gap: 12 }}>
                    {/* Total Cursos */}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: "600",
                                color: c.text.secondary,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 6,
                            }}
                        >
                            {t("Total cursos")}
                        </Text>
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "800",
                                color: c.brand.primary,
                                marginBottom: 8,
                            }}
                        >
                            {vm.courses.length}
                        </Text>
                        <ProgressBar value={100} color={c.brand.primary} height={4} />
                    </View>

                    {/* Estudiantes */}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: "600",
                                color: c.text.secondary,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 6,
                            }}
                        >
                            {t("Estudiantes")}
                        </Text>
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "800",
                                color: c.status.success,
                                marginBottom: 8,
                            }}
                        >
                            {vm.totalStudents}
                        </Text>
                        <ProgressBar value={100} color={c.status.success} height={4} />
                    </View>

                    {/* Asistencia Promedio */}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: "600",
                                color: c.text.secondary,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 6,
                            }}
                        >
                            {t("Asistencia prom.")}
                        </Text>
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "800",
                                color: c.brand.primary,
                                marginBottom: 8,
                            }}
                        >
                            {vm.avgAttendance}%
                        </Text>
                        <ProgressBar value={vm.avgAttendance} color={c.brand.primary} height={4} />
                    </View>

                    {/* Con Alerta */}
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: "600",
                                color: c.text.secondary,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                marginBottom: 6,
                            }}
                        >
                            {t("Con alerta")}
                        </Text>
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "800",
                                color: c.status.warning,
                                marginBottom: 8,
                            }}
                        >
                            {vm.alertCount}
                        </Text>
                        <ProgressBar
                            value={vm.alertCount > 0 ? 100 : 0}
                            color={c.status.warning}
                            height={4}
                        />
                    </View>
                </View>
            </View>

            {/* Grid de cards */}
            {vm.filtered.length === 0 ? (
                <Card>
                    <EmptyState
                        icon={<Feather name="book-open" size={40} color={c.text.secondary} />}
                        title={t("Sin cursos")}
                        description={t("No se encontraron cursos con ese criterio")}
                    />
                </Card>
            ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                    {vm.filtered.map((course) => (
                        <View
                            key={course.id}
                            style={{ flexBasis: isSmall ? "100%" : "30%", flexGrow: 1 }}
                        >
                            <CourseCard
                                course={course}
                                onPress={() => vm.selectCourse(course)}
                            />
                        </View>
                    ))}
                </View>
            )}

            {/* Modales */}
            <CourseDetailModal
                course={vm.selected}
                onClose={vm.clearSelection}
                canManage={canManage}
            />

            {canManage && (
                <>
                    <RegisterCourseModal
                        visible={vm.showRegisterModal}
                        onClose={vm.closeRegisterModal}
                        onSubmit={vm.registerCourse}
                    />

                    <ImportCoursesModal
                        visible={vm.showImportModal}
                        onClose={vm.closeImportModal}
                        onImport={vm.importCourses}
                    />
                </>
            )}
        </ScrollView>
    );
}

export default AdminCourses;
