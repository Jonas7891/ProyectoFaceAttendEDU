// ============================================================
//  FaceAttend EDU — ReportsView
//
//  Portal de reportes, sanciones y notificaciones de asistencia.
//  
//  Funcionalidades:
//  - Listar estudiantes en riesgo (asistencia < 75%)
//  - Filtrar por ficha/programa
//  - Filtrar por usuario específico
//  - Buscar estudiantes
//  - Notificar sobre posibles sanciones
//  - Exportar reportes
//
//  Navegación desde otras vistas:
//  - Dashboard → click en "En riesgo" → Reports con filterType="at-risk"
//  - Courses → click en ficha → Reports con fichaId=X
//  - Users → click en estudiante → Reports con userId=X
// ============================================================

import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PageHeader, Button, Card, Loader, UserFilters, Avatar, Badge, EmptyState } from "./components/common";
import { useTheme } from "./components/hooks/useTheme";
import { useResponsive } from "./components/hooks/useResponsive";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useReportsViewModel } from "../viewmodels/useReportsViewModel";
import { useRolePermissions } from "../viewmodels/useRolePermissions";

export default function ReportsView({ 
    filterType = null,
    fichaId = null, 
    userId = null,
    attendanceThreshold = 75 
}) {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const permissions = useRolePermissions();
    const vm = useReportsViewModel(filterType, fichaId, userId, attendanceThreshold);
    const c = theme.colors;

    if (vm.isLoading) {
        return <Loader fullScreen message={t("Cargando reportes...")} />;
    }

    // Título dinámico según filtro activo
    const getPageTitle = () => {
        if (filterType === "at-risk") return t("Estudiantes en Riesgo");
        if (fichaId) return t("Reporte por Ficha");
        if (userId) return t("Reporte de Estudiante");
        return t("Reportes y Sanciones");
    };

    // Subtítulo dinámico
    const getPageSubtitle = () => {
        const count = vm.filteredStudents.length;
        const label = count === 1 ? t("estudiante") : t("estudiantes");
        
        if (filterType === "at-risk") {
            return `${count} ${label} con asistencia menor al ${attendanceThreshold}%`;
        }
        if (fichaId) {
            return `${count} ${label} en la ficha ${vm.fichaName || fichaId}`;
        }
        if (userId) {
            return t("Historial de asistencia del estudiante");
        }
        return `${count} ${label} para reportar o notificar`;
    };

    // Acciones del header
    const headerActions = (
        <>
            {/* Botón de búsqueda/filtros */}
            <Button
                variant="ghost"
                size="sm"
                onPress={vm.toggleFilters}
                leftIcon={<Feather name="search" size={16} color={c.text.secondary} />}
            >
                {t("Buscar")}
            </Button>

            {/* Exportar - admin y teacher */}
            {permissions.canExportReports && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={vm.exportPDF}
                        leftIcon={<Feather name="file-text" size={16} color={c.text.secondary} />}
                    >
                        {t("Exportar PDF")}
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onPress={vm.exportExcel}
                        leftIcon={<Feather name="download" size={16} color="#fff" />}
                    >
                        {t("Exportar")}
                    </Button>
                </>
            )}

            {/* Notificar a todos - solo admin */}
            {permissions.canNotifyAll && vm.filteredStudents.length > 0 && (
                <Button
                    variant="danger"
                    size="sm"
                    onPress={vm.notifyAll}
                    leftIcon={<Feather name="bell" size={16} color="#fff" />}
                >
                    {t("Notificar Todos")}
                </Button>
            )}
        </>
    );

    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            {/* Header sticky */}
            <PageHeader
                title={getPageTitle()}
                subtitle={getPageSubtitle()}
                actions={headerActions}
            />

            <ScrollView
                contentContainerStyle={{
                    padding: isSmall ? 16 : 24,
                    gap: 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Filtros de búsqueda */}
                {vm.showFilters && (
                    <Card>
                        <UserFilters
                            search={vm.search}
                            onSearchChange={vm.setSearch}
                            searchPlaceholder={t("Buscar por nombre, código o documento...")}
                            
                            // Filtro por ficha/programa
                            courseFilter={vm.fichaFilter}
                            courses={vm.availableFichas}
                            onCourseChange={vm.setFichaFilter}
                            showCourseFilter={true}
                            
                            // Filtro por estado
                            statusFilter={vm.statusFilter}
                            statusFilters={[
                                { value: "all", label: t("Todos") },
                                { value: "active", label: t("Activos") },
                                { value: "inactive", label: t("Inactivos") },
                            ]}
                            onStatusChange={vm.setStatusFilter}
                            showStatusFilter={true}
                            
                            // No mostrar filtro de tipo de usuario
                            showUserTypeFilter={false}
                        />
                    </Card>
                )}

                {/* Lista de estudiantes a reportar */}
                <Card padding={0}>
                    {vm.filteredStudents.length === 0 ? (
                        <EmptyState
                            icon="users"
                            title={
                                vm.search
                                    ? t("No se encontraron estudiantes")
                                    : filterType === "at-risk"
                                    ? t("No hay estudiantes en riesgo")
                                    : t("No hay estudiantes para mostrar")
                            }
                            description={
                                vm.search
                                    ? t("Intenta con otros criterios de búsqueda")
                                    : filterType === "at-risk"
                                    ? t("Todos los estudiantes tienen asistencia adecuada")
                                    : t("Selecciona diferentes filtros para ver estudiantes")
                            }
                        />
                    ) : (
                        vm.filteredStudents.map((student, index) => {
                            const isLast = index === vm.filteredStudents.length - 1;
                            const isAtRisk = student.attendance < attendanceThreshold;
                            
                            // Determinar variante del badge según asistencia
                            const badgeVariant = 
                                student.attendance >= 85 ? "success" :
                                student.attendance >= attendanceThreshold ? "warning" :
                                "danger";

                            return (
                                <TouchableOpacity
                                    key={student.id}
                                    onPress={() => vm.viewStudentDetails(student.id)}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        padding: 16,
                                        gap: 12,
                                        borderBottomWidth: isLast ? 0 : 1,
                                        borderBottomColor: c.border.primary,
                                        backgroundColor: isAtRisk && index === 0 
                                            ? c.status.dangerLight 
                                            : "transparent",
                                    }}
                                >
                                    {/* Avatar con indicador de riesgo */}
                                    <View style={{ position: "relative" }}>
                                        <Avatar name={student.name} size={48} />
                                        {isAtRisk && (
                                            <View style={{
                                                position: "absolute",
                                                bottom: -2,
                                                right: -2,
                                                width: 20,
                                                height: 20,
                                                borderRadius: 10,
                                                backgroundColor: c.status.danger,
                                                borderWidth: 2,
                                                borderColor: c.background.surface,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}>
                                                <Feather name="alert-octagon" size={10} color="#fff" />
                                            </View>
                                        )}
                                    </View>

                                    {/* Información del estudiante */}
                                    <View style={{ flex: 1, gap: 6 }}>
                                        {/* Nombre + Badge de asistencia */}
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 8,
                                        }}>
                                            <Text style={{
                                                fontSize: 14,
                                                fontWeight: "600",
                                                color: c.text.primary,
                                                flex: 1,
                                            }} numberOfLines={1}>
                                                {student.name}
                                            </Text>

                                            <Badge variant={badgeVariant} size="sm">
                                                {student.attendance}%
                                            </Badge>
                                        </View>

                                        {/* Código + Programa/Ficha */}
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 8,
                                        }}>
                                            <Text style={{
                                                fontSize: 12,
                                                color: c.text.secondary,
                                            }}>
                                                {student.code}
                                            </Text>
                                            <Text style={{
                                                fontSize: 12,
                                                color: c.text.secondary,
                                            }}>
                                                •
                                            </Text>
                                            <Text style={{
                                                fontSize: 12,
                                                color: c.text.secondary,
                                            }} numberOfLines={1}>
                                                {student.courseName || student.course}
                                            </Text>
                                            {student.grade && (
                                                <>
                                                    <Text style={{
                                                        fontSize: 12,
                                                        color: c.text.secondary,
                                                    }}>
                                                        •
                                                    </Text>
                                                    <Text style={{
                                                        fontSize: 12,
                                                        color: c.text.secondary,
                                                    }}>
                                                        {student.grade}
                                                    </Text>
                                                </>
                                            )}
                                        </View>

                                        {/* Estado del estudiante */}
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 8,
                                        }}>
                                            <View style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 4,
                                            }}>
                                                <View style={{
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: 3,
                                                    backgroundColor: student.status === "active" 
                                                        ? c.status.success 
                                                        : c.text.disabled,
                                                }} />
                                                <Text style={{
                                                    fontSize: 11,
                                                    color: c.text.secondary,
                                                }}>
                                                    {student.status === "active" ? t("Activo") : t("Inactivo")}
                                                </Text>
                                            </View>

                                            {student.registered && (
                                                <>
                                                    <Text style={{
                                                        fontSize: 11,
                                                        color: c.text.disabled,
                                                    }}>
                                                        •
                                                    </Text>
                                                    <View style={{
                                                        flexDirection: "row",
                                                        alignItems: "center",
                                                        gap: 4,
                                                    }}>
                                                        <Feather name="check-circle" size={11} color={c.brand.primary} />
                                                        <Text style={{
                                                            fontSize: 11,
                                                            color: c.text.secondary,
                                                        }}>
                                                            {t("Reconocimiento facial")}
                                                        </Text>
                                                    </View>
                                                </>
                                            )}
                                        </View>
                                    </View>

                                    {/* Botón de notificar + Chevron */}
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 8,
                                    }}>
                                        {permissions.canExportReports && isAtRisk && (
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    vm.notifyStudent(student.id);
                                                }}
                                                style={{
                                                    padding: 8,
                                                    borderRadius: 8,
                                                    backgroundColor: c.status.dangerLight,
                                                }}
                                            >
                                                <Feather name="bell" size={16} color={c.status.danger} />
                                            </TouchableOpacity>
                                        )}
                                        
                                        <Feather name="chevron-right" size={20} color={c.text.secondary} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </Card>

                {/* Acciones rápidas */}
                {vm.filteredStudents.length > 0 && (
                    <Card padding={16}>
                        <View
                            style={{
                                flexDirection: isSmall ? "column" : "row",
                                gap: 12,
                                alignItems: "stretch",
                            }}
                        >
                            {/* Notificación masiva */}
                            {permissions.canNotifyAll && (
                                <Button
                                    variant="outline"
                                    style={{ flex: 1 }}
                                    onPress={vm.notifyAll}
                                    leftIcon={<Feather name="bell" size={16} color={c.brand.primary} />}
                                >
                                    {t("Notificar a Todos")} ({vm.filteredStudents.length})
                                </Button>
                            )}

                            {/* Exportar selección */}
                            {permissions.canExportReports && (
                                <Button
                                    variant="outline"
                                    style={{ flex: 1 }}
                                    onPress={vm.exportSelection}
                                    leftIcon={<Feather name="download" size={16} color={c.brand.primary} />}
                                >
                                    {t("Exportar Selección")}
                                </Button>
                            )}

                            {/* Ver historial completo */}
                            <Button
                                variant="ghost"
                                style={{ flex: 1 }}
                                onPress={vm.viewFullHistory}
                                leftIcon={<Feather name="clock" size={16} color={c.text.secondary} />}
                            >
                                {t("Ver Historial Completo")}
                            </Button>
                        </View>
                    </Card>
                )}
            </ScrollView>
        </View>
    );
}
