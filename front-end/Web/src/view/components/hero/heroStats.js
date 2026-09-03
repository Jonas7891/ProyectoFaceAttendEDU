import React from "react";
import { View, Text } from "react-native";
import { useResponsive } from "../hooks/useResponsive";
import { getTypography } from "../../../core/constants/typography";
import { useTheme } from "../hooks/useTheme";

export default function HeroStats({ stats }) {
    const { fs, sp } = useResponsive();
    const { theme } = useTheme();
    const T = getTypography(fs);
    const c = theme.colors;

    return (
        <View style={{ flexDirection: "row", gap: sp(32) }}>
            {stats.map((s) => (
                <View key={s.label}>
                    <Text style={[T.statValue, { color: s.color ?? c.text.primary }]}>
                        {s.value}
                    </Text>
                    <Text style={[T.statLabel, { color: c.text.secondary }]}>
                        {s.label}
                    </Text>
                </View>
            ))}
        </View>
    );
}
