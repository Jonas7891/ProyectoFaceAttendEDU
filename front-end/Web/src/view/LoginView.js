// ============================================================
//  FaceAttend EDU — Login VIEW
// ============================================================
//  RESPONSABILIDAD: Presentación y UI ("cómo se presenta")
//
//  Este componente:
//  ✓ Renderiza toda la interfaz visual
//  ✓ Maneja estilos, layouts y animaciones
//  ✓ Coordina hooks de presentación (useLoginViewModel)
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
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
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
import { useLoginViewModel } from "../viewmodels/useAuthViewModel";
import { useTranslation }    from "../i18n/hooks/useTranslation";

// ── Credenciales de desarrollo ───────────────────────────────
// Solo visible cuando __DEV__ === true (Expo/Metro en desarrollo).
// En producción este bloque nunca se renderiza.

const DEV_USERS = [
    { role: "Admin",    email: "admin@uni.edu",      color: "#EF4444" },
    { role: "Docente",  email: "f.torres@uni.edu",   color: "#F59E0B" },
    { role: "Alumno",   email: "m.garcia@uni.edu",   color: "#10B981" },
];

function DevCredentials({ onFill }) {
    const { theme } = useTheme();
    const c = theme.colors;
    // __DEV__ es una variable global de React Native / Metro — true en desarrollo
    if (typeof __DEV__ === "undefined" || !__DEV__) return null;

    return (
        <View style={{
            marginTop: 16,
            borderWidth: 1,
            borderColor: "#F59E0B",
            borderRadius: 14,
            padding: 12,
            backgroundColor: "#FFFBEB",
            gap: 8,
        }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Feather name="zap" size={12} color="#92400E" />
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#92400E", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Dev — acceso rápido
                </Text>
            </View>
            <Text style={{ fontSize: 11, color: "#92400E", marginBottom: 4 }}>
                Contraseña: cualquier texto no vacío
            </Text>
            {DEV_USERS.map(u => (
                <TouchableOpacity
                    key={u.role}
                    onPress={() => onFill(u.email)}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 14,
                        backgroundColor: u.color + "15",
                        borderWidth: 1,
                        borderColor: u.color + "40",
                    }}
                >
                    <View style={{ width: 3, height: 3, borderRadius: 14, backgroundColor: u.color }} />
                    <Text style={{ fontSize: 10, fontWeight: "600", color: "#1a1a2e", flex: 1 }}>
                        {u.role}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#64748B" }}>{u.email}</Text>
                    <Feather name="arrow-right" size={11} color="#64748B" />
                </TouchableOpacity>
            ))}
        </View>
    );
}


export default function LoginView({
    onLoginSuccess,
    onForgotPassword,
    onGoToRegister,
}) {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useLoginViewModel(onLoginSuccess);
    const { t }       = useTranslation();

    // Rellena el email desde el panel dev y pone foco listo para escribir contraseña
    function handleDevFill(email) {
        vm.setEmail(email);
        vm.prefillEmail(email);
    }

    const FEATURES = [
        { title: t("Reconocimiento facial en tiempo real"), desc: t("Registra asistencia automáticamente con IA.")  },
        { title: t("Reportes y estadísticas detalladas"),   desc: t("Analiza patrones de asistencia por curso.")   },
        { title: t("Gestión completa de estudiantes"),      desc: t("Centraliza toda la información académica.")   },
    ];

    const fields = (
        <View style={{ gap: 18 }}>
            <TextInput
                label={t("Correo electrónico")}
                placeholder={t("correo@universidad.edu")}
                onChangeText={vm.setEmail}
                type="email"
                value={vm.emailDisplay}
                leftIcon={<Feather name="mail" size={17} color={c.text.secondary} />}
            />
            <TextInput
                label={t("Contraseña")}
                placeholder={t("Tu contraseña")}
                onChangeText={vm.setPassword}
                type="password"
                value={vm.password}
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
            <TouchableOpacity
                onPress={onForgotPassword}
                style={{ alignSelf: "flex-end", marginTop: 14 }}
            >
                <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "500" }}>
                    {t("¿Olvidaste tu contraseña?")}
                </Text>
            </TouchableOpacity>
            <View style={{ marginTop: 24 }}>
                <Button
                    label={vm.loading ? t("Ingresando…") : t("Ingresar")}
                    onPress={vm.handleLogin}
                />
            </View>
            <AuthFooterLink
                prompt={t("¿No tienes cuenta?")}
                linkLabel={t("Regístrate aquí")}
                onPress={onGoToRegister}
            />
            <DevCredentials onFill={handleDevFill} />
            <AuthCopyright />
        </React.Fragment>
    );

    if (isSmall) {
        return (
            <AuthMobileLayout
                title={t("Inicio de sesión")}
                subtitle={t("Bienvenido de vuelta. Ingresa tus credenciales.")}
            >
                {fields}
                {formActions}
            </AuthMobileLayout>
        );
    }

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
                    FaceAttend EDU
                </Text>
                <Text style={{
                    fontSize: 11, color: "rgba(255,255,255,0.75)",
                    textAlign: "center", lineHeight: 20, marginBottom: 24,
                }}>
                    {t("Asistencia inteligente para tu institución")}
                </Text>
                <View style={{ gap: 12, width: "100%" }}>
                    {FEATURES.map(f => (
                        <View key={f.title} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                            <View style={{
                                width: 6, height: 6, borderRadius: 14,
                                backgroundColor: "rgba(255,255,255,0.6)",
                                marginTop: 4, flexShrink: 0,
                            }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.onBrand }}>{f.title}</Text>
                                <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{f.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        </React.Fragment>
    );

    const formContent = (
        <React.Fragment>
            <Text style={{ fontSize: 10, fontWeight: "800", color: c.text.primary, marginBottom: 8, letterSpacing: -0.5 }}>
                {t("Inicio de sesión")}
            </Text>
            <Text style={{ fontSize: 11, color: c.text.secondary, marginBottom: 24, lineHeight: 24 }}>
                {t("Bienvenido de vuelta. Ingresa tus credenciales.")}
            </Text>
            {fields}
            {formActions}
        </React.Fragment>
    );

    return (
        <AuthAnimatedLayout
            screenKey="login"
            brandPanel={brandPanel}
            formContent={formContent}
        />
    );
}
