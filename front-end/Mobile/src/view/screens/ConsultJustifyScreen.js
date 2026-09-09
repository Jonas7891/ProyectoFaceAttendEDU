import React from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import PrimaryButton from '../components/auth/PrimaryButton';
import Separador from '../components/common/Separador';
import styles from './Style';
import {useTheme} from '../components/common/ThemeContext';
import {useValidJustificationsViewModel} from '../../viewmodels/useConsultJustifyViewModel';

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

    // Tarjeta con borde propio: evita que "flote" sin definición cuando
    // colors.card y colors.background son tonos muy parecidos en modo oscuro.
    const cardStyle = [
        styles.justificationCard,
        {
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
        },
    ];

    const renderInasistenciaItem = ({ item }) => (
        <View style={cardStyle}>
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
        <View style={cardStyle}>
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
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.containerValidJustifications}>
                        <Text style={[styles.mainTitleValidJustifications, { color: colors.text }]}>
                            {t('consultJustify.mainTitle')}
                        </Text>

                        <Text style={[styles.subTitleValidJustifications, { color: colors.textSecondary }]}>
                            {t('consultJustify.subtitle')}
                        </Text>

                        <Separador />

                        <View
                            style={[
                                styles.sectionSelector,
                                {
                                    backgroundColor: colors.card,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: 12,
                                    padding: 4,
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.sectionTab,
                                    {
                                        backgroundColor:
                                            activeSection === 'inasistencias' ? colors.primary : 'transparent',
                                        borderRadius: 9,
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
                                            fontWeight: activeSection === 'inasistencias' ? '700' : '500',
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
                                        borderRadius: 9,
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
                                            fontWeight: activeSection === 'retardos' ? '700' : '500',
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
                                    <View
                                        style={[
                                            styles.emptyContainer,
                                            {
                                                backgroundColor: colors.card,
                                                borderWidth: 1,
                                                borderColor: colors.border,
                                                borderStyle: 'dashed',
                                            },
                                        ]}
                                    >
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
                                    <View
                                        style={[
                                            styles.emptyContainer,
                                            {
                                                backgroundColor: colors.card,
                                                borderWidth: 1,
                                                borderColor: colors.border,
                                                borderStyle: 'dashed',
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                            {t('consultJustify.noDelaysRegistered')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.buttonContainer}>
                            <PrimaryButton title={t('common.back')} onPress={handleBack}/>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}