// ============================================================
//  FaceAttend EDU — Signup View (React Native)
//  Mismo split-panel que loginView, panel primario a la izquierda
// ============================================================
import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, Image,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { useResponsive }  from "../../hooks/useResponsive";
import { getTypography }  from "../../constants/typography";
import Colors from "../../constants/colors";
import Button from "../ui/button";

function Field({
    label, placeholder, value, onChangeText,
    secureTextEntry = false, icon, rightIcon, onRightIcon,
}: {
    label: string; placeholder: string;
    value: string; onChangeText: (v: string) => void;
    secureTextEntry?: boolean;
    icon?: any; rightIcon?: any; onRightIcon?: () => void;
}) {
    const { fs, sp } = useResponsive();
    const [focused, setFocused] = useState(false);

    return (
        <View style={{ gap: sp(6) }}>
            <Text style={{ fontSize: fs(13), fontWeight: "500", color: Colors.text }}>
                {label}
            </Text>
            <View style={{
                flexDirection: "row", alignItems: "center",
                height: sp(44),
                borderWidth: 1.5,
                borderColor: focused ? Colors.primary : Colors.border,
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
                        // @ts-ignore
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
        </View>
    );
}

export default function SignupPage({ onRegister, onLogin }: {
    onRegister: (data: { usuario: string; email: string; contrasena: string }) => void;
    onLogin?: () => void;
}) {
    const { fs, sp, isSmall } = useResponsive();
    const T = getTypography(fs);

    const [usuario,    setUsuario]    = useState("");
    const [email,      setEmail]      = useState("");
    const [contrasena, setContrasena] = useState("");
    const [showPass,   setShowPass]   = useState(false);
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState("");

    function handleRegister() {
        if (!usuario || !email || !contrasena) { setError("Completa todos los campos"); return; }
        setError("");
        setLoading(true);
        setTimeout(() => { setLoading(false); onRegister({ usuario, email, contrasena }); }, 900);
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
                <View style={{ flex: 1, flexDirection: isSmall ? "column" : "row" }}>

                    {/* ── Panel izquierdo ── */}
                    {!isSmall && (
                        <View style={{
                            flex: 1,
                            backgroundColor: Colors.primary,
                            justifyContent: "center",
                            alignItems: "center",
                            padding: sp(48),
                            overflow: "hidden",
                        }}>
                            {/* Decorativos */}
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

                            <View style={{ zIndex: 1, alignItems: "center", maxWidth: sp(360) }}>
                                <Image
                                    source={require("../../../../assets/images/logoFaceAttend-BlancoAzul.png")}
                                    style={{ width: sp(90), height: sp(90), marginBottom: sp(20) }}
                                    resizeMode="contain"
                                />
                                <Text style={[T.displayLG, { color: "#fff", textAlign: "center", marginBottom: sp(10) }]}>
                                    Únete a FaceAttend EDU
                                </Text>
                                <Text style={[T.bodyLG, { color: "rgba(255,255,255,0.75)", textAlign: "center" }]}>
                                    Registra tu institución y empieza a gestionar la asistencia con reconocimiento facial.
                                </Text>
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
                                Crear cuenta
                            </Text>
                            <Text style={[T.bodyMD, { color: Colors.muted, marginBottom: sp(28) }]}>
                                Completa los datos para registrarte.
                            </Text>

                            <View style={{ gap: sp(14) }}>
                                <Field
                                    label="Usuario"
                                    placeholder="Tu nombre de usuario"
                                    value={usuario}
                                    onChangeText={setUsuario}
                                    icon="user"
                                />
                                <Field
                                    label="Correo electrónico"
                                    placeholder="correo@universidad.edu"
                                    value={email}
                                    onChangeText={setEmail}
                                    icon="mail"
                                />
                                <Field
                                    label="Contraseña"
                                    placeholder="Crea una contraseña"
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

                            <View style={{ marginTop: sp(20) }}>
                                <Button
                                    label={loading ? "Registrando…" : "Registrarse"}
                                    onPress={handleRegister}
                                />
                            </View>

                            <View style={{ flexDirection: "row", justifyContent: "center", gap: sp(4), marginTop: sp(20) }}>
                                <Text style={[T.bodySM, { color: Colors.muted }]}>¿Ya tienes cuenta?</Text>
                                <TouchableOpacity onPress={onLogin}>
                                    <Text style={[T.bodySM, { color: Colors.primary, fontWeight: "600" }]}>
                                        Inicia sesión
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
