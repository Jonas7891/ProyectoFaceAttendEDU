import React from 'react';
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { useTheme } from '../components/common/ThemeContext';
import PrimaryButton from '../components/auth/PrimaryButton';
import { QuestionnaireModal } from '../components/common/QuestionnaireModal';
import { FacialUpdateModal } from '../components/common/FacialUpdateModal';
import CustomLogo from '../components/common/logo';
import styles from './Style';
import { useFacialFailViewModel } from '../../viewmodels/useFacialFailScreenViewModel';

export default function FacialFail() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const refreshKey = useLanguageRefresh();

    const {
        updateKey,
        showQuestionnaire,
        showFacialUpdate,
        handleBack,
        openQuestionnaire,
        closeQuestionnaire,
        openFacialUpdate,
        closeFacialUpdate,
        handleQuestionnaireSuccess,
        handleFacialUpdateSuccess,
    } = useFacialFailViewModel();

    return (
        <SafeAreaView
            style={[styles.safeAreaFacialFail, { backgroundColor: colors.background }]}
            key={`${refreshKey}-${updateKey}`}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardview}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container} marginHorizontal={10}>
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

                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                {t('facialFail.subtitle')}
                            </Text>

                            {/* Tarjeta de Cuestionario */}
                            <TouchableOpacity
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.cardBorder,
                                        borderWidth: 1,
                                    },
                                ]}
                                onPress={openQuestionnaire}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    {t('facialFail.questionnaire')}
                                </Text>
                                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                                    {t('facialFail.questionnaireDescription')}
                                </Text>
                            </TouchableOpacity>

                            {/* Tarjeta de Actualización Facial */}
                            <TouchableOpacity
                                style={[
                                    styles.optionCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.cardBorder,
                                        borderWidth: 1,
                                    },
                                ]}
                                onPress={openFacialUpdate}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.optionTitle, { color: colors.text }]}>
                                    {t('facialFail.updateParams')}
                                </Text>
                                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                                    {t('facialFail.updateParamsDescription')}
                                </Text>
                            </TouchableOpacity>

                            <View style={[styles.separator, { backgroundColor: colors.separator }]} />

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

            {/* Modales */}
            <QuestionnaireModal
                visible={showQuestionnaire}
                onClose={closeQuestionnaire}
                onSuccess={handleQuestionnaireSuccess}
            />

            <FacialUpdateModal
                visible={showFacialUpdate}
                onClose={closeFacialUpdate}
                onSuccess={handleFacialUpdateSuccess}
            />
        </SafeAreaView>
    );
}