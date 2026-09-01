// ============================================================
//  FaceAttend EDU — Navbar
//  Colores desde useTheme() — sin imports de Colors.
// ============================================================

import React from "react";
import { View } from "react-native";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme } from "../hooks/useTheme";

export default function Navbar({ left, right }) {
    const { sp } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: sp(20),
                paddingVertical: sp(10),
                backgroundColor: c.background.surface,
                borderBottomWidth: 1,
                borderBottomColor: c.border.primary,
                zIndex: 10,
            }}
        >
            <View>{left}</View>
            <View>{right}</View>
        </View>
    );
}
