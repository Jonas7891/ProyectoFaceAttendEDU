// ============================================================
//  FaceAttend EDU — StudentDetailModal
//  Modal de detalle de estudiante.
//  Los botones de gestión se muestran según permisos.
// ============================================================

import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Badge, Avatar, Button, ProgressBar, useAttendanceColor, ATTENDANCE_THRESHOLDS } from "../common";
import { useTheme }       from "../hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../../../context/AppDataContext";


export default function StudentDetailModal({
    student,
    onClose,
    canManage,
    canRegisterFace,
}) {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c         = theme.colors;
    const { courses } = useAppData();

    const attColor = useAttendanceColor(student?.attendance ?? 0);
    
    // Obtener nombre completo del curso
    const courseName = useMemo(() => {
        if (!student?.course) return '—';
        const course = courses.find(c => c.code === student.course || c.name === student.course);
        return course ? course.name : student.course;
    }, [student?.course, courses]);

    if (!student) return null;

    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: c.background.overlay,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 24,
                }}
                onPress={onClose}
                activeOpacity={1}
            >
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                    <View style={{
                        backgroundColor: c.background.surface,
                        borderRadius: 14,
                        width: 520,
                        overflow: "hidden",
                        shadowColor: "#000",
                        shadowOpacity: 0.15,
                        shadowRadius: 8,
                        elevation: 8,
                    }}>
                        {/* Header */}
                        <View style={{
                            padding: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: c.border.primary,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                        }}>
                            <Avatar name={student.name} size={52} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: "700", color: c.text.primary }}>
                                    {student.name}
                                </Text>
                                <Text style={{ fontSize: 13, color: c.text.secondary, marginTop: 2 }}>
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
                        <View style={{ padding: 20 }}>
                            <View style={{ gap: 8, marginBottom: 12 }}>
                                {[
                                    { label: t("Correo"), value: student.email, icon: "mail" },
                                    // Solo mostrar Programa y Semestre para no-administradores
                                    ...(student.userType !== "admin" ? [
                                        { label: t("Programa"), value: courseName, icon: "book-open" },
                                        { label: t("Semestre"), value: student.grade, icon: "trending-up" },
                                    ] : [])
                                ].map(({ label, value, icon }) => (
                                    <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <Feather name={icon} size={16} color={c.text.secondary} />
                                        <Text style={{ fontSize: 13, color: c.text.secondary, width: 80 }}>{label}</Text>
                                        <Text style={{ fontSize: 14, fontWeight: "500", color: c.text.primary, flex: 1 }}>
                                            {value}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Bloque de asistencia - Solo para estudiantes y profesores */}
                            {student.userType !== "admin" && (
                                <View style={{
                                    backgroundColor: c.background.app,
                                    borderRadius: 14,
                                    padding: 12,
                                    marginBottom: 12,
                                }}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                        <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary }}>
                                            {t("Asistencia")}
                                        </Text>
                                        <Text style={{ fontSize: 16, fontWeight: "800", color: attColor }}>
                                            {student.attendance}%
                                        </Text>
                                    </View>
                                    <ProgressBar value={student.attendance} color={attColor} height={6} />
                                    <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 6 }}>
                                        {student.attendance >= ATTENDANCE_THRESHOLDS.MIN_ACCEPTABLE
                                            ? t("Cumple el mínimo requerido (80%)")
                                            : t("⚠ Por debajo del mínimo requerido (80%)")}
                                    </Text>
                                </View>
                            )}

                            {/* Bloque biométrico — solo para estudiantes y profesores que pueden registrar */}
                            {canRegisterFace && student.userType !== "admin" && (() => {
                                // Determinar estado biométrico basado en facial y huella
                                const hasFacial = student.hasFacial || false;
                                const hasFingerprint = student.hasFingerprint || false;
                                
                                let biometricStatus = "pending";
                                if (hasFacial && hasFingerprint) {
                                    biometricStatus = "registered";
                                } else if (hasFacial || hasFingerprint) {
                                    biometricStatus = "partial";
                                }
                                
                                // Configuración por estado
                                const statusConfig = {
                                    registered: { 
                                        icon: "check-circle", 
                                        color: c.status.success, 
                                        text: t("Biometría registrada"),
                                        showButton: false
                                    },
                                    partial: { 
                                        icon: "alert-circle", 
                                        color: c.status.warning, 
                                        text: hasFacial 
                                            ? t("Falta registro de huella dactilar")
                                            : t("Falta registro facial"),
                                        showButton: true
                                    },
                                    pending: { 
                                        icon: "x-circle", 
                                        color: c.text.secondary, 
                                        text: t("Sin registro biométrico"),
                                        showButton: true
                                    },
                                };
                                const config = statusConfig[biometricStatus] || statusConfig.pending;
                                
                                return (
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: 12,
                                        borderWidth: 1,
                                        borderColor: c.border.primary,
                                        borderRadius: 14,
                                    }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                            <Feather name="aperture" size={18} color={c.brand.primary} />
                                            <View>
                                                <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.primary }}>
                                                    {t("Reconocimiento biométrico")}
                                                </Text>
                                                <Text style={{ fontSize: 12, color: c.text.secondary }}>
                                                    {config.text}
                                                </Text>
                                            </View>
                                        </View>
                                        {config.showButton
                                            ? <Button variant="primary" size="sm">{t("Registrar")}</Button>
                                            : <Feather name={config.icon} size={18} color={config.color} />
                                        }
                                    </View>
                                );
                            })()}
                        </View>

                        {/* Footer */}
                        <View style={{
                            padding: 12,
                            borderTopWidth: 1,
                            borderTopColor: c.border.primary,
                            flexDirection: "row",
                            gap: 10,
                            justifyContent: "flex-end",
                        }}>
                            <Button variant="ghost" onPress={onClose}>{t("Cerrar")}</Button>
                            {/* Editar solo para quienes pueden gestionar */}
                            {canManage && (
                                <Button variant="primary">
                                    {student.userType === "admin" ? t("Editar administrador") : 
                                     student.userType === "teacher" ? t("Editar docente") : 
                                     t("Editar estudiante")}
                                </Button>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

