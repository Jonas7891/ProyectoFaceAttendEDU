// ============================================================
//  AccentBlock — Selector de color de acento + preview en vivo
//  UI pura. Sin estado propio, sin rol.
//
//  Props:
//   - previewAccent   : string hex
//   - onPreviewChange : (hex) => void
//   - previewTheme    : tema generado con el hex en preview
// ============================================================
import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Divider } from "../../../../components/common";
import { useTranslation } from "../../../../../core/utils/i18n/hooks/useTranslation";
import { AccentColorSelector, ThemePreview } from "../../../../components/settings/tabs";
import { useSettingsSectionStyles } from "../../modals/useSettingsSectionStyles";

export function AccentBlock({ previewAccent, onPreviewChange, previewTheme }) {
    const { t } = useTranslation();
    const { c, labelStyle, descStyle } = useSettingsSectionStyles();

    return (
        <View style={{ gap: 10 }}>
            {/* Color de acento */}
            <View>
                <Text style={labelStyle}>{t("Color de acento")}</Text>
                <Text style={descStyle}>
                    {t("Este color se aplica a botones principales, tabs activos, barras de progreso, bordes de foco y todos los elementos interactivos. Los cambios se previsualizan abajo — presiona \"Guardar cambios\" para aplicarlos en toda la aplicación.")}
                </Text>
            </View>
            <AccentColorSelector
                previewHex={previewAccent}
                onPreviewChange={onPreviewChange}
            />

            <Divider />

            {/* Preview en vivo */}
            <View style={{ gap: 8 }}>
                <Text style={labelStyle}>{t("Vista previa en vivo")}</Text>
                <ThemePreview previewTheme={previewTheme} />
            </View>

            <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: c.brand.primaryLight,
                borderRadius: 14,
                padding: 12,
            }}>
                <Feather name="info" size={13} color={c.brand.primary} />
                <Text style={{ fontSize: 11, color: c.brand.primary, flex: 1, lineHeight: 18 }}>
                    {t("La preview muestra como se verá el color en botones, badges y elementos activos. Presiona \"Guardar cambios\" para aplicarlo en toda la aplicación.")}
                </Text>
            </View>
        </View>
    );
}
