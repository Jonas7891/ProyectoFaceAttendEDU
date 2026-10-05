// ============================================================
//  FaceAttend EDU — AppDataContext
//
//  ÚNICA fuente de verdad para los datos de la aplicación.
//  Centraliza students, users y environments en un solo
//  contexto global, eliminando cargas duplicadas y
//  garantizando consistencia entre módulos.
//
//  Cuando haya una API real, solo este archivo cambia:
//  reemplaza los loadX() con llamadas HTTP y listo.
//
//  Uso:
//    const { students, addStudent, ... } = useAppData();
// ============================================================

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { resetReferenceData } from "../services/api/referenceData";
import { useAuth } from "./AuthContext";

import {
    loadStudents,
    saveStudents,
    addStudent as storageAddStudent,
    addStudentsBulk as storageAddStudentsBulk,
} from "../models/data/StudentStorage";

import {
    loadUsers,
    addUser as storageAddUser,
    updateUser as storageUpdateUser,
    deleteUser as storageDeleteUser,
} from "../models/data/UserStorage";

import {
    loadEnvironments,
    addEnvironment as storageAddEnvironment,
    updateEnvironment as storageUpdateEnvironment,
    deleteEnvironment as storageDeleteEnvironment,
    addScheduleToEnvironment,
    updateSchedule,
    deleteSchedule,
} from "../models/data/EnvironmentStorage";

import {
    loadFichas,
    addFicha as storageAddFicha,
    updateFicha as storageUpdateFicha,
    deleteFicha as storageDeleteFicha,
} from "../models/data/FichaStorage";

import {
    loadCourses,
    addCourse as storageAddCourse,
    updateCourse as storageUpdateCourse,
    deleteCourse as storageDeleteCourse,
} from "../models/data/CourseStorage";

import { calculateStudentCurrentPeriod } from "../core/utils/studentPeriodCalculator";
import { getConfiguredAcademicPeriodType } from "../core/constants/academicPeriods";
import { getStudentPeriodFromData } from "../core/utils/studentPeriodCalculator";

// ── Filas de personal (docentes / administradores) ─────────
// Los usuarios vienen de la API con role admin|teacher|student;
// aquí se completan los campos que la vista de personal espera y
// que el backend aún no expone (asistencia, biométricos).

function toStaffRow(user) {
    return {
        ...user,
        grade: user.role === "admin" ? "Administrador" : "Docente",
        attendance: 0, // pendiente de la fase de consulta
        hasFacial: false,
        hasFingerprint: false,
    };
}

function splitStaff(users) {
    const list = Array.isArray(users) ? users : [];
    return {
        teacherRows: list.filter((u) => u.role === "teacher").map(toStaffRow),
        adminRows: list.filter((u) => u.role === "admin").map(toStaffRow),
    };
}

// ── Context ───────────────────────────────────────────────

const AppDataContext = createContext(null);

// ── Provider ──────────────────────────────────────────────

export function AppDataProvider({ children }) {
    const [students, setStudents] = useState([]);
    const [users, setUsers] = useState([]);
    const [environments, setEnvironments] = useState([]);
    const [fichas, setFichas] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados para carga progresiva de usuarios
    const [loadedStudents, setLoadedStudents] = useState([]);
    const [loadedTeachers, setLoadedTeachers] = useState([]);
    const [loadedAdmins, setLoadedAdmins] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    // Obtener tipo de período académico
    const periodType = useMemo(() => getConfiguredAcademicPeriodType(), []);
    
    // Cursos enriquecidos con período calculado (fuente de verdad)
    const enrichedCourses = useMemo(() => {
        if (!courses || courses.length === 0) return courses;
        
        return courses.map(course => {
            // Calcular período actual del curso
            const periodInfo = calculateStudentCurrentPeriod(
                course.startDate,
                course.endDate,
                periodType
            );
            
            return {
                ...course,
                currentPeriod: periodInfo.label || '—',
                periodInfo, // Info completa del período
            };
        });
    }, [courses, periodType]);
    
    // Carga progresiva de usuarios (efecto persiana)
    const startProgressiveUserLoading = useCallback((allStudents, allCourses, allUsers) => {
        setIsLoadingUsers(true);
        setLoadedStudents([]);
        setLoadedTeachers([]);
        setLoadedAdmins([]);
        
        // Primero, enriquecer cursos con su período (fuente de verdad)
        const coursesWithPeriod = allCourses.map(course => {
            const periodInfo = calculateStudentCurrentPeriod(
                course.startDate,
                course.endDate,
                periodType
            );
            return {
                ...course,
                currentPeriod: periodInfo.label || '—',
                periodInfo,
            };
        });
        
        // Luego, estudiantes heredan el período de su curso
        const enrichedStudents = allStudents.map(student => {
            // Buscar el curso del estudiante
            const studentCourse = coursesWithPeriod.find(
                c => c.code === student.course || c.name === student.course || c.id === student.course
            );
            
            // Heredar el período del curso
            return {
                ...student,
                grade: studentCourse?.currentPeriod || student.grade || '—',
                periodInfo: studentCourse?.periodInfo || null,
            };
        });
        
        // Combinar todos los usuarios (el personal sale de la API, no de mocks)
        const { teacherRows, adminRows } = splitStaff(allUsers);
        const allUsersToLoad = [
            ...enrichedStudents,
            ...teacherRows,
            ...adminRows,
        ];
        
        // Cargar usuarios progresivamente (cada 150ms)
        let currentIndex = 0;
        const loadInterval = setInterval(() => {
            if (currentIndex < allUsersToLoad.length) {
                const user = allUsersToLoad[currentIndex];
                
                // Agregar al array correspondiente según tipo
                if (currentIndex < enrichedStudents.length) {
                    setLoadedStudents(prev => [...prev, user]);
                } else if (currentIndex < enrichedStudents.length + teacherRows.length) {
                    setLoadedTeachers(prev => [...prev, user]);
                } else {
                    setLoadedAdmins(prev => [...prev, user]);
                }
                
                currentIndex++;
            } else {
                // Terminó de cargar todos
                clearInterval(loadInterval);
                setIsLoadingUsers(false);
            }
        }, 150); // 150ms entre cada usuario (ajustable)
        
        return () => clearInterval(loadInterval);
    }, [periodType]);

    // ── Carga de datos base (environments, fichas, courses) ────
    // Solo con sesión: sin token todas las peticiones responderían 401 y
    // caeríamos al mock de respaldo sin reintentar (el efecto no se vuelve
    // a ejecutar). Al cerrar sesión se limpia todo, incluida la caché de
    // datos de referencia, para no arrastrar datos de otra sesión.
    const { user, isLoadingAuth } = useAuth();

    useEffect(() => {
        if (isLoadingAuth) return undefined; // aún restaurando la sesión guardada

        if (!user) {
            // Sin sesión no hay nada que pedir; se olvida la caché de
            // referencia para que el próximo login vuelva a consultar.
            // El estado cargado se reemplaza entero al iniciar sesión.
            resetReferenceData();
            return undefined;
        }

        let cancelled = false;
        Promise.all([
            loadStudents(),
            loadUsers(),
            loadEnvironments(),
            loadFichas(),
            loadCourses(),
        ]).then(([s, u, e, f, c]) => {
            if (cancelled) return;
            setStudents(s);
            setUsers(u);
            setEnvironments(e);
            setFichas(f);
            setCourses(c);
            setIsLoading(false);

            // Carga progresiva de usuarios (efecto persiana)
            startProgressiveUserLoading(s, c, u);
        });

        return () => {
            cancelled = true;
        };
    }, [isLoadingAuth, user, startProgressiveUserLoading]);

    // ── Programs derivados (sin storage propio) ───────────

    const programs = useMemo(() => {
        const map = new Map();
        // Usar loadedStudents para que se actualice progresivamente
        for (const s of loadedStudents) {
            if (!s.course?.trim()) continue;
            
            // Buscar el curso completo para obtener su nombre
            const course = courses.find(c => c.code === s.course || c.name === s.course);
            const courseName = course ? course.name : s.course;
            
            if (!map.has(courseName)) map.set(courseName, { attendance: [], active: 0, code: s.course });
            const entry = map.get(courseName);
            entry.attendance.push(s.attendance);
            if (s.status === "active") entry.active += 1;
        }
        return Array.from(map.entries())
            .map(([name, { attendance, active, code }]) => ({
                name,
                code, // Incluir el código del curso
                studentCount: attendance.length,
                avgAttendance: Math.round(attendance.reduce((a, b) => a + b, 0) / attendance.length),
                activeCount: active,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [loadedStudents, courses]);

    // ── Students ──────────────────────────────────────────

    const addStudentFn = useCallback(
        async (draft) => {
            const updated = await storageAddStudent(students, draft);
            
            // Enriquecer: estudiantes heredan período del curso
            const enrichedUpdated = updated.map(student => {
                const studentCourse = enrichedCourses.find(
                    c => c.code === student.course || c.name === student.course || c.id === student.course
                );
                return {
                    ...student,
                    grade: studentCourse?.currentPeriod || student.grade || '—',
                    periodInfo: studentCourse?.periodInfo || null,
                };
            });
            
            setStudents(enrichedUpdated);
            setLoadedStudents(enrichedUpdated);
        },
        [students, enrichedCourses]
    );

    const importStudentsFn = useCallback(
        async (drafts) => {
            if (drafts.length === 0) return 0;
            const updated = await storageAddStudentsBulk(students, drafts);
            
            // Enriquecer: estudiantes heredan período del curso
            const enrichedUpdated = updated.map(student => {
                const studentCourse = enrichedCourses.find(
                    c => c.code === student.course || c.name === student.course || c.id === student.course
                );
                return {
                    ...student,
                    grade: studentCourse?.currentPeriod || student.grade || '—',
                    periodInfo: studentCourse?.periodInfo || null,
                };
            });
            
            setStudents(enrichedUpdated);
            setLoadedStudents(enrichedUpdated);
            
            return drafts.length;
        },
        [students, enrichedCourses]
    );

    const updateStudentFn = useCallback(
        async (id, patch) => {
            const updated = students.map((s) => (s.id === id ? { ...s, ...patch } : s));
            
            // Re-heredar período del curso para el estudiante actualizado
            const enrichedUpdated = updated.map(student => {
                if (student.id === id) {
                    const studentCourse = enrichedCourses.find(
                        c => c.code === student.course || c.name === student.course || c.id === student.course
                    );
                    return {
                        ...student,
                        grade: studentCourse?.currentPeriod || student.grade || '—',
                        periodInfo: studentCourse?.periodInfo || null,
                    };
                }
                return student;
            });
            
            await saveStudents(enrichedUpdated);
            setStudents(enrichedUpdated);
            setLoadedStudents(enrichedUpdated);
        },
        [students, enrichedCourses]
    );

    const removeStudentFn = useCallback(
        async (id) => {
            const updated = students.filter((s) => s.id !== id);
            await saveStudents(updated);
            setStudents(updated);
            setLoadedStudents(prev => prev.filter(s => s.id !== id));
        },
        [students]
    );

    // ── Users ─────────────────────────────────────────────

    const addUserFn = useCallback(
        async (draft) => {
            const updated = await storageAddUser(users, draft);
            setUsers(updated);
        },
        [users]
    );

    const updateUserFn = useCallback(
        async (id, patch) => {
            const updated = await storageUpdateUser(users, id, patch);
            setUsers(updated);
        },
        [users]
    );

    const removeUserFn = useCallback(
        async (id) => {
            const updated = await storageDeleteUser(users, id);
            setUsers(updated);
        },
        [users]
    );

    // ── Environments ──────────────────────────────────────

    const addEnvironmentFn = useCallback(
        async (draft) => {
            const updated = await storageAddEnvironment(environments, draft);
            setEnvironments(updated);
        },
        [environments]
    );

    const updateEnvironmentFn = useCallback(
        async (id, patch) => {
            const updated = await storageUpdateEnvironment(environments, id, patch);
            setEnvironments(updated);
        },
        [environments]
    );

    const removeEnvironmentFn = useCallback(
        async (id) => {
            const updated = await storageDeleteEnvironment(environments, id);
            setEnvironments(updated);
        },
        [environments]
    );

    const addScheduleFn = useCallback(
        async (envId, draft) => {
            const updated = await addScheduleToEnvironment(environments, envId, draft);
            setEnvironments(updated);
        },
        [environments]
    );

    const updateScheduleFn = useCallback(
        async (envId, scheduleId, patch) => {
            const updated = await updateSchedule(environments, envId, scheduleId, patch);
            setEnvironments(updated);
        },
        [environments]
    );

    const removeScheduleFn = useCallback(
        async (envId, scheduleId) => {
            const updated = await deleteSchedule(environments, envId, scheduleId);
            setEnvironments(updated);
        },
        [environments]
    );

    // ── Fichas ────────────────────────────────────────────

    const addFichaFn = useCallback(
        async (draft) => {
            const updated = await storageAddFicha(fichas, draft);
            setFichas(updated);
        },
        [fichas]
    );

    const updateFichaFn = useCallback(
        async (id, patch) => {
            const updated = await storageUpdateFicha(fichas, id, patch);
            setFichas(updated);
        },
        [fichas]
    );

    const removeFichaFn = useCallback(
        async (id) => {
            const updated = await storageDeleteFicha(fichas, id);
            setFichas(updated);
        },
        [fichas]
    );

    // ── Courses ───────────────────────────────────────────

    const addCourseFn = useCallback(
        async (draft) => {
            const updated = await storageAddCourse(courses, draft);
            setCourses(updated);
        },
        [courses]
    );

    const updateCourseFn = useCallback(
        async (id, patch) => {
            const updated = await storageUpdateCourse(courses, id, patch);
            setCourses(updated);
        },
        [courses]
    );

    const removeCourseFn = useCallback(
        async (id) => {
            const updated = await storageDeleteCourse(courses, id);
            setCourses(updated);
        },
        [courses]
    );

    // ── Valor del contexto ────────────────────────────────

    const value = useMemo(
        () => ({
            isLoading: isLoading || isLoadingUsers, // Incluye carga progresiva de usuarios

            students: loadedStudents, // Usuarios cargados progresivamente
            addStudent: addStudentFn,
            importStudents: importStudentsFn,
            updateStudent: updateStudentFn,
            removeStudent: removeStudentFn,

            teachers: loadedTeachers, // Profesores cargados progresivamente
            admins: loadedAdmins,     // Administradores cargados progresivamente

            programs,

            users,
            addUser: addUserFn,
            updateUser: updateUserFn,
            removeUser: removeUserFn,

            environments,
            addEnvironment: addEnvironmentFn,
            updateEnvironment: updateEnvironmentFn,
            removeEnvironment: removeEnvironmentFn,

            addSchedule: addScheduleFn,
            updateSchedule: updateScheduleFn,
            removeSchedule: removeScheduleFn,

            fichas,
            addFicha: addFichaFn,
            updateFicha: updateFichaFn,
            removeFicha: removeFichaFn,

            courses: enrichedCourses, // Cursos enriquecidos con período calculado
            addCourse: addCourseFn,
            updateCourse: updateCourseFn,
            removeCourse: removeCourseFn,
        }),
        [
            isLoading,
            isLoadingUsers,
            loadedStudents,
            loadedTeachers,
            loadedAdmins,
            addStudentFn,
            importStudentsFn,
            updateStudentFn,
            removeStudentFn,
            programs,
            users,
            addUserFn,
            updateUserFn,
            removeUserFn,
            environments,
            addEnvironmentFn,
            updateEnvironmentFn,
            removeEnvironmentFn,
            addScheduleFn,
            updateScheduleFn,
            removeScheduleFn,
            fichas,
            addFichaFn,
            updateFichaFn,
            removeFichaFn,
            enrichedCourses,
            addCourseFn,
            updateCourseFn,
            removeCourseFn,
        ]
    );

    return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────

export function useAppData() {
    const ctx = useContext(AppDataContext);
    if (!ctx) {
        throw new Error(
            "[FaceAttend] useAppData() debe usarse dentro de <AppDataProvider>. " +
                "Envuelve tu app con <AppDataProvider> en app.tsx."
        );
    }
    return ctx;
}
