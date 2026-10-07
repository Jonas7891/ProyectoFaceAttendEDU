// ============================================================
//  FaceAttend EDU — RegisterStudentModal
//  Modal para registrar un nuevo estudiante.
//  Usa TextInput y AnimatedDropdown de componentes comunes.
//  La validación se hace en el ViewModel, no aquí.
// ============================================================

import React, { useState, useRef, useMemo } from "react";
import {
    View, Text, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, AnimatedDropdown, BaseModal, TextInput } from "../common";
import { useTheme }               from "../hooks/useTheme";
import { useResponsive }          from "../hooks/useResponsive";
import { useTranslation }         from "../../../core/utils/i18n/hooks/useTranslation";
import { useAppData }             from "../../../context/AppDataContext";
import { usePushNotification }    from "../common/feedback/PushNotification";
import { getInstitutionConfig }   from "../../../core/config/institutionConfig";
import { isValidEmail }           from "../../../core/utils/validation";
import { titleCase }             from "../../../core/utils/formatting";
import FaceRegistrationModal      from "./FaceRegistrationModal";

// ── Funciones auxiliares para formateo ────────────────────

/**
 * Filtra el texto para permitir solo letras y espacios manteniendo acentos
 */
const filterLettersAndSpaces = (text) => {
    if (!text) return '';
    // Permite letras con acentos, espacios, ñ, ü, etc.
    return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑç\s]/g, '');
};

/**
 * Formatea el nombre: filtra caracteres no válidos y capitaliza usando titleCase
 */
const formatName = (text) => {
    if (!text) return '';
    const filtered = filterLettersAndSpaces(text);
    return titleCase(filtered);
};
import {
    EMPTY_FORM,
    validateStudentForm,
    validateStudentFormDetailed,
} from "../../../viewmodels/useStudentsViewModel";

// ── Roles disponibles ────────────────────────────────────

const ROLE_ITEMS = [
    { value: "admin",   label: "Administrador", description: "Admin",    icon: "shield"    },
    { value: "teacher", label: "Docente",       description: "Teacher",  icon: "book-open" },
    { value: "student", label: "Estudiante",    description: "Student",  icon: "user"      },
];

// ── Componente principal ─────────────────────────────────

export default function RegisterStudentModal({
    visible,
    onClose,
    onSubmit,
    initialRole = null, // null = modo genérico, "student"/"teacher"/"admin" = modo específico
}) {
    const { theme }   = useTheme();
    const { isSmall } = useResponsive();
    const { t }       = useTranslation();
    const c           = theme.colors;
    const appData     = useAppData();
    const pushNotification = usePushNotification();

    const [form,          setForm]          = useState({ ...EMPTY_FORM, role: initialRole || "" });
    const [saving,        setSaving]        = useState(false);
    const [showErrors,    setShowErrors]    = useState(false);
    const [success,       setSuccess]       = useState(false);
    const [showFaceModal, setShowFaceModal] = useState(false);
    const pendingFormRef = useRef(null);

    // Generar items de fichas desde los cursos disponibles
    const fichaItems = useMemo(() => {
        if (!appData.courses || appData.courses.length === 0) return [];
        
        return appData.courses
            .filter(course => course.status === "active")
            .map(course => ({
                value: course.code,
                label: course.name,
                description: `Ficha ${course.code}`,
                icon: "book-open",
            }));
    }, [appData.courses]);

    // Calcular código estudiantil auto-incremental cuando se selecciona una ficha
    // Formato: códigoCurso + "00" + n (ej: "AED-401001", "AED-401002", ..., "AED-40120", etc.)
    // donde "00" es fijo y "n" es el número incremental (1, 2, 3, ..., 20, ..., 100)
    const generateStudentCode = (fichaCode) => {
        if (!fichaCode || !appData.students) return "";
        
        // Buscar todos los estudiantes que pertenecen a esta ficha
        // El patrón esperado es: fichaCode + "00" + n
        const prefix = `${fichaCode}00`;
        const studentsInFicha = appData.students.filter(s => 
            s.code && s.code.startsWith(prefix)
        );
        
        // Extraer el número "n" de cada código y encontrar el máximo
        let maxNumber = 0;
        studentsInFicha.forEach(s => {
            // Remover el prefijo completo (fichaCode + "00") y obtener solo el número incremental
            const numberPart = s.code.substring(prefix.length);
            const num = parseInt(numberPart, 10);
            if (!isNaN(num) && num > maxNumber) {
                maxNumber = num;
            }
        });
        
        // Incrementar (1, 2, 3, ..., 20, ..., 100)
        const nextNumber = maxNumber + 1;
        
        // Formato final: fichaCode + "00" + nextNumber
        return `${fichaCode}00${nextNumber}`;
    };

    // Generación automática de códigos para profesores
    // Formato: PROF001, PROF002, PROF003, etc.
    const generateTeacherCode = () => {
        if (!appData.teachers) return "";
        
        // Buscar todos los profesores con códigos que empiecen con "PROF"
        const prefix = "PROF";
        const teachersWithProfCodes = appData.teachers.filter(t => 
            t.code && t.code.startsWith(prefix)
        );
        
        // Extraer el número de cada código y encontrar el máximo
        let maxNumber = 0;
        teachersWithProfCodes.forEach(t => {
            // Remover el prefijo "PROF" y obtener solo el número
            const numberPart = t.code.substring(prefix.length);
            const num = parseInt(numberPart, 10);
            if (!isNaN(num) && num > maxNumber) {
                maxNumber = num;
            }
        });
        
        // Incrementar y formatear con ceros a la izquierda (001, 002, 003...)
        const nextNumber = maxNumber + 1;
        const paddedNumber = nextNumber.toString().padStart(3, '0');
        
        // Formato final: PROF001, PROF002, etc.
        return `${prefix}${paddedNumber}`;
    };

    // Sincronizar el rol del formulario cuando cambia initialRole (solo si el modal se abre de nuevo)
    React.useEffect(() => {
        if (visible) {
            // Resetear completamente el formulario cuando se abre con un initialRole diferente
            setForm({ ...EMPTY_FORM, role: initialRole || "" });
        }
    }, [initialRole, visible]);

    // Auto-generar código para profesores cuando el modal se abre en modo teacher
    React.useEffect(() => {
        if (visible && form.role === "teacher" && !form.code) {
            const generatedCode = generateTeacherCode();
            if (generatedCode) {
                setForm(prev => ({ ...prev, code: generatedCode }));
            }
        }
    }, [visible, form.role, appData.teachers]);

    const setField = (key, value) => {
        setForm((prev) => {
            let processedValue = value;
            
            // Formatear nombre automáticamente
            if (key === "name") {
                processedValue = formatName(value);
            }
            
            // Validación de email en tiempo real mejorada para evitar spam
            if (key === "email" && processedValue.trim() && !isValidEmail(processedValue)) {
                // Solo mostrar error si el email parece estar completo (tiene @ y punto)
                if (processedValue.length > 8 && processedValue.includes('@') && processedValue.includes('.')) {
                    const config = getInstitutionConfig();
                    pushNotification.error(
                        t("Correo inválido"),
                        t("El formato del correo electrónico no es válido"),
                        { 
                            duration: config.pushDuration > 0 ? config.pushDuration * 1000 : 3000,
                            source: "email-validation",
                            allowDuplicates: false // Evitar spam de la misma validación
                        }
                    );
                }
            }
            
            const updated = { ...prev, [key]: processedValue };
            
            // Si se está cambiando el rol, limpiar el código anterior
            if (key === "role" && value !== prev.role) {
                updated.code = "";
            }
            
            // Auto-generar código estudiantil en dos casos:
            // 1. Cuando se selecciona una ficha/curso Y el rol es "student"
            // 2. Cuando se cambia el rol a "student" Y ya hay una ficha seleccionada
            const shouldGenerateStudentCode = 
                (key === "course" && value && updated.role === "student") ||
                (key === "role" && value === "student" && updated.course);
            
            if (shouldGenerateStudentCode) {
                const fichaCode = key === "course" ? value : updated.course;
                const generatedCode = generateStudentCode(fichaCode);
                if (generatedCode) {
                    updated.code = generatedCode;
                }
            }

            // Auto-generar código para profesores cuando se cambia el rol a "teacher"
            const shouldGenerateTeacherCode = 
                (key === "role" && value === "teacher");
            
            if (shouldGenerateTeacherCode) {
                const generatedCode = generateTeacherCode();
                if (generatedCode) {
                    updated.code = generatedCode;
                }
            }
            
            return updated;
        });
        if (showErrors) {
            // Nota: Los errores ahora se manejan por notificaciones push, 
            // pero mantenemos los estados visuales para UX
        }
    };

    const isEmpty = (v) => showErrors && !v.trim();

    const handleClose = () => {
        setForm({ ...EMPTY_FORM, role: initialRole || "" });
        setShowErrors(false);
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async () => {
        setShowErrors(true);
        
        // Verificar si las notificaciones push están habilitadas
        const config = getInstitutionConfig();
        
        // Validación detallada — obtener todos los errores
        const validationErrors = validateStudentFormDetailed(form);
        if (validationErrors.length > 0) {
            if (config.pushNotifications) {
                // Enviar notificación general si hay múltiples errores
                if (validationErrors.length > 1) {
                    pushNotification.error(
                        t("Error de validación"),
                        t("Completa todos los campos requeridos"),
                        { 
                            duration: config.pushDuration > 0 ? config.pushDuration * 1000 : 4000,
                            source: "student-form",
                            priority: "high"
                        }
                    );
                }
                
                // Enviar notificaciones específicas para cada campo con error
                validationErrors.forEach(error => {
                    pushNotification.error(
                        t("Campo requerido"),
                        t(error.message),
                        { 
                            duration: config.pushDuration > 0 ? config.pushDuration * 1000 : 4000,
                            source: `student-form-${error.field}`,
                            priority: "normal",
                            allowDuplicates: false // Evitar spam del mismo campo
                        }
                    );
                });
            }
            return;
        }

        // Ya no validamos biometría aquí, los campos son opcionales
        await doSave(form);
    };

    const doSave = async (formToSave) => {
        setSaving(true);
        const config = getInstitutionConfig();
        const err = await onSubmit(formToSave);
        setSaving(false);
        if (err) {
            if (config.pushNotifications) {
                pushNotification.error(
                    t("Error al guardar"),
                    t(err),
                    { 
                        duration: config.pushDuration > 0 ? config.pushDuration * 1000 : 5000 
                    }
                );
            }
        } else {
            // Mostrar notificación de éxito
            const currentRoleConfig = roleConfig[form.role] || roleConfig[""];
            if (config.pushNotifications) {
                pushNotification.success(
                    t("¡Guardado exitoso!"),
                    currentRoleConfig.successMessage,
                    { 
                        duration: config.pushDuration > 0 ? config.pushDuration * 1000 : 3000 
                    }
                );
            }
            
            setSuccess(true);
            setTimeout(() => {
                setForm(EMPTY_FORM);
                setShowErrors(false);
                setSuccess(false);
                onClose();
            }, 900);
        }
    };

    // Configuración dinámica según el rol (incluyendo modo genérico)
    const roleConfig = {
        "": {
            // Modo genérico cuando no hay rol seleccionado
            title: t("Nuevo usuario"),
            subtitle: t("Completa los datos del usuario"),
            icon: "user-plus",
            buttonLabel: t("Registrar usuario"),
            successMessage: t("Usuario registrado correctamente"),
            codeLabel: t("Código"),
            codePlaceholder: t("Este campo es automático"),
            programLabel: t("Programa/Departamento"),
            programPlaceholder: t("Ej: Ingeniería de Sistemas"),
            showProgram: true,
            showFaceRegistration: true,
            rolePlaceholder: t("Selecciona cuál"),
        },
        student: {
            title: t("Nuevo estudiante"),
            subtitle: t("Completa los datos del estudiante"),
            icon: "user-plus",
            buttonLabel: t("Registrar estudiante"),
            successMessage: t("Estudiante registrado correctamente"),
            codeLabel: t("Código estudiantil"),
            codePlaceholder: t("Este campo es automático"),
            programLabel: t("Programa"),
            programPlaceholder: t("Ej: Ingeniería de Sistemas"),
            showProgram: true,
            showFaceRegistration: true,
            rolePlaceholder: null,
        },
        teacher: {
            title: t("Nuevo docente"),
            subtitle: t("Completa los datos del docente"),
            icon: "book-open",
            buttonLabel: t("Registrar docente"),
            successMessage: t("Docente registrado correctamente"),
            codeLabel: t("Código docente"),
            codePlaceholder: t("Este campo es automático"),
            programLabel: t("Departamento"),
            programPlaceholder: t("Ej: Ingeniería de Software"),
            showProgram: true,
            showFaceRegistration: true,
            rolePlaceholder: null,
        },
        admin: {
            title: t("Nuevo administrador"),
            subtitle: t("Completa los datos del administrador"),
            icon: "shield",
            buttonLabel: t("Registrar administrador"),
            successMessage: t("Administrador registrado correctamente"),
            codeLabel: t("Código de usuario"),
            codePlaceholder: t("Ej: ADMIN001"),
            programLabel: t("Área"),
            programPlaceholder: t("Ej: Administración General"),
            showProgram: false,
            showFaceRegistration: false,
            rolePlaceholder: null,
        },
    };

    const config = roleConfig[form.role] || roleConfig[""];

    // �tems de estado
    const statusItems = [
        { value: "active", label: t("Activo"),   icon: "check-circle" },
        { value: "inactive", label: t("Inactivo"), icon: "x-circle"     },
    ];

    if (!visible) return null;

    return (
        <React.Fragment>
            <BaseModal
                visible={visible}
                onClose={handleClose}
                title={config.title}
                subtitle={config.subtitle}
                icon={config.icon}
                maxWidth={520}
                footer={
                    <React.Fragment>
                        <Button variant="ghost" onPress={handleClose} disabled={saving}>
                            {t("Cancelar")}
                        </Button>
                        <Button variant="primary" onPress={handleSubmit} disabled={saving || success}>
                            {saving
                                ? <ActivityIndicator size="small" color={c.brand.textOnPrimary} />
                                : success
                                    ? <React.Fragment><Feather name="check" size={14} color={c.brand.textOnPrimary} /> {t("¡Guardado!")}</React.Fragment>
                                    : config.buttonLabel}
                        </Button>
                    </React.Fragment>
                }
            >
                {/* Notificación de éxito local (sin afectar scroll) */}
                {success && (
                    <View style={{
                        backgroundColor: c.status.successLight,
                        borderRadius: 14,
                        padding: 12,
                        flexDirection: "row",
                        gap: 8,
                        marginBottom: 14,
                    }}>
                        <Feather name="check-circle" size={14} color={c.status.success} />
                        <Text style={{ fontSize: 11, color: c.status.success, flex: 1 }}>
                            {config.successMessage}
                        </Text>
                    </View>
                )}

                {/* Fila 1 — Nombre y Programa (intercambiados) */}
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12, marginTop:-10 }}>
                    <View style={{ flex: 1,}}>
                        <TextInput
                            label={t("Nombre completo") + " *"}
                            value={form.name}
                            onChangeText={v => setField("name", v)}
                            placeholder={t("Ej: Ana García López")}
                            error={isEmpty(form.name)}
                            errorMessage={isEmpty(form.name) ? "" : ""} // Sin texto de error, solo visual
                        />
                    </View>
                    {config.showProgram && (
                        <View style={{ flex: 1 }}>
                            <Text style={{ 
                                fontSize: 14, 
                                fontWeight: "600", 
                                color: showErrors && isEmpty(form.course) ? c.status.error : c.text.secondary, 
                                marginBottom: 6 
                            }}>
                                {config.programLabel + " *"}
                            </Text>
                            <AnimatedDropdown
                                items={fichaItems}
                                value={form.course}
                                onSelect={(value) => {
                                    setField("course", value);
                                }}
                                placeholder={config.programPlaceholder}
                                searchable
                                searchPlaceholder={t("Buscar programa...")}
                                error={showErrors && isEmpty(form.course)}
                                triggerHeight={48}
                            />
                        </View>
                    )}
                </View>

                {/* Fila 2 — Correo y Estado (optimizado para uniformidad) */}
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12, marginTop:4 }}>
                    <View style={{ flex: config.showProgram ? 2 : 1 , }}>
                        <TextInput
                            label={t("Correo electrónico") + " *"}
                            value={form.email}
                            onChangeText={v => setField("email", v)}
                            placeholder={t("correo@universidad.edu")}
                            type="email"
                            error={isEmpty(form.email)}
                            errorMessage={isEmpty(form.email) ? "" : ""} // Sin texto de error, solo visual
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.secondary, marginBottom: 6 }}>
                            {t("Estado")}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 8, height: 48 }}>
                            {statusItems.map((s) => (
                                <TouchableOpacity
                                    key={s.value}
                                    onPress={() => setField("status", s.value)}
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        paddingVertical: 10,
                                        paddingHorizontal: 8,
                                        borderRadius: 14,
                                        borderWidth: 1.5,
                                        borderColor: form.status === s.value
                                            ? c.brand.primary
                                            : c.border.primary,
                                        backgroundColor: form.status === s.value
                                            ? c.brand.primaryLight
                                            : c.background.app,
                                    }}
                                >
                                    <View style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: 12,
                                        backgroundColor: form.status === s.value
                                            ? c.brand.primary
                                            : c.interactive.disabled,
                                    }} />
                                    <Text style={{
                                        fontSize: 12,
                                        fontWeight: "600",
                                        color: form.status === s.value
                                            ? c.brand.primary
                                            : c.text.secondary,
                                    }}>
                                        {s.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Fila 3 — Código y Rol */}
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12, marginTop:4, marginBottom:-2}}>
                    <View style={{ flex: initialRole ? 1 : 1 }}>
                        <TextInput
                            label={config.codeLabel + " *"}
                            value={form.code}
                            onChangeText={v => setField("code", v)}
                            placeholder={config.codePlaceholder}
                            error={isEmpty(form.code)}
                            errorMessage={isEmpty(form.code) ? "" : ""} // Sin texto de error, solo visual
                            disabled={form.role === "student" || form.role === "teacher" || !form.role}
                        />
                    </View>
                    {/* Solo mostrar selector de rol si no hay initialRole predeterminado */}
                    {!initialRole && (
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: showErrors && !form.role ? c.status.error : c.text.secondary,
                                marginBottom: 6,
                            }}>
                                {t("Rol") + " *"}
                            </Text>
                            <AnimatedDropdown
                                items={ROLE_ITEMS.map(r => ({
                                    value:       r.value,
                                    label:       t(r.label),
                                    description: t(r.description),
                                    icon:        r.icon,
                                }))}
                                value={form.role}
                                onSelect={v => setField("role", v)}
                                placeholder={config.rolePlaceholder || t("Seleccionar rol")}
                                error={showErrors && !form.role}
                                triggerHeight={48}
                                disabled={!!initialRole}
                            />
                        </View>
                    )}
                </View>

                {/* Registro biométrico (solo para estudiantes y docentes) */}
                {config.showFaceRegistration && (
                    <View style={{
                        padding: 10,
                        borderWidth: 1.5,
                        borderColor: c.border.primary,
                        borderRadius: 14,
                        backgroundColor: c.background.app,
                        gap: 10,
                        marginTop:12,
                        marginBottom:-14,
                    }}>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary }}>
                            {t("Reconocimiento biométrico")}
                        </Text>
                        
                        {/* Checkboxes optimizados en la misma línea */}
                        <View style={{ flexDirection: "row", gap: 16 }}>
                            {/* Checkbox Facial */}
                            <TouchableOpacity
                                onPress={() => setField("hasFacial", !form.hasFacial)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                    flex: 1,
                                }}
                            >
                                <View style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 4,
                                    borderWidth: 2,
                                    borderColor: form.hasFacial ? c.status.success : c.border.primary,
                                    backgroundColor: form.hasFacial ? c.status.success : "transparent",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    {form.hasFacial && (
                                        <Feather name="check" size={12} color="#fff" />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary }}>
                                        {t("Registro facial")}
                                    </Text>
                                    <Text style={{ fontSize: 10, color: c.text.secondary }}>
                                        {t("Reconocimiento por rostro")}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            
                            {/* Checkbox Huella */}
                            <TouchableOpacity
                                onPress={() => setField("hasFingerprint", !form.hasFingerprint)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                    flex: 1,
                                }}
                            >
                                <View style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 4,
                                    borderWidth: 2,
                                    borderColor: form.hasFingerprint ? c.status.success : c.border.primary,
                                    backgroundColor: form.hasFingerprint ? c.status.success : "transparent",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    {form.hasFingerprint && (
                                        <Feather name="check" size={12} color="#fff" />
                                    )}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary }}>
                                        {t("Huella dactilar")}
                                    </Text>
                                    <Text style={{ fontSize: 10, color: c.text.secondary }}>
                                        {t("Reconocimiento por huella")}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </BaseModal>

            {/* Modal facial secundario */}
            <FaceRegistrationModal
                visible={showFaceModal}
                studentName={form.name}
                studentId={form.code}
                onClose={() => setShowFaceModal(false)}
                onConfirm={(_descriptor) => {
                    setShowFaceModal(false);
                    const formWithFace = { ...form, hasFacial: true };
                    pendingFormRef.current = formWithFace;
                    setForm(formWithFace);
                    doSave(formWithFace);
                }}
            />
        </React.Fragment>
    );
}

