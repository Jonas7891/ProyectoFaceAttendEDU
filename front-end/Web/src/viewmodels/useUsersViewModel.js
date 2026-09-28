// ============================================================
//  FaceAttend EDU — Users ViewModel
// ============================================================
//  RESPONSABILIDAD: Lógica de negocio para gestión de usuarios
//
//  Este ViewModel:
//  ✓ Centraliza la lógica de filtrado de todos los tipos de usuarios
//  ✓ Gestiona el estado de búsqueda y filtros
//  ✓ Proporciona funciones para registro e importación de usuarios
//  ✓ Maneja la selección de usuarios para detalle
//
//  Tipos de usuarios soportados:
//  - Estudiantes (students/aprendices)
//  - Profesores (teachers/instructores)
//  - Administradores (admins)
// ============================================================

import { useState, useMemo, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";

// ── Tipos de usuario ───────────────────────────────────────

export const USER_TYPES = {
    STUDENT: "student",
    TEACHER: "teacher",
    ADMIN: "admin",
    ALL: "all",
};

export const USER_TYPE_LABELS = {
    [USER_TYPES.STUDENT]: "Estudiante",
    [USER_TYPES.TEACHER]: "Profesor",
    [USER_TYPES.ADMIN]: "Administrador",
    [USER_TYPES.ALL]: "Todos",
};

// ── Formulario vacío ───────────────────────────────────────

export const EMPTY_USER_FORM = {
    name: "",
    code: "",
    email: "",
    course: "",
    role: USER_TYPES.STUDENT,
    attendance: 0,
    registered: false,
    status: "active",
};

export function validateUserForm(form) {
    if (!form.name.trim()) return "El nombre es requerido";
    if (!form.code.trim()) return "El código es requerido";
    if (!form.email.trim()) return "El correo es requerido";
    if (!form.role) return "El rol es requerido";
    
    // Validación adicional para estudiantes
    if (form.role === USER_TYPES.STUDENT && !form.course.trim()) {
        return "El programa es requerido para estudiantes";
    }
    
    return null;
}

// ── ViewModel ─────────────────────────────────────────────

export function useUsersViewModel() {
    const appData = useAppData();

    const [search, setSearch] = useState("");
    const [userTypeFilter, setUserTypeFilter] = useState(USER_TYPES.ALL);
    const [courseFilter, setCourseFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selected, setSelected] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // ── Datos unificados de todos los usuarios ────────────────
    
    // Combinar estudiantes con otros tipos de usuarios del contexto
    const allUsers = useMemo(() => {
        const students = (appData.students || []).map(s => ({
            ...s,
            userType: USER_TYPES.STUDENT,
            typeLabelKey: "Estudiante",
        }));
        
        // TODO: Agregar profesores y administradores cuando estén disponibles en AppDataContext
        // const teachers = (appData.teachers || []).map(t => ({
        //     ...t,
        //     userType: USER_TYPES.TEACHER,
        //     typeLabelKey: "Profesor",
        // }));
        // const admins = (appData.admins || []).map(a => ({
        //     ...a,
        //     userType: USER_TYPES.ADMIN,
        //     typeLabelKey: "Administrador",
        // }));
        
        return [...students]; // [...students, ...teachers, ...admins];
    }, [appData.students]);

    // ── Programas únicos para filtro ──────────────────────────
    
    const courses = useMemo(
        () => appData.programs.map((p) => ({
            value: p.name,
            label: p.name,
            icon: "book-open"
        })),
        [appData.programs]
    );

    // ── Filtros de tipo de usuario ────────────────────────────
    
    const userTypeFilters = useMemo(() => [
        { value: USER_TYPES.ALL, label: "Todos", icon: "users" },
        { value: USER_TYPES.STUDENT, label: "Estudiantes", icon: "user" },
        // { value: USER_TYPES.TEACHER, label: "Profesores", icon: "user-check" },
        // { value: USER_TYPES.ADMIN, label: "Administradores", icon: "shield" },
    ], []);

    // ── Filtros de estado ──────────────────────────────────────
    
    const statusFilters = useMemo(() => [
        { value: "", label: "Todos los estados", icon: "filter" },
        { value: "active", label: "Activos", icon: "check-circle" },
        { value: "inactive", label: "Inactivos", icon: "x-circle" },
    ], []);

    // ── Usuarios filtrados ─────────────────────────────────────
    
    const filteredUsers = useMemo(
        () => allUsers.filter((user) => {
            // Filtro de búsqueda por nombre, código o email
            const matchSearch = !search ||
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                (user.code && user.code.toLowerCase().includes(search.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(search.toLowerCase()));
            
            // Filtro por tipo de usuario
            const matchUserType = userTypeFilter === USER_TYPES.ALL || 
                user.userType === userTypeFilter;
            
            // Filtro por curso (solo aplicable a estudiantes)
            const matchCourse = !courseFilter || 
                user.course === courseFilter ||
                user.userType !== USER_TYPES.STUDENT;
            
            // Filtro por estado
            const matchStatus = !statusFilter || user.status === statusFilter;
            
            return matchSearch && matchUserType && matchCourse && matchStatus;
        }),
        [allUsers, search, userTypeFilter, courseFilter, statusFilter]
    );

    // ── Estadísticas derivadas ─────────────────────────────────
    
    const stats = useMemo(() => {
        const total = allUsers.length;
        const active = allUsers.filter(u => u.status === "active").length;
        const students = allUsers.filter(u => u.userType === USER_TYPES.STUDENT).length;
        const teachers = allUsers.filter(u => u.userType === USER_TYPES.TEACHER).length;
        const admins = allUsers.filter(u => u.userType === USER_TYPES.ADMIN).length;
        
        return { total, active, students, teachers, admins };
    }, [allUsers]);

    // ── Acciones ───────────────────────────────────────────────

    const registerUser = useCallback(
        async (form) => {
            const err = validateUserForm(form);
            if (err) return err;

            // Delegar al método correspondiente según el tipo de usuario
            if (form.role === USER_TYPES.STUDENT) {
                await appData.addStudent({
                    name: form.name.trim(),
                    code: form.code.trim(),
                    email: form.email.trim(),
                    course: form.course.trim(),
                    grade: form.role,
                    attendance: form.attendance,
                    registered: form.registered,
                    status: form.status,
                });
            }
            // TODO: Agregar métodos para profesores y administradores
            // else if (form.role === USER_TYPES.TEACHER) {
            //     await appData.addTeacher({ ... });
            // }
            // else if (form.role === USER_TYPES.ADMIN) {
            //     await appData.addAdmin({ ... });
            // }
            
            return null;
        },
        [appData]
    );

    const importUsers = useCallback(
        async (drafts, userType = USER_TYPES.STUDENT) => {
            // Delegar al método correspondiente según el tipo
            if (userType === USER_TYPES.STUDENT) {
                return appData.importStudents(drafts);
            }
            // TODO: Agregar importación para otros tipos
            return { success: 0, errors: [] };
        },
        [appData]
    );

    function selectUser(user) {
        setSelected(user);
    }

    function clearSelection() {
        setSelected(null);
    }

    // ── API del ViewModel ──────────────────────────────────────

    return {
        // Datos
        allUsers,
        filteredUsers,
        courses,
        userTypeFilters,
        statusFilters,
        selected,
        stats,
        
        // Estado de carga
        isLoading: appData.isLoading,
        
        // Estado de filtros
        search,
        userTypeFilter,
        courseFilter,
        statusFilter,
        
        // Estado de modales
        showRegisterModal,
        showImportModal,
        
        // Setters de filtros
        setSearch,
        setUserTypeFilter,
        setCourseFilter,
        setStatusFilter,
        
        // Acciones de selección
        selectUser,
        clearSelection,
        
        // Acciones de modales
        openRegisterModal: () => setShowRegisterModal(true),
        closeRegisterModal: () => setShowRegisterModal(false),
        openImportModal: () => setShowImportModal(true),
        closeImportModal: () => setShowImportModal(false),
        
        // Acciones de CRUD
        registerUser,
        importUsers,
    };
}
