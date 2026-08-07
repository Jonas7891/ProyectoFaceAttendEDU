import React, { useState, useEffect } from 'react';
import {
    Modal,
    Text,
    View,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';
import { useCustomAlert } from './useCustomAlert';
import CustomAlert from './CustomAlert';
import PrimaryButton from '../auth/PrimaryButton';
import stylesCommon from './style/Style';

export default function ProfileUpdateModal({ userInfo = {} }) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { alertConfig, hideAlert, showSuccess, showError } = useCustomAlert();

    const [isProfileModalVisible, setProfileModalVisible] = useState(false);
    const [name, setName] = useState(userInfo?.name || '');
    const [email, setEmail] = useState(userInfo?.email || '');
    const [phone, setPhone] = useState(userInfo?.phone || '');
    const [profileError, setProfileError] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        if (isProfileModalVisible) {
            setName(userInfo?.name || '');
            setEmail(userInfo?.email || '');
            setPhone(userInfo?.phone || '');
        }
    }, [isProfileModalVisible, userInfo]);

    const resetProfileForm = () => {
        setName(userInfo?.name || '');
        setEmail(userInfo?.email || '');
        setPhone(userInfo?.phone || '');
        setProfileError('');
        setProfileLoading(false);
    };

    const openProfileModal = () => {
        resetProfileForm();
        setProfileModalVisible(true);
    };

    const closeProfileModal = () => {
        setProfileModalVisible(false);
        resetProfileForm();
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleProfileUpdate = async () => {
        setProfileError('');

        if (!name.trim() || !email.trim() || !phone.trim()) {
            setProfileError(t('profile.profileModal.errorRequired', 'Completa todos los campos'));
            return;
        }

        if (!validateEmail(email)) {
            setProfileError(t('profile.profileModal.errorEmail', 'Correo electrónico no válido'));
            return;
        }

        if (phone.length < 7) {
            setProfileError(t('profile.profileModal.errorPhone', 'Teléfono debe tener al menos 7 dígitos'));
            return;
        }

        try {
            setProfileLoading(true);
            // Simular petición al servidor
            await new Promise((resolve) => setTimeout(resolve, 800));
            setProfileLoading(false);
            showSuccess(
                t('profile.profileModal.successTitle', 'Perfil actualizado'),
                t('profile.profileModal.successMessage', 'Tu información ha sido actualizada correctamente')
            );
            closeProfileModal();
        } catch (error) {
            setProfileLoading(false);
            showError(t('profile.profileModal.errorGeneric', 'No se pudo actualizar. Intenta de nuevo.'));
        }
    };

    return (
        <>
            {/* ── Trigger button ── */}
            <TouchableOpacity
                style={[stylesCommon.passwordSettingsButton, { backgroundColor: colors.card }]}
                onPress={openProfileModal}
                activeOpacity={0.75}
            >
                <View style={{ flex: 1 }}>
                    <Text style={[stylesCommon.passwordSettingsTitle, { color: colors.text }]}>
                        {t('profile.profileModal.editTitle', 'Editar información personal')}
                    </Text>
                </View>
                <Text style={{ fontSize: 20, color: colors.textSecondary, marginLeft: 4 }}>›</Text>
            </TouchableOpacity>

            {/* ── Modal ── */}
            <Modal
                visible={isProfileModalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeProfileModal}
            >
                <KeyboardAvoidingView
                    style={stylesCommon.modalWrapper}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={stylesCommon.modalWrapper}>
                            <ScrollView
                                contentContainerStyle={stylesCommon.modalScrollContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={[
                                    stylesCommon.passwordModalCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.border ?? colors.textSecondary + '50',
                                    },
                                ]}>
                                    <Text style={[stylesCommon.passwordModalTitle, { color: colors.text }]}>
                                        {t('profile.profileModal.editTitle', 'Editar información personal')}
                                    </Text>
                                    <Text style={[stylesCommon.passwordModalDescription, { color: colors.textSecondary }]}>
                                        {t('profile.profileModal.help', 'Actualiza tu información de perfil.')}
                                    </Text>

                                    <View style={[
                                        stylesCommon.passwordModalDivider,
                                        { backgroundColor: colors.border ?? colors.textSecondary + '30' },
                                    ]} />

                                    {/* Inputs */}
                                    <TextInput
                                        style={[stylesCommon.passwordModalInput, {
                                            borderColor: colors.border ?? colors.textSecondary + '50',
                                            color: colors.text,
                                            backgroundColor: colors.background,
                                        }]}
                                        placeholder={t('profile.profileModal.namePlaceholder', 'Nombre completo')}
                                        placeholderTextColor={colors.textSecondary}
                                        value={name}
                                        onChangeText={setName}
                                    />
                                    <TextInput
                                        style={[stylesCommon.passwordModalInput, {
                                            borderColor: colors.border ?? colors.textSecondary + '50',
                                            color: colors.text,
                                            backgroundColor: colors.background,
                                        }]}
                                        placeholder={t('profile.profileModal.emailPlaceholder', 'Correo electrónico')}
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="email-address"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                    <TextInput
                                        style={[stylesCommon.passwordModalInput, {
                                            borderColor: colors.border ?? colors.textSecondary + '50',
                                            color: colors.text,
                                            backgroundColor: colors.background,
                                        }]}
                                        placeholder={t('profile.profileModal.phonePlaceholder', 'Teléfono')}
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="phone-pad"
                                        value={phone}
                                        onChangeText={setPhone}
                                    />

                                    {/* Error */}
                                    {profileError ? (
                                        <View style={[
                                            stylesCommon.passwordModalErrorRow,
                                            {
                                                backgroundColor: colors.error + '12',
                                                borderColor: colors.error + '35',
                                            },
                                        ]}>
                                            <Text style={[stylesCommon.passwordModalError, { color: colors.error }]}>
                                                {profileError}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Botones */}
                                    <View style={stylesCommon.passwordModalButtons}>
                                        <View style={{ width: '100%' }}>
                                            <PrimaryButton
                                                title={
                                                    profileLoading
                                                        ? t('profile.profileModal.saving', 'Guardando...')
                                                        : t('profile.profileModal.saveButton', 'Guardar cambios')
                                                }
                                                onPress={handleProfileUpdate}
                                                disabled={profileLoading}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={closeProfileModal}
                                            style={stylesCommon.passwordModalCancelButton}
                                        >
                                            <Text style={[stylesCommon.passwordModalCancelText, { color: colors.primary }]}>
                                                {t('profile.profileModal.cancel', 'Cancelar')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
                type={alertConfig.type}
            />
        </>
    );
}
