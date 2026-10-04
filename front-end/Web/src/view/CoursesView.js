// ============================================================
//  FaceAttend EDU — Courses View (View Layer)
// ============================================================
//  RESPONSABILIDAD: Orquestación y punto de entrada ("qué debe pasar")
//
//  Este componente:
//  ✓ Actúa como punto de entrada para la vista de cursos
//  ✓ Renderiza el PageHeader con título y acciones
//  ✓ Delega la presentación a AdminCourses
//
//  NO debe:
//  ✗ Contener lógica de negocio
//  ✗ Renderizar el contenido principal (delegado a AdminCourses)
//
//  Patrón: View = orquestación, AdminCourses = presentación
// ============================================================

import React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PageHeader, Button } from "./components/common";
import { useTheme } from "./components/hooks/useTheme";
import { useResponsive } from "./components/hooks/useResponsive";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useRolePermissions } from "../viewmodels/useRolePermissions";
import { useCoursesViewModel } from "../viewmodels/useCoursesViewModel";
import AdminCourses from "./authorized/courses/AdminCourses";

export default function CoursesView() {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const permissions = useRolePermissions();
    const vm = useCoursesViewModel();
    const c = theme.colors;

    // Título dinámico según el rol del usuario
    const pageTitle = permissions.getTabLabel("courses") || t("Cursos");

    // Subtitle dinámico con contador de cursos
    const pageSubtitle = vm.isLoading
        ? `${t("Gestiona los cursos del sistema")} (${t("Cargando cursos")}...)`
        : `${t("Gestiona los cursos del sistema")} (${vm.filtered.length} ${
              vm.filtered.length !== 1 ? t("cursos encontrados") : t("curso encontrado")
          })`;

    // Renderizar UI completa
    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <PageHeader
                title={pageTitle}
                subtitle={pageSubtitle}
                actions={
                    <>
                        {/* Importar — solo admin/teacher */}
                        {permissions.canManageCourses && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onPress={vm.openImportModal}
                                leftIcon={<Feather name="upload" size={16} color={c.text.secondary} />}
                            >
                                {t("Importar")}
                            </Button>
                        )}

                        {/* Nuevo curso — solo admin/teacher */}
                        {permissions.canManageCourses && (
                            <Button
                                variant="primary"
                                size="sm"
                                onPress={vm.openRegisterModal}
                                leftIcon={<Feather name="plus" size={16} color={c.brand.textOnPrimary} />}
                            >
                                {t("Nuevo curso")}
                            </Button>
                        )}
                    </>
                }
            />

            <AdminCourses vm={vm} />
        </View>
    );
}
