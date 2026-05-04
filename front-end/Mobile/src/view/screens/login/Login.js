import React from "react";
import {
    Text,
    View,
    TextInput,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity
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
import styles from "./style/Style";
import { useLoginViewModel } from '../../../viewmodels/useLoginViewModel';

export default function HomesScreen({ onLogin }) {
    const refreshKey = useLanguageRefresh();
    const { t } = useTranslation();
    const { colors } = useTheme();

    // Modales locales (no pertenecen a la lógica de login)
    const [isRegisterModalVisible, setIsRegisterModalVisible] = React.useState(false);
    const [isTerminosModalVisible, setIsTerminosModalVisible] = React.useState(false);

    // ViewModel => toda la lógica de login aquí
    const {
        email,
        password,
        isLoading,
        error,
        setEmail,
        setPassword,
        submit
    } = useLoginViewModel({ onLogin });

    return (
        <SafeAreaView style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]} key={refreshKey}>
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

                                    <View style={styles.rowContainer}>
                                        {/* El botón "recordar" podría manejarse en el ViewModel */}
                                        <SelectableButton selectable={true} initialSelected={false} />
                                        <TouchableOpacity
                                            onPress={() => setIsTerminosModalVisible(true)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.terminosText, { color: colors.primary }]}>
                                                {t('login.terms')}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Botón de login */}
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

                            {/* Modales (sin relación con MVVM del login) */}
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
    );
}