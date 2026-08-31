// ============================================================
//  FaceAttend EDU — Students View (View Layer)
//  Toda lógica en useStudentsViewModel.
//  Las acciones de gestión (crear, importar, editar) se
//  muestran condicionalmente según useRolePermissions.
// ============================================================

import React from "react";
import {
    View, Text, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
    Card, Badge, Avatar, PageHeader,
    UIButton, ProgressBar, EmptyState,
} from "../ui/UI";
import { AnimatedDropdown }       from "../ui/AnimatedDropdown";
import { useAttendanceColor }     from "../ui/AttendanceBadge";
import { useTheme }               from "../hooks/useTheme";
import { useResponsive }          from "../hooks/useResponsive";
import { useStudentsViewModel }   from "../../../viewmodels/useStudentsViewModel";
import { useRolePermissions }     from "../../hooks/useRolePermissions";
import { useTranslation }         from "../../../i18n/hooks/useTranslation";
import RegisterStudentModal       from "./RegisterStudentModal";
import ImportStudentsModal        from "./ImportStudentsModal";
import StudentDetailModal         from "./StudentDetailModal";
import { Student }           from "../../../models/types";

// ── StudentRow ───────────────────────────────────────────────

function StudentRow({
    student,
    onPress,
    isLast,
    canManage,
}: {
    student:   Student;
    onPress:   () => void;
    isLast:    boolean;
    canManage: boolean;
}) {
    const { t }       = useTranslation();
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const attColor    = useAttendanceColor(student.attendance);

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection:    "row",
                alignItems:       "center",
                paddingVertical,
                paddingHorizontal,
                borderBottomWidth: isLast ? 0,
                borderBottomColor: c.border.primary,
                gap: isSmall ? 12,
            }}
        >
            <View style={{ flex: isSmall ? 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Avatar name={student.name} size={32} />
                
                    <Text style={{ fontWeight: "600", fontSize: 11, color: c.text.primary }}>
                        {student.name}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.text.secondary }}>{student.code}</Text>
                </View>
            </View>

            {!isSmall && (
                
                    <Text style={{ flex: 1, fontSize: 11, color: c.text.secondary, paddingHorizontal: 14 }} numberOfLines={1}>
                        {student.email}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 11, color: c.text.primary, paddingHorizontal: 14 }} numberOfLines={1}>
                        {student.course}
                    </Text>
                    <View style={{ flex: 1, paddingHorizontal: 14 }}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color, marginBottom: 4 }}>
                            {student.attendance}%
                        </Text>
                        <ProgressBar value={student.attendance} color={attColor} height={4} />
                    </View>
                    {/* Columna Facial — solo para quienes pueden gestionar */}
                    {canManage && (
                        <View style={{ flex: 1, paddingHorizontal: 14 }}>
                            <Badge variant={student.registered ? "success" : "warning"}>
                                {student.registered ? t("Registrado") : t("Pendiente")}
                            </Badge>
                        </View>
                    )}
                    <View style={{ flex: 1, paddingHorizontal: 14 }}>
                        <Badge variant={student.status === "active" ? "success" : "default"}>
                            {student.status === "active" ? t("Activo") : t("Inactivo")}
                        </Badge>
                    </View>
                </>
            )}

            {isSmall && (
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: attColor }}>
                        {student.attendance}%
                    </Text>
                    {canManage && (
                        <Badge variant={student.registered ? "success" : "warning"}>
                            {student.registered ? t("Facial OK") : t("Pendiente")}
                        </Badge>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}

// ── StudentsView ─────────────────────────────────────────────

export default function StudentsView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useStudentsViewModel();
    const { t }       = useTranslation();
    const permissions = useRolePermissions();

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    // Columnas de la tabla según permisos
    const columns = [
        t("Estudiante"),
        t("Correo"),
        t("Programa"),
        t("Asistencia"),
        ...(permissions.canManageStudents ? [t("Facial")] : []),
        t("Estado"),
    ];

    // Ítems del dropdown de cursos
    const courseItems = [
        { value: "", label: t("Todos"), icon: "layers" },
        ...vm.courses.map(c => ({ value, label, icon: "book-open" })),
    ];

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                <PageHeader
                    title={t("Estudiantes")}
                    subtitle={`${vm.filtered.length} ${
                        vm.filtered.length !== 1 ? t("estudiantes") : t("estudiante")
                    } ${
                        vm.filtered.length !== 1 ? t("encontrados") : t("encontrado")
                    }`}
                    actions={
                        {/* Importar — solo admin */}
                        {permissions.canImportStudents && (
                            <UIButton variant="ghost" size="sm" onPress={vm.openImportModal}>
                                <Feather name="upload" size={13} color={c.text.secondary} />
                                {"  "}{t("Importar")}
                            </UIButton>
                        )}
                        {/* Nuevo estudiante — solo admin */}
                        {permissions.canManageStudents && (
                            <UIButton variant="primary" size="sm" onPress={vm.openRegisterModal}>
                                + {t("Nuevo estudiante")}
                            </UIButton>
                        )}
                    </>}
                />

                {/* Filtros */}
                <Card padding={14}>
                    <View style={{ flexDirection: isSmall ? "column" : "row", gap, flexWrap: "wrap" }}>
                        {/* Búsqueda */}
                        <View style={{ flex: 1, minWidth, position: "relative", justifyContent: "center" }}>
                            <View style={{ position: "absolute", left, zIndex: 1 }}>
                                <Feather name="search" size={14} color={c.text.secondary} />
                            </View>
                            <TextInput
                                placeholder={t("Buscar por nombre o código...")}
                                value={vm.search}
                                onChangeText={vm.setSearch}
                                style={{
                                    height, borderWidth, borderColor: c.border.primary,
                                    borderRadius: 14, paddingLeft, paddingRight,
                                    fontSize, backgroundColor: c.background.surface,
                                    color: c.text.primary,
                                }}
                                placeholderTextColor={c.text.disabled}
                            />
                        </View>

                        {/* Filtro por curso usando AnimatedDropdown reutilizable */}
                        <AnimatedDropdown
                            items={courseItems}
                            value={vm.courseFilter}
                            onSelect={vm.setCourseFilter}
                            triggerIcon="book-open"
                            style={{ minWidth: 160 }}
                        />
                    </View>
                </Card>

                {/* Tabla */}
                <Card padding={0}>
                    {!isSmall && (
                        <View style={{
                            flexDirection: "row",
                            padding: "10px 14px",
                            borderBottomWidth, borderBottomColor: c.border.primary,
                        }}>
                            {columns.map((col, idx) => (
                                <Text key={col} style={{
                                    flex: idx === 0 ? 2,
                                    fontSize: 10, fontWeight: "600", color: c.text.secondary,
                                    textTransform: "uppercase", letterSpacing: 0.5,
                                    paddingHorizontal,
                                }}>
                                    {col}
                                </Text>
                            ))}
                        </View>
                    )}

                    {vm.filtered.length === 0 ? (
                        <EmptyState
                            icon={<Feather name="users" size={40} color={c.text.secondary} />}
                            title={t("Sin resultados")}
                            description={t("Ajusta los filtros o agrega nuevos estudiantes")}
                        />
                    ) : vm.filtered.map((student, i) => (
                        <StudentRow
                            key={student.id}
                            student={student}
                            onPress={() => vm.selectStudent(student)}
                            isLast={i === vm.filtered.length - 1}
                            canManage={permissions.canManageStudents}
                        />
                    ))}
                </Card>
            </ScrollView>

            {/* Modales */}
            <StudentDetailModal
                student={vm.selected}
                onClose={vm.clearSelection}
                canManage={permissions.canManageStudents}
                canRegisterFace={permissions.canRegisterFace}
            />

            {permissions.canManageStudents && (
                <RegisterStudentModal
                    visible={vm.showRegisterModal}
                    onClose={vm.closeRegisterModal}
                    onSubmit={vm.registerStudent}
                />
            )}

            {permissions.canImportStudents && (
                <ImportStudentsModal
                    visible={vm.showImportModal}
                    onClose={vm.closeImportModal}
                    onImport={vm.importStudents}
                />
            )}
        </View>
    );
}
