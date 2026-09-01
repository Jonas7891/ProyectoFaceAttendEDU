import React from "react";
import { Text } from "react-native";
import { useResponsive } from "../hooks/useResponsive";
import { getTypography } from "../constants/typography";
import { useTheme } from "../hooks/useTheme";

export default function HeroTitle({ title, accent, end }) {
    const { fs }    = useResponsive();
    const { theme } = useTheme();
    const T         = getTypography(fs);
    const c         = theme.colors;

    return (
        <Text style={[T.displayLG, { color: c.text.primary }]}>
            {title}
            <Text style={{ color: c.brand.primary }}>{accent}</Text>
            {end}
        </Text>
    );
}
