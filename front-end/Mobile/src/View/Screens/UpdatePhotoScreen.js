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
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { QuestionInput } from "../Components/Common/QuestionInput";
import PrimaryButton from "../Components/Auth/PrimaryButton";
import styles from "./Style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole } from "../Components/Common/languageByRole";

export default function UpdatePhoto() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [refreshKey, setRefreshKey] = useState(0);
    const [attendanceRegistered, setAttendanceRegistered] = useState(false);

    const [formData, setFormData] = useState({
        nombreCompleto: "",
        documento: "",
        telefono: ""
    });

    // CORREGIDO: El useEffect estaba mal escrito
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

    const handleInputChange = (field, value) => {
        setFormData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const handleRegisterAttendance = () => {
        if (!formData.nombreCompleto || !formData.documento || !formData.telefono) {
            Alert.alert(
                t('updatePhoto.error', { defaultValue: 'Error' }),
                t('updatePhoto.completeFields', { defaultValue: 'Por favor, complete todos los campos' })
            );
            return;
        }

        console.log("Datos del usuario:", formData);
        setAttendanceRegistered(true);
    };

    const handleMenu = () => {
        navigation.navigate("Menu");
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container} key={refreshKey}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                    bounces={true}
                    alwaysBounceVertical={true}
                >
                    <View>
                        <Text>{"\n"}</Text>
                    </View>

                    <View style={styles.imagePhoto}>
                        <Image
                            source={require("../../assets/images/perfil-del-usuario.png")}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>
                            {t('updatePhoto.title', { defaultValue: 'Actualizar Foto' })}
                        </Text>
                    </View>

                    <Text style={styles.instructionText}>
                        {t('updatePhoto.instructions', { defaultValue: 'Complete los siguientes datos para actualizar su foto' })}
                    </Text>

                    <View style={styles.formSection}>
                        <Text style={styles.formTitle}>
                            {t('updatePhoto.personalInfo', { defaultValue: 'Información Personal' })}
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                {t('updatePhoto.fullName', { defaultValue: 'Nombre Completo' })}
                            </Text>
                            <QuestionInput
                                placeholder={t('updatePhoto.fullNamePlaceholder', { defaultValue: 'Ej: Juan Pérez' })}
                                value={formData.nombreCompleto}
                                onChangeText={(value) => handleInputChange("nombreCompleto", value)}
                                keyboardType="default"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                {t('updatePhoto.documentNumber', { defaultValue: 'Número de Documento' })}
                            </Text>
                            <QuestionInput
                                placeholder={t('updatePhoto.documentPlaceholder', { defaultValue: 'Ej: 12345678' })}
                                value={formData.documento}
                                onChangeText={(value) => handleInputChange("documento", value)}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>
                                {t('updatePhoto.phoneNumber', { defaultValue: 'Número de Teléfono' })}
                            </Text>
                            <QuestionInput
                                placeholder={t('updatePhoto.phonePlaceholder', { defaultValue: 'Ej: 3001234567' })}
                                value={formData.telefono}
                                onChangeText={(value) => handleInputChange("telefono", value)}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.registerButton,
                            attendanceRegistered && styles.registerButtonSuccess,
                        ]}
                        onPress={handleRegisterAttendance}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <Image
                                source={require("../../assets/images/fotografia.png")}
                                style={styles.icon}
                            />
                            <Text style={styles.registerButtonText}>
                                {attendanceRegistered
                                    ? t('updatePhoto.attendanceRegistered', { defaultValue: '¡Registro Exitoso!' })
                                    : t('updatePhoto.registerAttendance', { defaultValue: 'Registrar Asistencia' })
                                }
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View>
                        <Text>{"\n"}{"\n"}</Text>
                    </View>

                    {/* Botón Volver */}
                    <View style={styles.buttonContainer}>
                        <PrimaryButton title={t('consultJustify.back')} onPress={handleBack} />
                    </View>

                    <View style={styles.footer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}