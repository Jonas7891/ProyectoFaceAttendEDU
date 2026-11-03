// AUD-37 (c): una fila de estudiante con id no numérico (espejo local s_…) se consultaba como
// /academic-actors/NaN/attendance. Debe omitirse la petición y mostrarse el estado vacío.
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockStudents = [
    { id: "s_1730000000_ab12c", name: "Fantasma", personId: "p-1" },
    { id: "41", name: "Real", personId: "p-2" },
];
const mockRecordsByActor = jest.fn();

jest.mock("../../context/AppDataContext", () => ({
    useAppData: () => ({ students: mockStudents, courses: [] }),
}));
jest.mock("../../context/AuthContext", () => ({
    useAuth: () => ({ user: { role: "admin", schoolId: 2 } }),
}));
jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({
    useTranslation: () => ({ t: (s) => s }),
}));
jest.mock("../../services/api", () => ({
    attendanceApi: { recordsByActor: (...a) => mockRecordsByActor(...a) },
    schedulingApi: { listSessions: jest.fn().mockResolvedValue([]) },
}));
jest.mock("../../services/api/referenceData", () => ({
    listBlocks: jest.fn().mockResolvedValue([]),
    listCohorts: jest.fn().mockResolvedValue([]),
    listEnvironments: jest.fn().mockResolvedValue([]),
    optional: (p, fallback) => Promise.resolve(p).catch(() => fallback),
    personMap: jest.fn().mockResolvedValue(new Map()),
    actorMap: jest.fn().mockResolvedValue(new Map()),
}));

import { useHistoryViewModel } from "../useHistoryViewModel";

function renderVm() {
    let vm;
    function Probe() {
        vm = useHistoryViewModel();
        return null;
    }
    act(() => {
        create(<Probe />);
    });
    return () => vm;
}

beforeEach(() => {
    mockRecordsByActor.mockReset();
    mockRecordsByActor.mockResolvedValue([]);
});

test("solo se consultan los estudiantes con id numérico", async () => {
    const getVm = renderVm();
    await act(async () => {});
    await act(async () => {
        await getVm().runQuery();
    });
    expect(mockRecordsByActor).toHaveBeenCalledTimes(1);
    expect(mockRecordsByActor).toHaveBeenCalledWith(41);
});

test("si ninguna persona del alcance tiene id numérico no hay peticiones y sale el estado vacío", async () => {
    mockStudents.splice(1, 1);
    const getVm = renderVm();
    await act(async () => {});
    await act(async () => {
        await getVm().runQuery();
    });
    expect(mockRecordsByActor).not.toHaveBeenCalled();
    expect(getVm().notice).toBeTruthy();
    mockStudents.push({ id: "41", name: "Real", personId: "p-2" });
});
