// ============================================================
//  FaceAttend EDU — UserStorage
//
//  Capa de persistencia para los usuarios del sistema
//  (administradores, docentes/instructores, estudiantes).
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockAppUsers } from "./mockData";
import type { AppUser } from "../types";

const STORAGE_KEY = "@faceattend_users";

function generateId(): string {
    return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function loadUsers(): Promise<AppUser[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: AppUser[] = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockAppUsers));
        return mockAppUsers;
    } catch {
        return mockAppUsers;
    }
}

export async function saveUsers(users: AppUser[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch { /* fallo silencioso */ }
}

export async function addUser(
    existing: AppUser[],
    draft: Omit<AppUser, "id">
): Promise<AppUser[]> {
    const newUser: AppUser = { id: generateId(), ...draft };
    const updated = [...existing, newUser];
    await saveUsers(updated);
    return updated;
}

export async function updateUser(
    existing: AppUser[],
    id: string,
    patch: Partial<Omit<AppUser, "id">>
): Promise<AppUser[]> {
    const updated = existing.map(u => u.id === id ? { ...u, ...patch } : u);
    await saveUsers(updated);
    return updated;
}

export async function deleteUser(
    existing: AppUser[],
    id: string
): Promise<AppUser[]> {
    const updated = existing.filter(u => u.id !== id);
    await saveUsers(updated);
    return updated;
}
