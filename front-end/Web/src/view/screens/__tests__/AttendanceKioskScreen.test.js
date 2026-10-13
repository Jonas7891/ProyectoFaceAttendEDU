import React from "react";
import { create, act } from "react-test-renderer";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("../../../viewmodels/useRolePermissions", () => ({ useRolePermissions: jest.fn() }));
jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({}), useRoute: () => ({}) }));
jest.mock("../../../core/utils/i18n/hooks/useTranslation", () => ({
    useTranslation: () => ({ t: (s) => s }),
}));
// Mocked wholesale for the CapturePanel tests below: those tests target
// AttendanceKioskView's own sequencing logic (arm the reader, then identify
// once a sample exists), not the real browser/SDK capture hooks.
jest.mock("../../../viewmodels/useAttendanceKioskViewModel", () => ({
    useAttendanceKioskViewModel: jest.fn(),
}));
jest.mock("../../../viewmodels/useFaceCapture", () => ({ useFaceCapture: jest.fn() }));
jest.mock("../../../viewmodels/useFingerprintReader", () => ({ useFingerprintReader: jest.fn() }));
// PageHeader also calls useResponsive(), which needs a ResponsiveProvider ->
// SafeAreaProvider chain this test suite has never set up for any screen.
// Unrelated to the sequencing logic under test here, so it's stubbed out
// rather than growing an app-shell provider stack just to satisfy it.
jest.mock("../../components/common/navigation/PageHeader", () => ({
    PageHeader: () => null,
}));
// Feather's real componentDidMount kicks off expo-font/expo-asset loading
// that has no asset registry in this Jest environment; it rejects
// asynchronously and only surfaces once something flushes microtasks (the
// `await act(async () => {})` calls below), misattributed to whichever test
// happens to flush next. Unrelated to the sequencing logic under test.
jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));

// NotAuthorized (rendered on the rejection path below) calls useTheme(), which
// throws outside a <ThemeProvider> — same adjustment the existing
// TextInput.test.js makes for the same reason. The brief's test as written
// doesn't wrap one; this is the one tweak needed for it to match reality.
import { ThemeProvider } from "../../../context/ThemeContext";
import { useRolePermissions } from "../../../viewmodels/useRolePermissions";
import { useAttendanceKioskViewModel } from "../../../viewmodels/useAttendanceKioskViewModel";
import { useFaceCapture } from "../../../viewmodels/useFaceCapture";
import { useFingerprintReader } from "../../../viewmodels/useFingerprintReader";
import { Button } from "../../components/common/buttons/Button";
import AttendanceKioskScreen from "../AttendanceKioskScreen";

function withProviders(children) {
    // NotAuthorized/Card/Button all call useTheme(), which throws outside a
    // <ThemeProvider> — same adjustment the existing TextInput.test.js
    // already makes for the same reason.
    return <ThemeProvider>{children}</ThemeProvider>;
}

function renderScreen() {
    let tree;
    act(() => {
        tree = create(withProviders(<AttendanceKioskScreen />));
    });
    return tree;
}

function rerenderScreen(tree) {
    act(() => {
        tree.update(withProviders(<AttendanceKioskScreen />));
    });
}

function findButton(tree, label) {
    return tree.root.findAllByType(Button).find((b) => b.props.children === label);
}

beforeEach(() => {
    jest.clearAllMocks();
    useRolePermissions.mockReturnValue({ canRegisterFace: false });
    useFaceCapture.mockReturnValue({
        startCamera: jest.fn(),
        cameraReady: false, // keeps the passive face loop out of these tests
        loginFace: jest.fn().mockResolvedValue({}),
    });
});

test("blocks access when the user lacks canRegisterFace", () => {
    const tree = renderScreen();
    expect(tree.toJSON()).toBeTruthy(); // renderiza el componente NotAuthorized, no crashea
});

describe("kiosk fingerprint capture (regression: Usa tu huella used to call loginFingerprint directly)", () => {
    let kioskVm;
    let fingerprint;

    beforeEach(() => {
        useRolePermissions.mockReturnValue({ canRegisterFace: true });

        kioskVm = {
            view: "WAITING",
            todaysBlocks: [],
            startClass: jest.fn(),
            endClass: jest.fn().mockResolvedValue(undefined),
            session: { classSessionId: 1 },
            statusMessage: "",
            socket: null,
            registeredActorIds: new Set(),
            onIdentified: jest.fn(),
            onCaptureError: jest.fn(),
        };
        useAttendanceKioskViewModel.mockReturnValue(kioskVm);

        fingerprint = {
            deviceReady: true,
            sampleReady: false,
            startCapture: jest.fn(),
            loginFingerprint: jest.fn().mockResolvedValue({ person_id: "p1", score: 1 }),
        };
        useFingerprintReader.mockReturnValue(fingerprint);
    });

    test('pressing "Usa tu huella" arms the reader (startCapture) without calling loginFingerprint yet', () => {
        const tree = renderScreen();

        act(() => {
            findButton(tree, "Usa tu huella").props.onPress();
        });

        // This is the exact bug the reviewer caught: the old code called
        // fingerprint.loginFingerprint() straight from the button, which
        // throws synchronously ("Captura una huella primero.") because no
        // sample exists yet — takeSample() inside the real hook reads
        // stateRef.current.sample, only populated by onSamplesAcquired after
        // startCapture() has actually armed the reader.
        expect(fingerprint.startCapture).toHaveBeenCalledTimes(1);
        expect(fingerprint.loginFingerprint).not.toHaveBeenCalled();
        expect(kioskVm.onCaptureError).not.toHaveBeenCalled();
    });

    test("loginFingerprint fires automatically once sampleReady flips true, with no second button press", async () => {
        const tree = renderScreen();

        act(() => {
            findButton(tree, "Usa tu huella").props.onPress();
        });
        expect(fingerprint.loginFingerprint).not.toHaveBeenCalled();

        // Simulates what the real DigitalPersona SDK does via
        // onSamplesAcquired: once a finger is read, the hook flips
        // sampleReady to true on the same (mocked) object reference.
        fingerprint.sampleReady = true;
        rerenderScreen(tree);
        // Flush the loginFingerprint() promise chain + its .finally().
        await act(async () => {});

        expect(fingerprint.loginFingerprint).toHaveBeenCalledTimes(1);
        // Armed only once for this single touch — no extra re-arm loop.
        expect(fingerprint.startCapture).toHaveBeenCalledTimes(1);
        expect(kioskVm.onCaptureError).not.toHaveBeenCalled();

        // activeCapture resets to null once the identify settles: the banner
        // should fall back to the idle WAITING message, and the button
        // should be enabled again for the next student.
        rerenderScreen(tree);
        expect(findButton(tree, "Usa tu huella").props.disabled).toBe(false);
    });

    test("a failed identify surfaces through onCaptureError and does not retry on its own", async () => {
        fingerprint.loginFingerprint = jest.fn().mockRejectedValue(new Error("sin coincidencia"));
        useFingerprintReader.mockReturnValue(fingerprint);

        const tree = renderScreen();
        act(() => {
            findButton(tree, "Usa tu huella").props.onPress();
        });

        fingerprint.sampleReady = true;
        rerenderScreen(tree);
        await act(async () => {});

        expect(kioskVm.onCaptureError).toHaveBeenCalledWith("sin coincidencia");
        expect(fingerprint.loginFingerprint).toHaveBeenCalledTimes(1);

        // activeCapture is back to null (the failed attempt finished), but
        // sampleReady is still true (the hook never consumed the stale
        // sample on a rejection) — re-rendering again must NOT re-fire
        // loginFingerprint on its own; only a fresh button press (which
        // re-arms and clears the stale sample) should.
        rerenderScreen(tree);
        await act(async () => {});
        expect(fingerprint.loginFingerprint).toHaveBeenCalledTimes(1);
    });
});

describe("kiosk end-class button", () => {
    test('"Finalizar clase" surfaces a rejected endClass() through onCaptureError instead of an unhandled rejection', async () => {
        useRolePermissions.mockReturnValue({ canRegisterFace: true });
        const kioskVm = {
            view: "WAITING",
            todaysBlocks: [],
            startClass: jest.fn(),
            endClass: jest.fn().mockRejectedValue(new Error("no se pudo cerrar la sesión")),
            session: { classSessionId: 1 },
            statusMessage: "",
            socket: null,
            registeredActorIds: new Set(),
            onIdentified: jest.fn(),
            onCaptureError: jest.fn(),
        };
        useAttendanceKioskViewModel.mockReturnValue(kioskVm);
        useFingerprintReader.mockReturnValue({
            deviceReady: false,
            sampleReady: false,
            startCapture: jest.fn(),
            loginFingerprint: jest.fn(),
        });

        const tree = renderScreen();
        await act(async () => {
            findButton(tree, "Finalizar clase").props.onPress();
        });

        expect(kioskVm.endClass).toHaveBeenCalledTimes(1);
        expect(kioskVm.onCaptureError).toHaveBeenCalledWith("no se pudo cerrar la sesión");
    });
});
