import React from "react";
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

import Navbar from "@/components/own_components/layout/Navbar";
import HeroLeft from "@/components/own_components/hero/HeroLeft";
import HeroRight from "@/components/own_components/hero/HeroRight";
import { useHeroEntrance } from "@/components/hooks/useHeroEntrance";
import { useResponsive } from "@/components/hooks/useResponsive";
import { getTypography } from "@/components/constants/typography";
import BadgePositions, { BadgePositionsMobile } from "@/components/constants/badgePositions";
import Colors from "@/components/constants/colors";

// ─── Datos ─────────────────────────────────────────────────────

const STATS = [
    { value: "99%", label: "Precisión" },
    { value: "<1s", label: "Detección" },
    { value: "∞", label: "Estudiantes" },
];

// ─── HeroContent (SOLO layout, NO centrado vertical) ───────────

function HeroContent({
                         fadeLeft,
                         slideLeft,
                         fadeRight,
                         slideRight,
                     }: ReturnType<typeof useHeroEntrance>) {

    const { sp, isSmall } = useResponsive();

    
    const badgePos = isSmall ? BadgePositionsMobile : BadgePositions;

    const BADGES = [
        { label: "Reconociendo", icon: "✅", delay: 0, style: badgePos.topLeft },
        { label: "Escaneando…", icon: "📷", delay: 400, style: badgePos.topRight },
        { label: "Asistencia OK", icon: "📋", delay: 800, style: badgePos.bottom },
    ];

    return (
        <View
            style={{
                flexDirection: isSmall ? "column" : "row",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: sp(isSmall ? 24 : 64),
                gap: sp(isSmall ? 80 : 40),
                width: "100%",
            }}
        >
            <HeroLeft
                fadeLeft={fadeLeft}
                slideLeft={slideLeft}
                title={"Asistencia\n"}
                accent={"inteligente\n"}
                end="para tu institución"
                primary="Registrarse"
                secondary="Iniciar sesión"
                stats={STATS}
            />

            <HeroRight
                fadeRight={fadeRight}
                slideRight={slideRight}
                badges={BADGES}
            />
        </View>
    );
}

// ─── Navbar ────────────────────────────────────────────────────

function AppNavbar() {
    const { sp, fs } = useResponsive();
    const T = getTypography(fs);

    return (
        <Navbar
            left={
                <View style={{ flexDirection: "row", alignItems: "center", gap: sp(12) }}>
                    <Image
                        source={require("../assets/images/logoFaceAttend-Minimalista.png")}
                        style={{ width: sp(60), height: sp(60) }}
                    />
                    <Text style={[T.brandName, { color: Colors.text }]}>
                        FaceAttend EDU
                    </Text>
                </View>
            }
            right={
                <Image
                    source={require("../assets/images/logo(Antiguo)FaceAttend.png")}
                    style={{ width: sp(50), height: sp(50) }}
                />
            }
        />
    );
}

// ─── Footer ────────────────────────────────────────────────────

function Footer() {
    const { fs } = useResponsive();
    const T = getTypography(fs);
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                paddingVertical: insets.bottom+8,
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: Colors.border,
                backgroundColor: Colors.surface,
            }}
        >
            <Text style={[T.caption, { color: Colors.muted }]}>
                © FaceAttend EDU {new Date().getFullYear()} - Derechos reservados
            </Text>
        </View>
    );
}

export default function LandingPage() {

    const entrance = useHeroEntrance();
    const { sp, isSmall } = useResponsive();

    const hero = <HeroContent {...entrance} />;

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container} edges={["top", "bottom"]}>

                <AppNavbar />

                {isSmall ? (
                    // MOBILE
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            paddingBottom: sp(72),
                        }}
                        showsVerticalScrollIndicator={true}
                    >
                        {hero}
                    </ScrollView>
                ) : (
                    // DESKTOP (tamaños intermedios)
                    <View
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            paddingBottom: 52,
                        }}
                    >
                        <View
                            style={{
                                width: "100%",
                                maxWidth: 1280,
                                flex: 1,
                                justifyContent: "center", //asegura el centrado interno
                            }}
                        >
                            {hero}
                        </View>
                    </View>
                )}

                <Footer />

            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg,
    },
});