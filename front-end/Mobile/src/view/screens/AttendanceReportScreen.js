    import React, {useState, useMemo, useCallback} from 'react';
    import {
        View,
        Text,
        ScrollView,
        TouchableOpacity,
        TextInput,
        Modal,
        SafeAreaView,
        StatusBar,
        StyleSheet,
        ActivityIndicator,
        Alert,
        Platform,
    } from 'react-native';

    // ===========================================================================
    // CONSTANTES DE TOPE
    // ===========================================================================
    const ABSENCE_LIMIT  = 3;
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

    const getAlertLevel = ({absences, lateness}) => {
        if (absences > ABSENCE_LIMIT)  return 'critical';
        if (lateness > LATENESS_LIMIT) return 'warning';
        return 'ok';
    };

    const clampPct = (val, max) => Math.min(val / max, 1);

    // ===========================================================================
    // SUB-COMPONENTE: Barra de progreso
    // ===========================================================================
    function ProgressRow({label, value, limit, type}) {
        const pct  = clampPct(value, limit);
        const over = value > limit;
        const fillStyle =
            type === 'absence'
                ? over ? s.progressBarFillAbsenceReport  : s.progressBarFillSafeReport
                : over ? s.progressBarFillLatenessReport : s.progressBarFillSafeReport;

        return (
            <View style={s.progressSectionReport}>
                <View style={s.progressRowReport}>
                    <Text style={s.progressLabelReport}>{label}</Text>
                    <Text style={[s.progressValueReport, !over && {color: '#4CAF50'}]}>
                        {value}/{limit}
                    </Text>
                </View>
                <View style={s.progressBarContainerReport}>
                    <View style={[fillStyle, {width: Math.round(pct * 100) + '%'}]} />
                </View>
            </View>
        );
    }

    // ===========================================================================
    // SUB-COMPONENTE: Tarjeta de persona
    // ===========================================================================
    function PersonCard({person, onGenerateReport}) {
        const level    = getAlertLevel(person);
        const initials = getInitials(person.name);
        const isCrit   = level === 'critical';

        return (
            <View style={[s.studentCardReport, isCrit ? s.studentCardCriticalReport : s.studentCardWarningReport]}>

                <View style={s.studentCardHeaderReport}>
                    <View style={s.studentInfoReport}>
                        <Text style={s.studentNameReport}>{person.name}</Text>
                        <Text style={s.studentMetaReport}>{person.code} · {person.course}</Text>
                    </View>
                    <View style={[s.alertBadgeReport, isCrit ? s.alertBadgeCriticalReport : s.alertBadgeWarningReport]}>
                        <Text style={[s.alertBadgeTextReport, isCrit ? s.alertBadgeTextCriticalReport : s.alertBadgeTextWarningReport]}>
                            {isCrit ? 'CRÍTICO' : 'EN LÍMITE'}
                        </Text>
                    </View>
                </View>

                <View style={s.countersRowReport}>
                    <View style={s.counterItemReport}>
                        <Text style={[s.counterValueReport, person.absences > ABSENCE_LIMIT ? s.counterValueOverLimitReport : s.counterValueNormalReport]}>
                            {person.absences}
                        </Text>
                        <Text style={s.counterLabelReport}>Inasistencias</Text>
                    </View>
                    <View style={s.counterDividerReport} />
                    <View style={s.counterItemReport}>
                        <Text style={[s.counterValueReport, person.lateness > LATENESS_LIMIT ? s.counterValueOverLimitReport : s.counterValueNormalReport]}>
                            {person.lateness}
                        </Text>
                        <Text style={s.counterLabelReport}>Retardos</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[s.generateButtonReport, isCrit ? s.generateButtonAbsenceReport : s.generateButtonLatenessReport]}
                    onPress={() => onGenerateReport(person)}
                    activeOpacity={0.75}
                >
                    <Text style={[s.generateButtonTextReport, isCrit ? s.generateButtonTextAbsenceReport : s.generateButtonTextLatenessReport]}>
                        Generar reporte individual
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ===========================================================================
    // PANTALLA PRINCIPAL
    // ===========================================================================
    export default function AttendanceReportScreen({navigation}) {

        const [activeRole,     setActiveRole]     = useState('student');
        const [activeType,     setActiveType]     = useState('absence');
        const [activeFilter,   setActiveFilter]   = useState('all');
        const [searchText,     setSearchText]     = useState('');
        const [isLoading,      setIsLoading]      = useState(false);
        const [modalVisible,   setModalVisible]   = useState(false);
        const [selectedPerson, setSelectedPerson] = useState(null);

        const rawData = activeRole === 'student' ? MOCK_STUDENTS : MOCK_TEACHERS;

        const filteredData = useMemo(() => {
            let data = rawData.filter(p => {
                if (activeType === 'absence'  && p.absences <= ABSENCE_LIMIT)  return false;
                if (activeType === 'lateness' && p.lateness <= LATENESS_LIMIT) return false;
                const level = getAlertLevel(p);
                if (activeFilter === 'critical' && level !== 'critical') return false;
                if (activeFilter === 'warning'  && level !== 'warning')  return false;
                return true;
            });
            if (searchText.trim()) {
                const q = searchText.toLowerCase();
                data = data.filter(p =>
                    p.name.toLowerCase().includes(q)   ||
                    p.code.toLowerCase().includes(q)   ||
                    p.course.toLowerCase().includes(q),
                );
            }
            return data;
        }, [rawData, activeType, activeFilter, searchText]);

        const summary = useMemo(() => {
            const over = rawData.filter(p =>
                activeType === 'absence' ? p.absences > ABSENCE_LIMIT : p.lateness > LATENESS_LIMIT,
            );
            return {
                critical: over.filter(p => getAlertLevel(p) === 'critical').length,
                warning:  over.filter(p => getAlertLevel(p) === 'warning').length,
                ok:       rawData.length - over.length,
            };
        }, [rawData, activeType]);

        const handleGenerateIndividual = useCallback((person) => {
            setSelectedPerson(person);
            setModalVisible(true);
        }, []);

        const handleConfirmReport = useCallback(() => {
            setModalVisible(false);
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                Alert.alert(
                    'Reporte generado',
                    'El reporte de ' + selectedPerson?.name + ' fue enviado correctamente.',
                    [{text: 'Aceptar'}],
                );
            }, 1800);
        }, [selectedPerson]);

        const handleGenerateAll = useCallback(() => {
            if (filteredData.length === 0) return;
            const roleLabel = activeRole === 'student' ? 'estudiante(s)' : 'docente(s)';
            const typeLabel = activeType === 'absence' ? 'inasistencias' : 'retardos';
            Alert.alert(
                'Generar reporte general',
                'Se generará un reporte para ' + filteredData.length + ' ' + roleLabel + ' con ' + typeLabel + ' superiores al tope. ¿Continuar?',
                [
                    {text: 'Cancelar', style: 'cancel'},
                    {
                        text: 'Confirmar',
                        onPress: () => {
                            setIsLoading(true);
                            setTimeout(() => {
                                setIsLoading(false);
                                Alert.alert('Reportes enviados ✓', filteredData.length + ' reporte(s) generados exitosamente.');
                            }, 2000);
                        },
                    },
                ],
            );
        }, [filteredData, activeRole, activeType]);

        const handleRoleChange = useCallback((role) => {
            setActiveRole(role);
            setSearchText('');
            setActiveFilter('all');
        }, []);

        return (
            <SafeAreaView style={s.safeAreaReport}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

                {/* ── HEADER ── */}
                <View style={s.headerReport}>
                    <TouchableOpacity style={s.headerBackButtonReport} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
                        <Text style={s.headerBackTextReport}>‹</Text>
                    </TouchableOpacity>
                    <Text style={s.headerTitleReport}>Reportes de Asistencia</Text>
                </View>

                <ScrollView contentContainerStyle={s.scrollContentReport} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <View style={s.containerReport}>

                        {/* ── SELECTOR ROL ── */}
                        <View style={s.roleSelectorReport}>
                            {[{key: 'student', label: 'Estudiantes'}, {key: 'teacher', label: 'Profesores'}].map(tab => (
                                <TouchableOpacity
                                    key={tab.key}
                                    style={[s.roleTabReport, activeRole === tab.key && s.roleTabActiveReport]}
                                    onPress={() => handleRoleChange(tab.key)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[s.roleTabTextReport, activeRole === tab.key && s.roleTabTextActiveReport]}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* ── SELECTOR TIPO ── */}
                        <View style={s.typeSelectorReport}>
                            <TouchableOpacity
                                style={[s.typeTabReport, activeType === 'absence' && s.typeTabAbsenceActiveReport]}
                                onPress={() => setActiveType('absence')}
                                activeOpacity={0.8}
                            >
                                <Text style={[s.typeTabTextReport, activeType === 'absence' && s.typeTabTextAbsenceActiveReport]}>
                                    Inasistencias (tope: {ABSENCE_LIMIT})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[s.typeTabReport, activeType === 'lateness' && s.typeTabLatenessActiveReport]}
                                onPress={() => setActiveType('lateness')}
                                activeOpacity={0.8}
                            >
                                <Text style={[s.typeTabTextReport, activeType === 'lateness' && s.typeTabTextLatenessActiveReport]}>
                                    Retardos (tope: {LATENESS_LIMIT})
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── BUSCADOR ── */}
                        <View style={s.searchBarContainerReport}>
                            <TextInput
                                style={s.searchInputReport}
                                placeholder="Buscar por nombre, código o materia…"
                                placeholderTextColor="#BBBBBB"
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            {searchText.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchText('')} activeOpacity={0.7}>
                                    <Text style={{fontSize: 16, color: '#BBBBBB'}}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* ── CHIPS DE FILTRO ── */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterChipsRowReport}>
                            {[
                                {key: 'all',      label: 'Todos',       activeBg: s.filterChipAllActiveReport,      activeText: s.filterChipTextAllActiveReport},
                                {key: 'critical', label: 'Críticos',  activeBg: s.filterChipCriticalActiveReport, activeText: s.filterChipTextCriticalActiveReport},
                                {key: 'warning',  label: 'En límite', activeBg: s.filterChipWarningActiveReport,  activeText: s.filterChipTextWarningActiveReport},
                            ].map(chip => (
                                <TouchableOpacity
                                    key={chip.key}
                                    style={[s.filterChipReport, activeFilter === chip.key && chip.activeBg]}
                                    onPress={() => setActiveFilter(chip.key)}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[s.filterChipTextReport, activeFilter === chip.key && chip.activeText]}>
                                        {chip.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* ── LISTA / ESTADOS ── */}
                        {isLoading ? (
                            <View style={s.loadingContainerReport}>
                                <ActivityIndicator size="large" color="#4A90E2" />
                                <Text style={s.loadingTextReport}>Generando reportes…</Text>
                            </View>
                        ) : filteredData.length === 0 ? (
                            <View style={s.emptyStateReport}>
                                <Text style={s.emptyStateTitleReport}>Sin alertas</Text>
                                <Text style={s.emptyStateDescriptionReport}>
                                    {'No hay ' + (activeRole === 'student' ? 'estudiantes' : 'profesores') + ' que superen el tope de ' + (activeType === 'absence' ? 'inasistencias' : 'retardos') + ' con los filtros actuales.'}
                                </Text>
                            </View>
                        ) : (
                            <>
                                <Text style={s.sectionTitleReport}>
                                    {filteredData.length + ' ' + (activeRole === 'student' ? 'estudiante(s)' : 'docente(s)') + ' encontrado(s)'}
                                </Text>
                                {filteredData.map(person => (
                                    <PersonCard key={person.id} person={person} onGenerateReport={handleGenerateIndividual} />
                                ))}
                            </>
                        )}

                        {/* ── BOTÓN REPORTE GENERAL ── */}
                        {!isLoading && filteredData.length > 0 && (
                            <TouchableOpacity style={s.mainGenerateButtonReport} onPress={handleGenerateAll} activeOpacity={0.85}>
                                <Text style={s.mainGenerateButtonTextReport}>
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
                    <TouchableOpacity style={s.modalOverlayReport} activeOpacity={1} onPress={() => setModalVisible(false)}>
                        <TouchableOpacity activeOpacity={1} style={s.modalSheetReport}>
                            <View style={s.modalHandleReport} />
                            <Text style={s.modalTitleReport}>Generar reporte</Text>
                            <Text style={s.modalSubtitleReport}>
                                {'Se notificará al ' + (activeRole === 'student' ? 'acudiente' : 'coordinador') + ' sobre el\nestado de asistencia de '}
                                <Text style={{fontWeight: '700', color: '#1A1A1A'}}>{selectedPerson?.name}</Text>
                            </Text>

                            {selectedPerson && (
                                <View style={s.modalInfoRowReport}>
                                    <View style={s.modalInfoItemReport}>
                                        <Text style={[s.modalInfoValueReport, selectedPerson.absences > ABSENCE_LIMIT && {color: '#F44336'}]}>
                                            {selectedPerson.absences}
                                        </Text>
                                        <Text style={s.modalInfoLabelReport}>{'Inasistencias\n(tope ' + ABSENCE_LIMIT + ')'}</Text>
                                    </View>
                                    <View style={s.modalInfoDividerReport} />
                                    <View style={s.modalInfoItemReport}>
                                        <Text style={[s.modalInfoValueReport, selectedPerson.lateness > LATENESS_LIMIT && {color: '#FF9800'}]}>
                                            {selectedPerson.lateness}
                                        </Text>
                                        <Text style={s.modalInfoLabelReport}>{'Retardos\n(tope ' + LATENESS_LIMIT + ')'}</Text>
                                    </View>
                                </View>
                            )}

                            <View style={s.modalActionsReport}>
                                <TouchableOpacity style={s.modalConfirmButtonReport} onPress={handleConfirmReport} activeOpacity={0.85}>
                                    <Text style={s.modalConfirmButtonTextReport}>✓ Confirmar y enviar reporte</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.modalCancelButtonReport} onPress={() => setModalVisible(false)} activeOpacity={0.7}>
                                    <Text style={s.modalCancelButtonTextReport}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            </SafeAreaView>
        );
    }

    // ===========================================================================
    // ESTILOS — REPORTE DE INASISTENCIAS Y RETARDOS
    // ===========================================================================
    const s = StyleSheet.create({
        safeAreaReport:             {flex: 1, backgroundColor: '#F5F5F5'},
        containerReport:            {flex: 1, paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 16 : 10},
        scrollContentReport:        {paddingBottom: 40},

        headerReport:               {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 45 : 15, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3},
        headerTitleReport:          {fontSize: 20, fontWeight: '700', color: '#1A1A1A', flex: 1, textAlign: 'center'},
        headerBackButtonReport:     {width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center'},
        headerBackTextReport:       {fontSize: 20, color: '#4A90E2', fontWeight: '600'},
        exportButtonReport:         {width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center'},
        exportIconReport:           {fontSize: 18},

        roleSelectorReport:         {flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 12, padding: 4, marginTop: 20, marginBottom: 16},
        roleTabReport:              {flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10},
        roleTabActiveReport:        {backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2},
        roleTabTextReport:          {fontSize: 14, fontWeight: '600', color: '#999999'},
        roleTabTextActiveReport:    {color: '#1A1A1A'},

        typeSelectorReport:                {flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 12, padding: 4, marginBottom: 20},
        typeTabReport:                     {flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10},
        typeTabAbsenceActiveReport:        {backgroundColor: '#FDECEA'},
        typeTabLatenessActiveReport:       {backgroundColor: '#FFF3E0'},
        typeTabTextReport:                 {fontSize: 13, fontWeight: '600', color: '#999999'},
        typeTabTextAbsenceActiveReport:    {color: '#C62828'},
        typeTabTextLatenessActiveReport:   {color: '#E65100'},

        sectionTitleReport:         {fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12, paddingLeft: 4},

        studentCardReport:              {backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, borderLeftWidth: 4},
        studentCardCriticalReport:      {borderLeftColor: '#F44336'},
        studentCardWarningReport:       {borderLeftColor: '#FF9800'},
        studentCardHeaderReport:        {flexDirection: 'row', alignItems: 'center', marginBottom: 14},
        avatarCircleReport:             {width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12},
        avatarCriticalReport:           {backgroundColor: '#FDECEA'},
        avatarWarningReport:            {backgroundColor: '#FFF3E0'},
        avatarInitialsReport:           {fontSize: 17, fontWeight: '700'},
        avatarInitialsCriticalReport:   {color: '#C62828'},
        avatarInitialsWarningReport:    {color: '#E65100'},
        studentInfoReport:              {flex: 1},
        studentNameReport:              {fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 3},
        studentMetaReport:              {fontSize: 12, color: '#888888'},
        alertBadgeReport:               {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start'},
        alertBadgeCriticalReport:       {backgroundColor: '#FDECEA'},
        alertBadgeWarningReport:        {backgroundColor: '#FFF3E0'},
        alertBadgeTextReport:           {fontSize: 11, fontWeight: '700', letterSpacing: 0.3},
        alertBadgeTextCriticalReport:   {color: '#C62828'},
        alertBadgeTextWarningReport:    {color: '#E65100'},

        countersRowReport:              {flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14, backgroundColor: '#FAFAFA', borderRadius: 10, paddingVertical: 10},
        counterItemReport:              {alignItems: 'center', flex: 1},
        counterDividerReport:           {width: 1, backgroundColor: '#E0E0E0', marginVertical: 4},
        counterValueReport:             {fontSize: 22, fontWeight: '800', marginBottom: 2},
        counterValueOverLimitReport:    {color: '#F44336'},
        counterValueNormalReport:       {color: '#4CAF50'},
        counterLabelReport:             {fontSize: 11, color: '#888888', fontWeight: '500'},
        counterLimitReport:             {fontSize: 10, color: '#BBBBBB', marginTop: 1},

        progressSectionReport:          {marginBottom: 14},
        progressRowReport:              {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5},
        progressLabelReport:            {fontSize: 12, fontWeight: '600', color: '#555555'},
        progressValueReport:            {fontSize: 12, fontWeight: '700', color: '#F44336'},
        progressBarContainerReport:     {height: 7, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden', marginBottom: 8},
        progressBarFillAbsenceReport:   {height: '100%', backgroundColor: '#F44336', borderRadius: 4},
        progressBarFillLatenessReport:  {height: '100%', backgroundColor: '#FF9800', borderRadius: 4},
        progressBarFillSafeReport:      {height: '100%', backgroundColor: '#4CAF50', borderRadius: 4},

        generateButtonReport:               {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, gap: 6},
        generateButtonAbsenceReport:        {borderColor: '#FFCDD2', backgroundColor: '#FDECEA'},
        generateButtonLatenessReport:       {borderColor: '#FFE0B2', backgroundColor: '#FFF3E0'},
        generateButtonTextReport:           {fontSize: 13, fontWeight: '600'},
        generateButtonTextAbsenceReport:    {color: '#C62828'},
        generateButtonTextLatenessReport:   {color: '#E65100'},

        searchBarContainerReport:   {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, borderWidth: 1, borderColor: '#E8E8E8', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1},
        searchIconReport:           {fontSize: 16, color: '#BBBBBB', marginRight: 8},
        searchInputReport:          {flex: 1, fontSize: 14, color: '#333333', paddingVertical: 0},

        mainGenerateButtonReport:       {backgroundColor: '#4A90E2', borderRadius: 14, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginTop: 8, marginBottom: 24, gap: 8, shadowColor: '#4A90E2', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5},
        mainGenerateButtonTextReport:   {fontSize: 16, fontWeight: '700', color: '#FFFFFF'},

        modalOverlayReport:         {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'},
        modalSheetReport:           {backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28},
        modalHandleReport:          {width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 20},
        modalTitleReport:           {fontSize: 19, fontWeight: '700', color: '#1A1A1A', marginBottom: 6, textAlign: 'center'},
        modalSubtitleReport:        {fontSize: 13, color: '#888888', textAlign: 'center', marginBottom: 24, lineHeight: 20},
        modalInfoRowReport:         {flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 14, marginBottom: 20},
        modalInfoItemReport:        {alignItems: 'center', flex: 1},
        modalInfoValueReport:       {fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4},
        modalInfoLabelReport:       {fontSize: 11, color: '#888888', textAlign: 'center'},
        modalInfoDividerReport:     {width: 1, backgroundColor: '#E0E0E0', marginVertical: 4},
        modalActionsReport:         {gap: 10},
        modalConfirmButtonReport:   {backgroundColor: '#4A90E2', borderRadius: 12, paddingVertical: 15, alignItems: 'center'},
        modalConfirmButtonTextReport: {fontSize: 15, fontWeight: '700', color: '#FFFFFF'},
        modalCancelButtonReport:    {borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0'},
        modalCancelButtonTextReport: {fontSize: 15, fontWeight: '600', color: '#666666'},

        emptyStateReport:               {alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 30},
        emptyStateIconReport:           {fontSize: 56, marginBottom: 16},
        emptyStateTitleReport:          {fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 8, textAlign: 'center'},
        emptyStateDescriptionReport:    {fontSize: 14, color: '#999999', textAlign: 'center', lineHeight: 22},

        loadingContainerReport:     {flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40},
        loadingTextReport:          {marginTop: 12, fontSize: 14, color: '#7F8C8D'},

        filterChipsRowReport:               {flexDirection: 'row', gap: 8, marginBottom: 16},
        filterChipReport:                   {paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: 'transparent'},
        filterChipAllActiveReport:          {backgroundColor: '#E3F2FD', borderColor: '#4A90E2'},
        filterChipCriticalActiveReport:     {backgroundColor: '#FDECEA', borderColor: '#F44336'},
        filterChipWarningActiveReport:      {backgroundColor: '#FFF3E0', borderColor: '#FF9800'},
        filterChipTextReport:               {fontSize: 13, fontWeight: '600', color: '#888888'},
        filterChipTextAllActiveReport:      {color: '#4A90E2'},
        filterChipTextCriticalActiveReport: {color: '#C62828'},
        filterChipTextWarningActiveReport:  {color: '#E65100'},
    });