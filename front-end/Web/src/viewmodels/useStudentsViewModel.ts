// ============================================================
//  FaceAttend EDU — Students ViewModel
// ============================================================

import { useState, useMemo } from "react";
import { mockStudents } from "../models/data/mockData";
import type { Student } from "../models/types";

export interface StudentsViewModel {
    // datos
    students:       Student[];
    filtered:       Student[];
    courses:        string[];
    selected:       Student | null;
    // filtros
    search:         string;
    courseFilter:   string;
    // acciones
    setSearch:      (v: string) => void;
    setCourseFilter:(v: string) => void;
    selectStudent:  (s: Student) => void;
    clearSelection: () => void;
}

export function useStudentsViewModel(): StudentsViewModel {
    const [search,       setSearch]       = useState("");
    const [courseFilter, setCourseFilter] = useState("");
    const [selected,     setSelected]     = useState<Student | null>(null);

    const courses = useMemo(
        () => [...new Set(mockStudents.map(s => s.course))],
        []
    );

    const filtered = useMemo(() =>
        mockStudents.filter(s => {
            const matchSearch = !search
                || s.name.toLowerCase().includes(search.toLowerCase())
                || s.code.includes(search);
            const matchCourse = !courseFilter || s.course === courseFilter;
            return matchSearch && matchCourse;
        }),
        [search, courseFilter]
    );

    return {
        students:       mockStudents,
        filtered,
        courses,
        selected,
        search,
        courseFilter,
        setSearch,
        setCourseFilter,
        selectStudent:  setSelected,
        clearSelection: () => setSelected(null),
    };
}
