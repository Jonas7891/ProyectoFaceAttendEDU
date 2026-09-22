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

export interface InputFieldProps {
    label:          string;
    value:          string;
    onChangeText:   (v: string) => void;
    placeholder?:   string;
    keyboardType?:  "default" | "email-address" | "numeric" | "phone-pad";
    /** true → muestra el borde en rojo */
    error?:         boolean;
    /** Texto de ayuda debajo del input */
    hint?:          string;
    /** Activa textarea de 3 líneas */
    multiline?:     boolean;
    /** Si true, oculta el texto (para contraseñas) */
    secureTextEntry?: boolean;
    style?:         ViewStyle;
    /** Número de líneas si multiline = true */
    numberOfLines?:  number;
}

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
}: InputFieldProps) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View style={[{ marginBottom: 14 }, style]}>
            <Text style={{
                fontSize: 12,
                fontWeight: "600",
                color: error ? c.states.danger : c.text.secondary,
                marginBottom: 6,
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
                    minHeight: multiline ? 80 : 40,
                    borderWidth: 1,
                    borderColor: error ? c.states.danger : c.border.primary,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    paddingTop: multiline ? 10 : 0,
                    fontSize: 13,
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
