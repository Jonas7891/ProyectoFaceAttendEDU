// ============================================================
//  ColorPickerPanel — Panel selector de color cromático completo
//  Replica la interfaz de Figma/herramientas de diseño:
//  - Input HEX arriba con preview + Evaluador de contraste a la derecha
//  - Panel 2D (Saturación X, Luminosidad Y)
//  - Slider de Matiz (Hue) arcoíris
//  - Slider de Luminosidad con valor numérico
//  - Barra de contraste debajo del evaluador
// ============================================================
import React, { useState } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";
import { hslToHex, hexToHsl } from "../../../../core/utils/colorUtils";
import { ColorEvaluator } from "./ColorEvaluator";

export function ColorPickerPanel({ hue, sat, lum, currentHex, onColorChange, verdict }) {
    const { theme } = useTheme();
    const c = theme.colors;
    const { t } = useTranslation();

    const PANEL_WIDTH = 280;
    const PANEL_HEIGHT = 200;

    const [hexInput, setHexInput] = useState(currentHex);
    const [panelLayout, setPanelLayout] = useState(null);

    function handleHexChange(text) {
        setHexInput(text);
        
        // Validar y aplicar si es hex válido
        const hex = text.startsWith('#') ? text : `#${text}`;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            const [h, s, l] = hexToHsl(hex);
            onColorChange(h, s, l);
        }
    }

    // Actualizar input cuando cambia el color
    React.useEffect(() => {
        setHexInput(currentHex);
    }, [currentHex]);

    // Handler para el panel 2D
    function handlePanelPress(evt) {
        if (!panelLayout) return;
        
        const { locationX, locationY } = evt.nativeEvent;
        const newSat = Math.max(0, Math.min(100, (locationX / panelLayout.width) * 100));
        const newLum = Math.max(0, Math.min(100, 100 - (locationY / panelLayout.height) * 100));
        
        onColorChange(hue, newSat, newLum);
    }

    return (
        <View style={{ gap: 8 }}>
            {/* Fila superior: Input HEX + Evaluador */}
            <View style={{ flexDirection: "row", gap: 8 }}>
                {/* Columna izquierda: Input HEX + Picker */}
                <View style={{ gap: 8 }}>
                    {/* Input HEX */}
                    <View style={{ width: PANEL_WIDTH }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                        }}>
                            {/* Preview del color */}
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                backgroundColor: currentHex,
                                borderWidth: 2,
                                borderColor: c.border.default,
                            }} />

                            {/* Input HEX con etiqueta interna */}
                            <View style={{
                                flex: 1,
                                height: 40,
                                backgroundColor: c.background.secondary,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: c.border.default,
                                flexDirection: "row",
                                alignItems: "center",
                                paddingHorizontal: 12,
                                gap: 8,
                            }}>
                                <TextInput
                                    value={hexInput}
                                    onChangeText={handleHexChange}
                                    placeholder="#286FE2"
                                    placeholderTextColor={c.text.tertiary}
                                    style={{
                                        flex: 1,
                                        fontSize: 14,
                                        color: c.text.primary,
                                        padding: 0,
                                        margin: 0,
                                    }}
                                />
                                <Text style={{
                                    fontSize: 11,
                                    fontWeight: "600",
                                    color: c.text.tertiary,
                                    textTransform: "uppercase",
                                }}>
                                    HEX
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Panel 2D - Saturación (X) y Luminosidad (Y) */}
                    <View 
                        style={{
                            width: PANEL_WIDTH,
                            height: PANEL_HEIGHT,
                            borderRadius: 12,
                            position: "relative",
                            overflow: "hidden",
                            backgroundColor: hslToHex(hue, 100, 50),
                        }}
                        onLayout={(e) => setPanelLayout(e.nativeEvent.layout)}
                        onStartShouldSetResponder={() => true}
                        onResponderGrant={handlePanelPress}
                        onResponderMove={handlePanelPress}
                    >
                        {/* Gradiente horizontal: blanco a transparente (Saturación) */}
                        <LinearGradient
                            colors={['white', 'transparent']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                            pointerEvents="none"
                        />
                        
                        {/* Gradiente vertical: transparente a negro (Luminosidad) */}
                        <LinearGradient
                            colors={['transparent', 'black']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={StyleSheet.absoluteFill}
                            pointerEvents="none"
                        />

                        {/* Indicador de posición (círculo blanco con borde) */}
                        <View 
                            style={{
                                position: "absolute",
                                left: (sat / 100) * PANEL_WIDTH - 10,
                                top: ((100 - lum) / 100) * PANEL_HEIGHT - 10,
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                borderWidth: 2,
                                borderColor: "white",
                                backgroundColor: "transparent",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.6,
                                shadowRadius: 5,
                                elevation: 8,
                            }}
                            pointerEvents="none"
                        />
                    </View>

                    {/* Slider de Matiz (Hue) - Arcoíris */}
                    <View style={{ position: "relative", height: 24, width: PANEL_WIDTH }}>
                        <View 
                            style={{
                                width: PANEL_WIDTH,
                                height: 18,
                                borderRadius: 12,
                                overflow: "hidden",
                                position: "absolute",
                            }}
                            pointerEvents="none"
                        >
                            <LinearGradient
                                colors={[
                                    '#FF0000', // 0° Rojo
                                    '#FFFF00', // 60° Amarillo
                                    '#00FF00', // 120° Verde
                                    '#00FFFF', // 180° Cian
                                    '#0000FF', // 240° Azul
                                    '#FF00FF', // 300° Magenta
                                    '#FF0000', // 360° Rojo
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </View>

                        <Slider
                            style={{ 
                                width: PANEL_WIDTH, 
                                height: 40,
                                marginTop: -12,
                            }}
                            minimumValue={0}
                            maximumValue={360}
                            value={hue}
                            onValueChange={(value) => onColorChange(value, sat, lum)}
                            minimumTrackTintColor="transparent"
                            maximumTrackTintColor="transparent"
                            thumbStyle={{
                                width: 15,
                                height: 15,
                                borderRadius: 10,
                                backgroundColor: hslToHex(hue, 100, 50),
                                borderWidth: 2,
                                borderColor: "white",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.6,
                                shadowRadius: 5,
                                elevation: 8,
                            }}
                        />
                    </View>

                    {/* Slider de Luminosidad con valor numérico */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, width: PANEL_WIDTH }}>
                        <View style={{ flex: 1, position: "relative", height: 24 }}>
                            <View 
                                style={{
                                    width: "100%",
                                    height: 10,
                                    borderRadius: 10,
                                    overflow: "hidden",
                                    position: "absolute",
                                }}
                                pointerEvents="none"
                            >
                                <LinearGradient
                                    colors={['#000000', '#808080', '#FFFFFF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={StyleSheet.absoluteFill}
                                />
                            </View>

                            <Slider
                                style={{ 
                                    width: "100%", 
                                    height: 10,
                                    marginTop: 0,
                                }}
                                minimumValue={0}
                                maximumValue={100}
                                value={lum}
                                onValueChange={(value) => onColorChange(hue, sat, value)}
                                minimumTrackTintColor="transparent"
                                maximumTrackTintColor="transparent"
                                thumbStyle={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 12,
                                    backgroundColor: hslToHex(0, 0, lum),
                                    borderWidth: 2,
                                    borderColor: "white",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.6,
                                    shadowRadius: 5,
                                    elevation: 8,
                                }}
                            />
                        </View>

                        {/* Valor numérico de luminosidad */}
                        <Text style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: c.text.secondary,
                            minWidth: 35,
                            textAlign: "right",
                        }}>
                            {Math.round(lum)}
                        </Text>
                    </View>
                </View>

                {/* Columna derecha: Evaluador + Alerta */}
                {verdict && (
                    <View style={{ flex: 1, minWidth: 300, gap: 8 }}>
                        <ColorEvaluator currentHex={currentHex} verdict={verdict} />
                        
                        {/* Alerta informativa */}
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            backgroundColor: c.brand.primaryLight,
                            borderRadius: 14,
                            padding: 12,
                        }}>
                            <Feather name="info" size={13} color={c.brand.primary} />
                            <Text style={{ fontSize: 11, color: c.brand.primary, flex: 1, lineHeight: 18 }}>
                                {t("La preview muestra como se verá el color en botones, badges y elementos activos. Presiona \"Guardar cambios\" para aplicarlo en toda la aplicación.")}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}
