// Courses are assembled from courses + schedule blocks + enrollments + actors +
// persons + environments + cohorts + the attendance summary.
const mockApiMode = { value: "real" };
jest.mock("../../../config/env", () => ({ get API_MODE() { return mockApiMode.value; } }));
jest.mock("../localCache", () => ({ readLocalRows: jest.fn(async () => []), writeLocalRows: jest.fn(async () => {}) }));
jest.mock("../../../services/api/referenceData", () => ({
    ...jest.requireActual("../../../services/api/referenceData"),
    listCourses: jest.fn(), listBlocks: jest.fn(), listEnrollments: jest.fn(), listEnvironments: jest.fn(),
    listCohorts: jest.fn(), actorMap: jest.fn(), personMap: jest.fn(), attendanceSummaryFor: jest.fn(),
}));

import * as ref from "../../../services/api/referenceData";
import { readLocalRows, writeLocalRows } from "../localCache";
import { loadCourses, addCourse, updateCourse, deleteCourse } from "../CourseStorage";
import { mockCourses } from "../mockData";

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockApiMode.value = "real";
    readLocalRows.mockResolvedValue([]);
    ref.listCourses.mockResolvedValue([
        { courseId: 1, programId: 9, code: "PRG-1", name: "Programación", status: true, creditHours: 4 },
        { courseId: 2, code: "BD-1", name: "Bases de datos", status: false },
    ]);
    ref.listBlocks.mockResolvedValue([
        { courseId: 1, cohortId: 10, instructorActorId: 100, dayOfWeek: 1, environmentId: 5 },
        { courseId: 1, cohortId: 11, instructorActorId: 101, dayOfWeek: 3, environmentId: 5 },
        { courseId: 1, cohortId: 12, instructorActorId: 100, dayOfWeek: 1, environmentId: 5 }, // closed cohort
    ]);
    ref.listCohorts.mockResolvedValue([{ cohortId: 10 }, { cohortId: 11 }, { cohortId: 12, status: false }]);
    ref.listEnrollments.mockResolvedValue([
        { cohortId: 10, academicActorId: 1, enrollmentStatus: "Active" },
        { cohortId: 10, academicActorId: 2, enrollmentStatus: "ACTIVE" },
        { cohortId: 11, academicActorId: 2, enrollmentStatus: "Active" }, // same student, counted once
        { cohortId: 11, academicActorId: 3, enrollmentStatus: "Withdrawn" },
        { cohortId: 12, academicActorId: 4, enrollmentStatus: "Active" },
    ]);
    ref.actorMap.mockResolvedValue(new Map([[100, { personId: "p100" }], [101, { personId: "p101" }]]));
    ref.personMap.mockResolvedValue(new Map([["p100", { name: "Carlos", lastName: "Restrepo" }], ["p101", { name: "Ana", lastName: "Ruiz" }]]));
    ref.listEnvironments.mockResolvedValue([{ environmentId: 5, code: "A-101" }]);
    ref.attendanceSummaryFor.mockResolvedValue(new Map([
        [1, { present: 8, late: 1, justified: 1, total: 10 }],
        [2, { present: 3, late: 0, justified: 0, total: 6 }],
    ]));
});
afterEach(() => console.warn.mockRestore());

test("a course gathers its students, teachers, days, room and average attendance", async () => {
    const [course, inactive] = await loadCourses();
    expect(course).toMatchObject({
        id: "1", programId: 9, code: "PRG-1", name: "Programación",
        professor: "Carlos Restrepo, Ana Ruiz",
        instructorActorIds: [100, 101],
        instructorCohortIds: { 100: ["10", "12"], 101: ["11"] },
        students: 2, // active enrollments of open cohorts, each student once
        schedule: "Lun, Mié",
        room: "A-101",
        avgAttendance: 75, // (100 % + 50 %) / 2
        status: "active",
        creditHours: 4,
        startDate: null,
    });
    expect(inactive).toMatchObject({ id: "2", professor: null, students: 0, schedule: null, room: null, avgAttendance: 0, status: "inactive" });
});

test("secondary loads that fail fall back to empty data instead of breaking the list", async () => {
    ref.listEnrollments.mockRejectedValue(new Error("403"));
    ref.attendanceSummaryFor.mockRejectedValue(new Error("timeout"));
    ref.personMap.mockRejectedValue(new Error("403"));
    const [course] = await loadCourses();
    expect(course).toMatchObject({ students: 0, professor: null, avgAttendance: 0, instructorActorIds: [100, 101] });
});

test("local drafts are appended; rows that are not local drafts are ignored", async () => {
    readLocalRows.mockResolvedValue([{ id: "course_1_x", name: "Borrador" }, { id: 7, name: "Ajeno" }]);
    const list = await loadCourses();
    expect(list.map((c) => c.name)).toEqual(["Programación", "Bases de datos", "Borrador"]);
});

test("a backend failure is an error in real mode and falls back to the mocks in mock mode", async () => {
    ref.listCourses.mockRejectedValue(new Error("503"));
    await expect(loadCourses()).rejects.toThrow("503");
    mockApiMode.value = "mock";
    await expect(loadCourses()).resolves.toEqual(mockCourses);
});

test("an unexpected courses payload yields no courses", async () => {
    ref.listCourses.mockResolvedValue({ error: "unexpected" });
    await expect(loadCourses()).resolves.toEqual([]);
});

test("local add, update and delete persist the list", async () => {
    const added = await addCourse([], { name: "Nuevo" });
    expect(added[0]).toMatchObject({ name: "Nuevo", avgAttendance: 0, students: 0, status: "active" });
    expect(added[0].id).toMatch(/^course_/);
    const updated = await updateCourse(added, added[0].id, { name: "Editado" });
    expect(updated[0].name).toBe("Editado");
    expect(await deleteCourse(updated, added[0].id)).toEqual([]);
    expect(writeLocalRows).toHaveBeenCalledTimes(3);
});
