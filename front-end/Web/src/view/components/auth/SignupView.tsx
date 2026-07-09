// ============================================================
//  FaceAttend EDU — Signup View Component (View Layer)
//  Recibe callbacks del Screen. Lógica en useSignupViewModel.
// ============================================================

import React from "react";
import { View, Text, Image } from "react-native";
import { useResponsive }  from "../hooks/useResponsive";
import { useTheme }       from "../hooks/useTheme";
import Button             from "../ui/button";
import {
    FormField, AuthErrorBanner, AuthFooterLink,
    BrandPanelCircles, AuthCopyright,
} from "./AuthComponents";
import AuthMobileLayout   from "./AuthMobileLayout";
import AuthAnimatedLayout from "./AuthAnimatedLayout";
import { useSignupViewModel } from "../../../viewmodels/useAuthViewModel";
import type { SignupForm }    from "../../../viewmodels/useAuthViewModel";
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

    // ── Secciones compartidas entre mobile y desktop ─────────
    const fields = (
        <View style={{ gap: 18 }}>
            <FormField
                label={t("Usuario")}
                placeholder={t("Tu nombre de usuario")}
                onChangeText={vm.setUsername}
                icon="user"
            />
            <FormField
                label={t("Correo electrónico")}
                placeholder={t("correo@universidad.edu")}
                onChangeText={vm.setEmail}
                icon="mail"
            />
            <FormField
                label={t("Contraseña")}
                placeholder={t("Crea una contraseña")}
                onChangeText={vm.setPassword}
                secureTextEntry={!vm.showPassword}
                icon="lock"
                rightIcon={vm.showPassword ? "eye-off" : "eye"}
                onRightIcon={vm.togglePassword}
            />
        </View>
    );

    const formActions = (
        <>
            <AuthErrorBanner message={vm.error} />
            <View style={{ marginTop: 28 }}>
                <Button
                    label={vm.loading ? t("Registrando…") : t("Registrarse")}
                    onPress={vm.handleRegister}
                />
            </View>
            <AuthFooterLink
                prompt={t("¿Ya tienes cuenta?")}
                linkLabel={t("Inicia sesión")}
                onPress={onGoToLogin}
            />
            <AuthCopyright />
        </>
    );

    // ── MÓVIL ─────────────────────────────────────────────────
    if (isSmall) {
        return (
            <AuthMobileLayout
                title={t("Crear cuenta")}
                subtitle={t("Completa los datos para registrarte.")}
            >
                {fields}
                {formActions}
            </AuthMobileLayout>
        );
    }

    // ── DESKTOP — split panel con animaciones de entrada ──────
    const brandPanel = (
        <>
            <BrandPanelCircles />
            <View style={{ zIndex: 1, alignItems: "center", maxWidth: 400 }}>
                <Image
                    source={require("../../../assets/images/logoFaceAttend-BlancoAzul.png")}
                    style={{ width: 100, height: 100, marginBottom: 24 }}
                    resizeMode="contain"
                />
                <Text style={{
                    fontSize: 34, fontWeight: "800", color: c.text.onBrand,
                    textAlign: "center", marginBottom: 14, letterSpacing: -1,
                }}>
                    {t("Únete a FaceAttend EDU")}
                </Text>
                <Text style={{
                    fontSize: 16, color: "rgba(255,255,255,0.75)",
                    textAlign: "center", lineHeight: 26,
                }}>
                    {t("Registra tu institución y empieza a gestionar la asistencia con reconocimiento facial.")}
                </Text>
            </View>
        </>
    );

    const formContent = (
        <>
            <Text style={{ fontSize: 28, fontWeight: "800", color: c.text.primary, marginBottom: 6, letterSpacing: -0.5 }}>
                {t("Crear cuenta")}
            </Text>
            <Text style={{ fontSize: 15, color: c.text.secondary, marginBottom: 32, lineHeight: 24 }}>
                {t("Completa los datos para registrarte.")}
            </Text>
            {fields}
            {formActions}
        </>
    );

    return (
        <AuthAnimatedLayout
            screenKey="register"
            brandPanel={brandPanel}
            formContent={formContent}
        />
    );
}
