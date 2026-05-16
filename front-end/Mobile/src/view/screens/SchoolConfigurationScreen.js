import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Switch,
    Platform,
    KeyboardAvoidingView,
    Keyboard,
    Alert,
    Image,
} from 'react-native';
import styles from './Style';

// ─────────────────────────────────────────────
// Sub-componentes FUERA del componente principal
// ─────────────────────────────────────────────

const FormField = ({
                       label,
                       value,
                       onChangeText,
                       placeholder,
                       multiline = false,
                       required = false,
                       editable = true,
                       validationErrors = {},
                   }) => {
    const fieldKey = label.toLowerCase().replace(/\s+/g, '_');
    const hasError = validationErrors[fieldKey];

    return (
        <View style={styles.formGroupSchoolConfig}>
            <Text style={styles.inputLabelSchoolConfig}>
                {label}
                {required && <Text style={styles.inputLabelRequiredSchoolConfig}>*</Text>}
            </Text>
            <View style={{ position: 'relative' }}>
                <TextInput
                    style={[
                        styles.inputFieldSchoolConfig,
                        multiline && styles.textAreaSchoolConfig,
                        hasError && styles.inputFieldErrorSchoolConfig,
                        !editable && styles.inputFieldDisabledSchoolConfig,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    editable={editable}
                />
                {!hasError && value && editable && (
                    <Text style={styles.validationCheckmarkSchoolConfig}>✓</Text>
                )}
                {hasError && (
                    <Text style={styles.validationErrorIconSchoolConfig}>✗</Text>
                )}
            </View>
            {hasError && (
                <Text style={styles.inputErrorMessageSchoolConfig}>{hasError}</Text>
            )}
        </View>
    );
};

const ToggleRow = ({ label, description, value, onValueChange }) => (
    <View style={styles.toggleRowSchoolConfig}>
        <View style={styles.toggleLabelContainerSchoolConfig}>
            <Text style={styles.toggleLabelSchoolConfig}>{label}</Text>
            {description && (
                <Text style={styles.toggleDescriptionSchoolConfig}>{description}</Text>
            )}
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#E0E0E0', true: '#A8D8EA' }}
            thumbColor={value ? '#4A90E2' : '#F0F0F0'}
        />
    </View>
);

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

const SchoolConfigurationScreen = ({ navigation }) => {

    // ── Estados generales ──────────────────────
    const [activeTab, setActiveTab]              = useState('general');
    const [isLoading, setIsLoading]              = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [hasChanges, setHasChanges]            = useState(false);

    // ── Estados de modales ─────────────────────
    const [countryModalVisible, setCountryModalVisible] = useState(false);
    const [cityModalVisible, setCityModalVisible]       = useState(false);

    // ── Estados de países (desde API) ──────────
    const [countryOptions, setCountryOptions]     = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [countrySearch, setCountrySearch]       = useState('');

    // ── Estados de ciudades ────────────────────
    const [citiesOptions, setCitiesOptions] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [citySearch, setCitySearch]       = useState('');

    // ── Formularios ────────────────────────────
    const [generalInfo, setGeneralInfo] = useState({
        schoolName: 'Colegio Municipal San Antonio',
        schoolCode: 'COL-2024-001',
        district:   'Distrito Educativo 5',
        zone:       'Zona Urbana Centro',
        level:      'Primaria y Secundaria',
        modality:   'Presencial',
        status:     true,
    });

    const [contactInfo, setContactInfo] = useState({
        email:      'admin@colegiosanantonio.edu',
        phone:      '',
        address:    'Calle Principal 123, Bogotá',
        city:       '',
        postalCode: '',
        country:    '',
        dialCode:   '',
    });

    const [academicConfig, setAcademicConfig] = useState({
        academicYear:  '2024-2025',
        totalStudents: '1247',
        totalTeachers: '89',
        totalCourses:  '42',
        startDate:     '02/09/2024',
        endDate:       '28/06/2025',
        gradeSystem:   'Calificación 0-10',
        minimumGrade:  '6',
    });

    const [attendanceConfig, setAttendanceConfig] = useState({
        biometricRequired:      true,
        toleranceMinutes:       '5',
        maxAbsences:            '15',
        maxLatenesses:          '10',
        justificationDaysLimit: '30',
        requireDocumentation:   true,
        enableNotifications:    true,
    });

    const [validationErrors, setValidationErrors] = useState({});

    // ─────────────────────────────────────────────
    // Carga inicial de países al montar el componente
    // ─────────────────────────────────────────────

    useEffect(() => {
        fetchAllCountries();
    }, []);

    // Países filtrados por búsqueda
    const filteredCountries = countryOptions.filter((c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dialCode.includes(countrySearch)
    );

    // Ciudades filtradas por búsqueda
    const filteredCities = citiesOptions.filter((city) =>
        city.toLowerCase().includes(citySearch.toLowerCase())
    );

    const CITY_LIMIT = 20;
    const citySearchTrimmed = citySearch.trim();
    const displayedCities = citySearchTrimmed
        ? filteredCities
        : citiesOptions.slice(0, CITY_LIMIT);
    const isCityListLimited = !citySearchTrimmed && citiesOptions.length > CITY_LIMIT;

    // ─────────────────────────────────────────────
    // Funciones de API - CountriesNow
    // ─────────────────────────────────────────────

    // 1. Obtener TODOS los países con sus dial codes
    const fetchAllCountries = async () => {
        setLoadingCountries(true);
        try {
            const response = await fetch(
                'https://countriesnow.space/api/v0.1/countries/codes'
            );
            const data = await response.json();

            if (!data.error && data.data) {
                const parsed = data.data
                    .filter((c) => c.name && c.dial_code)
                    .map((c) => ({
                        name:     c.name,
                        dialCode: c.dial_code,
                        code:     c.code || '',
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));

                setCountryOptions(parsed);

                // Colombia como país por defecto
                const colombia = parsed.find(
                    (c) => c.name.toLowerCase() === 'colombia'
                );
                if (colombia) {
                    setContactInfo((prev) => ({
                        ...prev,
                        country:  colombia.name,
                        dialCode: colombia.dialCode,
                    }));
                    fetchCitiesByCountry(colombia.name);
                }
            } else {
                Alert.alert('Error', 'No se pudieron cargar los países.');
            }
        } catch {
            Alert.alert('Error', 'Error de conexión al cargar los países.');
        } finally {
            setLoadingCountries(false);
        }
    };

    // 2. Obtener ciudades del país seleccionado
    const fetchCitiesByCountry = async (countryName) => {
        setLoadingCities(true);
        setCitiesOptions([]);
        try {
            const response = await fetch(
                'https://countriesnow.space/api/v0.1/countries/cities',
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ country: countryName }),
                }
            );
            const data = await response.json();

            if (!data.error && data.data) {
                setCitiesOptions(data.data);
            } else {
                setCitiesOptions([]);
            }
        } catch {
            setCitiesOptions([]);
            Alert.alert('Error', 'No se pudieron cargar las ciudades.');
        } finally {
            setLoadingCities(false);
        }
    };

    // ─────────────────────────────────────────────
    // Handlers de país y ciudad
    // ─────────────────────────────────────────────

    const handleCountryChange = (option) => {
        setContactInfo((prev) => ({
            ...prev,
            country:    option.name,
            dialCode:   option.dialCode,
            phone:      '',
            city:       '',
            postalCode: '',
        }));
        setCountrySearch('');
        setHasChanges(true);
        setCountryModalVisible(false);
        fetchCitiesByCountry(option.name);
    };

    const handleCityChange = (cityName) => {
        setContactInfo((prev) => ({ ...prev, city: cityName }));
        setCitySearch('');
        setHasChanges(true);
        setCityModalVisible(false);
        fetchPostalCode(contactInfo.country, cityName);
    };

    // ─────────────────────────────────────────────
    // Validación
    // ─────────────────────────────────────────────

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.length >= 6;
    };

    const validateField = (fieldName, value) => {
        const errors = { ...validationErrors };

        if (!value || String(value).trim() === '') {
            errors[fieldName] = 'Este campo es requerido';
        } else if (fieldName === 'email' && !validateEmail(value)) {
            errors[fieldName] = 'Email inválido';
        } else if (fieldName === 'phone' && !validatePhone(value)) {
            errors[fieldName] = 'Teléfono inválido';
        } else if (
            fieldName === 'toleranceMinutes' ||
            fieldName === 'maxAbsences'      ||
            fieldName === 'maxLatenesses'    ||
            fieldName === 'minimumGrade'
        ) {
            if (isNaN(value)) {
                errors[fieldName] = 'Debe ser un número';
            } else {
                delete errors[fieldName];
            }
        } else {
            delete errors[fieldName];
        }

        setValidationErrors(errors);
        return !errors[fieldName];
    };

    // ─────────────────────────────────────────────
    // Handlers de formulario
    // ─────────────────────────────────────────────

    const handleGeneralInfoChange = (field, value) => {
        setGeneralInfo((prev) => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleContactInfoChange = (field, value) => {
        setContactInfo((prev) => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleAcademicConfigChange = (field, value) => {
        setAcademicConfig((prev) => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleAttendanceConfigChange = (field, value) => {
        setAttendanceConfig((prev) => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    // ─────────────────────────────────────────────
    // Guardar / Descartar
    // ─────────────────────────────────────────────

    const handleSaveChanges = async () => {
        try {
            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setHasChanges(false);
            setShowConfirmModal(false);
            Alert.alert('Éxito', 'Configuración del colegio actualizada correctamente');
        } catch {
            Alert.alert('Error', 'No se pudo guardar los cambios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiscardChanges = () => {
        setHasChanges(false);
        setValidationErrors({});
        setGeneralInfo({
            schoolName: 'Colegio Municipal San Antonio',
            schoolCode: 'COL-2024-001',
            district:   'Distrito Educativo 5',
            zone:       'Zona Urbana Centro',
            level:      'Primaria y Secundaria',
            modality:   'Presencial',
            status:     true,
        });
        const colombia = countryOptions.find(
            (c) => c.name.toLowerCase() === 'colombia'
        );
        setContactInfo({
            email:      'admin@colegiosanantonio.edu',
            phone:      '',
            address:    'Calle Principal 123, Bogotá',
            city:       '',
            postalCode: '',
            country:    colombia?.name     || 'Colombia',
            dialCode:   colombia?.dialCode || '+57',
        });
    };

    // ─────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.safeAreaSchoolConfig}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.containerSchoolConfig}
            >
                {/* ── Header ── */}
                <View style={styles.headerSchoolConfig}>
                    <TouchableOpacity
                        style={styles.headerBackButtonSchoolConfig}
                        onPress={() => {
                            if (hasChanges) {
                                Alert.alert(
                                    'Cambios sin guardar',
                                    '¿Descartar los cambios realizados?',
                                    [
                                        { text: 'Cancelar',  onPress: () => {} },
                                        { text: 'Descartar', onPress: handleDiscardChanges },
                                    ]
                                );
                            } else {
                                navigation.goBack();
                            }
                        }}
                    >
                        <Text style={styles.headerBackTextSchoolConfig}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitleSchoolConfig}>Configuración del Colegio</Text>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContentSchoolConfig}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.mainContentSchoolConfig}>

                        {/* ── Tarjeta resumen ── */}
                        <View style={styles.schoolInfoCardSchoolConfig}>
                            <View style={styles.schoolLogoContainerSchoolConfig}>
                                <Text style={styles.schoolLogoSchoolConfig}>logo</Text>
                            </View>
                            <Text style={styles.schoolNameSchoolConfig}>{generalInfo.schoolName}</Text>
                            <View style={styles.quickInfoRowSchoolConfig}>
                                <View style={styles.quickInfoItemSchoolConfig}>
                                    <Text style={styles.quickInfoValueSchoolConfig}>{academicConfig.totalStudents}</Text>
                                    <Text style={styles.quickInfoLabelSchoolConfig}>Estudiantes</Text>
                                </View>
                                <View style={styles.quickInfoItemSchoolConfig}>
                                    <Text style={styles.quickInfoValueSchoolConfig}>{academicConfig.totalTeachers}</Text>
                                    <Text style={styles.quickInfoLabelSchoolConfig}>Docentes</Text>
                                </View>
                                <View style={styles.quickInfoItemSchoolConfig}>
                                    <Text style={styles.quickInfoValueSchoolConfig}>{academicConfig.totalCourses}</Text>
                                    <Text style={styles.quickInfoLabelSchoolConfig}>Cursos</Text>
                                </View>
                            </View>
                        </View>

                        {/* ── Tabs ── */}
                        <View style={styles.sectionTabsSchoolConfig}>
                            {['general', 'contacto', 'academica', 'asistencia'].map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[
                                        styles.sectionTabSchoolConfig,
                                        activeTab === tab && styles.sectionTabActiveSchoolConfig,
                                    ]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text
                                        style={[
                                            styles.sectionTabTextSchoolConfig,
                                            activeTab === tab && styles.sectionTabTextActiveSchoolConfig,
                                        ]}
                                    >
                                        {tab === 'general'    && 'General'}
                                        {tab === 'contacto'   && 'Contacto'}
                                        {tab === 'academica'  && 'Académica'}
                                        {tab === 'asistencia' && 'Asistencia'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* ════════════════════════════════
                            TAB: INFORMACIÓN GENERAL
                        ════════════════════════════════ */}
                        {activeTab === 'general' && (
                            <View style={styles.formSectionSchoolConfig}>
                                <Text style={styles.formSectionTitleSchoolConfig}>Información General</Text>
                                <FormField
                                    label="Nombre del Colegio"
                                    value={generalInfo.schoolName}
                                    onChangeText={(value) => handleGeneralInfoChange('schoolName', value)}
                                    placeholder="Nombre del colegio"
                                    required
                                    validationErrors={validationErrors}
                                />
                                <FormField
                                    label="NIT del Colegio"
                                    value={generalInfo.schoolCode}
                                    onChangeText={(value) => handleGeneralInfoChange('schoolCode', value)}
                                    placeholder="COL-XXXX-XXX"
                                    editable={false}
                                    validationErrors={validationErrors}
                                />
                                <FormField
                                    label="Distrito Educativo"
                                    value={generalInfo.district}
                                    onChangeText={(value) => handleGeneralInfoChange('district', value)}
                                    placeholder="Nombre del distrito"
                                    required
                                    validationErrors={validationErrors}
                                />
                            </View>
                        )}

                        {/* ════════════════════════════════
                            TAB: CONTACTO
                        ════════════════════════════════ */}
                        {activeTab === 'contacto' && (
                            <View style={styles.formSectionSchoolConfig}>
                                <Text style={styles.formSectionTitleSchoolConfig}>Información de Contacto</Text>

                                {/* Email */}
                                <FormField
                                    label="Email Institucional"
                                    value={contactInfo.email}
                                    onChangeText={(value) => handleContactInfoChange('email', value)}
                                    placeholder="admin@colegio.edu"
                                    required
                                    validationErrors={validationErrors}
                                />

                                {/* País */}
                                <View style={styles.formGroupSchoolConfig}>
                                    <Text style={styles.inputLabelSchoolConfig}>
                                        País
                                        <Text style={styles.inputLabelRequiredSchoolConfig}>*</Text>
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.inputFieldSchoolConfig,
                                            styles.pickerContainerSchoolConfig,
                                            styles.countryPickerSchoolConfig,
                                            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                                        ]}
                                        onPress={() => {
                                            setCountrySearch('');
                                            setCountryModalVisible(true);
                                        }}
                                        disabled={loadingCountries}
                                    >
                                        {loadingCountries ? (
                                            <ActivityIndicator size="small" color="#4A90E2" />
                                        ) : (
                                            <Text style={styles.countryPickerTextSchoolConfig}>
                                                {contactInfo.country
                                                    ? `${contactInfo.country}  ${contactInfo.dialCode}`
                                                    : 'Selecciona un país'}
                                            </Text>
                                        )}
                                        <Image
                                            source={require('../../assets/images/flecha.png')}
                                            style={{ width: 16, height: 16, resizeMode: 'contain' }}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Teléfono con prefijo estático */}
                                <View style={styles.formGroupSchoolConfig}>
                                    <Text style={styles.inputLabelSchoolConfig}>
                                        Teléfono
                                        <Text style={styles.inputLabelRequiredSchoolConfig}>*</Text>
                                    </Text>
                                    <View
                                        style={[
                                            styles.inputFieldSchoolConfig,
                                            {
                                                flexDirection:     'row',
                                                alignItems:        'center',
                                                paddingHorizontal: 0,
                                                overflow:          'hidden',
                                            },
                                        ]}
                                    >
                                        {/* Prefijo — no editable */}
                                        <View
                                            style={{
                                                paddingHorizontal: 12,
                                                borderRightWidth:  1,
                                                justifyContent:    'center',
                                                minWidth:          55,
                                                alignItems:        'center',
                                            }}
                                        >
                                            <Text style={{ fontSize: 14, color: '#444444', fontWeight: '500' }}>
                                                {contactInfo.dialCode || '---'}
                                            </Text>
                                        </View>
                                        {/* Solo los números */}
                                        <TextInput
                                            style={{
                                                flex:              1,
                                                paddingHorizontal: 12,
                                                fontSize:          14,
                                                color:             '#333333',
                                            }}
                                            value={contactInfo.phone}
                                            onChangeText={(value) =>
                                                handleContactInfoChange('phone', value)
                                            }
                                            placeholder="300 123 4567"
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                    {validationErrors['phone'] && (
                                        <Text style={styles.inputErrorMessageSchoolConfig}>
                                            {validationErrors['phone']}
                                        </Text>
                                    )}
                                </View>

                                {/* Dirección */}
                                <FormField
                                    label="Dirección"
                                    value={contactInfo.address}
                                    onChangeText={(value) => handleContactInfoChange('address', value)}
                                    placeholder="Calle y número"
                                    required
                                    validationErrors={validationErrors}
                                />

                                {/* Ciudad — selector desplegable */}
                                <View style={styles.formGroupSchoolConfig}>
                                    <Text style={styles.inputLabelSchoolConfig}>
                                        Ciudad
                                        <Text style={styles.inputLabelRequiredSchoolConfig}>*</Text>
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.inputFieldSchoolConfig,
                                            styles.pickerContainerSchoolConfig,
                                            styles.countryPickerSchoolConfig,
                                            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                                        ]}
                                        onPress={() => {
                                            if (!contactInfo.country) {
                                                Alert.alert('Selecciona un país primero');
                                                return;
                                            }
                                            if (citiesOptions.length === 0 && !loadingCities) {
                                                fetchCitiesByCountry(contactInfo.country);
                                            }
                                            setCitySearch('');
                                            setCityModalVisible(true);
                                        }}
                                    >
                                        {loadingCities ? (
                                            <ActivityIndicator size="small" color="#4A90E2" />
                                        ) : (
                                            <Text style={styles.countryPickerTextSchoolConfig}>
                                                {contactInfo.city || 'Selecciona una ciudad'}
                                            </Text>
                                        )}
                                        <Image
                                            source={require('../../assets/images/flecha.png')}
                                            style={{ width: 16, height: 16, resizeMode: 'contain' }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* ════════════════════════════════
                            TAB: CONFIGURACIÓN ACADÉMICA
                        ════════════════════════════════ */}
                        {activeTab === 'academica' && (
                            <View style={styles.formSectionSchoolConfig}>
                                <Text style={styles.formSectionTitleSchoolConfig}>Configuración Académica</Text>
                                <FormField
                                    label="Año Académico"
                                    value={academicConfig.academicYear}
                                    onChangeText={(value) => handleAcademicConfigChange('academicYear', value)}
                                    placeholder="YYYY-YYYY"
                                    editable={false}
                                    validationErrors={validationErrors}
                                />
                                <FormField
                                    label="Fecha de Inicio"
                                    value={academicConfig.startDate}
                                    onChangeText={(value) => handleAcademicConfigChange('startDate', value)}
                                    placeholder="DD/MM/YYYY"
                                    validationErrors={validationErrors}
                                />
                                <FormField
                                    label="Fecha de Fin"
                                    value={academicConfig.endDate}
                                    onChangeText={(value) => handleAcademicConfigChange('endDate', value)}
                                    placeholder="DD/MM/YYYY"
                                    validationErrors={validationErrors}
                                />
                            </View>
                        )}

                        {/* ════════════════════════════════
                            TAB: CONFIGURACIÓN DE ASISTENCIA
                        ════════════════════════════════ */}
                        {activeTab === 'asistencia' && (
                            <View style={styles.formSectionSchoolConfig}>
                                <Text style={styles.formSectionTitleSchoolConfig}>Configuración de Asistencia</Text>
                                <ToggleRow
                                    label="Biométrico Requerido"
                                    description="Requiere autenticación biométrica"
                                    value={attendanceConfig.biometricRequired}
                                    onValueChange={(value) => handleAttendanceConfigChange('biometricRequired', value)}
                                />
                                <FormField
                                    label="Tolerancia (minutos)"
                                    value={attendanceConfig.toleranceMinutes}
                                    onChangeText={(value) => handleAttendanceConfigChange('toleranceMinutes', value)}
                                    placeholder="5"
                                    validationErrors={validationErrors}
                                />
                                <FormField
                                    label="Máx. Inasistencias"
                                    value={attendanceConfig.maxAbsences}
                                    onChangeText={(value) => handleAttendanceConfigChange('maxAbsences', value)}
                                    placeholder="15"
                                    validationErrors={validationErrors}
                                />
                                <FormField
                                    label="Máx. Retardos"
                                    value={attendanceConfig.maxLatenesses}
                                    onChangeText={(value) => handleAttendanceConfigChange('maxLatenesses', value)}
                                    placeholder="10"
                                    validationErrors={validationErrors}
                                />
                                <FormField
                                    label="Límite de Justificación (días)"
                                    value={attendanceConfig.justificationDaysLimit}
                                    onChangeText={(value) => handleAttendanceConfigChange('justificationDaysLimit', value)}
                                    placeholder="30"
                                    validationErrors={validationErrors}
                                />
                                <ToggleRow
                                    label="Requerir Documentación"
                                    description="Exige documento para justificar ausencias"
                                    value={attendanceConfig.requireDocumentation}
                                    onValueChange={(value) => handleAttendanceConfigChange('requireDocumentation', value)}
                                />
                                <ToggleRow
                                    label="Habilitar Notificaciones"
                                    description="Envía alertas automáticas a padres/tutores"
                                    value={attendanceConfig.enableNotifications}
                                    onValueChange={(value) => handleAttendanceConfigChange('enableNotifications', value)}
                                />
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* ── Botones de Acción ── */}
                {hasChanges && (
                    <View style={[styles.actionButtonsContainerSchoolConfig, { marginHorizontal: 20 }]}>
                        <TouchableOpacity
                            style={styles.saveButtonSchoolConfig}
                            onPress={() => setShowConfirmModal(true)}
                        >
                            <Text style={styles.saveButtonTextSchoolConfig}>Guardar Cambios</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButtonSchoolConfig}
                            onPress={handleDiscardChanges}
                        >
                            <Text style={styles.cancelButtonTextSchoolConfig}>Descartar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>

            {/* ════════════════════════════════
                MODAL: Selección de País
            ════════════════════════════════ */}
            <Modal
                visible={countryModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCountryModalVisible(false)}
            >
                <View style={styles.modalOverlaySchoolConfig}>
                    <View style={[styles.modalSheetSchoolConfig, { width: '90%', maxHeight: '80%' }]}>
                        <Text style={styles.modalTitleSchoolConfig}>Seleccionar País</Text>

                        {/* Buscador */}
                        <View style={{
                            flexDirection:    'row',
                            alignItems:       'center',
                            borderWidth:      1,
                            borderColor:      '#D0D0D0',
                            borderRadius:     8,
                            marginBottom:     10,
                            overflow:         'hidden',
                        }}>
                            <TextInput
                                style={{
                                    flex:              1,
                                    paddingHorizontal: 12,
                                    paddingVertical:   8,
                                    fontSize:          14,
                                    color:             '#333333',
                                }}
                                placeholder="Buscar país o código (+57)..."
                                placeholderTextColor="black"
                                value={countrySearch}
                                onChangeText={setCountrySearch}
                                autoCorrect={false}
                                keyboardType="default"
                            />
                            <TouchableOpacity
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={() => {
                                    setCountrySearch('');
                                    Keyboard.dismiss();
                                }}
                            >
                                <Text style={{ fontSize: 16, color: '#666666' }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingCountries ? (
                            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#4A90E2" />
                                <Text style={{ marginTop: 10, color: '#666666', fontSize: 13 }}>
                                    Cargando países...
                                </Text>
                            </View>
                        ) : (
                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator
                            >
                                {filteredCountries.length === 0 ? (
                                    <Text style={{ textAlign: 'center', color: '#999999', padding: 20 }}>
                                        No se encontraron países
                                    </Text>
                                ) : (
                                    filteredCountries.map((option) => (
                                        <TouchableOpacity
                                            key={`${option.name}-${option.code}`}
                                            style={styles.countryOptionSchoolConfig}
                                            onPress={() => handleCountryChange(option)}
                                        >
                                            <Text style={styles.countryOptionTextSchoolConfig}>
                                                {option.name}
                                            </Text>
                                            <Text style={styles.countryDialCodeSchoolConfig}>
                                                {option.dialCode}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={styles.modalCancelButtonSchoolConfig}
                            onPress={() => setCountryModalVisible(false)}
                        >
                            <Text style={styles.modalCancelButtonTextSchoolConfig}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════════════════════════════════
                MODAL: Selección de Ciudad
            ════════════════════════════════ */}
            <Modal
                visible={cityModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCityModalVisible(false)}
            >
                <View style={styles.modalOverlaySchoolConfig}>
                    <View style={[styles.modalSheetSchoolConfig, { width: '90%', maxHeight: '80%' }]}>
                        <Text style={styles.modalTitleSchoolConfig}>Seleccionar Ciudad</Text>
                        <Text style={styles.modalSubtitleSchoolConfig}>
                            Ciudades disponibles para {contactInfo.country}
                        </Text>

                        {/* Buscador */}
                        <View style={{
                            flexDirection:    'row',
                            alignItems:       'center',
                            borderWidth:      1,
                            borderColor:      '#D0D0D0',
                            borderRadius:     8,
                            marginBottom:     10,
                            overflow:         'hidden',
                        }}>
                            <TextInput
                                style={{
                                    flex:              1,
                                    paddingHorizontal: 12,
                                    paddingVertical:   8,
                                    fontSize:          14,
                                    color:             '#333333',
                                }}
                                placeholder="Buscar ciudad..."
                                placeholderTextColor="black"
                                value={citySearch}
                                onChangeText={setCitySearch}
                                autoCorrect={false}
                                keyboardType="default"
                            />
                            <TouchableOpacity
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={() => {
                                    setCitySearch('');
                                    Keyboard.dismiss();
                                }}
                            >
                                <Text style={{ fontSize: 16, color: '#666666' }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingCities ? (
                            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#4A90E2" />
                                <Text style={{ marginTop: 10, color: '#666666', fontSize: 13 }}>
                                    Cargando ciudades...
                                </Text>
                            </View>
                        ) : (
                            <>
                                {isCityListLimited && (
                                    <Text style={{
                                        textAlign: 'center',
                                        color: '#666666',
                                        paddingVertical: 10,
                                        fontSize: 13,
                                    }}>
                                        Mostrando {CITY_LIMIT} de {citiesOptions.length} ciudades. Busca para ver más.
                                    </Text>
                                )}
                                <ScrollView
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator
                                >
                                    {displayedCities.length === 0 ? (
                                        <Text style={{ textAlign: 'center', color: '#999999', padding: 20 }}>
                                            No se encontraron ciudades
                                        </Text>
                                    ) : (
                                        displayedCities.map((city) => (
                                            <TouchableOpacity
                                                key={city}
                                                style={styles.countryOptionSchoolConfig}
                                                onPress={() => handleCityChange(city)}
                                            >
                                                <Text style={styles.countryOptionTextSchoolConfig}>{city}</Text>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </ScrollView>
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.modalCancelButtonSchoolConfig}
                            onPress={() => setCityModalVisible(false)}
                        >
                            <Text style={styles.modalCancelButtonTextSchoolConfig}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ════════════════════════════════
                MODAL: Confirmación de Guardado
            ════════════════════════════════ */}
            <Modal
                visible={showConfirmModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.modalOverlaySchoolConfig}>
                    <View style={styles.modalSheetSchoolConfig}>
                        <Text style={styles.modalTitleSchoolConfig}>Confirmar Cambios</Text>
                        <Text style={styles.modalSubtitleSchoolConfig}>
                            ¿Estás seguro de que deseas guardar todos los cambios?
                        </Text>
                        <View style={styles.modalMessageSchoolConfig}>
                            <Text style={{ fontSize: 13, color: '#555555' }}>
                                Los cambios se aplicarán a toda la institución y podrían afectar el funcionamiento del sistema.
                            </Text>
                        </View>
                        {isLoading ? (
                            <View style={styles.loadingOverlaySchoolConfig}>
                                <ActivityIndicator size="large" color="#FFFFFF" />
                                <Text style={styles.loadingTextSchoolConfig}>Guardando cambios...</Text>
                            </View>
                        ) : (
                            <View style={styles.modalActionsSchoolConfig}>
                                <TouchableOpacity
                                    style={styles.modalConfirmButtonSchoolConfig}
                                    onPress={handleSaveChanges}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.modalConfirmButtonTextSchoolConfig}>Confirmar y Guardar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalCancelButtonSchoolConfig}
                                    onPress={() => setShowConfirmModal(false)}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.modalCancelButtonTextSchoolConfig}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default SchoolConfigurationScreen;