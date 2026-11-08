import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockAuth = { user: { id: "u-1", role: "admin", schoolId: 7 } };
jest.mock("../../context/AuthContext", () => ({ useAuth: () => mockAuth }));
const mockAppData = {
    isLoading: false, courses: [], students: [],
    reloadCourses: jest.fn(async () => {}), updateCourse: jest.fn(async () => {}),
};
jest.mock("../../context/AppDataContext", () => ({ useAppData: () => mockAppData }));
jest.mock("../../services/api/courseCreation", () => ({
    createCourse: jest.fn(), updateCourse: jest.fn(), deleteCourse: jest.fn(), importCourses: jest.fn(),
}));

import { useCoursesViewModel } from "../useCoursesViewModel";
import * as api from "../../services/api/courseCreation";

let vm;
function Probe() { vm = useCoursesViewModel(); return null; }
const mount = () => act(() => { create(<Probe />); });
const run = (fn) => act(() => { fn(vm); });
const names = () => vm.filtered.map((c) => c.name);

const courses = [
    { id: "1", code: "PRG", name: "Programación", professor: "Carlos Restrepo", students: 30, avgAttendance: 90, status: "active", programId: 9 },
    { id: "2", code: "BDD", name: "Bases de datos", professor: "Ana Ruiz", students: 12, avgAttendance: 70, status: "active", programId: 9 },
    { id: "3", code: "RED", name: "Redes", professor: "Carlos Restrepo", students: 20, avgAttendance: 60, status: "completed", programId: 9 },
    { id: "4", code: "OLD", name: "Antigua", professor: null, students: 0, avgAttendance: 0, status: "inactive", programId: 9 },
];

beforeEach(() => {
    jest.clearAllMocks();
    mockAppData.isLoading = false;
    mockAppData.courses = courses;
    mockAppData.students = [
        { id: "s1", status: "active", course: "PRG", attendance: 90 },
        { id: "s2", status: "active", course: "BDD", attendance: 50 },
        { id: "s3", status: "inactive", course: "PRG", attendance: 10 },
    ];
    mount();
});

test("inactive courses stay hidden unless asked for", () => {
    expect(names()).toEqual(["Programación", "Bases de datos", "Redes"]);
    expect(vm.visibleCourseCount).toBe(3);
    run((v) => v.setShowInactive(true));
    expect(names()).toContain("Antigua");
    run((v) => { v.setShowInactive(false); v.setStatusFilter("inactive"); });
    expect(names()).toEqual(["Antigua"]);
});

test("search, instructor and status filters combine", () => {
    run((v) => v.setSearch("carlos"));
    expect(names()).toEqual(["Programación", "Redes"]);
    run((v) => v.setStatusFilter("completed"));
    expect(names()).toEqual(["Redes"]);
    run((v) => { v.setSearch(""); v.setStatusFilter(""); v.setInstructorFilter("Ana Ruiz"); });
    expect(names()).toEqual(["Bases de datos"]);
    expect(vm.instructors.map((i) => i.value)).toEqual(["Carlos Restrepo", "Ana Ruiz"]);
});

test.each([
    ["name", "asc", ["Bases de datos", "Programación", "Redes"]],
    ["code", "desc", ["Redes", "Programación", "Bases de datos"]],
    ["instructor", "asc", ["Bases de datos", "Programación", "Redes"]],
    ["students", "desc", ["Programación", "Redes", "Bases de datos"]],
])("advanced sort by %s %s", (column, direction, expected) => {
    run((v) => v.setAdvancedFilterColumn(column));
    run((v) => v.setAdvancedFilterValue(direction));
    expect(names()).toEqual(expected);
});

test("attendance: compare against a percentage or sort by it", () => {
    run((v) => v.setAdvancedFilterColumn("attendance"));
    run((v) => v.setAttendanceFilter({ mode: "custom", comparator: "gt", percentage: 65 }));
    expect(names()).toEqual(["Programación", "Bases de datos"]);
    run((v) => v.setAttendanceFilter({ mode: "custom", comparator: "eq", percentage: 60 }));
    expect(names()).toEqual(["Redes"]);
    run((v) => v.setAttendanceFilter({ mode: "preset", comparator: "lt", percentage: null }));
    expect(names()).toEqual(["Redes", "Bases de datos", "Programación"]);
    run((v) => v.setAttendanceFilter({ mode: "preset", comparator: "gt", percentage: null }));
    expect(names()).toEqual(["Programación", "Bases de datos", "Redes"]);
    run((v) => v.clearAdvancedFilter());
    expect(vm.advancedFilter.column).toBeNull();
});

test("advanced status filter shows inactive courses too", () => {
    run((v) => v.setAdvancedFilterColumn("status"));
    run((v) => v.setAdvancedFilterValue("inactive"));
    expect(names()).toEqual(["Antigua"]);
});

test("statistics count active students of the listed courses", () => {
    expect(vm.stats).toMatchObject({ total: 4, active: 2, completed: 1, totalStudents: 2, avgAttendance: 70 });
    expect(vm.totalStudents).toBe(2);
});

test("while loading there are no courses", () => {
    mockAppData.isLoading = true;
    mount();
    expect(vm.courses).toEqual([]);
    expect(vm.stats.avgAttendance).toBe(0);
});

test("register validates, calls the backend and reloads", async () => {
    let err;
    await act(async () => { err = await vm.registerCourse({ code: "", name: "", programId: "" }); });
    expect(err).toBe("El nombre es requerido");

    await act(async () => { err = await vm.registerCourse({ code: " NEW ", name: " Nuevo ", programId: 9, creditHours: "4" }); });
    expect(err).toBeNull();
    expect(api.createCourse).toHaveBeenCalledWith({ programId: 9, code: "NEW", name: "Nuevo", creditHours: 4 });
    expect(mockAppData.reloadCourses).toHaveBeenCalled();

    api.createCourse.mockRejectedValueOnce(new Error("Código duplicado"));
    await act(async () => { err = await vm.registerCourse({ code: "NEW", name: "Nuevo", programId: 9 }); });
    expect(err).toBe("Código duplicado");
});

test("edit needs a selected course and updates backend and list", async () => {
    let err;
    const form = { code: "PRG", name: "Programación I", programId: 9, creditHours: "" };
    await act(async () => { err = await vm.editCourse(form); });
    expect(err).toBe("No hay curso seleccionado");

    run((v) => v.openEditModal(courses[0]));
    await act(async () => { err = await vm.editCourse(form); });
    expect(err).toBeNull();
    expect(api.updateCourse).toHaveBeenCalledWith(1, { programId: 9, code: "PRG", name: "Programación I", creditHours: null });
    expect(mockAppData.updateCourse).toHaveBeenCalledWith("1", { programId: 9, code: "PRG", name: "Programación I" });
    run((v) => v.closeEditModal());
    expect(vm.editingCourse).toBeNull();
});

test("remove and status toggle report backend errors and guard missing data", async () => {
    let err;
    await act(async () => { err = await vm.removeCourse(null); });
    expect(err).toBe("Falta el curso a eliminar");
    run((v) => v.selectCourse(courses[1]));
    await act(async () => { err = await vm.removeCourse(courses[1]); });
    expect(err).toBeNull();
    expect(vm.selected).toBeNull();

    await act(async () => { err = await vm.toggleCourseStatus({ id: "5" }); });
    expect(err).toBe("El curso no tiene programa asociado");
    await act(async () => { err = await vm.toggleCourseStatus(courses[0]); });
    expect(api.updateCourse).toHaveBeenCalledWith(1, expect.objectContaining({ status: false }));
    expect(mockAppData.updateCourse).toHaveBeenCalledWith("1", { status: "inactive" });

    api.deleteCourse.mockRejectedValueOnce(new Error("Tiene horarios"));
    await act(async () => { err = await vm.removeCourse(courses[0]); });
    expect(err).toBe("Tiene horarios");
});

test("import reports a backend failure as one error row", async () => {
    api.importCourses.mockRejectedValueOnce(new Error("CSV inválido"));
    let result;
    await act(async () => { result = await vm.importCourses([{}]); });
    expect(result).toEqual({ success: 0, errors: [{ course: "", reason: "CSV inválido" }] });
    expect(api.importCourses).toHaveBeenCalledWith(7, [{}]);
});
