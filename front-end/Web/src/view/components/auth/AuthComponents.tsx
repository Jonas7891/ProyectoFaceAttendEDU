// ============================================================
//  FaceAttend EDU — Auth Components (View Layer)
//  Componentes puros de UI. Toda lógica vive en useAuthViewModel.
// ============================================================

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

// ── FormField ────────────────────────────────────────────────
// Componente reutilizable para inputs de formulario con icono,
// estado de foco, visibilidad de contraseña y mensaje de error.

interface FormFieldProps {
    label:            string;
    placeholder:      string;
    onChangeText:     (v: string) => void;
    secureTextEntry?: boolean;
    icon?:            any;
    rightIcon?:       any;
    onRightIcon?:     () => void;
    error?:           string;
}

export function FormField({
    label, placeholder, onChangeText,
    secureTextEntry = false, icon, rightIcon, onRightIcon, error,
}: FormFieldProps) {
    const [focused, setFocused] = useState(false);
    const { theme } = useTheme();
    const c = theme.colors;

    const borderColor = error
        ? c.border.error
        : focused
            ? c.border.focus
            : c.border.primary;

    return (
        <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: c.text.primary }}>
                {label}
            </Text>
            <View style={{
                flexDirection: "row", alignItems: "center",
                height: 50, borderWidth: 1.5, borderColor,
                borderRadius: 12, backgroundColor: c.background.app,
                paddingHorizontal: 14, gap: 10,
            }}>
                {icon && <Feather name={icon} size={17} color={c.text.secondary} />}
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={c.text.disabled}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    // @ts-ignore - outlineStyle es válido en react-native-web aunque no esté en los tipos de RN
                    style={{
                        flex: 1, fontSize: 15, color: c.text.primary,
                        outlineStyle: "none",
                    }}
                />
                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIcon}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Feather name={rightIcon} size={17} color={c.text.secondary} />
                    </TouchableOpacity>
                )}
            </View>
            {error ? (
                <Text style={{ fontSize: 12, color: c.border.error }}>{error}</Text>
            ) : null}
        </View>
    );
}

// ── AuthErrorBanner ──────────────────────────────────────────

export function AuthErrorBanner({ message }: { message: string }) {
    const { theme } = useTheme();
    const c = theme.colors;
    if (!message) return null;
    return (
        <View style={{
            marginTop: 14, backgroundColor: c.states.dangerLight,
            borderRadius: 10, padding: 12,
        }}>
            <Text style={{ fontSize: 13, color: c.states.danger }}>{message}</Text>
        </View>
    );
}

// ── AuthFooterLink ───────────────────────────────────────────

export function AuthFooterLink({
    prompt, linkLabel, onPress,
}: {
    prompt: string; linkLabel: string; onPress?: () => void;
}) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 20 }}>
            <Text style={{ fontSize: 14, color: c.text.secondary }}>{prompt}</Text>
            <TouchableOpacity onPress={onPress}>
                <Text style={{ fontSize: 14, color: c.brand.primary, fontWeight: "600" }}>
                    {linkLabel}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// ── BrandPanelCircles ────────────────────────────────────────
// Decoración de fondo para el panel de marca en desktop

export function BrandPanelCircles() {
    return (
        <>
            <View style={{
                position: "absolute", width: 340, height: 340, borderRadius: 170,
                borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
                top: -90, left: -90,
            }} />
            <View style={{
                position: "absolute", width: 500, height: 500, borderRadius: 250,
                borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
                bottom: -130, right: -130,
            }} />
        </>
    );
}

// ── AuthCopyright ─────────────────────────────────────────────
// Pie de página con copyright compartido por todas las pantallas de auth

export function AuthCopyright() {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <Text style={{
            fontSize: 12, color: c.text.secondary,
            textAlign: "center", marginTop: 40,
        }}>
            © FaceAttend EDU {new Date().getFullYear()} — Derechos reservados
        </Text>
    );
}
