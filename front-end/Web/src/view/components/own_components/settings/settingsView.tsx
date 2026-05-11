import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import Slider from "@react-native-community/slider";
import { Feather } from "@expo/vector-icons";
import { Card, PageHeader, UIButton, ToggleRow, Divider } from "../ui/UI";
import Colors from "../../constants/colors";
import { useResponsive } from "../../hooks/useResponsive";

const SECTIONS: { id: string; label: string; icon: any }[] = [
    { id: "general",       label: "General",         icon: "globe"       },
    { id: "facial",        label: "Reconocimiento",  icon: "aperture"    },
    { id: "notifications", label: "Notificaciones",  icon: "bell"        },
    { id: "security",      label: "Seguridad",       icon: "shield"      },
    { id: "appearance",    label: "Apariencia",      icon: "sliders"     },
];

const labelStyle: any = { fontSize: 13, fontWeight: "500", color: Colors.text, marginBottom: 6 };
const descStyle:  any = { fontSize: 12, color: Colors.muted, marginTop: 4 };

export default function SettingsView() {
    const { isSmall } = useResponsive();
    const [section, setSection] = useState("general");

    const [institutionName, setInstitutionName] = useState("Universidad Nacional");
    const [minAttendance, setMinAttendance]     = useState(80);
    const [semester, setSemester]               = useState("2024-2");

    const [confidence, setConfidence]           = useState(85);
    const [autoRegister, setAutoRegister]       = useState(true);
    const [savePhotos, setSavePhotos]           = useState(false);

    const [emailAlert, setEmailAlert]           = useState(true);
    const [weeklyReport, setWeeklyReport]       = useState(true);
    const [atRiskAlert, setAtRiskAlert]         = useState(true);
    const [dailySummary, setDailySummary]       = useState(false);

    const [twoFactor, setTwoFactor]             = useState(false);

    const [saved, setSaved] = useState(false);
    function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

    const inputStyle: any = {
        height: 38, borderWidth: 1, borderColor: Colors.border,
        borderRadius: 6, paddingHorizontal: 12, fontSize: 13, color: Colors.text,
        backgroundColor: Colors.surface,
    };

    return (
        <ScrollView contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }} showsVerticalScrollIndicator={false}>
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
                {/* Nav lateral de secciones */}
                <Card padding={8} style={isSmall ? undefined : { width: 200, alignSelf: "flex-start" }}>
                    {/* En móvil, mostrar horizontal */}
                    {isSmall ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={{ flexDirection: "row", gap: 4 }}>
                                {SECTIONS.map(s => (
                                    <TouchableOpacity
                                        key={s.id}
                                        onPress={() => setSection(s.id)}
                                        style={{
                                            flexDirection: "row", alignItems: "center", gap: 8,
                                            padding: 9, paddingHorizontal: 12, borderRadius: 6,
                                            backgroundColor: section === s.id ? Colors.primaryLight : "transparent",
                                        }}
                                    >
                                        <Feather name={s.icon} size={14} color={section === s.id ? Colors.primary : Colors.muted} />
                                        <Text style={{ fontSize: 12, fontWeight: section === s.id ? "600" : "400", color: section === s.id ? Colors.primary : Colors.muted }}>
                                            {s.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    ) : (
                        <View style={{ gap: 2 }}>
                            {SECTIONS.map(s => (
                                <TouchableOpacity
                                    key={s.id}
                                    onPress={() => setSection(s.id)}
                                    style={{
                                        flexDirection: "row", alignItems: "center", gap: 10,
                                        padding: 9, paddingHorizontal: 12, borderRadius: 6,
                                        backgroundColor: section === s.id ? Colors.primaryLight : "transparent",
                                    }}
                                >
                                    <Feather name={s.icon} size={15} color={section === s.id ? Colors.primary : Colors.muted} />
                                    <Text style={{ fontSize: 13, fontWeight: section === s.id ? "600" : "400", color: section === s.id ? Colors.primary : Colors.muted }}>
                                        {s.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </Card>

                {/* Contenido de la sección */}
                <Card style={{ flex: 1 }}>

                    {/* General */}
                    {section === "general" && (
                        <View style={{ gap: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 4 }}>Configuración general</Text>
                            <View>
                                <Text style={labelStyle}>Nombre de la institución</Text>
                                <TextInput value={institutionName} onChangeText={setInstitutionName} style={inputStyle} />
                            </View>
                            <View>
                                <Text style={labelStyle}>Semestre activo</Text>
                                <TextInput value={semester} onChangeText={setSemester} placeholder="Ej: 2024-2" style={inputStyle} placeholderTextColor={Colors.muted} />
                            </View>
                            <View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                    <Text style={labelStyle}>Asistencia mínima requerida (%)</Text>
                                    <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.primary }}>{minAttendance}%</Text>
                                </View>
                                <Slider
                                    minimumValue={50} maximumValue={100} step={5}
                                    value={minAttendance} onValueChange={setMinAttendance}
                                    minimumTrackTintColor={Colors.primary}
                                    maximumTrackTintColor={Colors.border}
                                />
                                <Text style={descStyle}>Estudiantes por debajo de este valor serán marcados como "en riesgo"</Text>
                            </View>
                        </View>
                    )}

                    {/* Facial */}
                    {section === "facial" && (
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 20 }}>Reconocimiento facial</Text>
                            <View style={{ marginBottom: 20 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                    <Text style={labelStyle}>Umbral de confianza ({confidence}%)</Text>
                                </View>
                                <Slider
                                    minimumValue={60} maximumValue={99} step={1}
                                    value={confidence} onValueChange={setConfidence}
                                    minimumTrackTintColor={Colors.primary}
                                    maximumTrackTintColor={Colors.border}
                                />
                                <Text style={descStyle}>Mayor valor = más estricto. Valores muy altos pueden generar falsos negativos.</Text>
                            </View>
                            <Divider style={{ marginBottom: 4 }} />
                            <ToggleRow label="Registro automático" description="Registra automáticamente al detectar el rostro" value={autoRegister} onToggle={() => setAutoRegister(v => !v)} />
                            <ToggleRow label="Guardar fotos de registro" description="Almacena la foto tomada al registrar asistencia" value={savePhotos} onToggle={() => setSavePhotos(v => !v)} />
                        </View>
                    )}

                    {/* Notifications */}
                    {section === "notifications" && (
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 16 }}>Notificaciones</Text>
                            <Divider />
                            <ToggleRow label="Alertas por correo" description="Envía correos cuando un estudiante falta" value={emailAlert} onToggle={() => setEmailAlert(v => !v)} />
                            <ToggleRow label="Reporte semanal" description="Resumen automático de asistencia cada lunes" value={weeklyReport} onToggle={() => setWeeklyReport(v => !v)} />
                            <ToggleRow label="Alerta de estudiantes en riesgo" description="Notifica cuando un estudiante cae por debajo del mínimo" value={atRiskAlert} onToggle={() => setAtRiskAlert(v => !v)} />
                            <ToggleRow label="Resumen diario" description="Resumen de asistencia al finalizar el día" value={dailySummary} onToggle={() => setDailySummary(v => !v)} />
                        </View>
                    )}

                    {/* Security */}
                    {section === "security" && (
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 16 }}>Seguridad</Text>
                            <Divider />
                            <ToggleRow label="Autenticación de dos factores" description="Requiere código adicional al iniciar sesión" value={twoFactor} onToggle={() => setTwoFactor(v => !v)} />
                            <View style={{ marginTop: 16 }}>
                                <Text style={labelStyle}>Tiempo de sesión (minutos)</Text>
                                <TextInput keyboardType="numeric" defaultValue="60" style={[inputStyle, { width: 120 }]} />
                                <Text style={descStyle}>La sesión se cerrará automáticamente después de este tiempo de inactividad.</Text>
                            </View>
                        </View>
                    )}

                    {/* Appearance */}
                    {section === "appearance" && (
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 20 }}>Apariencia</Text>
                            <View style={{ padding: 16, backgroundColor: Colors.bg, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed" }}>
                                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                                    <Feather name="info" size={14} color={Colors.muted} style={{ marginTop: 1 }} />
                                    <Text style={{ fontSize: 12, color: Colors.muted, flex: 1 }}>
                                        Para personalizar los colores de la app, edita el archivo{"\n"}
                                        <Text style={{ fontFamily: "monospace" }}>src/view/components/constants/colors.ts</Text>
                                    </Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
                                {[
                                    { label: "Color primario",  color: Colors.primary },
                                    { label: "Fondo",           color: Colors.bg      },
                                    { label: "Superficie",      color: Colors.surface },
                                    { label: "Éxito",           color: "#10B981"      },
                                    { label: "Advertencia",     color: "#F59E0B"      },
                                    { label: "Peligro",         color: "#EF4444"      },
                                ].map(({ label, color }) => (
                                    <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 10, width: "46%" }}>
                                        <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: color, borderWidth: 1, borderColor: Colors.border }} />
                                        <Text style={{ fontSize: 12, color: Colors.muted, flex: 1 }}>{label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </Card>
            </View>
        </ScrollView>
    );
}
