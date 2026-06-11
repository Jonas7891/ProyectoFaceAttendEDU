// ============================================================
//  FaceAttend EDU — Login View Component (View Layer)
//  Recibe callbacks del Screen. Lógica en useLoginViewModel.
// ============================================================

import React from "react";
import {
    View, Text, ScrollView, Image,
    KeyboardAvoidingView, Platform, TouchableOpacity,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme }      from "../hooks/useTheme";
import Button            from "../ui/button";
import { FormField, AuthErrorBanner, AuthFooterLink, BrandPanelCircles } from "./AuthComponents";
import { useLoginViewModel } from "../../../viewmodels/useAuthViewModel";

const FEATURES = [
    { title: "Reconocimiento facial en tiempo real", desc: "Registra asistencia automáticamente con IA."  },
    { title: "Reportes y estadísticas detalladas",   desc: "Analiza patrones de asistencia por curso."   },
    { title: "Gestión completa de estudiantes",      desc: "Centraliza toda la información académica."   },
];

interface LoginViewProps {
    onLoginSuccess:    (email: string, password: string) => void;
    onForgotPassword?: () => void;
    onGoToRegister?:   () => void;
}

export default function LoginView({ onLoginSuccess, onForgotPassword, onGoToRegister }: LoginViewProps) {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useLoginViewModel(onLoginSuccess);

    const fields = (
        <View style={{ gap: 18 }}>
            <FormField
                label="Correo electrónico" placeholder="correo@universidad.edu"
                onChangeText={vm.setEmail} icon="mail"
            />
            <FormField
                label="Contraseña" placeholder="Tu contraseña"
                onChangeText={vm.setPassword}
                secureTextEntry={!vm.showPassword} icon="lock"
                rightIcon={vm.showPassword ? "eye-off" : "eye"}
                onRightIcon={vm.togglePassword}
            />
        </View>
    );

    const footer = (
        <>
            <AuthErrorBanner message={vm.error} />
            <TouchableOpacity
                onPress={onForgotPassword}
                style={{ alignSelf: "flex-end", marginTop: 14 }}
            >
                <Text style={{ fontSize: 13, color: c.brand.primary, fontWeight: "500" }}>
                    ¿Olvidaste tu contraseña?
                </Text>
            </TouchableOpacity>
            <View style={{ marginTop: 24 }}>
                <Button label={vm.loading ? "Ingresando…" : "Ingresar"} onPress={vm.handleLogin} />
            </View>
            <AuthFooterLink prompt="¿No tienes cuenta?" linkLabel="Regístrate aquí" onPress={onGoToRegister} />
            <Text style={{ fontSize: 12, color: c.text.secondary, textAlign: "center", marginTop: 40 }}>
                © FaceAttend EDU {new Date().getFullYear()} — Derechos reservados
            </Text>
        </>
    );

    // ── MÓVIL ──────────────────────────────────────────────
    if (isSmall) {
        return (
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: c.background.surface }}>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                        <ScrollView
                            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 40 }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 36 }}>
                                <Image
                                    source={require("../../../assets/images/logoFaceAttend-Minimalista.png")}
                                    style={{ width: 44, height: 44 }} resizeMode="contain"
                                />
                                <Text style={{ fontSize: 20, fontWeight: "700", color: c.text.primary }}>
                                    FaceAttend <Text style={{ color: c.brand.primary }}>EDU</Text>
                                </Text>
                            </View>
                            <Text style={{ fontSize: 30, fontWeight: "800", color: c.text.primary, marginBottom: 6, letterSpacing: -0.5 }}>
                                Inicio de sesión
                            </Text>
                            <Text style={{ fontSize: 15, color: c.text.secondary, marginBottom: 32, lineHeight: 22 }}>
                                Bienvenido de vuelta. Ingresa tus credenciales.
                            </Text>
                            {fields}
                            {footer}
                        </ScrollView>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </SafeAreaProvider>
        );
    }

    // ── DESKTOP — split panel ────────────────────────────
    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: c.background.app }}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    {/* Panel de marca */}
                    <View style={{
                        flex: 1, backgroundColor: c.brand.primary,
                        justifyContent: "center", alignItems: "center",
                        padding: 64, overflow: "hidden",
                    }}>
                        <BrandPanelCircles />
                        <View style={{ zIndex: 1, alignItems: "center", maxWidth: 400 }}>
                            <Image
                                source={require("../../../assets/images/logoFaceAttend-BlancoAzul.png")}
                                style={{ width: 100, height: 100, marginBottom: 24 }} resizeMode="contain"
                            />
                            <Text style={{ fontSize: 36, fontWeight: "800", color: c.text.onBrand, textAlign: "center", marginBottom: 12, letterSpacing: -1 }}>
                                FaceAttend EDU
                            </Text>
                            <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 26, marginBottom: 40 }}>
                                Asistencia inteligente para tu institución
                            </Text>
                            <View style={{ gap: 18, width: "100%" }}>
                                {FEATURES.map(f => (
                                    <View key={f.title} style={{ flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
                                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.6)", marginTop: 7, flexShrink: 0 }} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.onBrand }}>{f.title}</Text>
                                            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{f.desc}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Panel de formulario */}
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 56 }}
                        style={{ backgroundColor: c.background.surface }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{ width: "100%", maxWidth: 360 }}>
                            <Text style={{ fontSize: 28, fontWeight: "800", color: c.text.primary, marginBottom: 6, letterSpacing: -0.5 }}>
                                Inicio de sesión
                            </Text>
                            <Text style={{ fontSize: 15, color: c.text.secondary, marginBottom: 32, lineHeight: 24 }}>
                                Bienvenido de vuelta. Ingresa tus credenciales.
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
