// ============================================================
//  FaceAttend EDU — Signup View Component (View Layer)
// ============================================================

import React from "react";
import {
    View, Text, ScrollView, Image,
    KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useResponsive } from "../hooks/useResponsive";
import { useTheme }      from "../hooks/useTheme";
import Button            from "../ui/button";
import { FormField, AuthErrorBanner, AuthFooterLink, BrandPanelCircles } from "./AuthComponents";
import { useSignupViewModel } from "../../../viewmodels/useAuthViewModel";
import type { SignupForm } from "../../../viewmodels/useAuthViewModel";
import { useTranslation }     from "../../../i18n/hooks/useTranslation";

interface SignupViewProps {
    onRegisterSuccess: (data: SignupForm) => void;
    onGoToLogin?:      () => void;
}

export default function SignupView({ onRegisterSuccess, onGoToLogin }: SignupViewProps) {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useSignupViewModel(onRegisterSuccess);
    const { t }       = useTranslation();

    const fields = (
        <View style={{ gap: 18 }}>
            <FormField label={t("Usuario")} placeholder={t("Tu nombre de usuario")}
                onChangeText={vm.setUsername} icon="user" />
            <FormField label={t("Correo electrónico")} placeholder={t("correo@universidad.edu")}
                onChangeText={vm.setEmail} icon="mail" />
            <FormField label={t("Contraseña")} placeholder={t("Crea una contraseña")}
                onChangeText={vm.setPassword}
                secureTextEntry={!vm.showPassword} icon="lock"
                rightIcon={vm.showPassword ? "eye-off" : "eye"}
                onRightIcon={vm.togglePassword} />
        </View>
    );

    const footer = (
        <>
            <AuthErrorBanner message={vm.error} />
            <View style={{ marginTop: 28 }}>
                <Button label={vm.loading ? t("Registrando…") : t("Registrarse")} onPress={vm.handleRegister} />
            </View>
            <AuthFooterLink prompt={t("¿Ya tienes cuenta?")} linkLabel={t("Inicia sesión")} onPress={onGoToLogin} />
            <Text style={{ fontSize: 12, color: c.text.secondary, textAlign: "center", marginTop: 40 }}>
                © FaceAttend EDU {new Date().getFullYear()} — {t("Derechos reservados")}
            </Text>
        </>
    );

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
                                {t("Crear cuenta")}
                            </Text>
                            <Text style={{ fontSize: 15, color: c.text.secondary, marginBottom: 32, lineHeight: 22 }}>
                                {t("Completa los datos para registrarte.")}
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
                            <Text style={{ fontSize: 34, fontWeight: "800", color: c.text.onBrand, textAlign: "center", marginBottom: 14, letterSpacing: -1 }}>
                                {t("Únete a FaceAttend EDU")}
                            </Text>
                            <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 26 }}>
                                {t("Registra tu institución y empieza a gestionar la asistencia con reconocimiento facial.")}
                            </Text>
                        </View>
                    </View>

                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 56 }}
                        style={{ backgroundColor: c.background.surface }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={{ width: "100%", maxWidth: 360 }}>
                            <Text style={{ fontSize: 28, fontWeight: "800", color: c.text.primary, marginBottom: 6, letterSpacing: -0.5 }}>
                                {t("Crear cuenta")}
                            </Text>
                            <Text style={{ fontSize: 15, color: c.text.secondary, marginBottom: 32, lineHeight: 24 }}>
                                {t("Completa los datos para registrarte.")}
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
