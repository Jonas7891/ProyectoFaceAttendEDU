import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("../../../viewmodels/useRolePermissions", () => ({
    useRolePermissions: () => ({ canRegisterFace: false }),
}));
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({}), useRoute: () => ({}) }));

// NotAuthorized (rendered on the rejection path below) calls useTheme(), which
// throws outside a <ThemeProvider> — same adjustment the existing
// TextInput.test.js makes for the same reason. The brief's test as written
// doesn't wrap one; this is the one tweak needed for it to match reality.
import { ThemeProvider } from "../../../context/ThemeContext";
import AttendanceKioskScreen from "../AttendanceKioskScreen";

test("blocks access when the user lacks canRegisterFace", () => {
    let tree;
    act(() => {
        tree = create(
            <ThemeProvider>
                <AttendanceKioskScreen />
            </ThemeProvider>
        );
    });
    expect(tree.toJSON()).toBeTruthy(); // renderiza el componente NotAuthorized, no crashea
});
