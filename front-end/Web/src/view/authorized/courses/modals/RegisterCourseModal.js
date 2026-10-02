// ============================================================
//  FaceAttend EDU — RegisterCourseModal
//  Modal para registrar un nuevo curso/ficha.
//  Usa TextInput y AnimatedDropdown de componentes comunes.
//  La validación se hace en el ViewModel, no aquí.
// ============================================================

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, AnimatedDropdown, BaseModal, TextInput } from "../../../components/common";
import { useTheme } from "../../../components/hooks/useTheme";
import { useResponsive } from "../../../components/hooks/useResponsive";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../../../../context/AppDataContext";
import { getInstitutionConfig } from "../../../../core/config/institutionConfig";
import {
    EMPTY_COURSE_FORM,
    validateCourseForm,
} from "../../../../viewmodels/useCoursesViewModel";

// ── Jornadas disponibles ──────────────────────────────────

const JORNADA_ITEMS = [
    { value: "mañana", label: "Mañana", icon: "sunrise" },
    { value: "tarde", label: "Tarde", icon: "sun" },
    { value: "noche", label: "Noche", icon: "moon" },
    { value: "mixta", label: "Mixta", icon: "clock" },
];

// ── Estados disponibles ───────────────────────────────────

const STATUS_ITEMS = [
    { value: "active", label: "Activo", icon: "check-circle" },
    { value: "inactive", label: "Inactivo", icon: "x-circle" },
    { value: "completed", label: "Finalizado", icon: "archive" },
];

// ── Componente principal ─────────────────────────────────

export default function RegisterCourseModal({ visible, onClose, onSubmit }) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const { t } = useTranslation();
    const c = theme.colors;
    const appData = useAppData();

    const [form, setForm] = useState(EMPTY_COURSE_FORM);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [success, setSuccess] = useState(false);

    // Calcular placeholders dinámicos basados en HOY y el período configurado
    const [datePlaceholders, setDatePlaceholders] = useState({ start: "", end: "" });
    
    useEffect(() => {
        // Fecha de inicio: HOY
        const today = new Date();
        const startPlaceholder = today.toISOString().split('T')[0];
        
        // Fecha de finalización: calculada según tipo de período
        const config = getInstitutionConfig();
        const periodConfig = {
            'anual': 365,
            'semestral': 180,
            'cuatrimestral': 120,
            'trimestral': 90,
        };
        
        const daysToAdd = periodConfig[config.academicPeriodType] || 90;
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + daysToAdd);
        const endPlaceholder = endDate.toISOString().split('T')[0];
        
        setDatePlaceholders({ start: startPlaceholder, end: endPlaceholder });
    }, []);

    // Programas disponibles desde el contexto
    const programItems = appData.programs.map((p) => ({
        value: p.name,
        label: p.name,
        icon: "book-open",
    }));

    // Instructores disponibles desde el contexto
    const instructorItems = appData.teachers.map((t) => ({
        value: t.name,
        label: t.name,
        icon: "user",
    }));

    // Ambientes disponibles desde el contexto (fuente de verdad real)
    const environmentItems = appData.environments.map((env) => ({
        value: env.id,
        label: `${env.number} — ${env.description.split('—')[0].trim()}`,
        icon: "map-pin",
    }));

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (showErrors) setError(null);
    };

    const handleClose = () => {
        setForm(EMPTY_COURSE_FORM);
        setError(null);
        setShowErrors(false);
        setSuccess(false);
        onClose();
    };

    const handleSubmit = async () => {
        setShowErrors(true);
        setError(null);

        // Validación — la función es importada estáticamente
        const validationErr = validateCourseForm(form);
        if (validationErr) {
            setError(validationErr);
            return;
        }

        setSaving(true);
        setError(null);
        const err = await onSubmit(form);
        setSaving(false);

        if (err) {
            setError(t(err));
        } else {
            setSuccess(true);
            setTimeout(() => {
                setForm(EMPTY_COURSE_FORM);
                setShowErrors(false);
                setSuccess(false);
                onClose();
            }, 900);
        }
    };

    const isEmpty = (v) => showErrors && !v.trim();

    if (!visible) return null;

    return (
        <BaseModal
            visible={visible}
            onClose={handleClose}
            title={t("Nuevo curso")}
            subtitle={t("Completa los datos del curso/ficha")}
            icon="book-open"
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
                                : t("Registrar curso")}
                    </Button>
                </React.Fragment>
            }
        >
            {/* Error global */}
            {error && (
                <View style={{
                    backgroundColor: c.status.errorLight || c.status.error + "20",
                    borderRadius: 14,
                    padding: 12,
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 14,
                }}>
                    <Feather name="alert-circle" size={14} color={c.status.error} />
                    <Text style={{ fontSize: 13, color: c.status.error, flex: 1 }}>{error}</Text>
                </View>
            )}

            {/* Éxito */}
            {success && (
                <View style={{
                    backgroundColor: c.status.successLight || c.status.success + "20",
                    borderRadius: 14,
                    padding: 12,
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 14,
                }}>
                    <Feather name="check-circle" size={14} color={c.status.success} />
                    <Text style={{ fontSize: 13, color: c.status.success, flex: 1 }}>
                        {t("Curso registrado exitosamente")}
                    </Text>
                </View>
            )}

            {/* Fila 1 — Nombre y Código */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12 }}>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Nombre del curso")}
                        value={form.name}
                        onChangeText={v => setField("name", v)}
                        placeholder={t("Análisis y Desarrollo de Software")}
                        error={isEmpty(form.name)}
                        errorMessage={isEmpty(form.name) ? t("Campo requerido") : ""}
                        leftIcon={<Feather name="book-open" size={16} color={c.text.tertiary} />}
                    />
                </View>
                <View style={{ width: isSmall ? "100%" : 160 }}>
                    <TextInput
                        label={t("Código")}
                        value={form.code}
                        onChangeText={v => setField("code", v)}
                        placeholder={t("2240083")}
                        error={isEmpty(form.code)}
                        errorMessage={isEmpty(form.code) ? t("Campo requerido") : ""}
                        leftIcon={<Feather name="hash" size={16} color={c.text.tertiary} />}
                        style={{ paddingRight: 8 }}
                    />
                </View>
            </View>

            {/* Fila 2 — Jornada y Aula */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: showErrors && !form.schedule ? c.status.error : c.text.secondary,
                        marginBottom: 6,
                    }}>
                        {t("Jornada")}
                    </Text>
                    <AnimatedDropdown
                        items={JORNADA_ITEMS.map(r => ({
                            value: r.value,
                            label: t(r.label),
                            icon: r.icon,
                        }))}
                        value={form.schedule}
                        onSelect={v => setField("schedule", v)}
                        triggerIcon="moon"
                        error={showErrors && !form.schedule}
                        triggerHeight={48}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: showErrors && !form.room ? c.status.error : c.text.secondary,
                        marginBottom: 6,
                    }}>
                        {t("Salón")}
                    </Text>
                    <AnimatedDropdown
                        items={environmentItems}
                        value={form.room}
                        onSelect={v => setField("room", v)}
                        placeholder={t("Seleccionar ambiente")}
                        triggerIcon="map-pin"
                        error={showErrors && !form.room}
                        triggerHeight={48}
                    />
                </View>
            </View>

            {/* Fechas */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12 }}>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Fecha de inicio")}
                        value={form.startDate}
                        onChangeText={v => setField("startDate", v)}
                        placeholder={datePlaceholders.start}
                        error={isEmpty(form.startDate)}
                        errorMessage={isEmpty(form.startDate) ? t("Campo requerido") : ""}
                        leftIcon={<Feather name="calendar" size={16} color={c.text.tertiary} />}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Fecha de finalización")}
                        value={form.endDate}
                        onChangeText={v => setField("endDate", v)}
                        placeholder={datePlaceholders.end}
                        error={isEmpty(form.endDate)}
                        errorMessage={isEmpty(form.endDate) ? t("Campo requerido") : ""}
                        leftIcon={<Feather name="calendar" size={16} color={c.text.tertiary} />}
                    />
                </View>
            </View>
        </BaseModal>
    );
}
