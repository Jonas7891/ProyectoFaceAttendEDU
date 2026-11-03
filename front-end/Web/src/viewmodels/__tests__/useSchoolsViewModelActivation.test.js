// AUD-22: «Activar» de una sede debe activar también a su administrador, con un
// solo diálogo, y no declarar éxito si la segunda llamada falla.
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({ useTranslation: () => ({ t: (s) => s }) }));
jest.mock("../../context/AppDataContext", () => ({ useAppData: () => ({ students: [] }) }));
jest.mock("../useRolePermissions", () => ({ useRolePermissions: () => ({ canManageSchools: true }) }));
jest.mock("../../services/api", () => ({
    academicApi: { listSchools: jest.fn(), updateSchool: jest.fn(), createSchool: jest.fn(), deleteSchool: jest.fn() },
}));
jest.mock("../../services/api/schoolActivation", () => ({
    ...jest.requireActual("../../services/api/schoolActivation"),
    changeSchoolAccess: jest.fn(),
}));

import { academicApi } from "../../services/api";
import { changeSchoolAccess } from "../../services/api/schoolActivation";
import { useSchoolsViewModel } from "../useSchoolsViewModel";

const at = "2026-11-02T10:00:00.000Z";
const pending = { schoolId: 82, name: "Sede QA", code: "QA", status: false, createdAt: at, updatedAt: at };

let vm;
function Probe() {
    vm = useSchoolsViewModel();
    return null;
}
async function mount() {
    await act(async () => {
        create(<Probe />);
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    academicApi.listSchools.mockResolvedValue([pending]);
});

it("el diálogo de activar explica las dos acciones", async () => {
    await mount();
    expect(vm.schools[0].statusKind).toBe("pending");
    act(() => vm.requestStatusChange(vm.schools[0]));
    expect(vm.statusConfirmMessage).toMatch(/administrador/i);
    expect(vm.statusConfirmMessage).toMatch(/sede/i);
});

it("confirmar activa sede y administrador con una sola operación y recarga", async () => {
    changeSchoolAccess.mockResolvedValue({ adminCount: 1 });
    await mount();
    act(() => vm.requestStatusChange(vm.schools[0]));
    await act(async () => vm.confirmStatusChange());
    expect(changeSchoolAccess).toHaveBeenCalledTimes(1);
    expect(changeSchoolAccess).toHaveBeenCalledWith(expect.objectContaining({ schoolId: 82 }), true);
    expect(vm.feedback.type).toBe("success");
    expect(academicApi.listSchools).toHaveBeenCalledTimes(2);
});

it("si falla la segunda llamada informa el error, sin éxito, y recarga el estado real", async () => {
    const err = new Error("boom");
    err.code = "ADMIN_FAILED";
    err.reverted = true;
    changeSchoolAccess.mockRejectedValue(err);
    await mount();
    act(() => vm.requestStatusChange(vm.schools[0]));
    await act(async () => vm.confirmStatusChange());
    expect(vm.feedback.type).toBe("error");
    expect(vm.feedback.message).toMatch(/administrador/i);
    expect(vm.feedback.message).toMatch(/revirti/i);
    expect(academicApi.listSchools).toHaveBeenCalledTimes(2);
});

it("si la reversión no se completó lo dice", async () => {
    const err = new Error("boom");
    err.code = "ADMIN_FAILED";
    err.reverted = false;
    changeSchoolAccess.mockRejectedValue(err);
    await mount();
    act(() => vm.requestStatusChange(vm.schools[0]));
    await act(async () => vm.confirmStatusChange());
    expect(vm.feedback.message).toMatch(/no se pudo revertir/i);
});
