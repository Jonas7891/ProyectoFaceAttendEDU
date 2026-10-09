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
import { AdminCourses, TeacherCourses, StudentCourses } from "./authorized/courses";

export default function CoursesView() {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const permissions = useRolePermissions();
    const vm = useCoursesViewModel();
    const c = theme.colors;

    // Título dinámico según el rol del usuario
    const pageTitle = permissions.getTabLabel("courses") || t("Cursos");

    // Subtitle dinámico: admin ve el total del sistema, teacher/student ven
    // el tamaño de su propio alcance (mis fichas / mi ficha).
    const visibleCount = permissions.isAdmin ? vm.filtered.length : vm.myFiltered.length;
    const baseLabel = permissions.isAdmin
        ? t("Gestiona los cursos del sistema")
        : permissions.isTeacher
        ? t("Consulta las fichas que tienes asignadas")
        : t("Consulta tu ficha y tu progreso");
    const pageSubtitle = vm.isLoading
        ? `${baseLabel} (${t("Cargando cursos")}...)`
        : `${baseLabel} (${visibleCount} ${
              visibleCount !== 1 ? t("cursos encontrados") : t("curso encontrado")
          })`;

    // Determinar qué componente de courses renderizar según rol
    let CoursesComponent;
    if (permissions.isAdmin) {
        CoursesComponent = <AdminCourses vm={vm} />;
    } else if (permissions.isTeacher) {
        CoursesComponent = <TeacherCourses vm={vm} />;
    } else {
        CoursesComponent = <StudentCourses vm={vm} />;
    }

    // Renderizar UI completa
    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <PageHeader
                title={pageTitle}
                subtitle={pageSubtitle}
                actions={
                    <>
                        {/* Importar — solo admin */}
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

                        {/* Nuevo curso — solo admin */}
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

            {CoursesComponent}
        </View>
    );
}
