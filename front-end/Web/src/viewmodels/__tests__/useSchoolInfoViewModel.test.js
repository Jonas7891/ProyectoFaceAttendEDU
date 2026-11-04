// AUD-42: tras un error al guardar la sede quedaba abierto el diálogo «¿Deseas actualizar?»,
// que invitaba a confirmar de nuevo un cambio fallido; el error del servidor quedaba tapado.
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("../../context/AuthContext", () => ({ useAuth: () => ({ user: { schoolId: 7 } }) }));
jest.mock("../useRolePermissions", () => ({ useRolePermissions: () => ({ canEditSchoolInfo: true }) }));
jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({ useTranslation: () => ({ t: (s) => s }) }));
jest.mock("../../services/api/referenceData", () => ({ getActiveSchool: () => 7 }));
jest.mock("../../services/api", () => ({
    academicApi: { getSchool: jest.fn(), updateSchool: jest.fn() },
}));

import { academicApi } from "../../services/api";
import { useSchoolInfoViewModel } from "../useSchoolInfoViewModel";

async function mount() {
    const ref = { vm: null };
    function Probe() {
        ref.vm = useSchoolInfoViewModel();
        return null;
    }
    await act(async () => {
        create(<Probe />);
    });
    return ref;
}

beforeEach(() => {
    academicApi.getSchool.mockResolvedValue({ schoolId: 7, name: "Sede", status: true });
});

test("a failed save closes the confirm dialog and shows the server error", async () => {
    academicApi.updateSchool.mockRejectedValue(new Error("Código duplicado"));
    const ref = await mount();
    act(() => ref.vm.openEdit());
    act(() => ref.vm.setConfirmOpen(true));
    await act(async () => {
        await ref.vm.save();
    });
    expect(ref.vm.confirmOpen).toBe(false);
    expect(ref.vm.editOpen).toBe(true);
    expect(ref.vm.feedback).toEqual({ type: "error", message: "Código duplicado" });
});

test("a successful save also closes the confirm dialog", async () => {
    academicApi.updateSchool.mockResolvedValue({ schoolId: 7, name: "Sede" });
    const ref = await mount();
    act(() => ref.vm.openEdit());
    act(() => ref.vm.setConfirmOpen(true));
    await act(async () => {
        await ref.vm.save();
    });
    expect(ref.vm.confirmOpen).toBe(false);
    expect(ref.vm.editOpen).toBe(false);
});

test("a validation error also closes the confirm dialog", async () => {
    const ref = await mount();
    act(() => ref.vm.openEdit());
    act(() => ref.vm.setField("name", ""));
    act(() => ref.vm.setConfirmOpen(true));
    await act(async () => {
        await ref.vm.save();
    });
    expect(ref.vm.confirmOpen).toBe(false);
    expect(ref.vm.feedback.type).toBe("error");
});
