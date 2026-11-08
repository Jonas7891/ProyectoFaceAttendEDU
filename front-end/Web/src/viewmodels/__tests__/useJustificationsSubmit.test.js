// Student side of justifications: eligible records, submit with its document
// rules (PDF/JPG/JPEG/PNG, 5 MB), the partial failure when the upload fails,
// and withdrawing a pending one.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockUser = { current: null };
jest.mock("../../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser.current }) }));
jest.mock("../../context/AppDataContext", () => ({ useAppData: () => ({ courses: [], students: [] }) }));
jest.mock("../useRolePermissions", () => ({ useRolePermissions: () => ({ canReviewJustifications: false }) }));
jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({ useTranslation: () => ({ t: (s) => s }) }));
jest.mock("../../services/api", () => ({
    attendanceApi: {
        listJustificationTypes: jest.fn(), listJustifications: jest.fn(), recordsByActor: jest.fn(),
        createJustification: jest.fn(), uploadJustificationDocument: jest.fn(), deleteJustification: jest.fn(),
    },
    schedulingApi: { listSessions: jest.fn(), listEnvironments: jest.fn() },
}));
jest.mock("../../services/api/justificationNotifications", () => ({ notifyJustificationResult: jest.fn() }));
jest.mock("../../services/api/referenceData", () => ({
    actorMap: jest.fn(async () => null), personMap: jest.fn(async () => null), listBlocks: jest.fn(async () => []),
    optional: async (promise, fallback) => { try { return await promise; } catch { return fallback; } },
}));

import React from "react";
import { act, create } from "react-test-renderer";
import { attendanceApi, schedulingApi } from "../../services/api";
import { useJustificationsViewModel, MAX_DOC_BYTES } from "../useJustificationsViewModel";

const ABSENT = { attendanceRecordId: 1, classSessionId: 10, attendanceStatus: "Absent" };
const LATE = { attendanceRecordId: 2, classSessionId: 11, attendanceStatus: "Late", capturedAt: "2026-10-03T12:00:00Z" };
const PRESENT = { attendanceRecordId: 3, classSessionId: 10, attendanceStatus: "Present" };
const JUSTIFIED = { attendanceRecordId: 4, classSessionId: 10, attendanceStatus: "Absent" };
const PENDING = { justificationId: 90, attendanceRecordId: 4, reviewStatus: "Pending", submittedAt: "2026-10-04T10:00:00Z" };

let vm;
async function mount() {
    function Probe() { vm = useJustificationsViewModel(); return null; }
    await act(async () => { create(<Probe />); });
    await act(async () => {});
}
const pdf = (patch) => ({ name: "incapacidad.pdf", size: 1000, file: new Blob(["%PDF"]), ...patch });

beforeEach(async () => {
    jest.clearAllMocks();
    mockUser.current = { id: "u-1", role: "student", academicActorId: 1908 };
    attendanceApi.listJustificationTypes.mockResolvedValue([{ justificationTypeId: 1, name: "Médica" }, { justificationTypeId: 2, status: false }]);
    attendanceApi.listJustifications.mockResolvedValue([PENDING]);
    attendanceApi.recordsByActor.mockResolvedValue([ABSENT, LATE, PRESENT, JUSTIFIED]);
    schedulingApi.listSessions.mockResolvedValue([{ classSessionId: 10, sessionDate: "2026-10-01" }]);
    schedulingApi.listEnvironments.mockResolvedValue([]);
    attendanceApi.createJustification.mockResolvedValue({ justificationId: 91 });
    await mount();
});

test("absences and late arrivals without a justification can be justified", () => {
    expect(vm.mode).toBe("submit");
    expect(vm.types.map((t) => t.justificationTypeId)).toEqual([1]);
    expect(vm.eligibleRecords.map((r) => [r.attendanceRecordId, r.date])).toEqual([[2, "2026-10-03"], [1, "2026-10-01"]]);
    expect(vm.myJustifications).toEqual([expect.objectContaining({ justificationId: 90, date: "2026-10-01", recordStatus: "Absent" })]);
    expect(attendanceApi.recordsByActor).toHaveBeenCalledWith(1908);
});

test.each([
    [{ reason: "  " }, "El motivo de la justificación es obligatorio."],
    [{ reason: "Cita", file: pdf({ name: "foto.gif" }) }, "Formato no válido. Usa PDF, JPG, JPEG o PNG."],
    [{ reason: "Cita", file: pdf({ size: MAX_DOC_BYTES + 1 }) }, "El soporte supera el tamaño máximo de 5 MB."],
])("invalid input is refused before calling the backend (%#)", async (input, message) => {
    act(() => vm.openSubmit(ABSENT));
    let ok;
    await act(async () => { ok = await vm.submit({ typeId: "1", ...input }); });
    expect(ok).toBe(false);
    expect(vm.feedback).toEqual({ type: "error", message });
    expect(attendanceApi.createJustification).not.toHaveBeenCalled();
});

test("a record that already has a justification cannot get another", async () => {
    act(() => vm.openSubmit(JUSTIFIED));
    let ok;
    await act(async () => { ok = await vm.submit({ typeId: "1", reason: "Otra vez" }); });
    expect(ok).toBe(false);
    expect(vm.feedback.message).toBe("Ese registro ya tiene una justificación en curso o resuelta.");
});

test("submit creates the justification, uploads the document and closes the form", async () => {
    act(() => vm.openSubmit(ABSENT));
    expect(vm.submitOpen).toBe(true);
    let ok;
    const file = pdf();
    await act(async () => { ok = await vm.submit({ typeId: "1", reason: " Cita médica ", file }); });
    expect(ok).toBe(true);
    expect(attendanceApi.createJustification).toHaveBeenCalledWith({ attendanceRecordId: 1, justificationTypeId: 1, reason: "Cita médica" });
    expect(attendanceApi.uploadJustificationDocument).toHaveBeenCalledWith(91, file.file, "incapacidad.pdf");
    expect(vm.submitOpen).toBe(false);
    expect(vm.feedback.type).toBe("success");
});

test("a failed upload keeps the justification and says the document is missing", async () => {
    attendanceApi.uploadJustificationDocument.mockRejectedValue(new Error("413"));
    act(() => vm.openSubmit(LATE));
    let ok;
    await act(async () => { ok = await vm.submit({ typeId: "1", reason: "Cita", file: pdf() }); });
    expect(ok).toBe(false);
    expect(vm.feedback.message).toBe("La justificación quedó registrada, pero el soporte no se pudo subir: 413");
    expect(vm.submitOpen).toBe(false);
});

test("a 403 explains the missing permission", async () => {
    attendanceApi.createJustification.mockRejectedValue(Object.assign(new Error("Forbidden"), { status: 403 }));
    act(() => vm.openSubmit(ABSENT));
    await act(async () => { await vm.submit({ typeId: "1", reason: "Cita" }); });
    expect(vm.feedback.message).toMatch(/attendance.record:write/);
    act(() => vm.closeSubmit());
    expect(vm.submitTarget).toBeNull();
});

test("only a pending justification can be withdrawn", async () => {
    act(() => vm.askWithdraw({ ...PENDING, reviewStatus: "Approved" }));
    expect(vm.withdrawOpen).toBe(false);

    act(() => vm.askWithdraw(PENDING));
    expect(vm.withdrawOpen).toBe(true);
    await act(async () => { await vm.confirmWithdraw(); });
    expect(attendanceApi.deleteJustification).toHaveBeenCalledWith(90);
    expect(vm.feedback).toEqual({ type: "success", message: "Justificación retirada." });

    attendanceApi.deleteJustification.mockRejectedValue(new Error("Ya fue revisada"));
    act(() => vm.askWithdraw(PENDING));
    await act(async () => { await vm.confirmWithdraw(); });
    expect(vm.feedback).toEqual({ type: "error", message: "Ya fue revisada" });
    expect(vm.withdrawOpen).toBe(false);
});
