// ============================================================
//  FaceAttend EDU — useSettingsSectionStyles
//
//  Hook de estilos compartidos para todas las secciones de
//  configuración. Centraliza labelStyle, descStyle, inputStyle
//  y sectionTitle que antes estaban triplicados en cada archivo.
// ============================================================

import { useTheme } from "../../../components/hooks/useTheme";

export function useSettingsSectionStyles() {
    const { theme } = useTheme();
    const c = theme.colors;

    return {
        c,
        labelStyle: {
            fontSize: 10,
            fontWeight: "500",
            color: c.text.primary,
            marginBottom: 6,
        },
        descStyle: {
            fontSize: 11,
            color: c.text.secondary,
            marginTop: 4,
            lineHeight: 18,
        },
        inputStyle: {
            height: 44,
            borderWidth: 1.5,
            borderColor: c.border.primary,
            borderRadius: 14,
            paddingHorizontal: 14,
            fontSize: 11,
            color: c.text.primary,
            backgroundColor: c.background.surface,
        },
        sectionTitle: {
            fontSize: 10,
            fontWeight: "700",
            color: c.text.primary,
        },
    };
}
