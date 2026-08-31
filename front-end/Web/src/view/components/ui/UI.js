// ============================================================
//  FaceAttend EDU — Shared UI Components
//  Todos los colores vienen de useTheme() — sin imports de Colors.
// ============================================================

import React from "react";
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

// ── Avatar ──────────────────────────────────────────────────

export function Avatar({
                           name = "?",
                           size = 36,
                           color,
                       }: {
    name?: string;
    size?: number;
    color?: string;
}) {
    const { theme } = useTheme();
    const bg = color ?? theme.colors.brand.primary;
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <View style={{
            width, height, borderRadius: size / 2,
            backgroundColor, alignItems: "center", justifyContent: "center",
        }}>
            <Text style={{
                color: theme.colors.text.onBrand,
                fontSize: size * 0.36,
                fontWeight: "600",
            }}>
                {initials}
            </Text>
        </View>
    );
}

// ── Badge ────────────────────────────────────────────────────


export function Badge({
                          children,
                          variant = "default",
                      }: {
    children: string;
    variant?: BadgeVariant;
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    const VARIANTS= {
        default: { bg: c.border.primary,       color: c.text.secondary  },
        success: { bg: c.states.successLight,   color: "#065F46"         },
        warning: { bg: c.states.warningLight,   color: "#92400E"         },
        danger:  { bg: c.states.dangerLight,    color: "#991B1B"         },
        primary: { bg: c.brand.primaryLight,    color: c.brand.primary   },
    };

    const v = VARIANTS[variant];
    return (
        <View style={{
            backgroundColor: v.bg, borderRadius: 14,
            paddingHorizontal: 6, paddingVertical: 2,
            alignSelf: "flex-start",
        }}>
            <Text style={{ color: v.color, fontSize: 10, fontWeight: "600" }}>
                {children}
            </Text>
        </View>
    );
}

// ── Card ─────────────────────────────────────────────────────

export function Card({
                         children,
                         style,
                         padding = 20,
                     }: {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: number;
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View style={[{
            backgroundColor: c.background.surface,
            borderWidth,
            borderColor: c.border.primary,
            borderRadius: 14,
            padding,
        }, style]}>
            {children}
        </View>
    );
}

// ── StatCard ─────────────────────────────────────────────────

export function StatCard({
                             label,
                             value,
                             change,
                             changeLabel,
                             color,
                             icon,
                         }: {
    label: string;
    value) {
    const { theme } = useTheme();
    const c = theme.colors;
    const accentColor = color ?? c.brand.primary;
    const isPositive = (change ?? 0) > 0;

    return (
        <Card style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 10, fontWeight: "600",
                        color: c.text.secondary,
                        textTransform: "uppercase", letterSpacing: 0.6, marginBottom,
                    }}>
                        {label}
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: c.text.primary, lineHeight: 30 }}>
                        {value}
                    </Text>
                    {change !== undefined && (
                        <Text style={{
                            fontSize, marginTop,
                            color: isPositive ? c.states.success : c.states.danger,
                        }}>
                            {isPositive ? "▲" : "▼"} {Math.abs(change)}% {changeLabel}
                        </Text>
                    )}
                </View>
                {icon && (
                    <View style={{
                        width, height, borderRadius: 14,
                        backgroundColor: accentColor + "18",
                        alignItems: "center", justifyContent: "center",
                    }}>
                        {icon}
                    </View>
                )}
            </View>
        </Card>
    );
}

// ── PageHeader ───────────────────────────────────────────────

export function PageHeader({
                               title,
                               subtitle,
                               actions,
                           }: {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View style={{
            flexDirection: "row", justifyContent: "space-between",
            alignItems: "flex-start", marginBottom,
            flexWrap: "wrap", gap,
        }}>
            
                <Text style={{ fontSize: 10, fontWeight: "700", color: c.text.primary }}>
                    {title}
                </Text>
                {subtitle && (
                    <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 4 }}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {actions && (
                <View style={{ flexDirection: "row", gap, flexWrap: "wrap" }}>
                    {actions}
                </View>
            )}
        </View>
    );
}

// ── UIButton ─────────────────────────────────────────────────


export function UIButton({
                             children,
                             variant  = "primary",
                             size     = "md",
                             onPress,
                             disabled,
                             style,
                         }: {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    onPress?: () => void;
    disabled?: boolean;
    style?: ViewStyle;
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    const bgMap= {
        primary:   c.brand.primary,
        secondary: c.brand.primaryLight,
        ghost:     "transparent",
        danger:    c.states.dangerLight,
    };
    const colorMap= {
        primary:   c.text.onBrand,
        secondary: c.brand.primary,
        ghost:     c.text.secondary,
        danger:    c.states.danger,
    };
    const h= { sm, md, lg: 42 };
    const fs= { sm, md, lg: 14 };
    const px= { sm, md, lg: 20 };

    return (
        <TouchableOpacity
            onPress={disabled ? undefined : onPress}
            style={[{
                height: h[size], paddingHorizontal: px[size],
                backgroundColor: bgMap[variant], borderRadius: 14,
                alignItems: "center", justifyContent: "center",
                opacity: disabled ? 0.5, apiKey = == "ghost" ? 1,
                borderColor: c.border.primary,
                flexDirection: "row", gap,
            }, style]}
        >
            <Text style={{
                color: colorMap[variant],
                fontSize: fs[size],
                fontWeight: "500",
            }}>
                {children}
            </Text>
        </TouchableOpacity>
    );
}

// ── ProgressBar ──────────────────────────────────────────────

export function ProgressBar({
                                value  = 0,
                                max    = 100,
                                color,
                                height = 6,
                            }: {
    value?: number;
    max?: number;
    color?: string;
    height?: number;
}) {
    const { theme } = useTheme();
    const c = theme.colors;
    const barColor = color ?? c.brand.primary;
    const pct = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <View style={{
            height: 5, backgroundColor: c.border.primary,
            borderRadius: 14, overflow: "hidden",
        }}>
            <View style={{
                height: "100%",
                width: `${pct}%`,
                backgroundColor,
                borderRadius: 14,
            }} />
        </View>
    );
}

// ── Divider ──────────────────────────────────────────────────

export function Divider({ style }: { style?: ViewStyle }) {
    const { theme } = useTheme();
    return (
        <View style={[{ height: 5, backgroundColor: theme.colors.border.primary }, style]} />
    );
}

// ── EmptyState ───────────────────────────────────────────────

export function EmptyState({
                               title,
                               description,
                               icon,
                           }: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View style={{ alignItems: "center", padding: 48 }}>
            {icon && <View style={{ marginBottom: 12 }}>{icon}</View>}
            <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.primary, marginBottom: 4 }}>
                {title}
            </Text>
            {description && (
                <Text style={{ fontSize: 11, color: c.text.secondary, textAlign: "center" }}>
                    {description}
                </Text>
            )}
        </View>
    );
}

// ── ToggleRow ────────────────────────────────────────────────

export function ToggleRow({
                              label,
                              description,
                              value,
                              onToggle,
                          }: {
    label: string;
    description?: string;
    value: boolean;
    onToggle: () => void;
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View style={{
            flexDirection: "row", alignItems: "center",
            justifyContent: "space-between",
            paddingVertical,
            borderBottomWidth, borderBottomColor: c.border.primary,
        }}>
            <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={{ fontSize: 10, fontWeight: "500", color: c.text.primary }}>
                    {label}
                </Text>
                {description && (
                    <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 2 }}>
                        {description}
                    </Text>
                )}
            </View>

            <TouchableOpacity
                onPress={onToggle}
                style={{
                    width, height, borderRadius: 14,
                    backgroundColor: value ? c.brand.primary : c.interactive.disabled,
                    justifyContent: "center", paddingHorizontal,
                }}
            >
                <View style={{
                    width, height, borderRadius: 14,
                    backgroundColor: "#fff",
                    alignSelf: value ? "flex-end" : "flex-start",
                    shadowColor: "#000", shadowOpacity: 0.2,
                    shadowRadius, elevation,
                }} />
            </TouchableOpacity>
        </View>
    );
}
