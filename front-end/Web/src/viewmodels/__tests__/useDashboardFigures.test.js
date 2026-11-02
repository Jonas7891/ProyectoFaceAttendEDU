// AUD-36 / AUD-46 / AUD-52: las cifras del Dashboard salen de datos reales. Sin datos se
// muestra «Sin datos» o «—»; nunca una variación inventada, un valor por defecto ni el
// código de un curso como si fuera el ambiente.
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockUser = { id: "u-1", role: "student", personId: "p-1", academicActorId: 10, schoolId: 2 };
const mockColors = new Proxy({}, { get: () => new Proxy({}, { get: () => "#000" }) });

jest.mock("../../view/components/hooks/useTheme", () => ({
    useTheme: () => ({ theme: { colors: mockColors } }),
}));
jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({
    useTranslation: () => ({ t: (s) => s }),
}));
jest.mock("../../view/components/hooks/useDateFormat", () => ({
    useDateFormat: () => ({ formatDate: () => "01/11/2026" }),
}));
const mockAuth = { user: mockUser };
jest.mock("../../context/AuthContext", () => ({ useAuth: () => mockAuth }));

const mockAppData = {
    isLoading: false,
    teachers: [],
    fichas: [],
    courses: [],
    students: [],
};
jest.mock("../../context/AppDataContext", () => ({ useAppData: () => mockAppData }));
jest.mock("../../services/api/dashboardSeries", () => ({
    dashboardSeries: jest.fn(),
    recentActivity: jest.fn(() => Promise.resolve([])),
    instructorClassCounts: jest.fn(() => Promise.resolve(new Map())),
}));

import { dashboardSeries } from "../../services/api/dashboardSeries";
import { useDashboardViewModel } from "../useDashboardViewModel";

const emptySeries = () => ({ daily: [], weekly: [], meta: { sessionsToday: 0, sessionsClosedToday: 0 } });

async function renderVm(series = emptySeries()) {
    dashboardSeries.mockResolvedValue(series);
    let vm;
    function Probe() {
        vm = useDashboardViewModel();
        return null;
    }
    await act(async () => {
        create(<Probe />);
    });
    return vm;
}

const statOf = (vm, label) => vm.stats.find((s) => s.label === label);

const pupil = (id, personId, attendance, extra) => ({
    id,
    personId,
    name: `Alumno ${id}`,
    code: `C${id}`,
    attendance,
    status: "active",
    course: "QBD",
    courseId: "1",
    courseIds: ["1"],
    cohortId: "53",
    ficha: "F53",
    ...extra,
});

const COURSE_QBD = { id: "1", code: "QBD", name: "Bases de Datos", instructorActorIds: [10] };
const COURSE_QCA = { id: "2", code: "QCA", name: "Curso ajeno", instructorActorIds: [99] };

beforeEach(() => {
    mockUser.role = "student";
    mockUser.personId = "p-1";
    mockUser.academicActorId = 10;
    mockAppData.teachers = [];
    mockAppData.fichas = [];
    mockAppData.courses = [COURSE_QBD];
    mockAppData.students = [pupil("1", "p-1", 100)];
});

describe("estudiante", () => {
    it("«Mi asistencia» no inventa una variación (↗ 2.4 %) sin dos periodos reales", async () => {
        const stat = statOf(await renderVm(), "Mi asistencia");
        expect(stat.value).toBe("100.0%");
        expect(stat.change).toBeUndefined();
    });

    it("«Mi asistencia» muestra la variación entre las dos últimas semanas con datos", async () => {
        const vm = await renderVm({
            ...emptySeries(),
            weekly: [
                { week: "Sem 43", rate: 60, dailyData: [] },
                { week: "Sem 44", rate: 75, dailyData: [] },
            ],
        });
        expect(statOf(vm, "Mi asistencia").change).toBe(15);
    });

    it("sin ningún registro propio muestra «Sin datos», no 0 %", async () => {
        mockAppData.students = [pupil("1", "p-1", null)];
        const stat = statOf(await renderVm(), "Mi asistencia");
        expect(stat.value).toBe("Sin datos");
        expect(stat.change).toBeUndefined();
    });

    it("«Ambiente actual» nunca muestra el código del curso", async () => {
        const stat = statOf(await renderVm(), "Ambiente actual");
        expect(stat.value).toBe("—");
        expect(stat.value).not.toBe("QBD");
    });

    it("«Ambiente actual» muestra el ambiente del bloque de hoy, no el curso", async () => {
        const vm = await renderVm({
            ...emptySeries(),
            meta: {
                sessionsToday: 1,
                sessionsClosedToday: 0,
                currentClass: { courseCode: "QBD", courseName: "Bases de Datos", environmentCode: "QAAMB", environmentName: "Aula 1" },
            },
        });
        expect(statOf(vm, "Ambiente actual").value).toBe("QAAMB");
    });

    it("si el bloque de hoy no trae ambiente tampoco cae al código del curso", async () => {
        const vm = await renderVm({
            ...emptySeries(),
            meta: { sessionsToday: 1, sessionsClosedToday: 0, currentClass: { courseCode: "QBD", courseName: "Bases de Datos" } },
        });
        expect(statOf(vm, "Ambiente actual").value).toBe("—");
    });
});

describe("instructor", () => {
    beforeEach(() => {
        mockUser.role = "teacher";
        mockAppData.courses = [COURSE_QBD, COURSE_QCA];
        mockAppData.fichas = [{ id: "53", code: "F53", instructorId: "u-1", totalStudents: 3, activeStudents: 3, avgAttendance: 0 }];
        mockAppData.students = [pupil("1", "p-1", null), pupil("2", "p-2", null)];
    });

    it("«Asistencia promedio» no inventa variación ni un 0 % sin registros", async () => {
        const stat = statOf(await renderVm(), "Asistencia promedio");
        expect(stat.change).toBeUndefined();
        expect(stat.value).toBe("Sin datos");
    });

    it("solo lista los cursos que tiene asignados (no el primero ni el segundo de la sede)", async () => {
        const vm = await renderVm();
        expect(vm.teacherData.myFichas.map((c) => c.code)).toEqual(["QBD"]);
    });

    it("«en riesgo» ignora a los alumnos sin registros", async () => {
        const vm = await renderVm();
        expect(statOf(vm, "Estudiantes en riesgo").value).toBe(0);
        expect(vm.teacherData.myAtRiskStudents).toEqual([]);
    });
});

describe("administrador", () => {
    beforeEach(() => {
        mockUser.role = "admin";
        mockAppData.teachers = [{ id: "t-1", name: "Carlos", actorId: 7 }];
        mockAppData.fichas = [{ id: "53", code: "F53", totalStudents: 3, activeStudents: 3, avgAttendance: 0 }];
        mockAppData.courses = [COURSE_QBD];
        mockAppData.students = [pupil("1", "p-1", 100), pupil("2", "p-2", null), pupil("3", "p-3", null)];
    });

    it("sin sesiones hoy no inventa «Asistencia hoy» ni «Tasa de puntualidad»", async () => {
        const vm = await renderVm();
        expect(statOf(vm, "Asistencia hoy").value).toBe("Sin datos");
        expect(statOf(vm, "Tasa de puntualidad").value).toBe("Sin datos");
    });

    it("«Asistencia global» promedia solo a quienes tienen registros", async () => {
        const stat = statOf(await renderVm(), "Asistencia global");
        expect(stat.value).toBe("100.0%");
    });

    it("ninguna tarjeta de administrador trae una variación inventada", async () => {
        const vm = await renderVm();
        expect(vm.stats.filter((s) => s.change !== undefined)).toEqual([]);
    });

    it("los alumnos sin registros no cuentan como «en riesgo» ni «asistencia perfecta» con 45", async () => {
        mockAppData.students = [pupil("2", "p-2", null), pupil("3", "p-3", null)];
        const vm = await renderVm();
        expect(statOf(vm, "Estudiantes en riesgo").value).toBe("0");
        expect(vm.adminData.atRiskStudents).toEqual([]);
        expect(vm.adminData.perfectAttendanceStudents).toEqual([]);
    });
});
