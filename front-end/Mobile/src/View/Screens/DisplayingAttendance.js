import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image
} from "react-native";
import styles from "./Style";
import BottomBar from "../Components/Common/NavigationBar";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole } from "../Components/Common/languageByRole";

export default function DisplayingAttendance() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [filterType, setFilterType] = useState("nombre");

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

    const handleSettings = () => {
        console.log("Abrir configuración");
    }

    const handleProfile = () => {
        console.log("Abrir perfil");
    }

    const handleSearch = () => {
        console.log("Abrir búsqueda");
    }

    const handleBack = () => {
        console.log("Volver atrás");
        navigation.goBack();
    }

    const asistenciasRecientes = [
        { id: 1, nombre: "Ana Martínez", hora: "08:15 AM", fecha: "2024-03-20" },
        { id: 2, nombre: "Luis Fernández", hora: "08:22 AM", fecha: "2024-03-20" },
        { id: 3, nombre: "Carmen López", hora: "08:30 AM", fecha: "2024-03-19" },
        { id: 4, nombre: "Roberto Díaz", hora: "08:45 AM", fecha: "2024-03-19" },
        { id: 5, nombre: "María González", hora: "08:10 AM", fecha: "2024-03-20" },
        { id: 6, nombre: "Carlos Ruiz", hora: "09:00 AM", fecha: "2024-03-18" },
        { id: 7, nombre: "Laura Méndez", hora: "08:20 AM", fecha: "2024-03-18" },
        { id: 8, nombre: "José Ramírez", hora: "08:35 AM", fecha: "2024-03-20" },
        { id: 9, nombre: "Sofía Torres", hora: "08:50 AM", fecha: "2024-03-19" },
    ];

    const filteredData = asistenciasRecientes.filter(item => {
        if (searchText === "") return true;
        if (filterType === "nombre") {
            return item.nombre.toLowerCase().includes(searchText.toLowerCase());
        } else {
            return item.fecha.includes(searchText);
        }
    });

    const renderItem = ({ item }) => (
        <View style={styles.recentItemHistorical}>
            <View style={styles.recentInfo}>
                <Text style={styles.recentName}>{item.nombre}</Text>
                <Text style={styles.recentTime}>{item.hora}</Text>
                <Text style={styles.recentTime}>{item.fecha}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.containerAttendance}>
                <TouchableOpacity onPress={handleBack} activeOpacity={0.2} style={{ marginBottom: 20 }}>
                    <View style={styles.backIcon}>
                        <Image
                            source={require("../../assets/images/flecha.png")}
                            style={styles.backIconImage}
                        />
                    </View>
                </TouchableOpacity>
                {/* Selector de tipo de filtro */}
                <View style={styles.filterButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, filterType === "nombre" && styles.activeFilter]}
                        onPress={() => {
                            setFilterType("nombre");
                            setSearchText("");
                        }}>
                        <Text style={styles.filterButtonText}>{t('attendance.filterByName')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filterType === "fecha" && styles.activeFilter]}
                        onPress={() => {
                            setFilterType("fecha");
                            setSearchText("");
                        }}>
                        <Text style={styles.filterButtonText}>{t('attendance.filterByDate')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Input de búsqueda */}
                <TextInput
                    style={styles.searchInput}
                    placeholder={filterType === "nombre" ? t('attendance.searchByName') : t('attendance.searchByDate')}
                    value={searchText}
                    onChangeText={setSearchText}
                />

                {/* Lista de asistencias */}
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    style={styles.recentSection}
                />
            </View>
            <BottomBar
                onPressSettings={handleSettings}
                onPressProfile={handleProfile}
                onPressSearch={handleSearch}
            />
        </SafeAreaView>

    );
}