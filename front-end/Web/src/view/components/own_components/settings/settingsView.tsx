// ============================================================
//  FaceAttend EDU — Settings View (React Native)
// ============================================================
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Slider } from "react-native";
import { Card, PageHeader, UIButton, ToggleRow, Divider } from "../ui/UI";
import Colors from "../../constants/colors";

const SECTIONS = [
    { id: "general",       label: "General",       icon: "🌐" },
    { id: "facial",        label: "Reconocimiento", icon: "🎭" },
    { id: "notifications", label: "Notificaciones", icon: "🔔" },
    { id: "security",      label: "Seguridad",      icon: "🔒" },
    { id: "appearance",    label: "Apariencia",     icon: "🎨" },
];

export default function SettingsView() {
    const [section, setSection] = useState("general");

    // General
    const [institutionName, setInstitutionName] = useState("Universidad Nacional");
    const [minAttendance, setMinAttendance]     = useState(80);
    const [semester, setSemester]               = useState("2024-2");

    // Facial
    const [confidence, setConfidence]           = useState(85);
    const [autoRegister, setAutoRegister]       = useState(true);
    const [savePhotos, setSavePhotos]           = useState(false);

    // Notifications
    const [emailAlert, setEmailAlert]           = useState(true);
    const [weeklyReport, setWeeklyReport]       = useState(true);
    const [atRiskAlert, setAtRiskAlert]         = useState(true);
    const [dailySummary, setDailySummary]       = useState(false);

    // Security
    const [twoFactor, setTwoFactor]             = useState(false);

    const [saved, setSaved] = useState(false);
    function handleSave() {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} showsVerticalScrollIndicator={false}>
            <PageHeader
                title="Configuración"
                subtitle="Personaliza FaceAttend EDU a tu institución"
                actions={
                    <UIButton variant="primary" onPress={handleSave} size="sm">
                        {saved ? "✅ Guardado!" : "💾 Guardar"}
                    </UIButton>
                }
            />

            {/* Nav de secciones */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {SECTIONS.map(s => (
                        <TouchableOpacity
                            key={s.id}
                            onPress={() => setSection(s.id)}
                            style={{
                                flexDirection: "row", alignItems: "center", gap: 8,
                                paddingVertical: 10, paddingHorizontal: 16,
                                borderRadius: 8,
                                backgroundColor: section === s.id ? Colors.primaryLight : Colors.surface,
                                borderWidth: 1,
                                borderColor: section === s.id ? Colors.primary : Colors.border,
                            }}
                        >
                            <Text style={{ fontSize: 16 }}>{s.icon}</Text>
                            <Text style={{ fontSize: 13, fontWeight: "600", color: section === s.id ? Colors.primary : Colors.muted }}>
                                {s.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Sección General */}
            {section === "general" && (
                <Card>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 20 }}>Configuración general</Text>
                    <View style={{ gap: 16 }}>
                        <View>
                            <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.text, marginBottom: 6 }}>Nombre de la institución</Text>
                            <TextInput
                                value={institutionName}
                                onChangeText={setInstitutionName}
                                style={{ height: 38, borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 12, fontSize: 13, color: Colors.text }}
                            />
                        </View>
                        <View>
                            <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.text, marginBottom: 6 }}>Semestre activo</Text>
                            <TextInput
                                value={semester}
                                onChangeText={setSemester}
                                placeholder="Ej: 2024-2"
                                style={{ height: 38, borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 12, fontSize: 13, color: Colors.text }}
                                placeholderTextColor={Colors.muted}
                            />
                        </View>
                        <View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.text }}>Asistencia mínima requerida</Text>
                                <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.primary }}>{minAttendance}%</Text>
                            </View>
                            <Slider
                                minimumValue={50} maximumValue={100} step={5}
                                value={minAttendance}
                                onValueChange={setMinAttendance}
                                minimumTrackTintColor={Colors.primary}
                                maximumTrackTintColor={Colors.border}
                            />
                            <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 4 }}>
                                Estudiantes por debajo de este valor serán marcados "en riesgo"
                            </Text>
                        </View>
                    </View>
                </Card>
            )}

            {/* Sección Facial */}
            {section === "facial" && (
                <Card>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 20 }}>Reconocimiento facial</Text>
                    <View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                            <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.text }}>Umbral de confianza</Text>
                            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.primary }}>{confidence}%</Text>
                        </View>
                        <Slider
                            minimumValue={60} maximumValue={99} step={1}
                            value={confidence}
                            onValueChange={setConfidence}
                            minimumTrackTintColor={Colors.primary}
                            maximumTrackTintColor={Colors.border}
                        />
                        <Text style={{ fontSize: 12, color: Colors.muted, marginTop: 4, marginBottom: 16 }}>
                            Mayor valor = más estricto. Valores muy altos pueden generar falsos negativos.
                        </Text>
                        <Divider style={{ marginBottom: 4 }} />
                        <ToggleRow
                            label="Registro automático"
                            description="Registra asistencia automáticamente al detectar el rostro"
                            value={autoRegister}
                            onToggle={() => setAutoRegister(v => !v)}
                        />
                        <ToggleRow
                            label="Guardar fotos de registro"
                            description="Almacena la foto tomada al registrar asistencia"
                            value={savePhotos}
                            onToggle={() => setSavePhotos(v => !v)}
                        />
                    </View>
                </Card>
            )}

            {/* Sección Notificaciones */}
            {section === "notifications" && (
                <Card>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 16 }}>Notificaciones</Text>
                    <Divider />
                    <ToggleRow label="Alertas por correo" description="Envía correos cuando un estudiante falta" value={emailAlert} onToggle={() => setEmailAlert(v => !v)} />
                    <ToggleRow label="Reporte semanal" description="Resumen automático de asistencia cada lunes" value={weeklyReport} onToggle={() => setWeeklyReport(v => !v)} />
                    <ToggleRow label="Alerta en riesgo" description="Notifica cuando un estudiante cae por debajo del mínimo" value={atRiskAlert} onToggle={() => setAtRiskAlert(v => !v)} />
                    <ToggleRow label="Resumen diario" description="Resumen de asistencia al finalizar el día" value={dailySummary} onToggle={() => setDailySummary(v => !v)} />
                </Card>
            )}

            {/* Sección Seguridad */}
            {section === "security" && (
                <Card>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 16 }}>Seguridad</Text>
                    <Divider />
                    <ToggleRow
                        label="Autenticación de dos factores"
                        description="Requiere código adicional al iniciar sesión"
                        value={twoFactor}
                        onToggle={() => setTwoFactor(v => !v)}
                    />
                </Card>
            )}

            {/* Sección Apariencia */}
            {section === "appearance" && (
                <Card>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.text, marginBottom: 16 }}>Apariencia</Text>
                    <View style={{ padding: 16, backgroundColor: Colors.bg, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed" }}>
                        <Text style={{ fontSize: 12, color: Colors.muted }}>
                            💡 Para personalizar los colores de la aplicación, edita el archivo{"\n"}
                            <Text style={{ fontFamily: "monospace", backgroundColor: Colors.border }}>
                                src/view/components/constants/colors.ts
                            </Text>
                        </Text>
                    </View>
                    <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                        {[
                            { label: "Color primario",     color: Colors.primary      },
                            { label: "Color de fondo",     color: Colors.bg           },
                            { label: "Superficie",         color: Colors.surface      },
                            { label: "Color de éxito",     color: "#10B981"           },
                            { label: "Advertencia",        color: "#F59E0B"           },
                            { label: "Peligro",            color: "#EF4444"           },
                        ].map(({ label, color }) => (
                            <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 10, width: "46%" }}>
                                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: color, borderWidth: 1, borderColor: Colors.border }} />
                                <Text style={{ fontSize: 12, color: Colors.muted, flex: 1 }}>{label}</Text>
                            </View>
                        ))}
                    </View>
                </Card>
            )}
        </ScrollView>
    );
}
