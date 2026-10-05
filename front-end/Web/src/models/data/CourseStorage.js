// ============================================================
//  FaceAttend EDU — CourseStorage
//
//  Lectura de cursos: API académica (GET /courses + /schedule-blocks
//  + /enrollments) con los mocks como respaldo si falla.
//
//  Derivados que el backend aún no expone y se calculan aquí:
//  - students: matrículas activas de los cohortes del curso
//  - professor: instructores de los bloques del curso
//  - schedule / room: días y ambiente desde los bloques
//  - avgAttendance: 0 hasta la fase de consulta de asistencia
//  - startDate / endDate: null (el calculador de períodos devuelve '—')
// ============================================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockCourses } from "./mockData";
import { colorAt } from "../../core/constants/dataColors";
import {
    actorMap,
    dayLabel,
    fullName,
    listBlocks,
    listCourses,
    listEnrollments,
    listEnvironments,
    normalizeStatus,
    optional,
    personMap,
} from "../../services/api/referenceData";

const STORAGE_KEY = "@faceattend_courses_v2"; // v2 para forzar recarga limpia
const LOCAL_PREFIX = "course_";

function generateId() {
    return `course_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ── Lectura ───────────────────────────────────────────────

async function localCourses() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (course) => typeof course?.id === "string" && course.id.startsWith(LOCAL_PREFIX)
        );
    } catch {
        return [];
    }
}

async function coursesFromApi() {
    const [courses, blocks] = await Promise.all([listCourses(), listBlocks()]);
    if (!Array.isArray(courses)) return [];

    const [enrollments, actors, persons, environments] = await Promise.all([
        optional(listEnrollments(), []),
        optional(actorMap(), new Map()),
        optional(personMap(), new Map()),
        optional(listEnvironments(), []),
    ]);

    // courseId -> Set(cohortId): los cohortes que imparten este curso
    const courseCohorts = new Map();
    for (const block of blocks) {
        if (!block.cohortId || !block.courseId) continue;
        const set = courseCohorts.get(block.courseId) ?? new Set();
        set.add(block.cohortId);
        courseCohorts.set(block.courseId, set);
    }

    // Matrículas activas por cohorte (el alto se cuenta por actor único)
    const actorsByCohort = new Map();
    for (const enrollment of enrollments) {
        const status = String(enrollment.enrollmentStatus ?? "").toLowerCase();
        if (status === "withdrawn") continue;
        const set = actorsByCohort.get(enrollment.cohortId) ?? new Set();
        set.add(enrollment.academicActorId);
        actorsByCohort.set(enrollment.cohortId, set);
    }

    const environmentsById = new Map(environments.map((env) => [env.environmentId, env]));

    return courses.map((course, index) => {
        const courseBlocks = blocks.filter((block) => block.courseId === course.courseId);

        const studentIds = new Set();
        for (const cohortId of courseCohorts.get(course.courseId) ?? []) {
            for (const actorId of actorsByCohort.get(cohortId) ?? []) studentIds.add(actorId);
        }

        const professorNames = [];
        for (const block of courseBlocks) {
            const person = personOf(block.instructorActorId, actors, persons);
            const name = fullName(person);
            if (name && !professorNames.includes(name)) professorNames.push(name);
        }

        const days = [];
        for (const block of courseBlocks) {
            const label = dayLabel(block.dayOfWeek);
            if (label && !days.includes(label)) days.push(label);
        }

        const environmentId = courseBlocks[0]?.environmentId;
        const environment = environmentId ? environmentsById.get(environmentId) : null;

        return {
            id: String(course.courseId),
            code: course.code ?? "",
            name: course.name ?? "",
            professor: professorNames.length ? professorNames.join(", ") : null,
            students: studentIds.size,
            schedule: days.join(", ") || null,
            room: environment ? String(environment.code ?? environment.name ?? "") : null,
            startDate: null, // sin fechas en el backend: el período muestra '—'
            endDate: null,
            semester: null,
            avgAttendance: 0, // pendiente de la fase de consulta
            status: normalizeStatus(course.status),
            color: colorAt(index),
            creditHours: course.creditHours ?? null,
        };
    });
}

function personOf(actorId, actors, persons) {
    const actor = actors.get(actorId);
    return actor?.personId ? persons.get(actor.personId) : null;
}

export async function loadCourses() {
    const local = await localCourses();
    try {
        return [...(await coursesFromApi()), ...local];
    } catch (error) {
        console.warn("[FaceAttend] loadCourses: API no disponible, uso mock —", error?.message);
        return [...mockCourses, ...local];
    }
}

// ── Escritura local (pendiente de cablear al backend) ─────

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
