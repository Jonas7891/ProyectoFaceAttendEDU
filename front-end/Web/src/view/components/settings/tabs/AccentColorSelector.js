import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";
import { 
    DEFAULT_VISION_MODE, 
    getInitialCustomColors,
    getDefaultColorsForVision,
    SEMANTIC_SLOTS,
} from "../../../../core/theme/presets";
import { hslToHex, hexToHsl, evaluateColor } from "../../../../core/utils/colorUtils";
import { Divider } from "../../common";
import { VisionModeTabs } from "./VisionModeTabs";
import { ColorPresetSelector } from "./ColorPresetSelector";
import { ColorPickerPanel } from "./ColorPickerPanel";
import { ThemePreview } from "./ThemePreview";

/**
 * AccentColorSelector
 * 
 * Componente COMPLETAMENTE AUTÓNOMO que maneja toda la lógica de:
 * - Estado de colores customizados por modo de visión
 * - Estado inicial (últimos valores guardados) para detección de cambios
 * - Descarte global se maneja desde el padre mediante callback
 * - Reset completo de paleta: resetea TODO a valores originales/default (visible si difiere del default)
 * - Reset individual por slot: restaura al último valor guardado (visible si el slot tiene cambios)
 * - Edición con picker HSL
 * 
 * Props opcionales:
 * - onColorsExport: (customColors) => void - Callback para exportar cambios
 * - onHasChanges: (hasChanges: boolean) => void - Callback para notificar cambios sin guardar
 * - onDiscardRegister: (discardFn) => void - Callback para registrar función de descarte
 * - onSaveSuccessRegister: (commitFn) => void - Callback para registrar función que actualiza initialColors
 * - previewTheme: object - Tema generado para preview en vivo
 */
export function AccentColorSelector({ onColorsExport, onHasChanges, onDiscardRegister, onSaveSuccessRegister, previewTheme }) {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const c = theme.colors;

    // ── Estado central (TODO vive aquí) ───────────────────────
    const [customColors, setCustomColors] = useState(() => getInitialCustomColors());
    const [initialColors, setInitialColors] = useState(() => getInitialCustomColors()); // Para "Descartar cambios"
    const [visionMode, setVisionMode] = useState(DEFAULT_VISION_MODE);
    const [selectedSemantic, setSelectedSemantic] = useState("primary");

    // ── Color actualmente en edición ──────────────────────────
    const currentColor = customColors[visionMode]?.[selectedSemantic] || "#286FE2";
    const [hue, setHue] = useState(() => hexToHsl(currentColor)[0]);
    const [sat, setSat] = useState(() => hexToHsl(currentColor)[1]);
    const [lum, setLum] = useState(() => hexToHsl(currentColor)[2]);

    const currentHex = hslToHex(hue, sat, lum);
    const verdict = evaluateColor(currentHex, t);

    // ── Actualizar HSL cuando cambia el slot o visión ─────────
    useEffect(() => {
        const color = customColors[visionMode]?.[selectedSemantic];
        if (!color) return;
        
        const [h, s, l] = hexToHsl(color);
        setHue(h);
        setSat(s);
        setLum(l);
    }, [visionMode, selectedSemantic, customColors]);

    // ── Exportar cambios al padre cuando se actualizan ────────
    useEffect(() => {
        if (onColorsExport) {
            onColorsExport(customColors);
        }
    }, [customColors, onColorsExport]);

    // ── Detectar si hay cambios sin guardar ───────────────────
    const hasChanges = useMemo(() => {
        return JSON.stringify(customColors) !== JSON.stringify(initialColors);
    }, [customColors, initialColors]);

    // ── Detectar si el slot actual difiere del último guardado ─
    const currentSlotHasChanges = useMemo(() => {
        const currentValue = customColors[visionMode]?.[selectedSemantic];
        const savedValue = initialColors[visionMode]?.[selectedSemantic];
        return currentValue !== savedValue;
    }, [customColors, initialColors, visionMode, selectedSemantic]);

    // ── Detectar si la paleta actual difiere de los valores originales/default ─
    const isDifferentFromDefault = useMemo(() => {
        const defaultColors = getDefaultColorsForVision(visionMode);
        const currentVisionColors = customColors[visionMode] || {};
        return JSON.stringify(currentVisionColors) !== JSON.stringify(defaultColors);
    }, [customColors, visionMode]);

    // ── Notificar al padre sobre cambios ──────────────────────
    useEffect(() => {
        if (onHasChanges) {
            onHasChanges(hasChanges);
        }
    }, [hasChanges, onHasChanges]);

    // ── Registrar función de descarte en el padre ─────────────
    useEffect(() => {
        if (onDiscardRegister) {
            onDiscardRegister(discardChanges);
        }
    }, [onDiscardRegister, initialColors]);

    // ── Registrar función de commit (actualizar initialColors) ─
    useEffect(() => {
        if (onSaveSuccessRegister) {
            onSaveSuccessRegister(() => {
                // Actualizar initialColors al estado actual después de guardar
                setInitialColors({ ...customColors });
            });
        }
    }, [onSaveSuccessRegister, customColors]);

    // ── Handlers ──────────────────────────────────────────────
    function apply(h, s, l) {
        setHue(h);
        setSat(s);
        setLum(l);
        const newHex = hslToHex(h, s, l);
        
        setCustomColors(prev => ({
            ...prev,
            [visionMode]: {
                ...prev[visionMode],
                [selectedSemantic]: newHex,
            },
        }));
    }

    function applyPreset(preset) {
        // Al hacer clic en un slot de la barra, seleccionarlo para edición
        setSelectedSemantic(preset.semantic);
    }

    function resetCurrentSlot() {
        // Restaurar al último valor guardado (initialColors), no al default
        const savedColor = initialColors[visionMode]?.[selectedSemantic];
        if (!savedColor) return;
        
        const [h, s, l] = hexToHsl(savedColor);
        apply(h, s, l);
    }

    function resetAllPalette() {
        // Resetear TODA la paleta a valores originales/default
        setCustomColors(prev => ({
            ...prev,
            [visionMode]: getDefaultColorsForVision(visionMode),
        }));
    }

    function discardChanges() {
        setCustomColors({ ...initialColors });
    }

    // Obtener info del slot actual
    const currentSlot = SEMANTIC_SLOTS.find(s => s.key === selectedSemantic);

    return (
        <View style={{ gap: 16 }}>
            {/* Tabs de visión */}
            <VisionModeTabs 
                visionMode={visionMode} 
                onVisionModeChange={setVisionMode} 
            />

            {/* Selector de presets (barra de colores) */}
            <ColorPresetSelector 
                visionMode={visionMode} 
                customColors={customColors[visionMode] || {}}
                selectedSemantic={selectedSemantic}
                onPresetSelect={applyPreset} 
            />

            {/* Vista previa en vivo */}
            {previewTheme && (
                <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={{ 
                            fontSize: 13, 
                            fontWeight: "600", 
                            color: c.text.secondary 
                        }}>
                            {t("Vista previa en vivo")}
                        </Text>
                        {isDifferentFromDefault && (
                            <TouchableOpacity
                                onPress={resetAllPalette}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    paddingHorizontal: 10,
                                    borderRadius: 8,
                                    backgroundColor: c.background.tertiary,
                                }}
                            >
                                <Feather name="refresh-cw" size={14} color={c.text.secondary} />
                                <Text style={{ fontSize: 12, color: c.text.secondary, fontWeight: "500" }}>
                                    {t("Restablecer paleta")}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <ThemePreview previewTheme={previewTheme} />
                </View>
            )}

            <Divider />

            {/* Información del slot actual */}
            <View style={{ gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ 
                        fontSize: 14, 
                        fontWeight: "600", 
                        color: c.text.primary 
                    }}>
                        {t(currentSlot?.label || "Slot")}
                    </Text>
                    {currentSlotHasChanges && (
                        <TouchableOpacity
                            onPress={resetCurrentSlot}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                                paddingHorizontal: 8,
                                borderRadius: 6,
                                backgroundColor: c.background.tertiary,
                            }}
                        >
                            <Feather name="rotate-ccw" size={14} color={c.text.secondary} />
                            <Text style={{ fontSize: 12, color: c.text.secondary }}>
                                {t("Restablecer")}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={{ 
                    fontSize: 12, 
                    color: c.text.tertiary,
                    lineHeight: 16,
                }}>
                    {t(currentSlot?.description || "")}
                </Text>
            </View>

            {/* Panel de selector de color completo (incluye input HEX y evaluador) */}
            <ColorPickerPanel 
                hue={hue} 
                sat={sat} 
                lum={lum}
                currentHex={currentHex}
                onColorChange={apply}
                verdict={verdict}
            />
        </View>
    );
}
