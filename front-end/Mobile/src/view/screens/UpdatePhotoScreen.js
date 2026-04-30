// UpdatePhotoScreen.js
import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { QuestionInput } from "../components/common/QuestionInput";
import PrimaryButton from "../components/auth/PrimaryButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { useTheme } from "../components/common/ThemeContext";
import styles from "./Style";

export default function UpdatePhoto() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const refreshKey = useLanguageRefresh();
    const { colors, theme, loadThemeForRole } = useTheme();

    const [attendanceRegistered, setAttendanceRegistered] = useState(false);
    const [updateKey, setUpdateKey] = useState(0);

    const [formData, setFormData] = useState({
        nombreCompleto: "",
        documento: "",
        telefono: ""
    });

    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
            if (role) {
                await loadThemeForRole(role);
            }
        };
        init();

        const handleLanguageChanged = () => {
            setUpdateKey(prev => prev + 1);
        };

        i18n.on('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleRegisterAttendance = () => {
        if (!formData.nombreCompleto || !formData.documento || !formData.telefono) {
            Alert.alert(
                t('updatePhoto.error'),
                t('updatePhoto.completeFields')
            );
            return;
        }

        setAttendanceRegistered(true);
    };

    const handleBack = () => navigation.goBack();

    const dynamicStyles = {
        safeAreaUpdatePhoto: {
            flex: 1,
            backgroundColor: colors.background,
        },
        profileImageUpdatePhoto: {
            width: 120,
            height: 120,
            tintColor: colors.text,
        },
        titleUpdatePhoto: {
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
            color: colors.text,
            marginTop: 10,
        },
        instructionTextUpdatePhoto: {
            textAlign: "center",
            color: colors.textMuted,
            marginVertical: 15,
        },
        formCardUpdatePhoto: {
            backgroundColor: colors.card,
            borderRadius: 15,
            padding: 20,
            borderWidth: theme === 'dark' ? 1 : 0,
            borderColor: colors.cardBorder,
        },
        formTitleUpdatePhoto: {
            fontSize: 18,
            fontWeight: "bold",
            color: colors.text,
            marginBottom: 15,
        },
        inputLabelUpdatePhoto: {
            color: colors.text,
            marginBottom: 5,
            fontSize: 14,
            fontWeight: "500",
        },
        questionInputUpdatePhoto: {
            backgroundColor: colors.inputBackground,
            color: colors.text,
            borderColor: colors.border || colors.separator,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
        },
        registerButtonUpdatePhoto: {
            backgroundColor: attendanceRegistered ? "#2da351" : colors.primary,
            padding: 15,
            borderRadius: 12,
            marginTop: 20,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
        },
    };

    return (
        <SafeAreaView style={[styles.safeAreaUpdatePhoto, dynamicStyles.safeAreaUpdatePhoto]} key={`${refreshKey}-${updateKey}`}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingViewUpdatePhoto}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContentUpdatePhoto}
                >
                    <View style={styles.mainContainerUpdatePhoto}>
                        {/* Imagen de perfil */}
                        <View style={styles.imageContainerUpdatePhoto}>
                            <Image
                                source={require("../../assets/images/perfil-del-usuario.png")}
                                style={[styles.profileImageUpdatePhoto, dynamicStyles.profileImageUpdatePhoto]}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Títulos */}
                        <Text style={[styles.titleUpdatePhoto, dynamicStyles.titleUpdatePhoto]}>
                            {t('updatePhoto.title')}
                        </Text>

                        <Text style={[styles.instructionTextUpdatePhoto, dynamicStyles.instructionTextUpdatePhoto]}>
                            {t('updatePhoto.instructions')}
                        </Text>

                        {/* Formulario */}
                        <View style={[styles.formCardUpdatePhoto, dynamicStyles.formCardUpdatePhoto]}>
                            <Text style={[styles.formTitleUpdatePhoto, dynamicStyles.formTitleUpdatePhoto]}>
                                {t('updatePhoto.personalInfo')}
                            </Text>

                            {/* Campo: Nombre Completo */}
                            <View style={styles.inputFieldContainerUpdatePhoto}>
                                <Text style={[styles.inputLabelUpdatePhoto, dynamicStyles.inputLabelUpdatePhoto]}>
                                    {t('updatePhoto.fullName')}
                                </Text>
                                <QuestionInput
                                    placeholder={t('updatePhoto.fullNamePlaceholder')}
                                    value={formData.nombreCompleto}
                                    onChangeText={(value) => handleInputChange("nombreCompleto", value)}
                                    keyboardType="default"
                                    style={dynamicStyles.questionInputUpdatePhoto}
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            {/* Campo: Número de Documento */}
                            <View style={styles.inputFieldContainerUpdatePhoto}>
                                <Text style={[styles.inputLabelUpdatePhoto, dynamicStyles.inputLabelUpdatePhoto]}>
                                    {t('updatePhoto.documentNumber')}
                                </Text>
                                <QuestionInput
                                    placeholder={t('updatePhoto.documentPlaceholder')}
                                    value={formData.documento}
                                    onChangeText={(value) => handleInputChange("documento", value)}
                                    keyboardType="numeric"
                                    style={dynamicStyles.questionInputUpdatePhoto}
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            {/* Campo: Número de Teléfono */}
                            <View style={styles.inputFieldContainerUpdatePhoto}>
                                <Text style={[styles.inputLabelUpdatePhoto, dynamicStyles.inputLabelUpdatePhoto]}>
                                    {t('updatePhoto.phoneNumber')}
                                </Text>
                                <QuestionInput
                                    placeholder={t('updatePhoto.phonePlaceholder')}
                                    value={formData.telefono}
                                    onChangeText={(value) => handleInputChange("telefono", value)}
                                    keyboardType="phone-pad"
                                    style={dynamicStyles.questionInputUpdatePhoto}
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>
                        </View>

                        {/* Botón de registro */}
                        <TouchableOpacity
                            style={[
                                styles.registerButtonUpdatePhoto,
                                dynamicStyles.registerButtonUpdatePhoto,
                                attendanceRegistered && styles.registerButtonSuccessUpdatePhoto,
                            ]}
                            onPress={handleRegisterAttendance}
                        >
                            <Image
                                source={require("../../assets/images/fotografia.png")}
                                style={styles.registerButtonIconUpdatePhoto}
                            />
                            <Text style={styles.registerButtonTextUpdatePhoto}>
                                {attendanceRegistered
                                    ? t('updatePhoto.attendanceRegistered')
                                    : t('updatePhoto.registerAttendance')}
                            </Text>
                        </TouchableOpacity>

                        {/* Botón de volver */}
                        <View style={styles.backButtonContainerUpdatePhoto}>
                            <PrimaryButton
                                title={t('consultJustify.back')}
                                onPress={handleBack}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}