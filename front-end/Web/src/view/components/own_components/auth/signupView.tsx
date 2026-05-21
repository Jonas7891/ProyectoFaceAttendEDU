// ============================================================
//  FaceAttend EDU — Signup View
//  Colores desde useTheme() — sin imports de Colors.
// ============================================================

import React, { useState, useRef } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, Image, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Feather }       from "@expo/vector-icons";
import { useResponsive } from "../../hooks/useResponsive";
import { useTheme }      from "../../hooks/useTheme";
import Button            from "../ui/button";

function Field({
                   label, placeholder, onChangeText,
                   secureTextEntry = false, icon, rightIcon, onRightIcon,
               }: {
    label: string; placeholder: string;
    onChangeText: (v: string) => void;
    secureTextEntry?: boolean;
    icon?: any; rightIcon?: any; onRightIcon?: () => void;
}) {
    const [focused, setFocused] = useState(false);
    const { theme } = useTheme();
    const c         = theme.colors;

    return (
        <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: c.text.primary }}>
                {label}
            </Text>
            <View style={{
                flexDirection:   "row",
                alignItems:      "center",
                height:          50,
                borderWidth:     1.5,
                borderColor:     focused ? c.border.focus : c.border.primary,
                borderRadius:    12,
                backgroundColor: c.background.app,
                paddingHorizontal: 14,
                gap:             10,
            }}>
                {icon && <Feather name={icon} size={17} color={c.text.secondary} />}
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={c.text.disabled}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                        flex: 1, fontSize: 15, color: c.text.primary,
                        // @ts-ignore
                        outlineStyle: "none",
                    }}
                />
                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIcon}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Feather name={rightIcon} size={17} color={c.text.secondary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

export default function SignupPage({
                                       onRegister,
                                       onLogin,
                                   }: {
    onRegister: (data: { usuario: string; email: string; contrasena: string }) => void;
    onLogin?: () => void;
}) {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;

    const usuarioRef    = useRef("");
    const emailRef      = useRef("");
    const contrasenaRef = useRef("");
    const [showPass, setShowPass] = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState("");

    function handleRegister() {
        if (!usuarioRef.current || !emailRef.current || !contrasenaRef.current) {
            setError("Completa todos los campos");
            return;
        }
        setError("");
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onRegister({
                usuario:   usuarioRef.current,
                email:     emailRef.current,
                contrasena: contrasenaRef.current,
            });
        }, 900);
    }

    const fields = (
        <View style={{ gap: 18 }}>
            <Field label="Usuario" placeholder="Tu nombre de usuario"
                   onChangeText={v => { usuarioRef.current = v; }} icon="user" />
            <Field label="Correo electrónico" placeholder="correo@universidad.edu"
                   onChangeText={v => { emailRef.current = v; }} icon="mail" />
            <Field label="Contraseña" placeholder="Crea una contraseña"
                   onChangeText={v => { contrasenaRef.current = v; }}
                   secureTextEntry={!showPass} icon="lock"
                   rightIcon={showPass ? "eye-off" : "eye"}
                   onRightIcon={() => setShowPass(v => !v)} />
        </View>
    );

    const footer = (
        <>
            {error !== "" && (
                <View style={{
                    marginTop: 14, backgroundColor: c.states.dangerLight,
                    borderRadius: 10, padding: 12,
                }}>
                    <Text style={{ fontSize: 13, color: c.states.danger }}>{error}</Text>
                </View>
            )}
            <View style={{ marginTop: 28 }}>
                <Button label={loading ? "Registrando…" : "Registrarse"} onPress={handleRegister} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 20 }}>
                <Text style={{ fontSize: 14, color: c.text.secondary }}>¿Ya tienes cuenta?</Text>
                <TouchableOpacity onPress={onLogin}>
                    <Text style={{ fontSize: 14, color: c.brand.primary, fontWeight: "600" }}>
                        Inicia sesión
                    </Text>
                </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: c.text.secondary, textAlign: "center", marginTop: 40 }}>
                © FaceAttend EDU {new Date().getFullYear()} — Derechos reservados
            </Text>
        </>
    );

    if (isSmall) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: c.background.surface }}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    >
                        <ScrollView
                            contentContainerStyle={{
                                flexGrow: 1, justifyContent: "center",
                                paddingHorizontal: 28, paddingVertical: 40,
                            }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 36 }}>
                                <Image
                                    source={require("../../../../assets/images/logoFaceAttend-Minimalista.png")}
                                    style={{ width: 44, height: 44 }} resizeMode="contain"
                                />
                                <Text style={{ fontSize: 20, fontWeight: "700", color: c.text.primary }}>
                                    FaceAttend <Text style={{ color: c.brand.primary }}>EDU</Text>
                                </Text>
                            </View>
                            <Text style={{
                                fontSize: 30, fontWeight: "800",
                                color: c.text.primary, marginBottom: 6, letterSpacing: -0.5,
                            }}>
                                Crear cuenta
                            </Text>
                            <Text style={{
                                fontSize: 15, color: c.text.secondary,
                                marginBottom: 32, lineHeight: 22,
                            }}>
                                Completa los datos para registrarte.
                            </Text>
                            {fields}
                            {footer}
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: c.background.app }}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{
                        flex:            1,
                        backgroundColor: c.brand.primary,
                        justifyContent:  "center",
                        alignItems:      "center",
                        padding:         64,
                        overflow:        "hidden",
                    }}>
                        <View style={{
                            position: "absolute", width: 340, height: 340, borderRadius: 170,
                            borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", top: -90, left: -90,
                        }} />
                        <View style={{
                            position: "absolute", width: 500, height: 500, borderRadius: 250,
                            borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", bottom: -130, right: -130,
                        }} />
                        <View style={{ zIndex: 1, alignItems: "center", maxWidth: 400 }}>
                            <Image
                                source={require("../../../../assets/images/logoFaceAttend-BlancoAzul.png")}
                                style={{ width: 100, height: 100, marginBottom: 24 }} resizeMode="contain"
                            />
                            <Text style={{
                                fontSize: 34, fontWeight: "800", color: c.text.onBrand,
                                textAlign: "center", marginBottom: 14, letterSpacing: -1,
                            }}>
                                Únete a FaceAttend EDU
                            </Text>
                            <Text style={{
                                fontSize: 16, color: "rgba(255,255,255,0.75)",
                                textAlign: "center", lineHeight: 26,
                            }}>
                                Registra tu institución y empieza a gestionar la asistencia con reconocimiento facial.
                            </Text>
                        </View>
                    </View>

                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 56,
                        }}
                        style={{ backgroundColor: c.background.surface }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{ width: "100%", maxWidth: 360 }}>
                            <Text style={{
                                fontSize: 28, fontWeight: "800",
                                color: c.text.primary, marginBottom: 6, letterSpacing: -0.5,
                            }}>
                                Crear cuenta
                            </Text>
                            <Text style={{
                                fontSize: 15, color: c.text.secondary,
                                marginBottom: 32, lineHeight: 24,
                            }}>
                                Completa los datos para registrarte.
                            </Text>
                            {fields}
                            {footer}
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
