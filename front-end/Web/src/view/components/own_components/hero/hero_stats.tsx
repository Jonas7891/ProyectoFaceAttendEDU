import React from "react";
import { View, Text } from "react-native";
import { useResponsive } from "../../hooks/use_responsive";
import { getTypography } from "../../constants/typography";
import Colors from "../../constants/colors";

type Stat = {
    value: string;
    label: string;
    color?: string;
};

type Props = {
    stats: Stat[];
};

export default function HeroStats({ stats }: Props) {
    const { fs, sp } = useResponsive();
    const T = getTypography(fs);

    return (
        <View style={{ flexDirection: "row", gap: sp(32) }}>
            {stats.map((s) => (
                <View key={s.label}>
                    <Text style={[T.statValue, { color: s.color ?? Colors.text }]}>
                        {s.value}
                    </Text>
                    <Text style={[T.statLabel, { color: Colors.muted }]}>
                        {s.label}
                    </Text>
                </View>
            ))}
        </View>
    );
}
