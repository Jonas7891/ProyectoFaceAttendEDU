// ============================================================
//  FaceAttend EDU — CourseStorage
//
//  Capa de persistencia para los cursos/fichas.
//  Sigue exactamente el mismo patrón que EnvironmentStorage y UserStorage.
//  Los cursos ahora referencian ambientes por ID en lugar de strings hardcoded.
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockCourses } from "./mockData";

const STORAGE_KEY = "@faceattend_courses_v2"; // v2 para forzar recarga limpia

function generateId() {
    return `course_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function loadCourses() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        console.log("📚 Raw courses from storage:", raw);
        
        if (raw) {
            const parsed = JSON.parse(raw);
            console.log("📚 Parsed courses:", parsed);
            
            // Solo retornar si es un array válido Y tiene elementos
            if (Array.isArray(parsed) && parsed.length > 0) {
                console.log("✅ Loading", parsed.length, "courses from storage");
                return parsed;
            }
        }
        
        // Si no hay nada en storage O está vacío, inicializar con mocks
        console.log("🔄 Initializing with mockCourses:", mockCourses.length, "courses");
        const initialCourses = mockCourses;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialCourses));
        return initialCourses;
    } catch (error) {
        console.warn("❌ Error loading courses, using mocks:", error);
        return mockCourses;
    }
}

export async function saveCourses(courses) {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    } catch (error) { /* fallo silencioso */ }
}

export async function addCourse(existing, draft) {
    const newCourse = { 
        id: generateId(), 
        ...draft,
        // Asegurar campos por defecto
        avgAttendance: draft.avgAttendance || 0,
        students: draft.students || 0,
        status: draft.status || "active",
    };
    const updated = [...existing, newCourse];
    await saveCourses(updated);
    return updated;
}

export async function updateCourse(existing, id, patch) {
    const updated = existing.map(c => c.id === id ? { ...c, ...patch } : c);
    await saveCourses(updated);
    return updated;
}

export async function deleteCourse(existing, id) {
    const updated = existing.filter(c => c.id !== id);
    await saveCourses(updated);
    return updated;
}
