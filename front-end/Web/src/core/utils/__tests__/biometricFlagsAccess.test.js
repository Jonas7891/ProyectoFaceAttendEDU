import { loadBiometricFlags } from "../biometricFlags";

const summary = { face_person_ids: ["p1"], fingerprint_person_ids: [] };

describe("loadBiometricFlags (AUD-57)", () => {
    test.each(["student"])("no consulta /biometric/summary con el rol %s (sin attendance.record:write)", async (role) => {
        const fetchSummary = jest.fn().mockResolvedValue(summary);
        await expect(loadBiometricFlags(role, fetchSummary)).resolves.toBeNull();
        expect(fetchSummary).not.toHaveBeenCalled();
    });

    test.each(["admin", "teacher"])("consulta el resumen con el rol %s", async (role) => {
        const fetchSummary = jest.fn().mockResolvedValue(summary);
        const flags = await loadBiometricFlags(role, fetchSummary);
        expect(fetchSummary).toHaveBeenCalledTimes(1);
        expect(flags.face.has("p1")).toBe(true);
    });

    test("un fallo real del endpoint para un rol permitido devuelve null sin lanzar", async () => {
        const fetchSummary = jest.fn().mockRejectedValue(new Error("boom"));
        await expect(loadBiometricFlags("admin", fetchSummary)).resolves.toBeNull();
    });
});
