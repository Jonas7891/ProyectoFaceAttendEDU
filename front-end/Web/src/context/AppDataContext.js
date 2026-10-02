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

import { mockTeachers, mockAdmins } from "../models/data/mockData";

// ── Context ───────────────────────────────────────────────

const AppDataContext = createContext(null);

// ── Provider ──────────────────────────────────────────────

export function AppDataProvider({ children }) {
    const [students, setStudents] = useState([]);
    const [teachers] = useState(mockTeachers); // Mock data - TODO: cargar desde storage
    const [admins] = useState(mockAdmins); // Mock data - TODO: cargar desde storage
    const [users, setUsers] = useState([]);
    const [environments, setEnvironments] = useState([]);
    const [fichas, setFichas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados para carga progresiva de usuarios
    const [loadedStudents, setLoadedStudents] = useState([]);
    const [loadedTeachers, setLoadedTeachers] = useState([]);
    const [loadedAdmins, setLoadedAdmins] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    // Carga inicial de datos base (environments, fichas)
    useEffect(() => {
        Promise.all([loadStudents(), loadUsers(), loadEnvironments(), loadFichas()]).then(([s, u, e, f]) => {
            setStudents(s);
            setUsers(u);
            setEnvironments(e);
            setFichas(f);
            setIsLoading(false);
            
            // Iniciar carga progresiva de usuarios después de cargar datos base
            startProgressiveUserLoading(s);
        });
    }, []);
    
    // Carga progresiva de usuarios (efecto persiana)
    const startProgressiveUserLoading = useCallback((allStudents) => {
        setIsLoadingUsers(true);
        setLoadedStudents([]);
        setLoadedTeachers([]);
        setLoadedAdmins([]);
        
        // Combinar todos los usuarios
        const allUsersToLoad = [
            ...allStudents,
            ...mockTeachers,
            ...mockAdmins,
        ];
        
        // Cargar usuarios progresivamente (cada 150ms)
        let currentIndex = 0;
        const loadInterval = setInterval(() => {
            if (currentIndex < allUsersToLoad.length) {
                const user = allUsersToLoad[currentIndex];
                
                // Agregar al array correspondiente según tipo
                if (currentIndex < allStudents.length) {
                    setLoadedStudents(prev => [...prev, user]);
                } else if (currentIndex < allStudents.length + mockTeachers.length) {
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
    }, []);

    // ── Programs derivados (sin storage propio) ───────────

    const programs = useMemo(() => {
        const map = new Map();
        // Usar loadedStudents para que se actualice progresivamente
        for (const s of loadedStudents) {
            if (!s.course?.trim()) continue;
            if (!map.has(s.course)) map.set(s.course, { attendance: [], active: 0 });
            const entry = map.get(s.course);
            entry.attendance.push(s.attendance);
            if (s.status === "active") entry.active += 1;
        }
        return Array.from(map.entries())
            .map(([name, { attendance, active }]) => ({
                name,
                studentCount: attendance.length,
                avgAttendance: Math.round(attendance.reduce((a, b) => a + b, 0) / attendance.length),
                activeCount: active,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [loadedStudents]);

    // ── Students ──────────────────────────────────────────

    const addStudentFn = useCallback(
        async (draft) => {
            const updated = await storageAddStudent(students, draft);
            setStudents(updated);
        },
        [students]
    );

    const importStudentsFn = useCallback(
        async (drafts) => {
            if (drafts.length === 0) return 0;
            const updated = await storageAddStudentsBulk(students, drafts);
            setStudents(updated);
            return drafts.length;
        },
        [students]
    );

    const updateStudentFn = useCallback(
        async (id, patch) => {
            const updated = students.map((s) => (s.id === id ? { ...s, ...patch } : s));
            await saveStudents(updated);
            setStudents(updated);
        },
        [students]
    );

    const removeStudentFn = useCallback(
        async (id) => {
            const updated = students.filter((s) => s.id !== id);
            await saveStudents(updated);
            setStudents(updated);
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
