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
import { restoreLanguageForRole } from "../components/common/languageByRole";

export default function NewsScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, theme, loadThemeForRole } = useTheme();

    const [refreshKey, setRefreshKey] = useState(0);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
            setUserRole(role);
            await restoreLanguageForRole(role);
            await loadThemeForRole(role);
        };
        init();

        const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                { backgroundColor: colors.background }
            ]}
            key={refreshKey}
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