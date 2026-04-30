import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Platform,
    Modal,
} from "react-native";
import styles from "./Style";
import BottomBar from "../components/common/NavigationBar";
import PrimaryButton from "../components/auth/PrimaryButton";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { useTheme } from '../components/common/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveLanguageForRole } from '../components/common/languageByRole';
import LanguageSelector from '../components/common/LanguageSelector';

export default function DisplayingAttendance() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, loadThemeForRole } = useTheme();
    const refreshKey = useLanguageRefresh();
    const [userRole, setUserRole] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [updateKey, setUpdateKey] = useState(0);
    const handleLanguageChange = (newLang) => setSelectedLanguage(newLang);

    const [selectedDate, setSelectedDate] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
            setUserRole(role);
            await loadThemeForRole(role);
        };
        init();

        const handleLanguageChanged = (lng) => {
            setCurrentLanguage(lng);
            setUpdateKey(prev => prev + 1);
        };

        setCurrentLanguage(i18n.language);
        i18n.on('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

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

    const formatDate = (date) => {
        if (!date) return "";
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const formatDateDisplay = (date) => {
        if (!date) return "📅  Fecha";
        return `📅  ${date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    };

    const filteredData = asistenciasRecientes.filter(item => {
        const matchNombre = searchText === ""
            || item.nombre.toLowerCase().includes(searchText.toLowerCase());
        const matchFecha = !selectedDate
            || item.fecha === formatDate(selectedDate);
        return matchNombre && matchFecha;
    });

    const handleOpenPicker = () => {
        setTempDate(selectedDate ?? new Date());
        Platform.OS === 'ios' ? setShowIOSModal(true) : setShowPicker(true);
    };

    const handleAndroidChange = (event, date) => {
        setShowPicker(false);
        if (event.type === 'set' && date) setSelectedDate(date);
    };

    const renderItem = ({ item }) => (
        <View style={[
            styles.recentItemHistorical,
            { backgroundColor: colors.card, borderColor: colors.separator, borderBottomWidth: 1 }
        ]}>
            <View style={styles.recentInfo}>
                <Text style={[styles.recentName, { color: colors.text }]}>{item.nombre}</Text>
                <Text style={[styles.recentTime, { color: colors.textSecondary }]}>{item.hora}</Text>
                <Text style={[styles.recentTime, { color: colors.textMuted }]}>{item.fecha}</Text>
            </View>

            <Image
                source={require("../../assets/images/lupa.png")}
                style={[styles.iconSearch, { tintColor: colors.primary }]}
                marginRight={12}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} key={`${refreshKey}-${updateKey}`}>
            <View style={[styles.containerAttendance, { backgroundColor: colors.background, flex: 1 }]}>

                <View style={styles.headerContainer}>
                    <Text style={[styles.mainTitle, { color: colors.text }]}>
                        {t('attendance.title')}
                    </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 8, marginBottom: 12, marginLeft: 20, marginRight: 20 }}>

                    <View style={{
                        flex: 2.5,
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: colors.inputBackground,
                        borderWidth: 1,
                        borderColor: searchText ? colors.primary : colors.separator,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                    }}>
                        <TextInput
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                color: colors.text,
                                fontSize: 14,
                            }}
                            placeholder={t('attendance.searchByName')}
                            placeholderTextColor={colors.textMuted}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {!searchText && (
                            <Image
                                source={require("../../assets/images/lupa2.png")}
                                style={{ width: 16, height: 16, tintColor: colors.textMuted, marginRight: 8 }}
                            />
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={handleOpenPicker}
                        style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: colors.inputBackground,
                            borderWidth: 1,
                            borderColor: selectedDate ? colors.primary : colors.separator,
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 10,
                        }}
                    >
                        <Text style={{
                            color: selectedDate ? colors.text : colors.textMuted,
                            fontSize: 13,
                            flex: 1,
                        }}
                            numberOfLines={1}
                        >
                            {formatDateDisplay(selectedDate)}
                        </Text>

                        {selectedDate && (
                            <TouchableOpacity
                                onPress={() => setSelectedDate(null)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Text style={{ color: colors.danger, fontSize: 16, fontWeight: "700", marginLeft: 4 }}>
                                    ✕
                                </Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                {(searchText !== "" || selectedDate) && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                            {filteredData.length} {t('attendance.results', { defaultValue: 'resultado(s)' })}
                        </Text>
                        <TouchableOpacity onPress={() => { setSearchText(""); setSelectedDate(null); }}>
                            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>
                                {t('attendance.clearFilters', { defaultValue: 'Limpiar filtros' })}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {showPicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="default"
                        onChange={handleAndroidChange}
                        maximumDate={new Date()}
                    />
                )}

                <Modal
                    transparent
                    visible={showIOSModal}
                    animationType="slide"
                    onRequestClose={() => setShowIOSModal(false)}
                >
                    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
                        <View style={{
                            backgroundColor: colors.card,
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            padding: 16,
                        }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                <TouchableOpacity onPress={() => setShowIOSModal(false)}>
                                    <Text style={{ color: colors.danger, fontSize: 16, fontWeight: "600" }}>
                                        {t('common.cancel')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => { setSelectedDate(tempDate); setShowIOSModal(false); }}>
                                    <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}>
                                        {t('common.accept')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display="spinner"
                                onChange={(_, date) => date && setTempDate(date)}
                                maximumDate={new Date()}
                                style={{ backgroundColor: colors.card }}
                                textColor={colors.text}
                            />
                        </View>
                    </View>
                </Modal>

                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    style={{ flex: 1, backgroundColor: colors.background }}
                    contentContainerstyle={{ paddingBottom: 110 }}
                    ListEmptyComponent={
                        <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 30, fontSize: 14 }}>
                            {t('attendance.noResults', { defaultValue: 'Sin resultados' })}
                        </Text>
                    }
                    ListFooterComponent={
                        <View style={{ paddingVertical: 12 }}>
                            <PrimaryButton
                                title={t('consultJustify.back')}
                                onPress={() => navigation.goBack()}
                            />
                        </View>
                    }
                />
            </View>

            <BottomBar />
        </SafeAreaView>
    );
}