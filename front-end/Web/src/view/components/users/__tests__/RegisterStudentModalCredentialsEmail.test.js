// AUD-63: si el correo con las credenciales no salió, el alta no puede
// parecer limpia: el aviso aparece también cuando sigue la captura biométrica.

import React from "react";
import { create, act } from "react-test-renderer";
import { Text } from "react-native";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("react-native-web/dist/exports/Modal", () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock("../../common", () => {
    const React = require("react");
    const { Text, View } = require("react-native");
    const passthrough = ({ children }) => React.createElement(View, null, children);
    return {
        AnimatedDropdown: passthrough,
        TextInput: passthrough,
        PasswordInput: passthrough,
        Checkbox: passthrough,
        BaseModal: ({ visible, children, footer }) =>
            visible ? React.createElement(View, null, children, footer) : null,
        Button: ({ children, onPress, disabled }) =>
            React.createElement(Text, { onPress: disabled ? undefined : onPress, testID: "button" }, children),
    };
});
jest.mock("../../common/inputs/DateInput", () => ({ DateInput: () => null }));
jest.mock("../../hooks/useTheme", () => ({
    useTheme: () => ({
        theme: { colors: new Proxy({}, { get: () => new Proxy({}, { get: () => "#000" }) }) },
    }),
}));
jest.mock("../../hooks/useResponsive", () => ({ useResponsive: () => ({ isSmall: false }) }));
jest.mock("../../../../core/utils/i18n/hooks/useTranslation", () => ({ useTranslation: () => ({ t: (s) => s }) }));
jest.mock("../../../../context/AppDataContext", () => ({ useAppData: () => ({ courses: [], users: [] }) }));
jest.mock("../../../../context/AuthContext", () => ({ useAuth: () => ({ user: { schoolId: 1 } }) }));
jest.mock("../../../../services/api/academicApi", () => ({ academicApi: { listSchools: () => Promise.resolve([]) } }));
jest.mock("../../../../services/api/referenceData", () => ({ listActors: jest.fn().mockResolvedValue([]) }));
jest.mock("../../../../services/api/staffProvisioning", () => ({ documentTypesForRole: () => [] }));
jest.mock("../../../../viewmodels/useStudentsViewModel", () => ({
    ...jest.requireActual("../../../../viewmodels/useStudentsViewModel"),
    validateStudentForm: () => null,
}));
jest.mock("../BiometricEnrollmentModal", () => {
    const React = require("react");
    const { Text } = require("react-native");
    return function MockEnrollmentModal(props) {
        return props.visible ? React.createElement(Text, { testID: "enrollment", onPress: props.onClose }, "ENROLL") : null;
    };
});

import RegisterStudentModal from "../RegisterStudentModal";

const WARNING = "El usuario se creó, pero no se pudo enviar el correo con las credenciales";
const text = (tree) => JSON.stringify(tree.toJSON());
const byTestId = (tree, id) => tree.root.findAll((n) => n.props.testID === id && n.props.onPress);
const saveButton = (tree) =>
    tree.root.findAll((n) => n.props.testID === "button" && n.props.children === "Registrar usuario")[0]
    ?? tree.root.findAll((n) => n.props.testID === "button" && n.props.onPress)[1];

async function submitWith(result) {
    const onSubmit = jest.fn().mockResolvedValue(result);
    let tree;
    await act(async () => {
        tree = create(<RegisterStudentModal visible onClose={jest.fn()} onSubmit={onSubmit} initialRole="teacher" />);
    });
    await act(async () => { await saveButton(tree).props.onPress(); });
    return tree;
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("RegisterStudentModal — correo de credenciales (AUD-63)", () => {
    test("alta sin biometría y correo FAILED: aviso visible", async () => {
        const tree = await submitWith({ credentialsEmail: "FAILED", personId: "p-1", wantFace: false, wantFingerprint: false });
        expect(text(tree)).toContain(WARNING);
    });

    test("alta con biometría y correo FAILED: el aviso aparece al terminar la captura", async () => {
        const tree = await submitWith({ credentialsEmail: "FAILED", personId: "p-1", wantFace: true, wantFingerprint: false });
        expect(byTestId(tree, "enrollment")).toHaveLength(1);
        await act(async () => { byTestId(tree, "enrollment")[0].props.onPress(); });
        expect(text(tree)).toContain(WARNING);
    });

    test("alta con biometría y correo SENT: sin aviso de fallo", async () => {
        const tree = await submitWith({ credentialsEmail: "SENT", personId: "p-1", wantFace: true, wantFingerprint: false });
        await act(async () => { byTestId(tree, "enrollment")[0].props.onPress(); });
        expect(text(tree)).not.toContain(WARNING);
    });

    test("correo SENT sin biometría: sin aviso de fallo", async () => {
        const tree = await submitWith({ credentialsEmail: "SENT", personId: "p-1", wantFace: false, wantFingerprint: false });
        expect(text(tree)).not.toContain(WARNING);
        expect(text(tree)).toContain("Las credenciales se enviaron por correo.");
    });
});
