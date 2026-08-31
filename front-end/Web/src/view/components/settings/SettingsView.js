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
import { useRolePermissions } from "../../hooks/useRolePermissions";
import {
    VISION_PRESETS, VISION_MODES, VISION_DESCRIPTIONS,
    AccessibilityPreset, VisionMode, DEFAULT_VISION_MODE,
} from "../theme/presets";
import { ThemeTokens } from "../theme/colourTokens";
import { hslToHex, hexToHsl, evaluateColor } from "./colorUtils";

// ── Componente: Badge de estado WCAG ─────────────────────────

function WcagBadge({ level }: { level["wcagLevel"] }) {
    const { t } = useTranslation();
    const colors= {
        "AAA":   { bg: "#D1FAE5", text: "#065F46" },
        "AA":    { bg: "#DBEAFE", text: "#1E40AF" },
        "A":     { bg: "#FEF3C7", text: "#92400E" },
        "Falla": { bg: "#FEE2E2", text: "#991B1B" },
    };
    const style = colors[level] ?? colors["Falla"];
    return (
        <View style={{
            backgroundColor: style.bg, borderRadius: 14,
            paddingHorizontal: 6, paddingVertical: 2,
        }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: style.text, letterSpacing: 0.5 }}>
                WCAG {level === "Falla" ? t("Falla") : level}
            </Text>
        </View>
    );
}

// ── Componente: Barra de contraste visual ────────────────────

function ContrastBar({ ratio }: { ratio }) {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c = theme.colors;
    const pct = Math.min((ratio / 21) * 100, 100);
    const color = ratio >= 7 ? "#10B981" : ratio >= 4.5 ? "#3B82F6" : ratio >= 3 ? "#F59E0B" : "#EF4444";
    return (
        <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 11, color: c.text.secondary }}>{t("Ratio de contraste")}</Text>
                <Text style={{ fontSize: 10, fontWeight: "700", color }}>{ratio}:1</Text>
            </View>
            <View style={{ height: 5, backgroundColor: c.border.primary, borderRadius: 99 }}>
                <View style={{ height: "100%", width: `${pct}%`, backgroundColor, borderRadius: 99 }} />
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
                {[{ label: "AA (4.5)", min: 4.5 }, { label: "AAA (7)", min: 7 }].map(t => (
                    <View key={t.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Feather
                            name={ratio >= t.min ? "check-circle" : "x-circle"}
                            size={11}
                            color={ratio >= t.min ? "#10B981" : c.text.disabled}
                        />
                        <Text style={{ fontSize: 11, color: ratio >= t.min ? "#10B981" : c.text.disabled }}>
                            {t.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ── Componente: HexInput con validación en vivo ──────────────

function HexInput({ value, onChange }) {
    const { theme } = useTheme();
    const c = theme.colors;
    const [raw, setRaw] = useState(value.replace("#", ""));
    const [valid, setValid] = useState(true);

    useEffect(() => { setRaw(value.replace("#", "")); }, [value]);

    function handleChange(text) {
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
            borderRadius: 14, overflow: "hidden", height,
        }}>
            <View style={{
                width, height: "100%",
                backgroundColor: valid ? value : c.interactive.disabled,
                borderRightWidth, borderRightColor: c.border.primary,
                alignItems: "center", justifyContent: "center",
            }}>
                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>#</Text>
            </View>
            <TextInput
                value={raw.toUpperCase()}
                onChangeText={handleChange}
                autoCapitalize="characters"
                placeholder="HEX"
                placeholderTextColor={c.text.disabled}
                style={{ flex: 1, paddingHorizontal, fontSize: 10, fontWeight: "600", color: c.text.primary,
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
    const { t } = useTranslation();
    const c = theme.colors;

    const modes = [
        { key: "light", label: t("Claro"), icon: "sun", preview: { bg: "#FFFFFF", surface: "#F9FAFB", text: "#111827" } },
        { key: "dark", label: t("Oscuro"), icon: "moon", preview: { bg: "#111827", surface: "#1F2937", text: "#F9FAFB" } },
    ];

    return (
        <View style={{ flexDirection: "row", gap: 10 }}>
            {modes.map(m => {
                const active = mode === m.key;
                return (
                    <TouchableOpacity
                        key={m.key}
                        onPress={() => setMode(m.key)}
                        style={{ flex: 1,
                            borderRadius: 14,
                            borderWidth: active ? 2 : 1.5,
                            borderColor: active ? c.brand.primary : c.border.primary,
                            overflow: "hidden",
                        }}
                        activeOpacity={0.8}
                    >
                        {/* Mini preview del modo */}
                        <View style={{ backgroundColor: m.preview.bg, padding, gap: 5 }}>
                            <View style={{ backgroundColor: m.preview.surface, borderRadius: 14, padding, gap: 3 }}>
                                <View style={{ height, width: "70%", backgroundColor: m.preview.text, borderRadius: 14, opacity: 0.7 }} />
                                <View style={{ height, width: "45%", backgroundColor: m.preview.text, borderRadius: 14, opacity: 0.4 }} />
                            </View>
                            <View style={{ flexDirection: "row", gap: 4 }}>
                                <View style={{ flex: 1, height: 5, backgroundColor: c.brand.primary, borderRadius: 14, opacity: active ? 1 : 0.5 }} />
                                <View style={{ flex: 1, height: 5, backgroundColor: m.preview.surface, borderRadius: 14, borderWidth, borderColor: c.border.primary }} />
                            </View>
                        </View>
                        {/* Label */}
                        <View style={{
                            flexDirection: "row", alignItems: "center", justifyContent: "center",
                            gap, paddingVertical,
                            backgroundColor: active ? c.brand.primaryLight : c.background.surface,
                            borderTopWidth, borderTopColor: c.border.primary,
                        }}>
                            <Feather name={m.icon} size={13} color={active ? c.brand.primary : c.text.secondary} />
                            <Text style={{
                                fontSize: 10, fontWeight: active ? "600" : "400",
                                color: active ? c.brand.primary : c.text.secondary,
                            }}>
                                {m.label}
                            </Text>
                            {active && (
                                <View style={{
                                    width, height, borderRadius: 14,
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

function LanguageSelector() {
    const { theme } = useTheme();
    const c = theme.colors;
    const { language, setLanguage, supportedLanguages, currentLanguage, isLoading } = useTranslation();

    const [open,  setOpen]  = useState(false);
    const [query, setQuery] = useState("");
    const searchRef         = useRef(null);
    const dropdownAnim      = useRef(new Animated.Value(0)).current;

    // Altura del trigger en px — necesaria para posicionar el dropdown justo debajo
    const TRIGGER_H = 52;
    // Altura máxima del panel (hasta 6 ítems de 44px + 52 de buscador)
    const MAX_ITEMS = Math.min(supportedLanguages.length, 6);
    const PANEL_H   = MAX_ITEMS * 44 + 52;

    const filtered = query.trim() === ""
        ? supportedLanguages
        : supportedLanguages.filter(l =>
            l.labelES.toLowerCase().includes(query.toLowerCase()) ||
            l.label.toLowerCase().includes(query.toLowerCase())   ||
            l.code.toLowerCase().includes(query.toLowerCase())
        );

    const animateOpen = useCallback(() => {
        setOpen(true);
        setQuery("");
        Animated.timing(dropdownAnim, {
            toValue, duration,
            easing: Easing.out(Easing.quad), useNativeDriver,
        }).start(() => searchRef.current?.focus());
    }, [dropdownAnim]);

    const animateClose = useCallback(() => {
        Animated.timing(dropdownAnim, {
            toValue, duration,
            easing: Easing.in(Easing.quad), useNativeDriver,
        }).start(() => { setOpen(false); setQuery(""); });
    }, [dropdownAnim]);

    const handleToggle = useCallback(() => {
        open ? animateClose() : animateOpen();
    }, [open, animateOpen, animateClose]);

    const handleSelect = useCallback((code) => {
        setLanguage(code);
        animateClose();
    }, [setLanguage, animateClose]);

    const panelHeight = dropdownAnim.interpolate({
        inputRange: [0, 1], outputRange: [0, PANEL_H],
    });
    const panelOpacity = dropdownAnim.interpolate({
        inputRange: [0, 0.3, 1], outputRange: [0, 1, 1],
    });

    return (
        // position: relative para que el absolute del dropdown se ancle aquí
        <View style={{ position: "relative", width, zIndex: 200 }}>

            {/* ── Trigger ──────────────────────────────────────── */}
            <TouchableOpacity
                onPress={handleToggle}
                disabled={isLoading}
                activeOpacity={0.8}
                style={{
                    height,
                    flexDirection: "row",
                    alignItems: "center",
                    gap,
                    paddingHorizontal,
                    borderRadius: 14,
                    borderWidth: open ? 2 : 1.5,
                    borderColor: open ? c.brand.primary : c.border.primary,
                    backgroundColor: open ? c.brand.primaryLight : c.background.surface,
                    borderBottomLeftRadius:  open ? 0,
                    borderBottomRightRadius: open ? 0,
                    opacity: isLoading ? 0.5,
                    // zIndex para que el trigger quede sobre el panel cuando está cerrado
                    zIndex,
                }}
            >
                <Text style={{ fontSize, lineHeight: 22 }}>{currentLanguage?.flag ?? "🌐"}</Text>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: open ? c.brand.primary : c.text.primary }}>
                        {currentLanguage?.labelES ?? "Idioma"}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 1 }}>
                        {currentLanguage?.label ?? ""}
                    </Text>
                </View>
                <Animated.View style={{
                    transform: [{
                        rotate: dropdownAnim.interpolate({
                            inputRange: [0, 1], outputRange: ["0deg", "180deg"],
                        }),
                    }],
                }}>
                    <Feather name="chevron-down" size={16} color={open ? c.brand.primary : c.text.secondary} />
                </Animated.View>
            </TouchableOpacity>

            {/* ── Dropdown flotante — position absolute ────────── */}
            <Animated.View
                pointerEvents={open ? "auto" : "none"}
                style={{
                    position: "absolute",
                    top,          // justo debajo del trigger
                    left,
                    right,
                    zIndex,
                    height,
                    opacity,
                    overflow: "hidden",
                    borderWidth,
                    borderTopWidth,
                    borderColor: c.brand.primary,
                    borderBottomLeftRadius,
                    borderBottomRightRadius,
                    backgroundColor: c.background.surface,
                    // Sombra para que visualmente flote
                    shadowColor: "#000",
                    shadowOffset: { width, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius,
                    elevation,
                }}
            >
                {/* Buscador */}
                <View style={{
                    flexDirection: "row", alignItems: "center", gap,
                    margin, paddingHorizontal: 6, paddingVertical: 2,
                    borderRadius: 14, borderWidth, borderColor: c.border.primary,
                    backgroundColor: c.background.app,
                }}>
                    <Feather name="search" size={13} color={c.text.secondary} />
                    <TextInput
                        ref={searchRef}
                        value={query}
                        onChangeText={setQuery}
                        placeholder={t("Buscar idioma…")}
                        placeholderTextColor={c.text.secondary}
                        style={{ flex: 1, fontSize: 11, color: c.text.primary,
                            padding,
                            // @ts-ignore — válido en web
                            outlineStyle: "none",
                        }}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setQuery("")}
                            hitSlop={{ top, bottom, left, right: 6 }}
                        >
                            <Feather name="x" size={13} color={c.text.secondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Lista */}
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {filtered.length === 0 ? (
                        <View style={{ paddingVertical, alignItems: "center" }}>
                            <Text style={{ fontSize: 11, color: c.text.secondary }}>{t("Sin resultados")}</Text>
                        </View>
                    ) : filtered.map((lang, i) => {
                        const active = language === lang.code;
                        const isLast = i === filtered.length - 1;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => handleSelect(lang.code)}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: "row", alignItems: "center", gap,
                                    paddingHorizontal: 6, paddingVertical: 2,
                                    backgroundColor: active ? c.brand.primaryLight : "transparent",
                                    borderBottomWidth: isLast ? 0,
                                    borderBottomColor: c.border.primary,
                                }}
                            >
                                <Text style={{ fontSize, width, textAlign: "center" }}>{lang.flag}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: 10, fontWeight: active ? "600" : "400",
                                        color: active ? c.brand.primary : c.text.primary,
                                    }}>
                                        {lang.labelES}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                        {lang.label}
                                    </Text>
                                </View>
                                {active && (
                                    <View style={{
                                        width, height, borderRadius: 14,
                                        backgroundColor: c.brand.primary,
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <Feather name="check" size={10} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </Animated.View>
        </View>
    );
}

// ── ThemePreview ─────────────────────────────────────────────

function ThemePreview({ previewTheme }: { previewTheme }) {
    const { t } = useTranslation();
    const c = previewTheme.colors;
    return (
        <View style={{ borderWidth, borderColor: c.border.primary, borderRadius: 14, overflow: "hidden" }}>
            <View style={{
                backgroundColor: c.background.surface,
                padding, flexDirection: "row", alignItems: "center", gap,
                borderBottomWidth, borderBottomColor: c.border.primary,
            }}>
                <View style={{ width, height, borderRadius: 14, backgroundColor: c.brand.primary }} />
                <Text style={{ fontSize: 11, color: c.text.secondary }}>{t("Vista previa en vivo")}</Text>
                <View style={{
                    marginLeft: "auto",
                    backgroundColor: c.brand.primaryLight,
                    borderRadius: 14, paddingHorizontal: 6, paddingVertical: 2,
                }}>
                    <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "700" }}>{t("SIN GUARDAR")}</Text>
                </View>
            </View>
            <View style={{ backgroundColor: c.background.app, padding, gap: 8 }}>
                {/* Barra + badge */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ flex: 1, height: 5, backgroundColor: c.border.primary, borderRadius: 99 }}>
                        <View style={{ height: "100%", width: "72%", backgroundColor: c.brand.primary, borderRadius: 99 }} />
                    </View>
                    <View style={{ backgroundColor: c.brand.primaryLight, borderRadius: 14, paddingHorizontal, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "600" }}>72%</Text>
                    </View>
                </View>
                {/* Botones */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                    <View style={{ flex: 1, backgroundColor: c.brand.primary, borderRadius: 14, padding, alignItems: "center" }}>
                        <Text style={{ fontSize: 11, color: "#fff", fontWeight: "600" }}>{t("Primario")}</Text>
                    </View>
                    <View style={{ flex: 1, borderRadius: 14, padding, alignItems: "center", borderWidth, borderColor: c.brand.primary }}>
                        <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "600" }}>{t("Outline")}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: c.interactive.disabled, borderRadius: 14, padding, alignItems: "center" }}>
                        <Text style={{ fontSize: 11, color: c.text.secondary, fontWeight: "600" }}>{t("Ghost")}</Text>
                    </View>
                </View>
                {/* Badges */}
                <View style={{ flexDirection: "row", gap, flexWrap: "wrap" }}>
                    {[
                        { labelKey: "Activo",      bg: c.brand.primaryLight,  color: c.brand.primary },
                        { labelKey: "Éxito",       bg: c.states.successLight, color: "#065F46"       },
                        { labelKey: "Advertencia", bg: c.states.warningLight, color: "#92400E"       },
                        { labelKey: "Peligro",     bg: c.states.dangerLight,  color: "#991B1B"       },
                    ].map(b => (
                        <View key={b.labelKey} style={{ backgroundColor: b.bg, borderRadius: 14, paddingHorizontal, paddingVertical: 2 }}>
                            <Text style={{ fontSize: 11, color: b.color, fontWeight: "600" }}>{t(b.labelKey)}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

// ── AccentColorSelector mejorado ─────────────────────────────


    onPreviewChange: (hex) => void;
};

function AccentColorSelector({ previewHex, onPreviewChange }) {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c         = theme.colors;

    const [visionMode, setVisionMode] = useState(DEFAULT_VISION_MODE);
    const [hue, setHue]               = useState(() => hexToHsl(previewHex)[0]);
    const [sat, setSat]               = useState(() => hexToHsl(previewHex)[1]);
    const [lum, setLum]               = useState(() => hexToHsl(previewHex)[2]);
    const [showHexInput, setShowHexInput] = useState(false);

    const currentHex = hslToHex(hue, sat, lum);
    const verdict    = evaluateColor(currentHex, t);

    function apply(h, s, l) {
        setHue(h); setSat(s); setLum(l);
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
                { max,  label: t("🔴 Rojo") },
                { max,  label: t("🟠 Naranja") },
                { max, label: t("🟢 Verde") },
                { max, label: t("🩵 Cian") },
                { max, label: t("🔵 Azul") },
                { max, label: t("🟣 Violeta") },
                { max, label: t("🩷 Rosa") },
                { max, label: t("🔴 Rojo") },
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
                borderRadius: 14, padding,
                borderWidth, borderColor: c.border.primary,
                flexDirection: "row", flexWrap: "wrap", gap,
            }}>
                {VISION_MODES.map(vm => {
                    const active = visionMode === vm;
                    return (
                        <TouchableOpacity
                            key={vm} onPress={() => setVisionMode(vm)}
                            style={{
                                paddingVertical, paddingHorizontal, borderRadius: 14,
                                backgroundColor: active ? c.brand.primary : "transparent",
                            }}
                        >
                            <Text style={{
                                fontSize: 10, fontWeight: active ? "600" : "400",
                                color: active ? "#fff" : c.text.secondary,
                            }}>
                                {vm === "normal"        ? t("Normal")       :
                                    vm === "deuteranopia"  ? t("Deuteranopia") :
                                        vm === "protanopia"    ? t("Protanopia")   :
                                            vm === "tritanopia"    ? t("Tritanopia")   : t("Acromatopsia")}
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
                <View style={{ flexDirection: "row", height, borderRadius: 14, overflow: "hidden" }}>
                    {VISION_PRESETS[visionMode].map(p => (
                        <View key={p.key} style={{ flex: 1, backgroundColor: p.color }} />
                    ))}
                </View>
            </View>

            {/* ── Presets ── */}
            <View style={{ flexDirection: "row", gap, alignItems: "center" }}>
                {VISION_PRESETS[visionMode].map(preset => {
                    const active = previewHex.toLowerCase() === preset.color.toLowerCase();
                    return (
                        <TouchableOpacity
                            key={preset.key}
                            onPress={() => applyPreset(preset)}
                            style={{ alignItems: "center", gap: 4 }}
                        >
                            <View style={{
                                width, height, borderRadius: 14,
                                backgroundColor: preset.color,
                                alignItems: "center", justifyContent: "center",
                                borderWidth: active ? 2.5,
                                borderColor: "#fff",
                                shadowColor: active ? preset.color : "transparent",
                                shadowOpacity: active ? 0.6,
                                shadowRadius, elevation: active ? 4,
                            }}>
                                {active && <Feather name="check" size={14} color="#fff" />}
                            </View>
                            <Text style={{ fontSize: 11, color: active ? c.brand.primary : c.text.secondary }}>
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
                        val, min, max,
                        onChange: (v) => apply(v, sat, lum),
                        suffix: "°",
                        desc: sliderDescriptions.hue.get(hue),
                        gradient: "hue",
                    },
                    {
                        label: t("Saturación"),
                        val, min, max,
                        onChange: (v) => apply(hue, v, lum),
                        suffix: "%",
                        desc: sliderDescriptions.sat(sat),
                        hint: sat < 20 ? t("⚠ Muy bajo — el color se verá gris") : sat > 90 ? t("⚠ Muy alto — puede fatigar la vista") : null,
                    },
                    {
                        label: t("Luminosidad"),
                        val, min, max,
                        onChange: (v) => apply(hue, sat, v),
                        suffix: "%",
                        desc: sliderDescriptions.lum(lum),
                        hint: lum > 75 ? t("⚠ Muy claro — el texto blanco encima no será legible") : lum < 22 ? t("⚠ Muy oscuro — puede confundirse con el texto") : null,
                    },
                ].map(sl => (
                    <View key={sl.label} style={{ gap: 5 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                <Text style={{ fontSize: 11, color: c.text.secondary }}>{sl.label}</Text>
                                <Text style={{ fontSize: 11, color: c.text.disabled }}>— {sl.desc}</Text>
                            </View>
                            <Text style={{ fontSize: 10, fontWeight: "700", color: c.text.primary }}>
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
                borderRadius: 14, overflow: "hidden",
                borderWidth, borderColor: c.border.primary,
            }}>
                {/* Header */}
                <View style={{
                    flexDirection: "row", alignItems: "center", gap,
                    padding, borderBottomWidth, borderBottomColor: c.border.primary,
                }}>
                    <View style={{
                        width, height, borderRadius: 14,
                        backgroundColor,
                        borderWidth, borderColor: c.border.secondary,
                    }} />
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: c.text.primary, fontFamily: "monospace" }}>
                            {currentHex.toUpperCase()}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <View style={{
                                width, height, borderRadius: 14,
                                backgroundColor: verdict.scoreColor,
                            }} />
                            <Text style={{ fontSize: 10, fontWeight: "600", color: verdict.scoreColor }}>
                                {(() => { const s = t(verdict.score); return s.charAt(0).toUpperCase() + s.slice(1); })()}
                            </Text>
                            <WcagBadge level={verdict.wcagLevel} />
                        </View>
                    </View>
                </View>

                {/* Barra de contraste */}
                <View style={{ padding, borderBottomWidth, borderBottomColor: c.border.primary }}>
                    <ContrastBar ratio={verdict.contrastRatio} />
                </View>

                {/* Filas de análisis */}
                {[
                    { icon: "eye",    label: t("Legibilidad"), value: verdict.readability },
                    { icon: "sun",    label: t("Sensación"),   value: verdict.vibe        },
                    { icon: "layout", label: t("En la UI"),    value: verdict.uiFit       },
                ].map((row, i, arr) => (
                    <View key={row.label} style={{
                        flexDirection: "row", alignItems: "flex-start",
                        paddingVertical, paddingHorizontal,
                        gap,
                        borderBottomWidth: i < arr.length - 1 ? 1,
                        borderBottomColor: c.border.primary,
                    }}>
                        <Feather name={row.icon} size={13} color={c.text.secondary} style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: 11, color: c.text.secondary, width: 72 }}>{row.label}</Text>
                        <Text style={{ fontSize: 11, color: c.text.primary, flex: 1 }}>{row.value}</Text>
                    </View>
                ))}

                {/* Consejo */}
                {verdict.tip !== t("Este color funciona bien — no necesita ajustes") ? (
                    <View style={{
                        flexDirection: "row", alignItems: "flex-start", gap,
                        padding, margin,
                        backgroundColor: c.states.warningLight,
                        borderRadius: 14,
                    }}>
                        <Feather name="info" size={13} color={c.states.warning} style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: 11, color: "#92400E", flex: 1 }}>{verdict.tip}</Text>
                    </View>
                ) : (
                    <View style={{
                        flexDirection: "row", alignItems: "flex-start", gap,
                        padding, margin,
                        backgroundColor: c.states.successLight,
                        borderRadius: 14,
                    }}>
                        <Feather name="check-circle" size={13} color="#059669" style={{ marginTop: 1 }} />
                        <Text style={{ fontSize: 11, color: "#065F46", flex: 1 }}>{t("Este color funciona bien — no necesita ajustes")}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

// ── Componente: StatsCard (para General) ─────────────────────

function StatsRow({ label, value, icon, color }) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{
            flexDirection: "row", alignItems: "center", gap,
            paddingVertical,
        }}>
            <View style={{
                width, height, borderRadius: 14,
                backgroundColor: color + "20",
                alignItems: "center", justifyContent: "center",
            }}>
                <Feather name={icon} size={15} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: c.text.secondary }}>{label}</Text>
                <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.primary }}>{value}</Text>
            </View>
        </View>
    );
}

// ── Componente: SecurityStrengthMeter ────────────────────────

function SecurityMeter({ twoFactor, sessionTime }) {
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c = theme.colors;

    const score = [
        twoFactor,
        parseInt(sessionTime) <= 60,
        parseInt(sessionTime) > 0,
        true, // base
    ].filter(Boolean).length;

    const levels = [t("Débil"), t("Regular"), t("Buena"), t("Fuerte")];
    const colors = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
    const label  = levels[score - 1] ?? t("Débil");
    const color  = colors[score - 1] ?? "#EF4444";

    return (
        <View style={{
            backgroundColor: c.background.app,
            borderRadius: 14, padding,
            borderWidth, borderColor: c.border.primary,
            gap,
        }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 11, color: c.text.secondary }}>{t("Nivel de seguridad")}</Text>
                <Text style={{ fontSize: 10, fontWeight: "700", color }}>{label}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 4 }}>
                {[1, 2, 3, 4].map(i => (
                    <View key={i} style={{ flex: 1, height, borderRadius: 14,
                        backgroundColor: i <= score ? color : c.border.primary,
                    }} />
                ))}
            </View>
            <View style={{ gap: 6 }}>
                {[
                    { label: t("Autenticación de dos factores"), ok: twoFactor },
                    { label: t("Sesión corta (≤60 min)"), ok: parseInt(sessionTime) <= 60 },
                ].map(item => (
                    <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Feather
                            name={item.ok ? "check-circle" : "circle"}
                            size={13}
                            color={item.ok ? "#10B981" : c.text.disabled}
                        />
                        <Text style={{ fontSize: 11, color: item.ok ? c.text.primary : c.text.disabled }}>
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
    const { t }     = useTranslation();
    const c = theme.colors;

    const zones = [
        { min, max, label: t("Permisivo"), color: "#10B981", desc: t("Detecta bien aunque haya cambios de luz o ángulo. Más falsos positivos.") },
        { min, max, label: t("Equilibrado"), color: "#3B82F6", desc: t("Buen balance entre precisión y tolerancia. Recomendado para la mayoría.") },
        { min, max, label: t("Estricto"), color: "#F59E0B", desc: t("Muy preciso, pero puede fallar si el estudiante cambió de lentes o peinado.") },
        { min, max, label: t("Muy estricto"), color: "#EF4444", desc: t("Alto riesgo de falsos negativos. Solo para entornos con iluminación controlada.") },
    ];

    const zone = zones.find(z => value >= z.min && value <= z.max) ?? zones[1];

    return (
        <View style={{
            backgroundColor: zone.color + "12",
            borderRadius: 14, padding,
            borderLeftWidth, borderLeftColor: zone.color,
            gap,
        }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: zone.color }}>{zone.label}</Text>
            <Text style={{ fontSize: 11, color: c.text.primary, lineHeight: 18 }}>{zone.desc}</Text>
        </View>
    );
}

// ── MAIN ─────────────────────────────────────────────────────

export default function SettingsView() {
    const { isSmall }                        = useResponsive();
    const { theme, mode, accentColor, setAccentColor } = useTheme();
    const { currentLanguage, t }             = useTranslation();
    const permissions                        = useRolePermissions();
    const c                                  = theme.colors;

    const [section, setSection] = useState("appearance");

    const [previewAccent, setPreviewAccent] = useState(accentColor);
    const [hasUnsaved,    setHasUnsaved]    = useState(false);

    const previewTheme = generateTheme(previewAccent, mode);

    function handlePreviewChange(hex) {
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

    // Secciones visibles según el rol: admin ve todo, teacher/student solo apariencia
    const ALL_SECTIONS = [
        { id: "general",       label: t("General"),        icon: "globe",    desc: t("Institución y semestre"),  adminOnly: true  },
        { id: "facial",        label: t("Reconocimiento"), icon: "aperture", desc: t("Umbral y cámara"),        adminOnly: true  },
        { id: "notifications", label: t("Notificaciones"), icon: "bell",     desc: t("Alertas y reportes"),     adminOnly: false },
        { id: "security",      label: t("Seguridad"),      icon: "shield",   desc: t("Acceso y sesiones"),      adminOnly: true  },
        { id: "appearance",    label: t("Apariencia"),     icon: "sliders",  desc: t("Tema y colores"),         adminOnly: false },
    ];

    const SECTIONS = ALL_SECTIONS.filter(s => !s.adminOnly || permissions.canManageUsers);

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

    const labelStyle= { fontSize: 10, fontWeight: "500", color: c.text.primary, marginBottom: 6 };
    const descStyle= { fontSize: 11, color: c.text.secondary, marginTop, lineHeight: 18 };
    const inputStyle= {
        height, borderWidth: 1.5, borderColor: c.border.primary,
        borderRadius: 14, paddingHorizontal, fontSize: 11, color: c.text.primary, backgroundColor: c.background.surface,
    };
    const sectionTitle= { fontSize: 10, fontWeight: "700", color: c.text.primary };

    // Badge de notificaciones activas por sección
    function SectionBadge({ id }: { id: string }) {
        if (id === "notifications" && activeNotifications > 0) {
            return (
                <View style={{
                    width, height, borderRadius: 14,
                    backgroundColor: c.brand.primary,
                    alignItems: "center", justifyContent: "center",
                }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>{activeNotifications}</Text>
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
            contentContainerStyle={{ padding: isSmall ? 16, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            <PageHeader
                title={t("Configuración")}
                subtitle={t("Personaliza FaceAttend EDU a tu institución")}
                actions={
                    <View style={{ flexDirection: "row", gap, alignItems: "center" }}>
                        {hasUnsaved && (
                            
                                <View style={{
                                    flexDirection: "row", alignItems: "center", gap,
                                    backgroundColor: c.states.warningLight,
                                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 14,
                                }}>
                                    <View style={{ width, height, borderRadius: 14, backgroundColor: c.states.warning }} />
                                    <Text style={{ fontSize: 11, color: c.states.warning, fontWeight: "600" }}>
                                        {t("Sin guardar")}
                                    </Text>
                                </View>
                                <UIButton variant="ghost" size="sm" onPress={handleDiscard}>
                                    {t("Descartar")}
                                </UIButton>
                            </>
                        )}
                        <UIButton variant="primary" onPress={handleSave} size="sm">
                            {saved ? t("¡Guardado ✓") : t("Guardar cambios")}
                        </UIButton>
                    </View>
                }
            />

            <View style={{ flexDirection: isSmall ? "column" : "row", gap: 20 }}>

                {/* ── Nav lateral ── */}
                <Card padding={6} style={isSmall ? undefined : { width, alignSelf: "flex-start" }}>
                    {isSmall ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={{ flexDirection: "row", gap: 2 }}>
                                {SECTIONS.map(s => {
                                    const active = section === s.id;
                                    return (
                                        <TouchableOpacity
                                            key={s.id} onPress={() => setSection(s.id)}
                                            style={{
                                                flexDirection: "row", alignItems: "center", gap,
                                                paddingVertical, paddingHorizontal, borderRadius: 14,
                                                backgroundColor: active ? c.brand.primaryLight : "transparent",
                                            }}
                                        >
                                            <Feather name={s.icon} size={14} color={active ? c.brand.primary : c.text.secondary} />
                                            <Text style={{ fontSize: 10, fontWeight: active ? "600" : "400", color: active ? c.brand.primary : c.text.secondary }}>
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
                                            paddingVertical, paddingHorizontal, borderRadius: 14,
                                            backgroundColor: active ? c.brand.primaryLight : "transparent",
                                        }}
                                    >
                                        <Feather name={s.icon} size={15} color={active ? c.brand.primary : c.text.secondary} />
                                        <View style={{ flex: 1, marginLeft: 9 }}>
                                            <Text style={{ fontSize: 10, fontWeight: active ? "600" : "400", color: active ? c.brand.primary : c.text.secondary }}>
                                                {s.label}
                                            </Text>
                                            {!active && (
                                                <Text style={{ fontSize: 11, color: c.text.disabled, marginTop: 1 }}>
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
                            <Text style={sectionTitle}>{t("General")}</Text>

                            
                                <Text style={labelStyle}>{t("Nombre de la institución")}</Text>
                                <TextInput value={institutionName} onChangeText={setInstitutionName} style={inputStyle} />
                                <Text style={descStyle}>{t("Aparece en reportes, correos y en la cabecera de la app.")}</Text>
                            </View>

                            
                                <Text style={labelStyle}>{t("Semestre activo")}</Text>
                                <TextInput
                                    value={semester} onChangeText={setSemester}
                                    placeholder={t("Ej: 2024-2")}
                                    placeholderTextColor={c.text.disabled}
                                    style={inputStyle}
                                />
                                <Text style={descStyle}>{t("Formato recomendado: AÑO-PERÍODO (ej. 2025-1). Se usa para agrupar los registros de asistencia.")}</Text>
                            </View>

                            
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                                    
                                        <Text style={labelStyle}>{t("Asistencia mínima requerida")}</Text>
                                        <Text style={[descStyle, { marginTop: 0 }]}>{t("Umbral para marcar estudiantes \"en riesgo\"")}</Text>
                                    </View>
                                    <Text style={{ fontSize: 10, fontWeight: "800", color: c.brand.primary }}>{minAttendance}%</Text>
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
                                            fontSize: 11, apiKey = == minAttendance ? c.brand.primary : c.text.disabled, apiKey = == minAttendance ? "700" : "400",
                                        }}>
                                            {v}%
                                        </Text>
                                    ))}
                                </View>
                                {/* Guía contextual */}
                                <View style={{
                                    marginTop,
                                    backgroundColor: minAttendance >= 90 ? c.states.warningLight : c.brand.primaryLight,
                                    borderRadius: 14, padding,
                                    flexDirection: "row", gap,
                                }}>
                                    <Feather
                                        name={minAttendance >= 90 ? "alert-triangle" : "info"}
                                        size={13}
                                        color={minAttendance >= 90 ? c.states.warning : c.brand.primary}
                                        style={{ marginTop: 1 }}
                                    />
                                    <Text style={{ fontSize: 11, color: minAttendance >= 90 ? "#92400E" : c.brand.primary, flex, lineHeight: 18 }}>
                                        {minAttendance >= 90
                                            ? t("Umbral muy alto — muchos estudiantes podrían quedar en riesgo aunque asistan con regularidad.")
                                            : minAttendance <= 60
                                            ? t("Umbral bajo — los estudiantes tendrán mucha flexibilidad de faltar. Asegúrate de que sea intencional.")
                                            : `${t("Con este umbral, un estudiante puede faltar hasta")} ${Math.floor((100 - minAttendance))} ${t("clases de cada 100 sin quedar en riesgo.")}`
                                        }
                                    </Text>
                                </View>
                            </View>

                            <Divider />

                            {/* Idioma de la aplicación */}
                            <View style={{ flexDirection: "row", alignItems: "flex-start", gap, zIndex: 100 }}>
                                {/* Texto a la izquierda */}
                                <View style={{ flex: 1 }}>
                                    <Text style={labelStyle}>{t("Idioma de la aplicación")}</Text>
                                    <Text style={[descStyle, { marginTop: 0 }]}>
                                        {t("Traduce toda la interfaz automáticamente. El español es el idioma original de FaceAttend EDU.")}
                                    </Text>
                                </View>
                                {/* Selector a la derecha — el dropdown flota */}
                                <LanguageSelector />
                            </View>

                            <Divider />

                            {/* Resumen rápido */}
                            <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.secondary, letterSpacing: 0.5, textTransform: "uppercase" }}>
                                {t("Resumen actual")}
                            </Text>
                            <View style={{ gap: 0 }}>
                                <StatsRow label={t("Institución")} value={institutionName || t("Sin definir")} icon="home" color={c.brand.primary} />
                                <Divider />
                                <StatsRow label={t("Semestre activo")} value={semester || t("Sin definir")} icon="calendar" color="#8B5CF6" />
                                <Divider />
                                <StatsRow label={t("Mínimo de asistencia")} value={`${minAttendance}%`} icon="bar-chart-2" color="#10B981" />
                                <Divider />
                                <StatsRow label={t("Idioma")} value={currentLanguage?.labelES ?? t("Español")} icon="globe" color="#3B82F6" />
                            </View>
                        </View>
                    )}

                    {/* ══ RECONOCIMIENTO ═══════════════════════════════════ */}
                    {section === "facial" && (
                        <View style={{ gap: 18 }}>
                            <Text style={sectionTitle}>{t("Reconocimiento facial")}</Text>

                            
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
                                    
                                        <Text style={labelStyle}>{t("Umbral de confianza")}</Text>
                                        <Text style={[descStyle, { marginTop: 0 }]}>{t("Qué tan seguro debe estar el modelo para registrar")}</Text>
                                    </View>
                                    <Text style={{ fontSize: 10, fontWeight: "800", color: c.brand.primary }}>{confidence}%</Text>
                                </View>
                                <Slider
                                    minimumValue={60} maximumValue={99} step={1}
                                    value={confidence} onValueChange={setConfidence}
                                    minimumTrackTintColor={c.brand.primary}
                                    maximumTrackTintColor={c.border.primary}
                                />
                                {/* Zonas de referencia */}
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                                    {[`60 — ${t("Permisivo")}`, "75", "85 ✓", `95 — ${t("Estricto")}`, "99"].map((v, i) => (
                                        <Text key={i} style={{ fontSize: 11, color: c.text.disabled }}>{v}</Text>
                                    ))}
                                </View>
                                <View style={{ marginTop: 12 }}>
                                    <ConfidenceGuide value={confidence} />
                                </View>
                            </View>

                            <Divider />

                            <ToggleRow
                                label={t("Registro automático")}
                                description={t("Registra automáticamente al detectar el rostro sin confirmación manual")}
                                value={autoRegister}
                                onToggle={() => setAutoRegister(v => !v)}
                            />

                            {/* Advertencia contextual para registro automático */}
                            {autoRegister && confidence < 75 && (
                                <View style={{
                                    backgroundColor: c.states.warningLight, borderRadius: 14, padding,
                                    flexDirection: "row", gap,
                                }}>
                                    <Feather name="alert-triangle" size={13} color={c.states.warning} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 11, color: "#92400E", flex, lineHeight: 18 }}>
                                        {t("Con umbral bajo y registro automático habilitado, hay mayor riesgo de registrar asistencia incorrectamente. Considera subir el umbral a al menos 75%.")}
                                    </Text>
                                </View>
                            )}

                            <ToggleRow
                                label={t("Guardar fotos de registro")}
                                description={t("Almacena la foto tomada al registrar. Útil para auditorías pero consume más espacio.")}
                                value={savePhotos}
                                onToggle={() => setSavePhotos(v => !v)}
                            />

                            {savePhotos && (
                                <View style={{
                                    backgroundColor: c.brand.primaryLight, borderRadius: 14, padding,
                                    flexDirection: "row", gap,
                                }}>
                                    <Feather name="info" size={13} color={c.brand.primary} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 11, color: c.brand.primary, flex, lineHeight: 18 }}>
                                        {t("Las fotos se almacenan localmente. Asegúrate de tener suficiente espacio y de informar a los estudiantes según tu política de privacidad.")}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* ══ NOTIFICACIONES ═══════════════════════════════════ */}
                    {section === "notifications" && (
                        <View style={{ gap: 4 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                <Text style={sectionTitle}>{t("Notificaciones")}</Text>
                                <View style={{
                                    backgroundColor: c.brand.primaryLight, borderRadius: 14,
                                    paddingHorizontal: 6, paddingVertical: 2,
                                }}>
                                    <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "600" }}>
                                        {activeNotifications} {activeNotifications !== 1 ? t("activas") : t("activa")}
                                    </Text>
                                </View>
                            </View>
                            <Divider />
                            <ToggleRow
                                label={t("Alertas por correo")}
                                description={t("Envía un correo al docente cuando un estudiante no asiste. Ideal para clases pequeñas o con seguimiento individual.")}
                                value={emailAlert}
                                onToggle={() => setEmailAlert(v => !v)}
                            />
                            <ToggleRow
                                label={t("Reporte semanal")}
                                description={t("Resumen automático de asistencia enviado cada lunes a las 8am. Incluye porcentajes por curso.")}
                                value={weeklyReport}
                                onToggle={() => setWeeklyReport(v => !v)}
                            />
                            <ToggleRow
                                label={t("Alerta de estudiantes en riesgo")}
                                description={`${t("Notifica cuando un estudiante cae por debajo del")} ${minAttendance}% ${t("de asistencia mínima configurado en General.")}`}
                                value={atRiskAlert}
                                onToggle={() => setAtRiskAlert(v => !v)}
                            />
                            <ToggleRow
                                label={t("Resumen diario")}
                                description={t("Resumen automático de asistencia al finalizar el día. Puede generar muchas notificaciones en días de muchas clases.")}
                                value={dailySummary}
                                onToggle={() => setDailySummary(v => !v)}
                            />

                            {/* Aviso si ninguna activa */}
                            {activeNotifications === 0 && (
                                <View style={{
                                    marginTop, backgroundColor: c.states.warningLight,
                                    borderRadius: 14, padding,
                                    flexDirection: "row", gap,
                                }}>
                                    <Feather name="bell-off" size={14} color={c.states.warning} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 11, color: "#92400E", flex, lineHeight: 18 }}>
                                        {t("No tienes ninguna notificación activa. No recibirás avisos sobre asistencia ni estudiantes en riesgo.")}
                                    </Text>
                                </View>
                            )}

                            {/* Aviso si diario + semanal juntos */}
                            {dailySummary && weeklyReport && (
                                <View style={{
                                    marginTop, backgroundColor: c.brand.primaryLight,
                                    borderRadius: 14, padding,
                                    flexDirection: "row", gap,
                                }}>
                                    <Feather name="info" size={13} color={c.brand.primary} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 11, color: c.brand.primary, flex, lineHeight: 18 }}>
                                        {t("Tienes el resumen diario y el semanal activados. Considera desactivar uno para reducir el volumen de correos.")}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* ══ SEGURIDAD ═════════════════════════════════════════ */}
                    {section === "security" && (
                        <View style={{ gap: 18 }}>
                            <Text style={sectionTitle}>{t("Seguridad")}</Text>

                            <SecurityMeter twoFactor={twoFactor} sessionTime={sessionTime} />

                            <Divider />

                            <ToggleRow
                                label={t("Autenticación de dos factores")}
                                description={t("Requiere un código adicional al iniciar sesión. Protege la cuenta aunque alguien obtenga tu contraseña.")}
                                value={twoFactor}
                                onToggle={() => setTwoFactor(v => !v)}
                            />

                            {!twoFactor && (
                                <View style={{
                                    backgroundColor: c.states.warningLight, borderRadius: 14, padding,
                                    flexDirection: "row", gap,
                                }}>
                                    <Feather name="shield" size={13} color={c.states.warning} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 11, color: "#92400E", flex, lineHeight: 18 }}>
                                        {t("Sin 2FA, la cuenta queda vulnerable si la contraseña se compromete. Se recomienda activarlo.")}
                                    </Text>
                                </View>
                            )}

                            
                                <Text style={labelStyle}>{t("Tiempo de sesión (minutos)")}</Text>
                                <TextInput
                                    keyboardType="numeric"
                                    value={sessionTime}
                                    onChangeText={setSessionTime}
                                    style={[inputStyle, { width: 140 }]}
                                />
                                <Text style={descStyle}>
                                    {t("La sesión se cerrará automáticamente tras este tiempo de inactividad.")}
                                    {parseInt(sessionTime) > 120
                                        ? t(" ⚠ Sesiones largas aumentan el riesgo si el dispositivo queda desbloqueado.")
                                        : parseInt(sessionTime) <= 15
                                        ? t(" Sesión muy corta — el usuario deberá iniciar sesión con frecuencia.")
                                        : t(" Tiempo razonable para uso normal en aula.")}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* ══ APARIENCIA ════════════════════════════════════════ */}
                    {section === "appearance" && (
                        <View style={{ gap: 20 }}>
                            <Text style={sectionTitle}>{t("Apariencia")}</Text>

                            {/* Modo de visualización */}
                            <View style={{ gap: 8 }}>
                                <Text style={labelStyle}>{t("Modo de visualización")}</Text>
                                <Text style={descStyle}>
                                    {t("Elige el tema base de la interfaz. Afecta fondos, textos y superficies de toda la app.")}
                                </Text>
                                <ModeSelector />
                            </View>

                            <Divider />

                            {/* Color de acento */}
                            <View style={{ gap: 10 }}>
                                
                                    <Text style={labelStyle}>{t("Color de acento")}</Text>
                                    <Text style={descStyle}>
                                        {t("Este color se aplica a botones principales, tabs activos, barras de progreso, bordes de foco y todos los elementos interactivos. Los cambios se previsualizan abajo — presiona \"Guardar cambios\" para aplicarlos en toda la app.")}
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
                                <Text style={labelStyle}>{t("Vista previa en vivo")}</Text>
                                <ThemePreview previewTheme={previewTheme} />
                            </View>

                            {/* Banner informativo */}
                            <View style={{
                                flexDirection: "row", alignItems: "center", gap,
                                backgroundColor: c.brand.primaryLight,
                                borderRadius: 14, padding,
                            }}>
                                <Feather name="info" size={13} color={c.brand.primary} />
                                <Text style={{ fontSize: 11, color: c.brand.primary, flex, lineHeight: 18 }}>
                                    {t("La preview muestra cómo se verá el color en botones, badges y elementos activos. Presiona \"Guardar cambios\" para aplicarlo en toda la app.")}
                                </Text>
                            </View>
                        </View>
                    )}

                </Card>
            </View>
        </ScrollView>
    );
}
