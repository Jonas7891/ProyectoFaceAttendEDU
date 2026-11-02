// AUD-18: los controles táctiles de pantalla sin texto visible (iconos, tarjetas y filas)
// deben exponer accessibilityLabel, y la etiqueta debe estar traducida (sin «{{name}}» sin resolver).
import React from "react";
import { create, act } from "react-test-renderer";
import { TouchableOpacity, Pressable } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../context/ThemeContext";
import { ResponsiveProvider } from "../../context/ResponsiveContext";
import i18n from "../../locales";

jest.mock("@expo/vector-icons", () => ({ Feather: (props) => `Feather:${props.name}` }));
// La etiqueta real sale del catálogo de i18n (con interpolación), no del literal.
jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({
    useTranslation: () => ({ t: (k, o) => require("../../locales").default.t(k, o) }),
}));
jest.mock("react-dom", () => ({ ...jest.requireActual("react-dom"), createPortal: (node) => node }));
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
jest.mock("../../core/hooks/useCourseDetails", () => ({ useCourseDetails: () => ({}) }));
jest.mock("../../context/AuthContext", () => ({ useAuth: () => ({ user: {} }) }));
jest.mock("../../context/AppDataContext", () => ({ useAppData: () => ({ courses: [] }) }));
jest.mock("../authorized/courses/modals", () => ({
    CourseDetailModal: () => null,
    RegisterCourseModal: () => null,
    EditCourseModal: () => null,
    ImportCoursesModal: () => null,
}));

import { PasswordPolicyModal } from "../components/auth/PasswordPolicyModal";
import { ExportConfigModal } from "../components/reports/ExportConfigModal";
import { ColorPresetSelector } from "../components/settings/tabs/ColorPresetSelector";
import { AtRiskStudentsList } from "../components/dashboard/AtRiskStudentsList";
import { PerfectAttendanceList } from "../components/dashboard/PerfectAttendanceList";
import { InstructorAttendanceList } from "../components/dashboard/InstructorAttendanceList";
import { TopPerformingGroups } from "../components/dashboard/TopPerformingGroups";
import { EnvironmentCard } from "../components/environments/EnvironmentCard";
import { AuthFooterLink } from "../components/auth/AuthComponents";
import StudentDetailModal from "../components/users/StudentDetailModal";
import UsersTable from "../authorized/users/sections/UsersTable";
import { CourseCard } from "../authorized/courses/AdminCourses";

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

const textOf = (n) => (n == null ? "" : typeof n === "string" ? n : Array.isArray(n) ? n.map(textOf).join("") : textOf(n.children));
const instanceText = (inst) => inst.children.map((c) => (typeof c === "string" ? c : instanceText(c))).join("");

const touchables = (root) => root.root.findAll((n) => n.type === TouchableOpacity || n.type === Pressable);

// Controles táctiles del árbol que no tienen etiqueta accesible ni texto visible.
const unnamedTouchables = (root) => touchables(root).filter((n) => !n.props.accessibilityLabel && !instanceText(n).trim());

const labelsOf = (root) => touchables(root).map((n) => n.props.accessibilityLabel).filter(Boolean);

function expectAllNamed(root) {
    expect(unnamedTouchables(root).map((n) => String(n.props.onPress))).toEqual([]);
    for (const label of labelsOf(root)) expect(label).not.toMatch(/\{\{|undefined|null/);
}

const student = (id, rate) => ({
    id, name: `Estudiante ${id}`, code: `C-${id}`, fichaName: "ADSI 2758", lastAttendance: "hace 2 días",
    totalAbsences: 4, consecutiveAbsences: 0, daysUntilSanction: 12, streak: "10 días", attendanceRate: rate,
});

describe("controles sin texto visible exponen accessibilityLabel", () => {
    test("password policy modal: close X", () => {
        const root = render(<PasswordPolicyModal visible onClose={() => {}} onResetPassword={() => {}} />);
        expect(labelsOf(root)).toContain("Cerrar");
        expectAllNamed(root);
    });

    test("export config modal: backdrop and close X", () => {
        const root = render(<ExportConfigModal visible onClose={() => {}} onExport={() => {}} selectedCount={2} />);
        expect(labelsOf(root).filter((l) => l === "Cerrar")).toHaveLength(2);
        expectAllNamed(root);
    });

    test("color preset swatches are named after their slot", () => {
        const root = render(<ColorPresetSelector visionMode="base" customColors={{ primary: "#000", success: "#111", warning: "#222", error: "#333", text: "#444" }} selectedSemantic="primary" onPresetSelect={() => {}} />);
        expect(labelsOf(root)).toContain("Color Primario");
        expectAllNamed(root);
    });

    test("student rows (at-risk, perfect) are named after the student", () => {
        const risk = render(<AtRiskStudentsList students={[student(1, 75)]} />);
        expect(labelsOf(risk)).toContain("Ver detalle de Estudiante 1");
        expectAllNamed(risk);
        const perfect = render(<PerfectAttendanceList students={[student(2, 100)]} />);
        expect(labelsOf(perfect)).toContain("Ver detalle de Estudiante 2");
        expectAllNamed(perfect);
    });

    test("instructor and ficha rows are named", () => {
        const instr = render(<InstructorAttendanceList instructors={[{ id: 1, instructorName: "Carlos Ruiz", attendanceRate: 90, totalCourses: 1, totalStudents: 5 }]} />);
        expect(labelsOf(instr)).toContain("Ver detalle de Carlos Ruiz");
        const fichas = render(<TopPerformingGroups fichas={[{ id: "2758", code: "2758", name: "ADSI", instructor: "Carlos", totalStudents: 3, activeStudents: 3, avgAttendance: 90 }]} />);
        expect(labelsOf(fichas)).toContain("Ver detalle de ADSI");
    });

    test("environment and course cards are named", () => {
        const env = render(<EnvironmentCard environment={{ id: 1, number: "A-101", name: "Sala de cómputo", description: "x", capacity: 20, schedules: [] }} onPress={() => {}} />);
        expect(labelsOf(env)).toContain("Ver detalle de Sala de cómputo");
        const course = render(<CourseCard course={{ id: "1", code: "QBD", name: "Bases de Datos", students: 3, avgAttendance: 80 }} onPress={() => {}} />);
        expect(labelsOf(course)).toContain("Ver detalle de Bases de Datos");
    });

    test("users table rows (desktop) are named after the user", () => {
        const columns = [{ id: "name", label: "Nombre", width: 1, render: (u) => u.name }];
        const root = render(<UsersTable columns={columns} data={[{ id: 1, name: "Ana Pérez", code: "1" }]} onRowPress={() => {}} />);
        expect(labelsOf(root)).toContain("Ver detalle de Ana Pérez");
    });

    test("student detail modal: backdrop and close X", () => {
        const root = render(<StudentDetailModal visible student={{ id: 1, name: "Ana Pérez", code: "1", status: "active", attendance: 90 }} onClose={() => {}} />);
        expect(labelsOf(root).filter((l) => l === "Cerrar").length).toBeGreaterThanOrEqual(2);
    });

    test("auth footer link keeps its visible text and is a button", () => {
        const root = render(<AuthFooterLink prompt="¿No tienes cuenta?" linkLabel="Regístrate aquí" onPress={() => {}} />);
        const [link] = root.root.findAll((n) => n.type === TouchableOpacity);
        expect(link.props.accessibilityRole).toBe("button");
        expect(textOf(root.toJSON())).toContain("Regístrate aquí");
    });

    test("the new keys exist in every language", () => {
        for (const lng of ["en", "pt", "fr"]) {
            for (const key of ["Mostrar contraseña", "Ocultar contraseña", "Ver detalle de {{name}}", "Exportar registros seleccionados", "Mostrar opciones", "Color {{name}}"]) {
                expect(i18n.t(key, { lng, name: "X" })).not.toBe(key);
            }
        }
    });
});
