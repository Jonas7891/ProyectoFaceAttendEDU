// ============================================================
//  FaceAttend EDU — Students ViewModel
//
//  Gestiona la lista de estudiantes con persistencia en
//  AsyncStorage a través de StudentStorage.
//  Incluye registro manual y registro por importación (CSV/Excel).
// ============================================================

import { useState, useMemo, useEffect, useCallback } from "react";
import {
    loadStudents,
    addStudent,
    addStudentsBulk,
} from "../models/data/StudentStorage";
import type { Student } from "../models/types";

// ── Tipos de formulario ───────────────────────────────────

export interface StudentFormData {
    name:       string;
    code:       string;
    email:      string;
    course:     string;
    grade:      string;
    attendance: number;
    registered: boolean;
    status:     "active" | "inactive";
}

export const EMPTY_FORM: StudentFormData = {
    name:       "",
    code:       "",
    email:      "",
    course:     "",
    grade:      "",
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
    if (!form.grade.trim())  return "Completa todos los campos";
    return null;
}

// ── ViewModel ─────────────────────────────────────────────

export interface StudentsViewModel {
    // datos
    students:            Student[];
    filtered:            Student[];
    courses:             string[];
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
    const [students,     setStudents]     = useState<Student[]>([]);
    const [isLoading,    setIsLoading]    = useState(true);
    const [search,       setSearch]       = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [selected,     setSelected]     = useState<Student | null>(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showImportModal,   setShowImportModal]   = useState(false);

    // Carga inicial desde storage
    useEffect(() => {
        loadStudents().then(loaded => {
            setStudents(loaded);
            setIsLoading(false);
        });
    }, []);

    const courses = useMemo(
        () => [...new Set(students.map(s => s.course))],
        [students]
    );

    const filtered = useMemo(() =>
        students.filter(s => {
            const matchSearch = !search
                || s.name.toLowerCase().includes(search.toLowerCase())
                || s.code.toLowerCase().includes(search.toLowerCase());
            const matchCourse = !courseFilter || s.course === courseFilter;
            return matchSearch && matchCourse;
        }),
        [students, search, courseFilter]
    );

    const registerStudent = useCallback(async (form: StudentFormData): Promise<string | null> => {
        const err = validateStudentForm(form);
        if (err) return err;

        const updated = await addStudent(students, {
            name:       form.name.trim(),
            code:       form.code.trim(),
            email:      form.email.trim(),
            course:     form.course.trim(),
            grade:      form.grade.trim(),
            attendance: form.attendance,
            registered: form.registered,
            status:     form.status,
        });
        setStudents(updated);
        return null;
    }, [students]);

    const importStudents = useCallback(async (drafts: Omit<Student, "id">[]): Promise<number> => {
        if (drafts.length === 0) return 0;
        const updated = await addStudentsBulk(students, drafts);
        setStudents(updated);
        return drafts.length;
    }, [students]);

    return {
        students,
        filtered,
        courses,
        selected,
        isLoading,
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
