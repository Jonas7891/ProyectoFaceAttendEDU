import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from "../components/common/NavigationBar";
import ScrollViewWrapper from "../components/common/ScrollView";
import CustomTabs from "../components/common/CustomTabs";
import { useTheme } from "../components/common/ThemeContext";
import { restoreLanguageForRole } from "../components/common/languageByRole";
import styles from "./Style";

const ASISTENCIAS_ADMIN = [
    { id: 1, nombre: "Ana Martínez", hora: "08:15 AM" },
    { id: 2, nombre: "Luis Fernández", hora: "08:22 AM" },
    { id: 3, nombre: "Carmen López", hora: "08:30 AM" },
    { id: 4, nombre: "Roberto Díaz", hora: "08:45 AM" },
];

const ASISTENCIAS_ESTUDIANTE = [
    { id: 1, nombre: "Ana Martínez", hora: "08:15 AM" },
    { id: 2, nombre: "Luis Fernández", hora: "08:22 AM" },
];

export default function HistoricalScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, theme } = useTheme();

    const [refreshKey, setRefreshKey] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
            setUserRole(role);
            await restoreLanguageForRole(role);
        };
        init();

        const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

    const isAdmin = userRole === 'admin';
    const asistenciasRecientes = isAdmin ? ASISTENCIAS_ADMIN : ASISTENCIAS_ESTUDIANTE;

    const handleSettings = () => navigation.navigate("Menu");
    const handleProfile = () => navigation.navigate("TakePhoto");
    const handleSearch = () => navigation.navigate("DisplayingAttendance");

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: colors.background }]}
        >
            <ScrollViewWrapper>
                <View style={styles.container} marginHorizontal={5}>

                    <CustomTabs userRole={userRole} />

                    <View style={[
                        styles.informacionContainer,
                        theme === 'dark' && { backgroundColor: colors.separator }
                    ]}>
                        <Text
                            style={[
                                styles.informacionText,
                                { color: colors.text }
                            ]}
                        >
                            {t('dashboard.recentAttendance')}
                        </Text>

                        <View style={[styles.recentSection, theme === 'dark' && { backgroundColor: colors.separator }]} >
                            {asistenciasRecientes.map((item) => (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.recentItemHistorical,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: colors.separator,
                                            borderWidth: 1
                                        }
                                    ]}
                                >
                                    <View style={[
                                        styles.recentInfo,
                                        theme === 'dark' && { backgroundColor: colors.card }
                                    ]}>
                                        <Text
                                            style={[
                                                styles.recentName,
                                                { color: colors.text }
                                            ]}
                                        >
                                            {item.nombre}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.recentTime,
                                                { color: colors.textSecondary }
                                            ]}
                                        >
                                            {item.hora}
                                        </Text>
                                    </View>

                                    <View style={styles.statusBadge}>
                                        <TouchableOpacity>
                                            <Image
                                                source={require("../../assets/images/lupa.png")}
                                                style={[
                                                    styles.iconSearch,
                                                    { tintColor: colors.primary }
                                                ]}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.bottomSpace} />
                </View>
            </ScrollViewWrapper>

            <BottomBar
                onPressSettings={handleSettings}
                onPressProfile={handleProfile}
                onPressSearch={handleSearch}
            />
        </SafeAreaView>
    );
}