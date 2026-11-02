import { flagsFromSummary, withBiometricFlags } from "../biometricFlags";

describe("flagsFromSummary", () => {
    it("convierte las listas de personas del resumen en conjuntos de texto", () => {
        const flags = flagsFromSummary({ face_person_ids: ["a", 2], fingerprint_person_ids: ["b"] });
        expect([...flags.face]).toEqual(["a", "2"]);
        expect([...flags.fingerprint]).toEqual(["b"]);
    });

    it("tolera un resumen vacío o ausente", () => {
        expect(flagsFromSummary(undefined).face.size).toBe(0);
        expect(flagsFromSummary({}).fingerprint.size).toBe(0);
    });
});

describe("withBiometricFlags", () => {
    const flags = flagsFromSummary({ face_person_ids: ["p1"], fingerprint_person_ids: ["p2"] });

    it("marca el rostro y la huella según lo registrado en biometría", () => {
        const rows = withBiometricFlags([{ id: 1, personId: "p1" }, { id: 2, personId: "p2" }, { id: 3, personId: "p3" }], flags);
        expect(rows.map((r) => [r.hasFacial, r.hasFingerprint])).toEqual([[true, false], [false, true], [false, false]]);
    });

    it("deja las filas como están si no se pudo consultar biometría (flags nulos)", () => {
        const rows = [{ id: 1, personId: "p1", hasFacial: true }];
        expect(withBiometricFlags(rows, null)).toBe(rows);
    });

    it("no toca las filas sin personId", () => {
        const row = { id: 9, personId: null, hasFacial: true };
        expect(withBiometricFlags([row], flags)).toEqual([row]);
    });
});
