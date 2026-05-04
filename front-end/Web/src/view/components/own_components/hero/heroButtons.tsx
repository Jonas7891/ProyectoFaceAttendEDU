import React from "react";
import { View } from "react-native";
import Button from "../ui/button";
import { useResponsive } from "../../hooks/useResponsive";

type Props = {
    primary: string;
    secondary: string;
    onPrimary?: () => void;
    onSecondary?: () => void;
};

export default function HeroButtons({
                                        primary,
                                        secondary,
                                        onPrimary,
                                        onSecondary,
                                    }: Props) {
    const { sp } = useResponsive();

    return (
        <View style={{ flexDirection: "row", gap: sp(12) }}>
            <Button label={primary} onPress={onPrimary} />
            <Button label={secondary} variant="outline" onPress={onSecondary} />
        </View>
    );
}
