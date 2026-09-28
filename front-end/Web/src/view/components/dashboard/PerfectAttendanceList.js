// ============================================================
//  PerfectAttendanceList — Estudiantes con asistencia perfecta
// ============================================================
//  Muestra estudiantes destacados por su excelente asistencia
//  Reconocimiento visual de su compromiso
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, Avatar, ProgressBar } from "../common";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";

/**
 * Lista de estudiantes con asistencia perfecta o casi perfecta
 * 
 * @param {Array} students - Array de estudiantes destacados
 * @param {number} maxItems - Número máximo de items (default: 5)
 * @param {function} onStudentPress - Callback al presionar un estudiante
 */
export function PerfectAttendanceList({
    students = [],
    maxItems = 5,
    onStudentPress,
}) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    const displayedStudents = students.slice(0, maxItems);

    if (students.length === 0) {
        return (
            <Card>
                <View style={{ padding: 16, alignItems: "center" }}>
                    <Feather name="award" size={32} color={c.text.secondary} />
                    <Text style={{
                        fontSize: 14,
                        color: c.text.secondary,
                        marginTop: 8,
                    }}>
                        {t("No hay datos disponibles")}
                    </Text>
                </View>
            </Card>
        );
    }

    return (
        <Card padding={0}>
            {displayedStudents.map((student, index) => {
                const isLast = index === displayedStudents.length - 1;
                const isPerfect = student.attendanceRate === 100;

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
                            backgroundColor: index === 0 && isPerfect 
                                ? c.status.successLight 
                                : "transparent",
                        }}
                    >
                        {/* Avatar con badge de estrella */}
                        <View style={{ position: "relative" }}>
                            <Avatar name={student.name} size={48} />
                            <View style={{
                                position: "absolute",
                                bottom: -2,
                                right: -2,
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: isPerfect ? "#FFD700" : c.status.success,
                                borderWidth: 2,
                                borderColor: c.background.surface,
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <Text style={{ fontSize: 10 }}>
                                    {isPerfect ? "⭐" : "✓"}
                                </Text>
                            </View>
                        </View>

                        {/* Información */}
                        <View style={{ flex: 1, gap: 6 }}>
                            {/* Header: Nombre + Badge */}
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

                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                }}>
                                    <Badge 
                                        variant={isPerfect ? "success" : "primary"} 
                                        size="sm"
                                    >
                                        {student.attendanceRate}%
                                    </Badge>
                                </View>
                            </View>

                            {/* Segunda línea: Código + Ficha + Stats */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 8,
                            }}>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                    flex: 1,
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

                                {/* Stats: Racha */}
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 10,
                                }}>
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4,
                                    }}>
                                        <Feather name="trending-up" size={12} color={c.status.success} />
                                        <Text style={{
                                            fontSize: 11,
                                            color: c.text.secondary,
                                        }}>
                                            {student.streak} {t("días de racha")}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Barra de progreso */}
                            <ProgressBar
                                value={student.attendanceRate}
                                color={isPerfect ? c.status.success : c.brand.primary}
                                size="sm"
                            />
                        </View>

                        {/* Chevron - Indicador de clickeable */}
                        <Feather name="chevron-right" size={20} color={c.text.secondary} />
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
                        +{students.length - maxItems} {t("estudiantes destacados más")}
                    </Text>
                </View>
            )}
        </Card>
    );
}

export default PerfectAttendanceList;
