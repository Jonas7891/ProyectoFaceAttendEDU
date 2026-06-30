import React, { useEffect, useRef } from "react";
import {
    Text,
    View,
    TextInput,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguageRefresh } from '../../../utils/useLanguageRefresh';
import { useTheme } from '../../components/common/ThemeContext';
import PrimaryButton from "../../components/auth/PrimaryButton";
import SelectableButton from "../../components/common/SelectableButton";
import CustomLogo from "../../components/common/logo";
import RegisterModal from '../../components/auth/RegisterModal';
import TerminosModal from "../../components/common/TerminosModal";
import ScrollView from "../../components/common/ScrollView";
import CustomAlert from '../../components/common/CustomAlert';
import { useCustomAlert } from '../../components/common/useCustomAlert';
import styles from "./style/Style";
import { useLoginViewModel } from '../../../viewmodels/useLoginViewModel';

// Número de intentos fallidos antes de mostrar el enlace de recuperación
const MAX_FAILED_ATTEMPTS = 3;

export default function HomesScreen({ onLogin, navigation }) {
    const refreshKey = useLanguageRefresh();
    const { t } = useTranslation();
    const { colors } = useTheme();

    const { alertConfig, hideAlert, showError } = useCustomAlert();

    const [isRegisterModalVisible, setIsRegisterModalVisible] = React.useState(false);
    const [isTerminosModalVisible, setIsTerminosModalVisible] = React.useState(false);
    const [failedAttempts, setFailedAttempts] = React.useState(0);

    // Animación para mostrar el link de recuperación
    const forgotLinkOpacity = useRef(new Animated.Value(0)).current;
    const forgotLinkTranslateY = useRef(new Animated.Value(-8)).current;

    const {
        email,
        password,
        terms,
        isLoading,
        error,
        errorTimestamp,
        setEmail,
        setPassword,
        setTerms,
        submit,
    } = useLoginViewModel({ onLogin });

    // Cada vez que el ViewModel reporta un error, incrementamos el contador
    useEffect(() => {
        if (error) {
            const newCount = failedAttempts + 1;
            setFailedAttempts(newCount);

            showError(
                t('login.errorTitle', { defaultValue: 'Error de inicio de sesión' }),
                error,
                hideAlert
            );

            // Animar la aparición del link cuando se llega a MAX_FAILED_ATTEMPTS
            if (newCount >= MAX_FAILED_ATTEMPTS) {
                Animated.parallel([
                    Animated.timing(forgotLinkOpacity, {
                        toValue: 1,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                    Animated.timing(forgotLinkTranslateY, {
                        toValue: 0,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        }
    }, [error, errorTimestamp]);

    const showForgotLink = failedAttempts >= MAX_FAILED_ATTEMPTS;

    const handleForgotPassword = () => {
        // Navega a la pantalla de recuperación de contraseña
        if (navigation) {
            navigation.navigate('ForgotPasswordScreen');
        }
    };

    return (
        <>
            <SafeAreaView
                style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]}
                key={refreshKey}
            >
                <ScrollView>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "position" : "position"}
                        style={styles.keyboardview}
                        keyboardDismissMode="on-drag"
                        keyboardVerticalOffset={80}
                        enableOnAndroid={true}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={[styles.container, { backgroundColor: colors.backgroundWhite }]}>
                                <View style={styles.contentContainer}>

                                    <View style={styles.logoContainer}>
                                        <CustomLogo
                                            size="large"
                                            rounded={true}
                                            backgroundColor="#000000"
                                            marginBottom={20}
                                        />
                                    </View>

                                    <Text style={[styles.textoSesion, { color: colors.text }]}>
                                        {t('login.title')}
                                    </Text>

                                    {/* Campo Email */}
                                    <View style={styles.inputContainer}>
                                        <Text style={[styles.inputTitulo, { color: colors.text }]}>
                                            {t('login.email')}
                                        </Text>
                                        <TextInput
                                            style={[styles.inputEscrito, {
                                                backgroundColor: colors.inputBackground,
                                                borderColor: colors.border ?? colors.separator,
                                                color: colors.text,
                                            }]}
                                            onChangeText={setEmail}
                                            value={email}
                                            placeholder={t('login.emailPlaceholder')}
                                            placeholderTextColor={colors.textMuted}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            returnKeyType="next"
                                            blurOnSubmit={false}
                                        />
                                    </View>

                                    {/* Campo Contraseña */}
                                    <View style={styles.inputContainer}>
                                        <Text style={[styles.inputTitulo, { color: colors.text }]}>
                                            {t('login.password')}
                                        </Text>
                                        <TextInput
                                            style={[styles.inputEscrito, {
                                                backgroundColor: colors.inputBackground,
                                                borderColor: colors.border ?? colors.separator,
                                                color: colors.text,
                                            }]}
                                            onChangeText={setPassword}
                                            value={password}
                                            placeholder={t('login.passwordPlaceholder')}
                                            secureTextEntry={true}
                                            textContentType="password"
                                            placeholderTextColor={colors.textMuted}
                                            returnKeyType="done"
                                        />

                                        {/* Link "¿Olvidaste tu contraseña?" — aparece tras 3 intentos fallidos */}
                                        {showForgotLink && (
                                            <Animated.View
                                                style={[
                                                    styles.forgotPasswordContainer,
                                                    {
                                                        opacity: forgotLinkOpacity,
                                                        transform: [{ translateY: forgotLinkTranslateY }],
                                                    },
                                                ]}
                                            >
                                                <TouchableOpacity
                                                    onPress={handleForgotPassword}
                                                    activeOpacity={0.7}
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
                                            />
                                            <TouchableOpacity
                                                onPress={() => { setIsTerminosModalVisible(true); }}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[styles.terminosText, { color: colors.primary }]}>
                                                    {t('login.terms')}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <PrimaryButton
                                        title={isLoading ? t('login.loading') : t('login.title')}
                                        onPress={submit}
                                        disabled={isLoading}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={() => setIsRegisterModalVisible(true)}
                                    activeOpacity={0.7}
                                    style={styles.sesionNoRegistro}
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
                    </KeyboardAvoidingView>
                </ScrollView>
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