// ============================================================
//  FaceAttend EDU — StudentDetailModal
//  Modal de detalle de estudiante.
//  Los botones de gestión se muestran según permisos.
// ============================================================

import React, { useMemo, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Badge, Avatar, Button, ProgressBar, useAttendanceColor } from "../common";
import { useTheme }       from "../hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../../../context/AppDataContext";
import { getAttendanceThresholds } from "../../../models/data/userDerivedData";
import { onInstitutionConfigChange } from "../../../core/config/institutionConfig";
import EditUserProfileModal from "./EditUserProfileModal";


export default function StudentDetailModal({
    student: studentProp,
    onClose,
    canManage,
    canRegisterFace,
    onUserUpdated, // Callback para cuando se actualiza el usuario
    closeOnBackdrop = true, // Los modals de información sí pueden cerrarse haciendo clic fuera
}) {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c         = theme.colors;
    const { courses, students } = useAppData();
    const navigation = useNavigation();

    // Estado para controlar la modal de edición
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Estado para forzar re-render cuando cambia la configuración
    const [configVersion, setConfigVersion] = useState(0);
    
    // Escuchar cambios en la configuración institucional
    useEffect(() => {
        const cleanup = onInstitutionConfigChange((newConfig) => {
            console.log('[StudentDetailModal] Configuración cambió, forzando actualización');
            setConfigVersion(prev => prev + 1);
        });
        return cleanup;
    }, []);
    
    // IMPORTANTE: Obtener el estudiante actualizado del contexto en lugar de usar la prop directamente
    // Esto asegura que el grade se actualice cuando cambie la configuración de período
    const student = useMemo(() => {
        if (!studentProp) return null;
        // Buscar el estudiante en el contexto para obtener su grade actualizado
        const updatedStudent = students.find(s => s.id === studentProp.id);
        
        console.log('[StudentDetailModal] Buscando estudiante actualizado:', {
            propId: studentProp.id,
            propGrade: studentProp.grade,
            contextGrade: updatedStudent?.grade,
            configVersion
        });
        
        // Si lo encontramos, usarlo; sino, usar la prop original
        return updatedStudent || studentProp;
    }, [studentProp, students, configVersion]);

    const attColor = useAttendanceColor(student?.attendance ?? 0);
    const thresholds = getAttendanceThresholds();
    
    // Determinar si mostrar botón de acción y qué tipo
    const attendanceActionButton = useMemo(() => {
        if (!student || student.userType === "admin") return null;
        
        const attendance = student.attendance || 0;
        
        // PELIGRO: Asistencia por debajo del umbral de peligro (rojo) → Sancionar
        if (attendance < thresholds.danger) {
            return {
                type: 'sanction',
                label: t("Sancionar") + " →",
                show: true,
            };
        }
        
        // RIESGO: Asistencia entre peligro y mínimo requerido (ámbar) → Notificar
        if (attendance < thresholds.minAttendance) {
            return {
                type: 'notify',
                label: t("Notificar") + " →",
                show: true,
            };
        }
        
        return { show: false };
    }, [student, thresholds, t]);
    
    // Función para manejar la redirección a reportes
    const handleNavigateToReports = () => {
        onClose(); // Cerrar el modal primero
        navigation.navigate("Reports"); // Navegar a reportes
    };
    
    // Función para manejar la apertura de la modal de edición
    const handleEditUser = () => {
        setShowEditModal(true);
    };

    // Función para manejar el guardado de cambios del usuario
    const handleUserSaved = (updatedUser) => {
        console.log('Usuario guardado en modal principal:', updatedUser);
        setShowEditModal(false);
        
        // Notificar al componente padre si hay un callback
        if (onUserUpdated) {
            onUserUpdated(updatedUser);
        }
        
        onClose();
    };
    
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
                onPress={closeOnBackdrop ? onClose : undefined}
                activeOpacity={1}
                disabled={!closeOnBackdrop}
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
                                    
                                    {/* Descripción y botón de acción en la misma línea */}
                                    <View style={{ 
                                        flexDirection: "row", 
                                        justifyContent: "space-between", 
                                        alignItems: "center",
                                        marginTop: 6,
                                        gap: 8,
                                    }}>
                                        <Text style={{ 
                                            fontSize: 11, 
                                            color: c.text.secondary,
                                            flex: 1,
                                        }}>
                                            {student.attendance >= thresholds.minAttendance
                                                ? t(`Cumple el mínimo requerido (${thresholds.minAttendance.toFixed(0)}%)`)
                                                : t(`⚠ Por debajo del mínimo requerido (${thresholds.minAttendance.toFixed(0)}%)`)}
                                        </Text>
                                        
                                        {/* Botón dinámico de acción */}
                                        {attendanceActionButton.show && (
                                            <TouchableOpacity
                                                onPress={handleNavigateToReports}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    gap: 4,
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                    borderRadius: 6,
                                                    backgroundColor: attendanceActionButton.type === 'sanction' 
                                                        ? c.status.danger + '15' 
                                                        : c.status.warning + '15',
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 11,
                                                    fontWeight: "600",
                                                    color: attendanceActionButton.type === 'sanction' 
                                                        ? c.status.danger 
                                                        : c.status.warning,
                                                }}>
                                                    {attendanceActionButton.label}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
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
                                        text: t("Sin registro ningun biométrico"),
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
                                <Button variant="primary" onPress={handleEditUser}>
                                    {student.userType === "admin" ? t("Editar administrador") : 
                                     student.userType === "teacher" ? t("Editar docente") : 
                                     t("Editar estudiante")}
                                </Button>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Modal de edición */}
            {showEditModal && (
                <EditUserProfileModal
                    user={student}
                    visible={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleUserSaved}
                />
            )}
        </Modal>
    );
}

