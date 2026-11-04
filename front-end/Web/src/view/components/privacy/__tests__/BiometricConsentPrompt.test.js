import React from "react";
import { create, act } from "react-test-renderer";
import { Text } from "react-native";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("../../common", () => {
    const React = require("react");
    const { Text, View } = require("react-native");
    return {
        Button: ({ children, onPress }) => React.createElement(Text, { onPress, testID: "button" }, children),
        Checkbox: ({ label }) => React.createElement(Text, { testID: "checkbox" }, label),
    };
});
jest.mock("../PrivacyNotice", () => () => null);
jest.mock("../../hooks/useTheme", () => ({
    useTheme: () => ({
        theme: { colors: new Proxy({}, { get: () => new Proxy({}, { get: () => "#000" }) }) },
    }),
}));
jest.mock("../../../../core/utils/i18n/hooks/useTranslation", () => ({
    useTranslation: () => ({ t: (s) => s }),
}));
let mockUser = { role: "teacher" };
jest.mock("../../../../context/AuthContext", () => ({ useAuth: () => ({ user: mockUser }) }));

import BiometricConsentPrompt, { useCanRecordBiometricConsent } from "../BiometricConsentPrompt";

const render = (props) => {
    let tree;
    act(() => {
        tree = create(<BiometricConsentPrompt personName="Valentina" onAuthorize={jest.fn()} {...props} />);
    });
    return tree;
};

test("without permission to record it, the holder's consent cannot be ticked on their behalf", () => {
    const tree = render({ canRegister: false });
    expect(tree.root.findAllByProps({ testID: "checkbox" })).toHaveLength(0);
    expect(tree.root.findAllByProps({ testID: "button" })).toHaveLength(0);
    expect(JSON.stringify(tree.toJSON())).toContain("Falta la autorización de datos biométricos");
    expect(JSON.stringify(tree.toJSON())).toContain("titular");
});

test("by default the prompt does not offer the checkbox", () => {
    const tree = render({});
    expect(tree.root.findAllByProps({ testID: "checkbox" })).toHaveLength(0);
});

test("an administrator who records the in-person authorization still gets the checkbox", () => {
    const tree = render({ canRegister: true });
    expect(tree.root.findAllByProps({ testID: "checkbox" })).toHaveLength(1);
    expect(tree.root.findAllByProps({ testID: "button" })).toHaveLength(1);
});

test("only administrators may record the consent; instructors may not", () => {
    const probe = (user) => {
        mockUser = user;
        let value;
        function P() {
            value = useCanRecordBiometricConsent();
            return <Text>x</Text>;
        }
        act(() => {
            create(<P />);
        });
        return value;
    };
    expect(probe({ role: "admin" })).toBe(true);
    expect(probe({ role: "teacher" })).toBe(false);
    expect(probe({ role: "student" })).toBe(false);
    expect(probe(null)).toBe(false);
});
