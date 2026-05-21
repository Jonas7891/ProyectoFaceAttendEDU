import React from 'react';
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { QuestionInput } from '../components/common/QuestionInput';
import PrimaryButton from '../components/auth/PrimaryButton';
import { useTheme } from '../components/common/ThemeContext';
import styles from './Style';
import { useUpdatePhotoViewModel } from '../../viewmodels/useUpdatePhotoViewModel';

export default function UpdatePhoto() {
    const { t } = useTranslation();
    const { colors, theme } = useTheme();

    const {
        attendanceRegistered,
        updateKey,
        formData,
        handleInputChange,
        handleRegisterAttendance,
        handleBack,
    } = useUpdatePhotoViewModel();

    // Estilos dinámicos (solo dependen de colors/theme)
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
            fontWeight: 'bold',
            textAlign: 'center',
            color: colors.text,
            marginTop: 10,
        },
        instructionTextUpdatePhoto: {
            textAlign: 'center',
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
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 15,
        },
        inputLabelUpdatePhoto: {
            color: colors.text,
            marginBottom: 5,
            fontSize: 14,
            fontWeight: '500',
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
            backgroundColor: '#2da351',
            padding: 12,
            borderRadius: 10,
            marginTop: 20,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            marginHorizontal: 'auto',
        },
    };

    return (
        <SafeAreaView
            style={[styles.safeAreaUpdatePhoto, dynamicStyles.safeAreaUpdatePhoto]}
            key={`${updateKey}`}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingViewUpdatePhoto}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContentUpdatePhoto}
                >
                    <View style={[styles.mainContainerUpdatePhoto, { marginTop: Platform.OS === "ios" ? 0 : 50 }]}>
                        {/* Imagen de perfil */}
                        <View style={styles.imageContainerUpdatePhoto}>
                            <Image
                                source={require('../../assets/images/perfil-del-usuario.png')}
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

                            <View style={styles.inputFieldContainerUpdatePhoto}>
                                <Text style={[styles.inputLabelUpdatePhoto, dynamicStyles.inputLabelUpdatePhoto]}>
                                    {t('updatePhoto.fullName')}
                                </Text>
                                <QuestionInput
                                    placeholder={t('updatePhoto.fullNamePlaceholder')}
                                    value={formData.nombreCompleto}
                                    onChangeText={(value) => handleInputChange('nombreCompleto', value)}
                                    keyboardType="default"
                                    style={dynamicStyles.questionInputUpdatePhoto}
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <View style={styles.inputFieldContainerUpdatePhoto}>
                                <Text style={[styles.inputLabelUpdatePhoto, dynamicStyles.inputLabelUpdatePhoto]}>
                                    {t('updatePhoto.documentNumber')}
                                </Text>
                                <QuestionInput
                                    placeholder={t('updatePhoto.documentPlaceholder')}
                                    value={formData.documento}
                                    onChangeText={(value) => handleInputChange('documento', value)}
                                    keyboardType="numeric"
                                    style={dynamicStyles.questionInputUpdatePhoto}
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <View style={styles.inputFieldContainerUpdatePhoto}>
                                <Text style={[styles.inputLabelUpdatePhoto, dynamicStyles.inputLabelUpdatePhoto]}>
                                    {t('updatePhoto.phoneNumber')}
                                </Text>
                                <QuestionInput
                                    placeholder={t('updatePhoto.phonePlaceholder')}
                                    value={formData.telefono}
                                    onChangeText={(value) => handleInputChange('telefono', value)}
                                    keyboardType="phone-pad"
                                    style={dynamicStyles.questionInputUpdatePhoto}
                                    placeholderTextColor={colors.textMuted}
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.registerButtonUpdatePhoto,
                                    dynamicStyles.registerButtonUpdatePhoto,
                                    attendanceRegistered && styles.registerButtonSuccessUpdatePhoto,
                                ]}
                                onPress={handleRegisterAttendance}
                            >
                                <Image
                                    source={require('../../assets/images/fotografia.png')}
                                    style={styles.registerButtonIconUpdatePhoto}
                                />
                                <Text style={styles.registerButtonTextUpdatePhoto}>
                                    {attendanceRegistered
                                        ? t('updatePhoto.attendanceRegistered')
                                        : t('updatePhoto.registerAttendance')}
                                </Text>
                            </TouchableOpacity>
                        </View>

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