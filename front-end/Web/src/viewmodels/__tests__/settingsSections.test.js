import { buildPermissions, resolveSettingsSection } from "../useRolePermissions";

const teacher = buildPermissions("teacher", 3, ["Instructor"]);
const student = buildPermissions("student", 3, ["Estudiante"]);
const admin = buildPermissions("admin", 3, ["Administrador"]);
const superAdmin = buildPermissions("admin", null, ["Super Administrador"]);

describe("secciones de Configuración por rol (AUD-49)", () => {
    test.each(["general", "facial", "security", "bogus"])(
        "el Instructor y el Estudiante no alcanzan %s: se redirige a una sección permitida",
        (section) => {
            for (const p of [teacher, student]) {
                const resolved = resolveSettingsSection(p, section);
                expect(resolved).toBe("appearance");
                expect(p.settingsSections).toContain(resolved);
            }
        },
    );

    test("el Instructor conserva notificaciones, apariencia y sede", () => {
        for (const s of ["notifications", "appearance", "schoolInfo"]) {
            expect(resolveSettingsSection(teacher, s)).toBe(s);
        }
    });

    test("el Administrador de sede alcanza todas las secciones", () => {
        for (const s of ["general", "facial", "notifications", "security", "appearance", "schoolInfo"]) {
            expect(resolveSettingsSection(admin, s)).toBe(s);
        }
    });

    test("el Super Admin no tiene sede propia", () => {
        expect(resolveSettingsSection(superAdmin, "schoolInfo")).toBe("appearance");
        expect(resolveSettingsSection(superAdmin, "security")).toBe("security");
    });

    test("sin sección se usa apariencia; invitado sin permisos tampoco pasa", () => {
        expect(resolveSettingsSection(teacher, undefined)).toBe("appearance");
        expect(resolveSettingsSection({}, "security")).toBe("appearance");
    });

    test("solo el Super Admin puede cambiar la seguridad global", () => {
        expect(superAdmin.canManageSecurityConfig).toBe(true);
        expect(admin.canManageSecurityConfig).toBe(false);
        expect(teacher.canManageSecurityConfig).toBe(false);
    });
});
