globalThis.IS_REACT_ACT_ENVIRONMENT = true;
jest.mock("../../context/AuthContext", () => ({ useAuth: () => ({ user: { role: "admin", schoolId: 1 } }) }));
jest.mock("../../context/AppDataContext", () => ({
    useAppData: () => ({ students: [{ id: "7", name: "Ana", cohortId: "3" }], courses: [] }),
}));
const mockT = (s) => s;
jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({ useTranslation: () => ({ t: mockT }) }));
jest.mock("../../services/api", () => ({
    attendanceApi: {
        recordsByActor: jest.fn(() =>
            Promise.resolve([
                { attendanceRecordId: 1, classSessionId: 1, attendanceStatus: "Present", capturedAt: "2026-01-05T08:00:00" },
                { attendanceRecordId: 2, classSessionId: 1, attendanceStatus: "Absent", capturedAt: "2026-01-06T08:00:00" },
            ]),
        ),
    },
    schedulingApi: { listSessions: jest.fn(() => Promise.resolve([])) },
}));
jest.mock("../../services/api/referenceData", () => ({
    listBlocks: jest.fn(() => Promise.resolve([])),
    listCohorts: jest.fn(() => Promise.resolve([])),
    listEnvironments: jest.fn(() => Promise.resolve([])),
    optional: (promise, fallback) => promise.catch(() => fallback),
    personMap: jest.fn(() => Promise.resolve(null)),
    actorMap: jest.fn(() => Promise.resolve(null)),
}));

import React from "react";
import { act, create } from "react-test-renderer";
import { useHistoryViewModel } from "../useHistoryViewModel";

async function mount() {
    const ref = { vm: null };
    function Probe() {
        ref.vm = useHistoryViewModel();
        return null;
    }
    await act(async () => {
        create(<Probe />);
    });
    return ref;
}

// AUD-06: «Limpiar» no mostraba ningún efecto cuando los filtros ya estaban vacíos o el
// contador no cambiaba; ahora vacía los filtros, recalcula el contador y avisa.
test("Limpiar empties the filters, restores the row counter and confirms it", async () => {
    const ref = await mount();
    await act(async () => {
        await ref.vm.runQuery();
    });
    expect(ref.vm.rows).toHaveLength(2);

    act(() => ref.vm.setFilter("status", "Absent"));
    expect(ref.vm.rows).toHaveLength(1);

    act(() => ref.vm.resetFilters());
    expect(ref.vm.filters.status).toBe("");
    expect(ref.vm.rows).toHaveLength(2);
    expect(ref.vm.notice).toBe("Filtros limpiados");
});

test("Limpiar confirms even when the filters were already empty", async () => {
    const ref = await mount();
    expect(ref.vm.notice).toBeNull();
    act(() => ref.vm.resetFilters());
    expect(ref.vm.notice).toBe("Filtros limpiados");
});
