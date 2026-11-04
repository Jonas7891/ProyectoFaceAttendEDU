// AUD-48: la ficha del curso rotulaba «Última vez con <docente>» al docente de una clase FUTURA
// (y, en «Mis cursos» del docente, a él mismo). Un horario futuro no es una «última vez».
import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const farDay = DAYS[(new Date().getDay() + 4) % 7]; // 4 días adelante: ni hoy ni mañana ni <=2

const mockData = {
    environments: [
        {
            id: 1,
            number: "A-101",
            schedules: [{ courseCode: "QBD", days: [farDay], startTime: "08:00", endTime: "10:00", instructorName: "Carlos Restrepo" }],
        },
    ],
    students: [],
};
jest.mock("../../../context/AppDataContext", () => ({ useAppData: () => mockData }));
jest.mock("../../../view/components/hooks/useDateFormat", () => ({ useDateFormat: () => ({ formatDate: (d) => String(d) }) }));

import { useCourseDetails } from "../useCourseDetails";

test("a class more than two days away is not labelled «Última vez con»", () => {
    let out;
    function Probe() {
        out = useCourseDetails({ id: "1", code: "QBD", name: "Bases", professor: "Carlos Restrepo" });
        return null;
    }
    act(() => {
        create(<Probe />);
    });
    expect(out.currentInstructor).not.toMatch(/Última vez/);
    expect(out.currentInstructor).toContain("Carlos Restrepo");
});
