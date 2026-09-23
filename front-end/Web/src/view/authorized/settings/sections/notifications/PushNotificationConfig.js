// ============================================================
//  PushNotificationToggle — Toggle con input de duración integrado
//
//  Toggle de notificaciones push con input a la derecha para
//  configurar la duración en segundos. Validaciones inline debajo.
//
//  Props:
//   - enabled / onToggle          : bool + setter
//   - duration / onDurationChange : number (en segundos) + setter
//   - description                 : string
// ============================================================

import React, { useState } from "react";
import { View, Text, TextInput, Switch } from "react-native";
import { Divider } from "../../../../components/common";
import { useTranslation } from "../../../../../core/utils/i18n/hooks/useTranslation";
import { useSettingsSectionStyles } from "../../modals/useSettingsSectionStyles";
import { useTheme } from "../../../../components/hooks/useTheme";
import { useDynamicInputWidth } from "../../../../components/hooks/useDynamicInputWidth";

export function PushNotificationToggle({
    enabled,
    onToggle,
    duration,
    onDurationChange,
    description,
}) {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const c = theme.colors;
    
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    // Configuración de caracteres permitidos
    const allowedChars = ["0-9", ".", "s", "m", "i", "n"];
    
    const validateAndUpdate = (text) => {
        // Construir regex dinámicamente desde allowedChars
        const allowedPattern = allowedChars.join("");
        const cleanRegex = new RegExp(`[^${allowedPattern}]`, "gi");
        const cleanText = text.replace(cleanRegex, "");
        setInputValue(cleanText);
        setError("");

        // Si está vacío, solo marcar error
        if (!cleanText || cleanText.trim() === "") {
            setError(t("Campo requerido"));
            return;
        }

        // Parsear según el formato (segundos o minutos)
        let seconds = 0;
        const lowerText = cleanText.toLowerCase();
        
        if (lowerText.endsWith("min")) {
            // Formato en minutos: "0.5min", "1min", "15min"
            const minValue = parseFloat(lowerText.replace("min", ""));
            if (isNaN(minValue)) {
                setError(t("Debe ser un número válido"));
                return;
            }
            seconds = minValue * 60;
        } else if (lowerText.endsWith("s")) {
            // Formato en segundos: "30s", "900s"
            const secValue = parseFloat(lowerText.replace("s", ""));
            if (isNaN(secValue)) {
                setError(t("Debe ser un número válido"));
                return;
            }
            seconds = secValue;
        } else {
            // Solo número sin unidad - asumir segundos
            const num = parseFloat(cleanText);
            if (isNaN(num)) {
                setError(t("Debe ser un número válido"));
                return;
            }
            seconds = num;
        }

        // Validar rango mínimo
        if (seconds < 1) {
            setError(t("Mínimo 1 segundo"));
            return;
        }

        // Validaciones contextuales
        if (seconds <= 3) {
            setError(t("Muy rápido — Las notificaciones desaparecerán casi de inmediato"));
            return;
        }

        // Validar rango máximo (15 minutos = 900 segundos)
        if (seconds > 900) {
            setError(t("Máximo 900 segundos (15 minutos)"));
            return;
        }

        if (seconds > 300) {
            setError(t("Muy largo — Las notificaciones ocuparán espacio por mucho tiempo"));
            return;
        }

        // Si todo está bien, actualizar
        onDurationChange(Math.round(seconds));
    };

    const handleBlur = () => {
        // Si está vacío al hacer blur, mostrar error
        if (!inputValue || inputValue.trim() === "") {
            setError(t("Campo requerido"));
        }
    };

    // Determinar el mensaje contextual según el valor en segundos
    const getContextualMessage = () => {
        if (!inputValue || error) return null;
        
        // Parsear a segundos para validación contextual
        let seconds = 0;
        const lowerText = inputValue.toLowerCase();
        
        if (lowerText.endsWith("min")) {
            const minValue = parseFloat(lowerText.replace("min", ""));
            if (isNaN(minValue)) return null;
            seconds = minValue * 60;
        } else if (lowerText.endsWith("s")) {
            const secValue = parseFloat(lowerText.replace("s", ""));
            if (isNaN(secValue)) return null;
            seconds = secValue;
        } else {
            const num = parseFloat(inputValue);
            if (isNaN(num)) return null;
            seconds = num;
        }

        if (seconds >= 4 && seconds <= 15) {
            return {
                color: c.status.success,
                text: t("Ideal — Tiempo suficiente para leer sin ser intrusiva")
            };
        }
        if (seconds > 15 && seconds <= 60) {
            return {
                color: c.brand.primary,
                text: t("Moderado — Bueno para notificaciones importantes")
            };
        }
        if (seconds > 60 && seconds <= 300) {
            return {
                color: c.brand.primary,
                text: t("Largo — Útil para alertas que requieren atención")
            };
        }
        
        return null;
    };

    const contextualMessage = getContextualMessage();

    // Calcular ancho dinámico del input basado en la cantidad de caracteres
    const inputWidth = useDynamicInputWidth(inputValue, {
        baseWidth: 20,
        pixelsPerChar: 6,
        minChars: 1,
        maxWidth: null,
        charType: allowedChars,
    });

    return (
        <>
            <View style={{ paddingVertical: 12 }}>
                {/* Fila principal con label, input y switch */}
                <View style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    {/* Label */}
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "500",
                            color: c.text.primary,
                            marginBottom: 4,
                        }}>
                            {t("Notificaciones push")}
                        </Text>
                        {description && (
                            <Text style={{
                                fontSize: 12,
                                color: c.text.secondary,
                                lineHeight: 18,
                            }}>
                                {description}
                            </Text>
                        )}
                    </View>

                    {/* Input de duración con label integrado (solo visible si está habilitado) */}
                    {enabled && (
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: c.background.surface,
                            borderWidth: 1,
                            borderColor: error ? c.status.danger : contextualMessage ? contextualMessage.color : c.border.primary,
                            borderRadius: 8,
                            paddingLeft: 8,
                            paddingRight: 8,
                            paddingVertical: 10,
                            marginRight: 12,
                        }}>
                            <Text style={{
                                fontSize: 14,
                                color: c.text.secondary,
                            }}>
                                {t("Duración: ")}
                            </Text>
                            <View style={{ width: inputWidth, alignItems: "center" }}>
                                <TextInput
                                    style={{
                                        fontSize: 14,
                                        color: c.text.primary,
                                        width: "100%",
                                        textAlign: "center",
                                        outlineStyle: "none",
                                    }}
                                    value={inputValue}
                                    onChangeText={validateAndUpdate}
                                    onBlur={handleBlur}
                                    keyboardType="numeric"
                                    placeholder=""
                                    placeholderTextColor={c.text.disabled}
                                />
                            </View>
                        </View>
                    )}

                    {/* Switch */}
                    <Switch
                        value={enabled}
                        onValueChange={onToggle}
                        trackColor={{
                            false: c.interactive.disabled,
                            true: c.brand.primary,
                        }}
                        thumbColor={c.text.onBrand}
                    />
                </View>

                {/* Mensaje de error o contextual - con margin bottom negativo para compensar el padding del contenedor */}
                {enabled && (error || contextualMessage) && (
                    <Text style={{
                        fontSize: 11,
                        color: error ? c.status.danger : contextualMessage?.color,
                        marginTop: 4,
                        marginBottom: -19,
                    }}>
                        {error || contextualMessage?.text}
                    </Text>
                )}
            </View>
            <Divider />
        </>
    );
}
