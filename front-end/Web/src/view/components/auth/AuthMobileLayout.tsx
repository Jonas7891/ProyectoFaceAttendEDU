// ============================================================
//  FaceAttend EDU — AuthMobileLayout (View Layer)
//  Layout compartido para las pantallas de auth en MÓVIL.
//
//  Envuelve el contenido en SafeArea + KeyboardAvoiding + ScrollView
//  con el encabezado de logo estándar. Evita duplicar este bloque
//  en LoginView y SignupView.
//
//  MVVM: componente puro de View. Sin lógica de negocio.
// ============================================================

import React from "react";
import {
    View, Text, Image,
    KeyboardAvoidingView, Platform, ScrollView,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useTheme";

interface AuthMobileLayoutProps {
    title:    string;
    subtitle: string;
    children: React.ReactNode;
}

export default function AuthMobileLayout({
    title,
    subtitle,
    children,
}: AuthMobileLayoutProps) {
    const { theme } = useTheme();
    const c         = theme.colors;

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: c.background.surface }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: "center",
                            paddingHorizontal: 28,
                            paddingVertical: 40,
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Logo + nombre */}
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 36 }}>
                            <Image
                                source={require("../../../assets/images/logoFaceAttend-Minimalista.png")}
                                style={{ width: 44, height: 44 }}
                                resizeMode="contain"
                            />
                            <Text style={{ fontSize: 20, fontWeight: "700", color: c.text.primary }}>
                                FaceAttend{" "}
                                <Text style={{ color: c.brand.primary }}>EDU</Text>
                            </Text>
                        </View>

                        {/* Título + subtítulo */}
                        <Text style={{
                            fontSize: 30, fontWeight: "800",
                            color: c.text.primary,
                            marginBottom: 6, letterSpacing: -0.5,
                        }}>
                            {title}
                        </Text>
                        <Text style={{
                            fontSize: 15, color: c.text.secondary,
                            marginBottom: 32, lineHeight: 22,
                        }}>
                            {subtitle}
                        </Text>

                        {children}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}
