// ============================================================
//  FaceAttend EDU — Environments ViewModel
//
//  Gestiona la lista de ambientes/salones con persistencia.
//  También carga usuarios para el autocomplete de instructores.
// ============================================================

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    loadEnvironments,
    addEnvironment,
    updateEnvironment,
    deleteEnvironment,
    addScheduleToEnvironment,
    updateSchedule,
    deleteSchedule,
} from "../models/data/EnvironmentStorage";
import { loadUsers } from "../models/data/UserStorage";
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
    courseCode:     string;
    courseName:     string;
    instructorQuery: string;   // texto de búsqueda del instructor
    instructorId:    string;   // ID seleccionado
    instructorName:  string;   // nombre para display
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
    if (!form.courseCode.trim())    return "Completa todos los campos";
    if (!form.courseName.trim())    return "Completa todos los campos";
    if (!form.instructorId.trim())  return "Selecciona un instructor";
    if (form.days.length === 0)     return "Selecciona al menos un día";
    if (!form.startTime || !form.endTime) return "Completa el horario";
    return null;
}

// ── ViewModel ─────────────────────────────────────────────

export type EnvironmentModalMode = "none" | "register" | "edit" | "detail";
export type ScheduleModalMode    = "none" | "add" | "edit";

export interface EnvironmentsViewModel {
    // datos
    environments: Environment[];
    filtered:     Environment[];
    users:        AppUser[];
    instructors:  AppUser[];   // solo role === "teacher" | "admin"
    isLoading:    boolean;

    // filtros
    search:       string;
    setSearch:    (v: string) => void;

    // selección
    selected:     Environment | null;
    selectEnvironment: (e: Environment) => void;
    clearSelection:    () => void;

    // modales de ambiente
    envModalMode: EnvironmentModalMode;
    openRegisterModal: () => void;
    openEditModal:     (e: Environment) => void;
    openDetailModal:   (e: Environment) => void;
    closeEnvModal:     () => void;

    // modales de horario
    scheduleModalMode:  ScheduleModalMode;
    editingSchedule:    EnvironmentSchedule | null;
    openAddSchedule:    (envId: string) => void;
    openEditSchedule:   (envId: string, schedule: EnvironmentSchedule) => void;
    closeScheduleModal: () => void;
    scheduleTargetEnvId: string | null;

    // acciones CRUD ambiente
    registerEnvironment: (form: EnvironmentFormData) => Promise<string | null>;
    editEnvironment:     (id: string, form: EnvironmentFormData) => Promise<string | null>;
    removeEnvironment:   (id: string) => Promise<void>;

    // acciones CRUD horario
    saveSchedule:    (form: ScheduleFormData) => Promise<string | null>;
    removeSchedule:  (envId: string, scheduleId: string) => Promise<void>;

    // autocomplete instructores
    searchInstructors: (query: string) => AppUser[];
}

export function useEnvironmentsViewModel(): EnvironmentsViewModel {
    const [environments,   setEnvironments]   = useState<Environment[]>([]);
    const [users,          setUsers]          = useState<AppUser[]>([]);
    const [isLoading,      setIsLoading]      = useState(true);
    const [search,         setSearch]         = useState("");
    const [selected,       setSelected]       = useState<Environment | null>(null);
    const [envModalMode,   setEnvModalMode]   = useState<EnvironmentModalMode>("none");
    const [scheduleModalMode, setScheduleModalMode] = useState<ScheduleModalMode>("none");
    const [editingSchedule,   setEditingSchedule]   = useState<EnvironmentSchedule | null>(null);
    const [scheduleTargetEnvId, setScheduleTargetEnvId] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([loadEnvironments(), loadUsers()]).then(([envs, usrs]) => {
            setEnvironments(envs);
            setUsers(usrs);
            setIsLoading(false);
        });
    }, []);

    const instructors = useMemo(
        () => users.filter(u => (u.role === "teacher" || u.role === "admin") && u.status === "active"),
        [users]
    );

    const filtered = useMemo(() =>
        environments.filter(env => {
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
        [environments, search]
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
        const updated = await addEnvironment(environments, {
            number:      form.number.trim(),
            description: form.description.trim(),
            capacity:    form.capacity ? parseInt(form.capacity, 10) : undefined,
            schedules:   [],
        });
        setEnvironments(updated);
        return null;
    }, [environments]);

    const editEnvironment = useCallback(async (id: string, form: EnvironmentFormData): Promise<string | null> => {
        const err = validateEnvironmentForm(form);
        if (err) return err;
        const updated = await updateEnvironment(environments, id, {
            number:      form.number.trim(),
            description: form.description.trim(),
            capacity:    form.capacity ? parseInt(form.capacity, 10) : undefined,
        });
        setEnvironments(updated);
        // Actualiza el selected si es el mismo
        const updatedEnv = updated.find(e => e.id === id) ?? null;
        setSelected(updatedEnv);
        return null;
    }, [environments]);

    const removeEnvironment = useCallback(async (id: string): Promise<void> => {
        const updated = await deleteEnvironment(environments, id);
        setEnvironments(updated);
        setSelected(null);
        setEnvModalMode("none");
    }, [environments]);

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

        let updated: Environment[];
        if (scheduleModalMode === "add") {
            updated = await addScheduleToEnvironment(environments, scheduleTargetEnvId, draft);
        } else if (editingSchedule) {
            updated = await updateSchedule(environments, scheduleTargetEnvId, editingSchedule.id, draft);
        } else {
            return "Error interno";
        }

        setEnvironments(updated);
        const updatedEnv = updated.find(e => e.id === scheduleTargetEnvId) ?? null;
        setSelected(updatedEnv);
        return null;
    }, [environments, scheduleTargetEnvId, scheduleModalMode, editingSchedule]);

    const removeSchedule = useCallback(async (envId: string, scheduleId: string): Promise<void> => {
        const updated = await deleteSchedule(environments, envId, scheduleId);
        setEnvironments(updated);
        const updatedEnv = updated.find(e => e.id === envId) ?? null;
        setSelected(updatedEnv);
    }, [environments]);

    return {
        environments,
        filtered,
        users,
        instructors,
        isLoading,
        search,
        setSearch,
        selected,
        selectEnvironment: (e) => { setSelected(e); setEnvModalMode("detail"); },
        clearSelection:    () => { setSelected(null); setEnvModalMode("none"); },

        envModalMode,
        openRegisterModal: () => { setSelected(null); setEnvModalMode("register"); },
        openEditModal:     (e) => { setSelected(e);   setEnvModalMode("edit");     },
        openDetailModal:   (e) => { setSelected(e);   setEnvModalMode("detail");   },
        closeEnvModal:     () => { setEnvModalMode("none"); },

        scheduleModalMode,
        editingSchedule,
        scheduleTargetEnvId,
        openAddSchedule:    (envId) => {
            setScheduleTargetEnvId(envId);
            setEditingSchedule(null);
            setScheduleModalMode("add");
        },
        openEditSchedule:   (envId, schedule) => {
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
