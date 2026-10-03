// ============================================================
//  AppearanceSettingsScreen
//
//  Pantalla de apariencia: modo claro/oscuro + color de acento.
//  Replica la funcionalidad de ModeBlock + AccentBlock de la web.
//  Todos los textos pasan por t() — soporta es/en/fr/pt.
// ============================================================
import React, {useState} from 'react';
import {
    KeyboardAvoidingView,
    PanResponder,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../components/common/ThemeContext';
import ScrollViewWrapper from '../components/common/ScrollView';
import PrimaryButton from '../components/auth/PrimaryButton';
import {useAppearanceSettingsViewModel} from '../../viewmodels/useAppearanceSettingsViewModel';
import styles from './Styles/LanguageSettingsScreen/Style';

// ─────────────────────────────────────────────────────────────
//  Sub-componente: barra de presets de color
// ─────────────────────────────────────────────────────────────
function ColorPresetBar({presets, currentHex, onSelect, colors}) {
    return (
        <View style={{gap: 6}}>
            <View style={{
                flexDirection: 'row',
                height: 38,
                borderRadius: 14,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: colors.border,
            }}>
                {presets.map((preset, idx) => {
                    const active = currentHex.toLowerCase() === preset.color.toLowerCase();
                    return (
                        <TouchableOpacity
                            key={preset.key}
                            onPress={() => onSelect(preset)}
                            activeOpacity={0.75}
                            style={{
                                flex: 1,
                                backgroundColor: preset.color,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRightWidth: idx === presets.length - 1 ? 0 : 1,
                                borderRightColor: 'rgba(255,255,255,0.25)',
                            }}
                        >
                            {active && (
                                <View style={{
                                    backgroundColor: 'rgba(255,255,255,0.35)',
                                    borderRadius: 20,
                                    width: 24, height: 24,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Text style={{color: '#fff', fontSize: 14, fontWeight: 'bold'}}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Etiquetas */}
            <View style={{flexDirection: 'row'}}>
                {presets.map((preset) => {
                    const active = currentHex.toLowerCase() === preset.color.toLowerCase();
                    return (
                        <View key={preset.key} style={{flex: 1, alignItems: 'center'}}>
                            <Text style={{
                                fontSize: 10,
                                fontWeight: active ? '700' : '400',
                                color: active ? colors.primary : colors.textSecondary,
                            }}>
                                {preset.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
//  Sub-componente: slider HSL nativo (sin dependencias externas)
// ─────────────────────────────────────────────────────────────
function HSLSliderRow({label, value, min, max, step = 1, onValueChange, trackColor, colors}) {
    const [barWidth, setBarWidth] = React.useState(1);
    const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const x   = evt.nativeEvent.locationX;
                const raw = Math.round((x / barWidth) * (max - min) / step) * step + min;
                onValueChange(Math.max(min, Math.min(max, raw)));
            },
            onPanResponderMove: (evt) => {
                const x   = evt.nativeEvent.locationX;
                const raw = Math.round((x / barWidth) * (max - min) / step) * step + min;
                onValueChange(Math.max(min, Math.min(max, raw)));
            },
        })
    ).current;

    return (
        <View style={{gap: 4}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontSize: 13, color: colors.textSecondary}}>{label}</Text>
                <Text style={{fontSize: 13, fontWeight: '600', color: colors.text}}>{value}</Text>
            </View>
            <View
                style={{height: 36, justifyContent: 'center'}}
                onLayout={(e) => setBarWidth(e.nativeEvent.layout.width || 1)}
                {...panResponder.panHandlers}
            >
                <View style={{height: 6, borderRadius: 3, backgroundColor: colors.border}}>
                    <View style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: `${pct * 100}%`,
                        backgroundColor: trackColor,
                        borderRadius: 3,
                    }} />
                    <View style={{
                        position: 'absolute', top: -7,
                        left: `${pct * 100}%`, marginLeft: -10,
                        width: 20, height: 20, borderRadius: 10,
                        backgroundColor: trackColor,
                        borderWidth: 2, borderColor: '#fff',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 1},
                        shadowOpacity: 0.25, shadowRadius: 3,
                        elevation: 3,
                    }} />
                </View>
            </View>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
//  Sub-componente: tarjeta de evaluación del color
// ─────────────────────────────────────────────────────────────
function ColorEvaluatorCard({verdict, colors}) {
    if (!verdict) return null;
    return (
        <View style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 8,
        }}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <View style={{
                    width: 10, height: 10,
                    borderRadius: 5,
                    backgroundColor: verdict.scoreColor,
                }} />
                <Text style={{fontSize: 13, fontWeight: '700', color: verdict.scoreColor, textTransform: 'capitalize'}}>
                    {verdict.score}
                </Text>
                <Text style={{fontSize: 12, color: colors.textSecondary, marginLeft: 'auto'}}>
                    WCAG {verdict.wcagLevel}  ·  {verdict.contrastRatio}:1
                </Text>
            </View>

            {[
                {icon: '👁️', text: verdict.readability},
                {icon: '🎨', text: verdict.vibe},
                {icon: '📐', text: verdict.uiFit},
                {icon: '💡', text: verdict.tip},
            ].map(({icon, text}, i) => (
                <View key={i} style={{flexDirection: 'row', gap: 8, alignItems: 'flex-start'}}>
                    <Text style={{fontSize: 13}}>{icon}</Text>
                    <Text style={{fontSize: 12, color: colors.textSecondary, flex: 1, lineHeight: 18}}>
                        {text}
                    </Text>
                </View>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
//  Pantalla principal
// ─────────────────────────────────────────────────────────────
export default function AppearanceSettingsScreen() {
    const {t}      = useTranslation();
    const {colors} = useTheme();

    const {
        selectedTheme, setSelectedTheme, themes,
        visionMode, setVisionMode,
        hue, sat, lum, currentHex,
        applyHSL, applyPreset, handleHexInput,
        verdict,
        VISION_MODES, VISION_PRESETS, VISION_DESCRIPTIONS,
        isLoading, alertData, clearAlert,
        handleSave, handleBack,
    } = useAppearanceSettingsViewModel();

    const [hexInputValue, setHexInputValue] = useState(currentHex);

    React.useEffect(() => {
        setHexInputValue(currentHex);
    }, [currentHex]);

    // Mapa de labels para modos de visión (usando las claves de traducción)
    const visionLabels = {
        normal:        t('settings.visionModeNormal'),
        deuteranopia:  t('settings.visionModeDeuteranopia'),
        protanopia:    t('settings.visionModeProtanopia'),
        tritanopia:    t('settings.visionModeTritanopia'),
        achromatopsia: t('settings.visionModeAchromatopsia'),
    };

    const sectionTitleStyle = [styles.languageSettingsTitle, {color: colors.text, marginTop: 28, fontSize: 20}];
    const sectionSubStyle   = [styles.languageSettingsSubtitle, {color: colors.textSecondary, marginBottom: 16, fontSize: 14}];
    const labelStyle        = {fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 4};

    // Traduce el mensaje de alerta (la clave viene del viewmodel)
    const alertMessage = alertData.message ? t(alertData.message) : null;

    return (
        <SafeAreaView style={[styles.languageSettingsSafeArea, {backgroundColor: colors.background}]}>
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollViewWrapper>
                    <View style={{marginHorizontal: 20}}>

                        {/* ══════════════════════════════════════════ */}
                        {/* SECCIÓN 1 — MODO DE VISUALIZACIÓN          */}
                        {/* ══════════════════════════════════════════ */}
                        <Text style={[sectionTitleStyle, {marginTop: 30}]}>
                            {t('settings.displayMode')}
                        </Text>
                        <Text style={sectionSubStyle}>
                            {t('settings.displayModeDesc')}
                        </Text>

                        {themes.map((th) => (
                            <TouchableOpacity
                                key={th.code}
                                style={[
                                    styles.languageSettingsOption,
                                    {backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1},
                                    selectedTheme === th.code && {
                                        borderColor: colors.primary,
                                        backgroundColor: colors.primary + '20',
                                    },
                                ]}
                                onPress={() => setSelectedTheme(th.code)}
                            >
                                <Text style={[styles.languageSettingsOptionText, {color: colors.text}]}>
                                    {th.icon}  {t(th.label)}
                                </Text>
                                {selectedTheme === th.code && (
                                    <Text style={[styles.languageSettingsCheckmark, {color: colors.primary}]}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}

                        {/* ══════════════════════════════════════════ */}
                        {/* SECCIÓN 2 — COLOR DE ACENTO                */}
                        {/* ══════════════════════════════════════════ */}
                        <Text style={sectionTitleStyle}>
                            {t('settings.accentColor')}
                        </Text>
                        <Text style={sectionSubStyle}>
                            {t('settings.accentColorDesc')}
                        </Text>

                        {/* ── Preview del color actual ────────────── */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center',
                            gap: 12, marginBottom: 16,
                        }}>
                            <View style={{
                                width: 52, height: 52, borderRadius: 26,
                                backgroundColor: currentHex,
                                borderWidth: 3, borderColor: colors.border,
                                shadowColor: currentHex,
                                shadowOffset: {width: 0, height: 3},
                                shadowOpacity: 0.4, shadowRadius: 8,
                                elevation: 6,
                            }} />
                            <View style={{flex: 1}}>
                                <Text style={{fontSize: 16, fontWeight: '700', color: colors.text}}>
                                    {currentHex.toUpperCase()}
                                </Text>
                                <Text style={{fontSize: 12, color: colors.textSecondary}}>
                                    HSL({hue}, {sat}%, {lum}%)
                                </Text>
                            </View>
                            <View style={{
                                backgroundColor: currentHex,
                                paddingHorizontal: 14, paddingVertical: 8,
                                borderRadius: 10,
                            }}>
                                <Text style={{color: '#fff', fontSize: 12, fontWeight: '600'}}>
                                    {t('settings.colorPreview')}
                                </Text>
                            </View>
                        </View>

                        {/* ── Tabs de modo de visión ───────────────── */}
                        <Text style={[labelStyle, {marginBottom: 6}]}>
                            {t('settings.visionMode')}
                        </Text>
                        <View style={{
                            flexDirection: 'row', flexWrap: 'wrap', gap: 6,
                            backgroundColor: colors.card,
                            borderRadius: 14, padding: 8,
                            borderWidth: 1, borderColor: colors.border,
                            marginBottom: 8,
                        }}>
                            {VISION_MODES.map((vm) => {
                                const active = visionMode === vm;
                                return (
                                    <TouchableOpacity
                                        key={vm}
                                        onPress={() => setVisionMode(vm)}
                                        style={{
                                            paddingVertical: 7, paddingHorizontal: 12,
                                            borderRadius: 10,
                                            backgroundColor: active ? colors.primary : 'transparent',
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 11,
                                            fontWeight: active ? '700' : '400',
                                            color: active ? '#fff' : colors.textSecondary,
                                        }}>
                                            {visionLabels[vm]}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Descripción del modo de visión */}
                        <Text style={{
                            fontSize: 12, color: colors.textSecondary,
                            lineHeight: 18, marginBottom: 16,
                        }}>
                            {VISION_DESCRIPTIONS[visionMode]}
                        </Text>

                        {/* ── Selector de presets ──────────────────── */}
                        <Text style={[labelStyle, {marginBottom: 8}]}>
                            {t('settings.colorPalette')}
                        </Text>
                        <ColorPresetBar
                            presets={VISION_PRESETS[visionMode]}
                            currentHex={currentHex}
                            onSelect={applyPreset}
                            colors={colors}
                        />

                        <View style={{height: 20}} />

                        {/* ── Sliders HSL ──────────────────────────── */}
                        <Text style={[labelStyle, {marginBottom: 10}]}>
                            {t('settings.fineAdjust')}
                        </Text>
                        <View style={{
                            backgroundColor: colors.card, borderRadius: 14,
                            padding: 16, borderWidth: 1, borderColor: colors.border,
                            gap: 14, marginBottom: 16,
                        }}>
                            <HSLSliderRow
                                label={t('settings.hue')}
                                value={hue} min={0} max={360}
                                onValueChange={(v) => applyHSL(v, sat, lum)}
                                trackColor={currentHex} colors={colors}
                            />
                            <HSLSliderRow
                                label={t('settings.saturation')}
                                value={sat} min={0} max={100}
                                onValueChange={(v) => applyHSL(hue, v, lum)}
                                trackColor={currentHex} colors={colors}
                            />
                            <HSLSliderRow
                                label={t('settings.luminosity')}
                                value={lum} min={0} max={100}
                                onValueChange={(v) => applyHSL(hue, sat, v)}
                                trackColor={currentHex} colors={colors}
                            />
                        </View>

                        {/* ── Input HEX manual ─────────────────────── */}
                        <Text style={[labelStyle, {marginBottom: 6}]}>
                            {t('settings.hexCode')}
                        </Text>
                        <View style={{
                            flexDirection: 'row', alignItems: 'center',
                            gap: 10, marginBottom: 16,
                        }}>
                            <View style={{
                                width: 36, height: 36, borderRadius: 8,
                                backgroundColor: (/^#[0-9A-Fa-f]{6}$/.test(hexInputValue)
                                    ? hexInputValue : colors.border),
                                borderWidth: 1, borderColor: colors.border,
                            }} />
                            <TextInput
                                value={hexInputValue}
                                onChangeText={(v) => {
                                    setHexInputValue(v);
                                    handleHexInput(v);
                                }}
                                placeholder="#1392ED"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="characters"
                                maxLength={7}
                                style={{
                                    flex: 1, borderWidth: 1,
                                    borderColor: colors.border, borderRadius: 10,
                                    paddingHorizontal: 14, paddingVertical: 10,
                                    fontSize: 14, fontFamily: 'monospace',
                                    color: colors.text, backgroundColor: colors.card,
                                }}
                            />
                        </View>

                        {/* ── Evaluador de color ───────────────────── */}
                        <Text style={[labelStyle, {marginBottom: 8}]}>
                            {t('settings.colorEvaluation')}
                        </Text>
                        <ColorEvaluatorCard verdict={verdict} colors={colors} />

                        {/* ── Info ─────────────────────────────────── */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'flex-start',
                            gap: 8,
                            backgroundColor: colors.primary + '18',
                            borderRadius: 12, padding: 12,
                            marginTop: 16, marginBottom: 8,
                        }}>
                            <Text style={{fontSize: 14}}>ℹ️</Text>
                            <Text style={{
                                fontSize: 12, color: colors.primary,
                                flex: 1, lineHeight: 18,
                            }}>
                                {t('settings.accentInfoMsg')}
                            </Text>
                        </View>

                        {/* ══════════════════════════════════════════ */}
                        {/* ALERTA / FEEDBACK                          */}
                        {/* ══════════════════════════════════════════ */}
                        {alertMessage && (
                            <TouchableOpacity
                                onPress={clearAlert}
                                activeOpacity={0.85}
                                style={{
                                    backgroundColor: alertData.type === 'success'
                                        ? '#10B981' + '20' : '#EF4444' + '20',
                                    borderRadius: 10, padding: 12, marginTop: 8,
                                    borderWidth: 1,
                                    borderColor: alertData.type === 'success' ? '#10B981' : '#EF4444',
                                }}
                            >
                                <Text style={{
                                    fontSize: 13, textAlign: 'center',
                                    color: alertData.type === 'success' ? '#10B981' : '#EF4444',
                                }}>
                                    {alertData.type === 'success' ? '✅  ' : '❌  '}{alertMessage}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* ══════════════════════════════════════════ */}
                        {/* BOTONES                                    */}
                        {/* ══════════════════════════════════════════ */}
                        <View style={{marginTop: 24}}>
                            <PrimaryButton
                                title={t('common.save')}
                                onPress={handleSave}
                                isLoading={isLoading}
                            />
                            <TouchableOpacity
                                onPress={handleBack}
                                style={styles.secondaryButton}
                            >
                                <Text style={[styles.secondaryButtonText, {color: colors.textSecondary}]}>
                                    {t('common.back')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollViewWrapper>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
