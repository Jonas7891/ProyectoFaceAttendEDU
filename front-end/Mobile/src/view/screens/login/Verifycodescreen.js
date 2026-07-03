import React, { useState, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    ActivityIndicator,
    Modal,
    ScrollView,
    Image,
    Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../components/common/ThemeContext';
import PrimaryButton from '../../components/auth/PrimaryButton';
import styles from './style/Style';
import { devCodeStore } from './Forgotpasswordscreen';

// ─────────────────────────────────────────────────────────────────────────────
// MODO DESARROLLO — valida el código contra devCodeStore (generado en
// ForgotPasswordScreen y visible en consola). Sin llamadas a API.
// Reemplazar ambas funciones por llamadas reales antes de producción.
// ─────────────────────────────────────────────────────────────────────────────
async function verifyRecoveryCode(email, code) {
    await new Promise((r) => setTimeout(r, 500));

    const expected = devCodeStore[email.toLowerCase()];

    if (!expected) {
        // No se generó código para este email en esta sesión
        throw new Error('no_code');
    }
    if (code.toUpperCase() !== expected) {
        throw new Error('invalid_code');
    }

    console.log('✅ Código verificado correctamente para:', email);
}

async function updatePassword(email, newPassword) {
    await new Promise((r) => setTimeout(r, 600));

    // Limpia el código usado para que no pueda reutilizarse
    delete devCodeStore[email.toLowerCase()];

    console.log('─────────────────────────────────────');
    console.log('🔐 CONTRASEÑA ACTUALIZADA (DEV MODE)');
    console.log(`   Email            : ${email}`);
    console.log(`   Nueva contraseña : ${newPassword}`);
    console.log('─────────────────────────────────────');
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente: indicador de requisito de contraseña
// ─────────────────────────────────────────────────────────────────────────────
function PasswordRequirement({ met, label, colors }) {
    return (
        <View style={styles.passwordReqRow}>
            <Text style={[styles.passwordReqIcon, { color: met ? (colors.success ?? '#38A169') : (colors.textSecondary ?? '#999') }]}>
                {met ? '✓' : '○'}
            </Text>
            <Text style={[styles.passwordReqText, { color: met ? (colors.success ?? '#38A169') : (colors.textSecondary ?? '#999') }]}>
                {label}
            </Text>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pantalla principal
// ─────────────────────────────────────────────────────────────────────────────
export default function VerifyCodeScreen({ route, navigation }) {
    const { email } = route?.params ?? {};
    const { t } = useTranslation();
    const { colors } = useTheme();

    // ── Estado código ──
    const [code, setCode] = useState('');
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeError, setCodeError] = useState('');

    // ── Estado modal nueva contraseña ──
    const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);

    // Animación del modal
    const modalScale = useRef(new Animated.Value(0.92)).current;
    const modalOpacity = useRef(new Animated.Value(0)).current;

    // ── Requisitos de contraseña ──
    const reqs = {
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[^A-Za-z0-9]/.test(newPassword),
    };
    const allReqsMet = Object.values(reqs).every(Boolean);

    // Calcular fortaleza
    const strengthScore = Object.values(reqs).filter(Boolean).length;
    const strengthLabel = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'][strengthScore];
    const strengthColor = [
        'transparent',
        '#E53E3E',
        '#ED8936',
        '#ECC94B',
        '#48BB78',
        '#38A169',
    ][strengthScore];

    // ── Abrir modal con animación ──
    const openPasswordModal = () => {
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordLoading(false);
        setPasswordModalVisible(true);
        Animated.parallel([
            Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
            Animated.timing(modalOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        ]).start();
    };

    const closePasswordModal = () => {
        Animated.parallel([
            Animated.spring(modalScale, { toValue: 0.92, useNativeDriver: true }),
            Animated.timing(modalOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]).start(() => setPasswordModalVisible(false));
    };

    // ── Verificar código ──
    const handleVerifyCode = async () => {
        setCodeError('');
        const trimmed = code.trim().toUpperCase();
        if (trimmed.length !== 6) {
            setCodeError(t('verifyCode.errorLength', { defaultValue: 'El código debe tener 6 caracteres.' }));
            return;
        }
        try {
            setCodeLoading(true);
            await verifyRecoveryCode(email, trimmed);
            setCodeLoading(false);
            openPasswordModal();
        } catch (err) {
            setCodeLoading(false);
            if (err.message === 'invalid_code') {
                setCodeError(t('verifyCode.errorInvalid', { defaultValue: 'El código es incorrecto. Revisa tu correo e intenta de nuevo.' }));
            } else if (err.message === 'no_code') {
                setCodeError(t('verifyCode.errorNoCode', { defaultValue: 'No hay un código activo para este correo. Vuelve atrás y solicita uno nuevo.' }));
            } else {
                setCodeError(t('verifyCode.errorGeneric', { defaultValue: 'Ocurrió un error. Intenta de nuevo.' }));
            }
        }
    };

    // ── Actualizar contraseña ──
    const handlePasswordUpdate = async () => {
        setPasswordError('');
        if (!newPassword || !confirmPassword) {
            setPasswordError(t('passwordUpdate.errorRequired', { defaultValue: 'Completa todos los campos.' }));
            return;
        }
        if (!allReqsMet) {
            setPasswordError(t('passwordUpdate.errorRequirements', { defaultValue: 'La contraseña no cumple todos los requisitos.' }));
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError(t('passwordUpdate.errorMatch', { defaultValue: 'Las contraseñas no coinciden.' }));
            return;
        }
        try {
            setPasswordLoading(true);
            await updatePassword(email, newPassword);
            setPasswordLoading(false);
            closePasswordModal();
            setSuccessVisible(true);
        } catch (err) {
            setPasswordLoading(false);
            setPasswordError(t('passwordUpdate.errorGeneric', { defaultValue: 'No se pudo actualizar. Intenta de nuevo.' }));
        }
    };

    // ── Pantalla de éxito ──
    if (successVisible) {
        return (
            <SafeAreaView style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]}>
                <View style={styles.successContainer}>
                    <Text style={[styles.successTitle, { color: colors.text }]}>
                        {t('passwordUpdate.successTitle', { defaultValue: '¡Contraseña actualizada!' })}
                    </Text>
                    <Text style={[styles.successMessage, { color: colors.textSecondary ?? '#666' }]}>
                        {t('passwordUpdate.successMessage', { defaultValue: 'Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.' })}
                    </Text>
                    <TouchableOpacity
                        style={[styles.recoveryPrimaryButton, { backgroundColor: colors.primary, marginTop: 32, padding: 10 }]}
                        onPress={() => navigation.navigate('HomesScreen')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.recoveryPrimaryButtonText}>
                            {t('passwordUpdate.goToLogin', { defaultValue: 'Ir al inicio de sesión' })}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]}>
            <KeyboardAvoidingView
                style={styles.keyboardview}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[styles.container, { backgroundColor: colors.backgroundWhite }]}>

                        {/* Botón atrás */}
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.backButtonText, { color: colors.primary }]}>
                                ‹ {t('common.back', { defaultValue: 'Volver' })}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.contentContainer}>
                            <View style={styles.recoveryIconContainer}>
                                <Text style={styles.recoveryIcon}>📧</Text>
                            </View>

                            <Text style={[styles.textoSesion, { color: colors.text }]}>
                                {t('verifyCode.title', { defaultValue: 'Revisa tu correo' })}
                            </Text>

                            <Text style={[styles.textoCredenciales, { color: colors.textSecondary ?? '#666' }]}>
                                {t('verifyCode.description', {
                                    defaultValue: 'Enviamos un código de 6 caracteres a',
                                })}{' '}
                                <Text style={{ fontWeight: '600', color: colors.text }}>{email}</Text>.
                                {'\n'}
                                {t('verifyCode.descriptionSub', { defaultValue: 'Ingrésalo a continuación.' })}
                            </Text>

                            {/* Input código */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputTitulo, { color: colors.text }]}>
                                    {t('verifyCode.codeLabel', { defaultValue: 'Código de verificación' })}
                                </Text>
                                <TextInput
                                    style={[styles.codeInput, {
                                        backgroundColor: colors.inputBackground,
                                        borderColor: codeError ? (colors.error ?? '#E53E3E') : (colors.border ?? colors.separator),
                                        color: colors.text,
                                    }]}
                                    onChangeText={(v) => { setCode(v.toUpperCase()); setCodeError(''); }}
                                    value={code}
                                    placeholder="ABC123"
                                    placeholderTextColor={colors.textMuted}
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    maxLength={6}
                                    returnKeyType="done"
                                    onSubmitEditing={handleVerifyCode}
                                />
                            </View>

                            {/* Error código */}
                            {codeError ? (
                                <View style={[styles.recoveryErrorBox, {
                                    backgroundColor: (colors.error ?? '#E53E3E') + '12',
                                    borderColor: (colors.error ?? '#E53E3E') + '35',
                                }]}>
                                    <Text style={[styles.recoveryErrorText, { color: colors.error ?? '#E53E3E' }]}>
                                        {codeError}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Botón verificar */}
                            <TouchableOpacity
                                style={[styles.recoveryPrimaryButton, {
                                    backgroundColor: codeLoading ? (colors.primary + '80') : colors.primary,
                                }]}
                                onPress={handleVerifyCode}
                                disabled={codeLoading}
                                activeOpacity={0.8}
                            >
                                {codeLoading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.recoveryPrimaryButtonText}>
                                        {t('verifyCode.verifyButton', { defaultValue: 'Verificar código' })}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* ── Modal: nueva contraseña ── */}
            <Modal
                visible={isPasswordModalVisible}
                transparent
                animationType="none"
                onRequestClose={closePasswordModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalWrapper}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalWrapper}>
                            <ScrollView
                                contentContainerStyle={styles.modalScrollContent}
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                            >
                                <Animated.View style={[
                                    styles.passwordModalCard,
                                    {
                                        backgroundColor: colors.card,
                                        borderColor: colors.border ?? colors.textSecondary + '50',
                                        transform: [{ scale: modalScale }],
                                        opacity: modalOpacity,
                                    },
                                ]}>
                                    {/* Encabezado */}
                                    <Text style={[styles.passwordModalTitle, { color: colors.text }]}>
                                        {t('passwordUpdate.title', { defaultValue: 'Nueva contraseña' })}
                                    </Text>
                                    <Text style={[styles.passwordModalDescription, { color: colors.textSecondary }]}>
                                        {t('passwordUpdate.description', { defaultValue: 'Crea una contraseña segura para tu cuenta.' })}
                                    </Text>

                                    <View style={[styles.passwordModalDivider, { backgroundColor: colors.border ?? colors.textSecondary + '30' }]} />

                                    {/* Campo nueva contraseña */}
                                    <View style={styles.passwordFieldWrapper}>
                                        <TextInput
                                            style={[styles.passwordModalInput, {
                                                borderColor: colors.border ?? colors.textSecondary + '50',
                                                color: colors.text,
                                                backgroundColor: colors.background,
                                                paddingRight: 48,
                                            }]}
                                            placeholder={t('passwordUpdate.newPassword', { defaultValue: 'Nueva contraseña' })}
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!showNew}
                                            value={newPassword}
                                            onChangeText={(v) => { setNewPassword(v); setPasswordError(''); }}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() => setShowNew(!showNew)}
                                        >
                                            <Image
                                                source={
                                                    showNew
                                                    ? require('../../../assets/images/lupa.png')
                                                    : require('../../../assets/images/esconder.png')
                                                }
                                                style={{ width: 24, height: 24, resizeMode: 'contain' }}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Barra de fortaleza */}
                                    {newPassword.length > 0 && (
                                        <View style={styles.strengthBarContainer}>
                                            <View style={styles.strengthBarTrack}>
                                                <View style={[styles.strengthBarFill, {
                                                    width: `${(strengthScore / 5) * 100}%`,
                                                    backgroundColor: strengthColor,
                                                }]} />
                                            </View>
                                            <Text style={[styles.strengthLabel, { color: strengthColor }]}>
                                                {strengthLabel}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Requisitos */}
                                    <View style={styles.passwordReqContainer}>
                                        <PasswordRequirement
                                            met={reqs.length}
                                            label={t('passwordUpdate.reqLength', { defaultValue: 'Mínimo 8 caracteres' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={reqs.uppercase}
                                            label={t('passwordUpdate.reqUppercase', { defaultValue: 'Al menos una mayúscula' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={reqs.lowercase}
                                            label={t('passwordUpdate.reqLowercase', { defaultValue: 'Al menos una minúscula' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={reqs.number}
                                            label={t('passwordUpdate.reqNumber', { defaultValue: 'Al menos un número' })}
                                            colors={colors}
                                        />
                                        <PasswordRequirement
                                            met={reqs.special}
                                            label={t('passwordUpdate.reqSpecial', { defaultValue: 'Al menos un carácter especial (!@#$...)' })}
                                            colors={colors}
                                        />
                                    </View>

                                    {/* Campo confirmar contraseña */}
                                    <View style={styles.passwordFieldWrapper}>
                                        <TextInput
                                            style={[styles.passwordModalInput, {
                                                borderColor: confirmPassword && newPassword !== confirmPassword
                                                    ? (colors.error ?? '#E53E3E')
                                                    : (colors.border ?? colors.textSecondary + '50'),
                                                color: colors.text,
                                                backgroundColor: colors.background,
                                                paddingRight: 48,
                                            }]}
                                            placeholder={t('passwordUpdate.confirmPassword', { defaultValue: 'Confirmar contraseña' })}
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!showConfirm}
                                            value={confirmPassword}
                                            onChangeText={(v) => { setConfirmPassword(v); setPasswordError(''); }}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeButton}
                                            onPress={() => setShowConfirm(!showConfirm)}
                                        >
                                            <Image
                                                source={
                                                    showConfirm
                                                    ? require('../../../assets/images/lupa.png')
                                                    : require('../../../assets/images/esconder.png')
                                                }
                                                style={{ width: 24, height: 24, resizeMode: 'contain' }}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Indicador de coincidencia */}
                                    {confirmPassword.length > 0 && (
                                        <Text style={[styles.passwordMatchIndicator, {
                                            color: newPassword === confirmPassword
                                                ? (colors.success ?? '#38A169')
                                                : (colors.error ?? '#E53E3E'),
                                        }]}>
                                            {newPassword === confirmPassword
                                                ? t('passwordUpdate.passwordsMatch', { defaultValue: '✓ Las contraseñas coinciden' })
                                                : t('passwordUpdate.passwordsNoMatch', { defaultValue: '✗ Las contraseñas no coinciden' })}
                                        </Text>
                                    )}

                                    {/* Error general */}
                                    {passwordError ? (
                                        <View style={[styles.passwordModalErrorRow, {
                                            backgroundColor: (colors.error ?? '#E53E3E') + '12',
                                            borderColor: (colors.error ?? '#E53E3E') + '35',
                                        }]}>
                                            <Text style={[styles.passwordModalError, { color: colors.error ?? '#E53E3E' }]}>
                                                {passwordError}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Botones */}
                                    <View style={styles.passwordModalButtons}>
                                        <View style={{ width: '100%' }}>
                                            <PrimaryButton
                                                title={
                                                    passwordLoading
                                                        ? t('passwordUpdate.saving', { defaultValue: 'Guardando...' })
                                                        : t('passwordUpdate.saveButton', { defaultValue: 'Guardar contraseña' })
                                                }
                                                onPress={handlePasswordUpdate}
                                                disabled={passwordLoading || !allReqsMet}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            onPress={closePasswordModal}
                                            style={styles.passwordModalCancelButton}
                                        >
                                            <Text style={[styles.passwordModalCancelText, { color: colors.primary }]}>
                                                {t('common.cancel', { defaultValue: 'Cancelar' })}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}