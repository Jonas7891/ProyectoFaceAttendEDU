/* global jest, describe, test, expect, beforeEach, afterEach */
/**
 * AUD-05: si el login del admin QA falla, `ownId` queda en NaN/undefined y la limpieza SQL
 * del afterAll no puede ejecutarse con `school_id = NaN`. No necesita el stack (sin LIVE_CONTRACT).
 */
import { execFileSync } from "node:child_process";
import { execForSchool } from "../testing/contractHarness";

jest.mock("node:child_process", () => ({ execFileSync: jest.fn(() => "") }));

describe("contractHarness.execForSchool", () => {
    let warn;
    beforeEach(() => {
        execFileSync.mockClear();
        process.env.QA_DOCKER_BIN = "docker";
        warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    });
    afterEach(() => warn.mockRestore());

    test.each([[NaN], [undefined], [null], [0], [-3], [1.5], ["abc"]])(
        "sin school_id valido (%p) no ejecuta SQL y registra el motivo",
        (schoolId) => {
            const result = execForSchool(schoolId, (id) => `update x set deleted_at = now() where school_id = ${id}`);
            expect(result).toBe(false);
            expect(execFileSync).not.toHaveBeenCalled();
            expect(warn).toHaveBeenCalledWith(expect.stringContaining("school_id"));
        }
    );

    test("con school_id numerico valido ejecuta el SQL con ese id", () => {
        const result = execForSchool(7, (id) => `update x set deleted_at = now() where school_id = ${id}`);
        expect(result).toBe(true);
        expect(execFileSync).toHaveBeenCalledTimes(1);
        expect(execFileSync.mock.calls[0][2].env.Q).toBe("update x set deleted_at = now() where school_id = 7");
        expect(warn).not.toHaveBeenCalled();
    });
});
