import React from "react";
import {
    Text,
    View,
    SafeAreaView,
    KeyboardAvoidingView,
    TouchableOpacity,
    Platform,
    Image,
    ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { useTheme } from '../components/common/ThemeContext';
import DangerButton from "../components/auth/DangerButton";
import CustomLogo from "../components/common/logo";
import CustomAlert from '../components/common/CustomAlert';
import { useCustomAlert } from '../components/common/useCustomAlert';
import styles from "./Style";
import { useMenuViewModel } from '../../viewmodels/useMenuViewModel';

export default function MenuScreen({ onLogout }) {
    const refreshKey = useLanguageRefresh();
    const { t } = useTranslation();
    const { colors } = useTheme();

    const {
        alertConfig,
        hideAlert,
        showConfirm,
        showError,
    } = useCustomAlert();

    const {
        isLoading,
        isAdmin,
        updateKey,
        handleLogout: originalHandleLogout, // este es del ViewModel, hace la lógica final
        navigateTo,
    } = useMenuViewModel({ onLogout });

    // Única confirmación de cierre de sesión
    const handleLogout = () => {
        showConfirm(
            t('menu.logoutConfirmTitle', { defaultValue: 'Cerrar Sesión' }),
            t('menu.logoutConfirmMessage', { defaultValue: '¿Estás seguro de que deseas cerrar sesión?' }),
            async () => {
                // Confirmado: ejecuta la lógica del ViewModel (que ya limpia storage y llama a onLogout si existe)
                try {
                    await originalHandleLogout();
                } catch (error) {
                    console.error('Error en logout:', error);
                    showError(
                        t('common.error', { defaultValue: 'Error' }),
                        t('menu.logoutError', { defaultValue: 'No se pudo cerrar sesión. Intenta de nuevo.' })
                    );
                }
            },
            () => {
                console.log('Logout cancelado por el usuario');
            }
        );
    };

    const handleBack = () => navigateTo("DashboardScreen");
    const handleUpdatePhoto = () => navigateTo("UpdatePhoto");
    const handleFacialFail = () => navigateTo("FacialFail");
    const handleMenuJustify = () => navigateTo("MenuJustify");
    const handleSettings = () => navigateTo("LanguageSettings");
    const handleSchool = () => navigateTo("SchoolConfigurationScreen");

    const MenuItem = ({ label, onPress }) => (
        <>
            <View style={{ height: 1, backgroundColor: colors.separator, marginVertical: 10 }} />
            <TouchableOpacity onPress={onPress}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={[styles.sectionTitleMenu, { color: colors.text }]}>
                        {label}
                    </Text>
                    <Image
                        source={require("../../assets/images/flecha.png")}
                        style={[styles.arrowImage, { tintColor: colors.text }]}
                    />
                </View>
            </TouchableOpacity>
        </>
    );

    return (
        <>
            <SafeAreaView
                style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]}
                key={`${refreshKey}-${updateKey}`}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardview}
                >
                    <ScrollView
                        style={styles.ScrollView}
                        contentContainerStyle={styles.ScrollViewContent}
                    >
                        <View style={[styles.container, {marginTop: Platform.OS === "ios" ? 0 : 15}]} marginHorizontal={10}>
                            <TouchableOpacity onPress={handleBack} activeOpacity={0.2}>
                                <View style={styles.backIcon}>
                                    <Image
                                        source={require("../../assets/images/flecha.png")}
                                        style={[styles.backIconImage, { tintColor: colors.text }]}
                                    />
                                </View>
                            </TouchableOpacity>

                            <View style={styles.containerSesion}>
                                <CustomLogo
                                    size="large"
                                    rounded={true}
                                    backgroundColor="#000000"
                                    marginBottom={15}
                                />

                                <Text style={[styles.userText, { color: colors.text }]}>
                                    {isAdmin ? "Jonattan Rizo" : "The Jonas"}
                                </Text>

                                {!isAdmin && (
                                    <MenuItem
                                        label={t('menu.updateFacialParams')}
                                        onPress={handleUpdatePhoto}
                                    />
                                )}

                                <MenuItem
                                    label={
                                        isAdmin
                                            ? t('menu.justificationConfig')
                                            : t('menu.justificationInfo', {
                                                defaultValue: 'Información de las Justificaciones',
                                            })
                                    }
                                    onPress={handleMenuJustify}
                                />

                                <MenuItem label={t('menu.appSettings')} onPress={handleSettings} />

                                <MenuItem
                                    label={t('menu.facialRecognitionFail')}
                                    onPress={handleFacialFail}
                                />

                                <MenuItem
                                    label={"Configuración de Colegio"}
                                    onPress={handleSchool}
                                />

                                {/* Pasamos handleLogout (que ya tiene la confirmación) como onLogout */}
                                <DangerButton
                                    title={isLoading ? t('menu.loggingOut') : t('menu.logout')}
                                    onLogout={handleLogout}
                                    disabled={isLoading}
                                />
                            </View>
                        </View>
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