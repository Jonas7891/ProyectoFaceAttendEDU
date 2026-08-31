// ============================================================
//  FaceAttend EDU — Button (Hero / Landing)
//  Colores desde useTheme() — sin imports de Colors.
// ============================================================

import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useResponsive } from "../hooks/useResponsive";
import { getTypography } from "../constants/typography";
import { useTheme }      from "../hooks/useTheme";


    variant?: "primary" | "outline";
    onPress?: () => void;
};

export default function Button({ label, variant = "primary", onPress }) {
    const { fs, sp }   = useResponsive();
    const { theme }    = useTheme();
    const T            = getTypography(fs);
    const c            = theme.colors;
    const HEIGHT       = sp(48);

    const isPrimary = variant === "primary";

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                height,
                paddingHorizontal: sp(28),
                borderRadius:     sp(12),
                justifyContent:   "center",
                alignItems:       "center",
                backgroundColor:  isPrimary ? c.brand.primary : "transparent",
                borderWidth:      isPrimary ? 0,
                borderColor:      isPrimary ? undefined : c.brand.primary,
            }}
        >
            <Text style={[
                T.buttonMD,
                {
                    lineHeight: fs(18),
                    color: isPrimary ? c.text.onBrand : c.brand.primary,
                },
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}
