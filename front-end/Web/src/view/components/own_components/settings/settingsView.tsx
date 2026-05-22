import React, { useState, useCallback } from "react";
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import Slider    from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { Card, PageHeader, UIButton, ToggleRow, Divider } from "../ui/UI";
import { useTheme }      from "../../hooks/useTheme";
import { generateTheme } from "../../theme/generateTheme";
import { useResponsive } from "../../hooks/useResponsive";
import {
    VISION_PRESETS, VISION_MODES, VISION_DESCRIPTIONS,
    AccessibilityPreset, VisionMode, DEFAULT_VISION_MODE,
} from "../../theme/presets";
import type { ThemeTokens } from "../../theme/colourTokens";

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

// ── Evaluador de color en lenguaje humano ────────────────────
type ColorVerdict = {
    score:       "excelente" | "bueno" | "aceptable" | "precaución" | "problemático";
    scoreColor:  string;
    readability: string;
    vibe:        string;
    uiFit:       string;
    tip:         string;
};

function evaluateColor(hex: string): ColorVerdict {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lin = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    const L   = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const contrastVsWhite = 1.05 / (L + 0.05);
    const contrastVsBlack = (L + 0.05) / 0.05;

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

    return { score, scoreColor, readability, vibe, uiFit, tip };
}

// ── Secciones ────────────────────────────────────────────────

const SECTIONS = [
    { id: "general",       label: "General",        icon: "globe"    },
    { id: "facial",        label: "Reconocimiento", icon: "aperture" },
    { id: "notifications", label: "Notificaciones", icon: "bell"     },
    { id: "security",      label: "Seguridad",      icon: "shield"   },
    { id: "appearance",    label: "Apariencia",     icon: "sliders"  },
] as const;

// ── ModeSelector ─────────────────────────────────────────────

function ModeSelector() {
    const { mode, setMode, theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{
            flexDirection: "row",
            backgroundColor: c.background.app,
            borderRadius: 10, padding: 3,
            borderWidth: 1, borderColor: c.border.primary,
        }}>
            {(["light", "dark"] as const).map(m => {
                const active = mode === m;
                return (
                    <TouchableOpacity
                        key={m} onPress={() => setMode(m)}
                        style={{
                            flex: 1, flexDirection: "row", alignItems: "center",
                            justifyContent: "center", gap: 7, paddingVertical: 9,
                            borderRadius: 8,
                            backgroundColor: active ? c.background.surface : "transparent",
                            borderWidth: active ? 1 : 0,
                            borderColor: c.border.primary,
                        }}
                    >
                        <Feather
                            name={m === "light" ? "sun" : "moon"} size={14}
                            color={active ? c.brand.primary : c.text.secondary}
                        />
                        <Text style={{
                            fontSize: 13, fontWeight: active ? "600" : "400",
                            color: active ? c.brand.primary : c.text.secondary,
                        }}>
                            {m === "light" ? "Claro" : "Oscuro"}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ── ThemePreview — recibe el tema preview, no el real ─────────
// Así la preview muestra el color temporal sin afectar el resto
// de la app hasta que el usuario guarde.

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
                <Text style={{ fontSize: 11, color: c.text.secondary }}>Vista previa (sin guardar)</Text>
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

// ── AccentColorSelector ──────────────────────────────────────
// Recibe previewHex (estado local temporal) y onPreviewChange
// para actualizar solo el preview. El guardado lo maneja el padre.

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

    return (
        <View style={{ gap: 16 }}>

            {/* ── Tabs de visión: segmented control compacto ── */}
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

            {/* Descripción + strip de colores */}
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

            {/* ── Presets: 5 círculos en línea ── */}
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

            {/* ── Sliders HSL ── */}
            <View style={{ gap: 10 }}>
                {[
                    { label: "Tono",        val: hue, min: 0,  max: 359, onChange: (v: number) => apply(v, sat, lum), suffix: "°" },
                    { label: "Saturación",  val: sat, min: 0,  max: 100, onChange: (v: number) => apply(hue, v, lum), suffix: "%" },
                    { label: "Luminosidad", val: lum, min: 15, max: 85,  onChange: (v: number) => apply(hue, sat, v), suffix: "%" },
                ].map(sl => (
                    <View key={sl.label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Text style={{ fontSize: 12, color: c.text.secondary, width: 80 }}>{sl.label}</Text>
                        <View style={{ flex: 1 }}>
                            <Slider
                                minimumValue={sl.min} maximumValue={sl.max}
                                step={1} value={sl.val}
                                onValueChange={sl.onChange}
                                minimumTrackTintColor={currentHex}
                                maximumTrackTintColor={c.border.primary}
                            />
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary, width: 38, textAlign: "right" }}>
                            {sl.val}{sl.suffix}
                        </Text>
                    </View>
                ))}
            </View>

            {/* ── Evaluador de color en lenguaje humano ── */}
            <View style={{
                backgroundColor: c.background.app,
                borderRadius: 10, overflow: "hidden",
                borderWidth: 1, borderColor: c.border.primary,
            }}>
                {/* Header: muestra de color + score */}
                <View style={{
                    flexDirection: "row", alignItems: "center", gap: 12,
                    padding: 12, borderBottomWidth: 1, borderBottomColor: c.border.primary,
                }}>
                    <View style={{
                        width: 40, height: 40, borderRadius: 10,
                        backgroundColor: currentHex,
                        borderWidth: 1, borderColor: c.border.secondary,
                    }} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: "700", color: c.text.primary, fontFamily: "monospace" }}>
                            {currentHex.toUpperCase()}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 }}>
                            <View style={{
                                width: 7, height: 7, borderRadius: 99,
                                backgroundColor: verdict.scoreColor,
                            }} />
                            <Text style={{ fontSize: 11, fontWeight: "600", color: verdict.scoreColor }}>
                                {verdict.score.charAt(0).toUpperCase() + verdict.score.slice(1)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Filas de análisis */}
                {[
                    { icon: "eye",        label: "Legibilidad", value: verdict.readability },
                    { icon: "sun",        label: "Sensación",   value: verdict.vibe        },
                    { icon: "layout",     label: "En la UI",    value: verdict.uiFit       },
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

                {/* Consejo — solo si hay algo que mejorar */}
                {verdict.tip !== "Este color funciona bien — no necesita ajustes" && (
                    <View style={{
                        flexDirection: "row", alignItems: "flex-start", gap: 8,
                        padding: 10, margin: 8,
                        backgroundColor: c.states.warningLight,
                        borderRadius: 7,
                    }}>
                        <Feather name="info" size={13} color={c.states.warning} style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: 12, color: "#92400E", flex: 1 }}>{verdict.tip}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

// ── MAIN ─────────────────────────────────────────────────────

export default function SettingsView() {
    const { isSmall }                        = useResponsive();
    const { theme, mode, accentColor, setAccentColor } = useTheme();
    const c                                  = theme.colors;

    const [section, setSection] = useState("general");

    // ── Preview temporal de accent (solo vive en esta pantalla) ──
    // Cuando el usuario mueve sliders o elige preset, actualiza
    // previewAccent. Esto NO toca el ThemeContext real.
    // Solo al presionar "Guardar" se llama setAccentColor() del contexto.
    const [previewAccent, setPreviewAccent] = useState(accentColor);
    const [hasUnsaved,    setHasUnsaved]    = useState(false);

    // Tema preview generado on-the-fly solo para el ThemePreview component
    const previewTheme = generateTheme(previewAccent, mode);

    function handlePreviewChange(hex: string) {
        setPreviewAccent(hex);
        setHasUnsaved(hex.toLowerCase() !== accentColor.toLowerCase());
    }

    // Estado del resto de settings
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
    const [saved,           setSaved]           = useState(false);

    function handleSave() {
        // Aplica el accent preview al contexto real → persiste y afecta toda la app
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
    const descStyle:  any = { fontSize: 12, color: c.text.secondary, marginTop: 4 };
    const inputStyle: any = {
        height: 38, borderWidth: 1, borderColor: c.border.primary,
        borderRadius: 6, paddingHorizontal: 12, fontSize: 13,
        color: c.text.primary, backgroundColor: c.background.surface,
    };

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
                        {/* Indicador de cambios sin guardar */}
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
                <Card padding={6} style={isSmall ? undefined : { width: 190, alignSelf: "flex-start" }}>
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
                                            flexDirection: "row", alignItems: "center", gap: 9,
                                            paddingVertical: 9, paddingHorizontal: 10, borderRadius: 7,
                                            backgroundColor: active ? c.brand.primaryLight : "transparent",
                                        }}
                                    >
                                        <Feather name={s.icon as any} size={15} color={active ? c.brand.primary : c.text.secondary} />
                                        <Text style={{ fontSize: 13, fontWeight: active ? "600" : "400", color: active ? c.brand.primary : c.text.secondary }}>
                                            {s.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </Card>

                {/* ── Contenido ── */}
                <Card style={{ flex: 1 }}>

                    {section === "general" && (
                        <View style={{ gap: 16 }}>
                            <Text style={{ fontSize: 15, fontWeight: "700", color: c.text.primary }}>General</Text>
                            <View>
                                <Text style={labelStyle}>Nombre de la institución</Text>
                                <TextInput value={institutionName} onChangeText={setInstitutionName} style={inputStyle} />
                            </View>
                            <View>
                                <Text style={labelStyle}>Semestre activo</Text>
                                <TextInput value={semester} onChangeText={setSemester} placeholder="Ej: 2024-2" placeholderTextColor={c.text.disabled} style={inputStyle} />
                            </View>
                            <View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                    <Text style={labelStyle}>Asistencia mínima requerida</Text>
                                    <Text style={{ fontSize: 16, fontWeight: "700", color: c.brand.primary }}>{minAttendance}%</Text>
                                </View>
                                <Slider minimumValue={50} maximumValue={100} step={5} value={minAttendance} onValueChange={setMinAttendance} minimumTrackTintColor={c.brand.primary} maximumTrackTintColor={c.border.primary} />
                                <Text style={descStyle}>Estudiantes por debajo de este valor serán marcados como "en riesgo"</Text>
                            </View>
                        </View>
                    )}

                    {section === "facial" && (
                        <View>
                            <Text style={{ fontSize: 15, fontWeight: "700", color: c.text.primary, marginBottom: 16 }}>Reconocimiento facial</Text>
                            <View style={{ marginBottom: 16 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                    <Text style={labelStyle}>Umbral de confianza</Text>
                                    <Text style={{ fontSize: 16, fontWeight: "700", color: c.brand.primary }}>{confidence}%</Text>
                                </View>
                                <Slider minimumValue={60} maximumValue={99} step={1} value={confidence} onValueChange={setConfidence} minimumTrackTintColor={c.brand.primary} maximumTrackTintColor={c.border.primary} />
                                <Text style={descStyle}>Mayor valor = más estricto. Valores muy altos pueden generar falsos negativos.</Text>
                            </View>
                            <Divider style={{ marginBottom: 4 }} />
                            <ToggleRow label="Registro automático" description="Registra automáticamente al detectar el rostro" value={autoRegister} onToggle={() => setAutoRegister(v => !v)} />
                            <ToggleRow label="Guardar fotos de registro" description="Almacena la foto tomada al registrar asistencia" value={savePhotos} onToggle={() => setSavePhotos(v => !v)} />
                        </View>
                    )}

                    {section === "notifications" && (
                        <View>
                            <Text style={{ fontSize: 15, fontWeight: "700", color: c.text.primary, marginBottom: 12 }}>Notificaciones</Text>
                            <Divider />
                            <ToggleRow label="Alertas por correo" description="Envía correos cuando un estudiante falta" value={emailAlert} onToggle={() => setEmailAlert(v => !v)} />
                            <ToggleRow label="Reporte semanal" description="Resumen automático de asistencia cada lunes" value={weeklyReport} onToggle={() => setWeeklyReport(v => !v)} />
                            <ToggleRow label="Alerta de estudiantes en riesgo" description="Notifica cuando un estudiante cae por debajo del mínimo" value={atRiskAlert} onToggle={() => setAtRiskAlert(v => !v)} />
                            <ToggleRow label="Resumen diario" description="Resumen de asistencia al finalizar el día" value={dailySummary} onToggle={() => setDailySummary(v => !v)} />
                        </View>
                    )}

                    {section === "security" && (
                        <View>
                            <Text style={{ fontSize: 15, fontWeight: "700", color: c.text.primary, marginBottom: 12 }}>Seguridad</Text>
                            <Divider />
                            <ToggleRow label="Autenticación de dos factores" description="Requiere código adicional al iniciar sesión" value={twoFactor} onToggle={() => setTwoFactor(v => !v)} />
                            <View style={{ marginTop: 16 }}>
                                <Text style={labelStyle}>Tiempo de sesión (minutos)</Text>
                                <TextInput keyboardType="numeric" defaultValue="60" style={[inputStyle, { width: 120 }]} />
                                <Text style={descStyle}>La sesión se cerrará automáticamente después de este tiempo de inactividad.</Text>
                            </View>
                        </View>
                    )}

                    {section === "appearance" && (
                        <View style={{ gap: 20 }}>
                            <Text style={{ fontSize: 15, fontWeight: "700", color: c.text.primary }}>Apariencia</Text>

                            <View style={{ gap: 8 }}>
                                <Text style={labelStyle}>Modo de visualización</Text>
                                <ModeSelector />
                            </View>

                            <Divider />

                            <View style={{ gap: 10 }}>
                                <View>
                                    <Text style={labelStyle}>Color de acento</Text>
                                    <Text style={descStyle}>
                                        Afecta botones, tabs, bordes de foco y todos los elementos interactivos.
                                        Los cambios se previsualizan aquí — guarda para aplicarlos en toda la app.
                                    </Text>
                                </View>
                                <AccentColorSelector
                                    previewHex={previewAccent}
                                    onPreviewChange={handlePreviewChange}
                                />
                            </View>

                            <Divider />

                            {/* Preview usa el tema temporal, no el real */}
                            <ThemePreview previewTheme={previewTheme} />

                            <View style={{
                                flexDirection: "row", alignItems: "center", gap: 8,
                                backgroundColor: c.brand.primaryLight,
                                borderRadius: 8, padding: 10,
                            }}>
                                <Feather name="info" size={13} color={c.brand.primary} />
                                <Text style={{ fontSize: 12, color: c.brand.primary, flex: 1 }}>
                                    La preview muestra cómo se verá el color. Presiona "Guardar cambios" para aplicarlo en toda la app.
                                </Text>
                            </View>
                        </View>
                    )}

                </Card>
            </View>
        </ScrollView>
    );
}