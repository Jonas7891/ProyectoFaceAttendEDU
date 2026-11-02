// AUD-22: activar una sede pendiente dejaba al administrador sin acceso (y activar
// solo al usuario dejaba la sede inactiva). La activación coordina las dos llamadas.
jest.mock("../../../api/apiClient", () => ({ fetchAllPages: jest.fn() }));
jest.mock("../academicApi", () => ({ academicApi: { updateSchoolStatus: jest.fn() } }));
jest.mock("../authApi", () => ({ authApi: { setUserStatus: jest.fn() } }));

import { fetchAllPages } from "../../../api/apiClient";
import { academicApi } from "../academicApi";
import { authApi } from "../authApi";
import { changeSchoolAccess, schoolStatusKind } from "../schoolActivation";

const calls = [];
const school = (status) => ({ schoolId: 82, name: "Sede QA", status });

function mockDirectory({ actors, users }) {
    fetchAllPages.mockImplementation(async (path) => (path.includes("/actors") ? actors : users));
}

beforeEach(() => {
    jest.resetAllMocks();
    calls.length = 0;
    academicApi.updateSchoolStatus.mockImplementation(async (id, s) => calls.push(`school:${s}`));
    authApi.setUserStatus.mockImplementation(async (id, s) => calls.push(`user:${id}:${s}`));
    mockDirectory({
        actors: [
            { academicActorId: 1, personId: "p-adm", actorTypeId: 3 },
            { academicActorId: 2, personId: "p-stu", actorTypeId: 1 },
        ],
        users: [
            { userId: "u-adm", personId: "p-adm", status: false },
            { userId: "u-stu", personId: "p-stu", status: true },
        ],
    });
});

describe("changeSchoolAccess", () => {
    it("activar: primero la sede y luego el usuario administrador", async () => {
        const res = await changeSchoolAccess(school(false), true);
        expect(calls).toEqual(["school:true", "user:u-adm:true"]);
        expect(res.adminCount).toBe(1);
    });

    it("desactivar: primero el usuario administrador y luego la sede", async () => {
        mockDirectory({
            actors: [{ academicActorId: 1, personId: "p-adm", actorTypeId: 3 }],
            users: [{ userId: "u-adm", personId: "p-adm", status: true }],
        });
        await changeSchoolAccess(school(true), false);
        expect(calls).toEqual(["user:u-adm:false", "school:false"]);
    });

    it("no toca a quien no es administrador de la sede", async () => {
        await changeSchoolAccess(school(false), true);
        expect(calls.some((c) => c.includes("u-stu"))).toBe(false);
    });

    it("si falla el usuario al activar, revierte la sede y lo informa", async () => {
        authApi.setUserStatus.mockRejectedValueOnce(new Error("boom"));
        await expect(changeSchoolAccess(school(false), true)).rejects.toMatchObject({
            code: "ADMIN_FAILED",
            reverted: true,
        });
        expect(calls).toEqual(["school:true", "school:false"]);
    });

    it("si falla la sede al desactivar, restaura al administrador", async () => {
        mockDirectory({
            actors: [{ academicActorId: 1, personId: "p-adm", actorTypeId: 3 }],
            users: [{ userId: "u-adm", personId: "p-adm", status: true }],
        });
        academicApi.updateSchoolStatus.mockRejectedValueOnce(new Error("boom"));
        await expect(changeSchoolAccess(school(true), false)).rejects.toMatchObject({
            code: "SCHOOL_FAILED",
            reverted: true,
        });
        expect(calls).toEqual(["user:u-adm:false", "user:u-adm:true"]);
    });

    it("si la reversión también falla, lo marca como no revertido", async () => {
        authApi.setUserStatus.mockRejectedValue(new Error("boom"));
        academicApi.updateSchoolStatus
            .mockResolvedValueOnce()
            .mockRejectedValueOnce(new Error("x"));
        await expect(changeSchoolAccess(school(false), true)).rejects.toMatchObject({
            code: "ADMIN_FAILED",
            reverted: false,
        });
    });

    it("si no puede ubicar al administrador no cambia nada", async () => {
        fetchAllPages.mockRejectedValue(new Error("403"));
        await expect(changeSchoolAccess(school(false), true)).rejects.toMatchObject({
            code: "ADMIN_LOOKUP_FAILED",
        });
        expect(calls).toEqual([]);
    });

    it("una sede sin administrador vinculado solo cambia la sede", async () => {
        mockDirectory({ actors: [], users: [] });
        const res = await changeSchoolAccess(school(false), true);
        expect(calls).toEqual(["school:true"]);
        expect(res.adminCount).toBe(0);
    });
});

describe("schoolStatusKind", () => {
    it("activa", () => {
        expect(schoolStatusKind({ status: true })).toBe("active");
    });
    it("pendiente: inactiva y sin modificar desde el alta", () => {
        const at = "2026-11-02T10:00:00.000Z";
        expect(schoolStatusKind({ status: false, createdAt: at, updatedAt: at })).toBe("pending");
    });
    it("inactiva: desactivada después del alta", () => {
        expect(
            schoolStatusKind({
                status: false,
                createdAt: "2026-11-02T10:00:00.000Z",
                updatedAt: "2026-11-03T10:00:00.000Z",
            })
        ).toBe("inactive");
    });
    it("inactiva si no hay fechas para saber", () => {
        expect(schoolStatusKind({ status: false })).toBe("inactive");
    });
});
