import { buildExportRecords } from "../sections/HistoricalSection";

// The export modal offers "simple" and "detailed" for both Excel and PDF.
// Excel used to ignore the choice and always export the on-screen summary.

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

const t = (key) => key;

const students = [
    {
        id: "s1", name: "Ana", code: "1001", course: "2758",
        attendanceHistory: [
            { date: "2026-10-01", present: true },
            { date: "2026-10-03", present: false },
            { date: "2026-10-02", present: true, late: true, checkInTime: "07:10", checkOutTime: "12:00" },
        ],
    },
    { id: "s2", name: "Luis", code: "1002", course: "2758", attendanceHistory: [{ date: "2026-10-02", present: false }] },
    { id: "s3", name: "Sin historial", code: "1003", course: "2758" },
];
const courses = [{ id: "c1", code: "2758", name: "ADSI", room: "e1" }];
const environments = [{ id: "e1", number: "A-101", schedules: [{ courseCode: "2758", startTime: "07:00", endTime: "12:00" }] }];

const build = (overrides) => buildExportRecords({
    selectedRows: [{ id: "s1" }, { id: "s2" }],
    students, courses, environments, dateRange: {}, exportType: "detailed", t,
    ...overrides,
});

test("detailed exports one row per date with the running percentage, newest first", () => {
    const rows = build().filter((r) => r.studentId === "s1");
    expect(rows.map((r) => r.date)).toEqual(["2026-10-03", "2026-10-02", "2026-10-01"]);
    expect(rows.map((r) => r.attendance)).toEqual([66.7, 100, 100]);
    expect(rows.map((r) => r.totalRecords)).toEqual([3, 2, 1]);
});

test("simple keeps only the most recent row per student", () => {
    const rows = build({ exportType: "simple" });
    expect(rows).toHaveLength(2);
    expect(rows.find((r) => r.studentId === "s1")).toMatchObject({ date: "2026-10-03", attendance: 66.7, status: "absent" });
    expect(rows.find((r) => r.studentId === "s2")).toMatchObject({ date: "2026-10-02", attendance: 0 });
});

test("rows carry the course context and the check-in times", () => {
    const row = build().find((r) => r.id === "s1-2026-10-02");
    expect(row).toMatchObject({
        studentName: "Ana", studentCode: "1001", fichaName: "ADSI", environment: "A-101",
        scheduledStartTime: "07:00", scheduledEndTime: "12:00",
        actualCheckInTime: "07:10", actualCheckOutTime: "12:00", late: true, status: "present",
    });
});

test("the date range applies only when both ends are set", () => {
    const ranged = build({ dateRange: { start: "2026-10-02", end: "2026-10-02" } });
    expect(ranged.map((r) => r.id).sort()).toEqual(["s1-2026-10-02", "s2-2026-10-02"]);
    expect(build({ dateRange: { start: "2026-10-02" } })).toHaveLength(4);
});

test("students without history or missing from the list yield no rows", () => {
    expect(build({ selectedRows: [{ id: "s3" }, { id: "unknown" }] })).toEqual([]);
});

test("duplicated selections of the same student are exported once", () => {
    expect(build({ selectedRows: [{ id: "s2" }, { studentId: "s2", id: "s2-row" }] })).toHaveLength(1);
});
