import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    LayoutAnimation,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    UIManager,
    Vibration,
    View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../components/common/ThemeContext';
import PrimaryButton from '../../components/auth/PrimaryButton';
import styles from './style/Style';
import {devCodeStore} from './Forgotpasswordscreen';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes de control
// ─────────────────────────────────────────────────────────────────────────────
const MAX_CODE_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000;
const CODE_EXPIRATION_MS = 600000;
const RESEND_COOLDOWN_MS = 60000;
const REQUEST_TIMEOUT_MS = 15000;

// Lista de passwords comunes (debe validarse en backend también)
const COMMON_PASSWORDS = [
    'password', 'Password', 'PASSWORD', 'password1', 'Password1', 'Password123',
    '12345678', '123456789', '1234567890', 'abcdefgh', 'qwerty12', 'qwertyui',
    'iloveyou', 'sunshine', 'princess', 'football', 'baseball', 'superman',
    'letmein', 'welcome', 'monkey', 'master', 'dragon', 'login', 'admin',
];

// Trackea cuándo se generó cada código (para verificar expiración)
const devCodeTimestamps = {};

async function verifyRecoveryCode(email, code, codeGeneratedAt) {
    await new Promise((r) => setTimeout(r, 500));

    const expected = devCodeStore[email.toLowerCase()];
    if (!expected) {
        throw new Error('no_code');
    }

    // Verificar expiración
    const now = Date.now();
    const age = now - codeGeneratedAt;
    if (age > CODE_EXPIRATION_MS) {
        delete devCodeStore[email.toLowerCase()];
        throw new Error('expired_code');
    }

    if (code.toUpperCase() !== expected) {
        throw new Error('invalid_code');
    }

    console.log('✅ Código verificado correctamente para:', email);
}

async function updatePassword(email, newPassword) {
    await new Promise((r) => setTimeout(r, 600));
    delete devCodeStore[email.toLowerCase()];
    delete devCodeTimestamps[email.toLowerCase()];

    console.log('─────────────────────────────────────');
    console.log('🔐 CONTRASEÑA ACTUALIZADA (DEV MODE)');
    console.log(`   Email            : ${email}`);
    console.log(`   Nueva contraseña : ${newPassword}`);
    console.log('─────────────────────────────────────');
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de validación
// ─────────────────────────────────────────────────────────────────────────────
const detectSequentialPatterns = (pwd) => {
    const lower = pwd.toLowerCase();
    const sequences = [
        '123', '234', '345', '456', '567', '678', '789', '890',
        'qwe', 'wer', 'ert', 'asd', 'sdf', 'zxc', 'xcv',
        'abc', 'bcd', 'cde', 'def', 'efg',
    ];
    return sequences.some((seq) => lower.includes(seq));
};

const detectRepeatedChars = (pwd) => /(.)\1{2,}/.test(pwd); // aaa, 111, etc

const isCommonPassword = (pwd) =>
    COMMON_PASSWORDS.some((cp) => cp.toLowerCase() === pwd.toLowerCase());

// ─────────────────────────────────────────────────────────────────────────────
// Componente: requisito de contraseña con animación
// ─────────────────────────────────────────────────────────────────────────────
function PasswordRequirement({met, label, colors}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {toValue: 1.15, duration: 150, useNativeDriver: true}),
            Animated.timing(scaleAnim, {toValue: 1, duration: 150, useNativeDriver: true}),
        ]).start();
    }, [met]);

    const iconColor = met ? (colors.success ?? '#38A169') : (colors.textSecondary ?? '#999');
    const icon = met ? '✓' : '○';

    return (
        <View style={styles.passwordReqRow}>
            <Animated.Text
                style={[
                    styles.passwordReqIcon,
                    {color: iconColor, transform: [{scale: scaleAnim}]},
                ]}
            >
                {icon}
            </Animated.Text>
            <Text
                style={[styles.passwordReqText, {color: iconColor}]}
                accessibilityLabel={`${label}, ${met ? 'cumplido' : 'pendiente'}`}
            >
                {label}
            </Text>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente: Input de código con 6 cajitas separadas
// ─────────────────────────────────────────────────────────────────────────────
function CodeInput({value, onChange, error, colors, codeRefs, onVerify, disabled}) {
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // Exponer la función de shake para que el padre la use
    useEffect(() => {
        if (error) {
            Animated.sequence([
                Animated.timing(shakeAnim, {toValue: 10, duration: 50, useNativeDriver: true}),
                Animated.timing(shakeAnim, {toValue: -10, duration: 50, useNativeDriver: true}),
                Animated.timing(shakeAnim, {toValue: 10, duration: 50, useNativeDriver: true}),
                Animated.timing(shakeAnim, {toValue: -10, duration: 50, useNativeDriver: true}),
                Animated.timing(shakeAnim, {toValue: 0, duration: 50, useNativeDriver: true}),
            ]).start();
        }
    }, [error]);

    const handleChange = (text, index) => {
        const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

        // Detección de paste: si hay más de 1 caracter, distribuir en las 6 cajitas
        if (cleaned.length > 1) {
            const chars = cleaned.slice(0, 6).split('');
            const newCode = chars.join('').padEnd(6, ' ').trimEnd();
            onChange(newCode);

            const lastIndex = Math.min(chars.length, 5);
            setTimeout(() => codeRefs[lastIndex]?.current?.focus(), 50);

            if (chars.length === 6) {
                setTimeout(() => onVerify(), 100);
            }
            return;
        }

        const newValue = value.split('');
        newValue[index] = cleaned[0] || '';
        const newCode = newValue.join('');
        onChange(newCode);

        if (cleaned && index < 5) {
            setTimeout(() => codeRefs[index + 1]?.current?.focus(), 0);
        }

        // Verificar automáticamente cuando se completa
        if (newCode.replace(/ /g, '').length === 6) {
            setTimeout(() => onVerify(), 100);
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
            codeRefs[index - 1]?.current?.focus();
        }
    };

    return (
        <Animated.View style={{transform: [{translateX: shakeAnim}]}}>
            <View style={styles.codeInputRow}>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const hasValue = !!value[i];
                    const isFocused = i === 0 && !value; // primer input si está vacío

                    return (
                        <TextInput
                            key={i}
                            ref={codeRefs[i]}
                            style={[
                                styles.codeDigit,
                                {
                                    backgroundColor: colors.inputBackground,
                                    borderColor: error
                                        ? (colors.error ?? '#E53E3E')
                                        : hasValue
                                            ? (colors.primary ?? '#3B82F6')
                                            : (colors.border ?? colors.separator),
                                    color: colors.text,
                                    borderWidth: 2,
                                },
                            ]}
                            value={value[i] || ''}
                            onChangeText={(text) => handleChange(text, i)}
                            onKeyPress={(e) => handleKeyPress(e, i)}
                            maxLength={1}
                            keyboardType="default"
                            autoCapitalize="characters"
                            selectTextOnFocus
                            editable={!disabled}
                            accessibilityLabel={`Dígito ${i + 1} de 6`}
                            accessibilityHint={i === 0 ? 'Ingresa el código de 6 caracteres recibido por correo' : ''}
                        />
                    );
                })}
            </View>
        </Animated.View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pantalla principal
// ─────────────────────────────────────────────────────────────────────────────
export default function VerifyCodeScreen({route, navigation}) {
    const {email} = route?.params ?? {};
    const {t} = useTranslation();
    const {colors} = useTheme();

    // ── Refs para inputs ──
    const codeRefs = useRef([0, 1, 2, 3, 4, 5].map(() => React.createRef()));
    const newPasswordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    // ── Estado código ──
    const [code, setCode] = useState('');
    const [codeLoading, setCodeLoading] = useState(false);
    const [codeError, setCodeError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(0);
    const [lockoutRemaining, setLockoutRemaining] = useState(0);
    const [codeGeneratedAt] = useState(Date.now());

    // ── Estado reenviar código ──
    const [resendCooldown, setResendCooldown] = useState(Math.ceil(RESEND_COOLDOWN_MS / 1000));

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

    // ── Requisitos de contraseña (memoizados) ──
    const reqs = useMemo(() => ({
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[^A-Za-z0-9]/.test(newPassword),
        notCommon: !isCommonPassword(newPassword),
        noSequential: !detectSequentialPatterns(newPassword),
        noRepeated: !detectRepeatedChars(newPassword),
    }), [newPassword]);

    const allReqsMet = reqs.length && reqs.uppercase && reqs.lowercase &&
        reqs.number && reqs.special && reqs.notCommon && reqs.noSequential && reqs.noRepeated;

    // Calcular fortaleza
    const strengthScore = useMemo(() => {
        let score = 0;
        if (reqs.length) score++;
        if (reqs.uppercase && reqs.lowercase) score++;
        if (reqs.number) score++;
        if (reqs.special) score++;
        if (newPassword.length >= 12) score++;
        return score;
    }, [reqs, newPassword.length]);

    const strengthLabel = ['', 'Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'][strengthScore];
    const strengthColor = [
        'transparent', '#E53E3E', '#ED8936', '#ECC94B', '#48BB78', '#38A169',
    ][strengthScore];

    // ── Auto-focus en el primer input al montar ──
    useEffect(() => {
        const timer = setTimeout(() => codeRefs.current[0]?.current?.focus(), 400);
        return () => clearTimeout(timer);
    }, []);

    // ── Countdown del reenvío ──
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // ── Countdown del bloqueo ──
    useEffect(() => {
        if (lockoutUntil <= Date.now()) {
            setLockoutRemaining(0);
            return;
        }
        const update = () => {
            const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
            setLockoutRemaining(remaining > 0 ? remaining : 0);
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [lockoutUntil]);

    // ── Abrir modal con animación ──
    const openPasswordModal = useCallback(() => {
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        setPasswordLoading(false);
        setPasswordModalVisible(true);
        Animated.parallel([
            Animated.spring(modalScale, {toValue: 1, useNativeDriver: true, tension: 120, friction: 8}),
            Animated.timing(modalOpacity, {toValue: 1, duration: 220, useNativeDriver: true}),
        ]).start(() => {
            setTimeout(() => newPasswordRef.current?.focus(), 200);
        });
    }, [modalScale, modalOpacity]);

    const closePasswordModal = useCallback(() => {
        const hasUnsavedChanges = newPassword.trim() || confirmPassword.trim();
        if (hasUnsavedChanges) {
            Alert.alert(
                t('common.discardTitle', {defaultValue: '¿Descartar cambios?'}),
                t('passwordUpdate.discardMessage', {
                    defaultValue: 'Si sales, perderás la contraseña que escribiste.',
                }),
                [
                    {
                        text: t('common.cancel', {defaultValue: 'Cancelar'}),
                        style: 'cancel',
                    },
                    {
                        text: t('common.discard', {defaultValue: 'Descartar'}),
                        style: 'destructive',
                        onPress: () => {
                            Animated.parallel([
                                Animated.spring(modalScale, {toValue: 0.92, useNativeDriver: true}),
                                Animated.timing(modalOpacity, {toValue: 0, duration: 180, useNativeDriver: true}),
                            ]).start(() => setPasswordModalVisible(false));
                        },
                    },
                ]
            );
        } else {
            Animated.parallel([
                Animated.spring(modalScale, {toValue: 0.92, useNativeDriver: true}),
                Animated.timing(modalOpacity, {toValue: 0, duration: 180, useNativeDriver: true}),
            ]).start(() => setPasswordModalVisible(false));
        }
    }, [newPassword, confirmPassword, modalScale, modalOpacity, t]);

    // ── Verificar código ──
    const handleVerifyCode = useCallback(async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCodeError('');

        // Verificar bloqueo
        if (lockoutUntil > Date.now()) {
            setCodeError(`Demasiados intentos. Espera ${lockoutRemaining}s.`);
            return;
        }

        const trimmed = code.replace(/ /g, '').toUpperCase();
        if (trimmed.length !== 6) {
            setCodeError(t('verifyCode.errorLength', {defaultValue: 'El código debe tener 6 caracteres.'}));
            if (Platform.OS === 'ios') Vibration.vibrate(200);
            return;
        }

        try {
            setCodeLoading(true);
            Keyboard.dismiss();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), REQUEST_TIMEOUT_MS)
            );

            await Promise.race([
                verifyRecoveryCode(email, trimmed, codeGeneratedAt),
                timeoutPromise,
            ]);

            setCodeLoading(false);
            openPasswordModal();
        } catch (err) {
            setCodeLoading(false);
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            // Vibración háptica en error
            if (Platform.OS === 'ios') {
                Vibration.vibrate(300);
            } else {
                Vibration.vibrate([0, 100, 50, 100]);
            }

            if (err.message === 'invalid_code') {
                setCodeError(
                    t('verifyCode.errorInvalid', {
                        defaultValue: `Código incorrecto. Intentos restantes: ${MAX_CODE_ATTEMPTS - newAttempts}`,
                    })
                );

                // Bloquear si se alcanzó el límite
                if (newAttempts >= MAX_CODE_ATTEMPTS) {
                    setLockoutUntil(Date.now() + LOCKOUT_DURATION_MS);
                    setCodeError(
                        t('verifyCode.errorLockout', {
                            defaultValue: `Demasiados intentos fallidos. Espera 30 segundos.`,
                        })
                    );
                }
            } else if (err.message === 'expired_code') {
                setCodeError(
                    t('verifyCode.errorExpired', {
                        defaultValue: 'El código ha expirado. Solicita uno nuevo.',
                    })
                );
            } else if (err.message === 'no_code') {
                setCodeError(
                    t('verifyCode.errorNoCode', {
                        defaultValue: 'No hay un código activo. Vuelve atrás y solicita uno nuevo.',
                    })
                );
            } else if (err.message === 'timeout') {
                setCodeError('La verificación tardó demasiado. Revisa tu conexión.');
            } else {
                setCodeError(t('verifyCode.errorGeneric', {defaultValue: 'Ocurrió un error. Intenta de nuevo.'}));
            }
        }
    }, [code, email, attempts, lockoutUntil, lockoutRemaining, codeGeneratedAt, openPasswordModal, t]);

    // ── Reenviar código ──
    const handleResendCode = useCallback(async () => {
        if (resendCooldown > 0) return;

        try {
            setResendCooldown(Math.ceil(RESEND_COOLDOWN_MS / 1000));
            setAttempts(0);
            setLockoutUntil(0);
            setCode('');
            setCodeError('');

            // Aquí iría la llamada real al backend para reenviar
            // Por ahora simulamos generando un nuevo código
            const {generateCode} = await import('./Forgotpasswordscreen').catch(() => ({
                generateCode: () => {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    let code = '';
                    for (let i = 0; i < 6; i++) {
                        code += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    return code;
                },
            }));

            const newCode = generateCode();
            devCodeStore[email.toLowerCase()] = newCode;

            console.log('─────────────────────────────────────');
            console.log(`🔑 CÓDIGO REENVIADO (DEV MODE)`);
            console.log(`   Email : ${email}`);
            console.log(`   Código: ${newCode}`);
            console.log('─────────────────────────────────────');

            Alert.alert(
                'Código reenviado',
                'Revisa tu correo para ver el nuevo código.',
                [{text: 'OK'}]
            );

            setTimeout(() => codeRefs.current[0]?.current?.focus(), 300);
        } catch (err) {
            Alert.alert('Error', 'No se pudo reenviar el código. Intenta de nuevo.');
            setResendCooldown(0);
        }
    }, [email, resendCooldown]);

    // ── Actualizar contraseña ──
    const handlePasswordUpdate = useCallback(async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPasswordError('');

        if (!newPassword || !confirmPassword) {
            setPasswordError(t('passwordUpdate.errorRequired', {defaultValue: 'Completa todos los campos.'}));
            return;
        }
        if (!allReqsMet) {
            setPasswordError(t('passwordUpdate.errorRequirements', {defaultValue: 'La contraseña no cumple todos los requisitos.'}));
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError(t('passwordUpdate.errorMatch', {defaultValue: 'Las contraseñas no coinciden.'}));
            return;
        }

        try {
            setPasswordLoading(true);
            Keyboard.dismiss();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), REQUEST_TIMEOUT_MS)
            );

            await Promise.race([updatePassword(email, newPassword), timeoutPromise]);

            setPasswordLoading(false);
            closePasswordModal();
            setSuccessVisible(true);
        } catch (err) {
            setPasswordLoading(false);
            if (err.message === 'timeout') {
                setPasswordError('La operación tardó demasiado. Intenta de nuevo.');
            } else {
                setPasswordError(t('passwordUpdate.errorGeneric', {defaultValue: 'No se pudo actualizar. Intenta de nuevo.'}));
            }
        }
    }, [newPassword, confirmPassword, allReqsMet, email, closePasswordModal, t]);

    // ── Pantalla de éxito ──
    if (successVisible) {
        return (
            <SafeAreaView style={[styles.safeAreaWhite, {backgroundColor: colors.backgroundWhite}]}>
                <View style={styles.successContainer}>
                    <Text style={[styles.successTitle, {color: colors.text}]}>
                        {t('passwordUpdate.successTitle', {defaultValue: '¡Contraseña actualizada!'})}
                    </Text>
                    <Text style={[styles.successMessage, {color: colors.textSecondary ?? '#666'}]}>
                        {t('passwordUpdate.successMessage', {
                            defaultValue: 'Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.',
                        })}
                    </Text>
                    <TouchableOpacity
                        style={[styles.recoveryPrimaryButton, {
                            backgroundColor: colors.primary,
                            marginTop: 32,
                            padding: 10
                        }]}
                        onPress={() => navigation.navigate('HomesScreen')}
                        activeOpacity={0.8}
                        accessibilityLabel="Ir al inicio de sesión"
                        accessibilityRole="button"
                    >
                        <Text style={styles.recoveryPrimaryButtonText}>
                            {t('passwordUpdate.goToLogin', {defaultValue: 'Ir al inicio de sesión'})}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const isLockedOut = lockoutUntil > Date.now();
    const isButtonDisabled = codeLoading || code.replace(/ /g, '').length !== 6 || isLockedOut;

    return (
        <SafeAreaView style={[styles.safeAreaWhite, {backgroundColor: colors.backgroundWhite}]}>
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={{flexGrow: 1}}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={[styles.container, {backgroundColor: colors.backgroundWhite}]}>

                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={[styles.backButton, codeLoading && {opacity: 0.5}]}
                                disabled={codeLoading}
                                activeOpacity={0.7}
                                accessibilityLabel="Volver a la pantalla anterior"
                                accessibilityRole="button"
                            >
                                <Text style={[styles.backButtonText, {color: colors.primary}]}>
                                    ‹ {t('common.back', {defaultValue: 'Volver'})}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.contentContainer}>
                                <View style={styles.recoveryIconContainer}>
                                    <Text style={styles.recoveryIcon}>📧</Text>
                                </View>

                                <Text style={[styles.textoSesion, {color: colors.text}]}>
                                    {t('verifyCode.title', {defaultValue: 'Revisa tu correo'})}
                                </Text>

                                <Text style={[styles.textoCredenciales, {color: colors.textSecondary ?? '#666'}]}>
                                    {t('verifyCode.description', {defaultValue: 'Enviamos un código de 6 caracteres a'})}{' '}
                                    <Text style={{fontWeight: '600', color: colors.text}}>{email}</Text>.
                                    {'\n'}
                                    {t('verifyCode.descriptionSub', {defaultValue: 'Ingrésalo a continuación.'})}
                                </Text>

                                {/* Label del código */}
                                <View style={[styles.inputContainer, {marginTop: 16}]}>
                                    <Text style={[styles.inputTitulo, {
                                        color: colors.text,
                                        textAlign: 'center',
                                        marginBottom: 12
                                    }]}>
                                        {t('verifyCode.codeLabel', {defaultValue: 'Código de verificación'})}
                                    </Text>

                                    {/* 6 cajitas separadas */}
                                    <CodeInput
                                        value={code}
                                        onChange={setCode}
                                        error={codeError}
                                        colors={colors}
                                        codeRefs={codeRefs.current}
                                        onVerify={handleVerifyCode}
                                        disabled={codeLoading || isLockedOut}
                                    />
                                </View>

                                {/* Error código */}
                                {codeError ? (
                                    <View style={[styles.recoveryErrorBox, {
                                        backgroundColor: (colors.error ?? '#E53E3E') + '12',
                                        borderColor: (colors.error ?? '#E53E3E') + '35',
                                    }]}>
                                        <Text style={[styles.recoveryErrorText, {color: colors.error ?? '#E53E3E'}]}>
                                            {codeError}
                                        </Text>
                                    </View>
                                ) : null}

                                {/* Botón verificar */}
                                <TouchableOpacity
                                    style={[styles.recoveryPrimaryButton, {
                                        backgroundColor: isButtonDisabled ? (colors.primary + '60') : colors.primary,
                                        opacity: isButtonDisabled ? 0.7 : 1,
                                    }]}
                                    onPress={handleVerifyCode}
                                    disabled={isButtonDisabled}
                                    activeOpacity={0.8}
                                    accessibilityLabel={
                                        isLockedOut
                                            ? `Espera ${lockoutRemaining} segundos`
                                            : codeLoading
                                                ? "Verificando código"
                                                : "Verificar código de recuperación"
                                    }
                                    accessibilityRole="button"
                                    accessibilityState={{disabled: isButtonDisabled, busy: codeLoading}}
                                >
                                    {codeLoading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small"/>
                                    ) : isLockedOut ? (
                                        <Text style={styles.recoveryPrimaryButtonText}>
                                            Espera {lockoutRemaining}s
                                        </Text>
                                    ) : (
                                        <Text style={styles.recoveryPrimaryButtonText}>
                                            {t('verifyCode.verifyButton', {defaultValue: 'Verificar código'})}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                {/* Reenviar código */}
                                <View style={{alignItems: 'center', marginTop: 16}}>
                                    <Text style={[styles.textoCredenciales, {color: colors.textSecondary}]}>
                                        ¿No recibiste el código?
                                    </Text>
                                    <TouchableOpacity
                                        onPress={handleResendCode}
                                        disabled={resendCooldown > 0}
                                        activeOpacity={0.7}
                                        accessibilityLabel={
                                            resendCooldown > 0
                                                ? `Reenviar código en ${resendCooldown} segundos`
                                                : 'Reenviar código de verificación'
                                        }
                                        accessibilityRole="button"
                                    >
                                        <Text style={{
                                            color: resendCooldown > 0 ? (colors.textSecondary ?? '#999') : colors.primary,
                                            fontWeight: '600',
                                            marginTop: 4,
                                        }}>
                                            {resendCooldown > 0
                                                ? `Reenviar en ${resendCooldown}s`
                                                : t('verifyCode.resendButton', {defaultValue: 'Reenviar código'})}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* ── Modal: nueva contraseña ── */}
            <Modal
                visible={isPasswordModalVisible}
                transparent
                animationType="none"
                onRequestClose={closePasswordModal}
            >
                <TouchableWithoutFeedback onPress={closePasswordModal}>
                    <KeyboardAvoidingView
                        style={{flex: 1}}
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
                                            transform: [{scale: modalScale}],
                                            opacity: modalOpacity,
                                        },
                                    ]}>
                                        {/* Encabezado */}
                                        <Text style={[styles.passwordModalTitle, {color: colors.text}]}>
                                            {t('passwordUpdate.title', {defaultValue: 'Nueva contraseña'})}
                                        </Text>
                                        <Text style={[styles.passwordModalDescription, {color: colors.textSecondary}]}>
                                            {t('passwordUpdate.description', {defaultValue: 'Crea una contraseña segura para tu cuenta.'})}
                                        </Text>

                                        <View
                                            style={[styles.passwordModalDivider, {backgroundColor: colors.border ?? colors.textSecondary + '30'}]}/>

                                        {/* Campo nueva contraseña */}
                                        <View style={styles.passwordFieldWrapper}>
                                            <TextInput
                                                ref={newPasswordRef}
                                                style={[styles.passwordModalInput, {
                                                    borderColor: colors.border ?? colors.textSecondary + '50',
                                                    color: colors.text,
                                                    backgroundColor: colors.background,
                                                    paddingRight: 48,
                                                }]}
                                                placeholder={t('passwordUpdate.newPassword', {defaultValue: 'Nueva contraseña'})}
                                                placeholderTextColor={colors.textSecondary}
                                                secureTextEntry={!showNew}
                                                value={newPassword}
                                                onChangeText={(v) => {
                                                    setNewPassword(v);
                                                    setPasswordError('');
                                                }}
                                                returnKeyType="next"
                                                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                                accessibilityLabel="Nueva contraseña"
                                                accessibilityHint="Debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales"
                                                editable={!passwordLoading}
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeButton}
                                                onPress={() => setShowNew(!showNew)}
                                                accessibilityLabel={showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                accessibilityRole="button"
                                            >
                                                <Image
                                                    source={
                                                        showNew
                                                            ? require('../../../assets/images/lupa.png')
                                                            : require('../../../assets/images/esconder.png')
                                                    }
                                                    style={{width: 24, height: 24, resizeMode: 'contain'}}
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
                                                    }]}/>
                                                </View>
                                                <Text style={[styles.strengthLabel, {color: strengthColor}]}>
                                                    {strengthLabel}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Requisitos */}
                                        <View style={styles.passwordReqContainer}>
                                            <PasswordRequirement
                                                met={reqs.length}
                                                label={t('passwordUpdate.reqLength', {defaultValue: 'Mínimo 8 caracteres'})}
                                                colors={colors}
                                            />
                                            <PasswordRequirement
                                                met={reqs.uppercase}
                                                label={t('passwordUpdate.reqUppercase', {defaultValue: 'Al menos una mayúscula'})}
                                                colors={colors}
                                            />
                                            <PasswordRequirement
                                                met={reqs.lowercase}
                                                label={t('passwordUpdate.reqLowercase', {defaultValue: 'Al menos una minúscula'})}
                                                colors={colors}
                                            />
                                            <PasswordRequirement
                                                met={reqs.number}
                                                label={t('passwordUpdate.reqNumber', {defaultValue: 'Al menos un número'})}
                                                colors={colors}
                                            />
                                            <PasswordRequirement
                                                met={reqs.special}
                                                label={t('passwordUpdate.reqSpecial', {defaultValue: 'Al menos un carácter especial (!@#$...)'})}
                                                colors={colors}
                                            />
                                            <PasswordRequirement
                                                met={reqs.notCommon}
                                                label={t('passwordUpdate.reqNotCommon', {defaultValue: 'No es una contraseña común'})}
                                                colors={colors}
                                            />
                                            <PasswordRequirement
                                                met={reqs.noSequential}
                                                label={t('passwordUpdate.reqNoSequential', {defaultValue: 'Sin patrones secuenciales (123, abc)'})}
                                                colors={colors}
                                            />
                                            <PasswordRequirement
                                                met={reqs.noRepeated}
                                                label={t('passwordUpdate.reqNoRepeated', {defaultValue: 'Sin caracteres repetidos (aaa, 111)'})}
                                                colors={colors}
                                            />
                                        </View>

                                        {/* Campo confirmar contraseña */}
                                        <View style={styles.passwordFieldWrapper}>
                                            <TextInput
                                                ref={confirmPasswordRef}
                                                style={[styles.passwordModalInput, {
                                                    borderColor: confirmPassword && newPassword !== confirmPassword
                                                        ? (colors.error ?? '#E53E3E')
                                                        : (colors.border ?? colors.textSecondary + '50'),
                                                    color: colors.text,
                                                    backgroundColor: colors.background,
                                                    paddingRight: 48,
                                                }]}
                                                placeholder={t('passwordUpdate.confirmPassword', {defaultValue: 'Confirmar contraseña'})}
                                                placeholderTextColor={colors.textSecondary}
                                                secureTextEntry={!showConfirm}
                                                value={confirmPassword}
                                                onChangeText={(v) => {
                                                    setConfirmPassword(v);
                                                    setPasswordError('');
                                                }}
                                                returnKeyType="done"
                                                onSubmitEditing={handlePasswordUpdate}
                                                accessibilityLabel="Confirmar contraseña"
                                                editable={!passwordLoading}
                                            />
                                            <TouchableOpacity
                                                style={styles.eyeButton}
                                                onPress={() => setShowConfirm(!showConfirm)}
                                                accessibilityLabel={showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                                                accessibilityRole="button"
                                            >
                                                <Image
                                                    source={
                                                        showConfirm
                                                            ? require('../../../assets/images/lupa.png')
                                                            : require('../../../assets/images/esconder.png')
                                                    }
                                                    style={{width: 24, height: 24, resizeMode: 'contain'}}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Indicador de coincidencia */}
                                        {confirmPassword.length > 0 && (
                                            <Text style={[styles.passwordMatchIndicator, {
                                                color: newPassword === confirmPassword
                                                    ? (colors.success ?? '#38A169')
                                                    : (colors.error ?? '#E53E3E'),
                                            }]} accessibilityLiveRegion="polite">
                                                {newPassword === confirmPassword
                                                    ? t('passwordUpdate.passwordsMatch', {defaultValue: '✓ Las contraseñas coinciden'})
                                                    : t('passwordUpdate.passwordsNoMatch', {defaultValue: '✗ Las contraseñas no coinciden'})}
                                            </Text>
                                        )}

                                        {/* Error general */}
                                        {passwordError ? (
                                            <View style={[styles.passwordModalErrorRow, {
                                                backgroundColor: (colors.error ?? '#E53E3E') + '12',
                                                borderColor: (colors.error ?? '#E53E3E') + '35',
                                            }]}>
                                                <Text
                                                    style={[styles.passwordModalError, {color: colors.error ?? '#E53E3E'}]}>
                                                    {passwordError}
                                                </Text>
                                            </View>
                                        ) : null}

                                        {/* Botones */}
                                        <View style={styles.passwordModalButtons}>
                                            <View style={{width: '100%'}}>
                                                <PrimaryButton
                                                    title={
                                                        passwordLoading
                                                            ? t('passwordUpdate.saving', {defaultValue: 'Guardando...'})
                                                            : t('passwordUpdate.saveButton', {defaultValue: 'Guardar contraseña'})
                                                    }
                                                    onPress={handlePasswordUpdate}
                                                    disabled={passwordLoading || !allReqsMet}
                                                />
                                            </View>
                                            <TouchableOpacity
                                                onPress={closePasswordModal}
                                                style={styles.passwordModalCancelButton}
                                                accessibilityLabel="Cancelar y descartar cambios"
                                                accessibilityRole="button"
                                            >
                                                <Text style={[styles.passwordModalCancelText, {color: colors.primary}]}>
                                                    {t('common.cancel', {defaultValue: 'Cancelar'})}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Animated.View>
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
}