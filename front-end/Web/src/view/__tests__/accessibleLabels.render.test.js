/* global jest, describe, test, expect */
// AUD-18: los controles táctiles de pantalla sin texto visible (iconos, tarjetas y filas)
// deben exponer accessibilityLabel, y la etiqueta debe estar traducida (sin «{{name}}» sin resolver).
import React from "react";
import { TouchableOpacity } from "react-native";
import i18n from "../../locales";
import { renderWithProviders as render, labelsOf, unnamedTouchables } from "../testUtils/a11yRender";

jest.mock("@expo/vector-icons", () => ({ Feather: (props) => `Feather:${props.name}` }));
// La etiqueta real sale del catálogo de i18n (con interpolación), no del literal.
jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({
    useTranslation: () => ({ t: (k, o) => require("../../locales").default.t(k, o) }),
}));
jest.mock("react-dom", () => ({ ...jest.requireActual("react-dom"), createPortal: (node) => node }));
jest.mock("../../context/AppDataContext", () => ({ useAppData: () => ({ courses: [] }) }));

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

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const noop = () => {};
const student = (id, rate) => ({
    id, name: `Estudiante ${id}`, code: `C-${id}`, fichaName: "ADSI 2758", lastAttendance: "hace 2 días",
    totalAbsences: 4, consecutiveAbsences: 0, daysUntilSanction: 12, streak: "10 días", attendanceRate: rate,
});
const colors = { primary: "#000", success: "#111", warning: "#222", error: "#333", text: "#444" };
const columns = [{ id: "name", label: "Nombre", width: 1, render: (u) => u.name }];

// [caso, fábrica del elemento, etiqueta esperada, veces que debe aparecer]
const CASES = [
    ["password policy modal: close X", () => <PasswordPolicyModal visible onClose={noop} onResetPassword={noop} />, "Cerrar", 1],
    ["export config modal: backdrop and close X", () => <ExportConfigModal visible onClose={noop} onExport={noop} selectedCount={2} />, "Cerrar", 2],
    ["color preset swatches are named after their slot", () => <ColorPresetSelector visionMode="base" customColors={colors} selectedSemantic="primary" onPresetSelect={noop} />, "Color Primario", 1],
    ["at-risk student rows", () => <AtRiskStudentsList students={[student(1, 75)]} />, "Ver detalle de Estudiante 1", 1],
    ["perfect-attendance student rows", () => <PerfectAttendanceList students={[student(2, 100)]} />, "Ver detalle de Estudiante 2", 1],
    ["instructor rows", () => <InstructorAttendanceList instructors={[{ id: 1, instructorName: "Carlos Ruiz", attendanceRate: 90, totalCourses: 1, totalStudents: 5 }]} />, "Ver detalle de Carlos Ruiz", 1],
    ["ficha rows", () => <TopPerformingGroups fichas={[{ id: "2758", code: "2758", name: "ADSI", instructor: "Carlos", totalStudents: 3, activeStudents: 3, avgAttendance: 90 }]} />, "Ver detalle de ADSI", 1],
    ["environment card", () => <EnvironmentCard environment={{ id: 1, number: "A-101", name: "Sala de cómputo", description: "x", capacity: 20, schedules: [] }} onPress={noop} />, "Ver detalle de Sala de cómputo", 1],
    ["users table rows (desktop)", () => <UsersTable columns={columns} data={[{ id: 1, name: "Ana Pérez", code: "1" }]} onRowPress={noop} />, "Ver detalle de Ana Pérez", 1],
    ["student detail modal: backdrop and close X", () => <StudentDetailModal visible student={{ id: 1, name: "Ana Pérez", code: "1", status: "active", attendance: 90 }} onClose={noop} />, "Cerrar", 2],
];

describe("controles sin texto visible exponen accessibilityLabel", () => {
    test.each(CASES)("%s", (_name, makeElement, label, times) => {
        const labels = labelsOf(render(makeElement()));
        expect(labels.filter((l) => l === label)).toHaveLength(times);
        for (const l of labels) expect(l).not.toMatch(/\{\{|undefined|null/);
    });

    test.each(CASES.slice(0, 5))("%s: no touchable is left without name or text", (_name, makeElement) => {
        expect(unnamedTouchables(render(makeElement())).map((n) => String(n.props.onPress))).toEqual([]);
    });

    test("auth footer link keeps its visible text and is a button", () => {
        const root = render(<AuthFooterLink prompt="¿No tienes cuenta?" linkLabel="Regístrate aquí" onPress={noop} />);
        const [link] = root.root.findAll((n) => n.type === TouchableOpacity);
        expect(link.props.accessibilityRole).toBe("button");
        expect(JSON.stringify(root.toJSON())).toContain("Regístrate aquí");
    });

    test.each(["en", "pt", "fr"])("the new keys exist in %s", (lng) => {
        for (const key of ["Mostrar contraseña", "Ocultar contraseña", "Ver detalle de {{name}}", "Exportar registros seleccionados", "Mostrar opciones", "Color {{name}}"]) {
            expect(i18n.t(key, { lng, name: "X" })).not.toBe(key);
        }
    });
});
