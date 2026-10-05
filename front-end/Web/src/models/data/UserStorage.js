// ============================================================
//  FaceAttend EDU — UserStorage
//
//  Lectura de usuarios: API de identidad (GET /users + /persons)
//  con los mocks como respaldo si falla.
//
//  Derivados que el backend aún no expone y se calculan aquí:
//  - name / email: desde identity.person (UserDto no los trae)
//  - role: GET /users/{id}/roles mapeado a admin|teacher|student
//    (sin endpoint por lote: se pide uno a uno, lista corta)
//  - code: username (no hay campo "code" en el backend)
//  - department: null (no expuesto por el backend)
//  - course: solo docentes, desde los bloques horarios
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockAppUsers } from "./mockData";
import { roleNamesFrom, toUiRole } from "../../core/utils/backendRoles";
import {
    fullName,
    instructorCourseNamesByPerson,
    listUsers,
    normalizeStatus,
    optional,
    personMap,
    rolesForUser,
} from "../../services/api/referenceData";

const STORAGE_KEY = "@faceattend_users";
const LOCAL_PREFIX = "usr_";

function generateId() {
    return `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Lectura ───────────────────────────────────────────────

async function localUsers() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (user) => typeof user?.id === "string" && user.id.startsWith(LOCAL_PREFIX)
        );
    } catch {
        return [];
    }
}

async function usersFromApi() {
    // Usuarios y personas son necesarios: sin personas no hay nombre ni correo.
    const [users, persons] = await Promise.all([listUsers(), personMap()]);
    if (!Array.isArray(users)) return [];

    // Carga secundaria: los docentes muestran su curso desde los bloques.
    const teacherCourses = await optional(instructorCourseNamesByPerson(), new Map());

    // Roles: uno por usuario (no existe endpoint por lote).
    const roles = await Promise.all(
        users.map((user) => optional(rolesForUser(user.userId).then(roleNamesFrom), []))
    );

    return users.map((user, index) => {
        const person = persons.get(user.personId);
        const role = toUiRole(roles[index]);
        const courseNames = teacherCourses.get(user.personId) ?? [];

        return {
            id: user.userId,
            name: fullName(person) || user.username,
            email: person?.email ?? "",
            role,
            code: user.username, // no hay "code" en el backend
            department: null, // no expuesto por el backend
            course: role === "teacher" && courseNames.length ? courseNames.join(", ") : null,
            status: normalizeStatus(user.status),
            personId: user.personId,
            username: user.username,
        };
    });
}

/**
 * Carga todos los usuarios: API primero, mocks como respaldo,
 * fusionados con las altas hechas localmente en la UI.
 */
export async function loadUsers() {
    const local = await localUsers();
    try {
        return [...(await usersFromApi()), ...local];
    } catch (error) {
        console.warn("[FaceAttend] loadUsers: API no disponible, uso mock —", error?.message);
        return [...mockAppUsers, ...local];
    }
}

// ── Escritura local (pendiente de cablear al backend) ─────

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
