// ============================================================
//  FaceAttend EDU — Login View (React Native)
//  Panel izquierdo de marca + formulario derecho (split-screen)
//  Misma paleta y tipografía que el resto del proyecto
// ============================================================
import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, Image, StyleSheet,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useResponsive }   from "../../hooks/useResponsive";
import { getTypography }   from "../../constants/typography";
import Colors from "../../constants/colors";
import Button from "../ui/button";

// ─── Feature list (panel izquierdo) ───────────────────────

const FEATURES = [
    {
        icon: "aperture" as const,
        title: "Reconocimiento facial en tiempo real",
        desc:  "Registra asistencia automáticamente con IA.",
    },
    {
        icon: "bar-chart-2" as const,
        title: "Reportes y estadísticas detalladas",
        desc:  "Analiza patrones de asistencia por curso.",
    },
    {
        icon: "users" as const,
        title: "Gestión completa de estudiantes",
        desc:  "Centraliza toda la información académica.",
    },
];

// ─── Campo de formulario ──────────────────────────────────

function Field({
    label, placeholder, value, onChangeText,
    secureTextEntry = false, icon, rightIcon, onRightIcon,
    error,
}: {
    label: string; placeholder: string;
    value: string; onChangeText: (v: string) => void;
    secureTextEntry?: boolean;
    icon?: any; rightIcon?: any; onRightIcon?: () => void;
    error?: string;
}) {
    const { fs, sp } = useResponsive();
    const [focused, setFocused] = useState(false);

    return (
        <View style={{ gap: sp(6) }}>
            <Text style={{
                fontSize: fs(13), fontWeight: "500", color: Colors.text,
            }}>{label}</Text>
            <View style={{
                flexDirection: "row", alignItems: "center",
                height: sp(44),
                borderWidth: 1.5,
                borderColor: error ? "#EF4444" : focused ? Colors.primary : Colors.border,
                borderRadius: sp(10),
                backgroundColor: Colors.bg,
                paddingHorizontal: sp(12), gap: sp(8),
            }}>
                {icon && <Feather name={icon} size={fs(15)} color={Colors.muted} />}
                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        flex: 1, fontSize: fs(14), color: Colors.text,
                        // @ts-ignore web-only
                        outlineStyle: "none",
                    }}
                    placeholderTextColor={Colors.muted}
                    autoCapitalize="none"
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIcon}>
                        <Feather name={rightIcon} size={fs(15)} color={Colors.muted} />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text style={{ fontSize: fs(11), color: "#EF4444" }}>{error}</Text>
            )}
        </View>
    );
}

// ─── MAIN ─────────────────────────────────────────────────

export default function LoginPage({ onLogin, onForgotPassword, onRegister }: {
    onLogin: (u: string, p: string) => void;
    onForgotPassword?: () => void;
    onRegister?: () => void;
}) {
    const { fs, sp, isSmall } = useResponsive();
    const T = getTypography(fs);

    const [usuario,    setUsuario]    = useState("");
    const [contrasena, setContrasena] = useState("");
    const [showPass,   setShowPass]   = useState(false);
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState("");

    function handleLogin() {
        if (!usuario || !contrasena) { setError("Completa todos los campos"); return; }
        setError("");
        setLoading(true);
        setTimeout(() => { setLoading(false); onLogin(usuario, contrasena); }, 900);
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
                <View style={{ flex: 1, flexDirection: isSmall ? "column" : "row" }}>

                    {/* ── Panel izquierdo de marca (solo desktop) ── */}
                    {!isSmall && (
                        <View style={{
                            flex: 1,
                            backgroundColor: Colors.primary,
                            justifyContent: "center",
                            alignItems: "center",
                            padding: sp(48),
                            overflow: "hidden",
                        }}>
                            {/* Círculos decorativos */}
                            <View style={{
                                position: "absolute", width: sp(340), height: sp(340),
                                borderRadius: sp(170), borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.10)",
                                top: -sp(90), left: -sp(90),
                            }} />
                            <View style={{
                                position: "absolute", width: sp(500), height: sp(500),
                                borderRadius: sp(250), borderWidth: 1,
                                borderColor: "rgba(255,255,255,0.06)",
                                bottom: -sp(130), right: -sp(130),
                            }} />

                            <View style={{ zIndex: 1, alignItems: "center", maxWidth: sp(380) }}>
                                <Image
                                    source={require("../../../../assets/images/logoFaceAttend-BlancoAzul.png")}
                                    style={{ width: sp(90), height: sp(90), marginBottom: sp(20) }}
                                    resizeMode="contain"
                                />
                                <Text style={[T.displayLG, { color: "#fff", textAlign: "center", marginBottom: sp(10) }]}>
                                    FaceAttend EDU
                                </Text>
                                <Text style={[T.bodyLG, { color: "rgba(255,255,255,0.75)", textAlign: "center", marginBottom: sp(36) }]}>
                                    Asistencia inteligente para tu institución
                                </Text>

                                {/* Feature list */}
                                <View style={{ gap: sp(16), width: "100%" }}>
                                    {FEATURES.map((f) => (
                                        <View key={f.title} style={{
                                            flexDirection: "row", gap: sp(12), alignItems: "flex-start",
                                        }}>
                                            <View style={{
                                                width: sp(8), height: sp(8), borderRadius: sp(4),
                                                backgroundColor: "rgba(255,255,255,0.6)",
                                                marginTop: sp(6), flexShrink: 0,
                                            }} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[T.buttonSM, { color: "#fff" }]}>{f.title}</Text>
                                                <Text style={[T.bodySM, { color: "rgba(255,255,255,0.65)", marginTop: sp(2) }]}>{f.desc}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* ── Panel derecho: formulario ── */}
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            padding: sp(isSmall ? 28 : 48),
                        }}
                        style={{ backgroundColor: Colors.surface }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{ width: "100%", maxWidth: sp(340) }}>

                            {/* Logo en móvil */}
                            {isSmall && (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: sp(10), marginBottom: sp(28) }}>
                                    <Image
                                        source={require("../../../../assets/images/logoFaceAttend-Minimalista.png")}
                                        style={{ width: sp(38), height: sp(38) }}
                                        resizeMode="contain"
                                    />
                                    <Text style={[T.brandName, { color: Colors.text }]}>
                                        FaceAttend <Text style={{ color: Colors.primary }}>EDU</Text>
                                    </Text>
                                </View>
                            )}

                            <Text style={[T.heading1, { color: Colors.text, marginBottom: sp(6) }]}>
                                Inicio de sesión
                            </Text>
                            <Text style={[T.bodyMD, { color: Colors.muted, marginBottom: sp(28) }]}>
                                Bienvenido de vuelta. Ingresa tus credenciales.
                            </Text>

                            <View style={{ gap: sp(16) }}>
                                <Field
                                    label="Correo electrónico"
                                    placeholder="correo@universidad.edu"
                                    value={usuario}
                                    onChangeText={setUsuario}
                                    icon="mail"
                                />
                                <Field
                                    label="Contraseña"
                                    placeholder="Tu contraseña"
                                    value={contrasena}
                                    onChangeText={setContrasena}
                                    secureTextEntry={!showPass}
                                    icon="lock"
                                    rightIcon={showPass ? "eye-off" : "eye"}
                                    onRightIcon={() => setShowPass(v => !v)}
                                />
                            </View>

                            {error !== "" && (
                                <View style={{
                                    marginTop: sp(12),
                                    backgroundColor: "#FEE2E2",
                                    borderRadius: sp(8), padding: sp(10),
                                }}>
                                    <Text style={{ fontSize: fs(12), color: "#DC2626" }}>{error}</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={onForgotPassword}
                                style={{ alignSelf: "flex-end", marginTop: sp(10) }}
                            >
                                <Text style={[T.bodySM, { color: Colors.primary }]}>
                                    ¿Olvidaste tu contraseña?
                                </Text>
                            </TouchableOpacity>

                            <View style={{ marginTop: sp(20) }}>
                                <Button
                                    label={loading ? "Ingresando…" : "Ingresar"}
                                    onPress={handleLogin}
                                />
                            </View>

                            <View style={{ flexDirection: "row", justifyContent: "center", gap: sp(4), marginTop: sp(20) }}>
                                <Text style={[T.bodySM, { color: Colors.muted }]}>¿No tienes cuenta?</Text>
                                <TouchableOpacity onPress={onRegister}>
                                    <Text style={[T.bodySM, { color: Colors.primary, fontWeight: "600" }]}>
                                        Regístrate aquí
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[T.caption, { color: Colors.muted, textAlign: "center", marginTop: sp(32) }]}>
                                © FaceAttend EDU {new Date().getFullYear()} — Derechos reservados
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
