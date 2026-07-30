// ============================================================
//  FaceAttend EDU — Environments ViewModel
//
//  Consume AppDataContext como única fuente de verdad.
//  Ya no carga environments ni users de forma independiente.
// ============================================================

import { useState, useMemo, useCallback } from "react";
import { useAppData }  from "../context/AppDataContext";
import type { Environment, EnvironmentSchedule, AppUser } from "../models/types";

// ── Formulario de ambiente ────────────────────────────────

export interface EnvironmentFormData {
    number:      string;
    description: string;
    capacity:    string;
}

export const EMPTY_ENV_FORM: EnvironmentFormData = {
    number:      "",
    description: "",
    capacity:    "",
};

// ── Formulario de horario ─────────────────────────────────

export interface ScheduleFormData {
    courseCode:      string;
    courseName:      string;
    instructorQuery: string;
    instructorId:    string;
    instructorName:  string;
    startTime:       string;
    endTime:         string;
    days:            string[];
}

export const EMPTY_SCHEDULE_FORM: ScheduleFormData = {
    courseCode:      "",
    courseName:      "",
    instructorQuery: "",
    instructorId:    "",
    instructorName:  "",
    startTime:       "08:00",
    endTime:         "10:00",
    days:            [],
};

export const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;

// ── Validación ────────────────────────────────────────────

export function validateEnvironmentForm(form: EnvironmentFormData): string | null {
    if (!form.number.trim())      return "Completa todos los campos";
    if (!form.description.trim()) return "Completa todos los campos";
    return null;
}

export function validateScheduleForm(form: ScheduleFormData): string | null {
    if (!form.courseCode.trim())   return "Completa todos los campos";
    if (!form.courseName.trim())   return "Completa todos los campos";
    if (!form.instructorId.trim()) return "Selecciona un instructor";
    if (form.days.length === 0)    return "Selecciona al menos un día";
    if (!form.startTime || !form.endTime) return "Completa el horario";
    return null;
}

// ── Tipos del ViewModel ───────────────────────────────────

export type EnvironmentModalMode = "none" | "register" | "edit" | "detail";
export type ScheduleModalMode    = "none" | "add" | "edit";

export interface EnvironmentsViewModel {
    // datos
    environments: Environment[];
    filtered:     Environment[];
    users:        AppUser[];
    instructors:  AppUser[];
    isLoading:    boolean;

    // filtros
    search:    string;
    setSearch: (v: string) => void;

    // selección
    selected:          Environment | null;
    selectEnvironment: (e: Environment) => void;
    clearSelection:    () => void;

    // modales de ambiente
    envModalMode:      EnvironmentModalMode;
    openRegisterModal: () => void;
    openEditModal:     (e: Environment) => void;
    openDetailModal:   (e: Environment) => void;
    closeEnvModal:     () => void;

    // modales de horario
    scheduleModalMode:   ScheduleModalMode;
    editingSchedule:     EnvironmentSchedule | null;
    scheduleTargetEnvId: string | null;
    openAddSchedule:    (envId: string) => void;
    openEditSchedule:   (envId: string, schedule: EnvironmentSchedule) => void;
    closeScheduleModal: () => void;

    // CRUD ambiente
    registerEnvironment: (form: EnvironmentFormData) => Promise<string | null>;
    editEnvironment:     (id: string, form: EnvironmentFormData) => Promise<string | null>;
    removeEnvironment:   (id: string) => Promise<void>;

    // CRUD horario
    saveSchedule:   (form: ScheduleFormData) => Promise<string | null>;
    removeSchedule: (envId: string, scheduleId: string) => Promise<void>;

    // autocomplete instructores
    searchInstructors: (query: string) => AppUser[];
}

export function useEnvironmentsViewModel(): EnvironmentsViewModel {
    const appData = useAppData();

    const [search,         setSearch]         = useState("");
    const [selected,       setSelected]       = useState<Environment | null>(null);
    const [envModalMode,   setEnvModalMode]   = useState<EnvironmentModalMode>("none");
    const [scheduleModalMode, setScheduleModalMode] = useState<ScheduleModalMode>("none");
    const [editingSchedule,   setEditingSchedule]   = useState<EnvironmentSchedule | null>(null);
    const [scheduleTargetEnvId, setScheduleTargetEnvId] = useState<string | null>(null);

    // Instructores: usuarios activos con rol teacher o admin del contexto global
    const instructors = useMemo(
        () => appData.users.filter(u => (u.role === "teacher" || u.role === "admin") && u.status === "active"),
        [appData.users]
    );

    const filtered = useMemo(() =>
        appData.environments.filter(env => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                env.number.toLowerCase().includes(q) ||
                env.description.toLowerCase().includes(q) ||
                env.schedules.some(s =>
                    s.courseCode.toLowerCase().includes(q) ||
                    s.courseName.toLowerCase().includes(q) ||
                    s.instructorName.toLowerCase().includes(q)
                )
            );
        }),
        [appData.environments, search]
    );

    const searchInstructors = useCallback((query: string): AppUser[] => {
        if (!query.trim()) return instructors.slice(0, 8);
        const q = query.toLowerCase();
        return instructors.filter(u =>
            u.name.toLowerCase().includes(q) ||
            (u.code?.toLowerCase().includes(q) ?? false) ||
            (u.department?.toLowerCase().includes(q) ?? false)
        ).slice(0, 10);
    }, [instructors]);

    // ── Acciones de ambiente ──────────────────────────────

    const registerEnvironment = useCallback(async (form: EnvironmentFormData): Promise<string | null> => {
        const err = validateEnvironmentForm(form);
        if (err) return err;
        await appData.addEnvironment({
            number:      form.number.trim(),
            description: form.description.trim(),
            capacity:    form.capacity ? parseInt(form.capacity, 10) : undefined,
            schedules:   [],
        });
        return null;
    }, [appData]);

    const editEnvironment = useCallback(async (id: string, form: EnvironmentFormData): Promise<string | null> => {
        const err = validateEnvironmentForm(form);
        if (err) return err;
        await appData.updateEnvironment(id, {
            number:      form.number.trim(),
            description: form.description.trim(),
            capacity:    form.capacity ? parseInt(form.capacity, 10) : undefined,
        });
        // Actualiza el selected sincronizando con el nuevo estado global
        const updatedEnv = appData.environments.find(e => e.id === id);
        if (updatedEnv) setSelected({ ...updatedEnv, number: form.number.trim(), description: form.description.trim() });
        return null;
    }, [appData]);

    const removeEnvironment = useCallback(async (id: string): Promise<void> => {
        await appData.removeEnvironment(id);
        setSelected(null);
        setEnvModalMode("none");
    }, [appData]);

    // ── Acciones de horario ───────────────────────────────

    const saveSchedule = useCallback(async (form: ScheduleFormData): Promise<string | null> => {
        const err = validateScheduleForm(form);
        if (err) return err;
        if (!scheduleTargetEnvId) return "Error interno";

        const draft = {
            courseCode:     form.courseCode.trim(),
            courseName:     form.courseName.trim(),
            instructor:     form.instructorId,
            instructorName: form.instructorName,
            startTime:      form.startTime,
            endTime:        form.endTime,
            days:           form.days,
        };

        if (scheduleModalMode === "add") {
            await appData.addSchedule(scheduleTargetEnvId, draft);
        } else if (editingSchedule) {
            await appData.updateSchedule(scheduleTargetEnvId, editingSchedule.id, draft);
        } else {
            return "Error interno";
        }

        // Sincroniza el selected con el nuevo estado global
        const updatedEnv = appData.environments.find(e => e.id === scheduleTargetEnvId);
        if (updatedEnv) setSelected(updatedEnv);
        return null;
    }, [appData, scheduleTargetEnvId, scheduleModalMode, editingSchedule]);

    const removeSchedule = useCallback(async (envId: string, scheduleId: string): Promise<void> => {
        await appData.removeSchedule(envId, scheduleId);
        const updatedEnv = appData.environments.find(e => e.id === envId);
        if (updatedEnv) setSelected(updatedEnv);
    }, [appData]);

    return {
        environments: appData.environments,
        filtered,
        users:        appData.users,
        instructors,
        isLoading:    appData.isLoading,
        search,
        setSearch,
        selected,
        selectEnvironment: (e) => { setSelected(e); setEnvModalMode("detail"); },
        clearSelection:    () => { setSelected(null); setEnvModalMode("none"); },

        envModalMode,
        openRegisterModal: () => { setSelected(null); setEnvModalMode("register"); },
        openEditModal:     (e) => { setSelected(e); setEnvModalMode("edit"); },
        openDetailModal:   (e) => { setSelected(e); setEnvModalMode("detail"); },
        closeEnvModal:     () => setEnvModalMode("none"),

        scheduleModalMode,
        editingSchedule,
        scheduleTargetEnvId,
        openAddSchedule: (envId) => {
            setScheduleTargetEnvId(envId);
            setEditingSchedule(null);
            setScheduleModalMode("add");
        },
        openEditSchedule: (envId, schedule) => {
            setScheduleTargetEnvId(envId);
            setEditingSchedule(schedule);
            setScheduleModalMode("edit");
        },
        closeScheduleModal: () => {
            setScheduleModalMode("none");
            setEditingSchedule(null);
            setScheduleTargetEnvId(null);
        },

        registerEnvironment,
        editEnvironment,
        removeEnvironment,
        saveSchedule,
        removeSchedule,
        searchInstructors,
    };
}
