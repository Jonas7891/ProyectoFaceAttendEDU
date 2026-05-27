import {Alert, Platform, Switch, Text, TextInput, TouchableOpacity, View} from "react-native";
import React, {useState, useCallback, useEffect} from 'react';
import { validateEmail, validatePhone } from "../utils/validators";
import { CountryService } from "../services/CountryService";
import { getSchoolById } from "../services/SchoolService";
import { SchoolResponse,
    GeneralInfo,
    ContactInfo,
    AcademicConfig,
    AttendanceConfig} from "../model/SchoolResponse";
import styles from "../view/screens/Style";
import {getCurrentUser, getUserByEmail} from "../services/UserService";
import UserResponse from "../model/UserResponse";


export function useSchoolConfigurationViewModel() {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [generalInfo, setGeneralInfo] = useState(null);
    const [contactInfo, setContactInfo] = useState(null);
    const [academicConfig, setAcademicConfig] = useState(null);
    const [attendanceConfig, setAttendanceConfig] = useState(null);

    const loadSchoolInfo = async () => {
        try {
            const userInfo = await getCurrentUser();
            const email = userInfo?.email;
            const user = getUserByEmail(email);

            const schoolResponse = getSchoolById(user.school_id);

            setGeneralInfo(GeneralInfo.fromApi(schoolResponse));
            setContactInfo(ContactInfo.fromApi(schoolResponse));
            setAcademicConfig(AcademicConfig.fromApi(schoolResponse));
            setAttendanceConfig(AttendanceConfig.fromApi(schoolResponse));
        } catch (error) {
            console.error('Error cargando datos de usuario:', error);
        }
    };
    useEffect(() => {
        loadSchoolInfo();
    }, []);

    // console.log(generalInfo);
    useEffect(() => {
        console.log(generalInfo);
    }, [generalInfo]);

    // Validación de campos
    const [validationErrors, setValidationErrors] = useState({});

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
            /*
            schoolName: 'Colegio Municipal San Antonio',
            schoolCode: 'COL-2024-001',
            district:   'Distrito Educativo 5',
            zone:       'Zona Urbana Centro',
            level:      'Primaria y Secundaria',
            modality:   'Presencial',
            status:     true,
             */
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
        loadAllCountries();
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
    const loadAllCountries = async () => {
        setLoadingCountries(true);
        try {
            const countries = await CountryService.fetchAllCountries();
            setCountryOptions(countries);

            // Configurar Colombia por defecto
            const colombia = CountryService.findCountryByName(countries, 'colombia');
            if (colombia) {
                setContactInfo(prev => ({
                    ...prev,
                    country: colombia.name,
                    dialCode: colombia.dialCode,
                }));
                loadCities(colombia.name);
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoadingCountries(false);
        }
    };

    const loadCities = async (countryName) => {
        setLoadingCities(true);
        setCitiesOptions([]);
        try {
            const cities = await CountryService.fetchCities(countryName);
            setCitiesOptions(cities);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoadingCities(false);
        }
    }

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
        loadAllCountries(option.name);
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