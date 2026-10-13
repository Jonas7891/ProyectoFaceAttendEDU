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

import { listBlocks } from "../../services/api/referenceData";
import { schedulingApi } from "../../services/api/schedulingApi";
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

beforeEach(() => jest.clearAllMocks());

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
    listBlocks.mockResolvedValue([{ scheduleBlockId: 1, instructorActorId: 7, dayOfWeek: 1, cohortId: 10 }]);
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
    listBlocks.mockResolvedValue([{ scheduleBlockId: 1, instructorActorId: 7, dayOfWeek: 1, cohortId: 10 }]);
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
    listBlocks.mockResolvedValue([{ scheduleBlockId: 1, instructorActorId: 7, dayOfWeek: 1, cohortId: 10 }]);
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
