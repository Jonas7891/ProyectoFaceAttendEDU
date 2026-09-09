import React from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../components/common/ThemeContext';
import PrimaryButton from '../components/auth/PrimaryButton';
import {QuestionnaireModal} from '../components/common/QuestionnaireModal';
import {FacialUpdateModal} from '../components/common/FacialUpdateModal';
import CustomLogo from '../components/common/logo';
import CustomAlert from '../components/common/CustomAlert';
import styles from './Style';
import {useFacialFailViewModel} from '../../viewmodels/useFacialFailScreenViewModel';

export default function FacialFail() {
    const { t } = useTranslation();
    const { colors } = useTheme();

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
        alertConfig,
        hideAlert,
    } = useFacialFailViewModel();

    return (
        <SafeAreaView
            style={[styles.safeAreaFacialFail, { backgroundColor: colors.background }]}
            key={`${updateKey}`}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardview}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container} marginHorizontal={20}>
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

                            <View style={[styles.buttonContainer, { marginTop: 10 }]}>
                                <PrimaryButton
                                    title={t('common.back')}
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

            <CustomAlert
                {...alertConfig}
                onDismiss={hideAlert}
            />
        </SafeAreaView>
    );
}