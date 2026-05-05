// ============================================================
//  FaceAttend EDU — Shared UI Components (React Native)
// ============================================================
import React from "react";
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "../../constants/colors";

// ── Avatar ──────────────────────────────────────────────────
export function Avatar({ name = "?", size = 36, color = Colors.primary }: {
    name?: string; size?: number; color?: string;
}) {
    const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
    return (
        <View style={{
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: color, alignItems: "center", justifyContent: "center",
        }}>
            <Text style={{ color: "#fff", fontSize: size * 0.36, fontWeight: "600" }}>{initials}</Text>
        </View>
    );
}

// ── Badge ────────────────────────────────────────────────────
type BadgeVariant = "default" | "success" | "warning" | "danger" | "primary";
const BADGE_VARIANTS: Record<BadgeVariant, { bg: string; color: string }> = {
    default: { bg: Colors.border,       color: Colors.muted   },
    success: { bg: "#D1FAE5",           color: "#065F46"      },
    warning: { bg: "#FEF3C7",           color: "#92400E"      },
    danger:  { bg: "#FEE2E2",           color: "#991B1B"      },
    primary: { bg: Colors.primaryLight, color: Colors.primary },
};
export function Badge({ children, variant = "default" }: { children: string; variant?: BadgeVariant }) {
    const v = BADGE_VARIANTS[variant];
    return (
        <View style={{ backgroundColor: v.bg, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" }}>
            <Text style={{ color: v.color, fontSize: 11, fontWeight: "600" }}>{children}</Text>
        </View>
    );
}

// ── Card ─────────────────────────────────────────────────────
export function Card({ children, style, padding = 20 }: {
    children: React.ReactNode; style?: ViewStyle; padding?: number;
}) {
    return (
        <View style={[{
            backgroundColor: Colors.surface,
            borderWidth: 1, borderColor: Colors.border,
            borderRadius: 10, padding,
        }, style]}>
            {children}
        </View>
    );
}

// ── StatCard ─────────────────────────────────────────────────
export function StatCard({ label, value, change, changeLabel, color = Colors.primary, icon }: {
    label: string; value: string | number; change?: number;
    changeLabel?: string; color?: string; icon?: React.ReactNode;
}) {
    const isPositive = (change ?? 0) > 0;
    return (
        <Card style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.muted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
                        {label}
                    </Text>
                    <Text style={{ fontSize: 26, fontWeight: "700", color: Colors.text, lineHeight: 30 }}>{value}</Text>
                    {change !== undefined && (
                        <Text style={{ fontSize: 12, marginTop: 6, color: isPositive ? "#059669" : "#EF4444" }}>
                            {isPositive ? "▲" : "▼"} {Math.abs(change)}% {changeLabel}
                        </Text>
                    )}
                </View>
                {icon && (
                    <View style={{
                        width: 44, height: 44, borderRadius: 10,
                        backgroundColor: color + "18",
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
export function PageHeader({ title, subtitle, actions }: {
    title: string; subtitle?: string; actions?: React.ReactNode;
}) {
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <View>
                <Text style={{ fontSize: 22, fontWeight: "700", color: Colors.text }}>{title}</Text>
                {subtitle && <Text style={{ fontSize: 13, color: Colors.muted, marginTop: 4 }}>{subtitle}</Text>}
            </View>
            {actions && <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>{actions}</View>}
        </View>
    );
}

// ── UIButton ─────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
export function UIButton({ children, variant = "primary", size = "md", onPress, disabled, style }: {
    children: React.ReactNode; variant?: ButtonVariant; size?: ButtonSize;
    onPress?: () => void; disabled?: boolean; style?: ViewStyle;
}) {
    const bgMap: Record<ButtonVariant, string> = {
        primary:   Colors.primary,
        secondary: Colors.primaryLight,
        ghost:     "transparent",
        danger:    "#FEE2E2",
    };
    const colorMap: Record<ButtonVariant, string> = {
        primary:   "#fff",
        secondary: Colors.primary,
        ghost:     Colors.muted,
        danger:    "#EF4444",
    };
    const h: Record<ButtonSize, number> = { sm: 30, md: 36, lg: 42 };
    const fs: Record<ButtonSize, number> = { sm: 12, md: 13, lg: 14 };
    const px: Record<ButtonSize, number> = { sm: 12, md: 16, lg: 20 };

    return (
        <TouchableOpacity
            onPress={disabled ? undefined : onPress}
            style={[{
                height: h[size], paddingHorizontal: px[size],
                backgroundColor: bgMap[variant], borderRadius: 6,
                alignItems: "center", justifyContent: "center",
                opacity: disabled ? 0.5 : 1,
                borderWidth: variant === "ghost" ? 1 : 0,
                borderColor: Colors.border, flexDirection: "row", gap: 6,
            }, style]}
        >
            <Text style={{ color: colorMap[variant], fontSize: fs[size], fontWeight: "500" } as TextStyle}>
                {children}
            </Text>
        </TouchableOpacity>
    );
}

// ── ProgressBar ──────────────────────────────────────────────
export function ProgressBar({ value = 0, max = 100, color = Colors.primary, height = 6 }: {
    value?: number; max?: number; color?: string; height?: number;
}) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <View style={{ height, backgroundColor: Colors.border, borderRadius: 99, overflow: "hidden" }}>
            <View style={{ height: "100%", width: `${pct}%` as any, backgroundColor: color, borderRadius: 99 }} />
        </View>
    );
}

// ── Divider ──────────────────────────────────────────────────
export function Divider({ style }: { style?: ViewStyle }) {
    return <View style={[{ height: 1, backgroundColor: Colors.border }, style]} />;
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({ title, description, icon }: {
    title: string; description?: string; icon?: React.ReactNode;
}) {
    return (
        <View style={{ alignItems: "center", padding: 48 }}>
            {icon && <View style={{ marginBottom: 12 }}>{icon}</View>}
            <Text style={{ fontSize: 15, fontWeight: "600", color: Colors.text, marginBottom: 4 }}>{title}</Text>
            {description && <Text style={{ fontSize: 13, color: Colors.muted, textAlign: "center" }}>{description}</Text>}
        </View>
    );
}

// ── ToggleRow ────────────────────────────────────────────────
export function ToggleRow({ label, description, value, onToggle }: {
    label: string; description?: string; value: boolean; onToggle: () => void;
}) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
            <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.text }}>{label}</Text>
                {description && <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 2 }}>{description}</Text>}
            </View>
            <TouchableOpacity onPress={onToggle} style={{
                width: 44, height: 24, borderRadius: 12,
                backgroundColor: value ? Colors.primary : Colors.border,
                justifyContent: "center", paddingHorizontal: 3,
            }}>
                <View style={{
                    width: 18, height: 18, borderRadius: 9, backgroundColor: "#fff",
                    alignSelf: value ? "flex-end" : "flex-start",
                    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 3, elevation: 2,
                }} />
            </TouchableOpacity>
        </View>
    );
}
