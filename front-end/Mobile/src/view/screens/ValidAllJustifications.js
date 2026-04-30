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
            style={[
                styles.validAllJustificationsItemCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder }
            ]}
        >
            <View style={styles.validAllJustificationsItemHeader}>
                <View style={[
                    styles.validAllJustificationsItemNumber,
                    { backgroundColor: colors.primary }
                ]}>
                    <Text style={styles.validAllJustificationsItemNumberText}>
                        {index + 1}
                    </Text>
                </View>
                <Text style={[
                    styles.validAllJustificationsItemType,
                    { color: colors.text }
                ]}>
                    {item.type}
                </Text>
            </View>


            <View style={[
                styles.validAllJustificationsItemSeparator,
                { backgroundColor: colors.separator }
            ]} />


            <View style={styles.validAllJustificationsItemFooter}>
                <View style={[
                    styles.validAllJustificationsItemBadge,
                    { backgroundColor: colors.badgeBackground }
                ]}>
                    <Text style={[
                        styles.validAllJustificationsItemBadgeText,
                        { color: colors.badgeText }
                    ]}>
                        {item.category}
                    </Text>
                </View>
                <Text style={[
                    styles.validAllJustificationsItemDocText,
                    { color: colors.textMuted }
                ]}>
                    {item.requiresDocument ? t('admin.requiresDocument') : t('admin.noDocumentRequired')}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[
            styles.validAllJustificationsSafeArea,
            { backgroundColor: colors.background }
        ]} key={`${refreshKey}-${updateKey}`}>
            <View style={[
                styles.validAllJustificationsContainer,
                { backgroundColor: colors.background }
            ]} marginHorizontal={10}>

                <View style={[
                    styles.validAllJustificationsHeader,
                    { backgroundColor: colors.background }
                ]}>
                    <Text style={[
                        styles.validAllJustificationsTitle,
                        { color: colors.text }
                    ]}>
                        {t("justifications.validList")}
                    </Text>

                    <View style={[
                        styles.validAllJustificationsBadge,
                        { backgroundColor: colors.primary }
                    ]}>
                        <Text style={styles.validAllJustificationsBadgeText}>
                            {justifications.length}
                        </Text>
                    </View>
                </View>

                <View style={[
                    styles.validAllJustificationsSeparator,
                    { backgroundColor: colors.separator }
                ]} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.validAllJustificationsScrollContent}
                >
                    {justifications.length > 0 ? (
                        getCategories().map((category) => {
                            const categoryItems = getJustificationsByCategory(category);
                            return (
                                <View key={category} style={styles.validAllJustificationsCategorySection}>

                                    <View style={[
                                        styles.validAllJustificationsCategoryHeader,
                                        { backgroundColor: colors.categoryBackground }
                                    ]}>
                                        <Text style={[
                                            styles.validAllJustificationsCategoryTitle,
                                            { color: colors.categoryText }
                                        ]}>
                                            {category}
                                        </Text>
                                        <Text style={[
                                            styles.validAllJustificationsCategoryCount,
                                            { color: colors.textMuted }
                                        ]}>
                                            {categoryItems.length} {t('justifications.items')}
                                        </Text>
                                    </View>

                                    {categoryItems.map((item, index) =>
                                        renderJustificationItem(item, index)
                                    )}
                                </View>
                            );
                        })
                    ) : (
                        <View style={styles.validAllJustificationsEmptyState}>
                            <Text style={styles.validAllJustificationsEmptyIcon}>📋</Text>
                            <Text style={[
                                styles.validAllJustificationsEmptyTitle,
                                { color: colors.text }
                            ]}>
                                {t('justifications.noJustifications')}
                            </Text>
                            <Text style={[
                                styles.validAllJustificationsEmptyDescription,
                                { color: colors.textMuted }
                            ]}>
                                {t('justifications.noJustificationsDesc')}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[
                            styles.validAllJustificationsBackButton,
                            { backgroundColor: colors.backButtonBackground, borderColor: colors.separator }
                        ]}
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