// ============================================================
//  FaceAttend EDU — StudentDetailModal
//  Modal de detalle de estudiante.
//  Los botones de gestión se muestran según permisos.
// ============================================================

import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Badge, Avatar, UIButton, ProgressBar } from "../ui/UI";
import { useAttendanceColor, ATTENDANCE_THRESHOLDS } from "../ui/AttendanceBadge";
import { useTheme }       from "../hooks/useTheme";
import { useTranslation } from "../../../i18n/hooks/useTranslation";
import type { Student }   from "../../../models/types";

interface StudentDetailModalProps {
    student:         Student | null;
    onClose:         () => void;
    canManage:       boolean;
    canRegisterFace: boolean;
}

export default function StudentDetailModal({
    student,
    onClose,
    canManage,
    canRegisterFace,
}: StudentDetailModalProps) {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c         = theme.colors;

    const attColor = useAttendanceColor(student?.attendance ?? 0);

    if (!student) return null;

    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={{
                    flex: 1, backgroundColor: c.background.overlay,
                    justifyContent: "center", alignItems: "center", padding: 24,
                }}
                onPress={onClose}
                activeOpacity={1}
            >
                <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                    <View style={{
                        backgroundColor: c.background.surface,
                        borderRadius: 12, width: 420, maxHeight: 600, overflow: "hidden",
                        shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
                    }}>
                        {/* Header */}
                        <View style={{
                            padding: 20, borderBottomWidth: 1, borderBottomColor: c.border.primary,
                            flexDirection: "row", alignItems: "center", gap: 14,
                        }}>
                            <Avatar name={student.name} size={52} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: "700", color: c.text.primary }}>
                                    {student.name}
                                </Text>
                                <Text style={{ fontSize: 12, color: c.text.secondary, marginTop: 2 }}>
                                    {student.code}
                                </Text>
                                <View style={{ marginTop: 6 }}>
                                    <Badge variant={student.status === "active" ? "success" : "default"}>
                                        {student.status === "active" ? t("Activo") : t("Inactivo")}
                                    </Badge>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <Feather name="x" size={18} color={c.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Body */}
                        <ScrollView style={{ padding: 20 }}>
                            <View style={{ gap: 12, marginBottom: 16 }}>
                                {[
                                    { label: t("Correo"),   value: student.email,  icon: "mail"        },
                                    { label: t("Programa"), value: student.course, icon: "book-open"   },
                                    { label: t("Semestre"), value: student.grade,  icon: "trending-up" },
                                ].map(({ label, value, icon }) => (
                                    <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <Feather name={icon as any} size={14} color={c.text.secondary} />
                                        <Text style={{ fontSize: 12, color: c.text.secondary, width: 72 }}>{label}</Text>
                                        <Text style={{ fontSize: 13, fontWeight: "500", color: c.text.primary, flex: 1 }}>
                                            {value}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Bloque de asistencia */}
                            <View style={{
                                backgroundColor: c.background.app, borderRadius: 8,
                                padding: 16, marginBottom: 12,
                            }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                                    <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary }}>
                                        {t("Asistencia")}
                                    </Text>
                                    <Text style={{ fontSize: 18, fontWeight: "800", color: attColor }}>
                                        {student.attendance}%
                                    </Text>
                                </View>
                                <ProgressBar value={student.attendance} color={attColor} height={8} />
                                <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 8 }}>
                                    {student.attendance >= ATTENDANCE_THRESHOLDS.MIN_ACCEPTABLE
                                        ? t("Cumple el mínimo requerido (80%)")
                                        : t("⚠ Por debajo del mínimo requerido (80%)")}
                                </Text>
                            </View>

                            {/* Bloque facial — solo para quienes pueden registrar */}
                            {canRegisterFace && (
                                <View style={{
                                    flexDirection: "row", alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: 12, borderWidth: 1, borderColor: c.border.primary,
                                    borderRadius: 8, marginBottom: 4,
                                }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <Feather name="aperture" size={18} color={c.brand.primary} />
                                        <View>
                                            <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary }}>
                                                {t("Reconocimiento facial")}
                                            </Text>
                                            <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                                {student.registered
                                                    ? t("Rostro registrado")
                                                    : t("Sin registro facial")}
                                            </Text>
                                        </View>
                                    </View>
                                    {student.registered
                                        ? <Feather name="check-circle" size={16} color={c.states.success} />
                                        : <UIButton variant="primary" size="sm">{t("Registrar")}</UIButton>
                                    }
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer */}
                        <View style={{
                            padding: 16, borderTopWidth: 1, borderTopColor: c.border.primary,
                            flexDirection: "row", gap: 8, justifyContent: "flex-end",
                        }}>
                            <UIButton variant="ghost" onPress={onClose}>{t("Cerrar")}</UIButton>
                            {/* Editar solo para quienes pueden gestionar */}
                            {canManage && (
                                <UIButton variant="primary">{t("Editar estudiante")}</UIButton>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
