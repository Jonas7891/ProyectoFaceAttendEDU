// ============================================================
//  FaceAttend EDU — Environments View
//  Gestión de ambientes/salones: CRUD + horarios por ambiente.
// ============================================================

import React, { useState } from "react";
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    Modal, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, Badge, PageHeader, UIButton, EmptyState } from "../ui/UI";
import { useTheme }        from "../hooks/useTheme";
import { useResponsive }   from "../hooks/useResponsive";
import { useTranslation }  from "../../../i18n/hooks/useTranslation";
import {
    useEnvironmentsViewModel,
    EMPTY_ENV_FORM,
    EMPTY_SCHEDULE_FORM,
    WEEK_DAYS,
    type EnvironmentFormData,
    type ScheduleFormData,
} from "../../../viewmodels/useEnvironmentsViewModel";
import type { Environment, EnvironmentSchedule, AppUser } from "../../../models/types";

// ── FormField helper ─────────────────────────────────────────

function FormField({ label, value, onChangeText, placeholder, keyboardType, error, hint, multiline }: {
    label: string; value: string; onChangeText: (v: string) => void;
    placeholder?: string; keyboardType?: "default" | "numeric";
    error?: boolean; hint?: string; multiline?: boolean;
}) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: error ? c.states.danger : c.text.secondary, marginBottom: 6 }}>
                {label}
            </Text>
            <TextInput
                value={value} onChangeText={onChangeText} placeholder={placeholder}
                placeholderTextColor={c.text.disabled} keyboardType={keyboardType ?? "default"}
                multiline={multiline} numberOfLines={multiline ? 3 : 1}
                style={{
                    minHeight: multiline ? 80 : 40, borderWidth: 1,
                    borderColor: error ? c.states.danger : c.border.primary,
                    borderRadius: 6, paddingHorizontal: 12, paddingTop: multiline ? 10 : 0,
                    fontSize: 13, backgroundColor: c.background.app, color: c.text.primary,
                    textAlignVertical: multiline ? "top" : "center",
                }}
            />
            {hint && <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 4 }}>{hint}</Text>}
        </View>
    );
}

// ── InstructorAutocomplete ───────────────────────────────────

function InstructorAutocomplete({ query, onChangeQuery, onSelect, searchFn, error, t }: {
    query: string;
    onChangeQuery: (v: string) => void;
    onSelect: (u: AppUser) => void;
    searchFn: (q: string) => AppUser[];
    error?: boolean;
    t: (s: string) => string;
}) {
    const { theme } = useTheme();
    const c = theme.colors;
    const [open, setOpen] = useState(false);
    const results = searchFn(query);

    return (
        <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: error ? c.states.danger : c.text.secondary, marginBottom: 6 }}>
                {t("Instructor / Docente encargado")} *
            </Text>
            <View style={{ position: "relative" }}>
                <View style={{ position: "absolute", left: 10, top: 13, zIndex: 1 }}>
                    <Feather name="search" size={14} color={c.text.secondary} />
                </View>
                <TextInput
                    value={query}
                    onChangeText={(v) => { onChangeQuery(v); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder={t("Buscar instructor por nombre...")}
                    placeholderTextColor={c.text.disabled}
                    style={{
                        height: 40, borderWidth: 1,
                        borderColor: error ? c.states.danger : c.border.primary,
                        borderRadius: 6, paddingLeft: 32, paddingRight: 12,
                        fontSize: 13, backgroundColor: c.background.app, color: c.text.primary,
                    }}
                />
            </View>
            {open && results.length > 0 && (
                <View style={{
                    borderWidth: 1, borderColor: c.border.primary, borderRadius: 6,
                    backgroundColor: c.background.elevated, marginTop: 2,
                    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 6,
                    zIndex: 999,
                }}>
                    {results.map((u, i) => (
                        <TouchableOpacity
                            key={u.id}
                            onPress={() => { onSelect(u); setOpen(false); }}
                            style={{
                                flexDirection: "row", alignItems: "center", gap: 10,
                                padding: 10,
                                borderBottomWidth: i < results.length - 1 ? 1 : 0,
                                borderBottomColor: c.border.primary,
                            }}
                        >
                            <View style={{
                                width: 32, height: 32, borderRadius: 16,
                                backgroundColor: c.brand.primaryLight,
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <Feather name="user" size={14} color={c.brand.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary }}>{u.name}</Text>
                                <Text style={{ fontSize: 11, color: c.text.secondary }}>{u.department ?? u.email}</Text>
                            </View>
                            <Badge variant={u.role === "admin" ? "warning" : "primary"}>
                                {u.role === "admin" ? t("Admin") : t("Docente")}
                            </Badge>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

// ── ScheduleModal ─────────────────────────────────────────────

function ScheduleModal({ visible, mode, editing, envId, searchFn, onClose, onSave, t }: {
    visible: boolean; mode: "add" | "edit" | "none";
    editing: EnvironmentSchedule | null;
    envId: string | null;
    searchFn: (q: string) => AppUser[];
    onClose: () => void;
    onSave: (form: ScheduleFormData) => Promise<string | null>;
    t: (s: string) => string;
}) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const c = theme.colors;

    const [form, setForm] = useState<ScheduleFormData>(EMPTY_SCHEDULE_FORM);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    React.useEffect(() => {
        if (visible && editing) {
            setForm({
                courseCode:      editing.courseCode,
                courseName:      editing.courseName,
                instructorQuery: editing.instructorName,
                instructorId:    editing.instructor,
                instructorName:  editing.instructorName,
                startTime:       editing.startTime,
                endTime:         editing.endTime,
                days:            [...editing.days],
            });
        } else if (visible) {
            setForm(EMPTY_SCHEDULE_FORM);
        }
        setError(null); setShowErrors(false); setSaving(false);
    }, [visible, editing]);

    const setField = <K extends keyof ScheduleFormData>(k: K, v: ScheduleFormData[K]) =>
        setForm(p => ({ ...p, [k]: v }));

    const toggleDay = (d: string) =>
        setField("days", form.days.includes(d) ? form.days.filter(x => x !== d) : [...form.days, d]);

    const handleSave = async () => {
        setShowErrors(true); setSaving(true); setError(null);
        const err = await onSave(form);
        setSaving(false);
        if (err) { setError(t(err)); } else { onClose(); }
    };

    if (!visible) return null;
    const isEmpty = (v: string) => showErrors && !v.trim();

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: c.background.overlay, justifyContent: "center", alignItems: "center", padding: isSmall ? 12 : 24 }}
                    onPress={onClose} activeOpacity={1}
                >
                    <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}
                        style={{ backgroundColor: c.background.surface, borderRadius: 14, width: isSmall ? "100%" : 540, maxHeight: "92%", overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 24, elevation: 14 }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: c.border.primary }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: c.brand.primaryLight, alignItems: "center", justifyContent: "center" }}>
                                    <Feather name="clock" size={18} color={c.brand.primary} />
                                </View>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: "700", color: c.text.primary }}>
                                        {mode === "add" ? t("Nuevo horario") : t("Editar horario")}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: c.text.secondary }}>{t("Asignación de ficha e instructor")}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose}><Feather name="x" size={20} color={c.text.secondary} /></TouchableOpacity>
                        </View>

                        <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {error && (
                                <View style={{ backgroundColor: c.states.dangerLight, borderRadius: 8, padding: 12, flexDirection: "row", gap: 8, marginBottom: 16 }}>
                                    <Feather name="alert-circle" size={14} color={c.states.danger} />
                                    <Text style={{ fontSize: 12, color: c.states.danger, flex: 1 }}>{error}</Text>
                                </View>
                            )}

                            <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12 }}>
                                <View style={{ flex: 1 }}>
                                    <FormField label={t("N° Ficha / Código") + " *"} value={form.courseCode}
                                        onChangeText={v => setField("courseCode", v)} placeholder="Ej: 2240001" error={isEmpty(form.courseCode)} />
                                </View>
                                <View style={{ flex: 2 }}>
                                    <FormField label={t("Nombre del programa") + " *"} value={form.courseName}
                                        onChangeText={v => setField("courseName", v)} placeholder={t("Ej: Tecnología en Sistemas")} error={isEmpty(form.courseName)} />
                                </View>
                            </View>

                            <InstructorAutocomplete
                                query={form.instructorQuery}
                                onChangeQuery={v => { setField("instructorQuery", v); setField("instructorId", ""); setField("instructorName", ""); }}
                                onSelect={u => { setField("instructorId", u.id); setField("instructorName", u.name); setField("instructorQuery", u.name); }}
                                searchFn={searchFn}
                                error={showErrors && !form.instructorId}
                                t={t}
                            />

                            <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12 }}>
                                <View style={{ flex: 1 }}>
                                    <FormField label={t("Hora inicio") + " *"} value={form.startTime}
                                        onChangeText={v => setField("startTime", v)} placeholder="08:00" error={isEmpty(form.startTime)} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FormField label={t("Hora fin") + " *"} value={form.endTime}
                                        onChangeText={v => setField("endTime", v)} placeholder="10:00" error={isEmpty(form.endTime)} />
                                </View>
                            </View>

                            <View style={{ marginBottom: 14 }}>
                                <Text style={{ fontSize: 12, fontWeight: "600", color: showErrors && form.days.length === 0 ? c.states.danger : c.text.secondary, marginBottom: 8 }}>
                                    {t("Días de clase")} *
                                </Text>
                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                                    {WEEK_DAYS.map(d => {
                                        const active = form.days.includes(d);
                                        return (
                                            <TouchableOpacity key={d} onPress={() => toggleDay(d)}
                                                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5,
                                                    borderColor: active ? c.brand.primary : c.border.primary,
                                                    backgroundColor: active ? c.brand.primaryLight : c.background.app }}>
                                                <Text style={{ fontSize: 12, fontWeight: "600", color: active ? c.brand.primary : c.text.secondary }}>{t(d)}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <Text style={{ fontSize: 11, color: c.text.secondary, marginBottom: 8, textAlign: "right" }}>* {t("Campos obligatorios")}</Text>
                        </ScrollView>

                        <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end", padding: 16, borderTopWidth: 1, borderTopColor: c.border.primary }}>
                            <UIButton variant="ghost" onPress={onClose} disabled={saving}>{t("Cancelar")}</UIButton>
                            <UIButton variant="primary" onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator size="small" color="#fff" /> : <><Feather name="check" size={14} color="#fff" /> {t("Guardar horario")}</>}
                            </UIButton>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ── EnvironmentFormModal ──────────────────────────────────────

function EnvironmentFormModal({ visible, mode, environment, onClose, onSubmit, t }: {
    visible: boolean; mode: "register" | "edit" | "none";
    environment: Environment | null;
    onClose: () => void;
    onSubmit: (form: EnvironmentFormData) => Promise<string | null>;
    t: (s: string) => string;
}) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const c = theme.colors;

    const [form, setForm] = useState<EnvironmentFormData>(EMPTY_ENV_FORM);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    React.useEffect(() => {
        if (visible && mode === "edit" && environment) {
            setForm({ number: environment.number, description: environment.description, capacity: environment.capacity ? String(environment.capacity) : "" });
        } else if (visible) {
            setForm(EMPTY_ENV_FORM);
        }
        setError(null); setSaving(false); setSuccess(false); setShowErrors(false);
    }, [visible, mode, environment]);

    const setField = <K extends keyof EnvironmentFormData>(k: K, v: EnvironmentFormData[K]) =>
        setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async () => {
        setShowErrors(true); setSaving(true); setError(null);
        const err = await onSubmit(form);
        setSaving(false);
        if (err) { setError(t(err)); } else {
            setSuccess(true);
            setTimeout(() => { setSuccess(false); onClose(); }, 800);
        }
    };

    if (!visible) return null;
    const isEmpty = (v: string) => showErrors && !v.trim();

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: c.background.overlay, justifyContent: "center", alignItems: "center", padding: isSmall ? 12 : 24 }}
                    onPress={onClose} activeOpacity={1}>
                    <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}
                        style={{ backgroundColor: c.background.surface, borderRadius: 14, width: isSmall ? "100%" : 500, maxHeight: "92%", overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 24, elevation: 14 }}>

                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: c.border.primary }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: c.brand.primaryLight, alignItems: "center", justifyContent: "center" }}>
                                    <Feather name="home" size={18} color={c.brand.primary} />
                                </View>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: "700", color: c.text.primary }}>
                                        {mode === "register" ? t("Nuevo ambiente") : t("Editar ambiente")}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: c.text.secondary }}>{t("Información del salón / espacio")}</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose}><Feather name="x" size={20} color={c.text.secondary} /></TouchableOpacity>
                        </View>

                        <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                            {error && (
                                <View style={{ backgroundColor: c.states.dangerLight, borderRadius: 8, padding: 12, flexDirection: "row", gap: 8, marginBottom: 16 }}>
                                    <Feather name="alert-circle" size={14} color={c.states.danger} />
                                    <Text style={{ fontSize: 12, color: c.states.danger, flex: 1 }}>{error}</Text>
                                </View>
                            )}
                            {success && (
                                <View style={{ backgroundColor: c.states.successLight, borderRadius: 8, padding: 12, flexDirection: "row", gap: 8, marginBottom: 16 }}>
                                    <Feather name="check-circle" size={14} color={c.states.success} />
                                    <Text style={{ fontSize: 12, color: "#065F46", flex: 1 }}>{t("Ambiente guardado correctamente")}</Text>
                                </View>
                            )}

                            <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12 }}>
                                <View style={{ flex: 1 }}>
                                    <FormField label={t("Número / Nombre del ambiente") + " *"} value={form.number}
                                        onChangeText={v => setField("number", v)} placeholder={t("Ej: 301")} error={isEmpty(form.number)} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <FormField label={t("Capacidad (personas)")} value={form.capacity}
                                        onChangeText={v => setField("capacity", v)} placeholder="40" keyboardType="numeric"
                                        hint={t("Opcional")} />
                                </View>
                            </View>

                            <FormField label={t("Descripción / Ubicación") + " *"} value={form.description}
                                onChangeText={v => setField("description", v)}
                                placeholder={t("Ej: Bloque A, piso 3. Aula de teoría con videobeam.")}
                                error={isEmpty(form.description)} multiline />

                            <Text style={{ fontSize: 11, color: c.text.secondary, marginBottom: 8, textAlign: "right" }}>* {t("Campos obligatorios")}</Text>
                        </ScrollView>

                        <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end", padding: 16, borderTopWidth: 1, borderTopColor: c.border.primary }}>
                            <UIButton variant="ghost" onPress={onClose} disabled={saving}>{t("Cancelar")}</UIButton>
                            <UIButton variant="primary" onPress={handleSubmit} disabled={saving || success}>
                                {saving ? <ActivityIndicator size="small" color="#fff" />
                                    : success ? <><Feather name="check" size={14} color="#fff" /> {t("¡Guardado ✓")}</>
                                    : <><Feather name="home" size={14} color="#fff" /> {mode === "register" ? t("Registrar ambiente") : t("Guardar cambios")}</>}
                            </UIButton>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ── ScheduleRow ───────────────────────────────────────────────

function ScheduleRow({ schedule, onEdit, onDelete, isLast, t }: {
    schedule: EnvironmentSchedule; onEdit: () => void; onDelete: () => void;
    isLast: boolean; t: (s: string) => string;
}) {
    const { theme } = useTheme();
    const c = theme.colors;
    return (
        <View style={{ paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: c.border.primary, gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Badge variant="primary">{schedule.courseCode}</Badge>
                        <Text style={{ fontSize: 13, fontWeight: "600", color: c.text.primary, flex: 1 }} numberOfLines={1}>
                            {schedule.courseName}
                        </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <Feather name="user" size={12} color={c.text.secondary} />
                        <Text style={{ fontSize: 12, color: c.text.secondary }}>{schedule.instructorName}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Feather name="clock" size={11} color={c.text.secondary} />
                            <Text style={{ fontSize: 11, color: c.text.secondary }}>{schedule.startTime} – {schedule.endTime}</Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 4 }}>
                            {schedule.days.map(d => (
                                <View key={d} style={{ backgroundColor: c.brand.primaryLight, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                                    <Text style={{ fontSize: 10, fontWeight: "700", color: c.brand.primary }}>{t(d)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: "row", gap: 6, marginLeft: 10 }}>
                    <TouchableOpacity onPress={onEdit} style={{ padding: 6, borderRadius: 6, backgroundColor: c.brand.primaryLight }}>
                        <Feather name="edit-2" size={13} color={c.brand.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} style={{ padding: 6, borderRadius: 6, backgroundColor: c.states.dangerLight }}>
                        <Feather name="trash-2" size={13} color={c.states.danger} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

// ── EnvironmentDetailModal ────────────────────────────────────

function EnvironmentDetailModal({ environment, onClose, onEdit, onDelete, onAddSchedule, onEditSchedule, onDeleteSchedule, t }: {
    environment: Environment | null; onClose: () => void;
    onEdit: () => void; onDelete: () => void;
    onAddSchedule: () => void;
    onEditSchedule: (s: EnvironmentSchedule) => void;
    onDeleteSchedule: (scheduleId: string) => void;
    t: (s: string) => string;
}) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const c = theme.colors;
    if (!environment) return null;

    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: c.background.overlay, justifyContent: "center", alignItems: "center", padding: isSmall ? 12 : 24 }}
                onPress={onClose} activeOpacity={1}>
                <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}
                    style={{ backgroundColor: c.background.surface, borderRadius: 12, width: isSmall ? "100%" : 580, maxHeight: "92%", overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, elevation: 12 }}>

                    {/* Header */}
                    <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: c.border.primary, flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
                        <View style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: c.brand.primaryLight, alignItems: "center", justifyContent: "center" }}>
                            <Feather name="home" size={22} color={c.brand.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, fontWeight: "700", color: c.text.primary }}>{t("Ambiente")} {environment.number}</Text>
                            {environment.capacity && (
                                <Text style={{ fontSize: 12, color: c.text.secondary, marginTop: 2 }}>
                                    <Feather name="users" size={11} /> {environment.capacity} {t("personas")}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={onClose}><Feather name="x" size={18} color={c.text.secondary} /></TouchableOpacity>
                    </View>

                    <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                        {/* Descripción */}
                        <View style={{ backgroundColor: c.background.app, borderRadius: 8, padding: 14, marginBottom: 16 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                <Feather name="map-pin" size={13} color={c.text.secondary} />
                                <Text style={{ fontSize: 11, fontWeight: "600", color: c.text.secondary, textTransform: "uppercase", letterSpacing: 0.5 }}>{t("Ubicación / Descripción")}</Text>
                            </View>
                            <Text style={{ fontSize: 13, color: c.text.primary, lineHeight: 20 }}>{environment.description}</Text>
                        </View>

                        {/* Horarios */}
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <Text style={{ fontSize: 14, fontWeight: "700", color: c.text.primary }}>{t("Horarios asignados")}</Text>
                            <UIButton variant="primary" size="sm" onPress={onAddSchedule}>
                                <Feather name="plus" size={13} color="#fff" /> {"  "}{t("Añadir horario")}
                            </UIButton>
                        </View>

                        <Card padding={0}>
                            {environment.schedules.length === 0 ? (
                                <EmptyState
                                    icon={<Feather name="calendar" size={36} color={c.text.secondary} />}
                                    title={t("Sin horarios")}
                                    description={t("Este ambiente no tiene horarios asignados aún")}
                                />
                            ) : environment.schedules.map((s, i) => (
                                <ScheduleRow key={s.id} schedule={s}
                                    onEdit={() => onEditSchedule(s)}
                                    onDelete={() => onDeleteSchedule(s.id)}
                                    isLast={i === environment.schedules.length - 1}
                                    t={t}
                                />
                            ))}
                        </Card>
                    </ScrollView>

                    {/* Footer */}
                    <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: c.border.primary, flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
                        <UIButton variant="danger" size="sm" onPress={onDelete}>
                            <Feather name="trash-2" size={13} color={c.states.danger} /> {"  "}{t("Eliminar")}
                        </UIButton>
                        <UIButton variant="ghost" onPress={onClose}>{t("Cerrar")}</UIButton>
                        <UIButton variant="primary" onPress={onEdit}>
                            <Feather name="edit-2" size={13} color="#fff" /> {"  "}{t("Editar ambiente")}
                        </UIButton>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

// ── EnvironmentCard ───────────────────────────────────────────

function EnvironmentCard({ environment, onPress }: { environment: Environment; onPress: () => void }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    return (
        <TouchableOpacity onPress={onPress} style={{ flex: 1, minWidth: 260 }}>
            <Card padding={0} style={{ overflow: "hidden", height: "100%" }}>
                <View style={{ height: 4, backgroundColor: c.brand.primary }} />
                <View style={{ padding: 18, flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, fontWeight: "800", color: c.brand.primary }}>{environment.number}</Text>
                            <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 1 }} numberOfLines={2}>{environment.description}</Text>
                        </View>
                        {environment.capacity && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: c.background.app, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                <Feather name="users" size={11} color={c.text.secondary} />
                                <Text style={{ fontSize: 11, color: c.text.secondary }}>{environment.capacity}</Text>
                            </View>
                        )}
                    </View>

                    <View style={{ height: 1, backgroundColor: c.border.primary, marginVertical: 12 }} />

                    <Text style={{ fontSize: 11, fontWeight: "600", color: c.text.secondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                        {t("Horarios asignados")} ({environment.schedules.length})
                    </Text>

                    {environment.schedules.length === 0 ? (
                        <Text style={{ fontSize: 12, color: c.text.disabled, fontStyle: "italic" }}>{t("Sin horarios asignados")}</Text>
                    ) : environment.schedules.slice(0, 3).map(s => (
                        <View key={s.id} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.brand.primary }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 12, fontWeight: "600", color: c.text.primary }} numberOfLines={1}>
                                    {s.courseCode} · {s.courseName}
                                </Text>
                                <Text style={{ fontSize: 11, color: c.text.secondary }} numberOfLines={1}>
                                    {s.instructorName} · {s.startTime}–{s.endTime} · {s.days.join(", ")}
                                </Text>
                            </View>
                        </View>
                    ))}
                    {environment.schedules.length > 3 && (
                        <Text style={{ fontSize: 11, color: c.brand.primary, marginTop: 2 }}>+{environment.schedules.length - 3} {t("más...")}</Text>
                    )}
                </View>
            </Card>
        </TouchableOpacity>
    );
}

// ── EnvironmentsView (principal) ──────────────────────────────

export default function EnvironmentsView() {
    const { isSmall } = useResponsive();
    const { theme }   = useTheme();
    const c           = theme.colors;
    const vm          = useEnvironmentsViewModel();
    const { t }       = useTranslation();

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    const totalSchedules = vm.environments.reduce((acc, e) => acc + e.schedules.length, 0);

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: isSmall ? 16 : 28, gap: 16 }} showsVerticalScrollIndicator={false}>
                <PageHeader
                    title={t("Ambientes")}
                    subtitle={`${vm.filtered.length} ${vm.filtered.length !== 1 ? t("ambientes registrados") : t("ambiente registrado")}`}
                    actions={
                        <UIButton variant="primary" size="sm" onPress={vm.openRegisterModal}>
                            + {t("Nuevo ambiente")}
                        </UIButton>
                    }
                />

                {/* Mini stats */}
                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                    {[
                        { label: t("Total ambientes"), value: vm.environments.length, color: c.brand.primary  },
                        { label: t("Total horarios"),  value: totalSchedules,          color: c.states.success },
                        { label: t("Sin horarios"),    value: vm.environments.filter(e => e.schedules.length === 0).length, color: c.states.warning },
                    ].map(({ label, value, color }) => (
                        <Card key={label} style={{ flex: 1, minWidth: 100, alignItems: "center" }} padding={14}>
                            <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.secondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, textAlign: "center" }}>
                                {label}
                            </Text>
                            <Text style={{ fontSize: 22, fontWeight: "800", color }}>{value}</Text>
                        </Card>
                    ))}
                </View>

                {/* Búsqueda */}
                <View style={{ maxWidth: 400, position: "relative", justifyContent: "center" }}>
                    <View style={{ position: "absolute", left: 10, zIndex: 1 }}>
                        <Feather name="search" size={14} color={c.text.secondary} />
                    </View>
                    <TextInput
                        placeholder={t("Buscar por ambiente, ficha o instructor...")}
                        value={vm.search} onChangeText={vm.setSearch}
                        style={{ height: 38, borderWidth: 1, borderColor: c.border.primary, borderRadius: 6, paddingLeft: 32, paddingRight: 12, fontSize: 13, backgroundColor: c.background.surface, color: c.text.primary }}
                        placeholderTextColor={c.text.disabled}
                    />
                </View>

                {/* Grid de ambientes */}
                {vm.filtered.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon={<Feather name="home" size={40} color={c.text.secondary} />}
                            title={t("Sin ambientes")}
                            description={t("No se encontraron ambientes con ese criterio")}
                        />
                    </Card>
                ) : (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                        {vm.filtered.map(env => (
                            <View key={env.id} style={{ flexBasis: isSmall ? "100%" : "30%", flexGrow: 1 }}>
                                <EnvironmentCard environment={env} onPress={() => vm.selectEnvironment(env)} />
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Modal detalle */}
            {vm.envModalMode === "detail" && (
                <EnvironmentDetailModal
                    environment={vm.selected}
                    onClose={vm.clearSelection}
                    onEdit={() => vm.openEditModal(vm.selected!)}
                    onDelete={() => vm.removeEnvironment(vm.selected!.id)}
                    onAddSchedule={() => vm.openAddSchedule(vm.selected!.id)}
                    onEditSchedule={(s) => vm.openEditSchedule(vm.selected!.id, s)}
                    onDeleteSchedule={(sid) => vm.removeSchedule(vm.selected!.id, sid)}
                    t={t}
                />
            )}

            {/* Modal registro/edición ambiente */}
            <EnvironmentFormModal
                visible={vm.envModalMode === "register" || vm.envModalMode === "edit"}
                mode={vm.envModalMode === "edit" ? "edit" : "register"}
                environment={vm.selected}
                onClose={vm.closeEnvModal}
                onSubmit={async (form) => {
                    if (vm.envModalMode === "edit" && vm.selected) {
                        return vm.editEnvironment(vm.selected.id, form);
                    }
                    return vm.registerEnvironment(form);
                }}
                t={t}
            />

            {/* Modal horario */}
            <ScheduleModal
                visible={vm.scheduleModalMode !== "none"}
                mode={vm.scheduleModalMode}
                editing={vm.editingSchedule}
                envId={vm.scheduleTargetEnvId}
                searchFn={vm.searchInstructors}
                onClose={vm.closeScheduleModal}
                onSave={vm.saveSchedule}
                t={t}
            />
        </View>
    );
}
