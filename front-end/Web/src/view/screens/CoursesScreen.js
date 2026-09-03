// ============================================================
//  FaceAttend EDU — Courses View (View Layer)
//  Toda lógica en useCoursesViewModel.
//  Gestión (crear, editar) solo visible para admin.
// ============================================================

import React from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, Modal, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, Button, ProgressBar, EmptyState, useAttendanceColor, ATTENDANCE_THRESHOLDS } from "../components/common";
import { Navbar as PageHeader } from "../components/common/navigation/Navbar";
import { useTheme }             from "../components/hooks/useTheme";
import { useResponsive }        from "../components/hooks/useResponsive";
import { useCoursesViewModel }  from "../../viewmodels/useCoursesViewModel";
import { useRolePermissions }   from "../hooks/useRolePermissions";
import { useTranslation }       from "../../i18n/hooks/useTranslation";

// -- CourseDetailModal ----------------------------------------

function CourseDetailModal({
    course,
    onClose,
    canManage,
}) {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c         = theme.colors;

    if (!course) return null;

    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: c.background.overlay,
                    justifyContent: "center", alignItems: "center", padding: 20,
                }}
                onPress={onClose}
                activeOpacity={1}
            >
                <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                    <View style={{
                        backgroundColor: c.background.surface,
                        borderRadius: 14, width: 500, overflow: "hidden",
                        shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, elevation: 5,
                    }}>
                        <View style={{ height: 5, backgroundColor: course.color }} />
                        <View style={{ padding: 24 }}>
                            <View style={{
                                flexDirection: "row", justifyContent: "space-between",
                                alignItems: "flex-start", marginBottom: 20,
                            }}>
                                <View>
                                    <Text style={{ fontSize: 10, fontWeight: "700", color: course.color, letterSpacing: 1 }}>
                                        {course.code}
                                    </Text>
                                    <Text style={{ fontSize: 10, fontWeight: "700", color: c.text.primary, marginTop: 4 }}>
                                        {course.name}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={onClose}>
                                    <Feather name="x" size={18} color={c.text.secondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                                {[
                                    { label: t("Docente"),     value: course.professor },
                                    { label: t("Semestre"),    value: course.semester  },
                                    { label: t("Horario"),     value: course.schedule  },
                                    { label: t("Aula"),        value: course.room      },
                                    { label: t("Estudiantes"), value: `${course.students} ${t("inscritos")}` },
                                    { label: t("Asistencia"),  value: `${course.avgAttendance}%`             },
                                ].map(({ label, value }) => (
                                    <View key={label} style={{
                                        width: "47%",
                                        backgroundColor: c.background.app,
                                        borderRadius: 14, padding: 12,
                                    }}>
                                        <Text style={{ fontSize: 11, color: c.text.secondary, marginBottom: 4 }}>
                                            {label}
                                        </Text>
                                        <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.primary }}>
                                            {value}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end" }}>
                                <Button variant="ghost" onPress={onClose}>{t("Cerrar")}</Button>
                                {canManage && (
                                    <Button variant="primary">{t("Editar curso")}</Button>
                                )}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

// -- CourseCard -----------------------------------------------

function CourseCard({ course, onPress }) {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c         = theme.colors;
    const barColor  = useAttendanceColor(course.avgAttendance);

    return (
        <TouchableOpacity onPress={onPress} style={{ flex: 1, minWidth: 260 }}>
            <Card padding={0} style={{ overflow: "hidden", height: "100%" }}>
                <View style={{ height: 5, backgroundColor: course.color }} />
                <View style={{ padding: 16, flex: 1 }}>
                    <View style={{
                        flexDirection: "row", justifyContent: "space-between",
                        alignItems: "flex-start", marginBottom: 12,
                    }}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: course.color, letterSpacing: 1 }}>
                            {course.code}
                        </Text>
                        <Badge variant="primary">{course.semester}</Badge>
                    </View>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: c.text.primary, marginBottom: 8, lineHeight: 20 }}>
                        {course.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.text.secondary, marginBottom: 14 }}>
                        {course.professor}
                    </Text>

                    <View style={{ gap: 8, marginBottom: 14 }}>
                        {[
                            { icon: "users",   text: `${course.students} ${t("estudiantes")}` },
                            { icon: "clock",   text: course.schedule                           },
                            { icon: "map-pin", text: course.room                               },
                        ].map(({ icon, text }) => (
                            <View key={icon} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Feather name={icon} size={13} color={c.text.secondary} />
                                <Text style={{ fontSize: 11, color: c.text.secondary }}>{text}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={{ marginTop: "auto" }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                            <Text style={{ fontSize: 11, color: c.text.secondary }}>{t("Asistencia promedio")}</Text>
                            <Text style={{ fontSize: 10, fontWeight: "700", color: barColor }}>
                                {course.avgAttendance}%
                            </Text>
                        </View>
                        <ProgressBar value={course.avgAttendance} color={barColor} height={5} />
                    </View>
                </View>

                <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: c.border.primary }}>
                    <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center",
                        justifyContent: "center", gap: 6, padding: 12,
                    }}>
                        <Feather name="bar-chart-2" size={13} color={c.text.secondary} />
                        <Text style={{ fontSize: 11, color: c.text.secondary }}>{t("Reportes")}</Text>
                    </TouchableOpacity>
                    <View style={{ width: 1, backgroundColor: c.border.primary }} />
                    <TouchableOpacity style={{ flex: 1, flexDirection: "row", alignItems: "center",
                        justifyContent: "center", gap: 6, padding: 12,
                    }}>
                        <Feather name="users" size={13} color={c.brand.primary} />
                        <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "600" }}>
                            {t("Estudiantes")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Card>
        </TouchableOpacity>
    );
}

// -- CoursesView ----------------------------------------------

export default function CoursesView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useCoursesViewModel();
    const { t }       = useTranslation();
    const permissions = useRolePermissions();

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <PageHeader
                    title={t("Cursos")}
                    subtitle={`${vm.filtered.length} ${t("cursos activos este semestre")}`}
                    actions={
                        <React.Fragment>
                        {/* Solo admin puede gestionar cursos */}
                        {permissions.canManageCourses && (
                            <React.Fragment>
                                <Button variant="ghost" size="sm">{t("Importar")}</Button>
                                <Button variant="primary" size="sm">+ {t("Nuevo curso")}</Button>
                            </React.Fragment>
                        )}
                    </React.Fragment>}
                />

                {/* Búsqueda */}
                <View style={{ maxWidth: 400, position: "relative", justifyContent: "center" }}>
                    <View style={{ position: "absolute", left: 14, zIndex: 1 }}>
                        <Feather name="search" size={14} color={c.text.secondary} />
                    </View>
                    <TextInput
                        placeholder={t("Buscar curso o código...")}
                        value={vm.search}
                        onChangeText={vm.setSearch}
                        style={{
                            height: 40, borderWidth: 1, borderColor: c.border.primary,
                            borderRadius: 14, paddingLeft: 40, paddingRight: 14,
                            fontSize: 13, backgroundColor: c.background.surface,
                            color: c.text.primary,
                        }}
                        placeholderTextColor={c.text.disabled}
                    />
                </View>

                {/* Mini stats */}
                <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                    {[
                        { label: t("Total cursos"),     value: vm.courses.length,      color: c.brand.primary  },
                        { label: t("Estudiantes"),      value: vm.totalStudents,       color: c.states.success },
                        { label: t("Asistencia prom."), value: `${vm.avgAttendance}%`, color: "#8B5CF6"        },
                        { label: t("Con alerta"),       value: vm.alertCount,          color: c.states.warning },
                    ].map(({ label, value, color }) => (
                        <Card key={label} style={{ flex: 1, minWidth: 140, alignItems: "center" }} padding={14}>
                            <Text style={{
                                fontSize: 10, fontWeight: "600", color: c.text.secondary,
                                textTransform: "uppercase", letterSpacing: 0.5,
                                marginBottom: 6, textAlign: "center",
                            }}>
                                {label}
                            </Text>
                            <Text style={{ fontSize: 10, fontWeight: "800", color }}>{value}</Text>
                        </Card>
                    ))}
                </View>

                {/* Grid */}
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
                        {vm.filtered.map(course => (
                            <View key={course.id} style={{ flexBasis: isSmall ? "100%" : "30%", flexGrow: 1 }}>
                                <CourseCard
                                    course={course}
                                    onPress={() => vm.selectCourse(course)}
                                />
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <CourseDetailModal
                course={vm.selected}
                onClose={vm.clearSelection}
                canManage={permissions.canManageCourses}
            />
        </View>
    );
}
