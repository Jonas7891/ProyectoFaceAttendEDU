// AUD-46: un curso sin ningún registro de asistencia no tiene promedio. Antes se mostraba
// 0 % (o rompía con null); ahora la tarjeta dice «Sin datos» y va al final del ranking.
import React from "react";
import { create, act } from "react-test-renderer";
import { ThemeProvider } from "../../../../context/ThemeContext";
import { TopPerformingGroups } from "../TopPerformingGroups";

jest.mock("@expo/vector-icons", () => ({ Feather: (props) => `Feather:${props.name}` }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const flat = (node) =>
    node == null ? [] : typeof node === "string" ? [node] : Array.isArray(node) ? node.flatMap(flat) : flat(node.children);

const ficha = (code, avgAttendance) => ({
    id: code,
    code,
    name: `Curso ${code}`,
    instructor: "Carlos",
    totalStudents: 3,
    activeStudents: 3,
    avgAttendance,
});

function render(element) {
    let root;
    act(() => {
        root = create(<ThemeProvider>{element}</ThemeProvider>);
    });
    return root;
}

describe("TopPerformingGroups sin datos", () => {
    it("un curso sin promedio dice «Sin datos» y no pinta 0.0 %", () => {
        const text = flat(render(<TopPerformingGroups fichas={[ficha("QBD", null)]} />).toJSON()).join(" ");
        expect(text).toContain("Sin datos");
        expect(text).not.toMatch(/0\.0\s?%|null|NaN/);
    });

    it("los cursos con datos van antes que los que no tienen", () => {
        const text = flat(
            render(<TopPerformingGroups fichas={[ficha("AAA", null), ficha("BBB", 90)]} mode="bottom" />).toJSON(),
        ).join(" ");
        expect(text.indexOf("Curso BBB")).toBeLessThan(text.indexOf("Curso AAA"));
    });
});
