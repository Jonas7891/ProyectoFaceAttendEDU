// Fichas (cohorts) are assembled from cohorts + programs + enrollments + blocks +
// actors + persons + users + the attendance summary.
const mockApiMode = { value: "real" };
jest.mock("../../../config/env", () => ({ get API_MODE() { return mockApiMode.value; } }));
jest.mock("../localCache", () => ({ readLocalRows: jest.fn(async () => []), writeLocalRows: jest.fn(async () => {}) }));
jest.mock("../../../services/api/referenceData", () => ({
    ...jest.requireActual("../../../services/api/referenceData"),
    listCohorts: jest.fn(), listPrograms: jest.fn(), listEnrollments: jest.fn(), listBlocks: jest.fn(),
    actorMap: jest.fn(), personMap: jest.fn(), userByPersonMap: jest.fn(), attendanceSummaryFor: jest.fn(),
}));

import * as ref from "../../../services/api/referenceData";
import { readLocalRows, writeLocalRows } from "../localCache";
import { loadFichas, addFicha, updateFicha, deleteFicha } from "../FichaStorage";
import { mockFichas } from "../mockData";

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockApiMode.value = "real";
    readLocalRows.mockResolvedValue([]);
    ref.listCohorts.mockResolvedValue([
        { cohortId: 10, programId: 1, code: "2758", status: true },
        { cohortId: 11, code: "SIN-PRG", status: false },
    ]);
    ref.listPrograms.mockResolvedValue([{ programId: 1, code: "ADSO", name: "Análisis y desarrollo de software" }]);
    ref.listEnrollments.mockResolvedValue([
        { cohortId: 10, academicActorId: 1, enrollmentStatus: "Active" },
        { cohortId: 10, academicActorId: 2, enrollmentStatus: "Completed" },
        { cohortId: 10, academicActorId: 3, enrollmentStatus: "Withdrawn" },
    ]);
    ref.listBlocks.mockResolvedValue([
        { cohortId: 10, instructorActorId: 99 }, // actor without a person: skipped
        { cohortId: 10, instructorActorId: 100 },
    ]);
    ref.actorMap.mockResolvedValue(new Map([[99, {}], [100, { personId: "p100" }]]));
    ref.personMap.mockResolvedValue(new Map([["p100", { name: "Carlos", lastName: "Restrepo" }]]));
    ref.userByPersonMap.mockResolvedValue(new Map([["p100", { userId: "u-100" }]]));
    ref.attendanceSummaryFor.mockResolvedValue(new Map([
        [1, { present: 10, late: 0, justified: 0, total: 10 }],
        [2, { present: 5, late: 1, justified: 0, total: 10 }],
        [3, { present: 0, late: 0, justified: 0, total: 10 }],
    ]));
});
afterEach(() => console.warn.mockRestore());

test("a ficha counts its students, teacher and attendance; withdrawn students are left out", async () => {
    const [ficha, other] = await loadFichas();
    expect(ficha).toMatchObject({
        id: "10", code: "2758", name: "Análisis y desarrollo de software", program: "ADSO",
        instructor: "Carlos Restrepo", instructorId: "u-100",
        totalStudents: 2, activeStudents: 1,
        avgAttendance: 80, // (100 % + 60 %) / 2
        atRiskStudents: 1, excellentStudents: 1, status: "active",
    });
    expect(ficha.color).toEqual(expect.any(String));
    expect(other).toMatchObject({ id: "11", name: "SIN-PRG", program: "", instructor: "", totalStudents: 0, avgAttendance: 0, status: "inactive" });
});

test("failed secondary loads leave the ficha without those details", async () => {
    ref.listEnrollments.mockRejectedValue(new Error("403"));
    ref.listPrograms.mockRejectedValue(new Error("403"));
    const [ficha] = await loadFichas();
    expect(ficha).toMatchObject({ name: "2758", totalStudents: 0, avgAttendance: 0, instructor: "Carlos Restrepo" });
});

test("local drafts are appended and keep their own color", async () => {
    readLocalRows.mockResolvedValue([{ id: "f_1_x", code: "LOCAL", color: "#123456" }, { id: 5 }]);
    const list = await loadFichas();
    expect(list.map((f) => f.code)).toEqual(["2758", "SIN-PRG", "LOCAL"]);
    expect(list[2].color).toBe("#123456");
});

test("unreadable local storage is ignored", async () => {
    readLocalRows.mockRejectedValue(new Error("quota"));
    expect(await loadFichas()).toHaveLength(2);
});

test("a backend failure is an error in real mode and falls back to the mocks in mock mode", async () => {
    ref.listCohorts.mockRejectedValue(new Error("503"));
    await expect(loadFichas()).rejects.toThrow("503");
    mockApiMode.value = "mock";
    expect((await loadFichas()).map((f) => f.id)).toEqual(mockFichas.map((f) => f.id));
});

test("an unexpected cohorts payload yields no fichas", async () => {
    ref.listCohorts.mockResolvedValue(null);
    await expect(loadFichas()).resolves.toEqual([]);
});

test("local add, update and delete persist the list, even if storage fails", async () => {
    writeLocalRows.mockRejectedValueOnce(new Error("quota"));
    const added = await addFicha([], { code: "NUEVA" });
    expect(added[0]).toMatchObject({ code: "NUEVA", color: expect.any(String) });
    expect(added[0].id).toMatch(/^f_/);
    const updated = await updateFicha(added, added[0].id, { code: "EDITADA" });
    expect(updated[0].code).toBe("EDITADA");
    expect(await deleteFicha(updated, added[0].id)).toEqual([]);
    expect(writeLocalRows).toHaveBeenCalledTimes(3);
});
