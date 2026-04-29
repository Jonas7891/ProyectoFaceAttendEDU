import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    SafeAreaView,
    Image,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import BottomBar from "../components/common/NavigationBar";
import ScrollViewWrapper from "../components/common/ScrollView";
import CustomTabs from "../components/common/CustomTabs";
import Separador from "../components/common/Separador";
import styles from "./Style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "../components/common/ThemeContext";
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { saveLanguageForRole } from '../components/common/languageByRole';

export default function NewsScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, theme, loadThemeForRole } = useTheme();

    const refreshKey = useLanguageRefresh();
    const [userRole, setUserRole] = useState(null);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [updateKey, setUpdateKey] = useState(0); // ← AGREGADO: Estado faltante

    // ✅ Listener de idioma y inicialización - SIN dependencia [i18n]
    useEffect(() => {
        const init = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                setUserRole(role);
                if (role) {
                    await loadThemeForRole(role);
                }
            } catch (error) {
                console.error('Error inicializando NewsScreen:', error);
            }
        };
        init();

        // Listener de cambio de idioma
        const handleLanguageChanged = (lng) => {
            console.log('🔄 NewsScreen: Idioma cambiado a', lng);
            setCurrentLanguage(lng);
            setUpdateKey(prev => prev + 1); // Ahora sí existe
        };

        // Establecer idioma inicial
        setCurrentLanguage(i18n.language);

        // Registrar listener
        i18n.on('languageChanged', handleLanguageChanged);

        // Cleanup
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []); // ← Array vacío

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                { backgroundColor: colors.background }
            ]}
            key={`${refreshKey}-${updateKey}`}
        >
            <ScrollViewWrapper>
                <View style={styles.container} marginHorizontal={10}>

                    <CustomTabs userRole={userRole} />

                    {/* Imagen */}
                    <View style={{ marginLeft: 25, marginRight: 25 }}>
                        <Image
                            source={require("../../assets/images/persona.png")}
                            style={{
                                width: "100%",
                                height: 200,
                                marginTop: 40,
                                borderRadius: 10
                            }}
                        />
                    </View>

                    {/* Título */}
                    <View>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginTop: 30,
                                color: theme === 'dark' ? colors.primary : '#000000'
                            }}
                        >
                            {t('news.title')}
                        </Text>

                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "300",
                                marginTop: 15,
                                color: colors.textSecondary
                            }}
                        >
                            {t('news.creationDate')}: {t('news.unknownDate')}
                        </Text>
                    </View>

                    {/* Separador */}
                    <View style={{ marginTop: 15 }}>
                        <Separador />
                    </View>

                    {/* Contenido */}
                    <View style={{ marginHorizontal: Platform.OS === 'android' ? 10 : 0 }}>
                        <Text
                            style={{
                                fontSize: 15,
                                marginTop: 15,
                                textAlign: "justify",
                                color: colors.text
                            }}
                        >
                            {t('news.content')}
                        </Text>
                    </View>

                    <View style={styles.bottomSpace} />
                </View>
            </ScrollViewWrapper>

            <BottomBar />
        </SafeAreaView>
    );
}