import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    SafeAreaView,
    KeyboardAvoidingView,
    TouchableOpacity,
    Platform,
    Image,
    ScrollView,
    FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../components/auth/PrimaryButton";
import Separador from "../components/common/Separador";
import styles from "./Style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLanguageForRole } from "../components/common/languageByRole";

export default function ValidJustificationsScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeSection, setActiveSection] = useState("inasistencias");

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

    // Datos de ejemplo para inasistencias justificadas
    const inasistenciasData = [
        { id: 1, fecha: "2024-03-15", motivo: "Incapacidad médica", estado: t('consultJustify.statusApproved') },
        { id: 2, fecha: "2024-03-10", motivo: "Emergencia familiar", estado: t('consultJustify.statusApproved') },
        { id: 3, fecha: "2024-03-05", motivo: "Cita médica", estado: t('consultJustify.statusPending') },
        { id: 4, fecha: "2024-02-28", motivo: "Problemas de transporte", estado: t('consultJustify.statusApproved') },
    ];

    // Datos de ejemplo para retardos justificados
    const retardosData = [
        { id: 1, fecha: "2024-03-18", hora: "08:35 AM", motivo: "Tránsito pesado", estado: t('consultJustify.statusApproved') },
        { id: 2, fecha: "2024-03-12", hora: "08:45 AM", motivo: "Cita médica", estado: t('consultJustify.statusApproved') },
        { id: 3, fecha: "2024-03-08", hora: "08:28 AM", motivo: "Problemas mecánicos", estado: t('consultJustify.statusApproved') },
        { id: 4, fecha: "2024-03-01", hora: "08:50 AM", motivo: "Emergencia personal", estado: t('consultJustify.statusPending') },
    ];

    const handleBack = () => {
        navigation.goBack();
    };

    const getEstadoColor = (estado) => {
        return estado === t('consultJustify.statusApproved') ? "#4CAF50" : "#FF9800";
    };

    const renderInasistenciaItem = ({ item }) => (
        <View style={styles.justificationCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{item.fecha}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={styles.statusText}>{item.estado}</Text>
                </View>
            </View>
            <Text style={styles.cardReason}>{item.motivo}</Text>
        </View>
    );

    const renderRetardoItem = ({ item }) => (
        <View style={styles.justificationCard}>
            <View style={styles.cardHeader}>
                <View style={styles.dateTimeContainer}>
                    <Text style={styles.cardDate}>{item.fecha}</Text>
                    <Text style={styles.cardTime}>{item.hora}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={styles.statusText}>{item.estado}</Text>
                </View>
            </View>
            <Text style={styles.cardReason}>{item.motivo}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeAreaWhite}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardview}
            >
                <ScrollView
                    style={styles.ScrollView}
                    contentContainerstyle={styles.ScrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.containerValidJustifications}>
                        {/* Título principal */}
                        <Text style={styles.mainTitleValidJustifications}>
                            {t('consultJustify.mainTitle')}
                        </Text>

                        {/* Subtítulo */}
                        <Text style={styles.subTitleValidJustifications}>
                            {t('consultJustify.subtitle')}
                        </Text>

                        <Separador />
                        {/* Selector de sección */}
                        <View style={styles.sectionSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.sectionTab,
                                    activeSection === "inasistencias" && styles.activeSectionTab,
                                ]}
                                onPress={() => setActiveSection("inasistencias")}
                            >
                                <Text
                                    style={[
                                        styles.sectionTabText,
                                        activeSection === "inasistencias" && styles.activeSectionTabText,
                                    ]}
                                >
                                    {t('consultJustify.absences')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sectionTab,
                                    activeSection === "retardos" && styles.activeSectionTab,
                                ]}
                                onPress={() => setActiveSection("retardos")}
                            >
                                <Text
                                    style={[
                                        styles.sectionTabText,
                                        activeSection === "retardos" && styles.activeSectionTabText,
                                    ]}
                                >
                                    {t('consultJustify.delays')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Lista de inasistencias */}
                        {activeSection === "inasistencias" && (
                            <View style={styles.listContainer}>
                                <Text style={styles.sectionTitle}>{t('consultJustify.justifiedAbsences')}</Text>
                                {inasistenciasData.length > 0 ? (
                                    <FlatList
                                        data={inasistenciasData}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={renderInasistenciaItem}
                                        scrollEnabled={false}
                                    />
                                ) : (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>{t('consultJustify.noAbsencesRegistered')}</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Lista de retardos */}
                        {activeSection === "retardos" && (
                            <View style={styles.listContainer}>
                                <Text style={styles.sectionTitle}>{t('consultJustify.justifiedDelays')}</Text>
                                {retardosData.length > 0 ? (
                                    <FlatList
                                        data={retardosData}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={renderRetardoItem}
                                        scrollEnabled={false}
                                    />
                                ) : (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>{t('consultJustify.noDelaysRegistered')}</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Botón Volver */}
                        <View style={styles.buttonContainer}>
                            <PrimaryButton title={t('consultJustify.back')} onPress={handleBack} />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}