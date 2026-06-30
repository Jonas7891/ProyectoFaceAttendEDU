import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, Image, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useResponsive } from "../../hooks/useResponsive";
import Colors from "../../constants/colors";
import Button from "../ui/button";
import { useSignupViewModel } from "../../../../viewmodels/useSignupViewModel";

function Field({
                   label, placeholder, onChangeText, value = "",
                   secureTextEntry = false, icon, rightIcon, onRightIcon,
               }: {
    label: string; placeholder: string;
    onChangeText: (v: string) => void;
    value?: string;
    secureTextEntry?: boolean;
    icon?: any; rightIcon?: any; onRightIcon?: () => void;
}) {
    const [focused, setFocused] = useState(false);

    const inputStyle: any = {
        flex: 1,
        fontSize: 15,
        color: Colors.text,
        outlineStyle: "none",
    };

    return (
        <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: Colors.text }}>{label}</Text>
            <View style={{
                flexDirection: "row", alignItems: "center",
                height: 50,
                borderWidth: 1.5,
                borderColor: focused ? Colors.primary : Colors.border,
                borderRadius: 12,
                backgroundColor: Colors.bg,
                paddingHorizontal: 14,
                gap: 10,
            }}>
                {icon && <Feather name={icon} size={17} color={Colors.muted} />}
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor={Colors.muted}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={inputStyle}
                />
                {rightIcon && (
                    <TouchableOpacity onPress={onRightIcon} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Feather name={rightIcon} size={17} color={Colors.muted} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

export default function SignupPage({ onSignupSuccess, onLogin }: {
    onSignupSuccess?: (role: string, token: string) => void;
    onLogin?: () => void;
}) {
    const { isSmall } = useResponsive();
    const [showPass, setShowPass] = useState(false);

    const {
        username,
        email,
        password,
        isLoading,
        error,
        setUsername,
        setEmail,
        setPassword,
        submit: handleRegister,
    } = useSignupViewModel({
        onSignup: onSignupSuccess,
    });

    const fields = (
        <View style={{ gap: 18 }}>
            <Field label="Usuario" placeholder="Tu nombre de usuario"
                   onChangeText={setUsername} value={username} icon="user" />
            <Field label="Correo electrónico" placeholder="correo@universidad.edu"
                   onChangeText={setEmail} value={email} icon="mail" />
            <Field label="Contraseña" placeholder="Crea una contraseña"
                   onChangeText={setPassword} value={password}
                   secureTextEntry={!showPass} icon="lock"
                   rightIcon={showPass ? "eye-off" : "eye"}
                   onRightIcon={() => setShowPass(v => !v)} />
        </View>
    );

    const footer = (
        <>
            {error !== "" && (
                <View style={{ marginTop: 14, backgroundColor: "#FEE2E2", borderRadius: 10, padding: 12 }}>
                    <Text style={{ fontSize: 13, color: "#DC2626" }}>{error}</Text>
                </View>
            )}
            <View style={{ marginTop: 28 }}>
                <Button label={isLoading ? "Registrando…" : "Registrarse"} onPress={handleRegister} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 20 }}>
                <Text style={{ fontSize: 14, color: Colors.muted }}>¿Ya tienes cuenta?</Text>
                <TouchableOpacity onPress={onLogin}>
                    <Text style={{ fontSize: 14, color: Colors.primary, fontWeight: "600" }}>Inicia sesión</Text>
                </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: Colors.muted, textAlign: "center", marginTop: 40 }}>
                © FaceAttend EDU {new Date().getFullYear()} — Derechos reservados
            </Text>
        </>
    );

    // ── MÓVIL ─────────────────────────────────────────────
    if (isSmall) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 40 }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 36 }}>
                                <Image source={require("../../../../assets/images/logoFaceAttend-Minimalista.png")}
                                       style={{ width: 44, height: 44 }} resizeMode="contain" />
                                <Text style={{ fontSize: 20, fontWeight: "700", color: Colors.text }}>
                                    FaceAttend <Text style={{ color: Colors.primary }}>EDU</Text>
                                </Text>
                            </View>
                            <Text style={{ fontSize: 30, fontWeight: "800", color: Colors.text, marginBottom: 6, letterSpacing: -0.5 }}>
                                Crear cuenta
                            </Text>
                            <Text style={{ fontSize: 15, color: Colors.muted, marginBottom: 32, lineHeight: 22 }}>
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

    // ── DESKTOP — split panel ─────────────────────────────
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <View style={{ flex: 1, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", padding: 64, overflow: "hidden" }}>
                        <View style={{ position: "absolute", width: 340, height: 340, borderRadius: 170, borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", top: -90, left: -90 }} />
                        <View style={{ position: "absolute", width: 500, height: 500, borderRadius: 250, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", bottom: -130, right: -130 }} />
                        <View style={{ zIndex: 1, alignItems: "center", maxWidth: 400 }}>
                            <Image source={require("../../../../assets/images/logoFaceAttend-BlancoAzul.png")}
                                   style={{ width: 100, height: 100, marginBottom: 24 }} resizeMode="contain" />
                            <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 14, letterSpacing: -1 }}>
                                Únete a FaceAttend EDU
                            </Text>
                            <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 26 }}>
                                Registra tu institución y empieza a gestionar la asistencia con reconocimiento facial.
                            </Text>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 56 }}
                                style={{ backgroundColor: Colors.surface }} showsVerticalScrollIndicator={false}>
                        <View style={{ width: "100%", maxWidth: 360 }}>
                            <Text style={{ fontSize: 28, fontWeight: "800", color: Colors.text, marginBottom: 6, letterSpacing: -0.5 }}>
                                Crear cuenta
                            </Text>
                            <Text style={{ fontSize: 15, color: Colors.muted, marginBottom: 32, lineHeight: 24 }}>
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