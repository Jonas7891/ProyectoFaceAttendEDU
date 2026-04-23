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
import BottomBar from "../Components/Common/NavigationBar";
import ScrollViewWrapper from "../Components/Common/ScrollView";
import CustomTabs from "../Components/Common/CustomTabs";
import styles from "./Style";
import { saveLanguageForRole } from "../Components/Common/languageByRole";

// Datos por rol
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
    const [refreshKey, setRefreshKey] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [stats, setStats] = useState({
        totalEmpleados: 0,
        presentesHoy: 0,
        ausentesHoy: 0,
        tardanzasHoy: 0,
        porcentajeAsistencia: 0,
    });

    // ─── Inicialización ──────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
            setUserRole(role);
            cargarEstadisticas();

            await restoreLanguageForRole(role);
        };
        init();

        const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

    // ─── Datos ───────────────────────────────────────────────────────────────
    const cargarEstadisticas = () => {
        setStats({
            totalEmpleados: 45,
            presentesHoy: 38,
            ausentesHoy: 5,
            tardanzasHoy: 2,
            porcentajeAsistencia: 84,
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await cargarEstadisticas();
        setRefreshing(false);
    };

    // ─── Navegación ──────────────────────────────────────────────────────────
    const handleSettings = () => navigation.navigate("Menu");
    const handleProfile = () => navigation.navigate("TakePhoto");
    const handleSearch = () => navigation.navigate("DisplayingAttendance");

    // ─── Helpers ─────────────────────────────────────────────────────────────
    const isAdmin = userRole === 'admin';
    const asistenciasRecientes = isAdmin ? ASISTENCIAS_ADMIN : ASISTENCIAS_ESTUDIANTE;

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollViewWrapper>
                <View style={styles.container}>
                    <CustomTabs userRole={userRole} />

                    <View style={styles.informacionContainer}>
                        <Text style={styles.informacionText}>
                            {t('dashboard.recentAttendance')}
                        </Text>

                        <View style={styles.recentSection}>
                            {asistenciasRecientes.map((item) => (
                                <View key={item.id} style={styles.recentItemHistorical}>
                                    <View style={styles.recentInfo}>
                                        <Text style={styles.recentName}>{item.nombre}</Text>
                                        <Text style={styles.recentTime}>{item.hora}</Text>
                                    </View>
                                    <View style={styles.statusBadge}>
                                        <TouchableOpacity>
                                            <Image
                                                source={require("../../assets/images/lupa.png")}
                                                style={styles.iconSearch}
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