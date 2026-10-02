// ============================================================
//  FaceAttend EDU — Courses ViewModel
// ============================================================
//  RESPONSABILIDAD: Lógica de negocio para gestión de cursos/fichas
//
//  Este ViewModel:
//  ✓ Centraliza la lógica de filtrado de cursos
//  ✓ Gestiona el estado de búsqueda y filtros avanzados
//  ✓ Proporciona funciones para registro e importación de cursos
//  ✓ Maneja la selección de cursos para detalle
//  ✓ Calcula estadísticas derivadas de los cursos
// ============================================================

import { useState, useMemo, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";

// ── Formulario vacío ───────────────────────────────────────

export const EMPTY_COURSE_FORM = {
    code: "",
    name: "",
    schedule: "mañana",
    room: "",
    startDate: "",
    endDate: "",
};

// ── Validación de formulario ──────────────────────────────

export function validateCourseForm(form) {
    if (!form.code.trim()) return "El código es requerido";
    if (!form.name.trim()) return "El nombre es requerido";
    
    return null;
}

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
            
            case "code":
                valA = a.code?.toLowerCase() || "";
                valB = b.code?.toLowerCase() || "";
                break;
            
            case "instructor":
                valA = a.professor?.toLowerCase() || "";
                valB = b.professor?.toLowerCase() || "";
                break;
            
            case "students":
                valA = a.students || 0;
                valB = b.students || 0;
                break;
            
            case "attendance":
                valA = a.avgAttendance || 0;
                valB = b.avgAttendance || 0;
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

// ── ViewModel ─────────────────────────────────────────────

export function useCoursesViewModel() {
    const appData = useAppData();

    const [search, setSearch] = useState("");
    const [instructorFilter, setInstructorFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [selected, setSelected] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // ── Estado de filtrado avanzado ────────────────────────────
    
    const [advancedFilter, setAdvancedFilter] = useState({
        column: null,
        value: null,
        attendanceFilter: {
            mode: "preset",
            comparator: "eq", // "gt" | "lt" | "eq"
            percentage: null,
        },
    });

    // ── Cursos derivados de fichas ─────────────────────────────
    
    // Cursos vienen directamente de las fichas del contexto
    const courses = useMemo(() => {
        // Si aún está cargando, retornar array vacío para evitar cálculos incorrectos
        if (appData.isLoading) {
            return [];
        }
        
        // Transformar fichas a formato de curso compatible con la vista
        return appData.fichas.map((ficha) => {
            // Contar estudiantes REALES que pertenecen a este curso
            // Buscar por: name completo, código, o program (campo corto de la ficha)
            const studentsInCourse = appData.students.filter((student) => {
                const studentCourse = (student.course || "").toLowerCase().trim();
                const fichaName = (ficha.name || "").toLowerCase().trim();
                const fichaCode = (ficha.code || "").toLowerCase().trim();
                const fichaProgram = (ficha.program || "").toLowerCase().trim();
                
                // Match exacto por cualquiera de los campos
                if (studentCourse === fichaName || 
                    studentCourse === fichaCode || 
                    studentCourse === fichaProgram) {
                    return true;
                }
                
                // Match parcial: si el program de la ficha contiene el course del student
                // Ejemplo: student.course="Gestión de Redes" y ficha.program="Redes"
                if (fichaProgram && studentCourse.includes(fichaProgram)) {
                    return true;
                }
                
                // Match parcial inverso: si el course del student contiene el program
                // Ejemplo: student.course="Bases de Datos" y ficha.program="Bases de Datos"
                if (fichaProgram && fichaProgram.includes(studentCourse)) {
                    return true;
                }
                
                // Match parcial por palabras clave del nombre completo
                // Ejemplo: student.course="Programación" y ficha.name="Tecnología en Programación de Software"
                if (fichaName.includes(studentCourse) && studentCourse.length > 3) {
                    return true;
                }
                
                return false;
            });
            
            const totalStudents = studentsInCourse.length;
            
            // Calcular asistencia promedio REAL de los estudiantes del curso
            const avgAttendance = totalStudents > 0
                ? Math.round(
                    studentsInCourse.reduce((sum, s) => sum + (s.attendance || 0), 0) / totalStudents
                )
                : 0;

            return {
                id: ficha.id,
                code: ficha.code,
                name: ficha.name,
                professor: ficha.instructor || "—",
                program: ficha.program || ficha.name, // Programa técnico
                semester: "2024-2", // TODO: añadir campo semester a fichas
                schedule: ficha.schedule || "—", // TODO: añadir campo schedule a fichas
                room: ficha.room || "—", // TODO: añadir campo room a fichas
                students: totalStudents, // Estudiantes REALES
                avgAttendance: avgAttendance, // Asistencia REAL calculada
                color: ficha.color,
                status: ficha.status || "active",
                startDate: ficha.startDate || "",
                endDate: ficha.endDate || "",
            };
        });
    }, [appData.fichas, appData.students, appData.isLoading]); // Depende de fichas, students Y estado de carga

    // ── Instructores únicos para filtro ────────────────────────
    
    const instructors = useMemo(() => {
        const uniqueInstructors = [...new Set(courses.map(c => c.professor).filter(Boolean))];
        return uniqueInstructors.map(instructor => ({
            value: instructor,
            label: instructor,
            icon: "user"
        }));
    }, [courses]);

    // ── Filtros de estado ──────────────────────────────────────
    
    const statusFilters = useMemo(() => [
        { value: "", label: "Todos los estados", icon: "filter" },
        { value: "active", label: "Activos", icon: "check-circle" },
        { value: "inactive", label: "Inactivos", icon: "x-circle" },
        { value: "completed", label: "Finalizados", icon: "archive" },
    ], []);

    // ── Cursos filtrados ───────────────────────────────────────
    
    const filtered = useMemo(
        () => {
            let result = courses.filter((course) => {
                // Filtro de búsqueda por nombre o código
                const matchSearch = !search ||
                    course.name.toLowerCase().includes(search.toLowerCase()) ||
                    course.code.toLowerCase().includes(search.toLowerCase()) ||
                    (course.professor && course.professor.toLowerCase().includes(search.toLowerCase()));
                
                // Filtro por instructor
                const matchInstructor = !instructorFilter || 
                    course.professor === instructorFilter;
                
                // Filtro por estado
                const matchStatus = !statusFilter || course.status === statusFilter;
                
                // ── Filtros avanzados ──────────────────────────────
                
                // Filtro de estado desde filtro avanzado
                if (advancedFilter.column === "status" && advancedFilter.value) {
                    const matchAdvancedStatus = course.status === advancedFilter.value;
                    if (!matchAdvancedStatus) return false;
                }
                
                // Filtro de asistencia
                if (advancedFilter.column === "attendance" && 
                    advancedFilter.attendanceFilter.percentage !== null) {
                    const { comparator, percentage } = advancedFilter.attendanceFilter;
                    const matchAttendance = compareValues(
                        course.avgAttendance || 0,
                        comparator,
                        percentage
                    );
                    if (!matchAttendance) return false;
                }
                
                return matchSearch && matchInstructor && matchStatus;
            });
            
            // ── Ordenamiento desde filtro avanzado ─────────────────
            
            // Ordenar por nombre
            if (advancedFilter.column === "name" && advancedFilter.value) {
                result = sortByColumn(result, "name", advancedFilter.value);
            }
            
            // Ordenar por código
            if (advancedFilter.column === "code" && advancedFilter.value) {
                result = sortByColumn(result, "code", advancedFilter.value);
            }
            
            // Ordenar por instructor
            if (advancedFilter.column === "instructor" && advancedFilter.value) {
                result = sortByColumn(result, "instructor", advancedFilter.value);
            }
            
            // Ordenar por estudiantes
            if (advancedFilter.column === "students" && advancedFilter.value) {
                result = sortByColumn(result, "students", advancedFilter.value);
            }
            
            // ── Ordenamiento automático por asistencia cuando hay filtro sin valor específico ──
            if (advancedFilter.column === "attendance" && 
                advancedFilter.attendanceFilter.percentage === null) {
                const { comparator } = advancedFilter.attendanceFilter;
                
                // Si el comparador es "gt" (mayor que) → ordenar de mayor a menor (desc)
                // Si el comparador es "lt" (menor que) → ordenar de menor a mayor (asc)
                if (comparator === "gt" || comparator === "lt") {
                    result = [...result].sort((a, b) => {
                        const attA = a.avgAttendance || 0;
                        const attB = b.avgAttendance || 0;
                        
                        // gt = mayor que → mostrar los más altos primero (desc)
                        // lt = menor que → mostrar los más bajos primero (asc)
                        return comparator === "gt" ? attB - attA : attA - attB;
                    });
                }
            }
            
            return result;
        },
        [courses, search, instructorFilter, statusFilter, advancedFilter]
    );

    // ── Estadísticas derivadas ─────────────────────────────────
    
    const totalStudents = useMemo(() => 
        courses.reduce((a, x) => a + x.students, 0), 
        [courses]
    );

    const avgAttendance = useMemo(
        () => courses.length === 0
            ? 0
            : Math.round(courses.reduce((a, x) => a + x.avgAttendance, 0) / courses.length),
        [courses]
    );

    const alertCount = useMemo(() => 
        courses.filter((x) => x.avgAttendance < 80).length, 
        [courses]
    );
    
    const stats = useMemo(() => {
        const total = courses.length;
        const active = courses.filter(c => c.status === "active").length;
        const completed = courses.filter(c => c.status === "completed").length;
        
        return { 
            total, 
            active, 
            completed, 
            totalStudents, 
            avgAttendance, 
            alertCount 
        };
    }, [courses, totalStudents, avgAttendance, alertCount]);

    // ── Acciones ───────────────────────────────────────────────

    const registerCourse = useCallback(
        async (form) => {
            const err = validateCourseForm(form);
            if (err) return err;

            // TODO: Implementar addCourse en AppDataContext
            // await appData.addCourse({
            //     code: form.code.trim(),
            //     name: form.name.trim(),
            //     instructor: form.instructor.trim(),
            //     program: form.program.trim(),
            //     semester: form.semester,
            //     schedule: form.schedule.trim(),
            //     room: form.room.trim(),
            //     startDate: form.startDate,
            //     endDate: form.endDate,
            //     maxStudents: form.maxStudents,
            //     status: form.status,
            // });
            
            console.log("Registrar curso:", form);
            return null;
        },
        [appData]
    );

    const importCourses = useCallback(
        async (drafts) => {
            // TODO: Implementar importCourses en AppDataContext
            // return appData.importCourses(drafts);
            console.log("Importar cursos:", drafts);
            return { success: 0, errors: [] };
        },
        [appData]
    );

    function selectCourse(course) {
        setSelected(course);
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
        courses: courses || [],
        filtered: filtered || [],
        instructors,
        statusFilters,
        selected,
        stats,
        
        // Estado de carga
        isLoading: appData.isLoading,
        
        // Estado de filtros básicos
        search,
        instructorFilter,
        statusFilter,
        
        // Estado de filtros avanzados
        advancedFilter,
        
        // Estado de modales
        showRegisterModal,
        showImportModal,
        
        // Setters de filtros básicos
        setSearch,
        setInstructorFilter,
        setStatusFilter,
        
        // Setters de filtros avanzados
        setAdvancedFilterColumn,
        setAdvancedFilterValue,
        setAttendanceFilter,
        clearAdvancedFilter,
        
        // Acciones de selección
        selectCourse,
        clearSelection,
        
        // Acciones de modales
        openRegisterModal: () => setShowRegisterModal(true),
        closeRegisterModal: () => setShowRegisterModal(false),
        openImportModal: () => setShowImportModal(true),
        closeImportModal: () => setShowImportModal(false),
        
        // Acciones de CRUD
        registerCourse,
        importCourses,
        
        // Estadísticas (legacy - mantener por compatibilidad)
        totalStudents,
        avgAttendance,
        alertCount,
    };
}
