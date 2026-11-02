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

import { loadStudents } from "../StudentStorage";
import * as ref from "../../../services/api/referenceData";

const actor = (id) => ({ academicActorId: id, personId: `p${id}`, actorTypeId: 1, schoolId: 1, actorCode: `A${id}`, status: true });

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

describe("loadStudents: porcentaje de asistencia propio", () => {
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
