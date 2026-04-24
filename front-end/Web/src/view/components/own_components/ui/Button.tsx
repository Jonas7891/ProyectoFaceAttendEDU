import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useResponsive } from "../../hooks/use_responsive";
import { getTypography } from "../../constants/typography";
import Colors from "../../constants/colors";

type Props = {
    label: string;
    variant?: "primary" | "outline";
    onPress?: () => void;
};

export default function Button({
                                   label,
                                   variant = "primary",
                                   onPress,
                               }: Props) {
    const { fs, sp } = useResponsive();
    const T = getTypography(fs);

    const HEIGHT = sp(48); // altura fija consistente

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.base,
                {
                    height: HEIGHT,
                    paddingHorizontal: sp(28),
                    borderRadius: sp(12),
                },
                variant === "primary"
                    ? styles.primary
                    : styles.outline,
            ]}
        >
            <Text
                style={[
                    T.buttonMD,
                    {
                        lineHeight: fs(18), //centra el texto verticalmente
                        color:
                            variant === "primary"
                                ? "#fff"
                                : Colors.primary,
                    },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        justifyContent: "center",
        alignItems: "center",
    },
    primary: {
        backgroundColor: Colors.primary,
    },
    outline: {
        borderWidth: 2,
        borderColor: Colors.primary,
    },
});
