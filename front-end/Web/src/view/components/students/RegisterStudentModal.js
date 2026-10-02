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
import FaceRegistrationModal      from "./FaceRegistrationModal";
import {
    EMPTY_FORM,
    validateStudentForm,
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

    const [form,          setForm]          = useState({ ...EMPTY_FORM, role: initialRole || "" });
    const [error,         setError]         = useState(null);
    const [saving,        setSaving]        = useState(false);
    const [showErrors,    setShowErrors]    = useState(false);
    const [success,       setSuccess]       = useState(false);
    const [showFaceModal, setShowFaceModal] = useState(false);
    const [fichaSearch,   setFichaSearch]   = useState(""); // Para búsqueda de fichas
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

    // Filtrar fichas según búsqueda
    const filteredFichaItems = useMemo(() => {
        if (!fichaSearch.trim()) return fichaItems.slice(0, 5); // Máximo 5 por defecto
        
        const query = fichaSearch.toLowerCase();
        return fichaItems
            .filter(item => 
                item.label.toLowerCase().includes(query) ||
                item.value.toLowerCase().includes(query)
            )
            .slice(0, 5); // Máximo 5 resultados
    }, [fichaItems, fichaSearch]);

    // Calcular código estudiantil auto-incremental cuando se selecciona una ficha
    const generateStudentCode = (fichaCode) => {
        if (!fichaCode || !appData.students) return "";
        
        // Buscar el máximo número de estudiante en esta ficha
        const studentsInFicha = appData.students.filter(s => 
            s.code && s.code.startsWith(fichaCode)
        );
        
        let maxNumber = 0;
        studentsInFicha.forEach(s => {
            const numberPart = s.code.replace(fichaCode, "");
            const num = parseInt(numberPart, 10);
            if (!isNaN(num) && num > maxNumber) {
                maxNumber = num;
            }
        });
        
        // Incrementar y formatear con 3 dígitos
        const nextNumber = maxNumber + 1;
        const paddedNumber = nextNumber.toString().padStart(3, "0");
        
        return `${fichaCode}${paddedNumber}`;
    };

    // Sincronizar el rol del formulario cuando cambia initialRole (solo si el modal se abre de nuevo)
    React.useEffect(() => {
        if (visible && initialRole !== null && form.role !== initialRole) {
            setForm(prev => ({ ...prev, role: initialRole }));
        }
    }, [initialRole, visible]);

    const setField = (key, value) => {
        setForm((prev) => {
            const updated = { ...prev, [key]: value };
            
            // Auto-generar código estudiantil SOLO cuando:
            // 1. Se selecciona una ficha/curso (key === "course")
            // 2. El rol actual es "student"
            if (key === "course" && value && updated.role === "student") {
                const generatedCode = generateStudentCode(value);
                if (generatedCode) {
                    updated.code = generatedCode;
                }
            }
            
            return updated;
        });
        if (showErrors) setError(null);
    };

    const handleClose = () => {
        setForm({ ...EMPTY_FORM, role: initialRole || "" });
        setError(null);
        setShowErrors(false);
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async () => {
        setShowErrors(true);
        setError(null);

        // Validación — la función es importada estáticamente
        const validationErr = validateStudentForm(form);
        if (validationErr) return;

        if (!form.registered) {
            pendingFormRef.current = form;
            setShowFaceModal(true);
            return;
        }

        await doSave(form);
    };

    const doSave = async (formToSave) => {
        setSaving(true);
        setError(null);
        const err = await onSubmit(formToSave);
        setSaving(false);
        if (err) {
            setError(t(err));
        } else {
            setSuccess(true);
            setTimeout(() => {
                setForm(EMPTY_FORM);
                setShowErrors(false);
                setSuccess(false);
                onClose();
            }, 900);
        }
    };

    const isEmpty = (v) => showErrors && !v.trim();

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
            codePlaceholder: t("Ej: 2024001 o PROF001"),
            programLabel: t("Programa/Departamento"),
            programPlaceholder: t("Ej: Ingeniería de Sistemas"),
            showProgram: true,
            showFaceRegistration: true,
            rolePlaceholder: t("¿Selecciona cuál?"),
        },
        student: {
            title: t("Nuevo estudiante"),
            subtitle: t("Completa los datos del estudiante"),
            icon: "user-plus",
            buttonLabel: t("Registrar estudiante"),
            successMessage: t("Estudiante registrado correctamente"),
            codeLabel: t("Código estudiantil"),
            codePlaceholder: t("Ej: 2024001"),
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
            codePlaceholder: t("Ej: PROF001"),
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
                {/* Error global */}
                {error && (
                    <View style={{
                        backgroundColor: c.status.dangerLight,
                        borderRadius: 14,
                        padding: 12,
                        flexDirection: "row",
                        gap: 8,
                        marginBottom: 14,
                    }}>
                        <Feather name="alert-circle" size={14} color={c.status.danger} />
                        <Text style={{ fontSize: 11, color: c.status.danger, flex: 1 }}>{error}</Text>
                    </View>
                )}

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

                {/* Fila 1 — Nombre y Código */}
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12 }}>
                    <View style={{ flex: 1 }}>
                        <TextInput
                            label={t("Nombre completo") + " *"}
                            value={form.name}
                            onChangeText={v => setField("name", v)}
                            placeholder={t("Ej: Ana García López")}
                            error={isEmpty(form.name)}
                            errorMessage={isEmpty(form.name) ? t("Campo requerido") : ""}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <TextInput
                            label={config.codeLabel + " *"}
                            value={form.code}
                            onChangeText={v => setField("code", v)}
                            placeholder={config.codePlaceholder}
                            error={isEmpty(form.code)}
                            errorMessage={isEmpty(form.code) ? t("Campo requerido") : ""}
                            disabled={form.role === "student"} // Auto-generado para estudiantes
                            helperText={form.role === "student" && form.code ? t("Generado automáticamente") : ""}
                        />
                    </View>
                </View>

                {/* Correo */}
                <TextInput
                    label={t("Correo electrónico") + " *"}
                    value={form.email}
                    onChangeText={v => setField("email", v)}
                    placeholder={t("correo@universidad.edu")}
                    type="email"
                    error={isEmpty(form.email)}
                    errorMessage={isEmpty(form.email) ? t("Campo requerido") : ""}
                />

                {/* Fila 2 — Programa/Departamento y Rol */}
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12 }}>
                    {config.showProgram && (
                        <View style={{ flex: 1 }}>
                            {/* Dropdown con búsqueda para todos los roles excepto admin */}
                            <Text style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: showErrors && !form.course ? c.status.error : c.text.secondary,
                                marginBottom: 6,
                            }}>
                                {config.programLabel + " *"}
                            </Text>
                            <AnimatedDropdown
                                items={fichaItems}
                                value={form.course}
                                onSelect={v => setField("course", v)}
                                placeholder={t("Seleccionar ficha/curso")}
                                searchable={true}
                                searchPlaceholder={t("Buscar...")}
                                maxVisible={5}
                                triggerIcon="book-open"
                                error={showErrors && !form.course}
                                triggerHeight={48}
                            />
                        </View>
                    )}
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
                        />
                    </View>
                </View>

                {/* Estado */}
                <View style={{ marginBottom: 14 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.secondary, marginBottom: 6 }}>
                        {t("Estado")}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        {statusItems.map((s) => (
                            <TouchableOpacity
                                key={s.value}
                                onPress={() => setField("status", s.value)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                    paddingVertical: 10,
                                    paddingHorizontal: 14,
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
                                    width: 14,
                                    height: 14,
                                    borderRadius: 14,
                                    backgroundColor: form.status === s.value
                                        ? c.brand.primary
                                        : c.interactive.disabled,
                                }} />
                                <Text style={{
                                    fontSize: 13,
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

                {/* Registro facial (solo para estudiantes y docentes) */}
                {config.showFaceRegistration && (
                    <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 12,
                        borderWidth: 1.5,
                        borderColor: form.registered ? c.status.success : c.border.primary,
                        borderRadius: 14,
                        marginBottom: 14,
                        backgroundColor: c.background.app,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                            <Feather
                                name="aperture"
                                size={18}
                                color={form.registered ? c.status.success : c.brand.primary}
                            />
                            <View>
                                <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary }}>
                                    {t("Reconocimiento facial")}
                                </Text>
                                <Text style={{ fontSize: 12, color: form.registered ? c.status.success : c.text.secondary }}>
                                    {form.registered ? t("Rostro registrado") : t("Sin registro facial")}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => setField("registered", !form.registered)}
                            style={{
                                width: 40,
                                height: 20,
                                borderRadius: 14,
                                backgroundColor: form.registered
                                    ? c.status.success
                                    : c.interactive.disabled,
                                justifyContent: "center",
                                paddingHorizontal: 2,
                            }}
                        >
                            <View style={{
                                width: 16,
                                height: 16,
                                borderRadius: 14,
                                backgroundColor: "#fff",
                                alignSelf: form.registered ? "flex-end" : "flex-start",
                                shadowColor: "#000",
                                shadowOpacity: 0.2,
                                shadowRadius: 2,
                                elevation: 2,
                            }} />
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={{ fontSize: 12, color: c.text.secondary, textAlign: "right" }}>
                    * {t("Campos obligatorios")}
                </Text>
            </BaseModal>

            {/* Modal facial secundario */}
            <FaceRegistrationModal
                visible={showFaceModal}
                studentName={form.name}
                studentId={form.code}
                onClose={() => setShowFaceModal(false)}
                onConfirm={(_descriptor) => {
                    setShowFaceModal(false);
                    const formWithFace = { ...form, registered: true };
                    pendingFormRef.current = formWithFace;
                    setForm(formWithFace);
                    doSave(formWithFace);
                }}
            />
        </React.Fragment>
    );
}

