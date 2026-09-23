// ============================================================
//  EnvironmentCard — Tarjeta de ambiente en vista de grid
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "../common";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";

/**
 * Card de ambiente con preview de horarios
 * 
 * @param {object} environment - Objeto de ambiente
 * @param {function} onPress - Callback al hacer click
 */
export function EnvironmentCard({ environment, onPress }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    return (
        <TouchableOpacity onPress={onPress} style={{ flex: 1, minWidth: 260 }}>
            <Card padding={0} style={{ overflow: "hidden", height: "100%" }}>
                {/* Accent bar */}
                <View style={{ height: 6, backgroundColor: c.brand.primary }} />
                
                <View style={{ padding: 16, flex: 1 }}>
                    {/* Header con número y capacidad */}
                    <View style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 10,
                    }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 18,
                                fontWeight: "700",
                                color: c.brand.primary,
                                marginBottom: 4,
                            }}>
                                {environment.number}
                            </Text>
                            <Text style={{
                                fontSize: 13,
                                color: c.text.secondary,
                                lineHeight: 18,
                            }} numberOfLines={2}>
                                {environment.description}
                            </Text>
                        </View>
                        
                        {environment.capacity && (
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                backgroundColor: c.background.app,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                                marginLeft: 8,
                            }}>
                                <Feather name="users" size={14} color={c.text.secondary} />
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: "600",
                                    color: c.text.secondary,
                                }}>
                                    {environment.capacity}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Divider */}
                    <View style={{
                        height: 1,
                        backgroundColor: c.border.primary,
                        marginVertical: 14,
                    }} />

                    {/* Schedules section */}
                    <Text style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: c.text.secondary,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 10,
                    }}>
                        {t("Horarios asignados")} ({environment.schedules.length})
                    </Text>

                    {environment.schedules.length === 0 ? (
                        <Text style={{
                            fontSize: 13,
                            color: c.text.disabled,
                            fontStyle: "italic",
                        }}>
                            {t("Sin horarios asignados")}
                        </Text>
                    ) : (
                        <>
                            {environment.schedules.slice(0, 3).map(schedule => (
                                <View key={schedule.id} style={{
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    gap: 10,
                                    marginBottom: 8,
                                }}>
                                    <View style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: c.brand.primary,
                                        marginTop: 6,
                                    }} />
                                    
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: 13,
                                            fontWeight: "600",
                                            color: c.text.primary,
                                            marginBottom: 2,
                                        }} numberOfLines={1}>
                                            {schedule.courseCode} — {schedule.courseName}
                                        </Text>
                                        <Text style={{
                                            fontSize: 12,
                                            color: c.text.secondary,
                                        }} numberOfLines={1}>
                                            {schedule.instructorName} • {schedule.startTime}–{schedule.endTime} • {schedule.days.map(d => t(d)).join(", ")}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                            
                            {environment.schedules.length > 3 && (
                                <Text style={{
                                    fontSize: 12,
                                    fontWeight: "600",
                                    color: c.brand.primary,
                                    marginTop: 4,
                                }}>
                                    +{environment.schedules.length - 3} {t("más...")}
                                </Text>
                            )}
                        </>
                    )}
                </View>
            </Card>
        </TouchableOpacity>
    );
}

export default EnvironmentCard;
