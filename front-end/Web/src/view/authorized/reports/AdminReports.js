// ============================================================
//  FaceAttend EDU — AdminReports
//
//  Vista de reportes para administradores y profesores.
//  Maneja tres vistas según el parámetro section:
//  - section=null/"all": Lista de estudiantes en riesgo
//  - section="historicos": Historial completo de asistencias
//  - section="sanciones": Registro de sanciones aplicadas
// ============================================================

import React, { useState, useMemo, useRef } from "react";
import { View, ScrollView, Text, TouchableOpacity, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { PageHeader, Button, Card, Loader, Avatar, Badge, EmptyState } from "../../components/common";
import { useTheme } from "../../components/hooks/useTheme";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { useRolePermissions } from "../../../viewmodels/useRolePermissions";
import { useAttendanceStatus } from "../../components/common/badges/StatusBadge";
import { getAttendanceThresholds, getAtRiskStudents } from "../../../models/data/userDerivedData";
import { getInstitutionConfig } from "../../../core/config/institutionConfig";
import { useAppData } from "../../../context/AppDataContext";
import { usePushNotification } from "../../components/common/feedback/PushNotification";
import { HistoricosSection, SancionesSection } from "./sections";
import { createBulkSanctions, hasActiveSanctions } from "../../../models/data/sanctionsData";

// ── Componente interno StudentRow ────────────────────────

function StudentRow({ student, index, isLast, onPress, onNotify }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;
    
    // Usar la lógica existente de attendance status (única fuente de verdad)
    const attendanceStatus = useAttendanceStatus(student.attendance);
    
    // Si están en reportes, están en riesgo
    const isAtRisk = true;
    
    // Mapear level a variant para Badge
    const badgeVariantMap = {
        excellent: "success",
        warning: "warning",
        danger: "danger",
    };
    const badgeVariant = badgeVariantMap[attendanceStatus.level] || "danger";
    
    // Usar el bgColor que ya viene del hook
    const backgroundColor = attendanceStatus.bgColor;

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                gap: 12,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: c.border.primary,
                backgroundColor,
            }}
        >
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

            <View style={{ flex: 1, gap: 6 }}>
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

                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                }}>
                    <Text style={{ fontSize: 12, color: c.text.secondary }}>
                        {student.code}
                    </Text>
                    <Text style={{ fontSize: 12, color: c.text.secondary }}>•</Text>
                    <Text style={{
                        fontSize: 12,
                        color: c.text.secondary,
                        flex: 1,
                    }} numberOfLines={1}>
                        {student.courseName || student.course || "—"}
                    </Text>
                </View>

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
                        <Text style={{ fontSize: 11, color: c.text.secondary }}>
                            {student.status === "active" ? t("Activo") : t("Inactivo")}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
            }}>
                {/* Botón de notificación individual */}
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        onNotify(student);
                    }}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: c.status.dangerLight,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Feather name="bell" size={16} color={c.status.danger} />
                </TouchableOpacity>
                
                <Feather name="chevron-right" size={20} color={c.text.secondary} />
            </View>
        </TouchableOpacity>
    );
}

// ── AdminReports Component ────────────────────────────────

export function AdminReports({ section }) {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const permissions = useRolePermissions();
    const appData = useAppData();
    const pushNotification = usePushNotification();
    const c = theme.colors;

    // Usar useReducer en lugar de useState para forzar re-renders
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    // Estado y animación para el botón de recargar
    const [isReloading, setIsReloading] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // ── IMPORTANTE: Todos los hooks deben estar ANTES de cualquier return early ──
    // Lógica de estudiantes en riesgo (se calcula siempre para respetar reglas de hooks)
    const studentsData = useMemo(() => {
        const config = getInstitutionConfig();
        const atRiskStudents = getAtRiskStudents(appData.students, config.minAttendance);
        
        // Filtrar usuarios que ya tienen sanciones activas
        const pendingStudents = atRiskStudents.filter(student => 
            !hasActiveSanctions(student.studentId)
        );
        
        // Formatear estudiantes para StudentRow
        const formattedStudents = pendingStudents.map(student => {
            const originalStudent = appData.students.find(s => s.id === student.studentId);
            return {
                ...originalStudent,
                id: student.studentId,
                name: student.name,
                code: student.code,
                course: student.ficha,
                courseName: student.fichaName,
                fichaId: student.ficha,
                fichaName: student.fichaName,
                attendance: student.attendanceRate,
                attendanceRate: student.attendanceRate,
                riskLevel: student.riskLevel,
                totalAbsences: student.totalAbsences,
                consecutiveAbsences: student.consecutiveAbsences,
                daysUntilSanction: student.daysUntilSanction,
                lastAttendance: student.lastAttendance,
            };
        });

        return {
            students: formattedStudents,
            isLoading: appData.isLoading,
        };
    }, [appData.students, appData.isLoading]); // Sin refreshKey - confiamos en forceUpdate

    // ── Determinar qué sección mostrar (DESPUÉS de todos los hooks) ──
    const isMainView = !section || section === "all";
    const isHistoricos = section === "historicos";
    const isSanciones = section === "sanciones";

    // ── Renderizar sección de Históricos ──────────────────
    if (isHistoricos) {
        return (
            <>
                <PageHeader
                    title={t("Históricos")}
                    subtitle={t("Historial completo de asistencia de todos los usuarios")}
                />
                <ScrollView
                    contentContainerStyle={{
                        padding: isSmall ? 16 : 24,
                        gap: 16,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <HistoricosSection />
                </ScrollView>
            </>
        );
    }

    // ── Renderizar sección de Sanciones ───────────────────
    if (isSanciones) {
        return (
            <>
                <PageHeader
                    title={t("Sanciones")}
                    subtitle={t("Registro de sanciones y alertas aplicadas")}
                />
                <ScrollView
                    contentContainerStyle={{
                        padding: isSmall ? 16 : 24,
                        gap: 16,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <SancionesSection />
                </ScrollView>
            </>
        );
    }

    // ── Vista principal: Estudiantes en riesgo ────────────

    // Mostrar loader mientras carga
    if (studentsData.isLoading) {
        return <Loader fullScreen message={t("Cargando reportes...")} />;
    }

    // Datos de estudiantes en riesgo
    const students = studentsData.students;
    const studentCount = students.length;
    const studentLabel = studentCount === 1 ? t("estudiante") : t("estudiantes");

    // Handler para notificar estudiantes
    const handleNotifyAll = () => {
        if (studentCount === 0) return;
        
        // Crear sanciones en lote para todos los estudiantes
        createBulkSanctions(students);
        
        // Mostrar notificación
        pushNotification.success(
            'Notificación enviada', 
            `Se han notificado ${studentCount} estudiantes en riesgo`
        );
        
        // Forzar re-render INMEDIATAMENTE
        forceUpdate();
    };

    // Handler para notificar un estudiante individual
    const handleNotifyOne = (student) => {
        // Crear sanción individual
        createBulkSanctions([student]);
        
        // Mostrar notificación
        pushNotification.success(
            'Notificación enviada', 
            `Se ha notificado a ${student.name}`
        );
        
        // Forzar re-render INMEDIATAMENTE
        forceUpdate();
    };

    // Handler para ver detalles de estudiante
    const handleViewStudent = (studentId) => {
        console.log("Ver detalles:", studentId);
        // TODO: Implementar navegación a detalle de estudiante
    };

    // Handler para recargar la lista
    const handleReload = async () => {
        if (isReloading) return; // Prevenir múltiples clicks
        
        setIsReloading(true);
        rotateAnim.setValue(0);
        
        // Marcar inicio del proceso
        const startTime = Date.now();
        
        // Ejecutar forceUpdate (que recalcula studentsData y lee de localStorage)
        forceUpdate();
        
        // Esperar al siguiente frame para que React termine de renderizar
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Calcular duración real del proceso
        const actualDuration = Date.now() - startTime;
        
        // Animar por la duración real del proceso
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: Math.max(actualDuration, 2000), // Mínimo 200ms para que sea visible
            useNativeDriver: true,
            isInteraction: false,
        }).start(() => {
            // Resetear al finalizar
            rotateAnim.setValue(0);
            setIsReloading(false);
        });
    };

    return (
        <>
            <PageHeader
                title={t("Reportes y Sanciones")}
                subtitle={`${studentCount} ${studentLabel} para reportar o notificar`}
                actions={
                    studentCount > 0 ? (
                        permissions.canNotifyAll && (
                            <Button
                                variant="danger"
                                size="sm"
                                onPress={handleNotifyAll}
                                leftIcon={<Feather name="bell" size={16} color="#fff" />}
                            >
                                {t("Notificar Todos")}
                            </Button>
                        )
                    ) : (
                        <TouchableOpacity
                            onPress={handleReload}
                            disabled={isReloading}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: c.background.secondary,
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: isReloading ? 0.7 : 1,
                            }}
                        >
                            <Animated.View
                                style={{
                                    transform: [{
                                        rotate: rotateAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '360deg']
                                        })
                                    }]
                                }}
                            >
                                <Feather name="refresh-cw" size={18} color={c.text.primary} />
                            </Animated.View>
                        </TouchableOpacity>
                    )
                }
            />

            <ScrollView
                contentContainerStyle={{
                    padding: isSmall ? 16 : 24,
                    gap: 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Card padding={0}>
                    {studentCount === 0 ? (
                        <EmptyState
                            icon="users"
                            title={t("No hay mas usuarios por reportar")}
                            description={t("Todos los estudiantes cumplen con los criterios de asistencia")}
                        />
                    ) : (
                        <>
                            {students.map((student, index) => (
                                <StudentRow 
                                    key={student.id} 
                                    student={student} 
                                    index={index} 
                                    isLast={index === studentCount - 1} 
                                    onPress={() => handleViewStudent(student.id)}
                                    onNotify={handleNotifyOne}
                                />
                            ))}
                            
                            {/* Footer dentro del Card */}
                            <View style={{
                                padding: 24,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: c.background.surface,
                                borderTopWidth: 1,
                                borderTopColor: c.border.primary,
                            }}>
                                <Feather name="check-circle" size={24} color={c.status.success} style={{ marginBottom: 8 }} />
                                <Text style={{
                                    fontSize: 14,
                                    color: c.text.secondary,
                                    textAlign: "center",
                                }}>
                                    {t("¡Ya llegaste hasta el final de la lista, no hay más usuarios que mostrar!")}
                                </Text>
                            </View>
                        </>
                    )}
                </Card>
            </ScrollView>
        </>
    );
}
