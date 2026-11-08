import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockAuth = { user: null, isLoadingAuth: false };
jest.mock("../AuthContext", () => ({ useAuth: () => mockAuth }));
jest.mock("../../services/api/biometricCaptureApi", () => ({ biometricCaptureApi: { summaryAll: jest.fn() } }));
jest.mock("../../services/api/settingsPersistence", () => ({ syncInstitutionConfigFromBackend: jest.fn(() => Promise.resolve()) }));
jest.mock("../../services/api/referenceData", () => ({
    resetReferenceData: jest.fn(), setActiveSchool: jest.fn(), setUsersListAllowed: jest.fn(),
}));
jest.mock("../../models/data/localCache", () => ({
    clearDomainCache: jest.fn(() => Promise.resolve()),
    purgeForeignDomainCache: jest.fn(() => Promise.resolve()),
    setCacheScope: jest.fn(),
}));
jest.mock("../../core/utils/biometricFlags", () => ({
    loadBiometricFlags: jest.fn(() => Promise.resolve(null)),
    withBiometricFlags: (rows) => rows,
}));
// Every storage call resolves to the list it was given plus a marker, so the
// test can tell that the context stored what the storage returned.
function mockStore(...names) {
    return Object.fromEntries(names.map((n) => [n, jest.fn(async (list = []) => [...list, { id: `${n}-result` }])]));
}
jest.mock("../../models/data/StudentStorage", () => ({ loadStudents: jest.fn(), saveStudents: jest.fn(async () => {}), ...mockStore("addStudent", "addStudentsBulk") }));
jest.mock("../../models/data/UserStorage", () => ({ loadUsers: jest.fn(), ...mockStore("addUser", "updateUser", "deleteUser") }));
jest.mock("../../models/data/EnvironmentStorage", () => ({
    loadEnvironments: jest.fn(),
    ...mockStore("addEnvironment", "updateEnvironment", "deleteEnvironment", "addScheduleToEnvironment", "updateSchedule", "deleteSchedule"),
}));
jest.mock("../../models/data/FichaStorage", () => ({ loadFichas: jest.fn(), ...mockStore("addFicha", "updateFicha", "deleteFicha") }));
jest.mock("../../models/data/CourseStorage", () => ({ loadCourses: jest.fn(), ...mockStore("addCourse", "updateCourse", "deleteCourse") }));

import { AppDataProvider, useAppData } from "../AppDataContext";
import { loadStudents, saveStudents } from "../../models/data/StudentStorage";
import { loadUsers } from "../../models/data/UserStorage";
import { loadEnvironments } from "../../models/data/EnvironmentStorage";
import { loadFichas } from "../../models/data/FichaStorage";
import { loadCourses } from "../../models/data/CourseStorage";
import { resetReferenceData, setActiveSchool, setUsersListAllowed } from "../../services/api/referenceData";
import { clearDomainCache, setCacheScope } from "../../models/data/localCache";

const courses = [
    { id: 1, code: "2758", name: "ADSI", startDate: "2026-01-19", endDate: "2027-06-30" },
    { id: 2, code: "2760", name: "Redes", startDate: "2026-01-19", endDate: "2027-06-30" },
];
const students = [
    { id: "s1", courseId: "1", course: "2758", attendance: 80, status: "active", personId: "p1" },
    { id: "s2", courseId: "1", course: "2758", attendance: 60, status: "inactive", personId: "p2" },
    { id: "s3", courseId: "2", course: "2760", attendance: null, status: "active", personId: "p3" },
];
const users = [{ id: "t1", role: "teacher", personId: "p9" }, { id: "a1", role: "admin" }];

let ctx;
function Probe() { ctx = useAppData(); return null; }

async function mount() {
    let root;
    await act(async () => { root = create(<AppDataProvider><Probe /></AppDataProvider>); });
    // Let the base loads settle, then run the progressive reveal to the end.
    await act(async () => { await Promise.resolve(); });
    await act(async () => { jest.advanceTimersByTime(5000); });
    return root;
}

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockAuth.user = { id: "u-1", role: "admin", schoolId: 7, roles: ["Administrador"] };
    mockAuth.isLoadingAuth = false;
    loadUsers.mockResolvedValue(users);
    loadEnvironments.mockResolvedValue([{ id: "e1" }]);
    loadFichas.mockResolvedValue([{ id: "f1" }]);
    loadCourses.mockResolvedValue(courses);
    loadStudents.mockResolvedValue(students);
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

test("useAppData outside the provider throws a clear error", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => act(() => { create(<Probe />); })).toThrow(/AppDataProvider/);
});

test("without a session it clears the caches and requests nothing", async () => {
    mockAuth.user = null;
    await mount();
    expect(resetReferenceData).toHaveBeenCalled();
    expect(setCacheScope).toHaveBeenCalledWith(null);
    expect(clearDomainCache).toHaveBeenCalled();
    expect(loadCourses).not.toHaveBeenCalled();
});

test("an admin session scopes to the school and reveals students, teachers and admins", async () => {
    await mount();
    expect(setActiveSchool).toHaveBeenCalledWith(7);
    expect(setCacheScope).toHaveBeenCalledWith({ userId: "u-1", schoolId: 7 });
    expect(setUsersListAllowed).toHaveBeenCalledWith(true);
    expect(loadUsers).toHaveBeenCalledWith({ includeUnassigned: false });
    expect(ctx.isLoading).toBe(false);
    expect(ctx.loadError).toBeNull();
    expect(ctx.students.map((s) => s.id)).toEqual(["s1", "s2", "s3"]);
    expect(ctx.teachers).toEqual([expect.objectContaining({ id: "t1", grade: "Docente", attendance: null })]);
    expect(ctx.admins).toEqual([expect.objectContaining({ id: "a1", grade: "Administrador" })]);
    expect(ctx.courses[0]).toHaveProperty("currentPeriod");
    expect(ctx.environments).toEqual([{ id: "e1" }]);
});

test("programs group students by course id and ignore students without records", async () => {
    await mount();
    expect(ctx.programs).toEqual([
        { name: "ADSI", code: "2758", studentCount: 2, avgAttendance: 70, activeCount: 1 },
        { name: "Redes", code: "2760", studentCount: 1, avgAttendance: null, activeCount: 1 },
    ]);
});

test("teachers and students never request /users", async () => {
    mockAuth.user = { id: "u-2", role: "teacher", schoolId: 7 };
    await mount();
    expect(loadUsers).not.toHaveBeenCalled();
    expect(setUsersListAllowed).toHaveBeenCalledWith(false);
    expect(ctx.teachers).toEqual([]);
    expect(ctx.students).toHaveLength(3);
});

test("one failed load keeps the others and reports the error", async () => {
    loadFichas.mockRejectedValue(new Error("cohorts unavailable"));
    await mount();
    expect(ctx.loadError).toBe("cohorts unavailable");
    expect(ctx.fichas).toEqual([]);
    expect(ctx.environments).toEqual([{ id: "e1" }]);
});

test("a failed student load is reported without hiding staff", async () => {
    loadStudents.mockRejectedValue(new Error("attendance summary timeout"));
    await mount();
    expect(ctx.loadError).toBe("attendance summary timeout");
    expect(ctx.teachers).toHaveLength(1);
});

test("nothing loads while the saved session is still being restored", async () => {
    mockAuth.isLoadingAuth = true;
    await mount();
    expect(loadCourses).not.toHaveBeenCalled();
    expect(resetReferenceData).not.toHaveBeenCalled();
});

test("environment, schedule, ficha, course and user mutations keep what the storage returns", async () => {
    await mount();
    const cases = [
        ["addEnvironment", ["draft"], "environments"], ["updateEnvironment", ["e1", {}], "environments"],
        ["removeEnvironment", ["e1"], "environments"], ["addSchedule", ["e1", {}], "environments"],
        ["updateSchedule", ["e1", "h1", {}], "environments"], ["removeSchedule", ["e1", "h1"], "environments"],
        ["addFicha", [{}], "fichas"], ["updateFicha", ["f1", {}], "fichas"], ["removeFicha", ["f1"], "fichas"],
        ["addCourse", [{}], "courses"], ["updateCourse", [1, {}], "courses"], ["removeCourse", [1], "courses"],
        ["addUser", [{}], "users"], ["updateUser", ["t1", {}], "users"], ["removeUser", ["t1"], "users"],
    ];
    for (const [fn, args, list] of cases) {
        await act(async () => { await ctx[fn](...args); });
        expect(ctx[list][ctx[list].length - 1].id).toMatch(/-result$/);
    }
});

test("student mutations update the visible list", async () => {
    await mount();
    await act(async () => { await ctx.updateStudent("s1", { attendance: 95 }); });
    expect(saveStudents).toHaveBeenCalled();
    expect(ctx.students.find((s) => s.id === "s1").attendance).toBe(95);

    await act(async () => { await ctx.removeStudent("s2"); });
    expect(ctx.students.map((s) => s.id)).not.toContain("s2");

    await act(async () => { await ctx.addStudent({ course: "2758" }); });
    expect(ctx.students[ctx.students.length - 1].id).toBe("addStudent-result");

    let imported;
    await act(async () => { imported = await ctx.importStudents([]); });
    expect(imported).toBe(0);
    await act(async () => { imported = await ctx.importStudents([{}, {}]); });
    expect(imported).toBe(2);
});

test("reloads fetch fresh data and patches change only the matching rows", async () => {
    await mount();
    loadCourses.mockResolvedValue([courses[0]]);
    await act(async () => { await ctx.reloadCourses(); });
    expect(ctx.courses).toHaveLength(1);

    loadUsers.mockResolvedValue([{ id: "t2", role: "teacher" }]);
    loadStudents.mockResolvedValue([students[0]]);
    // Separate renders, as in the app: each reload reads the lists of the last render.
    await act(async () => { await ctx.reloadUsers(); });
    await act(async () => { await ctx.reloadStudents(); });
    await act(async () => { jest.advanceTimersByTime(5000); });
    expect(ctx.teachers.map((t) => t.id)).toEqual(["t2"]);
    expect(ctx.students.map((s) => s.id)).toEqual(["s1"]);

    act(() => { ctx.patchStaff("teacher", "t2", { name: "Ana" }); });
    act(() => { ctx.patchStaff("student", "s1", { name: "Luis" }); });
    act(() => { ctx.patchBiometrics("p1", { hasFacial: true }); });
    act(() => { ctx.patchBiometrics(null, { hasFacial: true }); });
    expect(ctx.teachers[0].name).toBe("Ana");
    expect(ctx.students[0]).toMatchObject({ name: "Luis", hasFacial: true });
});
