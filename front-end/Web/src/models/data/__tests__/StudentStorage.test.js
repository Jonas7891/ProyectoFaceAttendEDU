// Las altas hechas en la pantalla dejaban una fila espejo local (id s_…) guardada en el navegador
// para siempre; al lado de la fila real que trae el backend, el estudiante salía duplicado.
// mergeLocalStudents descarta las filas locales cuya persona ya viene del backend.
//
// AUD-36: un alumno sin ningún registro de asistencia salía con attendance 0 y por eso
// "en riesgo" con 45 faltas inventadas. Sin registros no hay porcentaje: es null.
jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
}));
jest.mock("../../../services/api/referenceData", () => ({
    actorTypeMap: jest.fn(),
    attendanceSummaryFor: jest.fn(),
    cohortMap: jest.fn(),
    courseMap: jest.fn(),
    fullName: (p) => (p ? `${p.name} ${p.lastName}` : ""),
    listActors: jest.fn(),
    listBlocks: jest.fn(),
    listEnrollments: jest.fn(),
    normalizeStatus: (s) => (s === false ? "inactive" : "active"),
    optional: (promise, fallback) => promise.catch(() => fallback),
    personMap: jest.fn(),
    userByPersonMap: jest.fn(),
}));

import { loadStudents, mergeLocalStudents } from "../StudentStorage";
import * as ref from "../../../services/api/referenceData";

const api = (id, personId) => ({ id: String(id), personId, name: `Real ${id}` });
const local = (id, personId, extra = {}) => ({ id: `s_${id}`, personId, name: `Espejo ${id}`, ...extra });

describe("mergeLocalStudents", () => {
    it("quita la fila local cuyo estudiante ya viene del backend (mismo personId)", () => {
        const rows = mergeLocalStudents([api(1, "p1"), api(2, "p2")], [local(9, "p1")]);
        expect(rows.map((r) => r.id)).toEqual(["1", "2"]);
    });

    it("conserva las filas locales de alguien que el backend no devuelve", () => {
        const rows = mergeLocalStudents([api(1, "p1")], [local(7, "p7")]);
        expect(rows.map((r) => r.id)).toEqual(["1", "s_7"]);
    });

    it("conserva las filas locales sin personId (altas que nunca llegaron al backend)", () => {
        const rows = mergeLocalStudents([api(1, "p1")], [local(5, null), local(6, undefined)]);
        expect(rows.map((r) => r.id)).toEqual(["1", "s_5", "s_6"]);
    });

    it("compara el personId sin distinguir mayúsculas", () => {
        const rows = mergeLocalStudents([api(1, "ABC-1")], [local(9, "abc-1")]);
        expect(rows.map((r) => r.id)).toEqual(["1"]);
    });

    it("sin filas locales devuelve la lista del backend tal cual", () => {
        const fromApi = [api(1, "p1")];
        expect(mergeLocalStudents(fromApi, [])).toEqual(fromApi);
    });
});

const actor = (id) => ({ academicActorId: id, personId: `p${id}`, actorTypeId: 1, schoolId: 1, actorCode: `A${id}`, status: true });

describe("loadStudents: porcentaje de asistencia propio", () => {
    beforeEach(() => {
        ref.actorTypeMap.mockResolvedValue(new Map([[1, { actorTypeId: 1, code: "STUDENT" }]]));
        ref.listActors.mockResolvedValue([actor(1), actor(2), actor(3)]);
        ref.personMap.mockResolvedValue(new Map([1, 2, 3].map((n) => [`p${n}`, { name: `P${n}`, lastName: "X" }])));
        ref.listEnrollments.mockResolvedValue([]);
        ref.cohortMap.mockResolvedValue(new Map());
        ref.listBlocks.mockResolvedValue([]);
        ref.courseMap.mockResolvedValue(new Map());
        ref.userByPersonMap.mockResolvedValue(new Map());
        ref.attendanceSummaryFor.mockResolvedValue(
            new Map([
                [1, { present: 0, late: 0, absent: 0, justified: 1, total: 1 }],
                [2, { present: 3, late: 1, absent: 4, justified: 2, total: 10 }],
            ])
        );
    });

    const byId = async () => new Map((await loadStudents()).map((s) => [s.id, s]));

    it("sin ningún registro el porcentaje es null, no 0", async () => {
        const rows = await byId();
        expect(rows.get("3").attendance).toBeNull();
        expect(rows.get("3").attendanceRecords).toBe(0);
    });

    it("una sola falta justificada cuenta como asistencia efectiva (100 % de 1 sesión)", async () => {
        const rows = await byId();
        expect(rows.get("1").attendance).toBe(100);
        expect(rows.get("1").attendanceRecords).toBe(1);
        expect(rows.get("1").absences).toBe(0);
    });

    it("Present, Late y Justified suman sobre las sesiones registradas del propio alumno", async () => {
        const rows = await byId();
        expect(rows.get("2").attendance).toBe(60);
        expect(rows.get("2").attendanceRecords).toBe(10);
        expect(rows.get("2").absences).toBe(4);
        expect(rows.get("2").lateCount).toBe(1);
    });
});
