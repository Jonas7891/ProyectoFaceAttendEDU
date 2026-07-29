// ============================================================
//  FaceAttend EDU — RegisterStudentModal
//
//  Modal de registro manual de estudiantes.
//  Incluye todos los campos de la interfaz Student,
//  validación inline y soporte completo de i18n + tema.
// ============================================================

import React, { useState, useRef, useCallback } from "react";
import {
    Modal, View, Text, TextInput, ScrollView,
    TouchableOpacity, ActivityIndicator, KeyboardAvoidingView,
    Platform, Animated, Easing,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { UIButton, Badge } from "../ui/UI";
import { useTheme }       from "../hooks/useTheme";
import { useResponsive }  from "../hooks/useResponsive";
import { useTranslation } from "../../../i18n/hooks/useTranslation";
import type { AppUserRole } from "../../../models/types";
import FaceRegistrationModal from "./FaceRegistrationModal";
import {
    EMPTY_FORM,
    type StudentFormData,
} from "../../../viewmodels/useStudentsViewModel";

// ── Props ─────────────────────────────────────────────────

interface RegisterStudentModalProps {
    visible:  boolean;
    onClose:  () => void;
    onSubmit: (form: StudentFormData) => Promise<string | null>;
}

// ── Componente de campo de texto ─────────────────────────

function FormField({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType,
    error,
    hint,
}: {
    label:          string;
    value:          string;
    onChangeText:   (v: string) => void;
    placeholder?:   string;
    keyboardType?:  "default" | "email-address" | "numeric";
    error?:         boolean;
    hint?:          string;
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={{
                fontSize: 12, fontWeight: "600",
                color: error ? c.states.danger : c.text.secondary,
                marginBottom: 6,
            }}>
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={c.text.disabled}
                keyboardType={keyboardType ?? "default"}
                style={{
                    height: 40,
                    borderWidth: 1,
                    borderColor: error ? c.states.danger : c.border.primary,
                    borderRadius: 6,
                    paddingHorizontal: 12,
                    fontSize: 13,
                    backgroundColor: c.background.app,
                    color: c.text.primary,
                }}
            />
            {hint && (
                <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 4 }}>
                    {hint}
                </Text>
            )}
        </View>
    );
}

// ── Definición de roles disponibles ──────────────────────

const ROLES: { value: AppUserRole; labelES: string; labelKey: string; icon: string }[] = [
    { value: "admin",   labelES: "Administrador", labelKey: "Admin",   icon: "shield" },
    { value: "teacher", labelES: "Docente",       labelKey: "Teacher", icon: "book-open" },
    { value: "student", labelES: "Estudiante",    labelKey: "Student", icon: "user" },
];

// ── Selector de rol estilo pestaña ────────────────────────
// El panel usa un Modal transparente secundario para flotar
// por encima del ScrollView y del modal padre sin que nada
// lo recorte.

function RoleSelector({
    value,
    onChange,
    error,
}: {
    value:    AppUserRole;
    onChange: (role: AppUserRole) => void;
    error?:   boolean;
}) {
    const { theme }  = useTheme();
    const { t }      = useTranslation();
    const c          = theme.colors;

    const [open,        setOpen]        = useState(false);
    const [triggerRect, setTriggerRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const triggerRef   = useRef<View>(null);
    const dropdownAnim = useRef(new Animated.Value(0)).current;

    const TRIGGER_H = 40;
    const ITEM_H    = 44;
    const PANEL_H   = ROLES.length * ITEM_H;

    const measureAndOpen = useCallback(() => {
        triggerRef.current?.measureInWindow((x, y, width, height) => {
            setTriggerRect({ x, y, width, height });
            setOpen(true);
            Animated.timing(dropdownAnim, {
                toValue: 1, duration: 180,
                easing: Easing.out(Easing.quad), useNativeDriver: false,
            }).start();
        });
    }, [dropdownAnim]);

    const animateClose = useCallback(() => {
        Animated.timing(dropdownAnim, {
            toValue: 0, duration: 140,
            easing: Easing.in(Easing.quad), useNativeDriver: false,
        }).start(() => setOpen(false));
    }, [dropdownAnim]);

    const handleToggle = useCallback(() => {
        open ? animateClose() : measureAndOpen();
    }, [open, measureAndOpen, animateClose]);

    const handleSelect = useCallback((role: AppUserRole) => {
        onChange(role);
        animateClose();
    }, [onChange, animateClose]);

    const panelHeight = dropdownAnim.interpolate({
        inputRange: [0, 1], outputRange: [0, PANEL_H],
    });
    const panelOpacity = dropdownAnim.interpolate({
        inputRange: [0, 0.3, 1], outputRange: [0, 1, 1],
    });

    const current = ROLES.find(r => r.value === value) ?? ROLES[2];

    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={{
                fontSize: 12, fontWeight: "600",
                color: error ? c.states.danger : c.text.secondary,
                marginBottom: 6,
            }}>
                {t("Rol") + " *"}
            </Text>

            {/* ── Trigger ──────────────────────────────────── */}
            <View ref={triggerRef} collapsable={false}>
                <TouchableOpacity
                    onPress={handleToggle}
                    activeOpacity={0.8}
                    style={{
                        height: TRIGGER_H,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        paddingHorizontal: 12,
                        borderRadius: 6,
                        borderWidth: open ? 2 : 1,
                        borderColor: error
                            ? c.states.danger
                            : open ? c.brand.primary : c.border.primary,
                        backgroundColor: open ? c.brand.primaryLight : c.background.app,
                        borderBottomLeftRadius:  open ? 0 : 6,
                        borderBottomRightRadius: open ? 0 : 6,
                    }}
                >
                    <Feather
                        name={current.icon as any}
                        size={14}
                        color={open ? c.brand.primary : c.text.secondary}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 13, fontWeight: "600",
                            color: open ? c.brand.primary : c.text.primary,
                        }}>
                            {t(current.labelES)}
                        </Text>
                        <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 1 }}>
                            {t(current.labelKey)}
                        </Text>
                    </View>
                    <Animated.View style={{
                        transform: [{
                            rotate: dropdownAnim.interpolate({
                                inputRange: [0, 1], outputRange: ["0deg", "180deg"],
                            }),
                        }],
                    }}>
                        <Feather
                            name="chevron-down"
                            size={14}
                            color={open ? c.brand.primary : c.text.secondary}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* ── Dropdown en Modal transparente — flota sobre todo ── */}
            {open && triggerRect && (
                <Modal
                    transparent
                    animationType="none"
                    visible={open}
                    onRequestClose={animateClose}
                    statusBarTranslucent
                >
                    {/* Fondo invisible que cierra al tocar fuera */}
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={animateClose}
                    >
                        <Animated.View
                            pointerEvents="box-none"
                            style={{
                                position: "absolute",
                                top:    triggerRect.y + triggerRect.height,
                                left:   triggerRect.x,
                                width:  triggerRect.width,
                                height: panelHeight,
                                opacity: panelOpacity,
                                overflow: "hidden",
                                borderWidth: 2,
                                borderTopWidth: 0,
                                borderColor: c.brand.primary,
                                borderBottomLeftRadius: 6,
                                borderBottomRightRadius: 6,
                                backgroundColor: c.background.surface,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.18,
                                shadowRadius: 10,
                                elevation: 20,
                            }}
                        >
                            <TouchableOpacity activeOpacity={1}>
                                {ROLES.map((role, i) => {
                                    const active = value === role.value;
                                    const isLast = i === ROLES.length - 1;
                                    return (
                                        <TouchableOpacity
                                            key={role.value}
                                            onPress={() => handleSelect(role.value)}
                                            activeOpacity={0.7}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 10,
                                                paddingHorizontal: 12,
                                                paddingVertical: 11,
                                                backgroundColor: active ? c.brand.primaryLight : "transparent",
                                                borderBottomWidth: isLast ? 0 : 1,
                                                borderBottomColor: c.border.primary,
                                                height: ITEM_H,
                                            }}
                                        >
                                            <Feather
                                                name={role.icon as any}
                                                size={14}
                                                color={active ? c.brand.primary : c.text.secondary}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text style={{
                                                    fontSize: 13,
                                                    fontWeight: active ? "600" : "400",
                                                    color: active ? c.brand.primary : c.text.primary,
                                                }}>
                                                    {t(role.labelES)}
                                                </Text>
                                                <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                                    {t(role.labelKey)}
                                                </Text>
                                            </View>
                                            {active && (
                                                <Feather name="check" size={14} color={c.brand.primary} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
}

// ── Modal principal ───────────────────────────────────────

export default function RegisterStudentModal({
    visible, onClose, onSubmit,
}: RegisterStudentModalProps) {
    const { theme }   = useTheme();
    const { isSmall } = useResponsive();
    const { t }       = useTranslation();
    const c           = theme.colors;

    const [form,           setForm]           = useState<StudentFormData>(EMPTY_FORM);
    const [error,          setError]          = useState<string | null>(null);
    const [saving,         setSaving]         = useState(false);
    const [showErrors,     setShowErrors]     = useState(false);
    const [success,        setSuccess]        = useState(false);
    const [showFaceModal,  setShowFaceModal]  = useState(false);
    // Guarda el form validado listo para guardar tras el registro facial
    const pendingFormRef = useRef<StudentFormData | null>(null);

    const setField = <K extends keyof StudentFormData>(key: K, value: StudentFormData[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (showErrors) setError(null);
    };

    const handleClose = () => {
        setForm(EMPTY_FORM);
        setError(null);
        setShowErrors(false);
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async () => {
        setShowErrors(true);
        setError(null);

        // Validación previa sin guardar aún
        const { validateStudentForm } = await import("../../../viewmodels/useStudentsViewModel");
        const validationErr = validateStudentForm(form);
        if (validationErr) {
            setSaving(false);
            return;
        }

        // Si el reconocimiento facial no está registrado, abrimos el modal facial primero
        if (!form.registered) {
            pendingFormRef.current = form;
            setShowFaceModal(true);
            return;
        }

        // Guardar directamente (ya tiene facial registrado)
        await doSave(form);
    };

    const doSave = async (formToSave: StudentFormData) => {
        setSaving(true);
        setError(null);

        const err = await onSubmit(formToSave);
        setSaving(false);

        if (err) {
            setError(err);
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

    const isEmpty = (v: string) => showErrors && !v.trim();

    if (!visible) return null;

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        backgroundColor: c.background.overlay,
                        justifyContent: "center",
                        alignItems: "center",
                        padding: isSmall ? 12 : 24,
                    }}
                    onPress={handleClose}
                    activeOpacity={1}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={e => e.stopPropagation()}
                        style={{
                            backgroundColor: c.background.surface,
                            borderRadius: 14,
                            width: isSmall ? "100%" : 520,
                            maxHeight: "92%",
                            overflow: "hidden",
                            shadowColor: "#000",
                            shadowOpacity: 0.18,
                            shadowRadius: 24,
                            elevation: 14,
                        }}
                    >
                        {/* ── Header ─────────────────────────────── */}
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: 20,
                            borderBottomWidth: 1,
                            borderBottomColor: c.border.primary,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <View style={{
                                    width: 36, height: 36, borderRadius: 8,
                                    backgroundColor: c.brand.primaryLight,
                                    alignItems: "center", justifyContent: "center",
                                }}>
                                    <Feather name="user-plus" size={18} color={c.brand.primary} />
                                </View>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: "700", color: c.text.primary }}>
                                        {t("Nuevo estudiante")}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: c.text.secondary }}>
                                        {t("Completa los datos del estudiante")}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleClose}>
                                <Feather name="x" size={20} color={c.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {/* ── Body ───────────────────────────────── */}
                        <ScrollView
                            style={{ padding: 20 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Mensaje de error global */}
                            {error && (
                                <View style={{
                                    backgroundColor: c.states.dangerLight,
                                    borderRadius: 8, padding: 12,
                                    flexDirection: "row", alignItems: "center",
                                    gap: 8, marginBottom: 16,
                                }}>
                                    <Feather name="alert-circle" size={14} color={c.states.danger} />
                                    <Text style={{ fontSize: 12, color: c.states.danger, flex: 1 }}>
                                        {t(error)}
                                    </Text>
                                </View>
                            )}

                            {/* Mensaje de éxito */}
                            {success && (
                                <View style={{
                                    backgroundColor: c.states.successLight,
                                    borderRadius: 8, padding: 12,
                                    flexDirection: "row", alignItems: "center",
                                    gap: 8, marginBottom: 16,
                                }}>
                                    <Feather name="check-circle" size={14} color={c.states.success} />
                                    <Text style={{ fontSize: 12, color: "#065F46", flex: 1 }}>
                                        {t("Estudiante registrado correctamente")}
                                    </Text>
                                </View>
                            )}

                            {/* Fila 1 — Nombre y Código */}
                            <View style={{
                                flexDirection: isSmall ? "column" : "row",
                                gap: isSmall ? 0 : 12,
                            }}>
                                <View style={{ flex: 1 }}>
                                    <FormField
                                        label={t("Nombre completo") + " *"}
                                        value={form.name}
                                        onChangeText={v => setField("name", v)}
                                        placeholder={t("Ej: Ana García López")}
                                        error={isEmpty(form.name)}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FormField
                                        label={t("Código estudiantil") + " *"}
                                        value={form.code}
                                        onChangeText={v => setField("code", v)}
                                        placeholder={t("Ej: 2024001")}
                                        error={isEmpty(form.code)}
                                    />
                                </View>
                            </View>

                            {/* Correo */}
                            <FormField
                                label={t("Correo electrónico") + " *"}
                                value={form.email}
                                onChangeText={v => setField("email", v)}
                                placeholder={t("correo@universidad.edu")}
                                keyboardType="email-address"
                                error={isEmpty(form.email)}
                            />

                            {/* Fila 2 — Programa y Semestre */}
                            <View style={{
                                flexDirection: isSmall ? "column" : "row",
                                gap: isSmall ? 0 : 12,
                            }}>
                                <View style={{ flex: 1 }}>
                                    <FormField
                                        label={t("Programa") + " *"}
                                        value={form.course}
                                        onChangeText={v => setField("course", v)}
                                        placeholder={t("Ej: Ingeniería de Sistemas")}
                                        error={isEmpty(form.course)}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <RoleSelector
                                        value={form.role}
                                        onChange={v => setField("role", v)}
                                        error={showErrors && !form.role}
                                    />
                                </View>
                            </View>

                            {/* Estado */}
                            <View style={{ marginBottom: 14 }}>
                                <Text style={{
                                    fontSize: 12, fontWeight: "600",
                                    color: c.text.secondary, marginBottom: 8,
                                }}>
                                    {t("Estado")}
                                </Text>
                                <View style={{ flexDirection: "row", gap: 8 }}>
                                    {(["active", "inactive"] as const).map(s => (
                                        <TouchableOpacity
                                            key={s}
                                            onPress={() => setField("status", s)}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 6,
                                                paddingVertical: 8,
                                                paddingHorizontal: 14,
                                                borderRadius: 8,
                                                borderWidth: 1.5,
                                                borderColor: form.status === s
                                                    ? c.brand.primary
                                                    : c.border.primary,
                                                backgroundColor: form.status === s
                                                    ? c.brand.primaryLight
                                                    : c.background.app,
                                            }}
                                        >
                                            <View style={{
                                                width: 10, height: 10, borderRadius: 5,
                                                backgroundColor: form.status === s
                                                    ? c.brand.primary
                                                    : c.interactive.disabled,
                                            }} />
                                            <Text style={{
                                                fontSize: 12, fontWeight: "600",
                                                color: form.status === s
                                                    ? c.brand.primary
                                                    : c.text.secondary,
                                            }}>
                                                {s === "active" ? t("Activo") : t("Inactivo")}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Registro facial */}
                            <View style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: 14,
                                borderWidth: 1,
                                borderColor: form.registered ? c.states.success : c.border.primary,
                                borderRadius: 8,
                                marginBottom: 20,
                                backgroundColor: c.background.app,
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                                    <Feather
                                        name="aperture"
                                        size={18}
                                        color={form.registered ? c.states.success : c.brand.primary}
                                    />
                                    <View>
                                        <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary }}>
                                            {t("Reconocimiento facial")}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: form.registered ? c.states.success : c.text.secondary }}>
                                            {form.registered
                                                ? t("Rostro registrado")
                                                : t("Sin registro facial")}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setField("registered", !form.registered)}
                                    style={{
                                        width: 44, height: 24, borderRadius: 12,
                                        backgroundColor: form.registered
                                            ? c.states.success
                                            : c.interactive.disabled,
                                        justifyContent: "center",
                                        paddingHorizontal: 3,
                                    }}
                                >
                                    <View style={{
                                        width: 18, height: 18, borderRadius: 9,
                                        backgroundColor: "#fff",
                                        alignSelf: form.registered ? "flex-end" : "flex-start",
                                        shadowColor: "#000",
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                        elevation: 2,
                                    }} />
                                </TouchableOpacity>
                            </View>

                            <Text style={{
                                fontSize: 11, color: c.text.secondary,
                                marginBottom: 8, textAlign: "right",
                            }}>
                                * {t("Campos obligatorios")}
                            </Text>
                        </ScrollView>

                        {/* ── Footer ─────────────────────────────── */}
                        <View style={{
                            flexDirection: "row",
                            gap: 8,
                            justifyContent: "flex-end",
                            padding: 16,
                            borderTopWidth: 1,
                            borderTopColor: c.border.primary,
                        }}>
                            <UIButton variant="ghost" onPress={handleClose} disabled={saving}>
                                {t("Cancelar")}
                            </UIButton>
                            <UIButton
                                variant="primary"
                                onPress={handleSubmit}
                                disabled={saving || success}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : success ? (
                                    <><Feather name="check" size={14} color="#fff" /> {t("¡Guardado ✓")}</>
                                ) : (
                                    <><Feather name="user-plus" size={14} color="#fff" /> {t("Registrar estudiante")}</>
                                )}
                            </UIButton>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>

            {/* ── Modal de registro facial — se abre desde handleSubmit ── */}
            <FaceRegistrationModal
                visible={showFaceModal}
                studentName={form.name}
                studentId={form.code}
                onClose={() => setShowFaceModal(false)}
                onConfirm={(_descriptor) => {
                    setShowFaceModal(false);
                    if (pendingFormRef.current) {
                        const formWithFace = { ...pendingFormRef.current, registered: true };
                        pendingFormRef.current = null;
                        doSave(formWithFace);
                    }
                }}
            />
        </Modal>
    );
}
