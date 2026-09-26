// ============================================================
//  FaceAttend EDU — Students VIEW (Presentation Layer)
//
//  RESPONSABILIDAD: Presentación de la interfaz de estudiantes ("cómo se presenta")
//
//  Este componente:
//  ✓ Renderiza la lista de estudiantes con filtros
//  ✓ Muestra información de cada estudiante (nombre, email, programa, asistencia, estado facial)
//  ✓ Presenta modales de registro, importación y detalle
//  ✓ Adapta la UI según permisos del usuario
//
//  Toda la lógica de negocio está en useStudentsViewModel.
//  Las acciones de gestión se muestran condicionalmente según useRolePermissions.
// ============================================================

import React from "react";
import {
    View, Text, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
    Card, Badge, Avatar, ProgressBar, EmptyState,
    Button, AnimatedDropdown, useAttendanceColor, PageHeader,
} from "./components/common";
import { useTheme }               from "./components/hooks/useTheme";
import { useResponsive }          from "./components/hooks/useResponsive";
import { useStudentsViewModel }   from "../viewmodels/useStudentsViewModel";
import { useRolePermissions }     from "../viewmodels/useRolePermissions";
import { useTranslation }         from "../core/utils/i18n/hooks/useTranslation";
import RegisterStudentModal       from "./components/students/RegisterStudentModal";
import ImportStudentsModal        from "./components/students/ImportStudentsModal";
import StudentDetailModal         from "./components/students/StudentDetailModal";

// ── StudentRow ───────────────────────────────────────────────

function StudentRow({
    student,
    onPress,
    isLast,
    canManage,
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
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: c.border.primary,
                gap: isSmall ? 12 : 0,
            }}
        >
            <View style={{ flex: isSmall ? 1 : 2, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Avatar name={student.name} size={36} />
                <View>
                    <Text style={{ fontWeight: "600", fontSize: 14, color: c.text.primary }}>
                        {student.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: c.text.secondary }}>{student.code}</Text>
                </View>
            </View>

            {!isSmall && (
                <React.Fragment>
                    <Text style={{ flex: 1, fontSize: 13, color: c.text.secondary, paddingHorizontal: 14 }} numberOfLines={1}>
                        {student.email}
                    </Text>
                    <Text style={{ flex: 1, fontSize: 13, color: c.text.primary, paddingHorizontal: 14 }} numberOfLines={1}>
                        {student.course}
                    </Text>
                    <View style={{ flex: 1, paddingHorizontal: 14 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: attColor, marginBottom: 4 }}>
                            {student.attendance}%
                        </Text>
                        <ProgressBar value={student.attendance} color={attColor} height={5} />
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
                </React.Fragment>
            )}

            {isSmall && (
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: attColor }}>
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

    // Título dinámico según el rol del usuario
    const pageTitle = permissions.getTabLabel("students") || t("Usuarios");

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
        ...vm.courses,
    ];

    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <PageHeader
                title={pageTitle}
                subtitle={`${vm.filtered.length} ${
                    vm.filtered.length !== 1 ? t("estudiantes") : t("estudiante")
                } ${
                    vm.filtered.length !== 1 ? t("encontrados") : t("encontrado")
                }`}
                actions={
                    <>
                        {/* Importar — solo admin */}
                        {permissions.canImportStudents && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onPress={vm.openImportModal}
                                leftIcon={<Feather name="upload" size={16} color={c.text.secondary} />}
                            >
                                {t("Importar")}
                            </Button>
                        )}
                        {/* Nuevo estudiante — solo admin */}
                        {permissions.canManageStudents && (
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onPress={vm.openRegisterModal}
                                leftIcon={<Feather name="plus" size={16} color="#fff" />}
                            >
                                {t("Nuevo estudiante")}
                            </Button>
                        )}
                    </>
                }
            />
            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Filtros */}
                <Card padding={14}>
                    <View style={{ flexDirection: isSmall ? "column" : "row", gap: 12, flexWrap: "wrap" }}>
                        {/* Búsqueda */}
                        <View style={{ flex: 1, minWidth: 200, position: "relative", justifyContent: "center" }}>
                            <View style={{ position: "absolute", left: 14, zIndex: 1 }}>
                                <Feather name="search" size={16} color={c.text.secondary} />
                            </View>
                            <TextInput
                                placeholder={t("Buscar por nombre o código...")}
                                value={vm.search}
                                onChangeText={vm.setSearch}
                                style={{
                                    height: 48, borderWidth: 1.5, borderColor: c.border.primary,
                                    borderRadius: 14, paddingLeft: 40, paddingRight: 14,
                                    fontSize: 14, backgroundColor: c.background.surface,
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
                            style={{ minWidth: 200 }}
                        />
                    </View>
                </Card>

                {/* Tabla */}
                <Card padding={0}>
                    {!isSmall && (
                        <View style={{
                            flexDirection: "row",
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: c.border.primary,
                        }}>
                            {columns.map((col, idx) => (
                                <Text key={col} style={{
                                    flex: idx === 0 ? 2 : 1,
                                    fontSize: 11, fontWeight: "600", color: c.text.secondary,
                                    textTransform: "uppercase", letterSpacing: 0.5,
                                    paddingHorizontal: 14,
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
