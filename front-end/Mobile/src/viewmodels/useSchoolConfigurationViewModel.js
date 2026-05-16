import {Alert, Platform, Switch, Text, TextInput, TouchableOpacity, View} from "react-native";
import React, {useState, useCallback, useEffect} from 'react';
import styles from "../view/screens/Style";


export function useSchoolConfigurationViewModel() {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Estado del formulario - Información General
    const [generalInfo, setGeneralInfo] = useState({
        schoolName: 'Colegio Municipal San Antonio',
        schoolCode: 'COL-2024-001',
        district:   'Distrito Educativo 5',
        zone:       'Zona Urbana Centro',
        level:      'Primaria y Secundaria',
        modality:   'Presencial',
        status:     true,
    });

    // Estado del formulario - Contacto
    const [contactInfo, setContactInfo] = useState({
        email:      'admin@colegiosanantonio.edu',
        phone:      '',
        address:    'Calle Principal 123, Bogotá',
        city:       '',
        postalCode: '',
        country:    '',
        dialCode:   '',
    });

    // Estado del formulario - Configuración Académica
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

    // Estado del formulario - Configuración de Asistencia
    const [attendanceConfig, setAttendanceConfig] = useState({
        biometricRequired:      true,
        toleranceMinutes:       '5',
        maxAbsences:            '15',
        maxLatenesses:          '10',
        justificationDaysLimit: '30',
        requireDocumentation:   true,
        enableNotifications:    true,
    });

    // Validación de campos
    const [validationErrors, setValidationErrors] = useState({});

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        return phoneRegex.test(phone) && phone.length >= 9;
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

    const handleGeneralInfoChange = (field, value) => {
        setGeneralInfo(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleContactInfoChange = (field, value) => {
        setContactInfo(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleAcademicConfigChange = (field, value) => {
        setAcademicConfig(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleAttendanceConfigChange = (field, value) => {
        setAttendanceConfig(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleSaveChanges = async () => {
        try {
            setIsLoading(true);
            // Simular envío al servidor
            await new Promise(resolve => setTimeout(resolve, 2000));
            setHasChanges(false);
            setShowConfirmModal(false);
            Alert.alert('Éxito', 'Configuración del colegio actualizada correctamente');
        } catch (error) {
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
        // fetchPostalCode(contactInfo.country, cityName);
    };

    return {
        activeTab,
        isLoading,
        showConfirmModal,
        showAdvanced,
        hasChanges,
        generalInfo,
        contactInfo,
        academicConfig,
        attendanceConfig,
        validationErrors,
        handleGeneralInfoChange,
        handleContactInfoChange,
        handleAcademicConfigChange,
        handleAttendanceConfigChange,
        handleSaveChanges,
        handleDiscardChanges,
        countryModalVisible,
        cityModalVisible,
        loadingCountries,
        loadingCities,
        filteredCountries,
        displayedCities,
        isCityListLimited,
        handleCountryChange,
        handleCityChange,
        countrySearch,
        setCountrySearch,
        citySearch,
        setCitySearch,
        CITY_LIMIT,
        citiesOptions,
        setActiveTab,
        setCountryModalVisible,
        setCityModalVisible,
        setShowConfirmModal
    }
}