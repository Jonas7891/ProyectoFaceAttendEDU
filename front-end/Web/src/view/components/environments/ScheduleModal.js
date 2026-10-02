// ============================================================
//  FaceAttend EDU — ScheduleModal
//  Modal para agregar/editar horarios en ambientes
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button, BaseModal, AnimatedDropdown } from "../common";
import TextInput from "../common/inputs/TextInput";
import { useTheme } from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import { useAppData } from "../../../context/AppDataContext";
import InstructorAutocomplete from "./InstructorAutocomplete";
import {
    EMPTY_SCHEDULE_FORM,
    WEEK_DAYS,
} from "../../../viewmodels/useEnvironmentsViewModel";

export default function ScheduleModal({
    visible,
    mode, // "add" | "edit"
    editing,
    envId,
    searchFn,
    onClose,
    onSave,
}) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const { t } = useTranslation();
    const c = theme.colors;
    const appData = useAppData();

    const [form, setForm] = useState(EMPTY_SCHEDULE_FORM);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const [courseNameInput, setCourseNameInput] = useState(""); // Para búsqueda bidireccional
    const [dropdownOpen, setDropdownOpen] = useState(false); // Controlar apertura del dropdown

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

    // Filtrar fichas según el input de "Nombre del programa" (búsqueda bidireccional)
    const filteredFichaItems = useMemo(() => {
        if (!courseNameInput.trim()) return fichaItems.slice(0, 5); // Máximo 5 por defecto
        
        const query = courseNameInput.toLowerCase();
        return fichaItems
            .filter(item => 
                item.label.toLowerCase().includes(query) ||
                item.value.toLowerCase().includes(query)
            )
            .slice(0, 5); // Máximo 5 resultados
    }, [fichaItems, courseNameInput]);

    useEffect(() => {
        if (visible && editing) {
            setForm({
                courseCode: editing.courseCode,
                courseName: editing.courseName,
                instructorQuery: editing.instructorName,
                instructorId: editing.instructor,
                instructorName: editing.instructorName,
                startTime: editing.startTime,
                endTime: editing.endTime,
                days: [...editing.days],
            });
            setCourseNameInput(editing.courseName); // Sincronizar input de nombre
        } else if (visible) {
            setForm(EMPTY_SCHEDULE_FORM);
            setCourseNameInput(""); // Limpiar input de nombre
        }
        setError(null);
        setShowErrors(false);
        setSaving(false);
    }, [visible, editing]);

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (showErrors) setError(null);
    };

    // Handler para cuando se selecciona una ficha del dropdown
    const handleFichaSelect = (fichaCode) => {
        const selectedFicha = appData.courses.find(c => c.code === fichaCode);
        if (selectedFicha) {
            setForm(prev => ({
                ...prev,
                courseCode: selectedFicha.code,
                courseName: selectedFicha.name,
            }));
            setCourseNameInput(selectedFicha.name); // Sincronizar input
        }
        setDropdownOpen(false); // Cerrar dropdown al seleccionar
        if (showErrors) setError(null);
    };

    // Handler para cuando se escribe en "Nombre del programa"
    const handleCourseNameChange = (value) => {
        setCourseNameInput(value); // Actualizar búsqueda para filtrar dropdown
        setForm(prev => ({
            ...prev,
            courseName: value,
        }));
        
        // Abrir dropdown cuando se escribe (mínimo 1 carácter)
        if (value.trim().length > 0) {
            setDropdownOpen(true);
        } else {
            setDropdownOpen(false);
        }
        
        if (showErrors) setError(null);
    };

    const toggleDay = (day) => {
        setField(
            "days",
            form.days.includes(day)
                ? form.days.filter((d) => d !== day)
                : [...form.days, day]
        );
    };

    const handleSave = async () => {
        setShowErrors(true);
        setSaving(true);
        setError(null);
        
        const err = await onSave(form);
        setSaving(false);
        
        if (err) {
            setError(t(err));
        } else {
            onClose();
        }
    };

    const isEmpty = (v) => showErrors && !v.trim();

    const footer = (
        <>
            <Button variant="ghost" size="md" onPress={onClose} disabled={saving}>
                {t("Cancelar")}
            </Button>
            <Button
                variant="primary"
                size="md"
                onPress={handleSave}
                disabled={saving}
                leftIcon={
                    saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Feather name="check" size={16} color="#fff" />
                    )
                }
            >
                {saving ? t("Guardando...") : t("Guardar horario")}
            </Button>
        </>
    );

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            title={mode === "add" ? t("Nuevo horario") : t("Editar horario")}
            subtitle={t("Asignación de ficha e instructor")}
            icon="clock"
            iconColor={c.brand.primary}
            size="md"
            footer={footer}
        >
            {/* Error alert */}
            {error && (
                <View
                    style={{
                        backgroundColor: c.status.dangerLight,
                        borderRadius: 12,
                        padding: 14,
                        flexDirection: "row",
                        gap: 10,
                        marginBottom: 20,
                    }}
                >
                    <Feather name="alert-circle" size={16} color={c.status.danger} />
                    <Text style={{ fontSize: 13, color: c.status.danger, flex: 1 }}>
                        {error}
                    </Text>
                </View>
            )}

            {/* Course info - Dropdown bidireccional */}
            <View style={{ marginBottom: 14, zIndex: (courseNameInput.trim().length > 0 && dropdownOpen) ? 1000 : 1 }}>
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 14, marginBottom: isSmall ? 0 : 14 }}>
                    <View style={{ flex: 1, minWidth: 160 }}>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: showErrors && !form.courseCode ? c.status.danger : c.text.secondary,
                            marginBottom: 6,
                        }}>
                            {t("Nº Ficha / Código")} *
                        </Text>
                        <AnimatedDropdown
                            items={filteredFichaItems}
                            value={form.courseCode}
                            onSelect={handleFichaSelect}
                            placeholder={t("Ej: 2240001")}
                            searchable={true}
                            searchPlaceholder={t("Buscar ficha...")}
                            maxVisible={5}
                            triggerIcon="book-open"
                            error={showErrors && !form.courseCode}
                            triggerHeight={48}
                            controlledOpen={courseNameInput.trim().length > 0 ? dropdownOpen : undefined}
                            onOpenChange={setDropdownOpen}
                        />
                    </View>
                    <View style={{ flex: 2, minWidth: 200 }}>
                        <TextInput
                            label={t("Nombre del programa") + " *"}
                            value={courseNameInput}
                            onChangeText={handleCourseNameChange}
                            placeholder={t("Ej: Tecnología en Sistemas")}
                            error={isEmpty(form.courseName)}
                            helperText={form.courseCode ? t("Vinculado a ficha ") + form.courseCode : ""}
                        />
                    </View>
                </View>
            </View>

            {/* Instructor autocomplete */}
            <View style={{ zIndex: (courseNameInput.trim().length > 0 && dropdownOpen) ? -1 : 1 }}>
                <InstructorAutocomplete
                    query={form.instructorQuery}
                    onChangeQuery={(v) => {
                        setField("instructorQuery", v);
                        setField("instructorId", "");
                        setField("instructorName", "");
                    }}
                    onSelect={(u) => {
                        setField("instructorId", u.id);
                        setField("instructorName", u.name);
                        setField("instructorQuery", u.name);
                    }}
                    searchFn={searchFn}
                    error={showErrors && !form.instructorId}
                />
            </View>

            {/* Time range */}
            <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 14, zIndex: (courseNameInput.trim().length > 0 && dropdownOpen) ? -1 : 1 }}>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Hora inicio") + " *"}
                        value={form.startTime}
                        onChangeText={(v) => setField("startTime", v)}
                        placeholder="08:00"
                        error={isEmpty(form.startTime)}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Hora fin") + " *"}
                        value={form.endTime}
                        onChangeText={(v) => setField("endTime", v)}
                        placeholder="10:00"
                        error={isEmpty(form.endTime)}
                    />
                </View>
            </View>

            {/* Days selector */}
            <View style={{ marginBottom: 14, zIndex: (courseNameInput.trim().length > 0 && dropdownOpen) ? -1 : 1 }}>
                <Text
                    style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: showErrors && form.days.length === 0 ? c.status.danger : c.text.secondary,
                        marginBottom: 10,
                    }}
                >
                    {t("Días de clase")} *
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {WEEK_DAYS.map((day) => {
                        const active = form.days.includes(day);
                        return (
                            <TouchableOpacity
                                key={day}
                                onPress={() => toggleDay(day)}
                                style={{
                                    paddingHorizontal: 14,
                                    paddingVertical: 8,
                                    borderRadius: 8,
                                    borderWidth: 2,
                                    borderColor: active ? c.brand.primary : c.border.primary,
                                    backgroundColor: active ? c.brand.primaryLight : c.background.app,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: "600",
                                        color: active ? c.brand.primary : c.text.secondary,
                                    }}
                                >
                                    {t(day)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <Text style={{ fontSize: 12, color: c.text.secondary, marginTop: 8, textAlign: "right" }}>
                * {t("Campos obligatorios")}
            </Text>
        </BaseModal>
    );
}
