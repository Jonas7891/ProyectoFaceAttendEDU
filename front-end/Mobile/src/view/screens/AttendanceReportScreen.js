import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { useCustomAlert } from '../components/common/useCustomAlert';
import CustomAlert from '../components/common/CustomAlert';
import styles from './Style';
import {useAttendanceReportViewModel} from "../../viewmodels/useAttendanceReportViewModel";

// ===========================================================================
// CONSTANTES DE TOPE
// ===========================================================================
const ABSENCE_LIMIT = 3;
const LATENESS_LIMIT = 6;

// ===========================================================================
// DATOS DE EJEMPLO  (reemplazar por llamadas a tu API/contexto)
// ===========================================================================
const MOCK_STUDENTS = [

];

const MOCK_TEACHERS = [

];

// ===========================================================================
// HELPERS
// ===========================================================================
const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const getAlertLevel = ({ absences, lateness }) => {
    if (absences > ABSENCE_LIMIT) return 'critical';
    if (lateness > LATENESS_LIMIT) return 'warning';
    return 'ok';
};

const clampPct = (val, max) => Math.min(val / max, 1);

// ===========================================================================
// SUB-COMPONENTE: Barra de progreso
// ===========================================================================
function ProgressRow({ label, value, limit, type }) {
    const pct = clampPct(value, limit);
    const over = value > limit;
    const fillStyle =
        type === 'absence'
            ? over ? styles.progressBarFillAbsenceReport : styles.progressBarFillSafeReport
            : over ? styles.progressBarFillLatenessReport : styles.progressBarFillSafeReport;

    return (
        <View style={styles.progressSectionReport}>
            <View style={styles.progressRowReport}>
                <Text style={styles.progressLabelReport}>{label}</Text>
                <Text style={[styles.progressValueReport, !over && { color: '#4CAF50' }]}>
                    {value}/{limit}
                </Text>
            </View>
            <View style={styles.progressBarContainerReport}>
                <View style={[fillStyle, { width: Math.round(pct * 100) + '%' }]} />
            </View>
        </View>
    );
}

// ===========================================================================
// SUB-COMPONENTE: Tarjeta de persona
// ===========================================================================
function PersonCard({ person, onGenerateReport }) {
    const level = getAlertLevel(person);
    const initials = getInitials(person.name);
    const isCrit = level === 'critical';

    return (
        <View style={[styles.studentCardReport, isCrit ? styles.studentCardCriticalReport : styles.studentCardWarningReport]}>

            <View style={styles.studentCardHeaderReport}>
                <View style={styles.studentInfoReport}>
                    <Text style={styles.studentNameReport}>{person.name}</Text>
                    <Text style={styles.studentMetaReport}>{person.code} · {person.course}</Text>
                </View>
                <View style={[styles.alertBadgeReport, isCrit ? styles.alertBadgeCriticalReport : styles.alertBadgeWarningReport]}>
                    <Text style={[styles.alertBadgeTextReport, isCrit ? styles.alertBadgeTextCriticalReport : styles.alertBadgeTextWarningReport]}>
                        {isCrit ? 'CRÍTICO' : 'EN LÍMITE'}
                    </Text>
                </View>
            </View>

            <View style={styles.countersRowReport}>
                <View style={styles.counterItemReport}>
                    <Text style={[styles.counterValueReport, person.absences > ABSENCE_LIMIT ? styles.counterValueOverLimitReport : styles.counterValueNormalReport]}>
                        {person.absences}
                    </Text>
                    <Text style={styles.counterLabelReport}>Inasistencias</Text>
                </View>
                <View style={styles.counterDividerReport} />
                <View style={styles.counterItemReport}>
                    <Text style={[styles.counterValueReport, person.lateness > LATENESS_LIMIT ? styles.counterValueOverLimitReport : styles.counterValueNormalReport]}>
                        {person.lateness}
                    </Text>
                    <Text style={styles.counterLabelReport}>Retardos</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.generateButtonReport, isCrit ? styles.generateButtonAbsenceReport : styles.generateButtonLatenessReport]}
                onPress={() => onGenerateReport(person)}
                activeOpacity={0.75}
            >
                <Text style={[styles.generateButtonTextReport, isCrit ? styles.generateButtonTextAbsenceReport : styles.generateButtonTextLatenessReport]}>
                    Generar reporte individual
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// ===========================================================================
// PANTALLA PRINCIPAL
// ===========================================================================
export default function AttendanceReportScreen({ navigation }) {
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
        summary,
        filteredData,
        handleGenerateIndividual,
        handleConfirmReport,
        handleGenerateAll,
        handleRoleChange
    } = useAttendanceReportViewModel();

    return (
        <SafeAreaView style={styles.safeAreaReport}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* ── HEADER ── */}
            <View style={styles.headerReport}>
                <TouchableOpacity style={styles.headerBackButtonReport} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
                    <Text style={styles.headerBackTextReport}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitleReport}>Reportes de Asistencia</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContentReport} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.containerReport}>

                    {/* ── SELECTOR ROL ── */}
                    <View style={styles.roleSelectorReport}>
                        {[{ key: 'student', label: 'Estudiantes' }, { key: 'teacher', label: 'Profesores' }].map(tab => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[styles.roleTabReport, activeRole === tab.key && styles.roleTabActiveReport]}
                                onPress={() => handleRoleChange(tab.key)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.roleTabTextReport, activeRole === tab.key && styles.roleTabTextActiveReport]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ── SELECTOR TIPO ── */}
                    <View style={styles.typeSelectorReport}>
                        <TouchableOpacity
                            style={[styles.typeTabReport, activeType === 'absence' && styles.typeTabAbsenceActiveReport]}
                            onPress={() => setActiveType('absence')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.typeTabTextReport, activeType === 'absence' && styles.typeTabTextAbsenceActiveReport]}>
                                Inasistencias (tope: {ABSENCE_LIMIT})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.typeTabReport, activeType === 'lateness' && styles.typeTabLatenessActiveReport]}
                            onPress={() => setActiveType('lateness')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.typeTabTextReport, activeType === 'lateness' && styles.typeTabTextLatenessActiveReport]}>
                                Retardos (tope: {LATENESS_LIMIT})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── BUSCADOR ── */}
                    <View style={styles.searchBarContainerReport}>
                        <TextInput
                            style={styles.searchInputReport}
                            placeholder="Buscar por nombre, código o materia…"
                            placeholderTextColor="#BBBBBB"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')} activeOpacity={0.7}>
                                <Text style={{ fontSize: 16, color: '#BBBBBB' }}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* ── CHIPS DE FILTRO ── */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRowReport}>
                        {[
                            { key: 'all', label: 'Todos', activeBg: styles.filterChipAllActiveReport, activeText: styles.filterChipTextAllActiveReport },
                            { key: 'critical', label: 'Críticos', activeBg: styles.filterChipCriticalActiveReport, activeText: styles.filterChipTextCriticalActiveReport },
                            { key: 'warning', label: 'En límite', activeBg: styles.filterChipWarningActiveReport, activeText: styles.filterChipTextWarningActiveReport },
                        ].map(chip => (
                            <TouchableOpacity
                                key={chip.key}
                                style={[styles.filterChipReport, activeFilter === chip.key && chip.activeBg]}
                                onPress={() => setActiveFilter(chip.key)}
                                activeOpacity={0.75}
                            >
                                <Text style={[styles.filterChipTextReport, activeFilter === chip.key && chip.activeText]}>
                                    {chip.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* ── LISTA / ESTADOS ── */}
                    {isLoading ? (
                        <View style={styles.loadingContainerReport}>
                            <ActivityIndicator size="large" color="#4A90E2" />
                            <Text style={styles.loadingTextReport}>Generando reportes…</Text>
                        </View>
                    ) : filteredData.length === 0 ? (
                        <View style={styles.emptyStateReport}>
                            <Text style={styles.emptyStateTitleReport}>Sin alertas</Text>
                            <Text style={styles.emptyStateDescriptionReport}>
                                {'No hay ' + (activeRole === 'student' ? 'estudiantes' : 'profesores') + ' que superen el tope de ' + (activeType === 'absence' ? 'inasistencias' : 'retardos') + ' con los filtros actuales.'}
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.sectionTitleReport}>
                                {filteredData.length + ' ' + (activeRole === 'student' ? 'estudiante(s)' : 'docente(s)') + ' encontrado(s)'}
                            </Text>
                            {filteredData.map(person => (
                                <PersonCard key={person.id} person={person} onGenerateReport={handleGenerateIndividual} />
                            ))}
                        </>
                    )}

                    {/* ── BOTÓN REPORTE GENERAL ── */}
                    {!isLoading && filteredData.length > 0 && (
                        <TouchableOpacity style={styles.mainGenerateButtonReport} onPress={handleGenerateAll} activeOpacity={0.85}>
                            <Text style={styles.mainGenerateButtonTextReport}>
                                {'Generar reporte general (' + filteredData.length + ')'}
                            </Text>
                        </TouchableOpacity>
                    )}

                </View>
            </ScrollView>

            {/* ══════════════════════════════════════════════
                    MODAL DE CONFIRMACIÓN
                ══════════════════════════════════════════════ */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlayReport} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <TouchableOpacity activeOpacity={1} style={styles.modalSheetReport}>
                        <View style={styles.modalHandleReport} />
                        <Text style={styles.modalTitleReport}>Generar reporte</Text>
                        <Text style={styles.modalSubtitleReport}>
                            {'Se notificará al ' + (activeRole === 'student' ? 'acudiente' : 'coordinador') + ' sobre el\nestado de asistencia de '}
                            <Text style={{ fontWeight: '700', color: '#1A1A1A' }}>{selectedPerson?.name}</Text>
                        </Text>

                        {selectedPerson && (
                            <View style={styles.modalInfoRowReport}>
                                <View style={styles.modalInfoItemReport}>
                                    <Text style={[styles.modalInfoValueReport, selectedPerson.absences > ABSENCE_LIMIT && { color: '#F44336' }]}>
                                        {selectedPerson.absences}
                                    </Text>
                                    <Text style={styles.modalInfoLabelReport}>{'Inasistencias\n(tope ' + ABSENCE_LIMIT + ')'}</Text>
                                </View>
                                <View style={styles.modalInfoDividerReport} />
                                <View style={styles.modalInfoItemReport}>
                                    <Text style={[styles.modalInfoValueReport, selectedPerson.lateness > LATENESS_LIMIT && { color: '#FF9800' }]}>
                                        {selectedPerson.lateness}
                                    </Text>
                                    <Text style={styles.modalInfoLabelReport}>{'Retardos\n(tope ' + LATENESS_LIMIT + ')'}</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.modalActionsReport}>
                            <TouchableOpacity style={styles.modalConfirmButtonReport} onPress={handleConfirmReport} activeOpacity={0.85}>
                                <Text style={styles.modalConfirmButtonTextReport}>✓ Confirmar y enviar reporte</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalCancelButtonReport} onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                                <Text style={styles.modalCancelButtonTextReport}>Cancelar</Text>
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