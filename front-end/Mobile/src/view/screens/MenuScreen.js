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
import styles from "./Style";
import { useMenuViewModel } from '../../viewmodels/useMenuViewModel';

export default function MenuScreen({ onLogout }) {
    const refreshKey = useLanguageRefresh();
    const { t } = useTranslation();
    const { colors } = useTheme();

    const {
        isLoading,
        isAdmin,
        updateKey,
        handleLogout,
        navigateTo,
    } = useMenuViewModel({ onLogout });

    const handleBack = () => navigateTo("DashboardScreen");
    const handleUpdatePhoto = () => navigateTo("UpdatePhoto");
    const handleFacialFail = () => navigateTo("FacialFail");
    const handleMenuJustify = () => navigateTo("MenuJustify");
    const handleSettings = () => navigateTo("LanguageSettings");

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
                    <View style={styles.container} marginHorizontal={10}>
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
    );
}