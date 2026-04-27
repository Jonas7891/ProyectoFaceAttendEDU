import React from "react";
import { Animated, Image, View } from "react-native";
import FloatingBadge from "../ui/floatingBadge";
import { useResponsive } from "../../hooks/useResponsive";
import { ViewStyle } from "react-native";
import Colors from "../../constants/colors";

type Badge = {
    label: string;
    icon: string;
    delay: number;
    style: ViewStyle;
};

type Props = {
    fadeRight: Animated.Value;
    slideRight: Animated.Value;
    badges: Badge[];
};

export default function HeroRight({ fadeRight, slideRight, badges }: Props) {
    const { sp, isSmall } = useResponsive();

    const containerSize = isSmall ? sp(260) : sp(400);
    const circleSize    = isSmall ? sp(200) : sp(320);
    const logoSize      = isSmall ? sp(120) : sp(200);

    return (
        <Animated.View
            style={[
                {
                    width: containerSize,
                    height: containerSize,
                    alignItems: "center",
                    justifyContent: "center",
                },
                {
                    opacity: fadeRight,
                    transform: [{ translateX: slideRight }],
                },
            ]}
        >
            {/* Círculo decorativo */}
            <View
                style={{
                    position: "absolute",
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    backgroundColor: Colors.primaryLight,
                    opacity: 0.6,
                }}
            />

            {/* Logo central */}
            <Image
                source={require("../../../../assets/images/splash-icon.png")}
                style={{ width: logoSize, height: logoSize, zIndex: 1 }}
                resizeMode="contain"
            />

            {/* Badges flotantes */}
            {badges.map((b) => (
                <FloatingBadge
                    key={b.label}
                    label={b.label}
                    icon={b.icon}
                    delay={b.delay}
                    style={b.style}
                />
            ))}
        </Animated.View>
    );
}
