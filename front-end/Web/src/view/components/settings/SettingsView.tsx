import React, { useState, useCallback, useRef, useEffect } from "react";
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Animated, Easing,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { Card, PageHeader, UIButton, ToggleRow, Divider } from "../ui/UI";
import { useTheme }      from "../hooks/useTheme";
import { generateTheme } from "../theme/generateTheme";
import { useResponsive } from "../hooks/useResponsive";
import { useTranslation } from "../../../i18n/hooks/useTranslation";
import {
    VISION_PRESETS, VISION_MODES, VISION_DESCRIPTIONS,
    AccessibilityPreset, VisionMode, DEFAULT_VISION_MODE,
} from "../theme/presets";
import type { ThemeTokens } from "../theme/colourTokens";

// ── Helpers HSL ──────────────────────────────────────────────

function hslToHex(h: number, s: number, l: number): string {
    const sv = s / 100, lv = l / 100;
    const k  = (n: number) => (n + h / 30) % 12;
    const a  = sv * Math.min(lv, 1 - lv);
    const f  = (n: number) =>
        lv - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return "#" + [f(0), f(8), f(4)]
        .map(v => Math.round(v * 255).toString(16).padStart(2, "0"))
        .join("");
}

function hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// ── Evaluador de color ────────────────────────────────────────

type ColorVerdict = {
    score:       "excelente" | "bueno" | "aceptable" | "precaución" | "problemático";
    scoreColor:  string;
    readability: string;
    vibe:        string;
    uiFit:       string;
    tip:         string;
    contrastRatio: number;
    wcagLevel: "AAA" | "AA" | "A" | "Falla";
};

function evaluateColor(hex: string): ColorVerdict {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lin = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    const L   = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const contrastVsWhite = 1.05 / (L + 0.05);
    const contrastVsBlack = (L + 0.05) / 0.05;
    const bestContrast = Math.max(contrastVsWhite, contrastVsBlack);

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const lv  = (max + min) / 2;
    const sv  = max === min ? 0 : (lv > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min));
    let hv = 0;
    if (max !== min) {
        switch (max) {
            case r: hv = ((g - b) / (max - min) + (g < b ? 6 : 0)) / 6; break;
            case g: hv = ((b - r) / (max - min) + 2) / 6; break;
            case b: hv = ((r - g) / (max - min) + 4) / 6; break;
        }
    }
    const hueDeg = Math.round(hv * 360);
    const satPct = Math.round(sv * 100);
    const lumPct = Math.round(lv * 100);

    let wcagLevel: ColorVerdict["wcagLevel"];
    if (bestContrast >= 7)        wcagLevel = "AAA";
    else if (bestContrast >= 4.5) wcagLevel = "AA";
    else if (bestContrast >= 3)   wcagLevel = "A";
    else                          wcagLevel = "Falla";

    let readability: string;
    if (contrastVsWhite >= 7)        readability = "Texto blanco encima se ve perfecto";
    else if (contrastVsWhite >= 4.5) readability = "Texto blanco es legible sin problema";
    else if (contrastVsWhite >= 3)   readability = "Texto blanco se ve, pero cuesta leerlo — mejor usar texto oscuro";
    else                              readability = "Texto blanco encima no se lee bien — este color es demasiado claro";

    let vibe: string;
    if (satPct < 15)                        vibe = "Tono neutro — discreto, no llama la atención";
    else if (hueDeg < 30 || hueDeg >= 340)  vibe = "Rojo — enérgico y llamativo, úsalo con moderación";
    else if (hueDeg < 60)                   vibe = "Naranja / dorado — cálido y amigable";
    else if (hueDeg < 150)                  vibe = "Verde — fresco, transmite calma y confianza";
    else if (hueDeg < 200)                  vibe = "Cian / turquesa — moderno y tecnológico";
    else if (hueDeg < 260)                  vibe = "Azul — profesional, genera confianza";
    else if (hueDeg < 310)                  vibe = "Violeta / púrpura — creativo y sofisticado";
    else                                    vibe = "Rosa / magenta — expresivo y llamativo";

    let uiFit: string;
    if (lumPct > 80)                          uiFit = "Muy claro — puede perderse sobre fondos blancos";
    else if (lumPct < 20)                     uiFit = "Muy oscuro — puede confundirse con el texto";
    else if (satPct < 15)                     uiFit = "Poco saturado — funciona como neutro, pero puede pasar desapercibido";
    else if (satPct > 95 && lumPct > 60)      uiFit = "Muy vibrante — llama la atención, puede cansar en uso prolongado";
    else                                      uiFit = "Proporciones equilibradas — ideal para botones, tabs y bordes";

    let tip: string;
    if (contrastVsWhite < 3 && lumPct > 70)
        tip = "Baja la luminosidad 15–20 puntos para que el texto blanco sea legible";
    else if (contrastVsWhite < 4.5 && lumPct > 55)
        tip = "Baja la luminosidad 8–10 puntos para mejorar la legibilidad";
    else if (satPct < 15 && lumPct > 50)
        tip = "Sube la saturación para que el acento resalte sobre los fondos";
    else if (lumPct > 80)
        tip = "Este tono es muy pálido — bájalo para que se vea como un acento real";
    else
        tip = "Este color funciona bien — no necesita ajustes";

    let score: ColorVerdict["score"];
    let scoreColor: string;
    if (contrastVsWhite >= 4.5 && satPct >= 15 && lumPct >= 20 && lumPct <= 78) {
        score = "excelente"; scoreColor = "#10B981";
    } else if (contrastVsWhite >= 3 && satPct >= 10 && lumPct >= 18 && lumPct <= 82) {
        score = "bueno"; scoreColor = "#10B981";
    } else if (contrastVsWhite >= 2.5 || contrastVsBlack >= 4.5) {
        score = "aceptable"; scoreColor = "#F59E0B";
    } else if (lumPct > 80 || lumPct < 15) {
        score = "precaución"; scoreColor = "#F59E0B";
    } else {
        score = "problemático"; scoreColor = "#EF4444";
    }

    return { score, scoreColor, readability, vibe, uiFit, tip, contrastRatio: Math.round(bestContrast * 10) / 10, wcagLevel };
}

// ── Secciones ────────────────────────────────────────────────

const SECTIONS = [
    { id: "general",       label: "General",        icon: "globe",    desc: "Institución y semestre" },
    { id: "facial",        label: "Reconocimiento", icon: "aperture", desc: "Umbral y cámara" },
    { id: "notifications", label: "Notificaciones", icon: "bell",     desc: "Alertas y reportes" },
    { id: "security",      label: "Seguridad",      icon: "shield",   desc: "Acceso y sesiones" },
    { id: "appearance",    label: "Apariencia",     icon: "sliders",  desc: "Tema y colores" },
] as const;

// ── Componente: Badge de estado WCAG ─────────────────────────

function WcagBadge({ level }: { level: ColorVerdict["wcagLevel"] }) {
    const colors: Record<string, { bg: string; text: string }> = {
        "AAA":   { bg: "#D1FAE5", text: "#065F46" },
        "AA":    { bg: "#DBEAFE", text: "#1E40AF" },
        "A":     { bg: "#FEF3C7", text: "#92400E" },
        "Falla": { bg: "#FEE2E2", text: "#991B1B" },
    };
    const style = colors[level] ?? colors["Falla"];
    return (
        <View style={{
            backgroundColor: style.bg, borderRadius: 4,
            paddingHorizontal: 6, paddingVertical: 2,
        }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: style.text, letterSpacing: 0.5 }}>
                WCAG {level}
            </Text>
        </View>
    );
}

// ── Componente: Barra de contraste visual ────────────────────

function ContrastBar({ ratio }: { ratio: number }) {
    const { theme } = useTheme();
    const c = theme.colors;
    const pct = Math.min((ratio / 21) * 100, 100);
    const color = ratio >= 7 ? "#10B981" : ratio >= 4.5 ? "#3B82F6" : ratio >= 3 ? "#F59E0B" : "#EF4444";
    return (
        <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 11, color: c.text.secondary }}>Ratio de contraste</Text>
                <Text style={{ fontSize: 11, fontWeight: "700", color }}>{ratio}:1</Text>
            </View>
            <View style={{ height: 5, backgroundColor: c.border.primary, borderRadius: 99 }}>
                <View style={{ height: "100%" as any, width: `${pct}%` as any, backgroundColor: color, borderRadius: 99 }} />
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
                {[{ label: "AA (4.5)", min: 4.5 }, { label: "AAA (7)", min: 7 }].map(t => (
                    <View key={t.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Feather
                            name={ratio >= t.min ? "check-circle" : "x-circle"}
                            size={11}
                            color={ratio >= t.min ? "#10B981" : c.text.disabled}
                        />
                        <Text style={{ fontSize: 10, color: ratio >= t.min ? "#10B981" : c.text.disabled }}>
                            {t.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ── Componente: HexInput con validación en vivo ──────────────

function HexInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const { theme } = useTheme();
    const c = theme.colors;
    const [raw, setRaw] = useState(value.replace("#", ""));
    const [valid, setValid] = useState(true);

    useEffect(() => { setRaw(value.replace("#", "")); }, [value]);

    function handleChange(text: string) {
        const cleaned = text.replace(/[^0-9a-fA-F]/g, "").slice(0, 6);
        setRaw(cleaned);
        if (cleaned.length === 6) {
            setValid(true);
            onChange("#" + cleaned);
        } else {
            setValid(false);
        }
    }

    return (
        <View style={{
            flexDirection: "row", alignItems: "center",
            borderWidth: 1.5,
            borderColor: valid ? c.border.primary : "#EF4444",
            borderRadius: 8, overflow: "hidden", height: 38,
        }}>
            <View style={{
                width: 38, height: "100%" as any,
                backgroundColor: valid ? value : c.interactive.disabled,
                borderRightWidth: 1, borderRightColor: c.border.primary,
                alignItems: "center", justifyContent: "center",
            }}>
                <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>#</Text>
            </View>
            <TextInput
                value={raw.toUpperCase()}
                onChangeText={handleChange}
                autoCapitalize="characters"
                placeholder="HEX"
                placeholderTextColor={c.text.disabled}
                style={{
                    flex: 1, paddingHorizontal: 10, fontSize: 13,
                    fontWeight: "600", color: c.text.primary,
                    fontFamily: "monospace",
                }}
                maxLength={6}
            />
            {!valid && raw.length > 0 && (
                <Feather name="alert-circle" size={14} color="#EF4444" style={{ marginRight: 10 }} />
            )}
        </View>
    );
}

// ── ModeSelector mejorado con preview visual ─────────────────

function ModeSelector() {
    const { mode, setMode, theme } = useTheme();
    const c = theme.colors;

    const modes = [
        { key: "light" as const, label: "Claro", icon: "sun" as const, preview: { bg: "#FFFFFF", surface: "#F9FAFB", text: "#111827" } },
        { key: "dark"  as const, label: "Oscuro", icon: "moon" as const, preview: { bg: "#111827", surface: "#1F2937", text: "#F9FAFB" } },
    ];

    return (
        <View style={{ flexDirection: "row", gap: 10 }}>
            {modes.map(m => {
                const active = mode === m.key;
                return (
                    <TouchableOpacity
                        key={m.key}
                        onPress={() => setMode(m.key)}
                        style={{
                            flex: 1,
                            borderRadius: 10,
                            borderWidth: active ? 2 : 1.5,
                            borderColor: active ? c.brand.primary : c.border.primary,
                            overflow: "hidden",
                        }}
                        activeOpacity={0.8}
                    >
                        {/* Mini preview del modo */}
                        <View style={{ backgroundColor: m.preview.bg, padding: 10, gap: 5 }}>
                            <View style={{ backgroundColor: m.preview.surface, borderRadius: 5, padding: 6, gap: 3 }}>
                                <View style={{ height: 4, width: "70%", backgroundColor: m.preview.text, borderRadius: 2, opacity: 0.7 }} />
                                <View style={{ height: 3, width: "45%", backgroundColor: m.preview.text, borderRadius: 2, opacity: 0.4 }} />
                            </View>
                            <View style={{ flexDirection: "row", gap: 4 }}>
                                <View style={{ flex: 1, height: 20, backgroundColor: c.brand.primary, borderRadius: 4, opacity: active ? 1 : 0.5 }} />
                                <View style={{ flex: 1, height: 20, backgroundColor: m.preview.surface, borderRadius: 4, borderWidth: 1, borderColor: c.border.primary }} />
                            </View>
                        </View>
                        {/* Label */}
                        <View style={{
                            flexDirection: "row", alignItems: "center", justifyContent: "center",
                            gap: 6, paddingVertical: 9,
                            backgroundColor: active ? c.brand.primaryLight : c.background.surface,
                            borderTopWidth: 1, borderTopColor: c.border.primary,
                        }}>
                            <Feather name={m.icon} size={13} color={active ? c.brand.primary : c.text.secondary} />
                            <Text style={{
                                fontSize: 12, fontWeight: active ? "600" : "400",
                                color: active ? c.brand.primary : c.text.secondary,
                            }}>
                                {m.label}
                            </Text>
                            {active && (
                                <View style={{
                                    width: 16, height: 16, borderRadius: 8,
                                    backgroundColor: c.brand.primary,
                                    alignItems: "center", justifyContent: "center",
                                }}>
                                    <Feather name="check" size={9} color="#fff" />
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ── LanguageSelector ─────────────────────────────────────────
//  Reutiliza el mismo patrón visual de chips que las tabs de
//  visión (AccentColorSelector) y el estado activo de ModeSelector.

function LanguageSelector() {
    const { theme } = useTheme();
    const c = theme.colors;
    const { language, setLanguage, supportedLanguages, isLoading } = useTranslation();

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {supportedLanguages.map(lang => {
                const active = language === lang.code;
                return (
                    <TouchableOpacity
                        key={lang.code}
                        onPress={() => setLanguage(lang.code)}
                        disabled={isLoading}
                        style={{
                            flexDirection: "row", alignItems: "center", gap: 6,
                            paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8,
                            borderWidth: active ? 2 : 1.5,
                            borderColor: active ? c.brand.primary : c.border.primary,
                            backgroundColor: active ? c.brand.primaryLight : c.background.surface,
                            opacity: isLoading ? 0.5 : 1,
                        }}
                    >
                        <Text style={{ fontSize: 14 }}>{lang.flag}</Text>
                        <Text style={{
                            fontSize: 12, fontWeight: active ? "600" : "400",
                            color: active ? c.brand.primary : c.text.secondary,
                        }}>
                            {lang.labelES}
                        </Text>
                        {active && <Feather name="check" size={11} color={c.brand.primary} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ── ThemePreview ─────────────────────────────────────────────

function ThemePreview({ previewTheme }: { previewTheme: ThemeTokens }) {
    const c = previewTheme.colors;
    return (
        <View style={{ borderWidth: 1, borderColor: c.border.primary, borderRadius: 10, overflow: "hidden" }}>
            <View style={{
                backgroundColor: c.background.surface,
                padding: 10, flexDirection: "row", alignItems: "center", gap: 8,
                borderBottomWidth: 1, borderBottomColor: c.border.primary,
            }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.brand.primary }} />
                <Text style={{ fontSize: 11, color: c.text.secondary }}>Vista previa en vivo</Text>
                <View style={{
                    marginLeft: "auto" as any,
                    backgroundColor: c.brand.primaryLight,
                    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
                }}>
                    <Text style={{ fontSize: 9, color: c.brand.primary, fontWeight: "700" }}>SIN GUARDAR</Text>
                </View>
            </View>
            <View style={{ backgroundColor: c.background.app, padding: 12, gap: 8 }}>
                {/* Barra + badge */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ flex: 1, height: 6, backgroundColor: c.border.primary, borderRadius: 99 }}>
                        <View style={{ height: "100%" as any, width: "72%" as any, backgroundColor: c.brand.primary, borderRadius: 99 }} />
                    </View>
                    <View style={{ backgroundColor: c.brand.primaryLight, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, color: c.brand.primary, fontWeight: "600" }}>72%</Text>
                    </View>
                </View>
                {/* Botones */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                    <View style={{ flex: 1, backgroundColor: c.brand.primary, borderRadius: 6, padding: 7, alignItems: "center" }}>
                        <Text style={{ fontSize: 11, color: "#fff", fontWeight: "600" }}>Primario</Text>
                    </View>
                    <View style={{ flex: 1, borderRadius: 6, padding: 7, alignItems: "center", borderWidth: 1, borderColor: c.brand.primary }}>
                        <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "600" }}>Outline</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: c.interactive.disabled, borderRadius: 6, padding: 7, alignItems: "center" }}>
                        <Text style={{ fontSize: 11, color: c.text.secondary, fontWeight: "600" }}>Ghost</Text>
                    </View>
                </View>
                {/* Badges */}
                <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
                    {[
                        { label: "Activo",      bg: c.brand.primaryLight,  color: c.brand.primary },
                        { label: "Éxito",       bg: c.states.successLight, color: "#065F46"       },
                        { label: "Advertencia", bg: c.states.warningLight, color: "#92400E"       },
                        { label: "Peligro",     bg: c.states.dangerLight,  color: "#991B1B"       },
                    ].map(b => (
                        <View key={b.label} style={{ backgroundColor: b.bg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 10, color: b.color, fontWeight: "600" }}>{b.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

// ── AccentColorSelector mejorado ─────────────────────────────

type AccentSelectorProps = {
    previewHex:      string;
    onPreviewChange: (hex: string) => void;
};

function AccentColorSelector({ previewHex, onPreviewChange }: AccentSelectorProps) {
    const { theme } = useTheme();
    const c         = theme.colors;

    const [visionMode, setVisionMode] = useState<VisionMode>(DEFAULT_VISION_MODE);
    const [hue, setHue]               = useState(() => hexToHsl(previewHex)[0]);
    const [sat, setSat]               = useState(() => hexToHsl(previewHex)[1]);
    const [lum, setLum]               = useState(() => hexToHsl(previewHex)[2]);
    const [showHexInput, setShowHexInput] = useState(false);

    const currentHex = hslToHex(hue, sat, lum);
    const verdict    = evaluateColor(currentHex);

    function apply(h: number, s: number, l: number) {
        setHue(h); setSat(s); setLum(l);
        onPreviewChange(hslToHex(h, s, l));
    }

    function applyPreset(p: AccessibilityPreset) {
        const [h, s, l] = hexToHsl(p.color);
        apply(h, s, l);
    }

    function handleHexChange(hex: string) {
        const [h, s, l] = hexToHsl(hex);
        apply(h, s, l);
    }

    // Etiquetas descriptivas para cada slider
    const sliderDescriptions = {
        hue: {
            ranges: [
                { max: 30,  label: "🔴 Rojo" },
                { max: 60,  label: "🟠 Naranja" },
                { max: 150, label: "🟢 Verde" },
                { max: 200, label: "🩵 Cian" },
                { max: 260, label: "🔵 Azul" },
                { max: 310, label: "🟣 Violeta" },
                { max: 340, label: "🩷 Rosa" },
                { max: 360, label: "🔴 Rojo" },
            ],
            get: (v: number) => sliderDescriptions.hue.ranges.find(r => v < r.max)?.label ?? "Rojo"
        },
        sat: (v: number) =>
            v < 15 ? "Gris / neutro" :
            v < 40 ? "Suave" :
            v < 70 ? "Equilibrado" :
            v < 90 ? "Vivo" : "Muy intenso",
        lum: (v: number) =>
            v < 20 ? "Casi negro" :
            v < 35 ? "Oscuro" :
            v < 55 ? "Medio — ideal ✓" :
            v < 70 ? "Claro" : "Muy claro",
    };

    return (
        <View style={{ gap: 16 }}>

            {/* ── Tabs de visión ── */}
            <View style={{
                backgroundColor: c.background.app,
                borderRadius: 8, padding: 3,
                borderWidth: 1, borderColor: c.border.primary,
                flexDirection: "row", flexWrap: "wrap", gap: 2,
            }}>
                {VISION_MODES.map(vm => {
                    const active = visionMode === vm;
                    return (
                        <TouchableOpacity
                            key={vm} onPress={() => setVisionMode(vm)}
                            style={{
                                paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6,
                                backgroundColor: active ? c.brand.primary : "transparent",
                            }}
                        >
                            <Text style={{
                                fontSize: 11, fontWeight: active ? "600" : "400",
                                color: active ? "#fff" : c.text.secondary,
                            }}>
                                {vm === "normal"        ? "Normal"       :
                                    vm === "deuteranopia"  ? "Deuteranopia" :
                                        vm === "protanopia"    ? "Protanopia"   :
                                            vm === "tritanopia"    ? "Tritanopia"   : "Acromatopsia"}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Descripción + strip */}
            <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 11, color: c.text.secondary, lineHeight: 16 }}>
                    {VISION_DESCRIPTIONS[visionMode]}
                </Text>
                <View style={{ flexDirection: "row", height: 5, borderRadius: 99, overflow: "hidden" }}>
                    {VISION_PRESETS[visionMode].map(p => (
                        <View key={p.key} style={{ flex: 1, backgroundColor: p.color }} />
                    ))}
                </View>
            </View>

            {/* ── Presets ── */}
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                {VISION_PRESETS[visionMode].map(preset => {
                    const active = previewHex.toLowerCase() === preset.color.toLowerCase();
                    return (
                        <TouchableOpacity
                            key={preset.key}
                            onPress={() => applyPreset(preset)}
                            style={{ alignItems: "center", gap: 4 }}
                        >
                            <View style={{
                                width: 34, height: 34, borderRadius: 17,
                                backgroundColor: preset.color,
                                alignItems: "center", justifyContent: "center",
                                borderWidth: active ? 2.5 : 0,
                                borderColor: "#fff",
                                shadowColor: active ? preset.color : "transparent",
                                shadowOpacity: active ? 0.6 : 0,
                                shadowRadius: 6, elevation: active ? 4 : 0,
                            }}>
                                {active && <Feather name="check" size={14} color="#fff" />}
                            </View>
                            <Text style={{ fontSize: 10, color: active ? c.brand.primary : c.text.secondary }}>
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
                        label: "Tono",
                        val: hue, min: 0, max: 359,
                        onChange: (v: number) => apply(v, sat, lum),
                        suffix: "°",
                        desc: sliderDescriptions.hue.get(hue),
                        gradient: "hue",
                    },
                    {
                        label: "Saturación",
                        val: sat, min: 0, max: 100,
                        onChange: (v: number) => apply(hue, v, lum),
                        suffix: "%",
                        desc: sliderDescriptions.sat(sat),
                        hint: sat < 20 ? "⚠ Muy bajo — el color se verá gris" : sat > 90 ? "⚠ Muy alto — puede fatigar la vista" : null,
                    },
                    {
                        label: "Luminosidad",
                        val: lum, min: 15, max: 85,
                        onChange: (v: number) => apply(hue, sat, v),
                        suffix: "%",
                        desc: sliderDescriptions.lum(lum),
                        hint: lum > 75 ? "⚠ Muy claro — el texto blanco encima no será legible" : lum < 22 ? "⚠ Muy oscuro — puede confundirse con el texto" : null,
                    },
                ].map(sl => (
                    <View key={sl.label} style={{ gap: 5 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Text style={{ fontSize: 12, color: c.text.secondary }}>{sl.label}</Text>
                                <Text style={{ fontSize: 11, color: c.text.disabled }}>— {sl.desc}</Text>
                            </View>
                            <Text style={{ fontSize: 12, fontWeight: "700", color: c.text.primary }}>
                                {sl.val}{sl.suffix}
                            </Text>
                        </View>
                        <Slider
                            minimumValue={sl.min} maximumValue={sl.max}
                            step={1} value={sl.val}
                            onValueChange={sl.onChange}
                            minimumTrackTintColor={currentHex}
                            maximumTrackTintColor={c.border.primary}
                        />
                        {sl.hint && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                                <Text style={{ fontSize: 11, color: "#F59E0B" }}>{sl.hint}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            {/* ── Input HEX manual ── */}
            <TouchableOpacity
                onPress={() => setShowHexInput(v => !v)}
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
                <Feather name={showHexInput ? "chevron-up" : "chevron-down"} size={13} color={c.text.secondary} />
                <Text style={{ fontSize: 12, color: c.text.secondary }}>
                    {showHexInput ? "Ocultar entrada HEX" : "Ingresar código HEX manualmente"}
                </Text>
            </TouchableOpacity>
            {showHexInput && (
                <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 11, color: c.text.secondary }}>
                        Pega directamente un color de tu paleta de marca, Figma, o cualquier herramienta.
                    </Text>
                    <HexInput value={currentHex} onChange={handleHexChange} />
                </View>
            )}

            {/* ── Evaluador de color mejorado ── */}
            <View style={{
                backgroundColor: c.background.app,
                borderRadius: 10, overflow: "hidden",
                borderWidth: 1, borderColor: c.border.primary,
            }}>
                {/* Header */}
                <View style={{
                    flexDirection: "row", alignItems: "center", gap: 12,
                    padding: 12, borderBottomWidth: 1, borderBottomColor: c.border.primary,
                }}>
                    <View style={{
                        width: 40, height: 40, borderRadius: 10,
                        backgroundColor: currentHex,
                        borderWidth: 1, borderColor: c.border.secondary,
                    }} />
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: c.text.primary, fontFamily: "monospace" }}>
                            {currentHex.toUpperCase()}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <View style={{
                                width: 7, height: 7, borderRadius: 99,
                                backgroundColor: verdict.scoreColor,
                            }} />
                            <Text style={{ fontSize: 11, fontWeight: "600", color: verdict.scoreColor }}>
                                {verdict.score.charAt(0).toUpperCase() + verdict.score.slice(1)}
                            </Text>
                            <WcagBadge level={verdict.wcagLevel} />
                        </View>
                    </View>
                </View>

                {/* Barra de contraste */}
                <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: c.border.primary }}>
                    <ContrastBar ratio={verdict.contrastRatio} />
                </View>

                {/* Filas de análisis */}
                {[
                    { icon: "eye",    label: "Legibilidad", value: verdict.readability },
                    { icon: "sun",    label: "Sensación",   value: verdict.vibe        },
                    { icon: "layout", label: "En la UI",    value: verdict.uiFit       },
                ].map((row, i, arr) => (
                    <View key={row.label} style={{
                        flexDirection: "row", alignItems: "flex-start",
                        paddingVertical: 9, paddingHorizontal: 12,
                        gap: 10,
                        borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                        borderBottomColor: c.border.primary,
                    }}>
                        <Feather name={row.icon as any} size={13} color={c.text.secondary} style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: 12, color: c.text.secondary, width: 72 }}>{row.label}</Text>
                        <Text style={{ fontSize: 12, color: c.text.primary, flex: 1 }}>{row.value}</Text>
                    </View>
                ))}

                {/* Consejo */}
                {verdict.tip !== "Este color funciona bien — no necesita ajustes" ? (
                    <View style={{
                        flexDirection: "row", alignItems: "flex-start", gap: 8,
                        padding: 10, margin: 8,
                        backgroundColor: c.states.warningLight,
                        borderRadius: 7,
                    }}>
                        <Feather name="info" size={13} color={c.states.warning} style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: 12, color: "#92400E", flex: 1 }}>{verdict.tip}</Text>
                    </View>
                ) : (
                    <View style={{
                        flexDirection: "row", alignItems: "flex-start", gap: 8,
                        padding: 10, margin: 8,
                        backgroundColor: c.states.successLight,
                        borderRadius: 7,
                    }}>
                        <Feather name="check-circle" size={13} color="#059669" style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: 12, color: "#065F46", flex: 1 }}>Este color funciona bien — no necesita ajustes</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

// ── Componente: StatsCard (para General) ─────────────────────

function StatsRow({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{
            flexDirection: "row", alignItems: "center", gap: 12,
            paddingVertical: 10,
        }}>
            <View style={{
                width: 34, height: 34, borderRadius: 8,
                backgroundColor: color + "20",
                alignItems: "center", justifyContent: "center",
            }}>
                <Feather name={icon as any} size={15} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: c.text.secondary }}>{label}</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary }}>{value}</Text>
            </View>
        </View>
    );
}

// ── Componente: SecurityStrengthMeter ────────────────────────

function SecurityMeter({ twoFactor, sessionTime }: { twoFactor: boolean; sessionTime: string }) {
    const { theme } = useTheme();
    const c = theme.colors;

    const score = [
        twoFactor,
        parseInt(sessionTime) <= 60,
        parseInt(sessionTime) > 0,
        true, // base
    ].filter(Boolean).length;

    const levels = ["Débil", "Regular", "Buena", "Fuerte"];
    const colors = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
    const label  = levels[score - 1] ?? "Débil";
    const color  = colors[score - 1] ?? "#EF4444";

    return (
        <View style={{
            backgroundColor: c.background.app,
            borderRadius: 10, padding: 12,
            borderWidth: 1, borderColor: c.border.primary,
            gap: 10,
        }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 12, color: c.text.secondary }}>Nivel de seguridad</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color }}>{label}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 4 }}>
                {[1, 2, 3, 4].map(i => (
                    <View key={i} style={{
                        flex: 1, height: 6, borderRadius: 99,
                        backgroundColor: i <= score ? color : c.border.primary,
                    }} />
                ))}
            </View>
            <View style={{ gap: 6 }}>
                {[
                    { label: "Autenticación de dos factores", ok: twoFactor },
                    { label: "Sesión corta (≤60 min)", ok: parseInt(sessionTime) <= 60 },
                ].map(item => (
                    <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Feather
                            name={item.ok ? "check-circle" : "circle"}
                            size={13}
                            color={item.ok ? "#10B981" : c.text.disabled}
                        />
                        <Text style={{ fontSize: 12, color: item.ok ? c.text.primary : c.text.disabled }}>
                            {item.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ── Componente: ConfidenceGuide ───────────────────────────────

function ConfidenceGuide({ value }: { value: number }) {
    const { theme } = useTheme();
    const c = theme.colors;

    const zones = [
        { min: 60, max: 70, label: "Permisivo", color: "#10B981", desc: "Detecta bien aunque haya cambios de luz o ángulo. Más falsos positivos." },
        { min: 71, max: 85, label: "Equilibrado", color: "#3B82F6", desc: "Buen balance entre precisión y tolerancia. Recomendado para la mayoría." },
        { min: 86, max: 94, label: "Estricto", color: "#F59E0B", desc: "Muy preciso, pero puede fallar si el estudiante cambió de lentes o peinado." },
        { min: 95, max: 99, label: "Muy estricto", color: "#EF4444", desc: "Alto riesgo de falsos negativos. Solo para entornos con iluminación controlada." },
    ];

    const zone = zones.find(z => value >= z.min && value <= z.max) ?? zones[1];

    return (
        <View style={{
            backgroundColor: zone.color + "12",
            borderRadius: 8, padding: 10,
            borderLeftWidth: 3, borderLeftColor: zone.color,
            gap: 3,
        }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: zone.color }}>{zone.label}</Text>
            <Text style={{ fontSize: 12, color: c.text.primary, lineHeight: 18 }}>{zone.desc}</Text>
        </View>
    );
}

// ── MAIN ─────────────────────────────────────────────────────

export default function SettingsView() {
    const { isSmall }                        = useResponsive();
    const { theme, mode, accentColor, setAccentColor } = useTheme();
    const { currentLanguage }                = useTranslation();
    const c                                  = theme.colors;

    const [section, setSection] = useState("general");

    const [previewAccent, setPreviewAccent] = useState(accentColor);
    const [hasUnsaved,    setHasUnsaved]    = useState(false);

    const previewTheme = generateTheme(previewAccent, mode);

    function handlePreviewChange(hex: string) {
        setPreviewAccent(hex);
        setHasUnsaved(hex.toLowerCase() !== accentColor.toLowerCase());
    }

    // Estados de settings
    const [institutionName, setInstitutionName] = useState("Universidad Nacional");
    const [minAttendance,   setMinAttendance]   = useState(80);
    const [semester,        setSemester]        = useState("2024-2");
    const [confidence,      setConfidence]      = useState(85);
    const [autoRegister,    setAutoRegister]    = useState(true);
    const [savePhotos,      setSavePhotos]      = useState(false);
    const [emailAlert,      setEmailAlert]      = useState(true);
    const [weeklyReport,    setWeeklyReport]    = useState(true);
    const [atRiskAlert,     setAtRiskAlert]     = useState(true);
    const [dailySummary,    setDailySummary]    = useState(false);
    const [twoFactor,       setTwoFactor]       = useState(false);
    const [sessionTime,     setSessionTime]     = useState("60");
    const [saved,           setSaved]           = useState(false);

    const activeNotifications = [emailAlert, weeklyReport, atRiskAlert, dailySummary].filter(Boolean).length;

    function handleSave() {
        if (hasUnsaved) {
            setAccentColor(previewAccent);
            setHasUnsaved(false);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    function handleDiscard() {
        setPreviewAccent(accentColor);
        setHasUnsaved(false);
    }

    const labelStyle: any = { fontSize: 13, fontWeight: "500", color: c.text.primary, marginBottom: 6 };
    const descStyle:  any = { fontSize: 12, color: c.text.secondary, marginTop: 4, lineHeight: 18 };
    const inputStyle: any = {
        height: 40, borderWidth: 1.5, borderColor: c.border.primary,
        borderRadius: 8, paddingHorizontal: 12, fontSize: 13,
        color: c.text.primary, backgroundColor: c.background.surface,
    };
    const sectionTitle: any = { fontSize: 15, fontWeight: "700", color: c.text.primary };

    // Badge de notificaciones activas por sección
    function SectionBadge({ id }: { id: string }) {
        if (id === "notifications" && activeNotifications > 0) {
            return (
                <View style={{
                    width: 18, height: 18, borderRadius: 9,
                    backgroundColor: c.brand.primary,
                    alignItems: "center", justifyContent: "center",
                }}>
                    <Text style={{ fontSize: 9, fontWeight: "700", color: "#fff" }}>{activeNotifications}</Text>
                </View>
            );
        }
        if (id === "security" && !twoFactor) {
            return <Feather name="alert-triangle" size={12} color="#F59E0B" />;
        }
        return null;
    }

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            <PageHeader
                title="Configuración"
                subtitle="Personaliza FaceAttend EDU a tu institución"
                actions={
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                        {hasUnsaved && (
                            <>
                                <View style={{
                                    flexDirection: "row", alignItems: "center", gap: 5,
                                    backgroundColor: c.states.warningLight,
                                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
                                }}>
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.states.warning }} />
                                    <Text style={{ fontSize: 11, color: c.states.warning, fontWeight: "600" }}>
                                        Sin guardar
                                    </Text>
                                </View>
                                <UIButton variant="ghost" size="sm" onPress={handleDiscard}>
                                    Descartar
                                </UIButton>
                            </>
                        )}
                        <UIButton variant="primary" onPress={handleSave} size="sm">
                            {saved ? "¡Guardado ✓" : "Guardar cambios"}
                        </UIButton>
                    </View>
                }
            />

            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 20 }}>

                {/* ── Nav lateral ── */}
                <Card padding={6} style={isSmall ? undefined : { width: 200, alignSelf: "flex-start" }}>
                    {isSmall ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={{ flexDirection: "row", gap: 2 }}>
                                {SECTIONS.map(s => {
                                    const active = section === s.id;
                                    return (
                                        <TouchableOpacity
                                            key={s.id} onPress={() => setSection(s.id)}
                                            style={{
                                                flexDirection: "row", alignItems: "center", gap: 7,
                                                paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6,
                                                backgroundColor: active ? c.brand.primaryLight : "transparent",
                                            }}
                                        >
                                            <Feather name={s.icon as any} size={14} color={active ? c.brand.primary : c.text.secondary} />
                                            <Text style={{ fontSize: 12, fontWeight: active ? "600" : "400", color: active ? c.brand.primary : c.text.secondary }}>
                                                {s.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={{ gap: 1 }}>
                            {SECTIONS.map(s => {
                                const active = section === s.id;
                                return (
                                    <TouchableOpacity
                                        key={s.id} onPress={() => setSection(s.id)}
                                        style={{
                                            flexDirection: "row", alignItems: "center",
                                            paddingVertical: 10, paddingHorizontal: 10, borderRadius: 7,
                                            backgroundColor: active ? c.brand.primaryLight : "transparent",
                                        }}
                                    >
                                        <Feather name={s.icon as any} size={15} color={active ? c.brand.primary : c.text.secondary} />
                                        <View style={{ flex: 1, marginLeft: 9 }}>
                                            <Text style={{ fontSize: 13, fontWeight: active ? "600" : "400", color: active ? c.brand.primary : c.text.secondary }}>
                                                {s.label}
                                            </Text>
                                            {!active && (
                                                <Text style={{ fontSize: 10, color: c.text.disabled, marginTop: 1 }}>
                                                    {s.desc}
                                                </Text>
                                            )}
                                        </View>
                                        <SectionBadge id={s.id} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </Card>

                {/* ── Contenido ── */}
                <Card style={{ flex: 1 }}>

                    {/* ══ GENERAL ══════════════════════════════════════════ */}
                    {section === "general" && (
                        <View style={{ gap: 18 }}>
                            <Text style={sectionTitle}>General</Text>

                            <View>
                                <Text style={labelStyle}>Nombre de la institución</Text>
                                <TextInput value={institutionName} onChangeText={setInstitutionName} style={inputStyle} />
                                <Text style={descStyle}>Aparece en reportes, correos y en la cabecera de la app.</Text>
                            </View>

                            <View>
                                <Text style={labelStyle}>Semestre activo</Text>
                                <TextInput
                                    value={semester} onChangeText={setSemester}
                                    placeholder="Ej: 2024-2"
                                    placeholderTextColor={c.text.disabled}
                                    style={inputStyle}
                                />
                                <Text style={descStyle}>Formato recomendado: AÑO-PERÍODO (ej. 2025-1). Se usa para agrupar los registros de asistencia.</Text>
                            </View>

                            <View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                                    <View>
                                        <Text style={labelStyle}>Asistencia mínima requerida</Text>
                                        <Text style={[descStyle, { marginTop: 0 }]}>Umbral para marcar estudiantes "en riesgo"</Text>
                                    </View>
                                    <Text style={{ fontSize: 22, fontWeight: "800", color: c.brand.primary }}>{minAttendance}%</Text>
                                </View>
                                <Slider
                                    minimumValue={50} maximumValue={100} step={5}
                                    value={minAttendance} onValueChange={setMinAttendance}
                                    minimumTrackTintColor={c.brand.primary}
                                    maximumTrackTintColor={c.border.primary}
                                />
                                {/* Marcas de referencia */}
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                                    {[50, 60, 70, 80, 90, 100].map(v => (
                                        <Text key={v} style={{
                                            fontSize: 9, color: v === minAttendance ? c.brand.primary : c.text.disabled,
                                            fontWeight: v === minAttendance ? "700" : "400",
                                        }}>
                                            {v}%
                                        </Text>
                                    ))}
                                </View>
                                {/* Guía contextual */}
                                <View style={{
                                    marginTop: 10,
                                    backgroundColor: minAttendance >= 90 ? c.states.warningLight : c.brand.primaryLight,
                                    borderRadius: 8, padding: 10,
                                    flexDirection: "row", gap: 8,
                                }}>
                                    <Feather
                                        name={minAttendance >= 90 ? "alert-triangle" : "info"}
                                        size={13}
                                        color={minAttendance >= 90 ? c.states.warning : c.brand.primary}
                                        style={{ marginTop: 1 }}
                                    />
                                    <Text style={{ fontSize: 12, color: minAttendance >= 90 ? "#92400E" : c.brand.primary, flex: 1, lineHeight: 18 }}>
                                        {minAttendance >= 90
                                            ? "Umbral muy alto — muchos estudiantes podrían quedar en riesgo aunque asistan con regularidad."
                                            : minAttendance <= 60
                                            ? "Umbral bajo — los estudiantes tendrán mucha flexibilidad de faltar. Asegúrate de que sea intencional."
                                            : `Con este umbral, un estudiante puede faltar hasta ${Math.floor((100 - minAttendance))} clases de cada 100 sin quedar en riesgo.`
                                        }
                                    </Text>
                                </View>
                            </View>

                            <Divider />

                            {/* Idioma de la aplicación */}
                            <View>
                                <Text style={labelStyle}>Idioma de la aplicación</Text>
                                <Text style={[descStyle, { marginTop: 0, marginBottom: 10 }]}>
                                    Traduce toda la interfaz automáticamente. El español es el idioma original de FaceAttend EDU.
                                </Text>
                                <LanguageSelector />
                            </View>

                            <Divider />

                            {/* Resumen rápido */}
                            <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.secondary, letterSpacing: 0.5, textTransform: "uppercase" }}>
                                Resumen actual
                            </Text>
                            <View style={{ gap: 0 }}>
                                <StatsRow label="Institución" value={institutionName || "Sin definir"} icon="home" color={c.brand.primary} />
                                <Divider />
                                <StatsRow label="Semestre activo" value={semester || "Sin definir"} icon="calendar" color="#8B5CF6" />
                                <Divider />
                                <StatsRow label="Mínimo de asistencia" value={`${minAttendance}%`} icon="bar-chart-2" color="#10B981" />
                                <Divider />
                                <StatsRow label="Idioma" value={currentLanguage?.labelES ?? "Español"} icon="globe" color="#3B82F6" />
                            </View>
                        </View>
                    )}

                    {/* ══ RECONOCIMIENTO ═══════════════════════════════════ */}
                    {section === "facial" && (
                        <View style={{ gap: 18 }}>
                            <Text style={sectionTitle}>Reconocimiento facial</Text>

                            <View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                                    <View>
                                        <Text style={labelStyle}>Umbral de confianza</Text>
                                        <Text style={[descStyle, { marginTop: 0 }]}>Qué tan seguro debe estar el modelo para registrar</Text>
                                    </View>
                                    <Text style={{ fontSize: 22, fontWeight: "800", color: c.brand.primary }}>{confidence}%</Text>
                                </View>
                                <Slider
                                    minimumValue={60} maximumValue={99} step={1}
                                    value={confidence} onValueChange={setConfidence}
                                    minimumTrackTintColor={c.brand.primary}
                                    maximumTrackTintColor={c.border.primary}
                                />
                                {/* Zonas de referencia */}
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                                    {["60 — Permisivo", "75", "85 ✓", "95 — Estricto", "99"].map((v, i) => (
                                        <Text key={i} style={{ fontSize: 9, color: c.text.disabled }}>{v}</Text>
                                    ))}
                                </View>
                                <View style={{ marginTop: 12 }}>
                                    <ConfidenceGuide value={confidence} />
                                </View>
                            </View>

                            <Divider />

                            <ToggleRow
                                label="Registro automático"
                                description="Registra automáticamente al detectar el rostro sin confirmación manual"
                                value={autoRegister}
                                onToggle={() => setAutoRegister(v => !v)}
                            />

                            {/* Advertencia contextual para registro automático */}
                            {autoRegister && confidence < 75 && (
                                <View style={{
                                    backgroundColor: c.states.warningLight, borderRadius: 8, padding: 10,
                                    flexDirection: "row", gap: 8,
                                }}>
                                    <Feather name="alert-triangle" size={13} color={c.states.warning} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 12, color: "#92400E", flex: 1, lineHeight: 18 }}>
                                        Con umbral bajo y registro automático habilitado, hay mayor riesgo de registrar asistencia incorrectamente. Considera subir el umbral a al menos 75%.
                                    </Text>
                                </View>
                            )}

                            <ToggleRow
                                label="Guardar fotos de registro"
                                description="Almacena la foto tomada al registrar. Útil para auditorías pero consume más espacio."
                                value={savePhotos}
                                onToggle={() => setSavePhotos(v => !v)}
                            />

                            {savePhotos && (
                                <View style={{
                                    backgroundColor: c.brand.primaryLight, borderRadius: 8, padding: 10,
                                    flexDirection: "row", gap: 8,
                                }}>
                                    <Feather name="info" size={13} color={c.brand.primary} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 12, color: c.brand.primary, flex: 1, lineHeight: 18 }}>
                                        Las fotos se almacenan localmente. Asegúrate de tener suficiente espacio y de informar a los estudiantes según tu política de privacidad.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* ══ NOTIFICACIONES ═══════════════════════════════════ */}
                    {section === "notifications" && (
                        <View style={{ gap: 4 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <Text style={sectionTitle}>Notificaciones</Text>
                                <View style={{
                                    backgroundColor: c.brand.primaryLight, borderRadius: 99,
                                    paddingHorizontal: 10, paddingVertical: 4,
                                }}>
                                    <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "600" }}>
                                        {activeNotifications} activa{activeNotifications !== 1 ? "s" : ""}
                                    </Text>
                                </View>
                            </View>
                            <Divider />
                            <ToggleRow
                                label="Alertas por correo"
                                description="Envía un correo al docente cuando un estudiante no asiste. Ideal para clases pequeñas o con seguimiento individual."
                                value={emailAlert}
                                onToggle={() => setEmailAlert(v => !v)}
                            />
                            <ToggleRow
                                label="Reporte semanal"
                                description="Resumen automático de asistencia enviado cada lunes a las 8am. Incluye porcentajes por curso."
                                value={weeklyReport}
                                onToggle={() => setWeeklyReport(v => !v)}
                            />
                            <ToggleRow
                                label="Alerta de estudiantes en riesgo"
                                description={`Notifica cuando un estudiante cae por debajo del ${minAttendance}% de asistencia mínima configurado en General.`}
                                value={atRiskAlert}
                                onToggle={() => setAtRiskAlert(v => !v)}
                            />
                            <ToggleRow
                                label="Resumen diario"
                                description="Resumen automático de asistencia al finalizar el día. Puede generar muchas notificaciones en días de muchas clases."
                                value={dailySummary}
                                onToggle={() => setDailySummary(v => !v)}
                            />

                            {/* Aviso si ninguna activa */}
                            {activeNotifications === 0 && (
                                <View style={{
                                    marginTop: 8, backgroundColor: c.states.warningLight,
                                    borderRadius: 8, padding: 12,
                                    flexDirection: "row", gap: 8,
                                }}>
                                    <Feather name="bell-off" size={14} color={c.states.warning} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 12, color: "#92400E", flex: 1, lineHeight: 18 }}>
                                        No tienes ninguna notificación activa. No recibirás avisos sobre asistencia ni estudiantes en riesgo.
                                    </Text>
                                </View>
                            )}

                            {/* Aviso si diario + semanal juntos */}
                            {dailySummary && weeklyReport && (
                                <View style={{
                                    marginTop: 4, backgroundColor: c.brand.primaryLight,
                                    borderRadius: 8, padding: 10,
                                    flexDirection: "row", gap: 8,
                                }}>
                                    <Feather name="info" size={13} color={c.brand.primary} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 12, color: c.brand.primary, flex: 1, lineHeight: 18 }}>
                                        Tienes el resumen diario y el semanal activados. Considera desactivar uno para reducir el volumen de correos.
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* ══ SEGURIDAD ═════════════════════════════════════════ */}
                    {section === "security" && (
                        <View style={{ gap: 18 }}>
                            <Text style={sectionTitle}>Seguridad</Text>

                            <SecurityMeter twoFactor={twoFactor} sessionTime={sessionTime} />

                            <Divider />

                            <ToggleRow
                                label="Autenticación de dos factores"
                                description="Requiere un código adicional al iniciar sesión. Protege la cuenta aunque alguien obtenga tu contraseña."
                                value={twoFactor}
                                onToggle={() => setTwoFactor(v => !v)}
                            />

                            {!twoFactor && (
                                <View style={{
                                    backgroundColor: c.states.warningLight, borderRadius: 8, padding: 10,
                                    flexDirection: "row", gap: 8,
                                }}>
                                    <Feather name="shield" size={13} color={c.states.warning} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 12, color: "#92400E", flex: 1, lineHeight: 18 }}>
                                        Sin 2FA, la cuenta queda vulnerable si la contraseña se compromete. Se recomienda activarlo.
                                    </Text>
                                </View>
                            )}

                            <View>
                                <Text style={labelStyle}>Tiempo de sesión (minutos)</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    value={sessionTime}
                                    onChangeText={setSessionTime}
                                    style={[inputStyle, { width: 140 }]}
                                />
                                <Text style={descStyle}>
                                    La sesión se cerrará automáticamente tras este tiempo de inactividad.
                                    {parseInt(sessionTime) > 120
                                        ? " ⚠ Sesiones largas aumentan el riesgo si el dispositivo queda desbloqueado."
                                        : parseInt(sessionTime) <= 15
                                        ? " Sesión muy corta — el usuario deberá iniciar sesión con frecuencia."
                                        : " Tiempo razonable para uso normal en aula."}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* ══ APARIENCIA ════════════════════════════════════════ */}
                    {section === "appearance" && (
                        <View style={{ gap: 20 }}>
                            <Text style={sectionTitle}>Apariencia</Text>

                            {/* Modo de visualización */}
                            <View style={{ gap: 8 }}>
                                <Text style={labelStyle}>Modo de visualización</Text>
                                <Text style={descStyle}>
                                    Elige el tema base de la interfaz. Afecta fondos, textos y superficies de toda la app.
                                </Text>
                                <ModeSelector />
                            </View>

                            <Divider />

                            {/* Color de acento */}
                            <View style={{ gap: 10 }}>
                                <View>
                                    <Text style={labelStyle}>Color de acento</Text>
                                    <Text style={descStyle}>
                                        Este color se aplica a botones principales, tabs activos, barras de progreso, bordes de foco y todos los elementos interactivos.
                                        Los cambios se previsualizan abajo — presiona "Guardar cambios" para aplicarlos en toda la app.
                                    </Text>
                                </View>
                                <AccentColorSelector
                                    previewHex={previewAccent}
                                    onPreviewChange={handlePreviewChange}
                                />
                            </View>

                            <Divider />

                            {/* Preview */}
                            <View style={{ gap: 8 }}>
                                <Text style={labelStyle}>Vista previa en vivo</Text>
                                <ThemePreview previewTheme={previewTheme} />
                            </View>

                            {/* Banner informativo */}
                            <View style={{
                                flexDirection: "row", alignItems: "center", gap: 8,
                                backgroundColor: c.brand.primaryLight,
                                borderRadius: 8, padding: 10,
                            }}>
                                <Feather name="info" size={13} color={c.brand.primary} />
                                <Text style={{ fontSize: 12, color: c.brand.primary, flex: 1, lineHeight: 18 }}>
                                    La preview muestra cómo se verá el color en botones, badges y elementos activos. Presiona "Guardar cambios" para aplicarlo en toda la app.
                                </Text>
                            </View>
                        </View>
                    )}

                </Card>
            </View>
        </ScrollView>
    );
}
