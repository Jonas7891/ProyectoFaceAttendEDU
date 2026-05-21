import React, { useState } from "react";
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
} from "react-native";
import Slider    from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { Card, PageHeader, UIButton, ToggleRow, Divider } from "../ui/UI";
import { useTheme }      from "../../hooks/useTheme";
import { useResponsive } from "../../hooks/useResponsive";
import {
    VISION_PRESETS, VISION_MODES, VISION_LABELS, VISION_DESCRIPTIONS,
    AccessibilityPreset, VisionMode, DEFAULT_VISION_MODE,
} from "../../theme/presets";

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

function contrastVsWhite(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const lin = (v: number) => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return (1.05) / (L + 0.05);
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
            borderRadius: 10,
            padding: 3,
            borderWidth: 1,
            borderColor: c.border.primary,
        }}>
            {(["light", "dark"] as const).map(m => {
                const active = mode === m;
                return (
                    <TouchableOpacity
                        key={m}
                        onPress={() => setMode(m)}
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
                            name={m === "light" ? "sun" : "moon"}
                            size={14}
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

// ── ThemePreview (compacta) ───────────────────────────────────

function ThemePreview() {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{
            borderWidth: 1, borderColor: c.border.primary,
            borderRadius: 10, overflow: "hidden",
        }}>
            <View style={{
                backgroundColor: c.background.surface,
                padding: 10, flexDirection: "row",
                alignItems: "center", gap: 8,
                borderBottomWidth: 1, borderBottomColor: c.border.primary,
            }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.brand.primary }} />
                <Text style={{ fontSize: 11, color: c.text.secondary }}>Vista previa en tiempo real</Text>
            </View>
            <View style={{ backgroundColor: c.background.app, padding: 12, gap: 8 }}>
                {/* Barra de progreso + badge */}
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
                    <View style={{
                        flex: 1, backgroundColor: "transparent", borderRadius: 6, padding: 7,
                        alignItems: "center", borderWidth: 1, borderColor: c.brand.primary,
                    }}>
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

function AccentColorSelector() {
    const { accentColor, setAccentColor, theme } = useTheme();
    const c = theme.colors;

    const [visionMode, setVisionMode] = useState<VisionMode>(DEFAULT_VISION_MODE);
    const [hue, setHue]               = useState(() => hexToHsl(accentColor)[0]);
    const [sat, setSat]               = useState(() => hexToHsl(accentColor)[1]);
    const [lum, setLum]               = useState(() => hexToHsl(accentColor)[2]);

    const currentHex = hslToHex(hue, sat, lum);
    const contrast   = contrastVsWhite(currentHex);
    const passesWCAG = contrast >= 4.5;

    function apply(h: number, s: number, l: number) {
        setHue(h); setSat(s); setLum(l);
        setAccentColor(hslToHex(h, s, l));
    }

    function applyPreset(p: AccessibilityPreset) {
        const [h, s, l] = hexToHsl(p.color);
        apply(h, s, l);
    }

    // Degradé estilo Word: 5 filas de saturación × 7 luminosidades
    const SAT_STOPS = [100, 80, 60, 40, 20];
    const LUM_STOPS = [20, 30, 40, 50, 60, 70, 80];

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
                            key={vm}
                            onPress={() => setVisionMode(vm)}
                            style={{
                                paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6,
                                backgroundColor: active ? c.brand.primary : "transparent",
                            }}
                        >
                            <Text style={{
                                fontSize: 11, fontWeight: active ? "600" : "400",
                                color: active ? "#fff" : c.text.secondary,
                            }}>
                                {vm === "normal" ? "Normal" :
                                    vm === "deuteranopia" ? "Deuteranopia" :
                                        vm === "protanopia"   ? "Protanopia"   :
                                            vm === "tritanopia"   ? "Tritanopia"   : "Acromatopsia"}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Descripción + strip de colores del modo */}
            <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 11, color: c.text.secondary, lineHeight: 16 }}>
                    {VISION_DESCRIPTIONS[visionMode]}
                </Text>
                {/* Strip de 5 colores del modo actual */}
                <View style={{ flexDirection: "row", height: 6, borderRadius: 99, overflow: "hidden" }}>
                    {VISION_PRESETS[visionMode].map(p => (
                        <View key={p.key} style={{ flex: 1, backgroundColor: p.color }} />
                    ))}
                </View>
            </View>

            {/* ── Presets: 5 círculos en línea ── */}
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                {VISION_PRESETS[visionMode].map(preset => {
                    const active = accentColor.toLowerCase() === preset.color.toLowerCase();
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
                                // sombra del color activo
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
                    { label: "Tono",       val: hue, min: 0,  max: 359, set: (v: number) => apply(v, sat, lum), suffix: "°" },
                    { label: "Saturación", val: sat, min: 0,  max: 100, set: (v: number) => apply(hue, v, lum), suffix: "%" },
                    { label: "Luminosidad",val: lum, min: 15, max: 85,  set: (v: number) => apply(hue, sat, v), suffix: "%" },
                ].map(sl => (
                    <View key={sl.label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Text style={{ fontSize: 12, color: c.text.secondary, width: 80 }}>{sl.label}</Text>
                        <View style={{ flex: 1 }}>
                            <Slider
                                minimumValue={sl.min} maximumValue={sl.max} step={1} value={sl.val}
                                onValueChange={sl.set}
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

            {/* ── Degradé tipo Word/Paint ── */}
            <View style={{ gap: 3 }}>
                {SAT_STOPS.map(s => (
                    <View key={s} style={{ flexDirection: "row", gap: 3 }}>
                        {LUM_STOPS.map(l => {
                            const hex    = hslToHex(hue, s, l);
                            const active = s === sat && l === lum;
                            return (
                                <TouchableOpacity
                                    key={l}
                                    onPress={() => apply(hue, s, l)}
                                    style={{
                                        flex: 1, height: 22, borderRadius: 4,
                                        backgroundColor: hex,
                                        borderWidth: active ? 2 : 0,
                                        borderColor: "#fff",
                                    }}
                                />
                            );
                        })}
                    </View>
                ))}
            </View>

            {/* ── Hex activo + contraste WCAG ── */}
            <View style={{
                flexDirection: "row", alignItems: "center", gap: 10,
                backgroundColor: c.background.app,
                borderRadius: 8, padding: 10,
                borderWidth: 1, borderColor: c.border.primary,
            }}>
                <View style={{
                    width: 36, height: 36, borderRadius: 8,
                    backgroundColor: currentHex,
                    borderWidth: 1, borderColor: c.border.secondary,
                }} />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: c.text.primary, fontFamily: "monospace" }}>
                        {currentHex.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 11, marginTop: 2, color: passesWCAG ? c.states.success : c.states.danger }}>
                        {passesWCAG ? "✓" : "✗"} {contrast.toFixed(1)}:1 vs blanco — WCAG AA {passesWCAG ? "pasa" : "no pasa"}
                    </Text>
                </View>
            </View>
        </View>
    );
}

// ── MAIN ─────────────────────────────────────────────────────

export default function SettingsView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;

    const [section, setSection] = useState("general");

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

    function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

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
                    <UIButton variant="primary" onPress={handleSave} size="sm">
                        {saved ? "¡Guardado!" : "Guardar cambios"}
                    </UIButton>
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

                            {/* Modo */}
                            <View style={{ gap: 8 }}>
                                <Text style={labelStyle}>Modo de visualización</Text>
                                <ModeSelector />
                            </View>

                            <Divider />

                            {/* Accent */}
                            <View style={{ gap: 10 }}>
                                <View>
                                    <Text style={labelStyle}>Color de acento</Text>
                                    <Text style={descStyle}>
                                        Afecta botones, tabs, bordes de foco y todos los elementos interactivos.
                                    </Text>
                                </View>
                                <AccentColorSelector />
                            </View>

                            <Divider />

                            {/* Preview */}
                            <ThemePreview />

                            {/* Info */}
                            <View style={{
                                flexDirection: "row", alignItems: "center", gap: 8,
                                backgroundColor: c.brand.primaryLight,
                                borderRadius: 8, padding: 10,
                            }}>
                                <Feather name="info" size={13} color={c.brand.primary} />
                                <Text style={{ fontSize: 12, color: c.brand.primary, flex: 1 }}>
                                    Las preferencias se guardan automáticamente y se aplican en toda la app.
                                </Text>
                            </View>
                        </View>
                    )}

                </Card>
            </View>
        </ScrollView>
    );
}