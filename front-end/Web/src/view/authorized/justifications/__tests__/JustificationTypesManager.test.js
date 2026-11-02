import React from "react";
import { create, act } from "react-test-renderer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../context/ThemeContext";
import { ResponsiveProvider } from "../../../../context/ResponsiveContext";
import { JustificationTypesManager } from "../JustificationTypesManager";
import { justificationTypeErrorMessage } from "../justificationTypeErrors";

jest.mock("@expo/vector-icons", () => ({ Feather: (props) => `Feather:${props.name}` }));

jest.mock("../../../components/common/modals/BaseModal", () => ({
    BaseModal: ({ visible, children }) => (visible ? children : null),
}));

let mockUser;
jest.mock("../../../../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser }) }));
jest.mock("../../../../services/api/attendanceApi", () => ({
    attendanceApi: {
        listJustificationTypes: jest.fn(),
        createJustificationType: jest.fn(),
        updateJustificationType: jest.fn(),
        deleteJustificationType: jest.fn(),
    },
}));
const { attendanceApi } = require("../../../../services/api/attendanceApi");

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const METRICS = { frame: { x: 0, y: 0, width: 1280, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

const TYPES = [
    { justificationTypeId: 1, name: "Calamidad", schoolId: null, requiresAttachment: true },
    { justificationTypeId: 2, name: "Cita propia", schoolId: 3, requiresAttachment: false },
];

async function render() {
    let root;
    await act(async () => {
        root = create(
            <SafeAreaProvider initialMetrics={METRICS}>
                <ThemeProvider><ResponsiveProvider><JustificationTypesManager /></ResponsiveProvider></ThemeProvider>
            </SafeAreaProvider>,
        );
    });
    return root;
}

const textOf = (root) => JSON.stringify(root.toJSON());
const countText = (root, text) => (textOf(root).match(new RegExp(`"${text}"`, "g")) || []).length;

describe("tipos de justificación: alcance global solo para el Super Admin (AUD-40)", () => {
    beforeEach(() => {
        attendanceApi.listJustificationTypes.mockResolvedValue(TYPES);
    });

    test("el Administrador de sede no ve Editar/Eliminar en tipos globales", async () => {
        mockUser = { schoolId: 3, role: "admin", roles: ["Administrador"] };
        const root = await render();
        expect(countText(root, "Editar")).toBe(1);
        expect(countText(root, "Eliminar")).toBe(1);
    });

    test("el Super Admin conserva Editar/Eliminar en ambos", async () => {
        mockUser = { schoolId: null, role: "admin", roles: ["Super Administrador"] };
        const root = await render();
        expect(countText(root, "Editar")).toBe(2);
        expect(countText(root, "Eliminar")).toBe(2);
    });

    test("el Administrador de sede no ve la opción de alcance global al crear", async () => {
        mockUser = { schoolId: 3, role: "admin", roles: ["Administrador"] };
        const root = await render();
        await act(async () => { root.root.findAllByProps({ variant: "primary", size: "sm" })[0].props.onPress(); });
        expect(textOf(root)).not.toContain("Todas las sedes");
    });

    test("el Super Admin sí ve la opción global al crear", async () => {
        mockUser = { schoolId: null, role: "admin", roles: ["Super Administrador"] };
        const root = await render();
        await act(async () => { root.root.findAllByProps({ variant: "primary", size: "sm" })[0].props.onPress(); });
        expect(textOf(root)).toContain("Todas las sedes");
    });
});

describe("mensajes de error del servidor en español", () => {
    test.each([
        [403, /permiso/i],
        [409, /ya existe|conflicto|choca/i],
    ])("estado %s se explica sin mostrar «Error %s»", (status, pattern) => {
        const msg = justificationTypeErrorMessage({ status, message: `Error ${status}` }, "No se pudo guardar el tipo.");
        expect(msg).toMatch(pattern);
        expect(msg).not.toMatch(/^Error \d+$/);
    });

    test("otros errores usan el mensaje del servidor o el de reserva", () => {
        expect(justificationTypeErrorMessage({ status: 500, message: "Boom" }, "fallback")).toBe("Boom");
        expect(justificationTypeErrorMessage({ status: 500, message: "Error 500" }, "fallback")).toBe("fallback");
        expect(justificationTypeErrorMessage(null, "fallback")).toBe("fallback");
    });
});
