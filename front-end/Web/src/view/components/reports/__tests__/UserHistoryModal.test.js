import React from "react";
import { create, act } from "react-test-renderer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../context/ThemeContext";
import { ResponsiveProvider } from "../../../../context/ResponsiveContext";
import { LanguageProvider, i18n } from "../../../../core/utils/i18n/context/LanguageContext";
import { LanguageStorage } from "../../../../core/utils/i18n/storage/LanguageStorage";
import UserHistoryModal from "../UserHistoryModal";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("react-native-web/dist/exports/Modal", () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock("../../common/animation/AnimatedDropdown", () => ({
    AnimatedDropdown: (props) => require("react").createElement("AnimatedDropdown", props),
}));
const mockData = { students: [], courses: [], environments: [] };
jest.mock("../../../../context/AppDataContext", () => ({ useAppData: () => mockData }));
jest.mock("../../../../core/config/institutionConfig", () => ({
    ...jest.requireActual("../../../../core/config/institutionConfig"),
    getInstitutionConfig: () => ({ academicPeriodType: "semestral", dateFormat: "DD/MM/YYYY" }),
    onInstitutionConfigChange: () => () => {},
}));

const METRICS = { frame: { x: 0, y: 0, width: 1280, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

let root;
async function render(props) {
    await act(async () => {
        root = create(
            <SafeAreaProvider initialMetrics={METRICS}>
                <LanguageProvider><ThemeProvider><ResponsiveProvider>
                    <UserHistoryModal onClose={() => {}} {...props} />
                </ResponsiveProvider></ThemeProvider></LanguageProvider>
            </SafeAreaProvider>,
        );
    });
}
const text = () => JSON.stringify(root.toJSON());

beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 8, 10));
    jest.spyOn(console, "log").mockImplementation(() => {});
    await i18n.changeLanguage("es");
    mockData.students = [{
        id: "s1", name: "Ana", course: "2758",
        attendanceHistory: [
            { date: "2026-03-02", present: true },
            { date: "2026-10-01", present: true, checkInTime: "07:02", checkOutTime: "12:00" },
            { date: "2026-10-02", present: true, late: true, checkInTime: "07:20" },
            { date: "2026-10-05", present: false },
        ],
    }];
    mockData.courses = [{ code: "2758", name: "ADSI", room: "e1" }];
    mockData.environments = [{ id: "e1", number: "A-101", schedules: [{ courseCode: "2758", instructorName: "Prof. Rojas", instructor: "t1" }] }];
});
afterEach(() => { act(() => root?.unmount()); jest.useRealTimers(); jest.restoreAllMocks(); });

test("nothing renders for an unknown student", async () => {
    await render({ user: { id: "nadie" } });
    expect(text()).not.toContain("Historial de asistencia");
});

test("the current period shows its records, newest first, with room, teacher and times", async () => {
    await render({ user: { id: "s1" } });
    const t = text();
    expect(t).toContain("ADSI");
    expect(t).toContain("Salón A-101");
    expect(t).toContain("Prof. Rojas");
    expect(t).toContain("Entrada: 07:02");
    expect(t).toContain("Salida: 12:00");
    expect(t.indexOf("05/10/2026")).toBeLessThan(t.indexOf("01/10/2026"));
    expect(t).not.toContain("02/03/2026"); // first semester, outside the current period
    expect(t).toContain("66.7");
});

test("choosing another period filters the history", async () => {
    await render({ user: { studentId: "s1", id: "s1-2026-10-01" } });
    const dropdown = root.root.findByType("AnimatedDropdown");
    expect(dropdown.props.items.map((i) => i.label)).toEqual(["Primer Semestre", "Segundo Semestre • Actual"]);
    expect(dropdown.props.items[0].description).toMatch(/^Semanas 1-\d+$/);

    act(() => dropdown.props.onSelect(dropdown.props.items[0].value));
    expect(text()).toContain("02/03/2026");
    expect(text()).not.toContain("05/10/2026");
    act(() => dropdown.props.onSelect("unknown-period"));
    expect(text()).toContain("02/03/2026");
});

test("labels follow the app language", async () => {
    // The provider applies the saved language on mount, as the app does.
    jest.spyOn(LanguageStorage, "load").mockResolvedValue("en");
    await render({ user: { id: "s1" } });
    await act(async () => { await Promise.resolve(); });
    expect(text()).toContain("Room A-101");
    expect(text()).toContain("Check-in: 07:02");
    expect(root.root.findByType("AnimatedDropdown").props.items[1].label).toBe("Segundo Semestre • Current");
});

test("a student without records in the period sees the empty state", async () => {
    mockData.students[0].attendanceHistory = [];
    await render({ user: { id: "s1" } });
    expect(text()).toContain("Sin registros de asistencia");
    expect(text()).toContain("Este usuario aún no tiene registros de asistencia");
});
