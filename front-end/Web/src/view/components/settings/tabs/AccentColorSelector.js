import React, { useState } from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";
import { DEFAULT_VISION_MODE } from "../../../../core/theme/presets";
import { hslToHex, hexToHsl, evaluateColor } from "../../../../core/utils/colorUtils";
import { Divider } from "../../common";
import { VisionModeTabs } from "./VisionModeTabs";
import { ColorPresetSelector } from "./ColorPresetSelector";
import { HSLSliders } from "./HSLSliders";
import { HexInputSection } from "./HexInputSection";
import { ColorEvaluator } from "./ColorEvaluator";
import { ThemePreview } from "./ThemePreview";

export function AccentColorSelector({ previewHex, onPreviewChange, previewTheme }) {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const c = theme.colors;

    const [visionMode, setVisionMode] = useState(DEFAULT_VISION_MODE);
    const [hue, setHue] = useState(() => hexToHsl(previewHex)[0]);
    const [sat, setSat] = useState(() => hexToHsl(previewHex)[1]);
    const [lum, setLum] = useState(() => hexToHsl(previewHex)[2]);

    const currentHex = hslToHex(hue, sat, lum);
    const verdict = evaluateColor(currentHex, t);

    function apply(h, s, l) {
        setHue(h);
        setSat(s);
        setLum(l);
        onPreviewChange(hslToHex(h, s, l));
    }

    function applyPreset(p) {
        const [h, s, l] = hexToHsl(p.color);
        apply(h, s, l);
    }

    function handleHexChange(hex) {
        const [h, s, l] = hexToHsl(hex);
        apply(h, s, l);
    }

    return (
        <View style={{ gap: 16 }}>
            <VisionModeTabs 
                visionMode={visionMode} 
                onVisionModeChange={setVisionMode} 
            />

            <ColorPresetSelector 
                visionMode={visionMode} 
                previewHex={previewHex} 
                onPresetSelect={applyPreset} 
            />

            {/* Vista previa en vivo */}
            {previewTheme && (
                <View style={{ gap: 8 }}>
                    <Text style={{ 
                        fontSize: 13, 
                        fontWeight: "600", 
                        color: c.text.secondary 
                    }}>
                        {t("Vista previa en vivo")}
                    </Text>
                    <ThemePreview previewTheme={previewTheme} />
                </View>
            )}

            <Divider />

            <HSLSliders 
                hue={hue} 
                sat={sat} 
                lum={lum} 
                currentHex={currentHex}
                onHueChange={(v) => apply(v, sat, lum)}
                onSatChange={(v) => apply(hue, v, lum)}
                onLumChange={(v) => apply(hue, sat, v)}
            />

            <HexInputSection 
                currentHex={currentHex} 
                onHexChange={handleHexChange} 
            />

            <ColorEvaluator 
                currentHex={currentHex} 
                verdict={verdict} 
            />
        </View>
    );
}
