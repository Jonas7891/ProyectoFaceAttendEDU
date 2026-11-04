jest.mock("../../../api/apiClient", () => ({
    fetchAllPages: jest.fn(),
}));
jest.mock("../attendanceApi", () => ({
    attendanceApi: { recordsBySession: jest.fn(), recordsByActor: jest.fn() },
}));
jest.mock("../referenceData", () => ({
    actorMap: jest.fn(),
    courseMap: jest.fn(),
    listActors: jest.fn(),
    listBlocks: jest.fn(),
    personMap: jest.fn(),
}));

import { fetchAllPages } from "../../../api/apiClient";
import { attendanceApi } from "../attendanceApi";
import { actorMap, courseMap, listBlocks, personMap } from "../referenceData";
import { dashboardSeries, recentActivity } from "../dashboardSeries";

function isoDaysAgo(n) {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return date.toISOString().slice(0, 10);
}

beforeEach(() => {
    jest.clearAllMocks();
    listBlocks.mockResolvedValue([
        { scheduleBlockId: 501, courseId: 12, instructorActorId: 601 },
    ]);
});

test("builds daily buckets from session records", async () => {
    fetchAllPages.mockResolvedValue([
        { classSessionId: 1, scheduleBlockId: 501, sessionDate: isoDaysAgo(1) },
        { classSessionId: 2, scheduleBlockId: 501, sessionDate: isoDaysAgo(2) },
    ]);
    attendanceApi.recordsBySession.mockImplementation(async (id) =>
        id === 1
            ? [
                  { attendanceRecordId: 1, attendanceStatus: "Present" },
                  { attendanceRecordId: 2, attendanceStatus: "Late" },
                  { attendanceRecordId: 3, attendanceStatus: "Absent" },
              ]
            : [{ attendanceRecordId: 4, attendanceStatus: "Justified" }]
    );

    const { daily, weekly } = await dashboardSeries({ role: "admin" });

    expect(daily).toHaveLength(2);
    expect(daily[0]).toMatchObject({ present: 1, late: 0, absent: 0 });
    expect(daily[1]).toMatchObject({ present: 1, late: 1, absent: 1 });
    expect(weekly.length).toBeGreaterThan(0);
    expect(weekly[0].week).toMatch(/^Sem \d+$/);
    expect(weekly[0]).toHaveProperty("rate");
    // Los días pueden caer en semanas distintas según el día de la semana en que corra el test.
    const dailyInWeeks = weekly.reduce((sum, w) => sum + w.dailyData.length, 0);
    expect(dailyInWeeks).toBe(daily.length);
});

test("teacher scope keeps only their blocks", async () => {
    fetchAllPages.mockResolvedValue([
        { classSessionId: 1, scheduleBlockId: 501, sessionDate: isoDaysAgo(1) },
        { classSessionId: 2, scheduleBlockId: 999, sessionDate: isoDaysAgo(1) },
    ]);
    attendanceApi.recordsBySession.mockResolvedValue([
        { attendanceRecordId: 1, attendanceStatus: "Present" },
    ]);

    const { daily } = await dashboardSeries({ role: "teacher", instructorActorId: 601 });

    // Una sola sesión (la del bloque propio) aporta registros.
    const total = daily.reduce((sum, d) => sum + d.present, 0);
    expect(total).toBe(1);
    expect(attendanceApi.recordsBySession).toHaveBeenCalledTimes(1);
});

test("student scope buckets their own records by date", async () => {
    attendanceApi.recordsByActor.mockResolvedValue([
        { attendanceRecordId: 1, attendanceStatus: "Present", capturedAt: `${isoDaysAgo(1)}T08:00:00Z` },
        { attendanceRecordId: 2, attendanceStatus: "Absent", capturedAt: `${isoDaysAgo(3)}T08:00:00Z` },
    ]);

    const { daily } = await dashboardSeries({ role: "student", academicActorId: 77 });

    expect(attendanceApi.recordsByActor).toHaveBeenCalledWith(77);
    expect(daily).toHaveLength(2);
    // Las sesiones solo alimentan la meta (clases de hoy de su ficha).
    expect(fetchAllPages).toHaveBeenCalled();
});

// AUD-52: el único registro del alumno (Justified, MANUAL) llega sin captured_at; se descartaba y
// la semana quedaba vacía con tasa 0 % mientras la tarjeta decía 100 %. Se ubica por la fecha de
// su sesión.
test("student record without capturedAt falls back to its session date", async () => {
    listBlocks.mockResolvedValue([{ scheduleBlockId: 501, courseId: 12, cohortId: 53, instructorActorId: 601 }]);
    fetchAllPages.mockResolvedValue([{ classSessionId: 1240, scheduleBlockId: 501, sessionDate: "2026-10-27" }]);
    attendanceApi.recordsByActor.mockResolvedValue([
        { attendanceRecordId: 80922, classSessionId: 1240, attendanceStatus: "Justified", capturedAt: null },
    ]);

    const { daily, weekly } = await dashboardSeries({ role: "student", academicActorId: 1908, cohortId: 53 });

    expect(daily).toEqual([{ date: "2026-10-27", day: "Mar", present: 1, late: 0, absent: 0 }]);
    expect(weekly).toHaveLength(1);
    expect(weekly[0].rate).toBe(100);
});

// Una clase nocturna (22:00 en Colombia) se captura ya en el día siguiente en UTC: el registro debe quedar en
// el día de su sesión (martes), no en el de captured_at (miércoles).
test("student record is placed on its session date, not on the UTC date of capturedAt", async () => {
    listBlocks.mockResolvedValue([{ scheduleBlockId: 501, courseId: 12, cohortId: 53, instructorActorId: 601 }]);
    fetchAllPages.mockResolvedValue([{ classSessionId: 1242, scheduleBlockId: 501, sessionDate: "2026-11-03" }]);
    attendanceApi.recordsByActor.mockResolvedValue([
        { attendanceRecordId: 80924, classSessionId: 1242, attendanceStatus: "Late", capturedAt: "2026-11-04T03:01:31Z" },
    ]);

    const { daily } = await dashboardSeries({ role: "student", academicActorId: 1920, cohortId: 53 });

    expect(daily).toEqual([{ date: "2026-11-03", day: "Mar", present: 0, late: 1, absent: 0 }]);
});

test("student series keeps the most recent days, not the oldest", async () => {
    fetchAllPages.mockResolvedValue([]);
    attendanceApi.recordsByActor.mockResolvedValue(
        Array.from({ length: 35 }, (_, i) => ({
            attendanceRecordId: i + 1,
            attendanceStatus: "Present",
            capturedAt: `${isoDaysAgo(i + 1)}T08:00:00Z`,
        }))
    );

    const { daily } = await dashboardSeries({ role: "student", academicActorId: 1 });

    expect(daily).toHaveLength(30);
    expect(daily[daily.length - 1].date).toBe(isoDaysAgo(1));
});

test("a record with neither capturedAt nor a known session is not plotted", async () => {
    fetchAllPages.mockResolvedValue([]);
    attendanceApi.recordsByActor.mockResolvedValue([
        { attendanceRecordId: 1, classSessionId: 999, attendanceStatus: "Present", capturedAt: null },
    ]);

    const { daily } = await dashboardSeries({ role: "student", academicActorId: 1 });

    expect(daily).toEqual([]);
});

// La fila «Sem N» del selector del dashboard numera desde el 1 de enero (semanas de 7 días); la
// serie debe usar la misma numeración o los datos caen en otra fila.
test("week labels use the same numbering as the dashboard week selector", async () => {
    fetchAllPages.mockResolvedValue([{ classSessionId: 1, scheduleBlockId: 501, sessionDate: "2026-10-27" }]);
    attendanceApi.recordsBySession.mockResolvedValue([{ attendanceRecordId: 1, attendanceStatus: "Present" }]);

    const { weekly } = await dashboardSeries({ role: "admin" });

    // 27-oct-2026 = día 300 del año → floor(299 / 7) + 1 = 43
    expect(weekly[0].week).toBe("Sem 43");
});

test("recent activity joins actor, person and course", async () => {
    fetchAllPages.mockResolvedValue([
        { classSessionId: 1, scheduleBlockId: 501, sessionDate: isoDaysAgo(0) },
    ]);
    attendanceApi.recordsBySession.mockResolvedValue([
        {
            attendanceRecordId: 10,
            academicActorId: 601,
            attendanceStatus: "Late",
            capturedAt: new Date(Date.now() - 5 * 60000).toISOString(),
        },
    ]);
    actorMap.mockResolvedValue(new Map([[601, { academicActorId: 601, personId: "p-1" }]]));
    personMap.mockResolvedValue(new Map([["p-1", { personId: "p-1", name: "Ana", lastName: "López" }]]));
    courseMap.mockResolvedValue(new Map([[12, { courseId: 12, code: "MAT" }]]));

    const items = await recentActivity({ limit: 5 });

    expect(items).toEqual([
        { id: "10", status: "late", student: "Ana López", course: "MAT", time: "Hace 5 min" },
    ]);
});

test("fetches every session in scope", async () => {
    const sessions = Array.from({ length: 10 }, (_, i) => ({
        classSessionId: 100 + i,
        scheduleBlockId: 501,
        sessionDate: isoDaysAgo(i + 1),
    }));
    fetchAllPages.mockResolvedValue(sessions);
    attendanceApi.recordsBySession.mockResolvedValue([
        { attendanceRecordId: 1, attendanceStatus: "Present" },
    ]);

    const { daily } = await dashboardSeries({ role: "admin" });

    expect(attendanceApi.recordsBySession).toHaveBeenCalledTimes(10);
    expect(daily).toHaveLength(10);
});

test("empty backend means empty series, never invented figures", async () => {
    fetchAllPages.mockResolvedValue([]);
    attendanceApi.recordsByActor.mockResolvedValue([]);

    const admin = await dashboardSeries({ role: "admin" });
    const student = await dashboardSeries({ role: "student", academicActorId: 1 });

    expect(admin.daily).toEqual([]);
    expect(admin.weekly).toEqual([]);
    expect(admin.meta).toEqual({ sessionsToday: 0, sessionsClosedToday: 0 });
    expect(student.daily).toEqual([]);
    await expect(recentActivity()).resolves.toEqual([]);
});
