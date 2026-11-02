import React from "react";
import { create, act } from "react-test-renderer";
import { Button } from "../components/common/buttons/Button";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
let mockUser = null;
let mockTabs = [];

jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));
jest.mock("../../core/utils/i18n/hooks/useTranslation", () => ({ useTranslation: () => ({ t: (s) => s }) }));
jest.mock("../../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser }) }));
jest.mock("../../viewmodels/useRolePermissions", () => ({
    useRolePermissions: () => ({ visibleTabs: mockTabs }),
}));
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

import { ThemeProvider } from "../../context/ThemeContext";
import { NotAuthorized, AUTH_EXCEPTION_TYPES } from "../NotAuthorized";

function render(type) {
    let tree;
    act(() => {
        tree = create(<ThemeProvider><NotAuthorized type={type} /></ThemeProvider>);
    });
    act(() => { jest.advanceTimersByTime(200); });
    return tree;
}
const label = (btn) => [].concat(btn.props.children).join("");

beforeEach(() => { jest.useFakeTimers(); mockNavigate.mockClear(); });
afterEach(() => jest.useRealTimers());

describe("NotAuthorized - acceso denegado (AUD-55)", () => {
    it("con sesión activa ofrece «Volver al inicio» y navega al Dashboard", () => {
        mockUser = { role: "student" };
        mockTabs = ["dashboard", "history"];
        const btn = render(AUTH_EXCEPTION_TYPES.INSUFFICIENT_PERMISSIONS).root.findByType(Button);
        expect(label(btn)).toBe("Volver al inicio");
        act(() => btn.props.onPress());
        expect(mockNavigate).toHaveBeenCalledWith("Dashboard");
    });

    it("con sesión activa no ofrece «Iniciar sesión»", () => {
        mockUser = { role: "teacher" };
        mockTabs = ["dashboard"];
        const tree = render(AUTH_EXCEPTION_TYPES.INSUFFICIENT_PERMISSIONS);
        expect(JSON.stringify(tree.toJSON())).not.toContain("Iniciar sesión");
    });

    it("sin sesión conserva «Iniciar sesión» y va al login", () => {
        mockUser = null;
        mockTabs = [];
        const btn = render(AUTH_EXCEPTION_TYPES.NO_SESSION).root.findByType(Button);
        expect(label(btn)).toBe("Iniciar sesión");
        act(() => btn.props.onPress());
        expect(mockNavigate).toHaveBeenCalledWith("FaceAttendEDU-Login");
    });
});
