import React from "react";
import { create, act } from "react-test-renderer";
import { ThemeProvider } from "../../../../../context/ThemeContext";
import { DateRangePicker } from "../DateRangePicker";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@expo/vector-icons", () => ({ Feather: (p) => `Feather:${p.name}` }));
jest.mock("../../../common/inputs/DateInput", () => ({
    DateInput: (props) => require("react").createElement("DateInput", props),
}));

let root;
function render(props) {
    act(() => {
        root = create(
            <ThemeProvider>
                <DateRangePicker onStartDateChange={jest.fn()} onEndDateChange={jest.fn()} {...props} />
            </ThemeProvider>,
        );
    });
    return root.root.findByType(DateRangePicker).props;
}
const text = () => JSON.stringify(root.toJSON());
const inputs = () => root.root.findAllByType("DateInput");

beforeEach(() => jest.useFakeTimers().setSystemTime(new Date(2026, 10, 8, 10)));
afterEach(() => { act(() => root.unmount()); jest.useRealTimers(); });

test("asks for both dates until they are set", () => {
    render({ startDate: "2026-07-13", periodType: "semestral" });
    expect(text()).toContain("Selecciona ambas fechas");
    expect(text()).toContain("Feather:info");
    expect(inputs().map((i) => i.props.error)).toEqual([false, false]);
});

test.each([
    ["2026-02-30", "2026-06-30", "Fecha incompleta o inválida"],
    ["2026-01-19", "2026-13-01", "Fecha incompleta o inválida"],
    ["2026-06-30", "2026-01-19", "La fecha de fin debe ser posterior a la fecha de inicio"],
    ["2026-01-19", "2026-02-10", "El período debe durar al menos 4 semanas (28 días)"],
])("%s → %s is rejected", (startDate, endDate, message) => {
    render({ startDate, endDate, periodType: "semestral" });
    expect(text()).toContain(message);
    expect(inputs().every((i) => i.props.error)).toBe(true);
});

test.each([
    ["trimestral", "2026-01-01", "2026-05-30", 3],
    ["cuatrimestral", "2026-01-01", "2026-06-30", 4],
    ["semestral", "2026-01-01", "2026-08-30", 6],
    ["anual", "2026-01-01", "2027-03-01", 12],
])("a %s period cannot last more than its months", (periodType, startDate, endDate, max) => {
    render({ startDate, endDate, periodType });
    expect(text()).toContain(`no puede durar más de`);
    expect(text()).toContain(`${max} meses`);
});

test("a valid range shows its length in days, weeks and months", () => {
    render({ startDate: "2026-07-13", endDate: "2026-12-04", periodType: "semestral" });
    const t = text();
    expect(t).toContain("Feather:check-circle");
    expect(t).toContain("144");
    expect(t).toContain("21");
    expect(t).toContain("5");
    expect(inputs().every((i) => i.props.success)).toBe(true);
});

test("Suggest dates fills the calendar period that contains today", () => {
    let suggest;
    const props = render({ periodType: "semestral", onSuggestDatesRef: (fn) => { suggest = fn; } });
    act(() => suggest());
    expect(props.onStartDateChange).toHaveBeenCalledWith("2026-07-01");
    expect(props.onEndDateChange).toHaveBeenCalledWith("2026-12-31");
});

test("typing in either field reports the new ISO date", () => {
    const props = render({ periodType: "trimestral" });
    act(() => inputs()[0].props.onChangeText("2026-10-01"));
    act(() => inputs()[1].props.onChangeText("2026-12-31"));
    expect(props.onStartDateChange).toHaveBeenCalledWith("2026-10-01");
    expect(props.onEndDateChange).toHaveBeenCalledWith("2026-12-31");
});
