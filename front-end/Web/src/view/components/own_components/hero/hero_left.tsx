import React from "react";
import { Animated } from "react-native";
import HeroTitle from "./hero_title";
import HeroButtons from "./hero_buttons";
import HeroStats from "./hero_stats";
import { useResponsive } from "../../hooks/use_responsive";

type Stat = { value: string; label: string };

type Props = {
    fadeLeft: Animated.Value;
    slideLeft: Animated.Value;
    title: string;
    accent: string;
    end: string;
    primary: string;
    secondary: string;
    stats: Stat[];
    onPrimary?: () => void;
    onSecondary?: () => void;
};

export default function HeroLeft({ fadeLeft, slideLeft, ...props }: Props) {
    const { sp, vp } = useResponsive();

    return (
        <Animated.View
            style={[
                {
                    flex: 1,
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
