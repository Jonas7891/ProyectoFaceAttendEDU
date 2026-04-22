import React from "react";
import { Text } from "react-native";
import { useResponsive } from "@/components/hooks/useResponsive";
import { getTypography } from "@/components/constants/typography";
import Colors from "@/components/constants/colors";

type Props = {
    title: string;
    accent: string;
    end: string;
};

export default function HeroTitle({ title, accent, end }: Props) {
    const { fs } = useResponsive();
    const T = getTypography(fs);

    return (
        <Text style={[T.displayLG, { color: Colors.text }]}>
            {title}
            <Text style={{ color: Colors.primary }}>{accent}</Text>
            {end}
        </Text>
    );
}
