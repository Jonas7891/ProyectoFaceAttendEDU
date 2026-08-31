// ============================================================
//  FaceAttend EDU — InputField (UI reutilizable)
//
//  Input de formulario con label, ícono opcional, estado
//  de error/hint y soporte para multiline.
//  Usado en modales de gestión (Environments, RegisterStudent, etc.)
//
//  Para el FormField de autenticación (con ícono lateral y foco
//  animado), ver AuthComponents.tsx.
//
//  Uso:
//    <InputField
//      label="Nombre *"
//      value={form.name}
//      onChangeText={v => setField("name", v)}
//      placeholder="Ej: Ana García"
//      error={showErrors && !form.name}
//    />
// ============================================================

import React from "react";
import { View, Text, TextInput, ViewStyle } from "react-native";
import { useTheme } from "../hooks/useTheme";

/** @deprecated Usa `InputField` en lugar de `FormField` para componentes de gestión */
export const FormField = InputField;

export function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    error = false,
    hint,
    multiline = false,
    secureTextEntry = false,
    style,
    numberOfLines = 3,
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View style={[{ marginBottom: 14 }, style]}>
            <Text style={{
                fontSize: 10, fontWeight: "600",
                color: error ? c.states.danger : c.text.secondary,
                marginBottom,
            }}>
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={c.text.disabled}
                keyboardType={keyboardType ?? "default"}
                secureTextEntry={secureTextEntry}
                multiline={multiline}
                numberOfLines={multiline ? numberOfLines : 1}
                style={{
                    minHeight: multiline ? 80,
                    borderWidth,
                    borderColor: error ? c.states.danger : c.border.primary,
                    borderRadius: 14,
                    paddingHorizontal,
                    paddingTop: multiline ? 10,
                    fontSize,
                    backgroundColor: c.background.app,
                    color: c.text.primary,
                    textAlignVertical: multiline ? "top" : "center",
                }}
            />
            {hint && (
                <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 4 }}>
                    {hint}
                </Text>
            )}
        </View>
    );
}
