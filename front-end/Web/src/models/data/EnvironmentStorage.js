// ============================================================
//  FaceAttend EDU — EnvironmentStorage
//
//  Capa de persistencia para los ambientes/salones.
//  Sigue exactamente el mismo patrón que StudentStorage.
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockEnvironments } from "./mockData";
import { Environment, EnvironmentSchedule } from "../types";

const STORAGE_KEY = "@faceattend_environments";

function generateId() {
    return `env_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
function generateScheduleId() {
    return `sch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function loadEnvironments() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockEnvironments));
        return mockEnvironments;
    } catch {
        return mockEnvironments;
    }
}

export async function saveEnvironments(environments) {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(environments));
    } catch { /* fallo silencioso */ }
}

export async function addEnvironment(
    existing,
    draft) {
    const newEnv = { id: generateId(), ...draft };
    const updated = [...existing, newEnv];
    await saveEnvironments(updated);
    return updated;
}

export async function updateEnvironment(
    existing,
    id,
    patch) {
    const updated = existing.map(e => e.id === id ? { ...e, ...patch } );
    await saveEnvironments(updated);
    return updated;
}

export async function deleteEnvironment(
    existing,
    id
) {
    const updated = existing.filter(e => e.id !== id);
    await saveEnvironments(updated);
    return updated;
}

export async function addScheduleToEnvironment(
    existing,
    envId,
    draft) {
    const newSchedule = { id: generateScheduleId(), ...draft };
    const updated = existing.map(e =>
        e.id === envId
            ? { ...e, schedules: [...e.schedules, newSchedule] }
            : e
    );
    await saveEnvironments(updated);
    return updated;
}

export async function updateSchedule(
    existing,
    envId,
    scheduleId,
    patch) {
    const updated = existing.map(e =>
        e.id === envId
            ? {
                ...e,
                schedules: e.schedules.map(s =>
                    s.id === scheduleId ? { ...s, ...patch } : s
                ),
            }
            : e
    );
    await saveEnvironments(updated);
    return updated;
}

export async function deleteSchedule(
    existing,
    envId,
    scheduleId
) {
    const updated = existing.map(e =>
        e.id === envId
            ? { ...e, schedules: e.schedules.filter(s => s.id !== scheduleId) }
            : e
    );
    await saveEnvironments(updated);
    return updated;
}
