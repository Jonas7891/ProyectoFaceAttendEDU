import React from "react";
import { create, act } from "react-test-renderer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../context/ThemeContext";
import { ResponsiveProvider } from "../../../../context/ResponsiveContext";
import { AdminSettings } from "../AdminSettings";
import { SessionTimeInput } from "../sections";

jest.mock("@expo/vector-icons", () => ({ Feather: (props) => `Feather:${props.name}` }));

let mockUser = { schoolId: 3, roles: ["Administrador"] };
jest.mock("../../../../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser }) }));
jest.mock("../../../../services/api/settingsPersistence", () => ({
    pushInstitutionConfig: jest.fn(),
    loadBackendOverrides: () => new Promise(() => {}),
    parseSetting: (v) => v,
}));
jest.mock("../../../../services/api/periodSync", () => ({ syncAcademicPeriodFromSettings: jest.fn() }));

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

describe("tiempo de sesión: solo editable si realmente se guarda en el servidor (AUD-49)", () => {
    test("el Administrador de sede lo ve en solo lectura", () => {
        mockUser = { schoolId: 3, roles: ["Administrador"] };
        const input = render(<AdminSettings section="security" />).root.findByType(SessionTimeInput);
        expect(input.props.readOnly).toBe(true);
    });

    test("el Super Admin sí puede editarlo", () => {
        mockUser = { schoolId: null, roles: ["Super Administrador"] };
        const input = render(<AdminSettings section="security" />).root.findByType(SessionTimeInput);
        expect(input.props.readOnly).toBeFalsy();
    });
});
