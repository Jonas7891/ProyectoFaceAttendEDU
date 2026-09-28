import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { VISION_PRESETS } from "../../../../core/theme/presets";

export function ColorPresetSelector({ visionMode, previewHex, onPresetSelect }) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View style={{ gap: 10 }}>
            {/* Barra de colores */}
            <View style={{
                flexDirection: "row",
                height: 34,
                borderRadius: 14,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: c.border.primary,
            }}>
                {VISION_PRESETS[visionMode].map(preset => {
                    const active = previewHex.toLowerCase() === preset.color.toLowerCase();
                    return (
                        <TouchableOpacity
                            key={preset.key}
                            onPress={() => onPresetSelect(preset)}
                            style={{
                                flex: 1,
                                backgroundColor: preset.color,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRightWidth: preset.key === VISION_PRESETS[visionMode][VISION_PRESETS[visionMode].length - 1].key ? 0 : 1,
                                borderRightColor: "rgba(255, 255, 255, 0.2)",
                            }}
                        >
                            {active && (
                                <View style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                                    borderRadius: 20,
                                    width: 25,
                                    height: 25,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <Feather name="check" size={16} color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Nombres abajo de cada color */}
            <View style={{
                flexDirection: "row",
            }}>
                {VISION_PRESETS[visionMode].map(preset => {
                    const active = previewHex.toLowerCase() === preset.color.toLowerCase();
                    return (
                        <View
                            key={preset.key}
                            style={{
                                flex: 1,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{
                                fontSize: 11,
                                fontWeight: active ? "600" : "400",
                                color: active ? c.brand.primary : c.text.secondary,
                            }}>
                                {preset.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
