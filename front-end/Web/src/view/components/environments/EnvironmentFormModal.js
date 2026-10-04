// ============================================================
//  FaceAttend EDU — EnvironmentFormModal
//  Modal para crear/editar ambientes (salones)
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, BaseModal } from "../common";
import TextInput from "../common/inputs/TextInput";
import { useTheme } from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
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
    const c = theme.colors;

    const [form, setForm] = useState(EMPTY_ENV_FORM);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
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
        setError(null);
        setSaving(false);
        setSuccess(false);
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
        
        if (showErrors) setError(null);
    };

    const handleSubmit = async () => {
        setShowErrors(true);
        setSaving(true);
        setError(null);
        
        const err = await onSubmit(form);
        setSaving(false);
        
        if (err) {
            setError(t(err));
        } else {
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 800);
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
                disabled={saving || success}
                leftIcon={
                    saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : success ? (
                        <Feather name="check" size={16} color="#fff" />
                    ) : (
                        <Feather name="home" size={16} color="#fff" />
                    )
                }
            >
                {saving
                    ? t("Guardando...")
                    : success
                    ? t("¡Guardado!")
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
            {/* Error alert */}
            {error && (
                <View
                    style={{
                        backgroundColor: c.status.dangerLight,
                        borderRadius: 12,
                        padding: 14,
                        flexDirection: "row",
                        gap: 10,
                        marginBottom: 20,
                    }}
                >
                    <Feather name="alert-circle" size={16} color={c.status.danger} />
                    <Text style={{ fontSize: 13, color: c.status.danger, flex: 1 }}>
                        {error}
                    </Text>
                </View>
            )}

            {/* Success alert */}
            {success && (
                <View
                    style={{
                        backgroundColor: c.status.successLight,
                        borderRadius: 12,
                        padding: 14,
                        flexDirection: "row",
                        gap: 10,
                        marginBottom: 20,
                    }}
                >
                    <Feather name="check-circle" size={16} color={c.status.success} />
                    <Text style={{ fontSize: 13, color: c.status.successDark, flex: 1 }}>
                        {t("Ambiente guardado correctamente")}
                    </Text>
                </View>
            )}

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
