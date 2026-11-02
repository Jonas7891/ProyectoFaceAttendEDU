// AUD-37 (d): el modal de detalle del ambiente seguía mostrando los horarios anteriores tras
// guardar o eliminar un horario, porque `selected` se fijaba con una copia leída del estado
// anterior del contexto.
import React, { useState } from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let mockCurrent;
let mockForceRender;

jest.mock("../../context/AppDataContext", () => ({ useAppData: () => mockCurrent }));
jest.mock("../../services/api/environmentManagement", () => ({
    backendEnvId: (id) => (Number.isInteger(Number(id)) && Number(id) > 0 ? Number(id) : null),
    createEnvironment: jest.fn(),
    deleteEnvironment: jest.fn(),
    updateEnvironment: jest.fn(),
}));
jest.mock("../../services/api/scheduleBlockManagement", () => ({
    backendScheduleId: (id) => (Number.isInteger(Number(id)) && Number(id) > 0 ? Number(id) : null),
    cohortsForCourse: jest.fn(),
    createBlocks: jest.fn(),
    createdBlockId: jest.fn(),
    dayLabelToIso: jest.fn(),
    deleteBlock: jest.fn(),
    instructorActorForUser: jest.fn(),
    isoToDayLabel: jest.fn(),
    replaceBlock: jest.fn(),
}));

import { useEnvironmentsViewModel } from "../useEnvironmentsViewModel";
import { deleteBlock } from "../../services/api/scheduleBlockManagement";

function renderVm() {
    let vm;
    function Probe() {
        const [, setTick] = useState(0);
        mockForceRender = () => setTick((n) => n + 1);
        vm = useEnvironmentsViewModel();
        return null;
    }
    act(() => {
        create(<Probe />);
    });
    return () => vm;
}

// El contexto real publica un objeto nuevo en cada cambio de estado y las funciones
// capturadas antes siguen viendo el anterior.
function publish(next) {
    mockCurrent = { ...mockCurrent, ...next };
    mockForceRender();
}

beforeEach(() => {
    jest.clearAllMocks();
    mockCurrent = {
        isLoading: false,
        environments: [{ id: "57", number: "A-101", schedules: [{ id: "9" }, { id: "10" }] }],
        users: [],
        courses: [],
        fichas: [],
        removeEnvironment: jest.fn(),
        removeSchedule: jest.fn(async (envId, scheduleId) => {
            publish({
                environments: mockCurrent.environments.map((e) =>
                    e.id === envId ? { ...e, schedules: e.schedules.filter((s) => s.id !== scheduleId) } : e
                ),
            });
        }),
    };
});

it("tras eliminar un horario el ambiente seleccionado ya no lo lista", async () => {
    deleteBlock.mockResolvedValue(undefined);
    const getVm = renderVm();
    act(() => getVm().selectEnvironment(mockCurrent.environments[0]));
    expect(getVm().selected.schedules.map((s) => s.id)).toEqual(["9", "10"]);

    await act(async () => {
        await getVm().removeSchedule("57", "9");
    });

    expect(getVm().selected.schedules.map((s) => s.id)).toEqual(["10"]);
});

it("el ambiente seleccionado refleja un horario recién agregado al contexto", async () => {
    const getVm = renderVm();
    act(() => getVm().selectEnvironment(mockCurrent.environments[0]));

    await act(async () => {
        publish({
            environments: [{ id: "57", number: "A-101", schedules: [{ id: "9" }, { id: "10" }, { id: "11" }] }],
        });
    });

    expect(getVm().selected.schedules.map((s) => s.id)).toEqual(["9", "10", "11"]);
});

it("si el ambiente desaparece del contexto no queda una copia obsoleta seleccionada", async () => {
    const getVm = renderVm();
    act(() => getVm().selectEnvironment(mockCurrent.environments[0]));
    await act(async () => {
        publish({ environments: [] });
    });
    expect(getVm().selected).toBeNull();
});
