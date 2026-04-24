import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreLanguageForRole } from "../components/common/languageByRole"; // ✅ corregido
import { useTheme } from "../components/common/ThemeContext";                  // ✅
import PrimaryButton from "../components/auth/PrimaryButton";
import styles from "./Style";

export default function TakePhotoScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, theme, loadThemeForRole } = useTheme(); // ✅

    const [refreshKey, setRefreshKey]                         = useState(0);
    const [userRole, setUserRole]                             = useState(null); // ✅ declarado
    const [facialParamsRegistered, setFacialParamsRegistered] = useState(false);

    // ─── Inicialización ──────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
            setUserRole(role);
            await loadThemeForRole(role);        // ✅
            await restoreLanguageForRole(role);  // ✅
        };
        init();

        const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

    const handleFacialParams = () => {
        setFacialParamsRegistered(true);
        setTimeout(() => setFacialParamsRegistered(false), 2000);
    };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

            <StatusBar
                barStyle={theme === "dark" ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={[styles.keyboardView, { backgroundColor: colors.background }]}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollViewContent, { backgroundColor: colors.background }]}
                    style={{ backgroundColor: colors.background }}
                    bounces={true}
                    alwaysBounceVertical={true}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 100,
                        backgroundColor: colors.background,
                    }}>
                        {/* Imagen */}
                        <View style={[styles.imagePhoto, { backgroundColor: colors.card }]}>
                            <Image
                                source={require("../../assets/images/perfil-del-usuario.png")}
                                style={[styles.image, { tintColor: colors.textMuted }]}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Título */}
                        <View style={styles.header}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>
                                {t('takePhoto.title')}
                            </Text>
                        </View>

                        {/* Descripción */}
                        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
                            {t('takePhoto.instructions')}
                        </Text>

                        {/* Botón registrar */}
                        <TouchableOpacity
                            style={[
                                styles.registerButton,
                                { backgroundColor: facialParamsRegistered ? colors.novedadSuccess : colors.primary },
                            ]}
                            onPress={handleFacialParams}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <Image
                                    source={require("../../assets/images/fotografia.png")}
                                    style={[styles.icon, { tintColor: "#FFFFFF" }]}
                                />
                                <Text style={[styles.registerButtonText, { color: "#FFFFFF" }]}>
                                    {facialParamsRegistered
                                        ? t('takePhoto.facialParamsRegistered')
                                        : t('takePhoto.registerFacialParams')
                                    }
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Configuración */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Menu")}
                            style={styles.settingsContainer}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.settingsContent, { backgroundColor: colors.card }]}>
                                <Image
                                    source={require("../../assets/images/configuraciones.png")}
                                    style={[styles.settingsIcon, { tintColor: colors.text }]}
                                />
                            </View>
                            <Text style={[styles.settingsText, { color: colors.text }]}>
                                {t('updatePhoto.settings')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botón Volver */}
                    <View style={[styles.buttonContainer, { marginTop: 50, marginHorizontal: 20 }]}>
                        <PrimaryButton
                            title={t('consultJustify.back')}
                            onPress={() => navigation.goBack()}
                        />
                    </View>

                    <View style={styles.footer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}