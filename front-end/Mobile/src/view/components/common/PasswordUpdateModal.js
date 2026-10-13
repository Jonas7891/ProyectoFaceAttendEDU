import React, {useState} from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from './ThemeContext';
import PrimaryButton from '../auth/PrimaryButton';
import stylesCommon from './style/Style';
import {VerificationService} from '../../services/verificationService';
import {getCurrentUser} from '../../services/UserService';
import {useCodeVerification} from '../../hooks/useCodeVerification';
import {usePasswordUpdate} from '../../hooks/usePasswordUpdate';

// Cambio de contraseña con los endpoints existentes de recuperación:
// forgot-password -> verify-code -> reset-password (ms-identity).
// Sin endpoint dedicado de change-password en el backend, el código al
// correo es la verificación de identidad.
const STEPS = {SEND: 'send', CODE: 'code', PASSWORD: 'password'};

export default function PasswordUpdateModal() {
    const { t } = useTranslation();
    const { colors } = useTheme();

    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
    const [step, setStep] = useState(STEPS.SEND);
    const [email, setEmail] = useState('');
    const [sendLoading, setSendLoading] = useState(false);
    const [sendError, setSendError] = useState('');

    const codeVerification = useCodeVerification({
        email,
        onSuccess: () => setStep(STEPS.PASSWORD),
    });
    const passwordUpdate = usePasswordUpdate({
        email,
        onSuccess: () => {
            Alert.alert(
                t('profile.passwordModal.successTitle', 'Contraseña actualizada'),
                t('profile.passwordModal.successMessage', 'Tu contraseña ha sido actualizada correctamente')
            );
            closePasswordModal();
        },
    });

    const resetFlow = () => {
        setStep(STEPS.SEND);
        setEmail('');
        setSendLoading(false);
        setSendError('');
        codeVerification.resetAttempts();
        passwordUpdate.resetForm();
    };

    const openPasswordModal = async () => {
        resetFlow();
        setPasswordModalVisible(true);
        try {
            const me = await getCurrentUser();
            if (me?.email) setEmail(me.email);
            else setSendError(t('profile.passwordModal.errorGeneric', 'No se pudo actualizar. Intenta de nuevo.'));
        } catch {
            setSendError(t('profile.passwordModal.errorGeneric', 'No se pudo actualizar. Intenta de nuevo.'));
        }
    };

    const closePasswordModal = () => {
        setPasswordModalVisible(false);
        resetFlow();
    };

    const handleSendCode = async () => {
        if (!email) return;
        setSendError('');
        setSendLoading(true);
        try {
            await VerificationService.sendRecoveryCode(email);
            codeVerification.resetAttempts();
            setStep(STEPS.CODE);
        } catch (error) {
            setSendError(error?.message || t('profile.passwordModal.errorGeneric', 'No se pudo actualizar. Intenta de nuevo.'));
        } finally {
            setSendLoading(false);
        }
    };

    const combinedError =
        sendError ||
        (codeVerification.error?.message ?? '') ||
        (passwordUpdate.error?.message ?? '');

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

                                    {/* Paso 1: enviar código */}
                                    {step === STEPS.SEND && (
                                        <>
                                            <Text style={{ marginBottom: 14, color: colors.text }}>
                                                {t('profile.passwordModal.codeSentTo', 'Enviamos un código de 6 dígitos a')}{'\n'}
                                                <Text style={{ fontWeight: '700' }}>{email}</Text>
                                            </Text>
                                            <PrimaryButton
                                                title={
                                                    sendLoading
                                                        ? t('profile.passwordModal.sendingCode', 'Enviando...')
                                                        : t('profile.passwordModal.sendCode', 'Enviar código')
                                                }
                                                onPress={handleSendCode}
                                                disabled={sendLoading || !email}
                                            />
                                        </>
                                    )}

                                    {/* Paso 2: verificar código */}
                                    {step === STEPS.CODE && (
                                        <>
                                            <TextInput
                                                style={[stylesCommon.passwordModalInput, {
                                                    borderColor: colors.border ?? colors.textSecondary + '50',
                                                    color: colors.text,
                                                    backgroundColor: colors.background,
                                                }]}
                                                placeholder={t('profile.passwordModal.codeLabel', 'Código de verificación')}
                                                placeholderTextColor={colors.textSecondary}
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                value={codeVerification.code}
                                                onChangeText={codeVerification.setCode}
                                            />
                                            <View style={{ width: '100%', marginTop: 12 }}>
                                                <PrimaryButton
                                                    title={
                                                        codeVerification.isLoading
                                                            ? t('profile.passwordModal.verifying', 'Verificando...')
                                                            : t('profile.passwordModal.verifyButton', 'Verificar código')
                                                    }
                                                    onPress={codeVerification.verifyCode}
                                                    disabled={!codeVerification.canSubmit}
                                                />
                                            </View>
                                            <TouchableOpacity
                                                onPress={handleSendCode}
                                                disabled={sendLoading}
                                                style={stylesCommon.passwordModalCancelButton}
                                            >
                                                <Text style={[stylesCommon.passwordModalCancelText, { color: colors.primary }]}>
                                                    {t('profile.passwordModal.resendCode', 'Reenviar código')}
                                                </Text>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {/* Paso 3: nueva contraseña */}
                                    {step === STEPS.PASSWORD && (
                                        <>
                                            <TextInput
                                                style={[stylesCommon.passwordModalInput, {
                                                    borderColor: colors.border ?? colors.textSecondary + '50',
                                                    color: colors.text,
                                                    backgroundColor: colors.background,
                                                }]}
                                                placeholder={t('profile.passwordModal.newPassword', 'Nueva contraseña (mín. 6 caracteres)')}
                                                placeholderTextColor={colors.textSecondary}
                                                secureTextEntry
                                                value={passwordUpdate.newPassword}
                                                onChangeText={passwordUpdate.setNewPassword}
                                            />
                                            <TextInput
                                                style={[stylesCommon.passwordModalInput, {
                                                    borderColor: colors.border ?? colors.textSecondary + '50',
                                                    color: colors.text,
                                                    backgroundColor: colors.background,
                                                    marginTop: 10,
                                                }]}
                                                placeholder={t('profile.passwordModal.confirmPassword', 'Confirmar nueva contraseña')}
                                                placeholderTextColor={colors.textSecondary}
                                                secureTextEntry
                                                value={passwordUpdate.confirmPassword}
                                                onChangeText={passwordUpdate.setConfirmPassword}
                                            />
                                            <View style={{ width: '100%', marginTop: 12 }}>
                                                <PrimaryButton
                                                    title={
                                                        passwordUpdate.isLoading
                                                            ? t('profile.passwordModal.saving', 'Guardando...')
                                                            : t('profile.passwordModal.saveButton', 'Guardar')
                                                    }
                                                    onPress={passwordUpdate.updatePassword}
                                                    disabled={!passwordUpdate.canSubmit}
                                                />
                                            </View>
                                        </>
                                    )}

                                    {/* Error */}
                                    {combinedError ? (
                                        <View style={[
                                            stylesCommon.passwordModalErrorRow,
                                            {
                                                backgroundColor: (colors.danger || '#ff0000') + '12',
                                                borderColor: (colors.danger || '#ff0000') + '35',
                                            },
                                        ]}>
                                            <Text style={[stylesCommon.passwordModalError, { color: colors.danger || '#ff0000' }]}>
                                                {combinedError}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Botones */}
                                    <View style={stylesCommon.passwordModalButtons}>
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
