import React from "react";
import { Animated, Text, ViewStyle } from "react-native";
import { useFloatAnimation } from "@/components/hooks/useFloatAnimation";
import { useResponsive } from "@/components/hooks/useResponsive";
import { getTypography } from "@/components/constants/typography";
import Colors from "@/components/constants/colors";

type Props = {
  label: string;
  icon: string;
  delay?: number;
  style?: ViewStyle;
};

export default function FloatingBadge({ label, icon, delay = 0, style }: Props) {
  const translateY = useFloatAnimation(delay);
  const { fs, sp } = useResponsive();
  const T = getTypography(fs);

  return (
      <Animated.View
          style={[
            {
              position: "absolute",
              flexDirection: "row",
              alignItems: "center",
              gap: sp(6),
              backgroundColor: Colors.surface,
              paddingHorizontal: sp(12),
              paddingVertical: sp(8),
              borderRadius: sp(20),
              elevation: 4,
              // Sombra para web
              shadowColor: "#000",
              shadowOffset: { width: 0, height: sp(2) },
              shadowOpacity: 0.10,
              shadowRadius: sp(8),
            },
            { transform: [{ translateY }] },
            style,
          ]}
      >
        <Text style={{ fontSize: fs(14) }}>{icon}</Text>
        <Text style={[T.badgeLabel, { color: Colors.text }]}>{label}</Text>
      </Animated.View>
  );
}
