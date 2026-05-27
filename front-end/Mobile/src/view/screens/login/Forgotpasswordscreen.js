import React, { useState } from 'react';
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../components/common/ThemeContext';
import styles from './style/Style';

// ─────────────────────────────────────────────────────────────────────────────
// MODO DESARROLLO — genera un código alfanumérico de 6 caracteres,
// lo imprime en consola y lo guarda en memoria para que VerifyCodeScreen
// pueda validarlo sin necesidad de una API.
// Reemplazar por la llamada real al backend antes de pasar a producción.
// ─────────────────────────────────────────────────────────────────────────────

// Registro en memoria: { [email]: code }
// Se exporta para que VerifyCodeScreen pueda leerlo directamente.
export const devCodeStore = {};

function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function sendRecoveryEmail(email) {
    // Simula latencia de red
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Lista blanca de correos de prueba que se consideran "existentes"
    const mockExistingEmails = [
        'admin@gmail.com',
        'usuario@gmail.com',
        'profesor@gmail.com',
    ];

    const normalized = email.toLowerCase();

    if (!mockExistingEmails.includes(normalized)) {
        throw new Error('not_found');
    }

    // Genera y persiste el código para esta sesión de prueba
    const code = generateCode();
    devCodeStore[normalized] = code;

    // ✅ Imprime el código en consola para pruebas
    console.log('─────────────────────────────────────');
    console.log(`🔑 CÓDIGO DE RECUPERACIÓN (DEV MODE)`);
    console.log(`   Email : ${normalized}`);
    console.log(`   Código: ${code}`);
    console.log('─────────────────────────────────────');
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ForgotPasswordScreen({ navigation }) {
    const { t } = useTranslation();
    const { colors } = useTheme();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isValidEmail = (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    const handleSend = async () => {
        setError('');

        if (!email.trim()) {
            setError(t('forgotPassword.errorRequired', { defaultValue: 'Ingresa tu correo electrónico.' }));
            return;
        }
        if (!isValidEmail(email)) {
            setError(t('forgotPassword.errorInvalidEmail', { defaultValue: 'El formato del correo no es válido.' }));
            return;
        }

        try {
            setIsLoading(true);
            await sendRecoveryEmail(email.trim().toLowerCase());
            setIsLoading(false);
            navigation.navigate('VerifyCodeScreen', { email: email.trim().toLowerCase() });
        } catch (err) {
            setIsLoading(false);
            if (err.message === 'not_found') {
                setError(t('forgotPassword.errorNotFound', { defaultValue: 'No encontramos una cuenta con ese correo.' }));
            } else {
                setError(t('forgotPassword.errorGeneric', { defaultValue: 'Ocurrió un error. Intenta de nuevo.' }));
            }
        }
    };

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

                            <Text style={[styles.textoSesion, { color: colors.text }]}>
                                {t('forgotPassword.title', { defaultValue: 'Recuperar contraseña' })}
                            </Text>

                            <Text style={[styles.textoCredenciales, { color: colors.textSecondary ?? '#666666' }]}>
                                {t('forgotPassword.description', {
                                    defaultValue: 'Ingresa tu correo y te enviaremos un código para restablecer tu contraseña.',
                                })}
                            </Text>

                            {/* Input correo */}
                            <View style={styles.inputContainer}>
                                <Text style={[styles.inputTitulo, { color: colors.text }]}>
                                    {t('forgotPassword.emailLabel', { defaultValue: 'Correo electrónico' })}
                                </Text>
                                <TextInput
                                    style={[styles.inputEscrito, {
                                        backgroundColor: colors.inputBackground,
                                        borderColor: error
                                            ? (colors.error ?? '#E53E3E')
                                            : (colors.border ?? colors.separator),
                                        color: colors.text,
                                    }]}
                                    onChangeText={(v) => { setEmail(v); setError(''); }}
                                    value={email}
                                    placeholder={t('forgotPassword.emailPlaceholder', { defaultValue: 'tucorreo@ejemplo.com' })}
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="send"
                                    onSubmitEditing={handleSend}
                                />
                            </View>

                            {/* Error */}
                            {error ? (
                                <View style={[styles.recoveryErrorBox, {
                                    backgroundColor: (colors.error ?? '#E53E3E') + '12',
                                    borderColor: (colors.error ?? '#E53E3E') + '35',
                                }]}>
                                    <Text style={[styles.recoveryErrorText, { color: colors.error ?? '#E53E3E' }]}>
                                        {error}
                                    </Text>
                                </View>
                            ) : null}

                            {/* Botón enviar */}
                            <TouchableOpacity
                                style={[styles.recoveryPrimaryButton, {
                                    backgroundColor: isLoading
                                        ? (colors.primary + '80')
                                        : colors.primary,
                                }]}
                                onPress={handleSend}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.recoveryPrimaryButtonText}>
                                        {t('forgotPassword.sendButton', { defaultValue: 'Enviar código' })}
                                    </Text>
                                )}
                            </TouchableOpacity>

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}