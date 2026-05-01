import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    SafeAreaView,
    KeyboardAvoidingView,
    TouchableOpacity,
    Platform,
    ScrollView,
    FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../components/auth/PrimaryButton";
import Separador from "../components/common/Separador";
import styles from "./Style";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { useTheme } from '../components/common/ThemeContext'; // ← añadido

export default function ValidJustificationsScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, theme } = useTheme();                   // ← colores dinámicos
    const refreshKey = useLanguageRefresh();
    const [activeSection, setActiveSection] = useState("inasistencias");
    const [updateKey, setUpdateKey] = useState(0);

    useEffect(() => {
        const handleLanguageChanged = (lng) => {
            setUpdateKey(prev => prev + 1);
        };
        setUpdateKey(0); // inicial
        i18n.on('languageChanged', handleLanguageChanged);
        return () => i18n.off('languageChanged', handleLanguageChanged);
    }, []);

    const inasistenciasData = [
        { id: 1, fecha: "2024-03-15", motivo: "Incapacidad médica", estado: t('consultJustify.statusApproved') },
        { id: 2, fecha: "2024-03-10", motivo: "Emergencia familiar", estado: t('consultJustify.statusApproved') },
        { id: 3, fecha: "2024-03-05", motivo: "Cita médica", estado: t('consultJustify.statusPending') },
        { id: 4, fecha: "2024-02-28", motivo: "Problemas de transporte", estado: t('consultJustify.statusApproved') },
    ];

    const retardosData = [
        { id: 1, fecha: "2024-03-18", hora: "08:35 AM", motivo: "Tránsito pesado", estado: t('consultJustify.statusApproved') },
        { id: 2, fecha: "2024-03-12", hora: "08:45 AM", motivo: "Cita médica", estado: t('consultJustify.statusApproved') },
        { id: 3, fecha: "2024-03-08", hora: "08:28 AM", motivo: "Problemas mecánicos", estado: t('consultJustify.statusApproved') },
        { id: 4, fecha: "2024-03-01", hora: "08:50 AM", motivo: "Emergencia personal", estado: t('consultJustify.statusPending') },
    ];

    const handleBack = () => navigation.goBack();

    // Colores para los estados (pueden ser fijos o usar del tema)
    const getEstadoColor = (estado) => {
        return estado === t('consultJustify.statusApproved') ? "#4CAF50" : "#FF9800";
    };

    const renderInasistenciaItem = ({ item }) => (
        <View style={[styles.justificationCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.cardDate, { color: colors.text }]}>{item.fecha}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={[styles.statusText, { color: "#FFFFFF" }]}>{item.estado}</Text>
                </View>
            </View>
            <Text style={[styles.cardReason, { color: colors.textSecondary }]}>{item.motivo}</Text>
        </View>
    );

    const renderRetardoItem = ({ item }) => (
        <View style={[styles.justificationCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
                <View style={styles.dateTimeContainer}>
                    <Text style={[styles.cardDate, { color: colors.text }]}>{item.fecha}</Text>
                    <Text style={[styles.cardTime, { color: colors.textSecondary }]}>{item.hora}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={[styles.statusText, { color: "#FFFFFF" }]}>{item.estado}</Text>
                </View>
            </View>
            <Text style={[styles.cardReason, { color: colors.textSecondary }]}>{item.motivo}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.safeAreaWhite, { backgroundColor: colors.background }]} key={`${refreshKey}-${updateKey}`}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardview}
            >
                <ScrollView
                    style={styles.ScrollView}
                    contentContainerStyle={styles.ScrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.containerValidJustifications}>
                        <Text style={[styles.mainTitleValidJustifications, { color: colors.text }]}>
                            {t('consultJustify.mainTitle')}
                        </Text>
                        <Text style={[styles.subTitleValidJustifications, { color: colors.textSecondary }]}>
                            {t('consultJustify.subtitle')}
                        </Text>

                        <Separador />

                        {/* Selector de pestañas */}
                        <View style={[styles.sectionSelector, { backgroundColor: colors.card }]}>
                            <TouchableOpacity
                                style={[
                                    styles.sectionTab,
                                    { backgroundColor: activeSection === "inasistencias" ? colors.primary : 'transparent' },
                                    activeSection === "inasistencias" && styles.activeSectionTab,
                                ]}
                                onPress={() => setActiveSection("inasistencias")}
                            >
                                <Text style={[
                                    styles.sectionTabText,
                                    { color: activeSection === "inasistencias" ? "#FFFFFF" : colors.textSecondary }
                                ]}>
                                    {t('consultJustify.absences')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sectionTab,
                                    { backgroundColor: activeSection === "retardos" ? colors.primary : 'transparent' },
                                    activeSection === "retardos" && styles.activeSectionTab,
                                ]}
                                onPress={() => setActiveSection("retardos")}
                            >
                                <Text style={[
                                    styles.sectionTabText,
                                    { color: activeSection === "retardos" ? "#FFFFFF" : colors.textSecondary }
                                ]}>
                                    {t('consultJustify.delays')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Contenido dinámico */}
                        {activeSection === "inasistencias" && (
                            <View style={styles.listContainer}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    {t('consultJustify.justifiedAbsences')}
                                </Text>
                                {inasistenciasData.length > 0 ? (
                                    <FlatList
                                        data={inasistenciasData}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={renderInasistenciaItem}
                                        scrollEnabled={false}
                                    />
                                ) : (
                                    <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                            {t('consultJustify.noAbsencesRegistered')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {activeSection === "retardos" && (
                            <View style={styles.listContainer}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    {t('consultJustify.justifiedDelays')}
                                </Text>
                                {retardosData.length > 0 ? (
                                    <FlatList
                                        data={retardosData}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={renderRetardoItem}
                                        scrollEnabled={false}
                                    />
                                ) : (
                                    <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                            {t('consultJustify.noDelaysRegistered')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.buttonContainer}>
                            <PrimaryButton title={t('consultJustify.back')} onPress={handleBack} />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}