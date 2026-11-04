// AUD-52: una semana sin registros mostraba «Tasa 0 % / Puntualidad 0 %» y «Tendencia → 0.0 %»
// como si fueran cifras. Sin datos reales se muestra «—» y la tendencia solo aparece al
// comparar dos semanas con datos.
import React from "react";
import { create, act } from "react-test-renderer";
import { ThemeProvider } from "../../../../context/ThemeContext";
import { DailyBarChart } from "../DailyBarChart";
import { WeeklyTrend } from "../WeeklyTrend";

jest.mock("@expo/vector-icons", () => ({ Feather: (props) => `Feather:${props.name}` }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const flat = (node) =>
    node == null ? [] : typeof node === "string" ? [node] : Array.isArray(node) ? node.flatMap(flat) : flat(node.children);

function render(element) {
    let root;
    act(() => {
        root = create(<ThemeProvider>{element}</ThemeProvider>);
    });
    return root;
}

const EMPTY_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie"].map((day) => ({ day, present: 0, late: 0, absent: 0 }));

describe("DailyBarChart sin registros", () => {
    it("Tasa y Puntualidad muestran «—», no 0 %", () => {
        const text = flat(render(<DailyBarChart data={EMPTY_WEEK} showSummary />).toJSON()).join(" ");
        expect(text).toContain("—");
        expect(text).not.toMatch(/(^|\s)0%/);
    });
});

describe("WeeklyTrend", () => {
    // Semana actual del año con las semanas de la ventana visible sin datos reales.
    it("no muestra «Tendencia» sin dos semanas con datos reales", () => {
        const text = flat(render(<WeeklyTrend data={[]} />).toJSON()).join(" ");
        expect(text).not.toContain("Tendencia");
    });

    it("con una sola semana real tampoco hay tendencia", () => {
        const week = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 86400000 / 7) + 1;
        const text = flat(
            render(<WeeklyTrend data={[{ week: `Sem ${week}`, rate: 80, dailyData: EMPTY_WEEK }]} />).toJSON(),
        ).join(" ");
        expect(text).not.toContain("Tendencia");
    });

    it("con dos semanas reales muestra la diferencia entre ellas", () => {
        const week = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 86400000 / 7) + 1;
        if (week < 2) return;
        const text = flat(
            render(
                <WeeklyTrend
                    data={[
                        { week: `Sem ${week - 1}`, rate: 60, dailyData: EMPTY_WEEK },
                        { week: `Sem ${week}`, rate: 75, dailyData: EMPTY_WEEK },
                    ]}
                />,
            ).toJSON(),
        ).join(" ");
        expect(text).toContain("Tendencia");
        expect(text).toMatch(/15\.0 ?%/);
    });
});
