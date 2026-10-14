// ============================================================
//  FaceAttend EDU — EnvironmentFormModal
//  Modal para crear/editar ambientes (salones)
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, BaseModal } from "../common";
import TextInput from "../common/inputs/TextInput";
import { useTheme } from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { usePushNotification } from "../common/feedback/PushNotification";
import { getInstitutionConfig } from "../../../core/config/institutionConfig";
import { EMPTY_ENV_FORM } from "../../../viewmodels/useEnvironmentsViewModel";

// Placeholders rotativos para mostrar variedad de identificadores
const IDENTIFIER_PLACEHOLDERS = [
    "301",
    "A-205",
    "Lab 3",
    "B2-104",
    "Aula 12",
    "301-3",
    "Sala A",
    "L-102",
];

const MAX_CAPACITY = 400;

export default function EnvironmentFormModal({
    visible,
    mode, // "register" | "edit"
    environment,
    onClose,
    onSubmit,
}) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const { t } = useTranslation();
    const pushNotification = usePushNotification();
    const c = theme.colors;

    const [form, setForm] = useState(EMPTY_ENV_FORM);
    const [saving, setSaving] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const placeholderIntervalRef = useRef(null);

    useEffect(() => {
        if (visible && mode === "edit" && environment) {
            setForm({
                number: environment.number,
                description: environment.description,
                capacity: environment.capacity ? String(environment.capacity) : "",
            });
        } else if (visible) {
            setForm(EMPTY_ENV_FORM);
        }
        setSaving(false);
        setShowErrors(false);
    }, [visible, mode, environment]);

    // Rotación automática de placeholders cada 3 segundos
    useEffect(() => {
        if (visible) {
            placeholderIntervalRef.current = setInterval(() => {
                setPlaceholderIndex((prev) => (prev + 1) % IDENTIFIER_PLACEHOLDERS.length);
            }, 3000);
        }

        return () => {
            if (placeholderIntervalRef.current) {
                clearInterval(placeholderIntervalRef.current);
            }
        };
    }, [visible]);

    const setField = (key, value) => {
        // Validación especial para capacidad
        if (key === "capacity") {
            // Solo permitir números
            const numericValue = value.replace(/[^0-9]/g, "");
            
            // Limitar a máximo 400
            if (numericValue === "") {
                setForm((prev) => ({ ...prev, [key]: "" }));
            } else {
                const numValue = parseInt(numericValue, 10);
                const cappedValue = Math.min(numValue, MAX_CAPACITY);
                setForm((prev) => ({ ...prev, [key]: String(cappedValue) }));
            }
        } else {
            setForm((prev) => ({ ...prev, [key]: value }));
        }
        
        // No necesitamos limpiar error aquí ya que usamos push notifications
    };

    const handleSubmit = async () => {
        setShowErrors(true);
        setSaving(true);
        
        const config = getInstitutionConfig();
        const err = await onSubmit(form);
        setSaving(false);
        
        if (err) {
            // Mostrar notificación de error
            if (config.pushNotifications) {
                pushNotification.error(
                    t("Error de validación"),
                    t(err),
                    {
                        source: "environment-form",
                        priority: "high",
                        duration: 6000,
                    }
                );
            }
        } else {
            // Mostrar notificación de éxito
            if (config.pushNotifications) {
                pushNotification.success(
                    t("¡Ambiente guardado!"),
                    mode === "register" 
                        ? t("Ambiente registrado correctamente") 
                        : t("Cambios guardados correctamente"),
                    {
                        source: "environment-form",
                        priority: "normal",
                        duration: 3000,
                    }
                );
            }
            onClose();
        }
    };

    const isEmpty = (v) => showErrors && !v.trim();

    const footer = (
        <>
            <Button variant="ghost" size="md" onPress={onClose} disabled={saving}>
                {t("Cancelar")}
            </Button>
            <Button
                variant="primary"
                size="md"
                onPress={handleSubmit}
                disabled={saving}
                leftIcon={
                    saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Feather name="home" size={16} color="#fff" />
                    )
                }
            >
                {saving
                    ? t("Guardando...")
                    : mode === "register"
                    ? t("Registrar ambiente")
                    : t("Guardar cambios")}
            </Button>
        </>
    );

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title={mode === "register" ? t("Nuevo ambiente") : t("Editar ambiente")}
            subtitle={t("Información del salón / espacio")}
            icon="home"
            iconColor={c.brand.primary}
            size="md"
            footer={footer}
        >

            {/* Form fields */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 14 }}>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Identificador del ambiente") + " *"}
                        value={form.number}
                        onChangeText={(v) => setField("number", v)}
                        placeholder={IDENTIFIER_PLACEHOLDERS[placeholderIndex]}
                        error={isEmpty(form.number)}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Capacidad (personas)")}
                        value={form.capacity}
                        onChangeText={(v) => setField("capacity", v)}
                        placeholder="30"
                        keyboardType="numeric"
                        hint={form.capacity.trim() === "" && showErrors ? t("*Se usará capacidad de 30 por defecto") : t(`Opcional • Máx. ${MAX_CAPACITY}`)}
                    />
                </View>
            </View>

            <TextInput
                label={t("Descripción / Ubicación")}
                value={form.description}
                onChangeText={(v) => setField("description", v)}
                placeholder={t("Bloque A, piso 3. Aula de teoría con videobeam.")}
                multiline
                hint={form.description.trim() === "" && showErrors ? t("*Se guardará como 'Sin descripción'") : t("Opcional")}
            />
        </BaseModal>
    );
}
