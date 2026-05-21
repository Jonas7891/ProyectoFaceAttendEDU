import React from 'react';
import {
    Text,
    View,
    SafeAreaView,
    KeyboardAvoidingView,
    TouchableOpacity,
    Platform,
    ScrollView,
    FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../components/auth/PrimaryButton';
import Separador from '../components/common/Separador';
import styles from './Style';
import { useTheme } from '../components/common/ThemeContext';
import { useValidJustificationsViewModel } from '../../viewmodels/useConsultJustifyViewModel';

export default function ValidJustificationsScreen() {
    const { t } = useTranslation();
    const { colors } = useTheme();

    const {
        activeSection,
        setActiveSection,
        updateKey,
        inasistenciasData,
        retardosData,
        currentData,
        handleBack,
        getEstadoColor,
    } = useValidJustificationsViewModel();

    const renderInasistenciaItem = ({ item }) => (
        <View style={[styles.justificationCard, { backgroundColor: colors.card }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.cardDate, { color: colors.text }]}>{item.fecha}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={[styles.statusText, { color: '#FFFFFF' }]}>{item.estado}</Text>
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
                    <Text style={[styles.statusText, { color: '#FFFFFF' }]}>{item.estado}</Text>
                </View>
            </View>
            <Text style={[styles.cardReason, { color: colors.textSecondary }]}>{item.motivo}</Text>
        </View>
    );

    return (
        <SafeAreaView
            style={[styles.safeAreaWhite, { backgroundColor: colors.background }]}
            key={`${updateKey}`}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardview}
            >
                <ScrollView
                    style={styles.ScrollView}
                    contentContainerStyle={styles.ScrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.containerValidJustifications}>
                        <Text style={styles.mainTitleValidJustifications}>
                            {t('consultJustify.mainTitle')}
                        </Text>

                        <Text style={styles.subTitleValidJustifications}>
                            {t('consultJustify.subtitle')}
                        </Text>

                        <Separador />
                        <View style={styles.sectionSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.sectionTab,
                                    {
                                        backgroundColor:
                                            activeSection === 'inasistencias' ? colors.primary : 'transparent',
                                    },
                                    activeSection === 'inasistencias' && styles.activeSectionTab,
                                ]}
                                onPress={() => setActiveSection('inasistencias')}
                            >
                                <Text
                                    style={[
                                        styles.sectionTabText,
                                        {
                                            color:
                                                activeSection === 'inasistencias' ? '#FFFFFF' : colors.textSecondary,
                                        },
                                    ]}
                                >
                                    {t('consultJustify.absences')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sectionTab,
                                    {
                                        backgroundColor:
                                            activeSection === 'retardos' ? colors.primary : 'transparent',
                                    },
                                    activeSection === 'retardos' && styles.activeSectionTab,
                                ]}
                                onPress={() => setActiveSection('retardos')}
                            >
                                <Text
                                    style={[
                                        styles.sectionTabText,
                                        {
                                            color:
                                                activeSection === 'retardos' ? '#FFFFFF' : colors.textSecondary,
                                        },
                                    ]}
                                >
                                    {t('consultJustify.delays')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {activeSection === 'inasistencias' && (
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

                        {activeSection === 'retardos' && (
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