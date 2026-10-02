// ============================================================
//  FaceAttend EDU — RegisterCourseModal
//  Modal para registrar un nuevo curso/ficha.
//  Usa TextInput y AnimatedDropdown de componentes comunes.
//  La validación se hace en el ViewModel, no aquí.
// ============================================================

import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, AnimatedDropdown, BaseModal, TextInput } from "../../../components/common";
import { useTheme } from "../../../components/hooks/useTheme";
import { useResponsive } from "../../../components/hooks/useResponsive";
import { useTranslation } from "../../../../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../../../../context/AppDataContext";
import {
    EMPTY_COURSE_FORM,
    validateCourseForm,
} from "../../../../viewmodels/useCoursesViewModel";

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
            maxWidth={580}
            footer={
                <>
                    <Button variant="ghost" onPress={handleClose} disabled={saving}>
                        {t("Cancelar")}
                    </Button>
                    <Button variant="primary" onPress={handleSubmit} disabled={saving || success}>
                        {saving ? (
                            <ActivityIndicator size="small" color={c.brand.textOnPrimary} />
                        ) : success ? (
                            <>
                                <Feather name="check" size={14} color={c.brand.textOnPrimary} />{" "}
                                {t("¡Guardado!")}
                            </>
                        ) : (
                            t("Registrar curso")
                        )}
                    </Button>
                </>
            }
        >
            {/* Error global */}
            {error && (
                <View
                    style={{
                        backgroundColor: c.status.errorLight || c.status.error + "20",
                        borderRadius: 14,
                        padding: 12,
                        flexDirection: "row",
                        gap: 8,
                        marginBottom: 14,
                    }}
                >
                    <Feather name="alert-circle" size={14} color={c.status.error} />
                    <Text style={{ fontSize: 13, color: c.status.error, flex: 1 }}>{error}</Text>
                </View>
            )}

            {/* Éxito */}
            {success && (
                <View
                    style={{
                        backgroundColor: c.status.successLight || c.status.success + "20",
                        borderRadius: 14,
                        padding: 12,
                        flexDirection: "row",
                        gap: 8,
                        marginBottom: 14,
                    }}
                >
                    <Feather name="check-circle" size={14} color={c.status.success} />
                    <Text style={{ fontSize: 13, color: c.status.success, flex: 1 }}>
                        {t("Curso registrado exitosamente")}
                    </Text>
                </View>
            )}

            {/* Formulario */}
            <View style={{ gap: 14 }}>
                {/* Fila 1: Código y Nombre */}
                <View
                    style={{
                        flexDirection: isSmall ? "column" : "row",
                        gap: 12,
                    }}
                >
                    <TextInput
                        label={t("Código")}
                        placeholder="2240083"
                        value={form.code}
                        onChangeText={(v) => setField("code", v)}
                        error={isEmpty(form.code)}
                        icon="hash"
                        style={{ flex: 1 }}
                    />
                    <TextInput
                        label={t("Nombre del curso")}
                        placeholder="Tecnología en Análisis y Desarrollo de Software"
                        value={form.name}
                        onChangeText={(v) => setField("name", v)}
                        error={isEmpty(form.name)}
                        icon="book-open"
                        style={{ flex: 2 }}
                    />
                </View>

                {/* Fila 2: Programa e Instructor */}
                <View
                    style={{
                        flexDirection: isSmall ? "column" : "row",
                        gap: 12,
                    }}
                >
                    <AnimatedDropdown
                        label={t("Programa")}
                        placeholder={t("Seleccionar programa")}
                        value={form.program}
                        onChange={(v) => setField("program", v)}
                        items={programItems}
                        error={isEmpty(form.program)}
                        style={{ flex: 1 }}
                    />
                    <AnimatedDropdown
                        label={t("Instructor")}
                        placeholder={t("Seleccionar instructor")}
                        value={form.instructor}
                        onChange={(v) => setField("instructor", v)}
                        items={instructorItems}
                        error={isEmpty(form.instructor)}
                        style={{ flex: 1 }}
                    />
                </View>

                {/* Fila 3: Semestre, Horario y Aula */}
                <View
                    style={{
                        flexDirection: isSmall ? "column" : "row",
                        gap: 12,
                    }}
                >
                    <TextInput
                        label={t("Semestre")}
                        placeholder="2024-2"
                        value={form.semester}
                        onChangeText={(v) => setField("semester", v)}
                        icon="calendar"
                        style={{ flex: 1 }}
                    />
                    <TextInput
                        label={t("Horario")}
                        placeholder="Lun-Vie 8:00-12:00"
                        value={form.schedule}
                        onChangeText={(v) => setField("schedule", v)}
                        icon="clock"
                        style={{ flex: 1 }}
                    />
                    <TextInput
                        label={t("Aula")}
                        placeholder="B-201"
                        value={form.room}
                        onChangeText={(v) => setField("room", v)}
                        icon="map-pin"
                        style={{ flex: 1 }}
                    />
                </View>

                {/* Fila 4: Fechas */}
                <View
                    style={{
                        flexDirection: isSmall ? "column" : "row",
                        gap: 12,
                    }}
                >
                    <TextInput
                        label={t("Fecha de inicio")}
                        placeholder="2024-01-15"
                        value={form.startDate}
                        onChangeText={(v) => setField("startDate", v)}
                        icon="calendar"
                        style={{ flex: 1 }}
                    />
                    <TextInput
                        label={t("Fecha de finalización")}
                        placeholder="2024-06-30"
                        value={form.endDate}
                        onChangeText={(v) => setField("endDate", v)}
                        icon="calendar"
                        style={{ flex: 1 }}
                    />
                </View>

                {/* Fila 5: Cupo máximo y Estado */}
                <View
                    style={{
                        flexDirection: isSmall ? "column" : "row",
                        gap: 12,
                    }}
                >
                    <TextInput
                        label={t("Cupo máximo")}
                        placeholder="30"
                        value={form.maxStudents.toString()}
                        onChangeText={(v) => setField("maxStudents", parseInt(v) || 0)}
                        keyboardType="numeric"
                        icon="users"
                        style={{ flex: 1 }}
                    />
                    <AnimatedDropdown
                        label={t("Estado")}
                        placeholder={t("Seleccionar estado")}
                        value={form.status}
                        onChange={(v) => setField("status", v)}
                        items={STATUS_ITEMS}
                        style={{ flex: 1 }}
                    />
                </View>
            </View>
        </BaseModal>
    );
}
