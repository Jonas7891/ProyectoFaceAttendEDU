globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockUser = { current: null };
jest.mock("../../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser.current }) }));
const mockAppData = { courses: [], students: [] };
jest.mock("../../context/AppDataContext", () => ({ useAppData: () => mockAppData }));
const mockPermissions = { canReviewJustifications: true };
jest.mock("../useRolePermissions", () => ({ useRolePermissions: () => mockPermissions }));
const mockT = (s) => s;
jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({ useTranslation: () => ({ t: mockT }) }));
jest.mock("../../services/api", () => ({
    attendanceApi: {
        listJustificationTypes: jest.fn(),
        listJustifications: jest.fn(),
        recordsBySession: jest.fn(),
        recordsByActor: jest.fn(),
        getRecord: jest.fn(),
    },
    schedulingApi: { listSessions: jest.fn(), listEnvironments: jest.fn() },
}));
jest.mock("../../services/api/justificationNotifications", () => ({ notifyJustificationResult: jest.fn() }));
jest.mock("../../services/api/referenceData", () => ({
    actorMap: jest.fn(),
    personMap: jest.fn(),
    listBlocks: jest.fn(),
    optional: async (promise, fallback) => {
        try {
            return await promise;
        } catch {
            return fallback;
        }
    },
}));

import React from "react";
import { act, create } from "react-test-renderer";
import { attendanceApi, schedulingApi } from "../../services/api";
import { actorMap, listBlocks, personMap } from "../../services/api/referenceData";
import { useJustificationsViewModel } from "../useJustificationsViewModel";

// Forma de GET /justifications y de los registros de asistencia (AUD-47).
const APPROVED = {
    justificationId: 312,
    attendanceRecordId: 80922,
    justificationTypeId: 1,
    reason: "Cita médica",
    submittedAt: "2026-10-20T10:00:00Z",
    reviewStatus: "Approved",
    reviewedAt: "2026-10-21T09:00:00Z",
};
const REJECTED = { ...APPROVED, justificationId: 313, attendanceRecordId: 80923, reviewStatus: "Rejected" };
const FOREIGN = { ...APPROVED, justificationId: 314, attendanceRecordId: 80924 };
const RECORD = { attendanceRecordId: 80922, academicActorId: 1908, classSessionId: 1240, attendanceStatus: "Justified" };
const RECORD_REJECTED = { attendanceRecordId: 80923, academicActorId: 1908, classSessionId: 1240, attendanceStatus: "Absent" };
const RECORD_FOREIGN = { attendanceRecordId: 80924, academicActorId: 999, classSessionId: 1240, attendanceStatus: "Absent" };

async function mountVm() {
    let vm;
    function Probe() {
        vm = useJustificationsViewModel();
        return null;
    }
    await act(async () => {
        create(<Probe />);
    });
    await act(async () => {});
    return () => vm;
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    mockUser.current = { id: "u-5", role: "instructor", academicActorId: 5 };
    mockPermissions.canReviewJustifications = true;
    mockAppData.courses = [{ instructorCohortIds: { 5: [7] } }];
    mockAppData.students = [{ id: 1908, cohortId: 7 }];
    attendanceApi.listJustificationTypes.mockResolvedValue([{ justificationTypeId: 1, name: "Medical leave" }]);
    attendanceApi.listJustifications.mockResolvedValue([APPROVED, REJECTED, FOREIGN]);
    schedulingApi.listEnvironments.mockResolvedValue([]);
    actorMap.mockResolvedValue(new Map());
    personMap.mockResolvedValue(new Map());
    listBlocks.mockResolvedValue([{ scheduleBlockId: 9, instructorActorId: 5 }]);
    attendanceApi.recordsBySession.mockResolvedValue([RECORD, RECORD_REJECTED]);
    attendanceApi.getRecord.mockImplementation(async (id) =>
        [RECORD, RECORD_REJECTED, RECORD_FOREIGN].find((r) => r.attendanceRecordId === id)
    );
});

test("instructor: the Resueltas tab lists Approved and Rejected justifications of their scope", async () => {
    schedulingApi.listSessions.mockResolvedValue([
        { classSessionId: 1240, scheduleBlockId: 9, sessionDate: "2026-10-19" },
    ]);
    const vm = await mountVm();
    await act(async () => vm().setReviewTab("resolved"));
    expect(vm().resolvedCount).toBe(2);
    expect(vm().reviewRows.map((r) => r.justificationId).sort()).toEqual([312, 313]);
    expect(vm().reviewRows.map((r) => r.reviewStatus).sort()).toEqual(["Approved", "Rejected"]);
});

test("instructor: Resueltas still lists the scope's justifications when the sessions list is unavailable (AUD-47)", async () => {
    // Antes de #355 GET /class-sessions devolvía 404; con la lista de sesiones vacía
    // la pantalla descartaba todo el alcance del docente.
    schedulingApi.listSessions.mockRejectedValue(new Error("404"));
    const vm = await mountVm();
    await act(async () => vm().setReviewTab("resolved"));
    expect(vm().reviewRows.map((r) => r.justificationId).sort()).toEqual([312, 313]);
    expect(vm().resolvedCount).toBe(2);
});

test("instructor: the fallback never lists justifications of students outside the scope", async () => {
    schedulingApi.listSessions.mockResolvedValue([]);
    const vm = await mountVm();
    await act(async () => vm().setReviewTab("resolved"));
    expect(vm().reviewRows.map((r) => r.justificationId)).not.toContain(314);
});
