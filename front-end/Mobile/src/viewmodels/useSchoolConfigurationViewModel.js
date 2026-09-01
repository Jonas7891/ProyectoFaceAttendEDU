import {Alert} from "react-native";
import {useEffect, useState} from 'react';
import {validateEmail, validatePhone} from "../utils/validators";
import {CountryService} from "../services/CountryService";
// ⚠️ Ajusta el nombre real de la función de actualización en tu SchoolService
import {getSchoolById, updateSchool} from "../services/SchoolService";
import {AcademicConfig, AttendanceConfig, ContactInfo, GeneralInfo, SchoolResponse} from "../model/SchoolResponse";
import {getCurrentUser, getUserByEmail} from "../services/UserService";


export function useSchoolConfigurationViewModel({ isAdmin = false } = {}) {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [generalInfo, setGeneralInfo] = useState(null);
    const [contactInfo, setContactInfo] = useState(null);
    const [academicConfig, setAcademicConfig] = useState(null);
    const [attendanceConfig, setAttendanceConfig] = useState(null);

    // Id del colegio y copia de los datos originales (para guardar y para descartar cambios)
    const [schoolId, setSchoolId] = useState(null);
    const [originalData, setOriginalData] = useState(null);

    const loadSchoolInfo = async () => {
        try {
            const userInfo = await getCurrentUser();
            const email = userInfo?.email;
            const user = await getUserByEmail(email);

            const schoolResponse = await getSchoolById(user.school_id);

            const general    = GeneralInfo.fromApi(schoolResponse);
            const contact    = ContactInfo.fromApi(schoolResponse);
            const academic   = AcademicConfig.fromApi(schoolResponse);
            const attendance = AttendanceConfig.fromApi(schoolResponse);

            setGeneralInfo(general);
            setContactInfo(contact);
            setAcademicConfig(academic);
            setAttendanceConfig(attendance);

            setSchoolId(user.school_id);
            setOriginalData({ general, contact, academic, attendance });
        } catch (error) {
            console.error('Error cargando datos de usuario:', error);
        }
    };
    useEffect(() => {
        loadSchoolInfo();
    }, []);

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
        if (!isAdmin) return;
        setGeneralInfo(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleContactInfoChange = (field, value) => {
        if (!isAdmin) return;
        setContactInfo(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleAcademicConfigChange = (field, value) => {
        if (!isAdmin) return;
        setAcademicConfig(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleAttendanceConfigChange = (field, value) => {
        if (!isAdmin) return;
        setAttendanceConfig(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
        validateField(field, value);
    };

    const handleSaveChanges = async () => {
        if (!isAdmin) return;
        if (!schoolId) {
            Alert.alert('Error', 'No se pudo identificar el colegio a actualizar');
            return;
        }

        try {
            setIsLoading(true);

            const payload = {
                ...generalInfo,
                ...contactInfo,
                ...academicConfig,
                ...attendanceConfig,
            };

            // ⚠️ Ajusta esta llamada al nombre/firma real de tu SchoolService
            const updatedSchool = await updateSchool(schoolId, payload);

            const general    = GeneralInfo.fromApi(updatedSchool);
            const contact    = ContactInfo.fromApi(updatedSchool);
            const academic   = AcademicConfig.fromApi(updatedSchool);
            const attendance = AttendanceConfig.fromApi(updatedSchool);

            setGeneralInfo(general);
            setContactInfo(contact);
            setAcademicConfig(academic);
            setAttendanceConfig(attendance);
            setOriginalData({ general, contact, academic, attendance });

            setHasChanges(false);
            setShowConfirmModal(false);
            Alert.alert('Éxito', 'Configuración del colegio actualizada correctamente');
        } catch (error) {
            console.error('Error guardando configuración del colegio:', error);
            Alert.alert('Error', 'No se pudo guardar los cambios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiscardChanges = () => {
        if (!isAdmin) return;
        setHasChanges(false);
        setValidationErrors({});

        if (originalData) {
            setGeneralInfo(originalData.general);
            setContactInfo(originalData.contact);
            setAcademicConfig(originalData.academic);
            setAttendanceConfig(originalData.attendance);
        }
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
        if (!isAdmin) return; // 👈 AGREGAR PROTECCIÓN
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
        loadCities(option.name);
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