// ============================================================
//  FaceAttend EDU — Students ViewModel
//
//  Consume AppDataContext como única fuente de verdad.
//  Ya no carga datos propios: lee students del contexto global.
// ============================================================

import { useState, useMemo, useCallback } from "react";
import { useAppData } from "../context/AppDataContext";

// ── Tipos de formulario ───────────────────────────────────

export const EMPTY_FORM = {
    name: "",
    code: "",
    email: "",
    course: "",
    role: "student",
    attendance: 0,
    registered: false,
    status: "active",
};

// ── Validación básica ─────────────────────────────────────

export function validateStudentForm(form) {
    if (!form.name.trim()) return "Completa todos los campos";
    if (!form.code.trim()) return "Completa todos los campos";
    if (!form.email.trim()) return "Completa todos los campos";
    if (!form.course.trim()) return "Completa todos los campos";
    if (!form.role) return "Completa todos los campos";
    return null;
}

// ── ViewModel ─────────────────────────────────────────────

export function useStudentsViewModel() {
    const appData = useAppData();

    const [search, setSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [selected, setSelected] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Programas únicos — derivados del contexto global
    const courses = useMemo(() => appData.programs.map((p) => p.name), [appData.programs]);

    const filtered = useMemo(
        () =>
            appData.students.filter((s) => {
                const matchSearch =
                    !search ||
                    s.name.toLowerCase().includes(search.toLowerCase()) ||
                    s.code.toLowerCase().includes(search.toLowerCase());
                const matchCourse = !courseFilter || s.course === courseFilter;
                return matchSearch && matchCourse;
            }),
        [appData.students, search, courseFilter]
    );

    const registerStudent = useCallback(
        async (form) => {
            const err = validateStudentForm(form);
            if (err) return err;

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
            return null;
        },
        [appData]
    );

    const importStudents = useCallback(
        async (drafts) => {
            return appData.importStudents(drafts);
        },
        [appData]
    );

    function selectStudent(student) {
        setSelected(student);
    }

    return {
        students: appData.students,
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
        selectStudent,
        clearSelection: () => setSelected(null),
        openRegisterModal: () => setShowRegisterModal(true),
        closeRegisterModal: () => setShowRegisterModal(false),
        openImportModal: () => setShowImportModal(true),
        closeImportModal: () => setShowImportModal(false),
        registerStudent,
        importStudents,
    };
}
