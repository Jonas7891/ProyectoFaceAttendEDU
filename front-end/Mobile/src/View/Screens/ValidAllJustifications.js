import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from "../../Utils/i18n";

export default function JustificationsScreen() {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [justifications, setJustifications] = useState([]);

    useEffect(() => {
        loadJustifications();

        const unsubscribe = navigation.addListener('focus', () => {
            loadJustifications();
        });

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        const init = async () => {
            const role = await AsyncStorage.getItem('userRole');
            setUserRole(role);
        };
        init();

        const handleLanguageChange = () => setRefreshKey(prev => prev + 1);
        i18n.on('languageChanged', handleLanguageChange);
        return () => i18n.off('languageChanged', handleLanguageChange);
    }, [i18n]);

    const loadJustifications = async () => {
        try {
            const stored = await AsyncStorage.getItem('validJustifications');
            if (stored) {
                const data = JSON.parse(stored);
                setJustifications(data);
            } else {
                const defaultData = [
                    {
                        id: "1",
                        type: "Médica",
                        description: "Ausencia por cita médica con especialista",
                        requiresDocument: true,
                        category: "Salud",
                    },
                    {
                        id: "2",
                        type: "Familiar",
                        description: "Ausencia por fallecimiento de familiar directo",
                        requiresDocument: true,
                        category: "Familiar",
                    },
                    {
                        id: "3",
                        type: "Personal",
                        description: "Ausencia por trámite legal inaplazable",
                        requiresDocument: true,
                        category: "Legal",
                    },
                    {
                        id: "4",
                        type: "Académica",
                        description: "Participación en evento académico representando a la institución",
                        requiresDocument: true,
                        category: "Académica",
                    },
                ];
                setJustifications(defaultData);
                await AsyncStorage.setItem('validJustifications', JSON.stringify(defaultData));
            }
        } catch (error) {
            console.error('Error al cargar justificaciones:', error);
        }
    };

    const handleBack = () => {
        navigation.goBack();
    };

    // Separar justificaciones por categoría
    const getJustificationsByCategory = (category) => {
        return justifications.filter(j => j.category === category);
    };

    // Obtener categorías únicas
    const getCategories = () => {
        return [...new Set(justifications.map(j => j.category))];
    };

    const renderJustificationItem = (item, index) => (
        <View key={item.id} style={styles.justificationItemCardValidJustifi}>
            <View style={styles.justificationItemHeaderValidJustifi}>
                <View style={styles.justificationNumberContainerValidJustifi}>
                    <Text style={styles.justificationNumberTextValidJustifi}>{index + 1}</Text>
                </View>
                <View style={styles.justificationTypeContainerValidJustifi}>
                    <Text style={styles.justificationTypeTextValidJustifi}>{item.type}</Text>
                </View>
            </View>

            <Text style={styles.justificationDescriptionTextValidJustifi}>
                {item.description}
            </Text>

            <View style={styles.justificationFooterValidJustifi}>
                <View style={styles.categoryBadgeValidJustifi}>
                    <Text style={styles.categoryBadgeTextValidJustifi}>{item.category}</Text>
                </View>
                <Text style={styles.documentInfoTextValidJustifi}>
                    {item.requiresDocument
                        ? t('admin.requiresDocument')
                        : t('admin.noDocumentRequired')}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeAreaWhiteValidJustifi}>
            <View style={styles.containerJustificationsScreenValidJustifi}>
                {/* Header con botón de regreso */}
                <View style={styles.justificationsHeaderValidJustifi}>
                    <Text style={styles.justificationsTitleValidJustifi}>
                        {t("justifications.validList")}
                    </Text>
                    <Text style={styles.justificationsCountValidJustifi}>
                        {justifications.length}
                    </Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.justificationsScrollContentValidJustifi}
                >
                    {justifications.length > 0 ? (
                        getCategories().map((category) => {
                            const categoryItems = getJustificationsByCategory(category);
                            return (
                                <View key={category} style={styles.categorySectionValidJustifi}>
                                    {/* Título de categoría */}
                                    <View style={styles.categoryHeaderValidJustifi}>
                                        <View style={styles.categoryInfoValidJustifi}>
                                            <Text style={styles.categoryTitleTextValidJustifi}>
                                                {category}
                                            </Text>
                                            <Text style={styles.categoryCountTextValidJustifi}>
                                                {categoryItems.length} {t('justifications.items')}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Lista de items de la categoría */}
                                    <View style={styles.categoryItemsContainerValidJustifi}>
                                        {categoryItems.map((item, index) =>
                                            renderJustificationItem(item, index)
                                        )}
                                    </View>

                                    {/* Separador entre categorías */}
                                    <View style={styles.categoryDividerValidJustifi} />
                                </View>
                            );
                        })
                    ) : (
                        /* Estado vacío */
                        <View style={styles.emptyStateContainerValidJustifi}>
                            <Text style={styles.emptyStateIconValidJustifi}></Text>
                            <Text style={styles.emptyStateTitleValidJustifi}>
                                {t('justifications.noJustifications')}
                            </Text>
                            <Text style={styles.emptyStateDescriptionValidJustifi}>
                                {t('justifications.noJustificationsDesc')}
                            </Text>
                        </View>
                    )}

                    {/* Botón Volver */}
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.justificationsBackButtonValidJustifi}
                    >
                        <Text style={styles.justificationsBackButtonTextValidJustifi}>
                            ← {t('common.back')}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ========== ESTILOS PARA JUSTIFICATIONS SCREEN ==========

    safeAreaWhiteValidJustifi: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    containerJustificationsScreenValidJustifi: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    // Header
    justificationsHeaderValidJustifi: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 45 : 15,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },

    backButtonValidJustifi: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },

    backButtonTextValidJustifi: {
        fontSize: 20,
        color: '#4A90E2',
        fontWeight: '600',
    },

    justificationsTitleValidJustifi: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
        textAlign: 'center',
    },

    justificationsCountValidJustifi: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        backgroundColor: '#4A90E2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },

    // Contenido del scroll
    justificationsScrollContentValidJustifi: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },

    // Sección de categoría
    categorySectionValidJustifi: {
        marginBottom: 10,
    },

    categoryHeaderValidJustifi: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },

    categoryIconContainerValidJustifi: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    categoryIconValidJustifi: {
        fontSize: 24,
    },

    categoryInfoValidJustifi: {
        flex: 1,
    },

    categoryTitleTextValidJustifi: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 4,
    },

    categoryCountTextValidJustifi: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },

    categoryArrowValidJustifi: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },

    categoryArrowTextValidJustifi: {
        fontSize: 20,
        color: '#4A90E2',
        fontWeight: '600',
    },

    // Contenedor de items
    categoryItemsContainerValidJustifi: {
        paddingLeft: 10,
        marginBottom: 5,
    },

    // Item de justificación
    justificationItemCardValidJustifi: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },

    justificationItemHeaderValidJustifi: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },

    justificationNumberContainerValidJustifi: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },

    justificationNumberTextValidJustifi: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4A90E2',
    },

    justificationTypeContainerValidJustifi: {
        flex: 1,
    },

    justificationTypeTextValidJustifi: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },

    documentRequiredBadgeValidJustifi: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },

    documentRequiredTextValidJustifi: {
        fontSize: 16,
    },

    justificationDescriptionTextValidJustifi: {
        fontSize: 14,
        color: '#555',
        lineHeight: 22,
        marginBottom: 12,
        paddingLeft: 38,
    },

    justificationFooterValidJustifi: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 38,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },

    categoryBadgeValidJustifi: {
        backgroundColor: '#E8F4FD',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },

    categoryBadgeTextValidJustifi: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4A90E2',
    },

    documentInfoTextValidJustifi: {
        fontSize: 11,
        color: '#999',
        fontWeight: '500',
    },

    // Divider entre categorías
    categoryDividerValidJustifi: {
        height: 8,
        backgroundColor: '#F5F5F5',
        marginVertical: 10,
        borderRadius: 4,
    },

    // Estado vacío
    emptyStateContainerValidJustifi: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 20,
    },

    emptyStateIconValidJustifi: {
        fontSize: 64,
        marginBottom: 20,
    },

    emptyStateTitleValidJustifi: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },

    emptyStateDescriptionValidJustifi: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 22,
    },

    // Botón volver secundario
    justificationsBackButtonValidJustifi: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },

    justificationsBackButtonTextValidJustifi: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A90E2',
    },
});