// ============================================================
//  FaceAttend EDU — Courses ViewModel
// ============================================================

import { useState, useMemo } from "react";
import { mockCourses } from "../models/data/mockData";
import type { Course } from "../models/types";

export interface CoursesViewModel {
    courses:        Course[];
    filtered:       Course[];
    selected:       Course | null;
    search:         string;
    // resumen
    totalStudents:  number;
    avgAttendance:  number;
    alertCount:     number;
    // acciones
    setSearch:      (v: string) => void;
    selectCourse:   (c: Course) => void;
    clearSelection: () => void;
}

export function useCoursesViewModel(): CoursesViewModel {
    const [search,   setSearch]   = useState("");
    const [selected, setSelected] = useState<Course | null>(null);

    const filtered = useMemo(() =>
        mockCourses.filter(c =>
            !search
            || c.name.toLowerCase().includes(search.toLowerCase())
            || c.code.toLowerCase().includes(search.toLowerCase())
        ),
        [search]
    );

    const totalStudents = useMemo(
        () => mockCourses.reduce((a, x) => a + x.students, 0),
        []
    );

    const avgAttendance = useMemo(
        () => Math.round(mockCourses.reduce((a, x) => a + x.avgAttendance, 0) / mockCourses.length),
        []
    );

    const alertCount = useMemo(
        () => mockCourses.filter(x => x.avgAttendance < 80).length,
        []
    );

    return {
        courses:        mockCourses,
        filtered,
        selected,
        search,
        totalStudents,
        avgAttendance,
        alertCount,
        setSearch,
        selectCourse:   setSelected,
        clearSelection: () => setSelected(null),
    };
}
