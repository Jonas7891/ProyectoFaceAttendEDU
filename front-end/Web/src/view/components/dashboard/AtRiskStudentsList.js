// ============================================================
//  AtRiskStudentsList — Lista de estudiantes en riesgo
// ============================================================
//  Muestra estudiantes con riesgo de sanción por inasistencias
//  Ordenados por nivel de riesgo y días hasta sanción
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, Avatar, ProgressBar } from "../common";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../i18n/hooks/useTranslation";

/**
 * Lista de estudiantes en riesgo de sanción
 * 
 * @param {Array} students - Array de estudiantes en riesgo
 * @param {number} maxItems - Número máximo de items (default: 10)
 * @param {function} onStudentPress - Callback al presionar un estudiante
 * @param {boolean} showActions - Mostrar botón de acción (default: false)
 */
export function AtRiskStudentsList({
    students = [],
    maxItems = 10,
    onStudentPress,
    showActions = false,
}) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    // Ordenar por nivel de riesgo y días hasta sanción
    const sortedStudents = [...students].sort((a, b) => {
        const riskOrder = { high: 0, medium: 1, low: 2 };
        const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        if (riskDiff !== 0) return riskDiff;
        return a.daysUntilSanction - b.daysUntilSanction;
    });

    const displayedStudents = sortedStudents.slice(0, maxItems);

    // Configuración de niveles de riesgo
    const riskConfig = {
        high: {
            color: c.status.danger,
            bgColor: c.status.dangerLight,
            variant: "danger",
            label: t("Alto Riesgo"),
            icon: "alert-octagon",
        },
        medium: {
            color: c.status.warning,
            bgColor: c.status.warningLight,
            variant: "warning",
            label: t("Riesgo Medio"),
            icon: "alert-triangle",
        },
        low: {
            color: c.brand.primary,
            bgColor: c.brand.primaryLight,
            variant: "primary",
            label: t("Riesgo Bajo"),
            icon: "alert-circle",
        },
    };

    if (students.length === 0) {
        return (
            <Card>
                <View style={{ padding: 24, alignItems: "center" }}>
                    <View style={{
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: c.status.successLight,
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 12,
                    }}>
                        <Feather name="check-circle" size={32} color={c.status.success} />
                    </View>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: c.text.primary,
                        marginBottom: 4,
                    }}>
                        {t("¡Excelente!")}
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        color: c.text.secondary,
                        textAlign: "center",
                    }}>
                        {t("No hay estudiantes en riesgo de sanción")}
                    </Text>
                </View>
            </Card>
        );
    }

    return (
        <Card padding={0}>
            {displayedStudents.map((student, index) => {
                const config = riskConfig[student.riskLevel] || riskConfig.low;
                const isLast = index === displayedStudents.length - 1;
                
                // Calcular progreso inverso (100% = sin riesgo, 0% = crítico)
                const progressValue = student.attendanceRate;

                return (
                    <TouchableOpacity
                        key={student.id}
                        onPress={() => onStudentPress?.(student)}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 16,
                            gap: 12,
                            borderBottomWidth: isLast ? 0 : 1,
                            borderBottomColor: c.border.primary,
                            backgroundColor: index === 0 && student.riskLevel === "high" 
                                ? config.bgColor 
                                : "transparent",
                        }}
                    >
                        {/* Avatar con indicador de riesgo */}
                        <View style={{ position: "relative" }}>
                            <Avatar name={student.name} size={48} />
                            <View style={{
                                position: "absolute",
                                bottom: -2,
                                right: -2,
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: config.color,
                                borderWidth: 2,
                                borderColor: c.background.surface,
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <Feather name={config.icon} size={10} color="#fff" />
                            </View>
                        </View>

                        {/* Información */}
                        <View style={{ flex: 1, gap: 6 }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: c.text.primary,
                                    flex: 1,
                                }} numberOfLines={1}>
                                    {student.name}
                                </Text>
                                
                                <Badge variant={config.variant} size="sm">
                                    {student.attendanceRate}%
                                </Badge>
                            </View>

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
                                    • {student.fichaName}
                                </Text>
                            </View>

                            {/* Barra de progreso */}
                            <ProgressBar
                                value={progressValue}
                                color={config.color}
                                size="sm"
                            />

                            {/* Stats críticos */}
                            <View style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}>
                                <View style={{
                                    flexDirection: "row",
                                    gap: 12,
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4,
                                    }}>
                                        <Feather name="x-circle" size={12} color={c.status.danger} />
                                        <Text style={{
                                            fontSize: 11,
                                            color: c.text.secondary,
                                        }}>
                                            {student.totalAbsences} {t("faltas")}
                                        </Text>
                                    </View>

                                    {student.consecutiveAbsences > 0 && (
                                        <View style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 4,
                                        }}>
                                            <Feather name="repeat" size={12} color={c.status.warning} />
                                            <Text style={{
                                                fontSize: 11,
                                                color: c.text.secondary,
                                            }}>
                                                {student.consecutiveAbsences} {t("seguidas")}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Días hasta sanción */}
                                <View style={{
                                    paddingHorizontal: 8,
                                    paddingVertical: 3,
                                    borderRadius: 6,
                                    backgroundColor: config.bgColor,
                                }}>
                                    <Text style={{
                                        fontSize: 10,
                                        fontWeight: "700",
                                        color: config.color,
                                    }}>
                                        {student.daysUntilSanction} {t("días")}
                                    </Text>
                                </View>
                            </View>

                            {/* Última asistencia */}
                            <Text style={{
                                fontSize: 11,
                                color: c.text.disabled,
                            }}>
                                {t("Última asistencia")}: {student.lastAttendance}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}

            {students.length > maxItems && (
                <View style={{
                    padding: 12,
                    alignItems: "center",
                    borderTopWidth: 1,
                    borderTopColor: c.border.primary,
                }}>
                    <Text style={{
                        fontSize: 12,
                        color: c.brand.primary,
                        fontWeight: "600",
                    }}>
                        +{students.length - maxItems} {t("estudiantes más en riesgo")}
                    </Text>
                </View>
            )}
        </Card>
    );
}

export default AtRiskStudentsList;
