import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("../../context/AuthContext", () => ({
    useAuth: () => ({ user: { academicActorId: 7 } }),
}));
jest.mock("../../services/api/referenceData", () => ({
    listBlocks: jest.fn(),
    cohortActorByPerson: jest.fn().mockResolvedValue(new Map()),
}));
jest.mock("../../services/api/schedulingApi", () => ({
    schedulingApi: {
        listSessions: jest.fn(),
        createSession: jest.fn(),
        openSession: jest.fn(),
        closeSession: jest.fn(),
    },
}));
jest.mock("../../services/api/attendanceApi", () => ({
    attendanceApi: { recordsBySession: jest.fn().mockResolvedValue([]), createRecord: jest.fn() },
}));
jest.mock("../../services/ws/biometricSocket", () => ({ connectBiometricSocket: jest.fn() }));

import { listBlocks, cohortActorByPerson } from "../../services/api/referenceData";
import { schedulingApi } from "../../services/api/schedulingApi";
import { attendanceApi } from "../../services/api/attendanceApi";
import { connectBiometricSocket } from "../../services/ws/biometricSocket";
import { useAttendanceKioskViewModel } from "../useAttendanceKioskViewModel";

function renderHook() {
    let vm;
    function Probe() {
        vm = useAttendanceKioskViewModel();
        return null;
    }
    act(() => { create(<Probe />); });
    return () => vm;
}

beforeEach(() => {
    jest.clearAllMocks();
    cohortActorByPerson.mockResolvedValue(new Map());
    attendanceApi.recordsBySession.mockResolvedValue([]);
    connectBiometricSocket.mockReturnValue({
        send: jest.fn(),
        onAttendanceEvent: jest.fn(() => () => {}),
        onStatusChange: jest.fn(() => () => {}),
        close: jest.fn(),
    });
});

test("todaysBlocks only includes blocks for this instructor on today's ISO weekday", async () => {
    const isoToday = ((new Date().getDay() + 6) % 7) + 1; // getDay(): 0=domingo..6=sábado -> ISO 1..7
    listBlocks.mockResolvedValue([
        { scheduleBlockId: 1, instructorActorId: 7, dayOfWeek: isoToday, cohortId: 10 },
        { scheduleBlockId: 2, instructorActorId: 99, dayOfWeek: isoToday, cohortId: 11 }, // otro profesor
        { scheduleBlockId: 3, instructorActorId: 7, dayOfWeek: isoToday === 1 ? 2 : 1, cohortId: 12 }, // otro día
    ]);
    const getVm = renderHook();

    await act(async () => {}); // deja resolver el efecto de carga

    expect(getVm().todaysBlocks.map((b) => b.scheduleBlockId)).toEqual([1]);
});

test("startClass creates today's session when none exists yet, then opens it", async () => {
    listBlocks.mockResolvedValue([{ scheduleBlockId: 1, instructorActorId: 7, dayOfWeek: ((new Date().getDay() + 6) % 7) + 1, cohortId: 10 }]);
    schedulingApi.listSessions.mockResolvedValue([]); // no hay sesión de hoy todavía
    schedulingApi.createSession.mockResolvedValue({ classSessionId: 55, sessionStatus: "Created" });
    schedulingApi.openSession.mockResolvedValue({ classSessionId: 55, sessionStatus: "Open" });
    const getVm = renderHook();
    await act(async () => {});

    await act(async () => {
        await getVm().startClass(getVm().todaysBlocks[0]);
    });

    expect(schedulingApi.createSession).toHaveBeenCalledWith(
        expect.objectContaining({ scheduleBlockId: 1 })
    );
    expect(schedulingApi.openSession).toHaveBeenCalledWith(55);
    expect(getVm().view).toBe("WAITING");
});

test("startClass reuses today's session and tolerates it already being Open", async () => {
    const today = new Date().toISOString().slice(0, 10);
    listBlocks.mockResolvedValue([{ scheduleBlockId: 1, instructorActorId: 7, dayOfWeek: ((new Date().getDay() + 6) % 7) + 1, cohortId: 10 }]);
    schedulingApi.listSessions.mockResolvedValue([
        { classSessionId: 55, scheduleBlockId: 1, sessionDate: today, sessionStatus: "Open" },
    ]);
    schedulingApi.openSession.mockRejectedValue({ status: 400, message: "ClassSession already Open" });
    const getVm = renderHook();
    await act(async () => {});

    await act(async () => {
        await getVm().startClass(getVm().todaysBlocks[0]);
    });

    expect(schedulingApi.createSession).not.toHaveBeenCalled();
    expect(getVm().view).toBe("WAITING");
    expect(getVm().session.classSessionId).toBe(55);
});

test("endClass closes the session and returns to SELECT_SESSION", async () => {
    const today = new Date().toISOString().slice(0, 10);
    listBlocks.mockResolvedValue([{ scheduleBlockId: 1, instructorActorId: 7, dayOfWeek: ((new Date().getDay() + 6) % 7) + 1, cohortId: 10 }]);
    schedulingApi.listSessions.mockResolvedValue([
        { classSessionId: 55, scheduleBlockId: 1, sessionDate: today, sessionStatus: "Open" },
    ]);
    schedulingApi.openSession.mockResolvedValue({ classSessionId: 55, sessionStatus: "Open" });
    schedulingApi.closeSession.mockResolvedValue({ classSessionId: 55, sessionStatus: "Closed" });
    const getVm = renderHook();
    await act(async () => {});
    await act(async () => { await getVm().startClass(getVm().todaysBlocks[0]); });

    await act(async () => { await getVm().endClass(); });

    expect(schedulingApi.closeSession).toHaveBeenCalledWith(55);
    expect(getVm().view).toBe("SELECT_SESSION");
});

async function startedVm({ enrolledPersonId = "person-a", academicActorId = 1 } = {}) {
    listBlocks.mockResolvedValue([{ scheduleBlockId: 1, instructorActorId: 7, dayOfWeek: ((new Date().getDay() + 6) % 7) + 1, cohortId: 10 }]);
    schedulingApi.listSessions.mockResolvedValue([{ classSessionId: 55, scheduleBlockId: 1, sessionStatus: "Open" }]);
    schedulingApi.openSession.mockResolvedValue({ classSessionId: 55, sessionStatus: "Open" });
    cohortActorByPerson.mockResolvedValue(new Map([[enrolledPersonId, academicActorId]]));
    attendanceApi.recordsBySession.mockResolvedValue([]);
    connectBiometricSocket.mockReturnValue({ send: jest.fn(), onAttendanceEvent: jest.fn(() => () => {}), onStatusChange: jest.fn(() => () => {}), close: jest.fn() });

    const getVm = renderHook();
    await act(async () => {});
    await act(async () => { await getVm().startClass(getVm().todaysBlocks[0]); });
    return getVm;
}

test("a successful identify for an enrolled person creates the attendance record and shows SUCCESS", async () => {
    attendanceApi.createRecord.mockResolvedValue({ attendanceRecordId: 1 });
    const getVm = await startedVm();

    await act(async () => {
        await getVm().onIdentified("person-a", { biometricType: "FACIAL", score: 0.95 });
    });

    expect(attendanceApi.createRecord).toHaveBeenCalledWith({
        classSessionId: 55,
        academicActorId: 1,
        attendanceStatus: "Present",
        captureMethod: "FACIAL",
        matchScore: 0.95,
    });
    expect(getVm().view).toBe("SUCCESS");
});

test("identifying the same person twice in one session shows DUPLICATE without a second HTTP call", async () => {
    attendanceApi.createRecord.mockResolvedValue({ attendanceRecordId: 1 });
    const getVm = await startedVm();
    await act(async () => { await getVm().onIdentified("person-a", { biometricType: "FACIAL", score: 0.95 }); });

    await act(async () => { await getVm().onIdentified("person-a", { biometricType: "FACIAL", score: 0.95 }); });

    expect(attendanceApi.createRecord).toHaveBeenCalledTimes(1);
    expect(getVm().view).toBe("DUPLICATE");
});

test("a 409 from createRecord (race with another kiosk) is treated as DUPLICATE, not ERROR", async () => {
    attendanceApi.createRecord.mockRejectedValue({ status: 409, message: "duplicate" });
    const getVm = await startedVm();

    await act(async () => { await getVm().onIdentified("person-a", { biometricType: "FACIAL", score: 0.95 }); });

    expect(getVm().view).toBe("DUPLICATE");
});

test("a recognized person outside this cohort shows ERROR without creating a record", async () => {
    attendanceApi.createRecord.mockResolvedValue({});
    const getVm = await startedVm({ enrolledPersonId: "person-a" });

    await act(async () => { await getVm().onIdentified("person-outsider", { biometricType: "FACIAL", score: 0.95 }); });

    expect(attendanceApi.createRecord).not.toHaveBeenCalled();
    expect(getVm().view).toBe("ERROR");
});

test("onCaptureError shows ERROR with that message (e.g. no biometric match)", async () => {
    const getVm = await startedVm();

    act(() => { getVm().onCaptureError("no match found"); });

    expect(getVm().view).toBe("ERROR");
    expect(getVm().statusMessage).toBe("no match found");
});

test("a flat attendance.event frame from another kiosk (snake_case person_id, no payload wrapper) adds the resolved academicActorId to registeredActorIds", async () => {
    // No usa startedVm(): necesita capturar el listener pasado a
    // onAttendanceEvent, y startedVm() sobrescribiría este mock con uno
    // genérico al llamar startClass() internamente.
    let attendanceListener;
    connectBiometricSocket.mockReturnValue({
        send: jest.fn(),
        onAttendanceEvent: jest.fn((listener) => {
            attendanceListener = listener;
            return () => {};
        }),
        onStatusChange: jest.fn(() => () => {}),
        close: jest.fn(),
    });
    const today = new Date().toISOString().slice(0, 10);
    listBlocks.mockResolvedValue([
        { scheduleBlockId: 1, instructorActorId: 7, dayOfWeek: ((new Date().getDay() + 6) % 7) + 1, cohortId: 10 },
    ]);
    schedulingApi.listSessions.mockResolvedValue([
        { classSessionId: 55, scheduleBlockId: 1, sessionDate: today, sessionStatus: "Open" },
    ]);
    schedulingApi.openSession.mockResolvedValue({ classSessionId: 55, sessionStatus: "Open" });
    cohortActorByPerson.mockResolvedValue(new Map([["person-a", 1]]));
    attendanceApi.recordsBySession.mockResolvedValue([]);

    const getVm = renderHook();
    await act(async () => {});
    await act(async () => { await getVm().startClass(getVm().todaysBlocks[0]); });

    act(() => {
        attendanceListener({
            type: "attendance.event",
            person_id: "person-a",
            biometric_type: "FACIAL",
            score: 0.93,
            timestamp: "2026-10-13T00:00:00Z",
            correlation_id: "corr-1",
        });
    });

    expect(getVm().registeredActorIds.has(1)).toBe(true);
    expect(attendanceApi.createRecord).not.toHaveBeenCalled();
});
