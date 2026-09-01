import React from "react";
import { Animated } from "react-native";
import HeroTitle from "./heroTitle";
import HeroButtons from "./heroButtons";
import HeroStats from "./heroStats";
import { useResponsive } from "../hooks/useResponsive";

export default function HeroLeft({ fadeLeft, slideLeft, ...props }) {
    const { sp, vp } = useResponsive();

    return (
        <Animated.View
            style={[
                { flex: 1,
                    minWidth: sp(300),
                    maxWidth: sp(600),
                    paddingTop: vp(6),
                    gap: sp(36),
                },
                {
                    opacity: fadeLeft,
                    transform: [{ translateX: slideLeft }],
                },
            ]}
        >
            <HeroTitle title={props.title} accent={props.accent} end={props.end} />
            <HeroButtons
                primary={props.primary}
                secondary={props.secondary}
                onPrimary={props.onPrimary}
                onSecondary={props.onSecondary}
            />
            <HeroStats stats={props.stats} />
        </Animated.View>
    );
}
