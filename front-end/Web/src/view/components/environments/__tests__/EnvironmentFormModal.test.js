import React from "react";
import { create, act } from "react-test-renderer";

// The school picker of the register form (only for a Super Admin, who has no
// school of their own) rendered <Text> without importing it: opening "Register
// environment" threw "Text is not defined".

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("../../common", () => {
    const React = require("react");
    const { View } = require("react-native");
    const passthrough = ({ children }) => React.createElement(View, null, children);
    return {
        BaseModal: passthrough,
        Button: passthrough,
        AnimatedDropdown: (props) => React.createElement("AnimatedDropdown", props),
    };
});
jest.mock("../../common/inputs/TextInput", () => (props) => require("react").createElement("TextInput", props));
jest.mock("../../hooks/useTheme", () => ({
    useTheme: () => ({
        theme: { colors: new Proxy({}, { get: () => new Proxy({}, { get: () => "#000" }) }) },
    }),
}));
jest.mock("../../hooks/useResponsive", () => ({ useResponsive: () => ({ isSmall: false }) }));
jest.mock("../../../../core/utils/i18n/hooks/useTranslation", () => ({ useTranslation: () => ({ t: (s) => s }) }));
jest.mock("../../common/feedback/PushNotification", () => ({
    usePushNotification: () => ({ success: jest.fn(), error: jest.fn(), warning: jest.fn() }),
}));
jest.mock("../../../../core/config/institutionConfig", () => ({ getInstitutionConfig: () => ({}) }));
jest.mock("../../../../services/api/academicApi", () => ({ academicApi: { listSchools: jest.fn() } }));
const mockAuth = { user: { id: "u-1", schoolId: null } };
jest.mock("../../../../context/AuthContext", () => ({ useAuth: () => mockAuth }));

import { academicApi } from "../../../../services/api/academicApi";
import EnvironmentFormModal from "../EnvironmentFormModal";

async function render(props) {
    let root;
    await act(async () => {
        root = create(<EnvironmentFormModal visible mode="register" onClose={() => {}} onSubmit={() => {}} {...props} />);
    });
    return root;
}

const texts = (root) => root.root.findAll((n) => typeof n.children?.[0] === "string").map((n) => n.children.join(""));

beforeEach(() => {
    mockAuth.user = { id: "u-1", schoolId: null };
    academicApi.listSchools.mockReset();
});

test("a Super Admin sees the school picker with the schools of the system", async () => {
    academicApi.listSchools.mockResolvedValue([{ schoolId: 7, name: "Camilo Torres", code: "ICT-01" }]);
    const root = await render();
    expect(texts(root)).toContain("Sede *");
    const picker = root.root.findByType("AnimatedDropdown");
    expect(picker.props.items).toEqual([
        { value: "7", label: "Camilo Torres", description: "ICT-01", icon: "map-pin" },
    ]);
});

test("a failed school list is shown under the picker instead of crashing", async () => {
    academicApi.listSchools.mockRejectedValue(new Error("network"));
    const root = await render();
    expect(root.root.findByType("AnimatedDropdown").props.items).toEqual([]);
    expect(texts(root)).toContain("network");
});

test("a school admin gets no picker and the schools are not requested", async () => {
    mockAuth.user = { id: "u-2", schoolId: 3 };
    const root = await render();
    expect(root.root.findAllByType("AnimatedDropdown")).toHaveLength(0);
    expect(academicApi.listSchools).not.toHaveBeenCalled();
});
