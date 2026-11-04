import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;


jest.mock("../../context/AppDataContext", () => ({
    useAppData: () => ({
        students: [
            { id: "s1", name: "Ana", code: "A1", courseIds: [7], status: "active" },
            { id: "s2", name: "Beto", code: "B1", courseIds: [8], status: "active" },
            { id: "s3", name: "Cami", code: "C1", courseIds: [7, 8], status: "active" },
        ],
        teachers: [],
        admins: [],
        courses: [
            { id: 7, code: "QAB7", name: "Bases", instructorActorIds: [1] },
            { id: 8, code: "QAB8", name: "Redes", instructorActorIds: [1] },
        ],
        isLoading: false,
    }),
}));
jest.mock("../../context/AuthContext", () => ({
    useAuth: () => ({ user: { role: "teacher", academicActorId: 1, schoolId: 2 } }),
}));
jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({ useTranslation: () => ({ t: (s) => s }) }));

import { useUsersViewModel } from "../useUsersViewModel";

function render(...args) {
    let vm;
    function Probe() {
        vm = useUsersViewModel(...args);
        return null;
    }
    act(() => { create(<Probe />); });
    return vm;
}

test("courseId inicial filtra los alumnos de ese curso (AUD-48)", () => {
    const vm = render("students", null, null, "name", "asc", "name", 7);
    expect(vm.courseFilter).toBe("7");
    expect(vm.filteredUsers.map((u) => u.id).sort()).toEqual(["s1", "s3"]);
});

test("sin courseId se muestran todos los alumnos del alcance", () => {
    const vm = render("students");
    expect(vm.filteredUsers).toHaveLength(3);
});
