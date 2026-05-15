import {Alert, Platform, Switch, Text, TextInput, TouchableOpacity, View} from "react-native";
import React, { useState, useCallback } from 'react';
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
        district: 'Distrito Educativo 5',
        zone: 'Zona Urbana Centro',
        level: 'Primaria y Secundaria',
        modality: 'Presencial',
        status: true,
    });

    // Estado del formulario - Contacto
    const [contactInfo, setContactInfo] = useState({
        email: 'admin@colegiosanantonio.edu',
        phone: '+34 91 234 5678',
        address: 'Calle Principal 123, Madrid',
        city: 'Madrid',
        postalCode: '28001',
        country: 'España',
    });

    // Estado del formulario - Configuración Académica
    const [academicConfig, setAcademicConfig] = useState({
        academicYear: '2024-2025',
        totalStudents: '1247',
        totalTeachers: '89',
        totalCourses: '42',
        startDate: '02/09/2024',
        endDate: '28/06/2025',
        gradeSystem: 'Calificación 0-10',
        minimumGrade: '6',
    });

    // Estado del formulario - Configuración de Asistencia
    const [attendanceConfig, setAttendanceConfig] = useState({
        biometricRequired: true,
        toleranceMinutes: '5',
        maxAbsences: '15',
        maxLatenesses: '10',
        justificationDaysLimit: '30',
        requireDocumentation: true,
        enableNotifications: true,
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

        if (!value || value.trim() === '') {
            errors[fieldName] = 'Este campo es requerido';
        } else if (fieldName === 'email' && !validateEmail(value)) {
            errors[fieldName] = 'Email inválido';
        } else if (fieldName === 'phone' && !validatePhone(value)) {
            errors[fieldName] = 'Teléfono inválido';
        } else if (fieldName.includes('number') || fieldName === 'toleranceMinutes' || fieldName === 'maxAbsences' || fieldName === 'maxLatenesses' || fieldName === 'minimumGrade') {
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
            district: 'Distrito Educativo 5',
            zone: 'Zona Urbana Centro',
            level: 'Primaria y Secundaria',
            modality: 'Presencial',
            status: true,
        });
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
        handleDiscardChanges
    }
}