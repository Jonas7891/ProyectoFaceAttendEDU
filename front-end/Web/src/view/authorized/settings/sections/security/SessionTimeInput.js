// ============================================================
//  SessionTimeInput — Input numérico de tiempo de sesión
//  UI pura. El hint contextual llega por props.
//
//  Props:
//   - value      : string — minutos como string
//   - onChange   : (string) => void
//   - contextHint: (minutes: number) => string — función que
//                  devuelve el hint según el valor y el rol
//   - readOnly   : boolean — solo muestra el valor vigente (quien no
//                  puede guardarlo en el servidor no debe poder editarlo)
// ============================================================
import React from "react";
import { View, Text, TextInput } from "react-native";
import { useTranslation } from "../../../../../core/utils/i18n/hooks/useTranslation";
import { useSettingsSectionStyles } from "../../modals/useSettingsSectionStyles";

export function SessionTimeInput({ value, onChange, contextHint, readOnly = false }) {
    const { t } = useTranslation();
    const { labelStyle, descStyle, inputStyle } = useSettingsSectionStyles();

    const minutes = Number.parseInt(value) || 60;
    const hint = contextHint ? contextHint(minutes) : "";

    return (
        <View>
            <Text style={labelStyle}>{t("Tiempo de sesión (minutos)")}</Text>
            <TextInput
                keyboardType="numeric"
                value={value}
                onChangeText={readOnly ? undefined : onChange}
                editable={!readOnly}
                style={[inputStyle, { width: 140 }, readOnly && { opacity: 0.6 }]}
            />
            <Text style={[descStyle, { marginTop: 8 }]}>
                {t("La sesión se cerrará automáticamente tras este tiempo de inactividad.")}
                {hint}
            </Text>
        </View>
    );
}
