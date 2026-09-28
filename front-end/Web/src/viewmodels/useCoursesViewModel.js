import { useState, useMemo } from "react";
import { useAppData } from "../context/AppDataContext";

// ── ViewModel ─────────────────────────────────────────────

export function useCoursesViewModel() {
    const appData = useAppData();
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);

    // Cursos vienen directamente de las fichas del contexto
    const courses = useMemo(() => {
        // Transformar fichas a formato de curso compatible con la vista
        return appData.fichas.map((ficha) => ({
            id: ficha.id,
            code: ficha.code,
            name: ficha.name,
            professor: ficha.instructor || "—",
            semester: "Activo", // TODO: añadir campo semester a fichas
            schedule: "—", // TODO: añadir campo schedule a fichas
            room: "—", // TODO: añadir campo room a fichas
            students: ficha.totalStudents || 0,
            avgAttendance: ficha.avgAttendance || 0,
            color: ficha.color,
        }));
    }, [appData.fichas]);

    const filtered = useMemo(
        () =>
            courses.filter(
                (c) =>
                    !search ||
                    c.name.toLowerCase().includes(search.toLowerCase()) ||
                    c.code.toLowerCase().includes(search.toLowerCase())
            ),
        [courses, search]
    );

    const totalStudents = useMemo(() => courses.reduce((a, x) => a + x.students, 0), [courses]);

    const avgAttendance = useMemo(
        () =>
            courses.length === 0
                ? 0
                : Math.round(courses.reduce((a, x) => a + x.avgAttendance, 0) / courses.length),
        [courses]
    );

    const alertCount = useMemo(() => courses.filter((x) => x.avgAttendance < 80).length, [courses]);

    function selectCourse(course) {
        setSelected(course);
    }

    return {
        courses: courses || [],
        filtered: filtered || [],
        selected,
        search,
        isLoading: appData.isLoading,
        totalStudents,
        avgAttendance,
        alertCount,
        setSearch,
        selectCourse,
        clearSelection: () => setSelected(null),
    };
}
