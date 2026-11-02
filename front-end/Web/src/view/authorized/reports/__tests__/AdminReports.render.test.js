import React from "react";
import { create, act } from "react-test-renderer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../context/ThemeContext";
import { ResponsiveProvider } from "../../../../context/ResponsiveContext";
import { AdminReports } from "../AdminReports";

// Icon fonts cannot load under jest; the icon keeps its name/size/color in the tree.
jest.mock("@expo/vector-icons", () => ({ Feather: (props) => `Feather:${props.name}:${props.size}:${props.color}` }));
jest.mock("../sections", () => ({ HistoricosSection: () => null }));

const mockStudents = [];
const mockCourses = [];
jest.mock("../../../../context/AppDataContext", () => ({
    useAppData: () => ({ students: mockStudents, courses: mockCourses, isLoading: false }),
}));
const mockAuth = { user: { id: "u-1", role: "admin", academicActorId: 10 } };
jest.mock("../../../../context/AuthContext", () => ({ useAuth: () => mockAuth }));

// The at-risk rows come straight from the fixture; thresholds stay real.
const mockAtRisk = [];
const mockAtRiskInput = { current: null };
jest.mock("../../../../models/data/userDerivedData", () => ({
    ...jest.requireActual("../../../../models/data/userDerivedData"),
    getAtRiskStudents: (students) => {
        mockAtRiskInput.current = students;
        return mockAtRisk;
    },
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const METRICS = { frame: { x: 0, y: 0, width: 1280, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

function render(element) {
    let root;
    act(() => {
        root = create(
            <SafeAreaProvider initialMetrics={METRICS}>
                <ThemeProvider><ResponsiveProvider>{element}</ResponsiveProvider></ThemeProvider>
            </SafeAreaProvider>,
        );
    });
    return root;
}

const atRisk = (studentId, extra) => ({
    studentId,
    name: `Estudiante ${studentId}`,
    code: `C-${studentId}`,
    ficha: "f1",
    fichaName: "ADSI 2758",
    attendanceRate: 76,
    totalAbsences: 4,
    consecutiveAbsences: 0,
    daysUntilSanction: 12,
    hasExceededConsecutiveDays: false,
    lastAttendance: "hace 2 días",
    ...extra,
});

// One row per risk message: consecutive days, sanction reached, days left,
// below minimum, and the generic follow-up fallback.
const ROWS = [
    atRisk(1, { attendanceRate: 50, consecutiveAbsences: 4, hasExceededConsecutiveDays: true }),
    atRisk(2, { attendanceRate: 65, daysUntilSanction: 0 }),
    atRisk(3, { attendanceRate: 78, daysUntilSanction: 3, consecutiveAbsences: 2 }),
    atRisk(4, { attendanceRate: 75.5 }),
    atRisk(5, { attendanceRate: 85, lastAttendance: undefined }),
];

describe("AdminReports at-risk view render", () => {
    beforeEach(() => {
        mockStudents.length = 0;
        mockCourses.length = 0;
        mockAtRisk.length = 0;
        mockAuth.user = { id: "u-1", role: "admin", academicActorId: 10 };
    });

    test("every risk message and row style", () => {
        mockAtRisk.push(...ROWS);
        mockStudents.push(...ROWS.map((r) => ({ id: r.studentId })));
        expect(render(<AdminReports />).toJSON()).toMatchSnapshot();
    });

    // AUD-46: el instructor solo evalúa riesgo sobre sus alumnos (con matrícula en sus cursos).
    test("a teacher only gets the students of their own courses", () => {
        mockAuth.user = { id: "u-1", role: "teacher", academicActorId: 10 };
        mockCourses.push(
            { id: "1", code: "QBD", instructorActorIds: [10] },
            { id: "2", code: "QCA", instructorActorIds: [99] },
        );
        mockStudents.push(
            { id: "1", courseIds: ["1"] },
            { id: "2", courseIds: ["2"] },
            { id: "3", courseIds: [] },
        );
        render(<AdminReports />);
        expect(mockAtRiskInput.current.map((s) => s.id)).toEqual(["1"]);
    });

    test("an admin keeps the whole school", () => {
        mockAuth.user = { id: "u-9", role: "admin" };
        mockStudents.push({ id: "1", courseIds: ["1"] }, { id: "3", courseIds: [] });
        render(<AdminReports />);
        expect(mockAtRiskInput.current.map((s) => s.id)).toEqual(["1", "3"]);
    });

    // AUD-41: restos de JSX tras el PageHeader se pintaban como texto suelto.
    test("no JSX leftovers are rendered as loose text", () => {
        mockAtRisk.push(...ROWS);
        mockStudents.push(...ROWS.map((r) => ({ id: r.studentId })));
        const texts = [];
        const walk = (node) => {
            if (node == null) return;
            if (typeof node === "string") texts.push(node);
            else if (Array.isArray(node)) node.forEach(walk);
            else walk(node.children);
        };
        walk(render(<AdminReports />).toJSON());
        expect(texts.filter((text) => /[}>]/.test(text))).toEqual([]);
    });

    test("empty state", () => {
        expect(render(<AdminReports />).toJSON()).toMatchSnapshot();
    });
});
