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


export default function AuthMobileLayout({
    title,
    subtitle,
    children,
}) {
    const { theme } = useTheme();
    const c         = theme.colors;

    return (
        
            <SafeAreaView style={{ flex: 1, backgroundColor: c.background.surface }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow,
                            justifyContent: "center",
                            paddingHorizontal: 6, paddingVertical: 2,
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Logo + nombre */}
                        <View style={{ flexDirection: "row", alignItems: "center", gap, marginBottom: 36 }}>
                            <Image
                                source={require("../../../assets/images/logoFaceAttend-Minimalista.png")}
                                style={{ width, height: 44 }}
                                resizeMode="contain"
                            />
                            <Text style={{ fontSize: 10, fontWeight: "700", color: c.text.primary }}>
                                FaceAttend{" "}
                                <Text style={{ color: c.brand.primary }}>EDU</Text>
                            </Text>
                        </View>

                        {/* Título + subtítulo */}
                        <Text style={{
                            fontSize: 10, fontWeight: "800",
                            color: c.text.primary,
                            marginBottom, letterSpacing: -0.5,
                        }}>
                            {title}
                        </Text>
                        <Text style={{
                            fontSize: 11, color: c.text.secondary,
                            marginBottom, lineHeight,
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
