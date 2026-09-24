// ============================================================
//  AccentBlock — Selector de paleta semántica completa
//  UI pura que renderiza el selector autónomo.
//
//  Props:
//   - onColorsExport  : (customColors) => void - Callback opcional para cuando el componente guarde
//   - onHasChanges    : (hasChanges: boolean) => void - Callback para notificar cambios sin guardar
//   - onDiscardRegister: (discardFn) => void - Callback para registrar función de descarte
//   - onSaveSuccessRegister: (commitFn) => void - Callback para registrar función de commit
//   - previewTheme    : Tema generado con los colores en preview
// ============================================================
import React from "react";
import { View, Text } from "react-native";
import { useTranslation } from "../../../../../core/utils/i18n/hooks/useTranslation";
import { AccentColorSelector } from "../../../../components/settings/tabs";
import { useSettingsSectionStyles } from "../../modals/useSettingsSectionStyles";

export function AccentBlock({ onColorsExport, onHasChanges, onDiscardRegister, onSaveSuccessRegister, previewTheme }) {
    const { t } = useTranslation();
    const { labelStyle, descStyle } = useSettingsSectionStyles();

    return (
        <View style={{ gap: 10 }}>
            {/* Paleta de colores semánticos */}
            <View>
                <Text style={labelStyle}>{t("Paleta de colores")}</Text>
                <Text style={descStyle}>
                    {t("Personaliza los colores semánticos de la aplicación: Primario (interacción), Correcto (éxitos), Advertencias, Errores y Fuentes. Los cambios se previsualizan abajo — presiona \"Guardar cambios\" para aplicarlos en toda la aplicación.")}
                </Text>
            </View>

            {/* Selector de colores autónomo */}
            <AccentColorSelector
                onColorsExport={onColorsExport}
                onHasChanges={onHasChanges}
                onDiscardRegister={onDiscardRegister}
                onSaveSuccessRegister={onSaveSuccessRegister}
                previewTheme={previewTheme}
            />
        </View>
    );
}
