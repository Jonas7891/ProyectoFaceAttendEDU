// ============================================================
//  FaceAttend EDU — EditCourseModal
//  Modal para editar información del curso
//  Permite editar nombre, código y fechas
// ============================================================

import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, TextInput, DateInput } from "../../../components/common";
import { useTheme } from "../../../components/hooks/useTheme";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../../../../context/AppDataContext";
import { usePushNotification } from "../../../components/common/feedback/PushNotification";
import { titleCase } from "../../../../core/utils/formatting";

// ── Funciones de formateo ─────────────────────────────────

/**
 * Formatea el nombre del curso: capitaliza primera letra de cada palabra
 */
const formatCourseName = (text) => {
    if (!text) return '';
    return titleCase(text);
};

/**
 * Formatea el código del curso: mayúsculas y sin espacios
 */
const formatCourseCode = (text) => {
    if (!text) return '';
    return text.toUpperCase().replace(/\s+/g, '');
};

// ── Componente principal ─────────────────────────────────

export default function EditCourseModal({
    course,
    onClose,
    onSave,
    visible = true,
    closeOnBackdrop = false,
}) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;
    const { updateCourse, forceRefresh, courses } = useAppData();
    const pushNotification = usePushNotification();

    // Estados del formulario (fechas en formato interno YYYY-MM-DD)
    const [form, setForm] = useState({
        name: course?.name || "",
        code: course?.code || "",
        startDate: course?.startDate || "",
        endDate: course?.endDate || "",
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [showErrors, setShowErrors] = useState(false);

    // Validación del formulario
    const validateForm = useCallback(() => {
        const newErrors = {};

        // Validar nombre
        if (!form.name.trim()) {
            newErrors.name = t("El nombre del curso es requerido");
        } else if (form.name.trim().length < 3) {
            newErrors.name = t("El nombre debe tener al menos 3 caracteres");
        }

        // Validar código
        if (!form.code.trim()) {
            newErrors.code = t("El código del curso es requerido");
        } else if (form.code.trim().length < 2) {
            newErrors.code = t("El código debe tener al menos 2 caracteres");
        } else {
            // Verificar que el código no esté duplicado (excepto el curso actual)
            const isDuplicate = courses.some(c => 
                c.code.toUpperCase() === form.code.trim().toUpperCase() && 
                c.id !== course.id
            );
            if (isDuplicate) {
                newErrors.code = t("Este código ya está en uso por otro curso");
            }
        }

        // Validar fechas
        if (!form.startDate) {
            newErrors.startDate = t("La fecha de inicio es requerida");
        }
        
        if (!form.endDate) {
            newErrors.endDate = t("La fecha de fin es requerida");
        }

        // Validar que la fecha de fin sea posterior a la de inicio
        if (form.startDate && form.endDate) {
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            
            if (end <= start) {
                newErrors.endDate = t("La fecha de fin debe ser posterior a la fecha de inicio");
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form, course.id, courses, t]);

    // Manejo de cambios en el formulario
    const handleFieldChange = useCallback((field, value) => {
        setForm(prev => {
            const updated = { ...prev };
            
            // Formatear automáticamente según el campo
            if (field === "name") {
                updated[field] = formatCourseName(value);
            } else if (field === "code") {
                updated[field] = formatCourseCode(value);
            } else {
                updated[field] = value;
            }

            return updated;
        });

        // Limpiar errores cuando el usuario modifica el campo
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    // Guardar cambios
    const handleSave = useCallback(async () => {
        setShowErrors(true);
        
        if (!validateForm()) {
            pushNotification.error(
                t("Error de validación"),
                t("Por favor corrige los errores en el formulario")
            );
            return;
        }

        setSaving(true);

        try {
            // Crear objeto con los datos actualizados
            const updatedData = {
                name: form.name.trim(),
                code: form.code.trim().toUpperCase(),
                startDate: form.startDate,
                endDate: form.endDate,
            };

            console.log('Actualizando curso:', course.id, 'con datos:', updatedData);

            // Actualizar el curso en el contexto
            await updateCourse(course.id, updatedData);

            // Crear objeto de curso actualizado para el callback
            const updatedCourse = {
                ...course,
                ...updatedData,
            };

            console.log('Curso actualizado exitosamente:', updatedCourse);

            pushNotification.success(
                t("Curso actualizado"),
                t("La información del curso se ha actualizado correctamente")
            );

            // Llamar al callback del padre ANTES de cerrar
            if (onSave) {
                await onSave(updatedCourse);
            }

            // Forzar refresh del contexto
            if (forceRefresh) {
                setTimeout(() => {
                    forceRefresh();
                }, 200);
            }

            onClose();

        } catch (error) {
            console.error("Error al actualizar curso:", error);
            pushNotification.error(
                t("Error"),
                t("No se pudo actualizar la información. Intenta nuevamente.")
            );
        } finally {
            setSaving(false);
        }
    }, [form, course, validateForm, updateCourse, onSave, onClose, pushNotification, forceRefresh, t]);

    if (!visible || !course) return null;

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
                        maxHeight: "90%",
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
                            justifyContent: "space-between",
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                <Feather name="edit-3" size={20} color={c.brand.primary} />
                                <Text style={{ fontSize: 18, fontWeight: "700", color: c.text.primary }}>
                                    {t("Editar curso")}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose}>
                                <Feather name="x" size={18} color={c.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Body */}
                        <ScrollView style={{ maxHeight: 400 }}>
                            <View style={{ padding: 20, gap: 20 }}>
                                {/* Campo Nombre */}
                                <TextInput
                                    label={t("Nombre del curso")}
                                    value={form.name}
                                    onChangeText={(text) => handleFieldChange("name", text)}
                                    placeholder={t("Ej: Programación Orientada a Objetos")}
                                    required
                                    error={showErrors && !!errors.name}
                                    errorMessage={errors.name}
                                    leftIcon={<Feather name="book-open" size={16} color={c.text.secondary} />}
                                    type="text"
                                />

                                {/* Campo Código */}
                                <TextInput
                                    label={t("Código del curso")}
                                    value={form.code}
                                    onChangeText={(text) => handleFieldChange("code", text)}
                                    placeholder={t("Ej: POO-301")}
                                    required
                                    error={showErrors && !!errors.code}
                                    errorMessage={errors.code}
                                    leftIcon={<Feather name="hash" size={16} color={c.text.secondary} />}
                                    type="text"
                                    maxLength={20}
                                />

                                {/* Fechas */}
                                <View style={{
                                    flexDirection: "row",
                                    gap: 12,
                                }}>
                                    {/* Fecha de inicio */}
                                    <View style={{ flex: 1 }}>
                                        <DateInput
                                            label={t("Fecha de inicio")}
                                            value={form.startDate}
                                            onChangeText={(text) => handleFieldChange("startDate", text)}
                                            required
                                            error={showErrors && !!errors.startDate}
                                            errorMessage={errors.startDate}
                                            leftIcon={<Feather name="calendar" size={16} color={c.text.secondary} />}
                                        />
                                    </View>

                                    {/* Fecha de fin */}
                                    <View style={{ flex: 1 }}>
                                        <DateInput
                                            label={t("Fecha de fin")}
                                            value={form.endDate}
                                            onChangeText={(text) => handleFieldChange("endDate", text)}
                                            required
                                            error={showErrors && !!errors.endDate}
                                            errorMessage={errors.endDate}
                                            leftIcon={<Feather name="calendar" size={16} color={c.text.secondary} />}
                                        />
                                    </View>
                                </View>

                                {/* Información adicional */}
                                <View style={{
                                    padding: 12,
                                    backgroundColor: c.background.app,
                                    borderRadius: 8,
                                    borderLeftWidth: 4,
                                    borderLeftColor: c.brand.primary,
                                }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                        <Feather name="info" size={14} color={c.brand.primary} />
                                        <Text style={{
                                            fontSize: 12,
                                            fontWeight: "600",
                                            color: c.text.primary,
                                        }}>
                                            {t("Información importante")}
                                        </Text>
                                    </View>
                                    <Text style={{
                                        fontSize: 11,
                                        color: c.text.secondary,
                                        lineHeight: 16,
                                    }}>
                                        • {t("El código se convertirá automáticamente a mayúsculas")}{"\n"}
                                        • {t("Las fechas determinan el período académico del curso")}{"\n"}
                                        • {t("Los estudiantes asignados mantendrán su vinculación al curso")}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={{
                            padding: 20,
                            borderTopWidth: 1,
                            borderTopColor: c.border.primary,
                            flexDirection: "row",
                            gap: 12,
                            justifyContent: "flex-end",
                        }}>
                            <Button
                                variant="ghost"
                                onPress={onClose}
                                disabled={saving}
                            >
                                {t("Cancelar")}
                            </Button>
                            <Button
                                variant="primary"
                                onPress={handleSave}
                                loading={saving}
                                disabled={saving}
                            >
                                {saving ? t("Guardando...") : t("Guardar cambios")}
                            </Button>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
