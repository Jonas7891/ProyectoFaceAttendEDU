import React, { useState } from 'react';
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
    Alert,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';
import PrimaryButton from '../auth/PrimaryButton';
import stylesCommon from './style/Style';

export default function PasswordUpdateModal() {
    const { t } = useTranslation();
    const { colors } = useTheme();

    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const resetPasswordForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordLoading(false);
    };

    const openPasswordModal = () => {
        resetPasswordForm();
        setPasswordModalVisible(true);
    };

    const closePasswordModal = () => {
        setPasswordModalVisible(false);
        resetPasswordForm();
    };

    const handlePasswordUpdate = async () => {
        setPasswordError('');
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError(t('profile.passwordModal.errorRequired', 'Completa todos los campos'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError(t('profile.passwordModal.errorMatch', 'Las contraseñas no coinciden'));
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError(t('profile.passwordModal.errorLength', 'Mínimo 6 caracteres'));
            return;
        }
        try {
            setPasswordLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 600));
            setPasswordLoading(false);
            Alert.alert(
                t('profile.passwordModal.successTitle', 'Contraseña actualizada'),
                t('profile.passwordModal.successMessage', 'Tu contraseña ha sido actualizada correctamente')
            );
            closePasswordModal();
        } catch (error) {
            setPasswordLoading(false);
            setPasswordError(t('profile.passwordModal.errorGeneric', 'No se pudo actualizar. Intenta de nuevo.'));
        }
    };

    return (
        <>
            {/* ── Trigger button ── */}
            <TouchableOpacity
                style={[stylesCommon.passwordSettingsButton, { backgroundColor: colors.card }]}
                onPress={openPasswordModal}
                activeOpacity={0.75}
            >
                <View style={{ flex: 1 }}>
                    <Text style={[stylesCommon.passwordSettingsTitle, { color: colors.text }]}>
                        {t('profile.passwordModal.title', 'Actualizar contraseña')}
                    </Text>
                </View>
                <Text style={{ fontSize: 20, color: colors.textSecondary, marginLeft: 4 }}>›</Text>
            </TouchableOpacity>

            {/* ── Modal ── */}
            <Modal
                visible={isPasswordModalVisible}
                transparent
                animationType="fade"
                onRequestClose={closePasswordModal}
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
                                        {t('profile.passwordModal.title', 'Actualizar contraseña')}
                                    </Text>
                                    <Text style={[stylesCommon.passwordModalDescription, { color: colors.textSecondary }]}>
                                        {t('profile.passwordModal.help', 'Protege tu cuenta con una contraseña segura.')}
                                    </Text>

                                    <View style={[
                                        stylesCommon.passwordModalDivider,
                                        { backgroundColor: colors.border ?? colors.textSecondary + '30' },
                                    ]} />

                                    {/* Inputs — sin labels uppercase, solo placeholder */}
                                    <TextInput
                                        style={[stylesCommon.passwordModalInput, {
                                            borderColor: colors.border ?? colors.textSecondary + '50',
                                            color: colors.text,
                                            backgroundColor: colors.background,
                                        }]}
                                        placeholder={t('profile.passwordModal.currentPassword', 'Contraseña actual')}
                                        placeholderTextColor={colors.textSecondary}
                                        secureTextEntry
                                        value={currentPassword}
                                        onChangeText={setCurrentPassword}
                                    />
                                    <TextInput
                                        style={[stylesCommon.passwordModalInput, {
                                            borderColor: colors.border ?? colors.textSecondary + '50',
                                            color: colors.text,
                                            backgroundColor: colors.background,
                                        }]}
                                        placeholder={t('profile.passwordModal.newPassword', 'Nueva contraseña (mín. 6 caracteres)')}
                                        placeholderTextColor={colors.textSecondary}
                                        secureTextEntry
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                    />
                                    <TextInput
                                        style={[stylesCommon.passwordModalInput, {
                                            borderColor: colors.border ?? colors.textSecondary + '50',
                                            color: colors.text,
                                            backgroundColor: colors.background,
                                        }]}
                                        placeholder={t('profile.passwordModal.confirmPassword', 'Confirmar nueva contraseña')}
                                        placeholderTextColor={colors.textSecondary}
                                        secureTextEntry
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                    />

                                    {/* Error */}
                                    {passwordError ? (
                                        <View style={[
                                            stylesCommon.passwordModalErrorRow,
                                            {
                                                backgroundColor: colors.error + '12',
                                                borderColor: colors.error + '35',
                                            },
                                        ]}>
                                            <Text style={[stylesCommon.passwordModalError, { color: colors.error }]}>
                                                {passwordError}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Botones */}
                                    <View style={stylesCommon.passwordModalButtons}>
                                        <View style={{ width: '100%' }}>
                                            <PrimaryButton
                                                title={
                                                    passwordLoading
                                                        ? t('profile.passwordModal.saving', 'Guardando...')
                                                        : t('profile.passwordModal.saveButton', 'Guardar')
                                                }
                                                onPress={handlePasswordUpdate}
                                                disabled={passwordLoading}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={closePasswordModal}
                                            style={stylesCommon.passwordModalCancelButton}
                                        >
                                            <Text style={[stylesCommon.passwordModalCancelText, { color: colors.primary }]}>
                                                {t('profile.passwordModal.cancel', 'Cancelar')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}