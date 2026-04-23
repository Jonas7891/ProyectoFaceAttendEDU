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
import PrimaryButton from "../Components/Auth/PrimaryButton";
import styles from "./Style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole } from "../Components/Common/languageByRole";

export default function TakePhotoScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [refreshKey, setRefreshKey] = useState(0);
    const [facialParamsRegistered, setFacialParamsRegistered] = useState(false);

    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
            setUserRole(role);

            await restoreLanguageForRole(role);
        };
        init();

        const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

    const handleFacialParams = () => {
        // Simulación de ingreso de parámetros faciales
        console.log("Ingresando parámetros faciales...");

        setFacialParamsRegistered(true);

        // El estado hover se mantiene por 2 segundos
        setTimeout(() => {
            setFacialParamsRegistered(false);
        }, 2000);
    };

    const handleMenu = () => {
        navigation.navigate("Menu");
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.scrollViewContent}
                    bounces={true}
                    alwaysBounceVertical={true}
                >
                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 100
                    }}>
                        <View style={styles.imagePhoto}>
                            <Image
                                source={require("../../assets/images/perfil-del-usuario.png")}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>
                                {t('takePhoto.title')}
                            </Text>
                        </View>

                        <Text style={styles.instructionText}>
                            {t('takePhoto.instructions')}
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.registerButton,
                                facialParamsRegistered && styles.registerButtonSuccess,
                            ]}
                            onPress={handleFacialParams}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <Image
                                    source={require("../../assets/images/fotografia.png")}
                                    style={styles.icon}
                                />
                                <Text style={styles.registerButtonText}>
                                    {facialParamsRegistered
                                        ? t('takePhoto.facialParamsRegistered')
                                        : t('takePhoto.registerFacialParams')
                                    }
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleMenu}
                            style={styles.settingsContainer}
                            activeOpacity={0.7}
                        >
                            <View style={styles.settingsContent}>
                                <Image
                                    source={require("../../assets/images/configuraciones.png")}
                                    style={styles.settingsIcon}
                                />
                            </View>
                            <Text style={styles.settingsText}>{t('updatePhoto.settings')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botón Volver */}
                    <View style={styles.buttonContainer} marginTop={50}>
                        <PrimaryButton title={t('consultJustify.back')} onPress={handleBack} />
                    </View>

                    <View style={styles.footer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}