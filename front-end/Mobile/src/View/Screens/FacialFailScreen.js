import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreLanguageForRole } from "../components/common/languageByRole";
import { useTheme } from '../components/common/ThemeContext';
import PrimaryButton from "../components/auth/PrimaryButton";
import { QuestionnaireModal } from "../components/common/QuestionnaireModal";
import { FacialUpdateModal } from "../components/common/FacialUpdateModal";
import CustomLogo from "../components/auth/logo";
import styles from "./Style";

export default function FacialFail() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, loadThemeForRole } = useTheme();
    const [refreshKey, setRefreshKey] = useState(0);
    const [userRole, setUserRole] = useState(null);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [showFacialUpdate, setShowFacialUpdate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ─── Inicialización ──────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
            setUserRole(role);
            await loadThemeForRole(role);
            await restoreLanguageForRole(role);
        };
        init();

        const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

    const handleBack = () => navigation.goBack(); // ✅ quitado setIsLoading innecesario

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.safeAreaFacialFail, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerstyle={styles.scrollContent}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardview}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container} marginHorizontal={10}>

                            {/* Header */}
                            <View style={styles.headerContainer}>
                                <Text style={[styles.mainTitle, { color: colors.text }]}>
                                    {t('facialFail.title')}
                                </Text>
                                <CustomLogo
                                    size="small"
                                    rounded={true}
                                    backgroundColor="#000000"
                                    marginBottom={-2}
                                />
                            </View>

                            {/* Subtítulo */}
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {t('facialFail.subtitle')}
                            </Text>

                            {/* Opción 1 — Cuestionario */}
                            <TouchableOpacity
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.cardBorder,
                                        borderWidth: 1,
                                    }
                                ]}
                                onPress={() => setShowQuestionnaire(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    {t('facialFail.questionnaire')}
                                </Text>
                                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                                    {t('facialFail.questionnaireDescription')}
                                </Text>
                            </TouchableOpacity>

                            {/* Opción 2 — Actualizar parámetros */}
                            <TouchableOpacity
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.cardBorder,
                                        borderWidth: 1,
                                    }
                                ]}
                                onPress={() => setShowFacialUpdate(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    {t('facialFail.updateParams')}
                                </Text>
                                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                                    {t('facialFail.updateParamsDescription')}
                                </Text>
                            </TouchableOpacity>

                            {/* Separador */}
                            <View style={[styles.separator, { backgroundColor: colors.separator }]} />

                            {/* Recomendaciones */}
                            <Text style={[styles.recommendationsTitle, { color: colors.text }]}>
                                {t('facialFail.recommendations')}
                            </Text>

                            <View>
                                <Text style={[styles.recommendationSubtitle, { color: colors.text }]}>
                                    {t('facialFail.cameraQuality')}
                                </Text>
                                <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
                                    {t('facialFail.cameraQualityDescription')}
                                </Text>
                            </View>

                            {/* Botón Volver */}
                            <View style={[styles.buttonContainer, { marginTop: 30 }]}>
                                <PrimaryButton
                                    title={t('consultJustify.back')}
                                    onPress={handleBack}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </ScrollView>

            <QuestionnaireModal
                visible={showQuestionnaire}
                onClose={() => setShowQuestionnaire(false)}
                onSuccess={() => console.log("Cuestionario completado")}
            />

            <FacialUpdateModal
                visible={showFacialUpdate}
                onClose={() => setShowFacialUpdate(false)}
                onSuccess={() => console.log("Parámetros actualizados")}
            />
        </SafeAreaView>
    );
}