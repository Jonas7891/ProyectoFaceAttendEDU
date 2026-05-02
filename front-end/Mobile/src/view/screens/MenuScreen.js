import React, {useState, useEffect, useCallback} from "react";
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
import {useTranslation} from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {saveLanguageForRole} from "../components/common/languageByRole";
import {useLanguageRefresh} from '../../utils/useLanguageRefresh';
import {useTheme} from '../components/common/ThemeContext';
import DangerButton from "../components/auth/DangerButton";
import CustomLogo from "../components/common/logo";
import {useNavigation, useFocusEffect} from "@react-navigation/native";
import styles from "./Style";

export default function MenuScreen({ onLogout }) {
    const navigation = useNavigation();
    const {t, i18n} = useTranslation();
    const {colors, loadThemeForRole} = useTheme();
    const refreshKey = useLanguageRefresh();

    const [isLoading, setIsLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        const handleLanguageChanged = (lng) => {
            console.log('🔄 MenuScreen: Idioma cambiado a', lng);
            setCurrentLanguage(lng);
            setUpdateKey(prev => prev + 1);
        };

        setCurrentLanguage(i18n.language);
        i18n.on('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const reloadData = async () => {
                try {
                    const role = await AsyncStorage.getItem('userRole');
                    if (!isActive) return;

                    setUserRole(role);

                    const savedLang = await AsyncStorage.getItem('appLanguage');
                    if (savedLang && savedLang !== i18n.language && isActive) {
                        console.log('🔄 Sincronizando idioma al volver:', savedLang);
                        await i18n.changeLanguage(savedLang);
                    }

                    if (role && isActive) {
                        await loadThemeForRole(role);
                    }

                    if (isActive) {
                        setUpdateKey(prev => prev + 1);
                    }
                } catch (error) {
                    console.error('Error en reloadData:', error);
                }
            };

            reloadData();

            return () => {
                isActive = false;
            };
        }, [])
    );

    useEffect(() => {
        const init = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                setUserRole(role);
                if (role) await loadThemeForRole(role);
            } catch (error) {
                console.error('Error en init:', error);
            }
        };
        init();
    }, []);

    const isAdmin = userRole === 'admin';

    const handleBack = () => navigation.navigate("DashboardScreen");
    const handleUpdatePhoto = () => navigation.navigate("UpdatePhoto");
    const handleFacialFail = () => navigation.navigate("FacialFail");
    const handleMenuJustify = () => navigation.navigate("MenuJustify");
    const handleSettings = () => navigation.navigate("LanguageSettings");

    const handleLogout = async () => {
        try {
            setIsLoading(true);

            await AsyncStorage.clear();
            await i18n.changeLanguage('es');

            if (onLogout) {
                await onLogout();
            }

        } catch (e) {
            console.error('Error en logout:', e);
            setIsLoading(false);
        }
    };

    const MenuItem = ({label, onPress}) => (
        <>
            <View style={{height: 1, backgroundColor: colors.separator, marginVertical: 10}}/>
            <TouchableOpacity onPress={onPress}>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                    <Text style={[styles.sectionTitleMenu, {color: colors.text}]}>
                        {label}
                    </Text>
                    <Image
                        source={require("../../assets/images/flecha.png")}
                        style={[styles.arrowImage, {tintColor: colors.text}]}
                    />
                </View>
            </TouchableOpacity>
        </>
    );

    return (
        <SafeAreaView
            style={[styles.safeAreaWhite, {backgroundColor: colors.backgroundWhite}]}
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
                                    style={[styles.backIconImage, {tintColor: colors.text}]}
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

                            <Text style={[styles.userText, {color: colors.text}]}>
                                {isAdmin ? "Jonattan Rizo" : "The Jonas"}
                            </Text>

                            {!isAdmin && (
                                <MenuItem label={t('menu.updateFacialParams')} onPress={handleUpdatePhoto}/>
                            )}

                            <MenuItem
                                label={isAdmin
                                    ? t('menu.justificationConfig')
                                    : t('menu.justificationInfo', {defaultValue: 'Información de las Justificaciones'})
                                }
                                onPress={handleMenuJustify}
                            />
                            <MenuItem label={t('menu.appSettings')} onPress={handleSettings}/>
                            <MenuItem label={t('menu.facialRecognitionFail')} onPress={handleFacialFail}/>

                            <DangerButton
                                title={isLoading ? t('menu.loggingOut') : t('menu.logout')}
                                onPress={handleLogout}
                                setIsLoading={setIsLoading}
                                onLogout={onLogout}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}