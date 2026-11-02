// AUD-59: la sesión A guarda altas locales y la sesión B (otro usuario, otra sede) no las ve en
// ninguna de las cinco cargas que mezclan filas locales con las del backend.
const mockStore = new Map();
jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(async (k) => (mockStore.has(k) ? mockStore.get(k) : null)),
    setItem: jest.fn(async (k, v) => { mockStore.set(k, v); }),
    removeItem: jest.fn(async (k) => { mockStore.delete(k); }),
    getAllKeys: jest.fn(async () => [...mockStore.keys()]),
}));
// Modo mock: si el backend falla, cada carga devuelve mocks + filas locales.
jest.mock("../../../config/env", () => ({ API_MODE: "mock" }));
jest.mock("../../../services/api/referenceData", () =>
    new Proxy({ __esModule: true }, {
        get: (target, prop) => (prop in target ? target[prop] : jest.fn(async () => { throw new Error("backend caído"); })),
    })
);

import { setCacheScope } from "../localCache";
import { addStudent, loadStudents } from "../StudentStorage";
import { addUser, loadUsers } from "../UserStorage";
import { addCourse, loadCourses } from "../CourseStorage";
import { addFicha, loadFichas } from "../FichaStorage";
import { addEnvironment, loadEnvironments } from "../EnvironmentStorage";

const A = { userId: "admin-84", schoolId: 84 };
const B = { userId: "admin-82", schoolId: 82 };

const cases = [
    ["estudiantes", addStudent, loadStudents, { name: "Alumno sede 84", personId: "p84" }],
    ["usuarios", addUser, loadUsers, { name: "Usuario sede 84" }],
    ["cursos", addCourse, loadCourses, { name: "Curso sede 84" }],
    ["fichas", addFicha, loadFichas, { code: "F84" }],
    ["ambientes", addEnvironment, loadEnvironments, { name: "Sala sede 84" }],
];

beforeEach(() => {
    mockStore.clear();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    setCacheScope(null);
});

describe.each(cases)("%s: caché local por sesión", (_name, add, load, draft) => {
    const localIds = (rows) => rows.map((r) => String(r.id)).filter((id) => /^(s|usr|course|f|env)_\d/.test(id));

    it("la sesión que hizo el alta la sigue viendo", async () => {
        setCacheScope(A);
        await add([], draft);
        expect(localIds(await load())).toHaveLength(1);
    });

    it("otra sede no ve el alta de la sesión A", async () => {
        setCacheScope(A);
        await add([], draft);
        setCacheScope(B);
        expect(localIds(await load())).toHaveLength(0);
    });

    it("ignora el arreglo plano que dejó una versión anterior", async () => {
        const key = [...(await (async () => { setCacheScope(A); await add([], draft); return mockStore.keys(); })())][0];
        const legacy = JSON.parse(mockStore.get(key)).rows;
        mockStore.set(key, JSON.stringify(legacy));
        expect(localIds(await load())).toHaveLength(0);
    });
});
