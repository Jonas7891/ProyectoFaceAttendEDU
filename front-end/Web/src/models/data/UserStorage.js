// ============================================================
//  FaceAttend EDU — UserStorage
//
//  Capa de persistencia para los usuarios del sistema
//  (administradores, docentes/instructores, estudiantes).
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockAppUsers } from "./mockData";

const STORAGE_KEY = "@faceattend_users";

function generateId() {
    return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function loadUsers() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockAppUsers));
        return mockAppUsers;
    } catch (error) {
        return mockAppUsers;
    }
}

export async function saveUsers(users) {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (error) { /* fallo silencioso */ }
}

export async function addUser(existing, draft) {
    const newUser = { id: generateId(), ...draft };
    const updated = [...existing, newUser];
    await saveUsers(updated);
    return updated;
}

export async function updateUser(existing, id, patch) {
    const updated = existing.map(u => u.id === id ? { ...u, ...patch } : u);
    await saveUsers(updated);
    return updated;
}

export async function deleteUser(existing, id) {
    const updated = existing.filter(u => u.id !== id);
    await saveUsers(updated);
    return updated;
}
