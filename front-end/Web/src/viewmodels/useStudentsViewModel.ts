// ============================================================
//  FaceAttend EDU — Students ViewModel
//
//  Consume AppDataContext como única fuente de verdad.
//  Ya no carga datos propios: lee students del contexto global.
// ============================================================

import { useState, useMemo, useCallback } from "react";
import { useAppData }  from "../context/AppDataContext";
import type { Student, AppUserRole } from "../models/types";

// ── Tipos de formulario ───────────────────────────────────

export interface StudentFormData {
    name:       string;
    code:       string;
    email:      string;
    course:     string;
    role:       AppUserRole;
    attendance: number;
    registered: boolean;
    status:     "active" | "inactive";
}

export const EMPTY_FORM: StudentFormData = {
    name:       "",
    code:       "",
    email:      "",
    course:     "",
    role:       "student",
    attendance: 100,
    registered: false,
    status:     "active",
};

// ── Validación básica ─────────────────────────────────────

export function validateStudentForm(form: StudentFormData): string | null {
    if (!form.name.trim())   return "Completa todos los campos";
    if (!form.code.trim())   return "Completa todos los campos";
    if (!form.email.trim())  return "Completa todos los campos";
    if (!form.course.trim()) return "Completa todos los campos";
    if (!form.role)          return "Completa todos los campos";
    return null;
}

// ── ViewModel ─────────────────────────────────────────────

export interface StudentsViewModel {
    // datos
    students:            Student[];
    filtered:            Student[];
    courses:             string[];   // programas únicos (= AppDataContext.programs.name)
    selected:            Student | null;
    isLoading:           boolean;

    // filtros
    search:              string;
    courseFilter:        string;

    // modales
    showRegisterModal:   boolean;
    showImportModal:     boolean;

    // acciones de filtro/selección
    setSearch:           (v: string) => void;
    setCourseFilter:     (v: string) => void;
    selectStudent:       (s: Student) => void;
    clearSelection:      () => void;

    // acciones de registro
    openRegisterModal:   () => void;
    closeRegisterModal:  () => void;
    openImportModal:     () => void;
    closeImportModal:    () => void;

    /** Agrega un estudiante desde el formulario. Retorna error string o null si OK. */
    registerStudent:     (form: StudentFormData) => Promise<string | null>;

    /** Agrega múltiples estudiantes desde importación. Retorna cuántos se añadieron. */
    importStudents:      (drafts: Omit<Student, "id">[]) => Promise<number>;
}

export function useStudentsViewModel(): StudentsViewModel {
    const appData = useAppData();

    const [search,       setSearch]       = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [selected,     setSelected]     = useState<Student | null>(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showImportModal,   setShowImportModal]   = useState(false);

    // Programas únicos — derivados del contexto global
    const courses = useMemo(
        () => appData.programs.map(p => p.name),
        [appData.programs]
    );

    const filtered = useMemo(() =>
        appData.students.filter(s => {
            const matchSearch = !search
                || s.name.toLowerCase().includes(search.toLowerCase())
                || s.code.toLowerCase().includes(search.toLowerCase());
            const matchCourse = !courseFilter || s.course === courseFilter;
            return matchSearch && matchCourse;
        }),
        [appData.students, search, courseFilter]
    );

    const registerStudent = useCallback(async (form: StudentFormData): Promise<string | null> => {
        const err = validateStudentForm(form);
        if (err) return err;

        await appData.addStudent({
            name:       form.name.trim(),
            code:       form.code.trim(),
            email:      form.email.trim(),
            course:     form.course.trim(),
            grade:      form.role,
            attendance: form.attendance,
            registered: form.registered,
            status:     form.status,
        });
        return null;
    }, [appData]);

    const importStudents = useCallback(async (drafts: Omit<Student, "id">[]): Promise<number> => {
        return appData.importStudents(drafts);
    }, [appData]);

    return {
        students:  appData.students,
        filtered,
        courses,
        selected,
        isLoading: appData.isLoading,
        search,
        courseFilter,
        showRegisterModal,
        showImportModal,
        setSearch,
        setCourseFilter,
        selectStudent:      setSelected,
        clearSelection:     () => setSelected(null),
        openRegisterModal:  () => setShowRegisterModal(true),
        closeRegisterModal: () => setShowRegisterModal(false),
        openImportModal:    () => setShowImportModal(true),
        closeImportModal:   () => setShowImportModal(false),
        registerStudent,
        importStudents,
    };
}
