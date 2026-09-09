import React from 'react';
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import {useTheme} from '../components/common/ThemeContext';
import {useTranslation} from 'react-i18next';
import CustomAlert from '../components/common/CustomAlert';
import styles from './Style';
import {useAttendanceReportViewModel} from '../../viewmodels/useAttendanceReportViewModel';

// ===========================================================================
// HELPERS
// ===========================================================================
const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const getAlertLevel = ({ absences, lateness }, ABSENCE_LIMIT, LATENESS_LIMIT) => {
    if (absences > ABSENCE_LIMIT) return 'critical';
    if (lateness > LATENESS_LIMIT) return 'warning';
    return 'ok';
};

const clampPct = (val, max) => Math.min(val / max, 1);

// ===========================================================================
// SUB-COMPONENTE: Barra de progreso
// ===========================================================================
function ProgressRow({ label, value, limit, type, colors }) {
    const pct = clampPct(value, limit);
    const over = value > limit;
    const fillStyle =
        type === 'absence'
            ? over ? styles.progressBarFillAbsenceReport : styles.progressBarFillSafeReport
            : over ? styles.progressBarFillLatenessReport : styles.progressBarFillSafeReport;

    return (
        <View style={styles.progressSectionReport}>
            <View style={styles.progressRowReport}>
                <Text style={[styles.progressLabelReport, { color: colors.text }]}>{label}</Text>
                <Text style={[styles.progressValueReport, { color: over ? '#F44336' : '#4CAF50' }]}>
                    {value}/{limit}
                </Text>
            </View>
            <View style={[styles.progressBarContainerReport, { backgroundColor: colors.border }]}>
                <View style={[fillStyle, { width: Math.round(pct * 100) + '%' }]} />
            </View>
        </View>
    );
}

// ===========================================================================
// SUB-COMPONENTE: Tarjeta de persona
// ===========================================================================
function PersonCard({person, onGenerateReport, ABSENCE_LIMIT, LATENESS_LIMIT, colors, t}) {
    const level = getAlertLevel(person, ABSENCE_LIMIT, LATENESS_LIMIT);
    const isCrit = level === 'critical';

    return (
        <View
            style={[
                styles.studentCardReport,
                isCrit ? styles.studentCardCriticalReport : styles.studentCardWarningReport,
                { borderWidth: 1 },
            ]}
        >
            <View style={styles.studentCardHeaderReport}>
                <View style={styles.studentInfoReport}>
                    <Text style={[styles.studentNameReport, { color: colors.text }]}>{person.name}</Text>
                    <Text style={[styles.studentMetaReport, { color: colors.textSecondary }]}>
                        {person.code} · {person.course}
                    </Text>
                </View>
                <View style={[styles.alertBadgeReport, isCrit ? styles.alertBadgeCriticalReport : styles.alertBadgeWarningReport]}>
                    <Text style={[styles.alertBadgeTextReport, isCrit ? styles.alertBadgeTextCriticalReport : styles.alertBadgeTextWarningReport]}>
                        {isCrit ? t('attendanceReport.statusLabels.critical') : t('attendanceReport.statusLabels.warning')}
                    </Text>
                </View>
            </View>

            <View style={[styles.countersRowReport, { borderColor: colors.border }]}>
                <View style={styles.counterItemReport}>
                    <Text
                        style={[
                            styles.counterValueReport,
                            person.absences > ABSENCE_LIMIT ? styles.counterValueOverLimitReport : { color: colors.text },
                        ]}
                    >
                        {person.absences}
                    </Text>
                    <Text
                        style={[styles.counterLabelReport, {color: colors.textSecondary}]}>{t('attendanceReport.types.absences')}</Text>
                </View>
                <View style={[styles.counterDividerReport, { backgroundColor: colors.border }]} />
                <View style={styles.counterItemReport}>
                    <Text
                        style={[
                            styles.counterValueReport,
                            person.lateness > LATENESS_LIMIT ? styles.counterValueOverLimitReport : { color: colors.text },
                        ]}
                    >
                        {person.lateness}
                    </Text>
                    <Text
                        style={[styles.counterLabelReport, {color: colors.textSecondary}]}>{t('attendanceReport.types.lateness')}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.generateButtonReport, isCrit ? styles.generateButtonAbsenceReport : styles.generateButtonLatenessReport]}
                onPress={() => onGenerateReport(person)}
                activeOpacity={0.75}
            >
                <Text style={[styles.generateButtonTextReport, isCrit ? styles.generateButtonTextAbsenceReport : styles.generateButtonTextLatenessReport]}>
                    {t('attendanceReport.individualReport')}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// ===========================================================================
// PANTALLA PRINCIPAL
// ===========================================================================
export default function AttendanceReportScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const {t} = useTranslation();

    // Los estilos "activos" de Style.js (fondo rosado/celeste pálido) están pensados
    // solo para tema claro. En oscuro generamos un tinte translúcido del mismo color
    // de acento en vez de dejar que se vea una tarjeta clara flotando sobre fondo oscuro.
    const absenceActive = isDark
        ? {
            backgroundColor: '#4A1F1F',
            borderColor: '#C62828',
        }
        : styles.typeTabAbsenceActiveReport;

    const absenceActiveText = isDark
        ? {
            color: '#FF8A80',
            fontWeight: '700',
        }
        : styles.typeTabTextAbsenceActiveReport;

    const latenessActive = isDark
        ? {
            backgroundColor: '#4A3414',
            borderColor: '#F57C00',
        }
        : styles.typeTabLatenessActiveReport;

    const latenessActiveText = isDark
        ? {
            color: '#FFCC80',
            fontWeight: '700',
        }
        : styles.typeTabTextLatenessActiveReport;

    const allChipActive = isDark
        ? { backgroundColor: 'rgba(74,144,226,0.18)', borderColor: colors.primary }
        : styles.filterChipAllActiveReport;
    const allChipActiveText = isDark
        ? { color: colors.primary, fontWeight: '700' }
        : styles.filterChipTextAllActiveReport;

    const criticalChipActive = isDark
        ? { backgroundColor: 'rgba(244,67,54,0.18)', borderColor: '#F44336' }
        : styles.filterChipCriticalActiveReport;
    const criticalChipActiveText = isDark
        ? { color: '#FF6F60', fontWeight: '700' }
        : styles.filterChipTextCriticalActiveReport;

    const warningChipActive = isDark
        ? { backgroundColor: 'rgba(255,152,0,0.18)', borderColor: '#FF9800' }
        : styles.filterChipWarningActiveReport;
    const warningChipActiveText = isDark
        ? { color: '#FFB74D', fontWeight: '700' }
        : styles.filterChipTextWarningActiveReport;

    const {
        ABSENCE_LIMIT,
        LATENESS_LIMIT,
        alertConfig,
        hideAlert,
        activeRole,
        activeType,
        setActiveType,
        activeFilter,
        setActiveFilter,
        searchText,
        setSearchText,
        isLoading,
        selectedPerson,
        modalVisible,
        closeModal, // ⚠️ AJUSTA este nombre al que realmente exponga tu useAttendanceReportViewModel
        summary,
        filteredData,
        handleGenerateIndividual,
        handleConfirmReport,
        handleGenerateAll,
        handleRoleChange,
    } = useAttendanceReportViewModel();

    return (
        <SafeAreaView style={[styles.safeAreaReport, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* ── HEADER ── */}
            <View style={[styles.headerReport, { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.headerBackButtonReport, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                    onPress={() => navigation?.goBack()}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.headerBackTextReport, { color: colors.text }]}>‹</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitleReport, {color: colors.text}]}>{t('attendanceReport.title')}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContentReport} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.containerReport}>

                    {/* ── SELECTOR ROL ── */}
                    <View style={[styles.roleSelectorReport, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                        {[{key: 'student', label: t('attendanceReport.tabs.students')}, {
                            key: 'teacher',
                            label: t('attendanceReport.tabs.teachers')
                        }].map(tab => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[
                                    styles.roleTabReport,
                                    activeRole === tab.key
                                        ? [styles.roleTabActiveReport, { backgroundColor: colors.primary }]
                                        : null,
                                ]}
                                onPress={() => handleRoleChange(tab.key)}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[
                                        styles.roleTabTextReport,
                                        { color: activeRole === tab.key ? '#FFFFFF' : colors.textSecondary },
                                        activeRole === tab.key && { fontWeight: '700' },
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ── SELECTOR TIPO ── */}
                    <View
                        style={[
                            styles.typeSelectorReport,
                            {
                                backgroundColor: isDark ? '#2B2B2B' : '#F0F0F0',
                                borderColor: isDark ? '#444' : '#D8D8D8',
                                borderWidth: 1,
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={[
                                styles.typeTabReport,
                                { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
                                activeType === 'absence' && absenceActive,
                            ]}
                            onPress={() => setActiveType('absence')}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.typeTabTextReport,
                                    {
                                        color:
                                            activeType === 'absence'
                                                ? (isDark ? '#FF8A80' : '#C62828')
                                                : colors.textSecondary,
                                    },
                                    activeType === 'absence' && { fontWeight: '700' },
                                ]}
                            >
                                {t('attendanceReport.absenceLabel', {limit: ABSENCE_LIMIT}).replace(/\n/g, ' ')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.typeTabReport,
                                { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
                                activeType === 'lateness' && latenessActive,
                            ]}
                            onPress={() => setActiveType('lateness')}
                            activeOpacity={0.8}
                        >
                            <Text
                                style={[
                                    styles.typeTabTextReport,
                                    {
                                        color:
                                            activeType === 'absence'
                                                ? (isDark ? '#FF8A80' : '#C62828')
                                                : colors.textSecondary,
                                    },
                                    activeType === 'absence' && { fontWeight: '700' },
                                ]}
                            >
                                {t('attendanceReport.latenessLabel', {limit: LATENESS_LIMIT}).replace(/\n/g, ' ')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── BUSCADOR ── */}
                    <View style={[styles.searchBarContainerReport, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                        <TextInput
                            style={[styles.searchInputReport, { color: colors.text }]}
                            placeholder={t('attendanceReport.searchPlaceholder')}
                            placeholderTextColor={colors.textSecondary}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')} activeOpacity={0.7}>
                                <Text style={{ fontSize: 16, color: colors.textSecondary }}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── CHIPS DE FILTRO ── */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRowReport}>
                        {[
                            {
                                key: 'all',
                                label: t('attendanceReport.filters.all'),
                                activeBg: allChipActive,
                                activeText: allChipActiveText
                            },
                            {
                                key: 'critical',
                                label: t('attendanceReport.filters.critical'),
                                activeBg: criticalChipActive,
                                activeText: criticalChipActiveText
                            },
                            {
                                key: 'warning',
                                label: t('attendanceReport.filters.warning'),
                                activeBg: warningChipActive,
                                activeText: warningChipActiveText
                            },
                        ].map(chip => (
                            <TouchableOpacity
                                key={chip.key}
                                style={[
                                    styles.filterChipReport,
                                    { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
                                    activeFilter === chip.key && chip.activeBg,
                                ]}
                                onPress={() => setActiveFilter(chip.key)}
                                activeOpacity={0.75}
                            >
                                <Text
                                    style={[
                                        styles.filterChipTextReport,
                                        { color: colors.textSecondary },
                                        activeFilter === chip.key && chip.activeText,
                                    ]}
                                >
                                    {chip.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* ── LISTA / ESTADOS ── */}
                    {isLoading ? (
                        <View style={styles.loadingContainerReport}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingTextReport, { color: colors.textSecondary }]}>
                                {t('common.loading')}
                            </Text>
                        </View>
                    ) : filteredData.length === 0 ? (
                        <View style={[styles.emptyStateReport, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                            <Text
                                style={[styles.emptyStateTitleReport, {color: colors.text}]}>{t('attendanceReport.noResults', {
                                role: activeRole === 'student' ? t('attendanceReport.tabs.students').toLowerCase() : t('attendanceReport.tabs.teachers').toLowerCase(),
                                type: activeType === 'absence' ? t('attendanceReport.types.absences').toLowerCase() : t('attendanceReport.types.lateness').toLowerCase()
                            })}</Text>
                            <Text style={[styles.emptyStateDescriptionReport, { color: colors.textSecondary }]}>
                                {t('attendanceReport.noResults', {
                                    role: activeRole === 'student' ? t('attendanceReport.tabs.students').toLowerCase() : t('attendanceReport.tabs.teachers').toLowerCase(),
                                    type: activeType === 'absence' ? t('attendanceReport.types.absences').toLowerCase() : t('attendanceReport.types.lateness').toLowerCase()
                                })}
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={[styles.sectionTitleReport, { color: colors.text }]}>
                                {t('attendanceReport.resultsCount', {
                                    count: filteredData.length,
                                    role: activeRole === 'student' ? t('attendanceReport.tabs.students').toLowerCase() : t('attendanceReport.tabs.teachers').toLowerCase()
                                })}
                            </Text>
                            {filteredData.map(person => (
                                <PersonCard
                                    key={person.id}
                                    person={person}
                                    onGenerateReport={handleGenerateIndividual}
                                    ABSENCE_LIMIT={ABSENCE_LIMIT}
                                    LATENESS_LIMIT={LATENESS_LIMIT}
                                    colors={colors}
                                    t={t}
                                />
                            ))}
                        </>
                    )}

                    {/* ── BOTÓN REPORTE GENERAL ── */}
                    {!isLoading && filteredData.length > 0 && (
                        <TouchableOpacity style={styles.mainGenerateButtonReport} onPress={handleGenerateAll} activeOpacity={0.85}>
                            <Text style={styles.mainGenerateButtonTextReport}>
                                {t('attendanceReport.generateReport', {count: filteredData.length})}
                            </Text>
                        </TouchableOpacity>
                    )}

                </View>
            </ScrollView>

            {/* ══════════════════════════════════════════════
                    MODAL DE CONFIRMACIÓN
                ══════════════════════════════════════════════ */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
                <TouchableOpacity style={styles.modalOverlayReport} activeOpacity={1} onPress={closeModal}>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[styles.modalSheetReport, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
                    >
                        <View style={[styles.modalHandleReport, { backgroundColor: colors.border }]} />
                        <Text
                            style={[styles.modalTitleReport, {color: colors.text}]}>{t('attendanceReport.modalTitle')}</Text>
                        <Text style={[styles.modalSubtitleReport, { color: colors.textSecondary }]}>
                            {t('attendanceReport.notificationMessage', {recipient: activeRole === 'student' ? t('attendanceReport.recipients.guardian') : t('attendanceReport.recipients.coordinator')}) + '\n'}
                            <Text style={{ fontWeight: '700', color: colors.text }}>{selectedPerson?.name}</Text>
                        </Text>

                        {selectedPerson && (
                            <View style={[styles.modalInfoRowReport, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}>
                                <View style={styles.modalInfoItemReport}>
                                    <Text
                                        style={[
                                            styles.modalInfoValueReport,
                                            { color: selectedPerson.absences > ABSENCE_LIMIT ? '#F44336' : colors.text },
                                        ]}
                                    >
                                        {selectedPerson.absences}
                                    </Text>
                                    <Text style={[styles.modalInfoLabelReport, { color: colors.textSecondary }]}>
                                        {t('attendanceReport.absenceLabel', {limit: ABSENCE_LIMIT})}
                                    </Text>
                                </View>
                                <View style={[styles.modalInfoDividerReport, { backgroundColor: colors.border }]} />
                                <View style={styles.modalInfoItemReport}>
                                    <Text
                                        style={[
                                            styles.modalInfoValueReport,
                                            { color: selectedPerson.lateness > LATENESS_LIMIT ? '#FF9800' : colors.text },
                                        ]}
                                    >
                                        {selectedPerson.lateness}
                                    </Text>
                                    <Text style={[styles.modalInfoLabelReport, { color: colors.textSecondary }]}>
                                        {t('attendanceReport.latenessLabel', {limit: LATENESS_LIMIT})}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.modalActionsReport}>
                            <TouchableOpacity style={styles.modalConfirmButtonReport} onPress={handleConfirmReport} activeOpacity={0.85}>
                                <Text
                                    style={styles.modalConfirmButtonTextReport}>✓ {t('attendanceReport.modalConfirm')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalCancelButtonReport, { borderWidth: 1, borderColor: colors.border }]}
                                onPress={closeModal}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.modalCancelButtonTextReport, { color: colors.textSecondary }]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={hideAlert}
                type={alertConfig.type}
            />
        </SafeAreaView>
    );
}