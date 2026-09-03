import React from "react";
import { Animated, Image, View } from "react-native";
import FloatingBadge from "../common/badges/FloatingBadge";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme }      from "../hooks/useTheme";

export default function HeroRight({ fadeRight, slideRight, badges }) {
    const { sp, isSmall } = useResponsive();
    const { theme }       = useTheme();
    const c               = theme.colors;

    const containerSize = isSmall ? sp(260) : sp(400);
    const circleSize    = isSmall ? sp(200) : sp(320);
    const logoSize      = isSmall ? sp(120) : sp(200);

    return (
        <Animated.View style={[
            { width: containerSize, height: containerSize, alignItems: "center", justifyContent: "center" },
            { opacity: fadeRight, transform: [{ translateX: slideRight }] },
        ]}>
            {/* Círculo decorativo — usa el accent */}
            <View style={{
                position:        "absolute",
                width: circleSize,
                height: circleSize,
                borderRadius:    circleSize / 2,
                backgroundColor: c.brand.primaryLight,
                opacity:         0.7,
            }} />

            <Image
                source={require("../../../assets/images/splash-icon.png")}
                style={{ width: logoSize, height: logoSize, zIndex: 1 }}
                resizeMode="contain"
            />

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
