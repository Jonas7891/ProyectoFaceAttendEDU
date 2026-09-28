// ============================================================
//  FaceAttend EDU — UsersView
//
//  Orquestador de gestión de usuarios.
//  Delega a componentes específicos según el rol del usuario:
//  - AdminUsers: gestión completa de todos los usuarios (admin)
//  - TeacherUsers: gestión de estudiantes de sus cursos (teacher)
//  - StudentUsers: vista limitada de compañeros (student)
//
//  NOTA: La validación de autorización se hace GLOBALMENTE en
//  AuthenticatedNavigator. Este componente solo se renderiza
//  si el usuario YA está autorizado.
// ============================================================

import React from "react";
import { View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PageHeader, Button } from "./components/common";
import { useTheme } from "./components/hooks/useTheme";
import { useResponsive } from "./components/hooks/useResponsive";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useRolePermissions } from "../viewmodels/useRolePermissions";
import { useUsersViewModel } from "../viewmodels/useUsersViewModel";
import { AdminUsers, TeacherUsers, StudentUsers } from "./authorized/users";

export default function UsersView({ section = "all" }) {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const permissions = useRolePermissions();
    const vm = useUsersViewModel();
    const c = theme.colors;

    // Título dinámico según el rol del usuario
    const pageTitle = permissions.getTabLabel("users") || t("Usuarios");

    // Subtitle dinámico con contador
    const pageSubtitle = `${t("Gestiona los usuarios del sistema")} (${vm.filteredUsers.length} ${
        vm.filteredUsers.length !== 1 ? t("usuarios") : t("usuario")
    } ${vm.filteredUsers.length !== 1 ? t("encontrados") : t("encontrado")})`;

    // Determinar qué componente de users renderizar según rol
    let UsersComponent;
    if (permissions.isAdmin) {
        UsersComponent = <AdminUsers />;
    } else if (permissions.isTeacher) {
        UsersComponent = <TeacherUsers />;
    } else {
        UsersComponent = <StudentUsers />;
    }

    // Renderizar UI completa para usuarios autorizados
    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <PageHeader
                title={pageTitle}
                subtitle={pageSubtitle}
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
                        {/* Nuevo usuario — solo admin */}
                        {permissions.canManageStudents && (
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onPress={vm.openRegisterModal}
                                leftIcon={<Feather name="plus" size={16} color="#fff" />}
                            >
                                {t("Nuevo usuario")}
                            </Button>
                        )}
                    </>
                }
            />
            {UsersComponent}
        </View>
    );
}
