// AUD-52: «Mis cursos» mostraba «Asistencia promedio 33 %», el promedio de toda la ficha
// (compañeros incluidos), en vez de la asistencia propia del alumno. AUD-46: el promedio
// del instructor contaba como 0 % a los alumnos sin registros.
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockUser = { id: "u-1", role: "student", personId: "p-1", academicActorId: 10 };
const mockAuth = { user: mockUser };
jest.mock("../../context/AuthContext", () => ({ useAuth: () => mockAuth }));

const mockAppData = { isLoading: false, courses: [], students: [] };
jest.mock("../../context/AppDataContext", () => ({ useAppData: () => mockAppData }));
jest.mock("../../services/api/courseCreation", () => ({
    createCourse: jest.fn(),
    updateCourse: jest.fn(),
    deleteCourse: jest.fn(),
    importCourses: jest.fn(),
}));

import { useCoursesViewModel } from "../useCoursesViewModel";

function renderVm() {
    let vm;
    function Probe() {
        vm = useCoursesViewModel();
        return null;
    }
    act(() => {
        create(<Probe />);
    });
    return vm;
}

const course = { id: "1", code: "QBD", name: "Bases de Datos", instructorActorIds: [10], avgAttendance: 33 };
const pupil = (id, personId, attendance) => ({
    id,
    personId,
    attendance,
    status: "active",
    course: "QBD",
    courseId: "1",
    courseIds: ["1"],
    cohortId: "53",
});

beforeEach(() => {
    mockAppData.courses = [course];
});

describe("myStats.avgAttendance", () => {
    it("el alumno ve su propia asistencia, no el promedio de la ficha", () => {
        mockUser.role = "student";
        mockAppData.students = [pupil("1", "p-1", 100), pupil("2", "p-2", 0), pupil("3", "p-3", null)];
        expect(renderVm().myStats.avgAttendance).toBe(100);
    });

    it("el alumno sin registros propios ve null, no 0", () => {
        mockUser.role = "student";
        mockAppData.students = [pupil("1", "p-1", null), pupil("2", "p-2", 80)];
        expect(renderVm().myStats.avgAttendance).toBeNull();
    });

    it("el instructor promedia solo a los alumnos con registros", () => {
        mockUser.role = "teacher";
        mockAppData.students = [pupil("1", "p-1", 100), pupil("2", "p-2", null), pupil("3", "p-3", 50)];
        expect(renderVm().myStats.avgAttendance).toBe(75);
    });

    it("el instructor sin ningún alumno con registros ve null", () => {
        mockUser.role = "teacher";
        mockAppData.students = [pupil("1", "p-1", null)];
        expect(renderVm().myStats.avgAttendance).toBeNull();
    });
});

// AUD-73: el campo de créditos descartaba el «-» en silencio («-5» se guardaba como 5).
describe("credits validation", () => {
    const { sanitizeCreditsInput, validateCourseForm } = require("../useCoursesViewModel");
    const base = { code: "QBD", name: "Bases", programId: "1", creditHours: "" };

    test("typing keeps the minus sign so the validation can reject it", () => {
        expect(sanitizeCreditsInput("-5")).toBe("-5");
        expect(sanitizeCreditsInput("a1b2")).toBe("12");
    });

    test("a negative credits value is rejected with the 0..32767 message", () => {
        expect(validateCourseForm({ ...base, creditHours: sanitizeCreditsInput("-5") }))
            .toBe("Los créditos deben ser un número entre 0 y 32767");
    });

    test("valid credits and empty credits pass", () => {
        expect(validateCourseForm({ ...base, creditHours: "5" })).toBeNull();
        expect(validateCourseForm({ ...base, creditHours: "" })).toBeNull();
    });
});
