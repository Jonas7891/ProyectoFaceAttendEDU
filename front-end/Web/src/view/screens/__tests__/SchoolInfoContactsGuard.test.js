// AUD-15: /app/school-info y /app/contacts no tenían guard de rol. «Sede» (datos de la institución y
// directorio de instructores) no existe para el Super Admin global, que no tiene sede propia: el sidebar
// ya se la oculta (hideForSuperAdmin) y ahora la ruta tampoco la sirve.
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("../../../viewmodels/useRolePermissions", () => ({ useRolePermissions: jest.fn() }));
jest.mock("../../SchoolInfoView", () => ({ __esModule: true, default: () => "SCHOOL_INFO_VIEW" }));
jest.mock("../../ContactsView", () => ({ __esModule: true, default: () => "CONTACTS_VIEW" }));
jest.mock("../../NotAuthorized", () => ({
    AUTH_EXCEPTION_TYPES: { INSUFFICIENT_PERMISSIONS: "insufficient_permissions" },
    NotAuthorized: ({ type }) => `NOT_AUTHORIZED:${type}`,
}));

import { useRolePermissions } from "../../../viewmodels/useRolePermissions";
import SchoolInfoScreen from "../SchoolInfoScreen";
import ContactsScreen from "../ContactsScreen";

// buildPermissions real (el mock reemplaza solo el hook).
const real = jest.requireActual("../../../viewmodels/useRolePermissions");

const ROLES = {
    superAdmin: () => real.buildPermissions("admin", null, ["Super Administrador"]),
    schoolAdmin: () => real.buildPermissions("admin", 3, ["Administrador"]),
    teacher: () => real.buildPermissions("teacher", 3, ["Instructor"]),
    student: () => real.buildPermissions("student", 3, ["Aprendiz"]),
};

function text(Screen) {
    let tree;
    act(() => { tree = create(<Screen />); });
    return JSON.stringify(tree.toJSON());
}

describe.each([
    ["SchoolInfoScreen", SchoolInfoScreen, "SCHOOL_INFO_VIEW"],
    ["ContactsScreen", ContactsScreen, "CONTACTS_VIEW"],
])("%s", (_name, Screen, view) => {
    test("el Super Admin global (sin sede) ve NotAuthorized", () => {
        useRolePermissions.mockReturnValue(ROLES.superAdmin());
        const out = text(Screen);
        expect(out).toContain("NOT_AUTHORIZED:insufficient_permissions");
        expect(out).not.toContain(view);
    });

    test("un guest sin permisos ve NotAuthorized", () => {
        useRolePermissions.mockReturnValue(real.buildPermissions(null));
        expect(text(Screen)).toContain("NOT_AUTHORIZED");
    });

    test.each(["schoolAdmin", "teacher", "student"])("%s sí ve la pantalla", (role) => {
        useRolePermissions.mockReturnValue(ROLES[role]());
        const out = text(Screen);
        expect(out).toContain(view);
        expect(out).not.toContain("NOT_AUTHORIZED");
    });
});

describe("permisos de Sede", () => {
    test("coinciden con la sección «Sede» de Configuración (settingsSections)", () => {
        for (const [name, make] of Object.entries(ROLES)) {
            const p = make();
            expect(p.canViewSchoolInfo).toBe(p.settingsSections.includes("schoolInfo"));
            expect(p.canViewContacts).toBe(p.settingsSections.includes("contacts"));
            expect([name, p.canViewSchoolInfo]).toEqual([name, name !== "superAdmin"]);
        }
    });
});
