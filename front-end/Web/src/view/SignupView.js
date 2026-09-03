// ============================================================
//  FaceAttend EDU — Signup VIEW
// ============================================================
//  RESPONSABILIDAD: Presentación y UI ("cómo se presenta")
//
//  Este componente:
//  ✓ Renderiza toda la interfaz visual
//  ✓ Maneja estilos, layouts y animaciones
//  ✓ Coordina hooks de presentación (useSignupViewModel)
//  ✓ Gestiona el estado visual (mostrar/ocultar contraseña, etc.)
//
//  NO debe:
//  ✗ Manejar navegación directamente
//  ✗ Conocer rutas o nombres de pantallas
//  ✗ Acceder a navigation directamente
//
//  Recibe callbacks del Screen para delegar acciones de navegación.
// ============================================================

import React from "react";
import { View, Text, Image } from "react-native";
import { useResponsive }  from "./components/hooks/useResponsive";
import { useTheme }       from "./components/hooks/useTheme";
import Button             from "./components/common/buttons/Button";
import TextInput          from "./components/common/inputs/TextInput";
import Alert              from "./components/common/feedback/Alert";
import {
    AuthFooterLink,
    BrandPanelCircles, AuthCopyright,
} from "./components/auth/AuthComponents";
import AuthMobileLayout   from "./components/auth/AuthMobileLayout";
import AuthAnimatedLayout from "./components/auth/AuthAnimatedLayout";
import { useSignupViewModel } from "../viewmodels/useAuthViewModel";
import { useTranslation }     from "../i18n/hooks/useTranslation";


export default function SignupView({ onRegisterSuccess, onGoToLogin }) {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useSignupViewModel(onRegisterSuccess);
    const { t }       = useTranslation();

    // ── Secciones compartidas entre mobile y desktop ──────────
    const fields = (
        <View style={{ gap: 18 }}>
            <TextInput
                label={t("Usuario")}
                placeholder={t("Tu nombre de usuario")}
                onChangeText={vm.setUsername}
                leftIcon={<Feather name="user" size={17} color={c.text.secondary} />}
            />
            <TextInput
                label={t("Correo electrónico")}
                placeholder={t("correo@universidad.edu")}
                onChangeText={vm.setEmail}
                type="email"
                leftIcon={<Feather name="mail" size={17} color={c.text.secondary} />}
            />
            <TextInput
                label={t("Contraseña")}
                placeholder={t("Crea una contraseña")}
                onChangeText={vm.setPassword}
                type="password"
                leftIcon={<Feather name="lock" size={17} color={c.text.secondary} />}
                rightIcon={
                    <TouchableOpacity onPress={vm.togglePassword}>
                        <Feather name={vm.showPassword ? "eye-off" : "eye"} size={17} color={c.text.secondary} />
                    </TouchableOpacity>
                }
                secureTextEntry={!vm.showPassword}
            />
        </View>
    );

    const formActions = (
        <React.Fragment>
            {vm.error && (
                <Alert 
                    type="error" 
                    message={vm.error}
                    style={{ marginTop: 12 }}
                />
            )}
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
        </React.Fragment>
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
        <React.Fragment>
            <BrandPanelCircles />
            <View style={{ zIndex: 1, alignItems: "center", maxWidth: 400 }}>
                <Image
                    source={require("../assets/images/logoFaceAttend-BlancoAzul.png")}
                    style={{ width: 180, height: 60, marginBottom: 24 }}
                    resizeMode="contain"
                />
                <Text style={{
                    fontSize: 10, fontWeight: "800", color: c.text.onBrand,
                    textAlign: "center", marginBottom: 12, letterSpacing: -1,
                }}>
                    {t("Únete a FaceAttend EDU")}
                </Text>
                <Text style={{
                    fontSize: 11, color: "rgba(255,255,255,0.75)",
                    textAlign: "center", lineHeight: 20,
                }}>
                    {t("Registra tu institución y empieza a gestionar la asistencia con reconocimiento facial.")}
                </Text>
            </View>
        </React.Fragment>
    );

    const formContent = (
        <React.Fragment>
            <Text style={{ fontSize: 10, fontWeight: "800", color: c.text.primary, marginBottom: 8, letterSpacing: -0.5 }}>
                {t("Crear cuenta")}
            </Text>
            <Text style={{ fontSize: 11, color: c.text.secondary, marginBottom: 24, lineHeight: 24 }}>
                {t("Completa los datos para registrarte.")}
            </Text>
            {fields}
            {formActions}
        </React.Fragment>
    );

    return (
        <AuthAnimatedLayout
            screenKey="register"
            brandPanel={brandPanel}
            formContent={formContent}
        />
    );
}
