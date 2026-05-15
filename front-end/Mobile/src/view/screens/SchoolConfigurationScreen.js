import React, { useState, useCallback } from 'react';
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
    Alert,
} from 'react-native';
import styles from './Style';
import {useSchoolConfigurationViewModel} from "../../viewmodels/useSchoolConfigurationViewModel";

const SchoolConfigurationScreen = ({ navigation }) => {
    const {
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
    } = useSchoolConfigurationViewModel();

    // Componente reutilizable para campo de entrada
    const FormField = ({ label, value, onChangeText, placeholder, multiline = false, required = false, editable = true }) => {
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
                    {!hasError && value && editable && <Text style={styles.validationCheckmarkSchoolConfig}>✓</Text>}
                    {hasError && <Text style={styles.validationErrorIconSchoolConfig}>✗</Text>}
                </View>
                {hasError && <Text style={styles.inputErrorMessageSchoolConfig}>{hasError}</Text>}
            </View>
        );
    };

    // Componente para filas de toggle
    const ToggleRow = ({ label, description, value, onValueChange }) => (
        <View style={styles.toggleRowSchoolConfig}>
            <View style={styles.toggleLabelContainerSchoolConfig}>
                <Text style={styles.toggleLabelSchoolConfig}>{label}</Text>
                {description && <Text style={styles.toggleDescriptionSchoolConfig}>{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#E0E0E0', true: '#A8D8EA' }}
                thumbColor={value ? '#4A90E2' : '#F0F0F0'}
            />
        </View>
    );

    // Componente para fila de información
    const InfoRow = ({ label, value }) => (
        <View style={styles.infoRowSchoolConfig}>
            <Text style={styles.infoKeySchoolConfig}>{label}</Text>
            <Text style={styles.infoValueSchoolConfig}>{value}</Text>
        </View>
    );

    // Componente para tarjeta informativa
    const InfoCard = ({ icon, title, text }) => (
        <View style={styles.infoCardSchoolConfig}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.infoCardIconSchoolConfig}>{icon}</Text>
                <Text style={styles.infoCardTitleSchoolConfig}>{title}</Text>
            </View>
            <Text style={styles.infoCardTextSchoolConfig}>{text}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeAreaSchoolConfig}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.containerSchoolConfig}
            >
                {/* Header */}
                <View style={styles.headerSchoolConfig}>
                    <TouchableOpacity
                        style={styles.headerBackButtonSchoolConfig}
                        onPress={() => {
                            if (hasChanges) {
                                Alert.alert(
                                    'Cambios sin guardar',
                                    '¿Descartar los cambios realizados?',
                                    [
                                        { text: 'Cancelar', onPress: () => {} },
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
                >
                    <View style={styles.mainContentSchoolConfig}>
                        {/* Indicador de cambios no guardados */}
                        {hasChanges && (
                            <View style={styles.unsavedChangesIndicatorSchoolConfig}>
                                <Text style={styles.unsavedChangesIconSchoolConfig}>⚠</Text>
                                <Text style={styles.unsavedChangesTextSchoolConfig}>
                                    Tienes cambios sin guardar
                                </Text>
                            </View>
                        )}

                        {/* Tarjeta de Información del Colegio */}
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

                        {/* Tabs de Secciones */}
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
                                        {tab === 'general' && 'General'}
                                        {tab === 'contacto' && 'Contacto'}
                                        {tab === 'academica' && 'Académica'}
                                        {tab === 'asistencia' && 'Asistencia'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* TAB: INFORMACIÓN GENERAL */}
                        {activeTab === 'general' && (
                            <View style={styles.formSectionSchoolConfig}>
                                <Text style={styles.formSectionTitleSchoolConfig}>
                                    Información General
                                </Text>
                                <FormField
                                    label="Nombre del Colegio"
                                    value={generalInfo.schoolName}
                                    onChangeText={(value) => handleGeneralInfoChange('schoolName', value)}
                                    placeholder="Nombre del colegio"
                                    required
                                />
                                <FormField
                                    label="Código del Colegio"
                                    value={generalInfo.schoolCode}
                                    onChangeText={(value) => handleGeneralInfoChange('schoolCode', value)}
                                    placeholder="COL-XXXX-XXX"
                                    editable={false}
                                />
                                <FormField
                                    label="Distrito Educativo"
                                    value={generalInfo.district}
                                    onChangeText={(value) => handleGeneralInfoChange('district', value)}
                                    placeholder="Nombre del distrito"
                                    required
                                />
                                <FormField
                                    label="Zona"
                                    value={generalInfo.zone}
                                    onChangeText={(value) => handleGeneralInfoChange('zone', value)}
                                    placeholder="Zona Urbana, Rural, etc."
                                />
                                <FormField
                                    label="Nivel Educativo"
                                    value={generalInfo.level}
                                    onChangeText={(value) => handleGeneralInfoChange('level', value)}
                                    placeholder="Primaria, Secundaria, etc."
                                />
                                <FormField
                                    label="Modalidad"
                                    value={generalInfo.modality}
                                    onChangeText={(value) => handleGeneralInfoChange('modality', value)}
                                    placeholder="Presencial, Virtual, Híbrida"
                                />
                            </View>
                        )}

                        {/* TAB: CONTACTO */}
                        {activeTab === 'contacto' && (
                            <View style={styles.formSectionSchoolConfig}>
                                <Text style={styles.formSectionTitleSchoolConfig}>
                                    Información de Contacto
                                </Text>
                                <FormField
                                    label="Email Institucional"
                                    value={contactInfo.email}
                                    onChangeText={(value) => handleContactInfoChange('email', value)}
                                    placeholder="admin@colegio.edu"
                                    required
                                />
                                <FormField
                                    label="Teléfono"
                                    value={contactInfo.phone}
                                    onChangeText={(value) => handleContactInfoChange('phone', value)}
                                    placeholder="+34 91 234 5678"
                                    required
                                />
                                <FormField
                                    label="Dirección"
                                    value={contactInfo.address}
                                    onChangeText={(value) => handleContactInfoChange('address', value)}
                                    placeholder="Calle y número"
                                    required
                                />
                                <FormField
                                    label="Ciudad"
                                    value={contactInfo.city}
                                    onChangeText={(value) => handleContactInfoChange('city', value)}
                                    placeholder="Ciudad"
                                    required
                                />
                                <FormField
                                    label="Código Postal"
                                    value={contactInfo.postalCode}
                                    onChangeText={(value) => handleContactInfoChange('postalCode', value)}
                                    placeholder="28001"
                                />
                                <FormField
                                    label="País"
                                    value={contactInfo.country}
                                    onChangeText={(value) => handleContactInfoChange('country', value)}
                                    placeholder="País"
                                />
                            </View>
                        )}

                        {/* TAB: CONFIGURACIÓN ACADÉMICA */}
                        {activeTab === 'academica' && (
                            <View style={styles.formSectionSchoolConfig}>
                                <Text style={styles.formSectionTitleSchoolConfig}>
                                    Configuración Académica
                                </Text>
                                <FormField
                                    label="Año Académico"
                                    value={academicConfig.academicYear}
                                    onChangeText={(value) => handleAcademicConfigChange('academicYear', value)}
                                    placeholder="YYYY-YYYY"
                                    editable={false}
                                />
                                <FormField
                                    label="Total de Estudiantes"
                                    value={academicConfig.totalStudents}
                                    onChangeText={(value) => handleAcademicConfigChange('totalStudents', value)}
                                    placeholder="1000"
                                    editable={false}
                                />
                                <FormField
                                    label="Total de Docentes"
                                    value={academicConfig.totalTeachers}
                                    onChangeText={(value) => handleAcademicConfigChange('totalTeachers', value)}
                                    placeholder="50"
                                    editable={false}
                                />
                                <FormField
                                    label="Total de Cursos"
                                    value={academicConfig.totalCourses}
                                    onChangeText={(value) => handleAcademicConfigChange('totalCourses', value)}
                                    placeholder="40"
                                    editable={false}
                                />
                                <FormField
                                    label="Fecha de Inicio"
                                    value={academicConfig.startDate}
                                    onChangeText={(value) => handleAcademicConfigChange('startDate', value)}
                                    placeholder="DD/MM/YYYY"
                                />
                                <FormField
                                    label="Fecha de Fin"
                                    value={academicConfig.endDate}
                                    onChangeText={(value) => handleAcademicConfigChange('endDate', value)}
                                    placeholder="DD/MM/YYYY"
                                />
                                <FormField
                                    label="Sistema de Calificación"
                                    value={academicConfig.gradeSystem}
                                    onChangeText={(value) => handleAcademicConfigChange('gradeSystem', value)}
                                    placeholder="Escala 0-10"
                                />
                                <FormField
                                    label="Calificación Mínima"
                                    value={academicConfig.minimumGrade}
                                    onChangeText={(value) => handleAcademicConfigChange('minimumGrade', value)}
                                    placeholder="6"
                                />
                            </View>
                        )}

                        {/* TAB: CONFIGURACIÓN DE ASISTENCIA */}
                        {activeTab === 'asistencia' && (
                            <View style={styles.formSectionSchoolConfig}>
                                <Text style={styles.formSectionTitleSchoolConfig}>
                                    Configuración de Asistencia
                                </Text>
                                <FormField
                                    label="Tolerancia (minutos)"
                                    value={attendanceConfig.toleranceMinutes}
                                    onChangeText={(value) => handleAttendanceConfigChange('toleranceMinutes', value)}
                                    placeholder="5"
                                />
                                <FormField
                                    label="Máx. Inasistencias"
                                    value={attendanceConfig.maxAbsences}
                                    onChangeText={(value) => handleAttendanceConfigChange('maxAbsences', value)}
                                    placeholder="15"
                                />
                                <FormField
                                    label="Máx. Retardos"
                                    value={attendanceConfig.maxLatenesses}
                                    onChangeText={(value) => handleAttendanceConfigChange('maxLatenesses', value)}
                                    placeholder="10"
                                />
                                <FormField
                                    label="Límite de Justificación (días)"
                                    value={attendanceConfig.justificationDaysLimit}
                                    onChangeText={(value) => handleAttendanceConfigChange('justificationDaysLimit', value)}
                                    placeholder="30"
                                />
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Botones de Acción */}
                {hasChanges && (
                    <View style={styles.actionButtonsContainerSchoolConfig}>
                        <TouchableOpacity
                            style={styles.saveButtonSchoolConfig}
                            onPress={() => setShowConfirmModal(true)}
                        >
                            <Text style={styles.saveButtonIconSchoolConfig}>💾</Text>
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

            {/* Modal de Confirmación */}
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

            {/* Botón Flotante de Ayuda */}
            <TouchableOpacity
                style={styles.helpButtonSchoolConfig}
                onPress={() => Alert.alert('Ayuda', 'Contacta al soporte técnico en: soporte@faceattend.edu')}
            >
                <Text style={styles.helpButtonIconSchoolConfig}>?</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default SchoolConfigurationScreen;
