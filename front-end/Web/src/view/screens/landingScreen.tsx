// ============================================================
//  FaceAttend EDU — Landing Screen
//  Hero original tuyo + sección de features (bloque primario)
//  + footer. Scroll en móvil, centrado en desktop.
// ============================================================
import React from "react";
import { useNavigation } from "@react-navigation/native";
import {
    View,
    ScrollView,
    Image,
    Text,
    StyleSheet,
} from "react-native";
import {
    SafeAreaView,
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import Navbar    from "../components/own_components/layout/navBar";
import HeroLeft  from "../components/own_components/hero/heroLeft";
import HeroRight from "../components/own_components/hero/heroRight";

import { useHeroEntrance } from "../components/hooks/useHeroEntrance";
import { useResponsive }   from "../components/hooks/useResponsive";
import { getTypography }   from "../components/constants/typography";
import BadgePositions, { BadgePositionsMobile } from "../components/constants/badgePositions";
import Colors from "../components/constants/colors";

// ─── Datos ─────────────────────────────────────────────────

const STATS = [
    { value: "99%", label: "Precisión"   },
    { value: "<1s", label: "Detección"   },
    { value: "∞",   label: "Estudiantes" },
];

const FEATURES = [
    {
        icon: "aperture" as const,
        title: "Reconocimiento facial en tiempo real",
        desc: "Registra asistencia automáticamente con IA. Sin listas en papel, sin errores humanos.",
    },
    {
        icon: "bar-chart-2" as const,
        title: "Reportes y estadísticas detalladas",
        desc: "Analiza patrones de asistencia por curso, semana y estudiante. Exporta en PDF o Excel.",
    },
    {
        icon: "users" as const,
        title: "Gestión completa de estudiantes",
        desc: "Centraliza toda la información académica. Detecta estudiantes en riesgo de manera proactiva.",
    },
];

// ─── HeroContent ───────────────────────────────────────────

function HeroContent({
    fadeLeft, slideLeft, fadeRight, slideRight,
}: ReturnType<typeof useHeroEntrance>) {
    const navigation = useNavigation<any>();
    const { sp, isSmall } = useResponsive();
    const badgePos = isSmall ? BadgePositionsMobile : BadgePositions;

    const BADGES = [
        { label: "Reconociendo",  icon: "✅", delay: 0,   style: badgePos.topLeft  },
        { label: "Escaneando…",   icon: "📷", delay: 400, style: badgePos.topRight },
        { label: "Asistencia OK", icon: "📋", delay: 800, style: badgePos.bottom   },
    ];

    return (
        <View style={{
            flexDirection:  isSmall ? "column" : "row",
            alignItems:     "center",
            justifyContent: "center",
            paddingHorizontal: sp(isSmall ? 24 : 64),
            gap: sp(isSmall ? 80 : 40),
            width: "100%",
        }}>
            <HeroLeft
                fadeLeft={fadeLeft}   slideLeft={slideLeft}
                title={"Asistencia\n"}
                accent={"inteligente\n"}
                end="para tu institución"
                primary="Registrarse"
                secondary="Iniciar sesión"
                stats={STATS}
                onPrimary={()  => navigation.navigate("FaceAttendEDU-Register")}
                onSecondary={() => navigation.navigate("FaceAttendEDU-Login")}
            />
            <HeroRight
                fadeRight={fadeRight} slideRight={slideRight}
                badges={BADGES}
            />
        </View>
    );
}

// ─── Features (bloque primario) ────────────────────────────

function FeaturesSection() {
    const { sp, fs, isSmall } = useResponsive();
    const T = getTypography(fs);

    return (
        <View style={{
            backgroundColor: Colors.primary,
            paddingVertical:   sp(48),
            paddingHorizontal: sp(isSmall ? 24 : 64),
            width: "100%",
        }}>
            {/* Título */}
            <View style={{ alignItems: "center", marginBottom: sp(36) }}>
                {/* Eyebrow */}
                <View style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    paddingHorizontal: sp(14), paddingVertical: sp(5),
                    borderRadius: 99, marginBottom: sp(12),
                }}>
                    <Text style={[T.eyebrow, { color: "rgba(255,255,255,0.85)", letterSpacing: 1.2 }]}>
                        ¿Por qué FaceAttend EDU?
                    </Text>
                </View>
                <Text style={[T.heading1, { color: "#fff", textAlign: "center" }]}>
                    Todo lo que necesitas{"\n"}en una sola plataforma
                </Text>
            </View>

            {/* Cards de features */}
            <View style={{
                flexDirection:  isSmall ? "column" : "row",
                gap:            sp(16),
                maxWidth:       1100,
                alignSelf:      "center",
                width:          "100%",
            }}>
                {FEATURES.map((f) => (
                    <View key={f.title} style={{
                        flex: 1,
                        backgroundColor: "rgba(255,255,255,0.10)",
                        borderRadius:    sp(14),
                        padding:         sp(24),
                        borderWidth:     1,
                        borderColor:     "rgba(255,255,255,0.18)",
                        gap:             sp(12),
                    }}>
                        {/* Ícono */}
                        <View style={{
                            width: sp(44), height: sp(44),
                            borderRadius: sp(12),
                            backgroundColor: "rgba(255,255,255,0.20)",
                            alignItems: "center", justifyContent: "center",
                        }}>
                            <Feather name={f.icon} size={sp(20)} color="#fff" />
                        </View>
                        <Text style={[T.heading2, { color: "#fff", marginTop: sp(4) }]}>
                            {f.title}
                        </Text>
                        <Text style={[T.bodyMD, { color: "rgba(255,255,255,0.75)" }]}>
                            {f.desc}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Decorative circles */}
            <View style={{
                position: "absolute", width: sp(280), height: sp(280),
                borderRadius: sp(140), borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                top: -sp(80), right: -sp(60), pointerEvents: "none",
            }} />
            <View style={{
                position: "absolute", width: sp(180), height: sp(180),
                borderRadius: sp(90), borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
                bottom: -sp(60), left: -sp(40), pointerEvents: "none",
            }} />
        </View>
    );
}

// ─── Navbar ────────────────────────────────────────────────

function AppNavbar() {
    const { sp, fs } = useResponsive();
    const T = getTypography(fs);

    return (
        <Navbar
            left={
                <View style={{ flexDirection: "row", alignItems: "center", gap: sp(12) }}>
                    <Image
                        source={require("../../assets/images/logoFaceAttend-Minimalista.png")}
                        style={{ width: sp(44), height: sp(44) }}
                    />
                    <Text style={[T.brandName, { color: Colors.text }]}>
                        FaceAttend{" "}
                        <Text style={{ color: Colors.primary }}>EDU</Text>
                    </Text>
                </View>
            }
            right={
                <Image
                    source={require("../../assets/images/logo(Antiguo)FaceAttend.png")}
                    style={{ width: sp(42), height: sp(42) }}
                />
            }
        />
    );
}

// ─── Footer ────────────────────────────────────────────────

function Footer() {
    const { fs } = useResponsive();
    const T = getTypography(fs);
    const insets = useSafeAreaInsets();

    return (
        <View style={{
            paddingVertical: insets.bottom + 10,
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            backgroundColor: Colors.surface,
        }}>
            <Text style={[T.caption, { color: Colors.muted }]}>
                © FaceAttend EDU {new Date().getFullYear()} — Derechos reservados
            </Text>
        </View>
    );
}

// ─── MAIN ──────────────────────────────────────────────────

export default function LandingPage() {
    const entrance = useHeroEntrance();
    const { sp, isSmall } = useResponsive();

    const hero = <HeroContent {...entrance} />;

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
                <AppNavbar />

                {/* Siempre scroll para que la sección de features sea accesible */}
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero — ocupa toda la altura visible */}
                    <View style={{
                        minHeight: isSmall ? undefined : sp(560),
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: sp(isSmall ? 40 : 0),
                        paddingBottom: sp(isSmall ? 24 : 0),
                    }}>
                        {hero}
                    </View>

                    {/* Features */}
                    <FeaturesSection />

                    {/* Footer */}
                    <Footer />
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
});
