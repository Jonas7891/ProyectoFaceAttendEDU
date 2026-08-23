import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {useTranslation} from 'react-i18next';
import {useTheme} from '../../components/common/ThemeContext';
import styles from './style/Style';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const devCodeStore = {};

// Constantes de control
const COOLDOWN_MS = 60000;        // 1 minuto entre envíos (evita spam)
const REQUEST_TIMEOUT_MS = 15000; // 15s máximo por petición

function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function sendRecoveryEmail(email) {
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), REQUEST_TIMEOUT_MS)
    );

    const sendPromise = new Promise(async (resolve, reject) => {
        try {
            // Simula latencia de red
            await new Promise((r) => setTimeout(r, 700));

            const mockExistingEmails = [
                'admin@example.com',
                'student@example.com',
                'teacher@example.com',
            ];

            const normalized = email.toLowerCase();

            if (!mockExistingEmails.includes(normalized)) {
                reject(new Error('not_found'));
                return;
            }

            const code = generateCode();
            devCodeStore[normalized] = code;

            const devCodeTimestamps = {};
            devCodeTimestamps[normalized] = Date.now();

            console.log('─────────────────────────────────────');
            console.log(`🔑 CÓDIGO DE RECUPERACIÓN (DEV MODE)`);
            console.log(`   Email : ${normalized}`);
            console.log(`   Código: ${code}`);
            console.log('─────────────────────────────────────');

            resolve();
        } catch (err) {
            reject(err);
        }
    });

    return Promise.race([sendPromise, timeoutPromise]);
}

// Helper de validación
const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function ForgotPasswordScreen({navigation}) {
    const {t} = useTranslation();
    const {colors} = useTheme();

    const emailInputRef = useRef(null);
    const lastSendAttemptRef = useRef(0);

    // Estados
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    // ✅ Memorización: la validación solo se recalcula cuando cambia el email
    const isEmailValid = useMemo(() => isValidEmail(email), [email]);

    // ✅ El botón se deshabilita si: cargando, email inválido, en cooldown o ya enviado con éxito
    const isButtonDisabled = isLoading || !isEmailValid || cooldownRemaining > 0 || isSuccess;

    // ✅ Mostrar error del campo solo si el usuario ya lo tocó (evita asustar al entrar)
    const showFieldError = emailTouched && !isEmailValid;

    // ✅ Auto-focus al cargar la pantalla
    useEffect(() => {
        const timer = setTimeout(() => emailInputRef.current?.focus(), 400);
        return () => clearTimeout(timer);
    }, []);

    // ✅ Countdown del cooldown: actualiza cada segundo
    useEffect(() => {
        if (cooldownRemaining <= 0) return;

        const timer = setInterval(() => {
            setCooldownRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldownRemaining]);

    // ✅ Handler memorizado para el cambio del email
    const handleEmailChange = useCallback((v) => {
        setEmail(v);
        if (error) setError('');
        if (isSuccess) setIsSuccess(false);
    }, [error, isSuccess]);

    // ✅ Handler principal de envío
    const handleSend = useCallback(async () => {
        // Animación suave para los cambios de layout (errores / success)
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        setError('');
        setIsSuccess(false);

        if (!email.trim()) {
            setError(t('forgotPassword.errorRequired', {defaultValue: 'Ingresa tu correo electrónico.'}));
            return;
        }
        if (!isEmailValid) {
            setError(t('forgotPassword.errorInvalidEmail', {defaultValue: 'El formato del correo no es válido.'}));
            return;
        }

        // ✅ Rate limiting: evita spam del botón
        const now = Date.now();
        const timeSinceLastAttempt = now - lastSendAttemptRef.current;
        if (timeSinceLastAttempt < COOLDOWN_MS) {
            const waitSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastAttempt) / 1000);
            setError(`Debes esperar ${waitSeconds} segundos antes de reintentar.`);
            return;
        }

        lastSendAttemptRef.current = now;
        setCooldownRemaining(Math.ceil(COOLDOWN_MS / 1000));

        try {
            setIsLoading(true);
            Keyboard.dismiss();

            await sendRecoveryEmail(email.trim().toLowerCase());

            setIsLoading(false);
            setIsSuccess(true);
            setEmailTouched(false);

            // Navegar después de mostrar el mensaje de éxito
            setTimeout(() => {
                navigation.navigate('VerifyCodeScreen', {email: email.trim().toLowerCase()});
            }, 1500);
        } catch (err) {
            setIsLoading(false);
            setCooldownRemaining(0); // Liberar cooldown si falla

            if (err.message === 'not_found') {
                // ⚠️ SEGURIDAD: En producción cambiar a mensaje genérico:
                // "Si tu correo está registrado, te enviaremos un código."
                setError(t('forgotPassword.errorNotFound', {defaultValue: 'No encontramos una cuenta con ese correo.'}));
            } else if (err.message === 'timeout') {
                setError('La petición tardó demasiado. Verifica tu conexión e intenta nuevamente.');
            } else {
                setError(t('forgotPassword.errorGeneric', {defaultValue: 'Ocurrió un error. Intenta de nuevo.'}));
            }
        }
    }, [email, isEmailValid, navigation, t]);

    return (
        <SafeAreaView style={[styles.safeAreaWhite, {backgroundColor: colors.backgroundWhite}]}>
            {/* ✅ KeyboardAvoidingView PRIMERO (fix del scroll en Android) */}
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* ✅ ScrollView DENTRO del KeyboardAvoidingView */}
                <ScrollView
                    contentContainerStyle={{flexGrow: 1}}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={[styles.container, {backgroundColor: colors.backgroundWhite}]}>

                            {/* Botón volver: se deshabilita mientras carga */}
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={[styles.backButton, isLoading && {opacity: 0.5}]}
                                disabled={isLoading}
                                activeOpacity={0.7}
                                accessibilityLabel="Volver a la pantalla anterior"
                                accessibilityRole="button"
                            >
                                <Text style={[styles.backButtonText, {color: colors.primary}]}>
                                    ‹ {t('common.back', {defaultValue: 'Volver'})}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.contentContainer}>

                                <Text style={[styles.textoSesion, {color: colors.text}]}>
                                    {t('forgotPassword.title', {defaultValue: 'Recuperar contraseña'})}
                                </Text>

                                <Text style={[styles.textoCredenciales, {color: colors.textSecondary ?? '#666666'}]}>
                                    {t('forgotPassword.description', {
                                        defaultValue: 'Ingresa tu correo y te enviaremos un código para restablecer tu contraseña.',
                                    })}
                                </Text>

                                {/* Input con validación visual en tiempo real */}
                                <View style={styles.inputContainer}>
                                    <Text style={[styles.inputTitulo, {color: colors.text}]}>
                                        {t('forgotPassword.emailLabel', {defaultValue: 'Correo electrónico'})}
                                    </Text>
                                    <TextInput
                                        ref={emailInputRef}
                                        style={[styles.inputEscrito, {
                                            backgroundColor: colors.inputBackground,
                                            borderColor: showFieldError
                                                ? (colors.error ?? '#E53E3E')
                                                : emailTouched && isEmailValid
                                                    ? '#10B981' // verde si es válido
                                                    : (colors.border ?? colors.separator),
                                            color: colors.text,
                                        }]}
                                        onChangeText={handleEmailChange}
                                        onBlur={() => setEmailTouched(true)}
                                        value={email}
                                        placeholder={t('forgotPassword.emailPlaceholder', {defaultValue: 'tucorreo@ejemplo.com'})}
                                        placeholderTextColor={colors.textMuted}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="send"
                                        onSubmitEditing={handleSend}
                                        editable={!isLoading && !isSuccess}
                                        accessibilityLabel="Correo electrónico"
                                        accessibilityHint="Ingresa tu correo para recibir el código de recuperación"
                                    />
                                </View>

                                {/* Mensaje de error */}
                                {error ? (
                                    <View style={[styles.recoveryErrorBox, {
                                        backgroundColor: (colors.error ?? '#E53E3E') + '12',
                                        borderColor: (colors.error ?? '#E53E3E') + '35',
                                    }]}>
                                        <Text style={[styles.recoveryErrorText, {color: colors.error ?? '#E53E3E'}]}>
                                            {error}
                                        </Text>
                                    </View>
                                ) : null}

                                {/* ✅ Mensaje de éxito antes de navegar */}
                                {isSuccess && (
                                    <View style={[styles.recoveryErrorBox, {
                                        backgroundColor: '#10B98112',
                                        borderColor: '#10B98135',
                                    }]}>
                                        <Text style={[styles.recoveryErrorText, {color: '#10B981'}]}>
                                            ✓ Código enviado correctamente. Redirigiendo...
                                        </Text>
                                    </View>
                                )}

                                {/* Botón enviar con estados visuales */}
                                <TouchableOpacity
                                    style={[styles.recoveryPrimaryButton, {
                                        backgroundColor: isButtonDisabled
                                            ? (colors.primary + '60')
                                            : colors.primary,
                                        opacity: isButtonDisabled ? 0.7 : 1,
                                    }]}
                                    onPress={handleSend}
                                    disabled={isButtonDisabled}
                                    activeOpacity={0.8}
                                    accessibilityLabel={
                                        isLoading
                                            ? "Enviando código"
                                            : cooldownRemaining > 0
                                                ? `Espera ${cooldownRemaining} segundos`
                                                : "Enviar código de recuperación"
                                    }
                                    accessibilityRole="button"
                                    accessibilityState={{disabled: isButtonDisabled, busy: isLoading}}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" size="small"/>
                                    ) : cooldownRemaining > 0 ? (
                                        <Text style={styles.recoveryPrimaryButtonText}>
                                            Reintentar en {cooldownRemaining}s
                                        </Text>
                                    ) : (
                                        <Text style={styles.recoveryPrimaryButtonText}>
                                            {t('forgotPassword.sendButton', {defaultValue: 'Enviar código'})}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}