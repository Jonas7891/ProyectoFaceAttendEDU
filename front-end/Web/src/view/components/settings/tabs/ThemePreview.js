import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "../../../../i18n/hooks/useTranslation";

export function ThemePreview({ previewTheme }) {
    const { t } = useTranslation();
    const c = previewTheme.colors;

    return (
        <View style={{
            borderWidth: 1,
            borderColor: c.border.primary,
            borderRadius: 14,
            overflow: "hidden"
        }}>
            <View style={{
                backgroundColor: c.background.surface,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                borderBottomWidth: 1,
                borderBottomColor: c.border.primary,
            }}>
                <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 14,
                    backgroundColor: c.brand.primary
                }} />
                <Text style={{ fontSize: 11, color: c.text.secondary }}>
                    {t("Vista previa en vivo")}
                </Text>
                <View style={{
                    marginLeft: "auto",
                    backgroundColor: c.brand.primaryLight,
                    borderRadius: 14,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                }}>
                    <Text style={{
                        fontSize: 11,
                        color: c.brand.primary,
                        fontWeight: "700"
                    }}>
                        {t("SIN GUARDAR")}
                    </Text>
                </View>
            </View>
            <View style={{
                backgroundColor: c.background.app,
                padding: 14,
                gap: 8
            }}>
                {/* Barra + badge */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10
                }}>
                    <View style={{
                        flex: 1,
                        height: 5,
                        backgroundColor: c.border.primary,
                        borderRadius: 99
                    }}>
                        <View style={{
                            height: "100%",
                            width: "72%",
                            backgroundColor: c.brand.primary,
                            borderRadius: 99
                        }} />
                    </View>
                    <View style={{
                        backgroundColor: c.brand.primaryLight,
                        borderRadius: 14,
                        paddingHorizontal: 8,
                        paddingVertical: 2
                    }}>
                        <Text style={{
                            fontSize: 11,
                            color: c.brand.primary,
                            fontWeight: "600"
                        }}>
                            72%
                        </Text>
                    </View>
                </View>
                {/* Botones */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                    <View style={{
                        flex: 1,
                        backgroundColor: c.brand.primary,
                        borderRadius: 14,
                        padding: 10,
                        alignItems: "center"
                    }}>
                        <Text style={{
                            fontSize: 11,
                            color: "#fff",
                            fontWeight: "600"
                        }}>
                            {t("Primario")}
                        </Text>
                    </View>
                    <View style={{
                        flex: 1,
                        borderRadius: 14,
                        padding: 10,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: c.brand.primary
                    }}>
                        <Text style={{
                            fontSize: 11,
                            color: c.brand.primary,
                            fontWeight: "600"
                        }}>
                            {t("Outline")}
                        </Text>
                    </View>
                    <View style={{
                        flex: 1,
                        backgroundColor: c.interactive.disabled,
                        borderRadius: 14,
                        padding: 10,
                        alignItems: "center"
                    }}>
                        <Text style={{
                            fontSize: 11,
                            color: c.text.secondary,
                            fontWeight: "600"
                        }}>
                            {t("Ghost")}
                        </Text>
                    </View>
                </View>
                {/* Badges */}
                <View style={{
                    flexDirection: "row",
                    gap: 6,
                    flexWrap: "wrap"
                }}>
                    {[
                        { labelKey: "Activo", bg: c.brand.primaryLight, color: c.brand.primary },
                        { labelKey: "Éxito", bg: c.states.successLight, color: "#065F46" },
                        { labelKey: "Advertencia", bg: c.states.warningLight, color: "#92400E" },
                        { labelKey: "Peligro", bg: c.states.dangerLight, color: "#991B1B" },
                    ].map(b => (
                        <View
                            key={b.labelKey}
                            style={{
                                backgroundColor: b.bg,
                                borderRadius: 14,
                                paddingHorizontal: 8,
                                paddingVertical: 2
                            }}
                        >
                            <Text style={{
                                fontSize: 11,
                                color: b.color,
                                fontWeight: "600"
                            }}>
                                {t(b.labelKey)}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
