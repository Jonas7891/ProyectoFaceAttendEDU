// Las altas hechas en la pantalla dejaban una fila espejo local (id s_…) guardada en el navegador
// para siempre; al lado de la fila real que trae el backend, el estudiante salía duplicado.
// mergeLocalStudents descarta las filas locales cuya persona ya viene del backend.
jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => {}),
}));
jest.mock("../../../services/api/referenceData", () => ({}));

import { mergeLocalStudents } from "../StudentStorage";

const api = (id, personId) => ({ id: String(id), personId, name: `Real ${id}` });
const local = (id, personId, extra = {}) => ({ id: `s_${id}`, personId, name: `Espejo ${id}`, ...extra });

describe("mergeLocalStudents", () => {
    it("quita la fila local cuyo estudiante ya viene del backend (mismo personId)", () => {
        const rows = mergeLocalStudents([api(1, "p1"), api(2, "p2")], [local(9, "p1")]);
        expect(rows.map((r) => r.id)).toEqual(["1", "2"]);
    });

    it("conserva las filas locales de alguien que el backend no devuelve", () => {
        const rows = mergeLocalStudents([api(1, "p1")], [local(7, "p7")]);
        expect(rows.map((r) => r.id)).toEqual(["1", "s_7"]);
    });

    it("conserva las filas locales sin personId (altas que nunca llegaron al backend)", () => {
        const rows = mergeLocalStudents([api(1, "p1")], [local(5, null), local(6, undefined)]);
        expect(rows.map((r) => r.id)).toEqual(["1", "s_5", "s_6"]);
    });

    it("compara el personId sin distinguir mayúsculas", () => {
        const rows = mergeLocalStudents([api(1, "ABC-1")], [local(9, "abc-1")]);
        expect(rows.map((r) => r.id)).toEqual(["1"]);
    });

    it("sin filas locales devuelve la lista del backend tal cual", () => {
        const fromApi = [api(1, "p1")];
        expect(mergeLocalStudents(fromApi, [])).toEqual(fromApi);
    });
});
