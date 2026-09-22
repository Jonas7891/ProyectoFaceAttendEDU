// ============================================================
//  FaceAttend EDU — Courses ViewModel
//
//  Consume AppDataContext como única fuente de verdad.
//  Los "cursos/programas" se derivan de los estudiantes
//  registrados — si existe un estudiante con course = "X",
//  el programa "X" existe automáticamente aquí.
// ============================================================

import { useState, useMemo } from "react";
import { useAppData }          from "../context/AppDataContext";
import type { Course }         from "../models/types";

// ── Tipo derivado para la vista de cursos ─────────────────
//
//  El tipo Course del dominio tiene campos que aún no se
//  persisten (professor, schedule, room, semester, color).
//  Derivamos lo que tenemos y dejamos defaults para el resto.

function buildCourseFromProgram(
    name: string,
    studentCount: number,
    avgAttendance: number,
    index: number
): Course {
    const COLORS = [
        "#4F6BED", "#10B981", "#F59E0B", "#8B5CF6",
        "#EF4444", "#06B6D4", "#F97316", "#84CC16",
    ];
    return {
        id:            name,
        code:          name.slice(0, 6).toUpperCase().replace(/ /g, "-"),
        name,
        professor:     "—",
        semester:      "Activo",
        schedule:      "—",
        room:          "—",
        students:      studentCount,
        avgAttendance,
        color:         COLORS[index % COLORS.length],
    };
}

// ── ViewModel ─────────────────────────────────────────────

export interface CoursesViewModel {
    courses:        Course[];
    filtered:       Course[];
    selected:       Course | null;
    search:         string;
    isLoading:      boolean;
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
    const appData = useAppData();
    const [search,   setSearch]   = useState("");
    const [selected, setSelected] = useState<Course | null>(null);

    // Cursos derivados de los programas del contexto global
    const courses = useMemo<Course[]>(
        () => appData.programs.map((p, i) =>
            buildCourseFromProgram(p.name, p.studentCount, p.avgAttendance, i)
        ),
        [appData.programs]
    );

    const filtered = useMemo(() =>
        courses.filter(c =>
            !search ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase())
        ),
        [courses, search]
    );

    const totalStudents = useMemo(
        () => courses.reduce((a, x) => a + x.students, 0),
        [courses]
    );

    const avgAttendance = useMemo(
        () => courses.length === 0 ? 0
            : Math.round(courses.reduce((a, x) => a + x.avgAttendance, 0) / courses.length),
        [courses]
    );

    const alertCount = useMemo(
        () => courses.filter(x => x.avgAttendance < 80).length,
        [courses]
    );

    return {
        courses,
        filtered,
        selected,
        search,
        isLoading:  appData.isLoading,
        totalStudents,
        avgAttendance,
        alertCount,
        setSearch,
        selectCourse:   setSelected,
        clearSelection: () => setSelected(null),
    };
}
