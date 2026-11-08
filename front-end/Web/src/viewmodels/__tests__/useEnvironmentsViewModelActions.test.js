import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockAppData = {
    isLoading: false,
    environments: [],
    users: [],
    courses: [],
    fichas: [],
    addEnvironment: jest.fn(async () => {}),
    updateEnvironment: jest.fn(async () => {}),
    removeEnvironment: jest.fn(async () => {}),
};
jest.mock("../../context/AppDataContext", () => ({ useAppData: () => mockAppData }));
jest.mock("../../services/api/environmentManagement", () =>
    require("../../testHelpers/environmentServiceMocks").environmentManagementMock()
);
jest.mock("../../services/api/scheduleBlockManagement", () =>
    require("../../testHelpers/environmentServiceMocks").scheduleBlockManagementMock()
);

import { useEnvironmentsViewModel } from "../useEnvironmentsViewModel";
import { createEnvironment, updateEnvironment, deleteEnvironment } from "../../services/api/environmentManagement";
import { cohortsForCourse } from "../../services/api/scheduleBlockManagement";

let vm;
function Probe() { vm = useEnvironmentsViewModel(); return null; }
const mount = () => act(() => { create(<Probe />); });

const env = (id, number, patch) => ({
    id, number, description: "Aula", capacity: 30,
    schedules: [{ id: "h1", courseCode: "2758", courseName: "ADSI", instructorName: "Carlos Restrepo", days: ["Lun"] }],
    ...patch,
});
const teacher = (id, name, patch) => ({ id, name, role: "teacher", status: "active", code: `D-${id}`, department: "Sistemas", ...patch });

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockAppData.environments = [env("57", "A-101"), env("env_local", "Lab 3", { description: "Laboratorio", schedules: [] })];
    mockAppData.users = [
        teacher("t1", "Carlos Restrepo"), teacher("t2", "Ana Ruiz", { department: "Redes" }),
        teacher("t3", "Inactivo", { status: "inactive" }), { id: "s1", name: "Alumno", role: "student", status: "active" },
    ];
    mount();
});
afterEach(() => console.log.mockRestore());

test("search matches room number, description and the courses taught there", () => {
    act(() => vm.setSearch("lab"));
    expect(vm.filtered.map((e) => e.number)).toEqual(["Lab 3"]);
    act(() => vm.setSearch("restrepo"));
    expect(vm.filtered.map((e) => e.number)).toEqual(["A-101"]);
    act(() => vm.setSearch(""));
    expect(vm.filtered).toHaveLength(2);
});

test("only active teachers can be picked as instructors", () => {
    expect(vm.searchInstructors("  ").map((u) => u.id)).toEqual(["t1", "t2"]);
    expect(vm.searchInstructors("redes").map((u) => u.id)).toEqual(["t2"]);
    expect(vm.searchInstructors("d-t1").map((u) => u.id)).toEqual(["t1"]);
});

test("register needs a number and a school, then creates the room in the backend", async () => {
    let err;
    await act(async () => { err = await vm.registerEnvironment({ number: " ", description: "", capacity: "" }); });
    expect(err).toBe("El número del ambiente es requerido");
    await act(async () => { err = await vm.registerEnvironment({ number: "B-202", description: "", capacity: "", schoolId: "" }); });
    expect(err).toBe("Selecciona la sede");

    createEnvironment.mockResolvedValue({ id: "88", number: "B-202" });
    await act(async () => { err = await vm.registerEnvironment({ number: " B-202 ", description: " ", capacity: "", schoolId: 7 }); });
    expect(err).toBeNull();
    expect(createEnvironment).toHaveBeenCalledWith({ schoolId: "7", code: "B-202", name: "Sin descripción", capacity: 30 });
    expect(mockAppData.addEnvironment).toHaveBeenCalledWith({ id: "88", number: "B-202" });

    createEnvironment.mockRejectedValue(new Error("Código repetido"));
    await act(async () => { err = await vm.registerEnvironment({ number: "B-202", description: "", capacity: "40", schoolId: 7 }); });
    expect(err).toBe("Código repetido");
});

test("edit updates backend rooms, and only the local list for local drafts", async () => {
    let err;
    await act(async () => { err = await vm.editEnvironment("57", { number: "A-102", description: "Teoría", capacity: "45" }); });
    expect(err).toBeNull();
    expect(updateEnvironment).toHaveBeenCalledWith("57", { code: "A-102", name: "Teoría", capacity: 45 });
    expect(mockAppData.updateEnvironment).toHaveBeenCalledWith("57", { number: "A-102", description: "Teoría", capacity: 45 });

    await act(async () => { err = await vm.editEnvironment("env_local", { number: "Lab 4", description: "", capacity: "" }); });
    expect(updateEnvironment).toHaveBeenCalledTimes(1);
    expect(mockAppData.updateEnvironment).toHaveBeenLastCalledWith("env_local", { number: "Lab 4", description: "Sin descripción", capacity: 30 });

    updateEnvironment.mockRejectedValue(new Error(""));
    await act(async () => { err = await vm.editEnvironment("57", { number: "A-102", description: "", capacity: "" }); });
    expect(err).toBe("No se pudo actualizar el ambiente en el backend");
    await act(async () => { err = await vm.editEnvironment("57", { number: "", description: "", capacity: "" }); });
    expect(err).toBe("El número del ambiente es requerido");
});

test("a local draft is removed without calling the backend", async () => {
    let err;
    await act(async () => { err = await vm.removeEnvironment("env_local"); });
    expect(err).toBeNull();
    expect(deleteEnvironment).not.toHaveBeenCalled();
    expect(mockAppData.removeEnvironment).toHaveBeenCalledWith("env_local");
});

test("the cohorts of a course come from the schedule service", () => {
    cohortsForCourse.mockReturnValue([{ value: "53", label: "2758" }]);
    expect(vm.cohortsForCourse("2758")).toEqual([{ value: "53", label: "2758" }]);
});

test("a period advance clears the selected room", () => {
    act(() => window.dispatchEvent(new Event("periodAdvanced")));
    expect(vm.selected).toBeNull();
});
