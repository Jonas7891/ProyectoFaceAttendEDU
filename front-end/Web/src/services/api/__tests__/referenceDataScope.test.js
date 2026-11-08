jest.mock("../../../api/apiClient", () => ({ fetchAllPages: jest.fn(), request: jest.fn() }));
import { fetchAllPages, request } from "../../../api/apiClient";
import {
    optional, resetReferenceData, setActiveSchool, getActiveSchool, setUsersListAllowed,
    listUsers, listPersons, listActors, listCourses, listCohorts, listEnrollments, listBlocks,
    listEnvironments, listActorTypes, rolesForUser, rolesForUsers, attendanceSummaryFor,
    personMap, userByPersonMap, programMap, cohortMap, actorTypeMap, instructorCourseNamesByPerson,
    fullName, normalizeStatus, hhmm, dayLabel,
} from "../referenceData";

// Fake backend: one array per collection path, keyed by the end of the URL.
const DATA = {
    "/api/v1/schools/7/programs": [{ programId: 1 }, { programId: 2 }],
    "/api/v1/programs/1/courses": [{ courseId: 11, name: "ADSI" }],
    "/api/v1/programs/2/courses": [{ courseId: 12, name: "Redes" }],
    "/api/v1/programs/1/cohorts": [{ cohortId: 21 }],
    "/api/v1/programs/2/cohorts": [{ cohortId: 22 }],
    "/api/v1/cohorts/21/enrollments": [{ cohortId: 21, academicActorId: 31 }],
    "/api/v1/cohorts/22/enrollments": [{ cohortId: 22, academicActorId: 32 }],
    "/api/v1/schedule-blocks": [
        { cohortId: 21, courseId: 11, instructorActorId: 40 },
        { cohortId: 21, courseId: 12, instructorActorId: 40 },
        { cohortId: 99, courseId: 11, instructorActorId: 41 },
    ],
    "/api/v1/schools/7/actors": [{ academicActorId: 40, personId: "p-40" }],
    "/api/v1/academic-actors": [{ academicActorId: 50, personId: "p-50" }],
    "/api/v1/courses": [{ courseId: 13 }],
    "/api/v1/cohorts": [{ cohortId: 23 }],
    "/api/v1/enrollments": [{ cohortId: 23 }],
    "/api/v1/users": [{ userId: "u-1", personId: "p-40" }],
    "/api/v1/persons": [{ personId: "p-40", name: "Ana" }],
    "/api/v1/actor-types": [{ actorTypeId: 1, name: "Aprendiz" }],
};

beforeEach(() => {
    resetReferenceData();
    setActiveSchool(null);
    setUsersListAllowed(false);
    fetchAllPages.mockReset().mockImplementation(async (path) => DATA[path] ?? []);
    request.mockReset();
    jest.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => console.warn.mockRestore());

test("a school scope loads courses, cohorts and enrollments through the school's programs", async () => {
    setActiveSchool(7);
    expect(getActiveSchool()).toBe(7);
    expect((await listCourses()).map((c) => c.name)).toEqual(["ADSI", "Redes"]);
    expect((await listCohorts()).map((c) => c.cohortId)).toEqual([21, 22]);
    expect((await listEnrollments()).map((e) => e.academicActorId)).toEqual([31, 32]);
    expect(await listActors()).toEqual(DATA["/api/v1/schools/7/actors"]);
});

test("without a school every collection comes from the global routes", async () => {
    expect(await listCourses()).toEqual([{ courseId: 13 }]);
    expect(await listCohorts()).toEqual([{ cohortId: 23 }]);
    expect(await listEnrollments()).toEqual([{ cohortId: 23 }]);
    expect(await listActors()).toEqual(DATA["/api/v1/academic-actors"]);
    expect(await listBlocks()).toHaveLength(3);
});

test("schedule blocks are limited to the cohorts of the active school", async () => {
    setActiveSchool(7);
    expect((await listBlocks()).map((b) => b.cohortId)).toEqual([21, 21]);
});

test("collections are requested once per session and a failure is not cached", async () => {
    await listCourses();
    await listCourses();
    expect(fetchAllPages).toHaveBeenCalledTimes(1);

    fetchAllPages.mockRejectedValueOnce(new Error("503"));
    await expect(listPersons()).rejects.toThrow("503");
    expect(await listPersons()).toEqual(DATA["/api/v1/persons"]);
});

test("changing school clears the cache; setting the same school keeps it", async () => {
    await listCourses();
    setActiveSchool(null);
    await listCourses();
    setActiveSchool(7);
    await listCourses();
    expect(fetchAllPages.mock.calls.map(([p]) => p)).toEqual([
        "/api/v1/courses", "/api/v1/schools/7/programs", "/api/v1/programs/1/courses", "/api/v1/programs/2/courses",
    ]);
});

test("/users is only requested when the role may list users", async () => {
    expect(await listUsers()).toEqual([]);
    expect(fetchAllPages).not.toHaveBeenCalled();
    setUsersListAllowed(true);
    expect((await userByPersonMap()).get("p-40")).toEqual({ userId: "u-1", personId: "p-40" });
});

test("environments are filtered by school on the server", async () => {
    request.mockResolvedValue([]);
    await listEnvironments();
    setActiveSchool(7);
    await listEnvironments();
    expect(request.mock.calls.map(([, o]) => o.query)).toEqual([undefined, { schoolId: 7 }]);
});

test("roles and attendance summaries are batched by 200 ids", async () => {
    const ids = Array.from({ length: 250 }, (_, i) => i + 1);
    request.mockImplementation(async (_url, { query }) => {
        const key = query.userIds ?? query.academicActorIds;
        return Object.fromEntries(key.split(",").map((id) => [id, [{ roleName: "Aprendiz" }]]));
    });
    const roles = await rolesForUsers(ids.map(String));
    const summary = await attendanceSummaryFor(ids);
    expect(request).toHaveBeenCalledTimes(4);
    expect(roles.size).toBe(250);
    expect(summary.get(250)).toEqual([{ roleName: "Aprendiz" }]);

    request.mockResolvedValue([{ roleName: "Instructor" }]);
    expect(await rolesForUser("u-1")).toEqual([{ roleName: "Instructor" }]);
});

test("lookup maps are keyed by id", async () => {
    setActiveSchool(7);
    expect((await personMap()).get("p-40").name).toBe("Ana");
    expect([...(await programMap()).keys()]).toEqual([1, 2]);
    expect([...(await cohortMap()).keys()]).toEqual([21, 22]);
    expect((await actorTypeMap()).get(1).name).toBe("Aprendiz");
    expect(await listActorTypes()).toHaveLength(1);
});

test("instructor courses are derived from the blocks without duplicates", async () => {
    setActiveSchool(7);
    expect((await instructorCourseNamesByPerson()).get("p-40")).toEqual(["ADSI", "Redes"]);
});

test("optional returns the fallback and logs when a secondary load fails", async () => {
    await expect(optional(Promise.reject(new Error("403")), [])).resolves.toEqual([]);
    expect(console.warn).toHaveBeenCalled();
    await expect(optional(Promise.resolve([1]), [])).resolves.toEqual([1]);
});

test("format helpers", () => {
    expect(fullName({ name: "Ana", lastName: "Ruiz" })).toBe("Ana Ruiz");
    expect(fullName({ name: "Ana" })).toBe("Ana");
    expect(fullName(null)).toBe("");
    expect(normalizeStatus(false)).toBe("inactive");
    expect(normalizeStatus("Active")).toBe("active");
    expect(normalizeStatus(undefined)).toBe("active");
    expect(hhmm("08:00:00")).toBe("08:00");
    expect(hhmm(null)).toBe("");
    expect(dayLabel(3)).toBe("Mié");
    expect(dayLabel("x")).toBe("Lun");
    expect(dayLabel(9)).toBe("");
});
