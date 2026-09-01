import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    LayoutAnimation,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    UIManager,
    View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../components/common/ThemeContext';
import { VerificationService } from '../../../services/verificationService';
import styles from './style/Style';

const COOLDOWN_MS = 60000;
const REQUEST_TIMEOUT_MS = 15000;
const CODE_LENGTH = 6;
const NAVIGATION_DELAY_MS = 1500;
const FOCUS_DELAY_MS = 400;

function generateRecoveryCode(length = CODE_LENGTH) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () =>
        charset.charAt(Math.floor(Math.random() * charset.length))
    ).join('');
}

function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

function initializeLayoutAnimations() {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

initializeLayoutAnimations();

const RecoveryErrorType = {
    NOT_FOUND: 'NOT_FOUND',
    TIMEOUT: 'TIMEOUT',
    GENERIC: 'GENERIC',
};

class RecoveryError extends Error {
    constructor(type, message) {
        super(message);
        this.type = type;
        this.name = 'RecoveryError';
    }
}

const PasswordRecoveryService = {
    _devCodeStore: new Map(),
    _devTimestamps: new Map(),

    async sendRecoveryEmail(email) {
        await this._simulateNetworkLatency();

        const normalizedEmail = email.toLowerCase().trim();
        const existingEmails = ['admin@example.com', 'student@example.com', 'teacher@example.com'];

        if (!existingEmails.includes(normalizedEmail)) {
            throw new RecoveryError(RecoveryErrorType.NOT_FOUND, 'Email no encontrado');
        }

        VerificationService.sendRecoveryCode(normalizedEmail);
    },

    async _simulateNetworkLatency() {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new RecoveryError(RecoveryErrorType.TIMEOUT, 'Timeout de red'));
            }, REQUEST_TIMEOUT_MS);

            const latencyId = setTimeout(() => {
                clearTimeout(timeoutId);
                resolve();
            }, 700);

            return () => {
                clearTimeout(timeoutId);
                clearTimeout(latencyId);
            };
        });
    },

    _logRecoveryCode(email, code) {
        console.log('─────────────────────────────────────');
        console.log('🔑 CÓDIGO DE RECUPERACIÓN');
        console.log(`   Email : ${email}`);
        console.log(`   Código: ${code}`);
        console.log('─────────────────────────────────────');
    },
};

function useCooldown(initialSeconds = 0) {
    const [remaining, setRemaining] = useState(initialSeconds);
    const timerRef = useRef(null);

    useEffect(() => {
        if (remaining <= 0) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [remaining]);

    const startCooldown = useCallback((seconds) => {
        setRemaining(seconds);
    }, []);

    const resetCooldown = useCallback(() => {
        setRemaining(0);
    }, []);

    return {
        remaining,
        isActive: remaining > 0,
        startCooldown,
        resetCooldown,
    };
}

function useEmailValidation() {
    const [email, setEmail] = useState('');
    const [touched, setTouched] = useState(false);

    const isValid = useMemo(() => isValidEmail(email), [email]);
    const showError = touched && !isValid;

    const handleChange = useCallback((value) => {
        setEmail(value);
        if (touched && value.length === 0) {
            setTouched(false);
        }
    }, [touched]);

    const handleBlur = useCallback(() => {
        setTouched(true);
    }, []);

    const reset = useCallback(() => {
        setEmail('');
        setTouched(false);
    }, []);

    return {
        email,
        touched,
        isValid,
        showError,
        handleChange,
        handleBlur,
        reset,
    };
}

function usePasswordRecovery({ onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const lastAttemptRef = useRef(0);
    const cooldown = useCooldown();

    const canSubmit = useMemo(() => {
        return !isLoading && !cooldown.isActive && !isSuccess;
    }, [isLoading, cooldown.isActive, isSuccess]);


    const _validateRateLimit = useCallback(() => {
        const now = Date.now();
        const timeSinceLastAttempt = now - lastAttemptRef.current;

        if (timeSinceLastAttempt < COOLDOWN_MS) {
            const waitSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastAttempt) / 1000);
            throw new Error(`Debes esperar ${waitSeconds} segundos antes de reintentar.`);
        }

        lastAttemptRef.current = now;
        cooldown.startCooldown(Math.ceil(COOLDOWN_MS / 1000));
    }, [cooldown]);

    const sendRecovery = useCallback(async (email) => {
        try {
            setError(null);
            setIsSuccess(false);

            // Validaciones
            if (!email.trim()) {
                throw new Error('Ingresa tu correo electrónico.');
            }

            if (!isValidEmail(email)) {
                throw new Error('El formato del correo no es válido.');
            }

            _validateRateLimit();

            setIsLoading(true);
            Keyboard.dismiss();

            await PasswordRecoveryService.sendRecoveryEmail(email);

            setIsSuccess(true);

            if (onSuccess) {
                setTimeout(() => onSuccess(email), NAVIGATION_DELAY_MS);
            }
        } catch (err) {
            cooldown.resetCooldown();

            if (err instanceof RecoveryError) {
                setError({
                    type: err.type,
                    message: err.message,
                });
            } else {
                setError({
                    type: RecoveryErrorType.GENERIC,
                    message: err.message || 'Ocurrió un error. Intenta de nuevo.',
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [onSuccess, cooldown, _validateRateLimit]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        isSuccess,
        canSubmit,
        cooldown,
        sendRecovery,
        clearError,
    };
}

const FormInput = React.forwardRef(({
                                        label,
                                        error,
                                        isValid,
                                        touched,
                                        colors,
                                        disabled,
                                        ...props
                                    }, ref) => {
    const borderColor = useMemo(() => {
        if (error && touched) return colors.error ?? '#E53E3E';
        if (isValid && touched) return '#10B981';
        return colors.border ?? colors.separator;
    }, [error, isValid, touched, colors]);

    return (
        <View style={styles.inputContainer}>
            <Text style={[styles.inputTitulo, { color: colors.text }]}>
                {label}
            </Text>
            <TextInput
                ref={ref}
                style={[
                    styles.inputEscrito,
                    {
                        backgroundColor: colors.inputBackground,
                        borderColor,
                        color: colors.text,
                    },
                ]}
                placeholderTextColor={colors.textMuted}
                editable={!disabled}
                {...props}
            />
        </View>
    );
});

FormInput.displayName = 'FormInput';

const AlertBox = ({ type, message, colors }) => {
    const isError = type === 'error';
    const backgroundColor = isError
        ? (colors.error ?? '#E53E3E') + '12'
        : '#10B98112';
    const borderColor = isError
        ? (colors.error ?? '#E53E3E') + '35'
        : '#10B98135';
    const textColor = isError
        ? (colors.error ?? '#E53E3E')
        : '#10B981';

    return (
        <View style={[
            styles.recoveryErrorBox,
            { backgroundColor, borderColor }
        ]}>
            <Text style={[styles.recoveryErrorText, { color: textColor }]}>
                {type === 'success' && '✓ '}
                {message}
            </Text>
        </View>
    );
};

const SubmitButton = ({
                          isLoading,
                          cooldown,
                          disabled,
                          onPress,
                          labels
                      }) => {
    const backgroundColor = disabled
        ? (labels.colors.primary + '60')
        : labels.colors.primary;

    const accessibilityLabel = useMemo(() => {
        if (isLoading) return 'Enviando código';
        if (cooldown.isActive) return `Espera ${cooldown.remaining} segundos`;
        return 'Enviar código de recuperación';
    }, [isLoading, cooldown]);

    return (
        <TouchableOpacity
            style={[
                styles.recoveryPrimaryButton,
                { backgroundColor, opacity: disabled ? 0.7 : 1 }
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled, busy: isLoading }}
        >
            {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
            ) : cooldown.isActive ? (
                <Text style={styles.recoveryPrimaryButtonText}>
                    Reintentar en {cooldown.remaining}s
                </Text>
            ) : (
                <Text style={styles.recoveryPrimaryButtonText}>
                    {labels.sendButton}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export default function ForgotPasswordScreen({ navigation }) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const emailInputRef = useRef(null);

    const emailValidation = useEmailValidation();
    const recovery = usePasswordRecovery({
        onSuccess: (email) => {
            navigation.navigate('VerifyCodeScreen', {
                email: email.toLowerCase().trim()
            });
        },
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            emailInputRef.current?.focus();
        }, FOCUS_DELAY_MS);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (recovery.error) {
            recovery.clearError();
        }
    }, [emailValidation.email]);

    const handleSend = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        recovery.sendRecovery(emailValidation.email);
    }, [emailValidation.email, recovery]);

    const handleBack = useCallback(() => {
        if (!recovery.isLoading) {
            navigation.goBack();
        }
    }, [navigation, recovery.isLoading]);

    const labels = useMemo(() => ({
        title: t('forgotPassword.title', { defaultValue: 'Recuperar contraseña' }),
        description: t('forgotPassword.description', {
            defaultValue: 'Ingresa tu correo y te enviaremos un código para restablecer tu contraseña.',
        }),
        emailLabel: t('forgotPassword.emailLabel', { defaultValue: 'Correo electrónico' }),
        emailPlaceholder: t('forgotPassword.emailPlaceholder', { defaultValue: 'tucorreo@ejemplo.com' }),
        sendButton: t('forgotPassword.sendButton', { defaultValue: 'Enviar código' }),
        errorRequired: t('forgotPassword.errorRequired', { defaultValue: 'Ingresa tu correo electrónico.' }),
        errorInvalidEmail: t('forgotPassword.errorInvalidEmail', { defaultValue: 'El formato del correo no es válido.' }),
        errorNotFound: t('forgotPassword.errorNotFound', { defaultValue: 'No encontramos una cuenta con ese correo.' }),
        errorTimeout: t('forgotPassword.errorTimeout', { defaultValue: 'La petición tardó demasiado. Verifica tu conexión e intenta nuevamente.' }),
        errorGeneric: t('forgotPassword.errorGeneric', { defaultValue: 'Ocurrió un error. Intenta de nuevo.' }),
        successMessage: t('forgotPassword.successMessage', { defaultValue: 'Código enviado correctamente. Redirigiendo...' }),
        colors,
    }), [t, colors]);

    const errorMessage = useMemo(() => {
        if (!recovery.error) return null;

        switch (recovery.error.type) {
            case RecoveryErrorType.NOT_FOUND:
                return labels.errorNotFound;
            case RecoveryErrorType.TIMEOUT:
                return labels.errorTimeout;
            default:
                return recovery.error.message || labels.errorGeneric;
        }
    }, [recovery.error, labels]);

    return (
        <SafeAreaView style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                        <View style={[styles.container, { backgroundColor: colors.backgroundWhite }]}>

                            <TouchableOpacity
                                onPress={handleBack}
                                style={[styles.backButton, recovery.isLoading && { opacity: 0.5 }]}
                                disabled={recovery.isLoading}
                                activeOpacity={0.7}
                                accessibilityLabel="Volver a la pantalla anterior"
                                accessibilityRole="button"
                            >
                                <Text style={[styles.backButtonText, { color: colors.primary }]}>
                                    ‹ {t('common.back', { defaultValue: 'Volver' })}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.contentContainer}>

                                <Text style={[styles.textoSesion, { color: colors.text }]}>
                                    {labels.title}
                                </Text>

                                <Text style={[styles.textoCredenciales, { color: colors.textSecondary ?? '#666666' }]}>
                                    {labels.description}
                                </Text>

                                <FormInput
                                    ref={emailInputRef}
                                    label={labels.emailLabel}
                                    error={recovery.error}
                                    isValid={emailValidation.isValid}
                                    touched={emailValidation.touched}
                                    colors={colors}
                                    disabled={recovery.isLoading || recovery.isSuccess}
                                    value={emailValidation.email}
                                    onChangeText={emailValidation.handleChange}
                                    onBlur={emailValidation.handleBlur}
                                    placeholder={labels.emailPlaceholder}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="send"
                                    onSubmitEditing={handleSend}
                                    accessibilityLabel="Correo electrónico"
                                    accessibilityHint="Ingresa tu correo para recibir el código de recuperación"
                                />

                                {errorMessage && (
                                    <AlertBox
                                        type="error"
                                        message={errorMessage}
                                        colors={colors}
                                    />
                                )}

                                {recovery.isSuccess && (
                                    <AlertBox
                                        type="success"
                                        message={labels.successMessage}
                                        colors={colors}
                                    />
                                )}

                                <SubmitButton
                                    isLoading={recovery.isLoading}
                                    cooldown={recovery.cooldown}
                                    disabled={!recovery.canSubmit || !emailValidation.isValid}
                                    onPress={handleSend}
                                    labels={labels}
                                />

                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}