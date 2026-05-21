// ============================================================
//  FaceAttend EDU — FloatingBadge
//  Colores desde useTheme() — sin imports de Colors.
// ============================================================

import React from "react";
import { Animated, Text, ViewStyle } from "react-native";
import { useFloatAnimation } from "../../hooks/useFloatAnimation";
import { useResponsive }     from "../../hooks/useResponsive";
import { getTypography }     from "../../constants/typography";
import { useTheme }          from "../../hooks/useTheme";

type Props = {
    label:   string;
    icon:    string;
    delay?:  number;
    style?:  ViewStyle;
};

export default function FloatingBadge({ label, icon, delay = 0, style }: Props) {
    const translateY   = useFloatAnimation(delay);
    const { fs, sp }   = useResponsive();
    const { theme }    = useTheme();
    const T            = getTypography(fs);
    const c            = theme.colors;

    return (
        <Animated.View style={[
            {
                position:         "absolute",
                flexDirection:    "row",
                alignItems:       "center",
                gap:              sp(6),
                backgroundColor:  c.background.surface,
                paddingHorizontal: sp(12),
                paddingVertical:  sp(8),
                borderRadius:     sp(20),
                elevation:        4,
                shadowColor:      "#000",
                shadowOffset:     { width: 0, height: sp(2) },
                shadowOpacity:    0.10,
                shadowRadius:     sp(8),
            },
            { transform: [{ translateY }] },
            style,
        ]}>
            <Text style={{ fontSize: fs(14) }}>{icon}</Text>
            <Text style={[T.badgeLabel, { color: c.text.primary }]}>{label}</Text>
        </Animated.View>
    );
}
