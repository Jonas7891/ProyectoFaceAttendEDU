import React, { useEffect, useRef, useState, forwardRef } from 'react';
import {
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguageRefresh } from '../../../utils/useLanguageRefresh';
import { useTheme } from '../../components/common/ThemeContext';
import PrimaryButton from '../../components/auth/PrimaryButton';
import SelectableButton from '../../components/common/SelectableButton';
import CustomLogo from '../../components/common/logo';
import RegisterModal from '../../components/auth/RegisterModal';
import TerminosModal from '../../components/common/TerminosModal';
import ScrollView from '../../components/common/ScrollView';
import CustomAlert from '../../components/common/CustomAlert';
import { useCustomAlert } from '../../components/common/useCustomAlert';
import styles from './style/Style';
import { useLoginViewModel } from '../../../viewmodels/useLoginViewModel';

const MAX_FAILED_ATTEMPTS = 3;

/**
 * Custom Hook: useLoginAttempts (CORREGIDO)
 * Usa refs para evitar ciclos infinitos de dependencias
 */
function useLoginAttempts(error, errorTimestamp, showError, hideAlert, t) {
    const [failedAttempts, setFailedAttempts] = useState(0);
    const forgotLinkOpacity = useRef(new Animated.Value(0)).current;
    const forgotLinkTranslateY = useRef(new Animated.Value(-8)).current;

    // ✅ Refs para funciones - evita dependencias inestables
    const showErrorRef = useRef(showError);
    const hideAlertRef = useRef(hideAlert);
    const tRef = useRef(t);

    // Actualizar refs cuando cambien las funciones
    useEffect(() => {
        showErrorRef.current = showError;
        hideAlertRef.current = hideAlert;
        tRef.current = t;
    }, [showError, hideAlert, t]);

    // ✅ Efecto 1: Reaccionar al error - dependencias estables
    useEffect(() => {
        if (!error) return;

        showErrorRef.current(
            tRef.current('login.errorTitle', { defaultValue: 'Error de inicio de sesión' }),
            error,
            hideAlertRef.current
        );

        setFailedAttempts((prev) => prev + 1);
    }, [error, errorTimestamp]); // Solo estas dos dependencias

    // ✅ Efecto 2: Animación cuando se alcanzan los intentos
    useEffect(() => {
        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            Animated.parallel([
                Animated.timing(forgotLinkOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
                Animated.timing(forgotLinkTranslateY, { toValue: 0, duration: 350, useNativeDriver: true }),
            ]).start();
        }
    }, [failedAttempts, forgotLinkOpacity, forgotLinkTranslateY]);

    const showForgotLink = failedAttempts >= MAX_FAILED_ATTEMPTS;

    const animatedStyles = {
        opacity: forgotLinkOpacity,
        transform: [{ translateY: forgotLinkTranslateY }],
    };

    return { showForgotLink, animatedStyles };
}

/**
 * Componente reutilizable: FormInput
 */
const FormInput = forwardRef(({ label, colors, containerStyle, ...props }, ref) => (
    <View style={[styles.inputContainer, containerStyle]}>
        <Text style={[styles.inputTitulo, { color: colors.text }]}>{label}</Text>
        <TextInput
            ref={ref}
            style={[
                styles.inputEscrito,
                {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border ?? colors.separator,
                    color: colors.text,
                },
            ]}
            placeholderTextColor={colors.textMuted}
            {...props}
        />
    </View>
));

FormInput.displayName = 'FormInput';

/**
 * Pantalla de Login (CORREGIDA)
 */
export default function LoginScreen({ onLogin, navigation }) {
    const refreshKey = useLanguageRefresh();
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { alertConfig, hideAlert, showError } = useCustomAlert();

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);

    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [isTerminosModalVisible, setIsTerminosModalVisible] = useState(false);

    const {
        email, password, terms, isLoading, error, errorTimestamp,
        setEmail, setPassword, setTerms, submit,
    } = useLoginViewModel({ onLogin });

    // Inyección de lógica corregida
    const { showForgotLink, animatedStyles } = useLoginAttempts(
        error, errorTimestamp, showError, hideAlert, t
    );

    const handleForgotPassword = () => {
        navigation?.navigate('ForgotPasswordScreen');
    };

    return (
        <>
            <SafeAreaView
                style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]}
                key={refreshKey}
            >
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
                                <View style={styles.contentContainer}>

                                    <View style={styles.logoContainer}>
                                        <CustomLogo
                                            size="large"
                                            rounded
                                            backgroundColor="#000000"
                                            marginBottom={20}
                                        />
                                    </View>

                                    <Text style={[styles.textoSesion, { color: colors.text }]}>
                                        {t('login.title')}
                                    </Text>

                                    <FormInput
                                        ref={emailInputRef}
                                        label={t('login.email')}
                                        colors={colors}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder={t('login.emailPlaceholder')}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="next"
                                        blurOnSubmit={false}
                                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                                        accessibilityLabel={t('login.email')}
                                    />

                                    <FormInput
                                        ref={passwordInputRef}
                                        label={t('login.password')}
                                        colors={colors}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder={t('login.passwordPlaceholder')}
                                        secureTextEntry
                                        textContentType="password"
                                        returnKeyType="done"
                                        onSubmitEditing={Keyboard.dismiss}
                                        accessibilityLabel={t('login.password')}
                                    />

                                    {showForgotLink && (
                                        <Animated.View style={[styles.forgotPasswordContainer, animatedStyles]}>
                                            <TouchableOpacity
                                                onPress={handleForgotPassword}
                                                activeOpacity={0.7}
                                                accessibilityRole="button"
                                                accessibilityLabel={t('login.forgotPassword', { defaultValue: '¿Olvidaste tu contraseña?' })}
                                            >
                                                <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                                                    {t('login.forgotPassword', { defaultValue: '¿Olvidaste tu contraseña?' })}
                                                </Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    )}

                                    <View style={styles.rowContainer}>
                                        <SelectableButton
                                            checked={terms}
                                            onCheckChange={setTerms}
                                            accessibilityLabel={t('login.terms')}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setIsTerminosModalVisible(true)}
                                            activeOpacity={0.7}
                                            accessibilityRole="button"
                                        >
                                            <Text style={[styles.terminosText, { color: colors.primary }]}>
                                                {t('login.terms')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <PrimaryButton
                                        title={isLoading ? t('login.loading') : t('login.title')}
                                        onPress={submit}
                                        disabled={isLoading}
                                        accessibilityRole="button"
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={() => setIsRegisterModalVisible(true)}
                                    activeOpacity={0.7}
                                    style={styles.sesionNoRegistro}
                                    accessibilityRole="button"
                                    accessibilityLabel={t('login.noAccount')}
                                >
                                    <Text style={[styles.noRegistro, { color: colors.textSecondary }]}>
                                        {t('login.noAccount')}
                                    </Text>
                                </TouchableOpacity>

                                <RegisterModal
                                    isVisible={isRegisterModalVisible}
                                    onClose={() => setIsRegisterModalVisible(false)}
                                />
                                <TerminosModal
                                    isVisible={isTerminosModalVisible}
                                    onClose={() => setIsTerminosModalVisible(false)}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                type={alertConfig.type}
                onClose={hideAlert}
            />
        </>
    );
}