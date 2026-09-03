import React from "react";
import { useNavigation } from "@react-navigation/native";
import { View, ScrollView, Image, Text } from "react-native";
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Navbar } from "../components/common/navigation/Navbar";
import { HeroLeft, HeroRight } from "../components/hero";

import { useHeroEntrance } from "../components/hooks/useHeroEntrance";
import { useResponsive }   from "../components/hooks/useResponsive";
import { useTheme }        from "../components/hooks/useTheme";
import { getTypography }   from "../../core/constants/typography";
import BadgePositions, { BadgePositionsMobile } from "../../core/constants/badgePositions";
import { useTranslation }  from "../../i18n/hooks/useTranslation";

// ── HeroContent ──────────────────────────────────────────────

function HeroContent(props) {
    const navigation      = useNavigation();
    const { sp, isSmall } = useResponsive();
    const { t }           = useTranslation();
    const badgePos        = isSmall ? BadgePositionsMobile : BadgePositions;

    const STATS = [
        { value: "99%", label: t("Precisión")   },
        { value: "<1s", label: t("Detección")   },
        { value: "∞",   label: t("estudiantes") },
    ];

    const BADGES = [
        { label: t("Reconociendo"),  icon: "✅", delay: 0,   style: badgePos.topLeft  },
        { label: t("Escaneando…"),   icon: "📷", delay: 0.2, style: badgePos.topRight },
        { label: t("Asistencia OK"), icon: "📋", delay: 0.4, style: badgePos.bottom   },
    ];

    return (
        <View style={{
            flexDirection: isSmall ? "column" : "row",
            alignItems: "center", justifyContent: "center",
            paddingHorizontal: sp(isSmall ? 24 : 32),
            gap: sp(isSmall ? 80 : 100),
            width: "100%",
        }}>
            <HeroLeft
                fadeLeft={props.fadeLeft}   slideLeft={props.slideLeft}
                title={t("Asistencia\n")}
                accent={t("inteligente\n")}
                end={t("para tu institución")}
                primary={t("Registrarse")}
                secondary={t("Iniciar sesión")}
                stats={STATS}
                onPrimary={()  => navigation.navigate("FaceAttendEDU-Register")}
                onSecondary={() => navigation.navigate("FaceAttendEDU-Login")}
            />
            <HeroRight fadeRight={props.fadeRight} slideRight={props.slideRight} badges={BADGES} />
        </View>
    );
}

// ── FeaturesSection ──────────────────────────────────────────

function FeaturesSection() {
    const { sp, fs, isSmall } = useResponsive();
    const { theme }           = useTheme();
    const { t }               = useTranslation();
    const c                   = theme.colors;
    const T                   = getTypography(fs);

    const FEATURES = [
        {
            icon: "aperture",
            title: t("Reconocimiento facial en tiempo real"),
            desc: t("Registra asistencia automáticamente con IA. Sin listas en papel, sin errores humanos."),
        },
        {
            icon: "bar-chart-2",
            title: t("Reportes y estadísticas detalladas"),
            desc: t("Analiza patrones de asistencia por curso, semana y estudiante. Exporta en PDF o Excel."),
        },
        {
            icon: "users",
            title: t("Gestión completa de estudiantes"),
            desc: t("Centraliza toda la información académica. Detecta estudiantes en riesgo de manera proactiva."),
        },
    ];

    return (
        <View style={{
            backgroundColor: c.brand.primary,
            paddingVertical: sp(48),
            paddingHorizontal: sp(isSmall ? 24 : 40),
            width: "100%",
        }}>
            <View style={{ alignItems: "center", marginBottom: sp(36) }}>
                <View style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    paddingHorizontal: sp(14), paddingVertical: sp(5),
                    borderRadius: 14, marginBottom: sp(12),
                }}>
                    <Text style={[T.eyebrow, { color: "rgba(255,255,255,0.85)", letterSpacing: 1.2 }]}>
                        {t("¿Por que no la puedes olvidar arboleda?")}
                    </Text>
                </View>
                <Text style={[T.heading1, { color: c.text.onBrand, textAlign: "center" }]}>
                    {t("Todo lo que necesitas en una sola plataforma")}
                </Text>
            </View>

            <View style={{
                flexDirection: isSmall ? "column" : "row",
                gap: sp(16), maxWidth: 1200, alignSelf: "center", width: "100%",
            }}>
                {FEATURES.map((f) => (
                    <View key={f.title} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.10)",
                        borderRadius: sp(14), padding: sp(24),
                        borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", gap: sp(12),
                    }}>
                        <View style={{
                            width: sp(44), height: sp(44), borderRadius: sp(12),
                            backgroundColor: "rgba(255,255,255,0.20)",
                            alignItems: "center", justifyContent: "center",
                        }}>
                            <Feather name={f.icon} size={sp(20)} color={c.text.onBrand} />
                        </View>
                        <Text style={[T.heading2, { color: c.text.onBrand, marginTop: sp(4) }]}>
                            {f.title}
                        </Text>
                        <Text style={[T.bodyMD, { color: "rgba(255,255,255,0.75)" }]}>
                            {f.desc}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

// ── AppNavbar ────────────────────────────────────────────────

function AppNavbar() {
    const { sp, fs } = useResponsive();
    const { theme }  = useTheme();
    const c          = theme.colors;
    const T          = getTypography(fs);

    return (
        <Navbar
            left={
                <View style={{ flexDirection: "row", alignItems: "center", gap: sp(12) }}>
                    <Image
                        source={require("../../assets/images/logoFaceAttend-Minimalista.png")}
                        style={{ width: sp(44), height: sp(44) }}
                    />
                    <Text style={[T.brandName, { color: c.text.primary }]}>
                        FaceAttend{" "}
                        <Text style={{ color: c.brand.primary }}>EDU</Text>
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

// ── Footer ───────────────────────────────────────────────────

function Footer() {
    const { fs }    = useResponsive();
    const { theme } = useTheme();
    const { t }     = useTranslation();
    const c         = theme.colors;
    const T         = getTypography(fs);
    const insets    = useSafeAreaInsets();

    return (
        <View style={{
            paddingVertical: insets.bottom + 10,
            alignItems: "center",
            borderTopWidth: 1, borderTopColor: c.border.primary,
            backgroundColor: c.background.surface,
        }}>
            <Text style={[T.caption, { color: c.text.secondary }]}>
                © FaceAttend EDU {new Date().getFullYear()} — {t("Derechos reservados")}
            </Text>
        </View>
    );
}

// ── LandingScreen ────────────────────────────────────────────

export default function LandingScreen() {
    const entrance    = useHeroEntrance();
    const { sp, isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;

    return (
        <SafeAreaProvider>
            <SafeAreaView
                style={{ flex: 1, backgroundColor: c.background.app }}
                edges={["top", "bottom"]}
            >
                <AppNavbar />
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{
                        minHeight: isSmall ? undefined : sp(560),
                        alignItems: "center", justifyContent: "center",
                        paddingVertical: sp(isSmall ? 40 : 60),
                        paddingBottom: sp(isSmall ? 24 : 32),
                    }}>
                        <HeroContent {...entrance} />
                    </View>
                    <FeaturesSection />
                    <Footer />
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
