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
    Keyboard
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../Components/Auth/PrimaryButton";
import { QuestionnaireModal } from "../../Components/Common/QuestionnaireModal";
import { FacialUpdateModal } from "../../Components/Common/FacialUpdateModal";
import CustomLogo from "../../Components/Auth/logo";
import styles from "../Style/Style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole } from "../../Components/Common/languageByRole";

export default function FacialFail() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [refreshKey, setRefreshKey] = useState(0);
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [showFacialUpdate, setShowFacialUpdate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleQuestionnaire = () => {
        setShowQuestionnaire(true);
    };

    const handleFacialUpdate = () => {
        setShowFacialUpdate(true);
    };

    const handleBack = () => {
        setIsLoading(true);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeAreaFacialFail}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.mainTitle}>
                                    {t('facialFail.title')}
                                </Text>
                                <CustomLogo
                                    size="small"
                                    rounded={true}
                                    backgroundColor="#000000"
                                    marginBottom={20}
                                />
                            </View>

                            <Text style={styles.subtitle}>
                                {t('facialFail.subtitle')}
                            </Text>

                            <TouchableOpacity
                                style={styles.optionCard}
                                onPress={handleQuestionnaire}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.optionTitle}>{t('facialFail.questionnaire')}</Text>
                                <Text style={styles.optionDescription}>
                                    {t('facialFail.questionnaireDescription')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.optionCard}
                                onPress={handleFacialUpdate}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.optionTitle}>{t('facialFail.updateParams')}</Text>
                                <Text style={styles.optionDescription}>
                                    {t('facialFail.updateParamsDescription')}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.separator} />

                            <Text style={styles.recommendationsTitle}>
                                {t('facialFail.recommendations')}
                            </Text>

                            <View style={styles.recommendationCard}>
                                <Text style={styles.recommendationSubtitle}>
                                    {t('facialFail.cameraQuality')}
                                </Text>
                                <Text style={styles.recommendationText}>
                                    {t('facialFail.cameraQualityDescription')}
                                </Text>
                            </View>

                            <PrimaryButton
                                title={isLoading ? t('facialFail.returningToMenu') : t('facialFail.backToMenu')}
                                onPress={handleBack}
                                isLoading={isLoading}
                            />
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
