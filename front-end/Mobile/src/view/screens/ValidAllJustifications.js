import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { useTheme } from '../components/common/ThemeContext';
import { saveLanguageForRole } from '../components/common/languageByRole';
import LanguageSelector from '../components/common/LanguageSelector';
import styles from "./Style";

export default function JustificationsScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const { colors, loadThemeForRole } = useTheme();
    const [justifications, setJustifications] = useState([]);
    const refreshKey = useLanguageRefresh();
    const [userRole, setUserRole] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [updateKey, setUpdateKey] = useState(0);
    const handleLanguageChange = (newLang) => setSelectedLanguage(newLang);

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

    useEffect(() => {
        loadJustifications();
        const unsubscribe = navigation.addListener('focus', loadJustifications);
        return unsubscribe;
    }, [navigation]);

    const loadJustifications = async () => {
        try {
            const stored = await AsyncStorage.getItem('validJustifications');
            if (stored) {
                setJustifications(JSON.parse(stored));
            } else {
                const defaultData = [
                    { id: "1", type: "Médica", description: "Ausencia por cita médica con especialista", requiresDocument: true, category: "Salud" },
                    { id: "2", type: "Familiar", description: "Ausencia por fallecimiento de familiar directo", requiresDocument: true, category: "Familiar" },
                    { id: "3", type: "Personal", description: "Ausencia por trámite legal inaplazable", requiresDocument: true, category: "Legal" },
                    { id: "4", type: "Académica", description: "Participación en evento académico representando a la institución", requiresDocument: true, category: "Académica" },
                ];
                setJustifications(defaultData);
                await AsyncStorage.setItem('validJustifications', JSON.stringify(defaultData));
            }
        } catch (error) {
            console.error('Error al cargar justificaciones:', error);
        }
    };

    const getJustificationsByCategory = (cat) => justifications.filter(j => j.category === cat);
    const getCategories = () => [...new Set(justifications.map(j => j.category))];

    const renderJustificationItem = (item, index) => (
        <View
            key={item.id}
            style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 16,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                borderLeftWidth: 3,
                borderLeftColor: colors.primary,
            }}
        >
            {/* Fila superior: número + tipo */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                        {index + 1}
                    </Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 }}>
                    {item.type}
                </Text>
            </View>

            {/* Descripción */}
            <Text style={{ color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 12 }}>
                {item.description}
            </Text>

            {/* Separador */}
            <View style={{ height: 1, backgroundColor: colors.separator, marginBottom: 10 }} />

            {/* Footer: badge categoría + requiere doc */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{
                    backgroundColor: colors.badgeBackground,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                }}>
                    <Text style={{ color: colors.badgeText, fontSize: 12, fontWeight: '600' }}>
                        {item.category}
                    </Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    {item.requiresDocument ? t('admin.requiresDocument') : t('admin.noDocumentRequired')}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} key={`${refreshKey}-${updateKey}`}>
            <View style={{ flex: 1, backgroundColor: colors.background }} marginHorizontal={10}>

                {/* ── Header integrado con el fondo ── */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 12,
                    backgroundColor: colors.background,
                }}>
                    <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                        {t("justifications.validList")}
                    </Text>

                    {/* Badge contador — integrado en el header */}
                    <View style={{
                        backgroundColor: colors.primary,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>
                            {justifications.length}
                        </Text>
                    </View>
                </View>

                {/* Línea separadora suave bajo el header */}
                <View style={{ height: 1, backgroundColor: colors.separator, marginHorizontal: 20, marginBottom: 8 }} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerstyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                >
                    {justifications.length > 0 ? (
                        getCategories().map((category) => {
                            const categoryItems = getJustificationsByCategory(category);
                            return (
                                <View key={category} style={{ marginBottom: 24 }}>

                                    {/* Header de categoría */}
                                    <View style={{
                                        backgroundColor: colors.categoryBackground,
                                        borderRadius: 10,
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        marginBottom: 10,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                        <Text style={{ color: colors.categoryText, fontSize: 15, fontWeight: '700' }}>
                                            {category}
                                        </Text>
                                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                                            {categoryItems.length} {t('justifications.items')}
                                        </Text>
                                    </View>

                                    {/* Items de la categoría */}
                                    {categoryItems.map((item, index) =>
                                        renderJustificationItem(item, index)
                                    )}
                                </View>
                            );
                        })
                    ) : (
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Text style={{ fontSize: 40, marginBottom: 16 }}>📋</Text>
                            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                                {t('justifications.noJustifications')}
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: 'center' }}>
                                {t('justifications.noJustificationsDesc')}
                            </Text>
                        </View>
                    )}

                    {/* Botón volver */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            backgroundColor: colors.backButtonBackground,
                            borderRadius: 10,
                            paddingVertical: 14,
                            alignItems: 'center',
                            marginTop: 8,
                            borderWidth: 1,
                            borderColor: colors.separator,
                        }}
                    >
                        <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>
                            ← {t('common.back')}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}