// AUD-37 (a)/(b): registerStudent guardaba una fila espejo parcial (sin documento, usuario ni sede)
// con addStudent; ahora trae la lista real del backend.
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockAddStudent = jest.fn();
const mockReloadStudents = jest.fn();

jest.mock("../../context/AppDataContext", () => ({
    useAppData: () => ({
        students: [],
        programs: [],
        isLoading: false,
        addStudent: mockAddStudent,
        reloadStudents: mockReloadStudents,
    }),
}));
jest.mock("../../services/api/staffProvisioning", () => ({
    provisionStudent: jest.fn(),
    credentialsNotice: () => null,
    documentTypesForRole: () => ["CC"],
}));

import { provisionStudent } from "../../services/api/staffProvisioning";
import { useStudentsViewModel } from "../useStudentsViewModel";

const form = {
    name: "Ana García",
    code: "AED-401001",
    email: "ana@uni.edu",
    role: "student",
    documentNumber: "123",
    password: "Secreta123!",
    course: "AED-401",
    status: "active",
    privacyAccepted: true,
};

function renderVm() {
    let vm;
    function Probe() {
        vm = useStudentsViewModel();
        return null;
    }
    act(() => {
        create(<Probe />);
    });
    return () => vm;
}

beforeEach(() => {
    jest.clearAllMocks();
    provisionStudent.mockResolvedValue({ personId: "p-9" });
    mockReloadStudents.mockResolvedValue(undefined);
});

test("registerStudent recarga la lista del backend y no guarda un espejo local", async () => {
    const getVm = renderVm();
    await act(async () => {
        await getVm().registerStudent(form);
    });
    expect(mockAddStudent).not.toHaveBeenCalled();
    expect(mockReloadStudents).toHaveBeenCalledTimes(1);
});

test("si la recarga falla, el alta ya hecha no se convierte en error", async () => {
    mockReloadStudents.mockRejectedValue(new Error("429"));
    const getVm = renderVm();
    await act(async () => {
        await getVm().registerStudent(form);
    });
    expect(provisionStudent).toHaveBeenCalled();
});
