/* global jest, describe, test, expect */
// AUD-51: «Reportes» en la tarjeta del alumno lanzaba TypeError (onReportsPress sin pasar).
import React from "react";
import { create, act } from "react-test-renderer";
import { ThemeProvider } from "../../../../context/ThemeContext";
import { ResponsiveProvider } from "../../../../context/ResponsiveContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

jest.mock("@expo/vector-icons", () => ({ Feather: (props) => `Feather:${props.name}` }));
jest.mock("../../../../core/utils/i18n/hooks/useTranslation", () => ({
    useTranslation: () => ({ t: (k, o) => require("../../../../locales").default.t(k, o) }),
}));
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: jest.fn() }) }));
jest.mock("../../../../core/hooks/useCourseDetails", () => ({ useCourseDetails: () => ({}) }));
jest.mock("../../../../context/AuthContext", () => ({ useAuth: () => ({ user: {} }) }));
jest.mock("../../../../context/AppDataContext", () => ({ useAppData: () => ({}) }));
jest.mock("../modals", () => ({
    CourseDetailModal: () => null,
    RegisterCourseModal: () => null,
    EditCourseModal: () => null,
    ImportCoursesModal: () => null,
}));

import { CourseCard } from "../AdminCourses";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const METRICS = { frame: { x: 0, y: 0, width: 1280, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
const course = { id: "1", code: "QBD", name: "Bases de Datos", students: 3, avgAttendance: 80 };

function render(props) {
    let root;
    act(() => {
        root = create(
            <SafeAreaProvider initialMetrics={METRICS}>
                <ThemeProvider><ResponsiveProvider><CourseCard course={course} {...props} /></ResponsiveProvider></ThemeProvider>
            </SafeAreaProvider>,
        );
    });
    return root;
}

const textOf = (n) => (n == null ? "" : typeof n === "string" ? n : Array.isArray(n) ? n.map(textOf).join(" ") : textOf(n.children));

test("without onReportsPress (student) the Reportes button is not rendered", () => {
    const text = textOf(render({ onPress: () => {} }).toJSON());
    expect(text).not.toContain("Reportes");
});

test("with onReportsPress (admin/teacher) the Reportes button is rendered and calls it", () => {
    const onReportsPress = jest.fn();
    const root = render({ onPress: () => {}, onReportsPress });
    expect(textOf(root.toJSON())).toContain("Reportes");
    let node = root.root.findAll((n) => n.children.includes("Reportes"))[0];
    while (node && !(node.props.onPress && node.props.onPress.length >= 0 && node.type !== "Text" && typeof node.type !== "string")) node = node.parent;
    const btn = node;
    act(() => btn.props.onPress({ stopPropagation() {} }));
    expect(onReportsPress).toHaveBeenCalledWith(course);
});

// AUD-18: la tarjeta es un control táctil sin etiqueta propia; debe nombrar el curso.
test("the card exposes an accessibilityLabel naming the course", () => {
    const root = render({ onPress: () => {} });
    const [card] = root.root.findAll((n) => n.props.accessibilityLabel);
    expect(card.props.accessibilityLabel).toContain("Bases de Datos");
});
