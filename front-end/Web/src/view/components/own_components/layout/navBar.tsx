import React from "react";
import { View } from "react-native";
import { useResponsive } from "../../hooks/useResponsive";
import Colors from "../../constants/colors";

type Props = {
    left?: React.ReactNode;
    right?: React.ReactNode;
};

export default function Navbar({ left, right }: Props) {
    const { sp } = useResponsive();

    return (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: sp(20),
                paddingVertical: sp(10),
                backgroundColor: Colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
                zIndex: 100,
            }}
        >
            <View>{left}</View>
            <View>{right}</View>
        </View>
    );
}
