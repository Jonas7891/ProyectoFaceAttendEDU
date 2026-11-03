// AUD-38: eliminar un ambiente con horarios (409) mostraba éxito y vaciaba la lista local.
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockAppData = {
    isLoading: false,
    environments: [{ id: "57", number: "A-101", schedules: [{ id: "9" }] }],
    users: [],
    courses: [],
    fichas: [],
    removeEnvironment: jest.fn(),
    removeSchedule: jest.fn(),
};
jest.mock("../../context/AppDataContext", () => ({ useAppData: () => mockAppData }));
jest.mock("../../services/api/environmentManagement", () =>
    require("../../testHelpers/environmentServiceMocks").environmentManagementMock()
);
jest.mock("../../services/api/scheduleBlockManagement", () =>
    require("../../testHelpers/environmentServiceMocks").scheduleBlockManagementMock()
);

import { useEnvironmentsViewModel } from "../useEnvironmentsViewModel";
import { deleteEnvironment } from "../../services/api/environmentManagement";
import { deleteBlock } from "../../services/api/scheduleBlockManagement";

function renderVm() {
    let vm;
    function Probe() {
        vm = useEnvironmentsViewModel();
        return null;
    }
    act(() => {
        create(<Probe />);
    });
    return () => vm;
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("removeEnvironment", () => {
    it("409 devuelve un mensaje en español y no toca la lista local", async () => {
        deleteEnvironment.mockRejectedValue(
            Object.assign(new Error("Error 409"), { status: 409 })
        );
        const getVm = renderVm();
        let result;
        await act(async () => {
            result = await getVm().removeEnvironment("57");
        });
        expect(result).toBe("No se puede eliminar un ambiente que tiene horarios asignados");
        expect(mockAppData.removeEnvironment).not.toHaveBeenCalled();
    });

    it("otro error con «Error 500» crudo no se muestra tal cual", async () => {
        deleteEnvironment.mockRejectedValue(Object.assign(new Error("Error 500"), { status: 500 }));
        const getVm = renderVm();
        let result;
        await act(async () => {
            result = await getVm().removeEnvironment("57");
        });
        expect(result).toBe("No se pudo eliminar el ambiente. Intenta nuevamente.");
        expect(mockAppData.removeEnvironment).not.toHaveBeenCalled();
    });

    it("200 elimina de la lista y devuelve null", async () => {
        deleteEnvironment.mockResolvedValue(undefined);
        const getVm = renderVm();
        let result;
        await act(async () => {
            result = await getVm().removeEnvironment("57");
        });
        expect(result).toBeNull();
        expect(mockAppData.removeEnvironment).toHaveBeenCalledWith("57");
    });
});

describe("removeSchedule", () => {
    it("un fallo del servidor devuelve mensaje y no quita el horario local", async () => {
        deleteBlock.mockRejectedValue(Object.assign(new Error("Error 500"), { status: 500 }));
        const getVm = renderVm();
        let result;
        await act(async () => {
            result = await getVm().removeSchedule("57", "9");
        });
        expect(result).toBe("No se pudo eliminar el horario. Intenta nuevamente.");
        expect(mockAppData.removeSchedule).not.toHaveBeenCalled();
    });

    it("éxito quita el horario y devuelve null", async () => {
        deleteBlock.mockResolvedValue(undefined);
        const getVm = renderVm();
        let result;
        await act(async () => {
            result = await getVm().removeSchedule("57", "9");
        });
        expect(result).toBeNull();
        expect(mockAppData.removeSchedule).toHaveBeenCalledWith("57", "9");
    });
});
