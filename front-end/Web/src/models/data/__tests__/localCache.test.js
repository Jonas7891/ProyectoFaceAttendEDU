// AUD-59: las filas de dominio que la web guarda en el navegador (@faceattend_*) deben pertenecer a
// la sesión (usuario + sede) que las escribió. Otra sesión no las ve y el cierre de sesión las borra.
const mockStore = new Map();
jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(async (k) => (mockStore.has(k) ? mockStore.get(k) : null)),
    setItem: jest.fn(async (k, v) => { mockStore.set(k, v); }),
    removeItem: jest.fn(async (k) => { mockStore.delete(k); }),
    getAllKeys: jest.fn(async () => [...mockStore.keys()]),
}));

import {
    clearDomainCache,
    purgeForeignDomainCache,
    readLocalRows,
    setCacheScope,
    writeLocalRows,
} from "../localCache";

const KEY = "@faceattend_students";

beforeEach(() => {
    mockStore.clear();
    setCacheScope(null);
});

describe("localCache: alcance por usuario y sede", () => {
    it("la sesión que escribe lee sus filas", async () => {
        setCacheScope({ userId: "u1", schoolId: 84 });
        await writeLocalRows(KEY, [{ id: "s_1" }]);
        expect(await readLocalRows(KEY)).toEqual([{ id: "s_1" }]);
    });

    it("otra sede (otro usuario) no ve las filas de la sesión A", async () => {
        setCacheScope({ userId: "u1", schoolId: 84 });
        await writeLocalRows(KEY, [{ id: "s_1" }]);
        setCacheScope({ userId: "u2", schoolId: 82 });
        expect(await readLocalRows(KEY)).toEqual([]);
    });

    it("el mismo usuario en otra sede tampoco las ve", async () => {
        setCacheScope({ userId: "u1", schoolId: 84 });
        await writeLocalRows(KEY, [{ id: "s_1" }]);
        setCacheScope({ userId: "u1", schoolId: 82 });
        expect(await readLocalRows(KEY)).toEqual([]);
    });

    it("la misma sede con otro usuario no las ve", async () => {
        setCacheScope({ userId: "u1", schoolId: 84 });
        await writeLocalRows(KEY, [{ id: "s_1" }]);
        setCacheScope({ userId: "u3", schoolId: 84 });
        expect(await readLocalRows(KEY)).toEqual([]);
    });

    it("ignora los datos viejos sin sobre (arreglo plano de versiones anteriores)", async () => {
        mockStore.set(KEY, JSON.stringify([{ id: "s_old", name: "Viejo" }]));
        setCacheScope({ userId: "u1", schoolId: 84 });
        expect(await readLocalRows(KEY)).toEqual([]);
    });

    it("sin sesión no lee ni escribe", async () => {
        setCacheScope({ userId: "u1", schoolId: 84 });
        await writeLocalRows(KEY, [{ id: "s_1" }]);
        setCacheScope(null);
        expect(await readLocalRows(KEY)).toEqual([]);
        await writeLocalRows(KEY, [{ id: "s_2" }]);
        setCacheScope({ userId: "u1", schoolId: 84 });
        expect(await readLocalRows(KEY)).toEqual([{ id: "s_1" }]);
    });
});

describe("localCache: limpieza", () => {
    it("clearDomainCache borra las claves @faceattend_* y conserva preferencias y configuración", async () => {
        mockStore.set("@faceattend_students", "x");
        mockStore.set("@faceattend_courses", "x");
        mockStore.set("@faceattend_courses_v2", "x");
        mockStore.set("@faceattend:theme_mode", "dark");
        mockStore.set("faceattend_language", "es");
        mockStore.set("faceattend_institution_config", "{}");
        await clearDomainCache();
        expect([...mockStore.keys()].sort()).toEqual([
            "@faceattend:theme_mode",
            "faceattend_institution_config",
            "faceattend_language",
        ]);
    });

    it("purgeForeignDomainCache quita lo ajeno y lo sin sobre, y deja lo de la sesión actual", async () => {
        setCacheScope({ userId: "u1", schoolId: 84 });
        await writeLocalRows("@faceattend_students", [{ id: "s_1" }]);
        mockStore.set("@faceattend_fichas", JSON.stringify([{ id: "f_old" }]));
        await purgeForeignDomainCache();
        expect(mockStore.has("@faceattend_fichas")).toBe(false);
        expect(mockStore.has("@faceattend_students")).toBe(true);
        setCacheScope({ userId: "u2", schoolId: 82 });
        await purgeForeignDomainCache();
        expect(mockStore.has("@faceattend_students")).toBe(false);
    });
});
