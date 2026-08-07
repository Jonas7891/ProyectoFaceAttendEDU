// ============================================================
//  FaceAttend EDU — BaseModal (UI reutilizable)
//
//  Encapsula el patrón repetido en los 6+ modales:
//    overlay → container → header → scrollview → footer
//
//  Elimina ~40 líneas de código duplicado por modal.
//
//  Uso:
//    <BaseModal
//      visible={visible}
//      onClose={onClose}
//      title="Nuevo ambiente"
//      subtitle="Información del salón"
//      icon="home"
//      footer={<UIButton onPress={handleSave}>Guardar</UIButton>}
//    >
//      <FormField ... />
//    </BaseModal>
// ============================================================

import React from "react";
import {
    Modal, View, Text, TouchableOpacity, ScrollView,
    KeyboardAvoidingView, Platform, ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme }     from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";

export interface BaseModalProps {
    visible:   boolean;
    onClose:   () => void;
    title:     string;
    subtitle?: string;
    /** Nombre de ícono Feather para el encabezado */
    icon?:     string;
    /** Color del ícono y su fondo (por defecto usa brand.primary) */
    iconColor?: string;
    /** Contenido del footer (botones de acción) */
    footer?:   React.ReactNode;
    /** Ancho máximo del modal en desktop (default 500) */
    maxWidth?: number;
    children:  React.ReactNode;
    /** Estilo extra para el contenedor */
    style?:    ViewStyle;
    /** Color de la barra de acento en la parte superior */
    accentColor?: string;
}

export function BaseModal({
    visible,
    onClose,
    title,
    subtitle,
    icon,
    iconColor,
    footer,
    maxWidth = 500,
    children,
    style,
    accentColor,
}: BaseModalProps) {
    const { theme }   = useTheme();
    const { isSmall } = useResponsive();
    const c           = theme.colors;

    const resolvedIconColor = iconColor ?? c.brand.primary;

    if (!visible) return null;

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: c.background.overlay,
                        justifyContent: "center",
                        alignItems: "center",
                        padding: isSmall ? 12 : 24,
                    }}
                    onPress={onClose}
                    activeOpacity={1}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={e => e.stopPropagation()}
                        style={[{
                            backgroundColor: c.background.surface,
                            borderRadius:    14,
                            width:           isSmall ? ("100%" as any) : maxWidth,
                            maxHeight:       "92%",
                            overflow:        "hidden",
                            shadowColor:     "#000",
                            shadowOpacity:   0.18,
                            shadowRadius:    24,
                            elevation:       14,
                        }, style]}
                    >
                        {/* Barra de acento opcional */}
                        {accentColor && (
                            <View style={{ height: 5, backgroundColor: accentColor }} />
                        )}

                        {/* ── Header ──────────────────────────── */}
                        <View style={{
                            flexDirection:  "row",
                            alignItems:     "center",
                            justifyContent: "space-between",
                            padding:         20,
                            borderBottomWidth: 1,
                            borderBottomColor: c.border.primary,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                                {icon && (
                                    <View style={{
                                        width:           36,
                                        height:          36,
                                        borderRadius:    8,
                                        backgroundColor: resolvedIconColor + "20",
                                        alignItems:      "center",
                                        justifyContent:  "center",
                                    }}>
                                        <Feather name={icon as any} size={18} color={resolvedIconColor} />
                                    </View>
                                )}
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize:   16,
                                        fontWeight: "700",
                                        color:      c.text.primary,
                                    }}>
                                        {title}
                                    </Text>
                                    {subtitle && (
                                        <Text style={{ fontSize: 12, color: c.text.secondary, marginTop: 1 }}>
                                            {subtitle}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Feather name="x" size={20} color={c.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {/* ── Cuerpo ───────────────────────────── */}
                        <ScrollView
                            style={{ padding: 20 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {children}
                        </ScrollView>

                        {/* ── Footer ───────────────────────────── */}
                        {footer && (
                            <View style={{
                                flexDirection:  "row",
                                gap:            8,
                                justifyContent: "flex-end",
                                padding:        16,
                                borderTopWidth: 1,
                                borderTopColor: c.border.primary,
                            }}>
                                {footer}
                            </View>
                        )}
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}
