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
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";

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
    hasFacial: false,      // Registro facial
    hasFingerprint: false, // Registro de huella dactilar
    status: "active",
};

// ── Jerarquía de roles (para ordenamiento) ─────────────────

const ROLE_HIERARCHY = {
    [USER_TYPES.STUDENT]: 1,
    [USER_TYPES.TEACHER]: 2,
    [USER_TYPES.ADMIN]: 3,
};

// ── Funciones de utilidad para filtrado avanzado ───────────

/**
 * Compara dos valores según un comparador
 * @param {number} value - Valor a comparar
 * @param {string} comparator - "gt" | "lt" | "eq"
 * @param {number} target - Valor objetivo
 * @returns {boolean}
 */
function compareValues(value, comparator, target) {
    switch (comparator) {
        case "gt": return value > target;
        case "lt": return value < target;
        case "eq": return value === target;
        default: return true;
    }
}

/**
 * Ordena un array según una columna y dirección
 * @param {Array} array - Array a ordenar
 * @param {string} column - Columna por la cual ordenar
 * @param {string} direction - "asc" | "desc"
 * @returns {Array} - Array ordenado (copia)
 */
function sortByColumn(array, column, direction) {
    const sorted = [...array];
    
    sorted.sort((a, b) => {
        let valA, valB;
        
        switch (column) {
            case "name":
                valA = a.name?.toLowerCase() || "";
                valB = b.name?.toLowerCase() || "";
                break;
            
            case "program":
                valA = a.course?.toLowerCase() || "";
                valB = b.course?.toLowerCase() || "";
                break;
            
            case "role":
                valA = ROLE_HIERARCHY[a.userType] || 0;
                valB = ROLE_HIERARCHY[b.userType] || 0;
                break;
            
            default:
                return 0;
        }
        
        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
    });
    
    return sorted;
}

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

export function useUsersViewModel(
    section = "all", 
    initialAttendanceFilter = null, 
    initialSearchQuery = null,
    initialSortBy = null,
    initialSortOrder = null,
    initialFilterColumn = null
) {
    const appData = useAppData();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [search, setSearch] = useState(initialSearchQuery || "");
    const [userTypeFilter, setUserTypeFilter] = useState(USER_TYPES.ALL);
    const [courseFilter, setCourseFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selected, setSelected] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    
    // Estado de ordenamiento (inicializado desde parámetros de navegación)
    const [sortBy, setSortBy] = useState(initialSortBy || null);
    const [sortOrder, setSortOrder] = useState(initialSortOrder || "asc");

    // ── Estado de filtrado avanzado ────────────────────────────
    // Inicializar desde parámetros de navegación si existen
    const [advancedFilter, setAdvancedFilter] = useState({
        column: initialFilterColumn || (initialAttendanceFilter ? "attendance" : null),
        value: initialFilterColumn && initialSortOrder ? initialSortOrder : null,
        attendanceFilter: {
            mode: "preset",
            comparator: initialAttendanceFilter || "eq", // "gt" | "lt" | "eq"
            percentage: null, // Sin valor específico cuando viene del dashboard
        },
    });
    
    // ── Mapeo de section (sidebar) a userType ──────────────────
    const sectionToUserType = useMemo(() => ({
        students: USER_TYPES.STUDENT,
        teachers: USER_TYPES.TEACHER,
        admins: USER_TYPES.ADMIN,
    }), []);
    
    // Filtro de rol desde el sidebar (prioritario sobre dropdown)
    const roleFilterFromSection = useMemo(() => {
        return section && section !== "all" && sectionToUserType[section] 
            ? sectionToUserType[section] 
            : null;
    }, [section, sectionToUserType]);

    // ── Datos unificados de todos los usuarios ────────────────
    
    // Combinar estudiantes con otros tipos de usuarios del contexto
    const allUsers = useMemo(() => {
        const students = (appData.students || []).map(s => ({
            ...s,
            userType: USER_TYPES.STUDENT,
            typeLabelKey: "Estudiante",
        }));
        
        const teachers = (appData.teachers || []).map(t => ({
            ...t,
            userType: USER_TYPES.TEACHER,
            typeLabelKey: "Profesor",
        }));
        
        const admins = (appData.admins || []).map(a => ({
            ...a,
            userType: USER_TYPES.ADMIN,
            typeLabelKey: "Administrador",
        }));
        
        return [...students, ...teachers, ...admins];
    }, [appData.students, appData.teachers, appData.admins]);

    // ── Alcance por rol: "mis estudiantes" (teacher) / "mis compañeros" (student) ──
    // Teacher: estudiantes matriculados en fichas donde es instructor.
    // Student: compañeros matriculados en su misma ficha (excluyéndose a sí mismo).
    // RN de dominio: schedule_block.instructor_actor_id / enrollment.cohort_id
    // (ver 02-domain/entities-and-rules.md, HU-ACAD-003/004).

    const myCourseIds = useMemo(() => {
        if (!user || user.role !== "teacher") return null;
        return (appData.courses || [])
            .filter((c) => Array.isArray(c.instructorActorIds) && c.instructorActorIds.includes(user.academicActorId))
            .map((c) => c.id);
    }, [appData.courses, user]);

    const myStudentRecord = useMemo(() => {
        if (!user || user.role !== "student") return null;
        return (appData.students || []).find((s) => s.personId === user.personId) || null;
    }, [appData.students, user]);

    const scopedUsers = useMemo(() => {
        if (!user || user.role === "admin") return allUsers;

        if (user.role === "teacher") {
            if (!myCourseIds) return [];
            // Una ficha cursa varios cursos a la vez (un bloque por curso, cada
            // uno con su propio instructor): hay que mirar TODOS los cursos del
            // estudiante (courseIds), no solo el primero que trae su registro.
            return allUsers.filter(
                (u) =>
                    u.userType === USER_TYPES.STUDENT &&
                    Array.isArray(u.courseIds) &&
                    u.courseIds.some((id) => myCourseIds.includes(id))
            );
        }

        if (user.role === "student") {
            if (!myStudentRecord) return [];
            // "Compañeros" = misma ficha (cohortId), no el mismo curso puntual:
            // dos compañeros de ficha pueden tener cursos distintos entre sí
            // en algún bloque, pero siguen siendo compañeros de ficha.
            return allUsers.filter(
                (u) =>
                    u.userType === USER_TYPES.STUDENT &&
                    u.cohortId != null &&
                    u.cohortId === myStudentRecord.cohortId &&
                    u.id !== myStudentRecord.id
            );
        }

        return allUsers;
    }, [allUsers, user, myCourseIds, myStudentRecord]);

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
        { value: USER_TYPES.ALL, label: t("Todos"), icon: "users" },
        { value: USER_TYPES.STUDENT, label: t("Estudiantes"), icon: "user" },
        { value: USER_TYPES.TEACHER, label: t("Profesores"), icon: "user-check" },
        { value: USER_TYPES.ADMIN, label: t("Administradores"), icon: "shield" },
    ], [t]);

    // ── Filtros de estado ──────────────────────────────────────
    
    const statusFilters = useMemo(() => [
        { value: "", label: t("Todos los estados"), icon: "filter" },
        { value: "active", label: t("Activos"), icon: "check-circle" },
        { value: "inactive", label: t("Inactivos"), icon: "x-circle" },
    ], [t]);

    // ── Usuarios filtrados ─────────────────────────────────────
    
    const filteredUsers = useMemo(
        () => {
            let result = scopedUsers.filter((user) => {
                // Filtro de búsqueda por nombre, código o email
                const matchSearch = !search ||
                    user.name.toLowerCase().includes(search.toLowerCase()) ||
                    (user.code && user.code.toLowerCase().includes(search.toLowerCase())) ||
                    (user.email && user.email.toLowerCase().includes(search.toLowerCase()));
                
                // Filtro por tipo de usuario (prioritario desde sidebar section)
                const effectiveUserTypeFilter = roleFilterFromSection || userTypeFilter;
                const matchUserType = effectiveUserTypeFilter === USER_TYPES.ALL || 
                    user.userType === effectiveUserTypeFilter;
                
                // Filtro por curso (solo aplicable a estudiantes)
                const matchCourse = !courseFilter || 
                    user.course === courseFilter ||
                    user.userType !== USER_TYPES.STUDENT;
                
                // Filtro por estado
                const matchStatus = !statusFilter || user.status === statusFilter;
                
                // ── Filtros avanzados ──────────────────────────────
                
                // Filtro de estado desde filtro avanzado
                if (advancedFilter.column === "status" && advancedFilter.value) {
                    const matchAdvancedStatus = user.status === advancedFilter.value;
                    if (!matchAdvancedStatus) return false;
                }
                
                // Filtro de asistencia
                if (advancedFilter.column === "attendance" && 
                    advancedFilter.attendanceFilter.percentage !== null) {
                    const { comparator, percentage } = advancedFilter.attendanceFilter;
                    const matchAttendance = compareValues(
                        user.attendance || 0,
                        comparator,
                        percentage
                    );
                    if (!matchAttendance) return false;
                }
                
                return matchSearch && matchUserType && matchCourse && matchStatus;
            });
            
            // ── Ordenamiento desde filtro avanzado ─────────────────
            
            // Ordenar por nombre
            if (advancedFilter.column === "name" && advancedFilter.value) {
                result = sortByColumn(result, "name", advancedFilter.value);
            }
            
            // Ordenar por programa
            if (advancedFilter.column === "program" && advancedFilter.value) {
                result = sortByColumn(result, "program", advancedFilter.value);
            }
            
            // Ordenar por rol (jerarquía)
            if (advancedFilter.column === "role" && advancedFilter.value) {
                result = sortByColumn(result, "role", advancedFilter.value);
            }
            
            // ── Ordenamiento desde parámetros de navegación ────────
            // Se aplica solo si no hay filtro avanzado activo
            if (!advancedFilter.column && sortBy) {
                result = sortByColumn(result, sortBy, sortOrder);
            }
            
            // ── Ordenamiento automático por asistencia cuando hay filtro sin valor específico ──
            if (advancedFilter.column === "attendance" && 
                advancedFilter.attendanceFilter.percentage === null) {
                const { comparator } = advancedFilter.attendanceFilter;
                
                // Si el comparador es "gt" (mayor que) → ordenar de mayor a menor (desc)
                // Si el comparador es "lt" (menor que) → ordenar de menor a mayor (asc)
                if (comparator === "gt" || comparator === "lt") {
                    result = [...result].sort((a, b) => {
                        const attA = a.attendance || 0;
                        const attB = b.attendance || 0;
                        
                        // gt = mayor que → mostrar los más altos primero (desc)
                        // lt = menor que → mostrar los más bajos primero (asc)
                        return comparator === "gt" ? attB - attA : attA - attB;
                    });
                }
            }
            
            return result;
        },
        [scopedUsers, search, userTypeFilter, courseFilter, statusFilter, advancedFilter, roleFilterFromSection, sortBy, sortOrder]
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
                    hasFacial: form.hasFacial || false,
                    hasFingerprint: form.hasFingerprint || false,
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

    // ── Funciones de filtrado avanzado ─────────────────────────

    const setAdvancedFilterColumn = useCallback((column) => {
        setAdvancedFilter(prev => ({
            ...prev,
            column,
            value: null,
            attendanceFilter: {
                mode: "preset",
                comparator: "eq",
                percentage: null,
            },
        }));
    }, []);

    const setAdvancedFilterValue = useCallback((value) => {
        setAdvancedFilter(prev => ({
            ...prev,
            value,
        }));
    }, []);

    const setAttendanceFilter = useCallback((filter) => {
        setAdvancedFilter(prev => ({
            ...prev,
            attendanceFilter: filter,
        }));
    }, []);

    const clearAdvancedFilter = useCallback(() => {
        setAdvancedFilter({
            column: null,
            value: null,
            attendanceFilter: {
                mode: "preset",
                comparator: "eq",
                percentage: null,
            },
        });
    }, []);

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
        
        // Estado de filtros básicos
        search,
        userTypeFilter,
        courseFilter,
        statusFilter,
        
        // Estado de filtros avanzados
        advancedFilter,
        
        // Estado de modales
        showRegisterModal,
        showImportModal,
        
        // Setters de filtros básicos
        setSearch,
        setUserTypeFilter,
        setCourseFilter,
        setStatusFilter,
        
        // Setters de filtros avanzados
        setAdvancedFilterColumn,
        setAdvancedFilterValue,
        setAttendanceFilter,
        clearAdvancedFilter,
        
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
