import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../../../i18n/hooks/useTranslation";
import {
    VISION_PRESETS,
    VISION_MODES,
    VISION_DESCRIPTIONS,
    DEFAULT_VISION_MODE,
} from "../../../../core/theme/presets";
import { hslToHex, hexToHsl, evaluateColor } from "../colorUtils";
import { HexInput } from "./HexInput";
import { WcagBadge } from "./WcagBadge";
import { ContrastBar } from "./ContrastBar";
import { Divider } from "../../common";

export function AccentColorSelector({ previewHex, onPreviewChange }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    const [visionMode, setVisionMode] = useState(DEFAULT_VISION_MODE);
    const [hue, setHue] = useState(() => hexToHsl(previewHex)[0]);
    const [sat, setSat] = useState(() => hexToHsl(previewHex)[1]);
    const [lum, setLum] = useState(() => hexToHsl(previewHex)[2]);
    const [showHexInput, setShowHexInput] = useState(false);

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

    // Etiquetas descriptivas para cada slider
    const sliderDescriptions = {
        hue: {
            ranges: [
                { max: 30, label: t("🔴 Rojo") },
                { max: 60, label: t("🟠 Naranja") },
                { max: 150, label: t("🟢 Verde") },
                { max: 200, label: t("🩵 Cian") },
                { max: 270, label: t("🔵 Azul") },
                { max: 300, label: t("🟣 Violeta") },
                { max: 330, label: t("🩷 Rosa") },
                { max: 360, label: t("🔴 Rojo") },
            ],
            get: (v) => sliderDescriptions.hue.ranges.find(r => v < r.max)?.label ?? t("Rojo")
        },
        sat: (v) =>
            v < 15 ? t("Gris / neutro") :
            v < 40 ? t("Suave") :
            v < 70 ? t("Equilibrado") :
            v < 90 ? t("Vivo") : t("Muy intenso"),
        lum: (v) =>
            v < 20 ? t("Casi negro") :
            v < 35 ? t("Oscuro") :
            v < 55 ? t("Medio — ideal ✓") :
            v < 70 ? t("Claro") : t("Muy claro"),
    };

    return (
        <View style={{ gap: 16 }}>
            {/* ── Tabs de visión ── */}
            <View style={{
                backgroundColor: c.background.app,
                borderRadius: 14,
                padding: 8,
                borderWidth: 1,
                borderColor: c.border.primary,
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
            }}>
                {VISION_MODES.map(vm => {
                    const active = visionMode === vm;
                    return (
                        <TouchableOpacity
                            key={vm}
                            onPress={() => setVisionMode(vm)}
                            style={{
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                borderRadius: 14,
                                backgroundColor: active ? c.brand.primary : "transparent",
                            }}
                        >
                            <Text style={{
                                fontSize: 10,
                                fontWeight: active ? "600" : "400",
                                color: active ? "#fff" : c.text.secondary,
                            }}>
                                {vm === "normal" ? t("Normal") :
                                    vm === "deuteranopia" ? t("Deuteranopia") :
                                        vm === "protanopia" ? t("Protanopia") :
                                            vm === "tritanopia" ? t("Tritanopia") : t("Acromatopsia")}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Descripción + strip */}
            <View style={{ gap: 6 }}>
                <Text style={{
                    fontSize: 11,
                    color: c.text.secondary,
                    lineHeight: 16
                }}>
                    {VISION_DESCRIPTIONS[visionMode]}
                </Text>
                <View style={{
                    flexDirection: "row",
                    height: 28,
                    borderRadius: 14,
                    overflow: "hidden"
                }}>
                    {VISION_PRESETS[visionMode].map(p => (
                        <View
                            key={p.key}
                            style={{
                                flex: 1,
                                backgroundColor: p.color
                            }}
                        />
                    ))}
                </View>
            </View>

            {/* ── Presets ── */}
            <View style={{
                flexDirection: "row",
                gap: 10,
                alignItems: "center"
            }}>
                {VISION_PRESETS[visionMode].map(preset => {
                    const active = previewHex.toLowerCase() === preset.color.toLowerCase();
                    return (
                        <TouchableOpacity
                            key={preset.key}
                            onPress={() => applyPreset(preset)}
                            style={{ alignItems: "center", gap: 4 }}
                        >
                            <View style={{
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                backgroundColor: preset.color,
                                alignItems: "center",
                                justifyContent: "center",
                                borderWidth: active ? 2.5 : 0,
                                borderColor: "#fff",
                                shadowColor: active ? preset.color : "transparent",
                                shadowOpacity: active ? 0.6 : 0,
                                shadowRadius: 8,
                                elevation: active ? 4 : 0,
                            }}>
                                {active && <Feather name="check" size={14} color="#fff" />}
                            </View>
                            <Text style={{
                                fontSize: 11,
                                color: active ? c.brand.primary : c.text.secondary
                            }}>
                                {preset.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <Divider />

            {/* ── Sliders HSL con etiquetas descriptivas ── */}
            <View style={{ gap: 14 }}>
                {[
                    {
                        label: t("Tono"),
                        val: hue,
                        min: 0,
                        max: 360,
                        onChange: (v) => apply(v, sat, lum),
                        suffix: "°",
                        desc: sliderDescriptions.hue.get(hue),
                        gradient: "hue",
                    },
                    {
                        label: t("Saturación"),
                        val: sat,
                        min: 0,
                        max: 100,
                        onChange: (v) => apply(hue, v, lum),
                        suffix: "%",
                        desc: sliderDescriptions.sat(sat),
                        hint: sat < 20
                            ? t("⚠ Muy bajo — el color se verá gris")
                            : sat > 90
                            ? t("⚠ Muy alto — puede fatigar la vista")
                            : null,
                    },
                    {
                        label: t("Luminosidad"),
                        val: lum,
                        min: 0,
                        max: 100,
                        onChange: (v) => apply(hue, sat, v),
                        suffix: "%",
                        desc: sliderDescriptions.lum(lum),
                        hint: lum > 75
                            ? t("⚠ Muy claro — el texto blanco encima no será legible")
                            : lum < 22
                            ? t("⚠ Muy oscuro — puede confundirse con el texto")
                            : null,
                    },
                ].map(sl => (
                    <View key={sl.label} style={{ gap: 5 }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between"
                        }}>
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6
                            }}>
                                <Text style={{
                                    fontSize: 11,
                                    color: c.text.secondary
                                }}>
                                    {sl.label}
                                </Text>
                                <Text style={{
                                    fontSize: 11,
                                    color: c.text.disabled
                                }}>
                                    — {sl.desc}
                                </Text>
                            </View>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: "700",
                                color: c.text.primary
                            }}>
                                {sl.val}{sl.suffix}
                            </Text>
                        </View>
                        <Slider
                            minimumValue={sl.min}
                            maximumValue={sl.max}
                            step={1}
                            value={sl.val}
                            onValueChange={sl.onChange}
                            minimumTrackTintColor={currentHex}
                            maximumTrackTintColor={c.border.primary}
                        />
                        {sl.hint && (
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5
                            }}>
                                <Text style={{
                                    fontSize: 11,
                                    color: "#F59E0B"
                                }}>
                                    {sl.hint}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            {/* ── Input HEX manual ── */}
            <TouchableOpacity
                onPress={() => setShowHexInput(v => !v)}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6
                }}
            >
                <Feather
                    name={showHexInput ? "chevron-up" : "chevron-down"}
                    size={13}
                    color={c.text.secondary}
                />
                <Text style={{ fontSize: 11, color: c.text.secondary }}>
                    {showHexInput ? t("Ocultar entrada HEX") : t("Ingresar código HEX manualmente")}
                </Text>
            </TouchableOpacity>
            {showHexInput && (
                <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 11, color: c.text.secondary }}>
                        {t("Pega directamente un color de tu paleta de marca, Figma, o cualquier herramienta.")}
                    </Text>
                    <HexInput value={currentHex} onChange={handleHexChange} />
                </View>
            )}

            {/* ── Evaluador de color mejorado ── */}
            <View style={{
                backgroundColor: c.background.app,
                borderRadius: 14,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: c.border.primary,
            }}>
                {/* Header */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border.primary,
                }}>
                    <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 14,
                        backgroundColor: currentHex,
                        borderWidth: 1,
                        borderColor: c.border.secondary,
                    }} />
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: c.text.primary,
                            fontFamily: "monospace"
                        }}>
                            {currentHex.toUpperCase()}
                        </Text>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6
                        }}>
                            <View style={{
                                width: 8,
                                height: 8,
                                borderRadius: 14,
                                backgroundColor: verdict.scoreColor,
                            }} />
                            <Text style={{
                                fontSize: 10,
                                fontWeight: "600",
                                color: verdict.scoreColor
                            }}>
                                {(() => {
                                    const s = t(verdict.score);
                                    return s.charAt(0).toUpperCase() + s.slice(1);
                                })()}
                            </Text>
                            <WcagBadge level={verdict.wcagLevel} />
                        </View>
                    </View>
                </View>

                {/* Barra de contraste */}
                <View style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border.primary
                }}>
                    <ContrastBar ratio={verdict.contrastRatio} />
                </View>

                {/* Filas de análisis */}
                {[
                    { icon: "eye", label: t("Legibilidad"), value: verdict.readability },
                    { icon: "sun", label: t("Sensación"), value: verdict.vibe },
                    { icon: "layout", label: t("En la UI"), value: verdict.uiFit },
                ].map((row, i, arr) => (
                    <View
                        key={row.label}
                        style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            paddingVertical: 12,
                            paddingHorizontal: 14,
                            gap: 10,
                            borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                            borderBottomColor: c.border.primary,
                        }}
                    >
                        <Feather
                            name={row.icon}
                            size={13}
                            color={c.text.secondary}
                            style={{ marginTop: 1 }}
                        />
                        <Text style={{
                            fontSize: 11,
                            color: c.text.secondary,
                            width: 72
                        }}>
                            {row.label}
                        </Text>
                        <Text style={{
                            fontSize: 11,
                            color: c.text.primary,
                            flex: 1
                        }}>
                            {row.value}
                        </Text>
                    </View>
                ))}

                {/* Consejo */}
                {verdict.tip !== t("Este color funciona bien — no necesita ajustes") ? (
                    <View style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: 12,
                        margin: 8,
                        backgroundColor: c.states.warningLight,
                        borderRadius: 14,
                    }}>
                        <Feather
                            name="info"
                            size={13}
                            color={c.states.warning}
                            style={{ marginTop: 1 }}
                        />
                        <Text style={{
                            fontSize: 11,
                            color: "#92400E",
                            flex: 1
                        }}>
                            {verdict.tip}
                        </Text>
                    </View>
                ) : (
                    <View style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: 12,
                        margin: 8,
                        backgroundColor: c.states.successLight,
                        borderRadius: 14,
                    }}>
                        <Feather
                            name="check-circle"
                            size={13}
                            color="#059669"
                            style={{ marginTop: 1 }}
                        />
                        <Text style={{
                            fontSize: 11,
                            color: "#065F46",
                            flex: 1
                        }}>
                            {t("Este color funciona bien — no necesita ajustes")}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
