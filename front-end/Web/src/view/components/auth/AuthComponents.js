// ============================================================
//  FaceAttend EDU — Auth Components (View Layer)
//  Componentes puros de UI para las pantallas de autenticación.
//  Sin lógica de negocio — toda lógica vive en useAuthViewModel.
// ============================================================

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme }       from "../hooks/useTheme";
import { useTranslation } from "../../../i18n/hooks/useTranslation";

// ── FormField ────────────────────────────────────────────────

export function FormField({
    label,
    placeholder,
    onChangeText,
    value,
    secureTextEntry = false,
    icon,
    rightIcon,
    onRightIcon,
    error,
}) {
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
            <Text style={{
                fontSize: 10,
                fontWeight: "500",
                color: c.text.primary
            }}>
                {label}
            </Text>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                height: 44,
                borderWidth: 1.5,
                borderColor: borderColor,
                borderRadius: 14,
                backgroundColor: c.background.app,
                paddingHorizontal: 14,
                gap: 10,
            }}>
                {icon && <Feather name={icon} size={17} color={c.text.secondary} />}
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={c.text.disabled}
                    onChangeText={onChangeText}
                    value={value}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                        flex: 1,
                        fontSize: 11,
                        color: c.text.primary,
                        outlineStyle: "none",
                    }}
                />
                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIcon}
                        hitSlop={{
                            top: 10,
                            bottom: 10,
                            left: 10,
                            right: 10
                        }}
                    >
                        <Feather name={rightIcon} size={17} color={c.text.secondary} />
                    </TouchableOpacity>
                )}
            </View>
            {error ? (
                <Text style={{ fontSize: 11, color: c.border.error }}>
                    {error}
                </Text>
            ) : null}
        </View>
    );
}

// ── AuthErrorBanner ──────────────────────────────────────────

export function AuthErrorBanner({ message }) {
    const { theme } = useTheme();
    const c = theme.colors;
    if (!message) return null;
    return (
        <View style={{
            marginTop: 12,
            backgroundColor: c.states.dangerLight,
            borderRadius: 14,
            padding: 12,
        }}>
            <Text style={{ fontSize: 11, color: c.states.danger }}>
                {message}
            </Text>
        </View>
    );
}

// ── AuthFooterLink ───────────────────────────────────────────

export function AuthFooterLink({ prompt, linkLabel, onPress }) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            marginTop: 20
        }}>
            <Text style={{ fontSize: 11, color: c.text.secondary }}>
                {prompt}
            </Text>
            <TouchableOpacity onPress={onPress}>
                <Text style={{
                    fontSize: 11,
                    color: c.brand.primary,
                    fontWeight: "600"
                }}>
                    {linkLabel}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// ── BrandPanelCircles ────────────────────────────────────────

export function BrandPanelCircles() {
    return (
        <React.Fragment>
            <View style={{
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.10)",
                top: -90,
                left: -90,
            }} />
            <View style={{
                position: "absolute",
                width: 260,
                height: 260,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
                bottom: -130,
                right: -130,
            }} />
        </React.Fragment>
    );
}

// ── AuthCopyright ─────────────────────────────────────────────

export function AuthCopyright() {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c = theme.colors;
    return (
        <Text style={{
            fontSize: 11,
            color: c.text.secondary,
            textAlign: "center",
            marginTop: 12,
        }}>
            {`© FaceAttend EDU ${new Date().getFullYear()} — ${t("Derechos reservados")}`}
        </Text>
    );
}
