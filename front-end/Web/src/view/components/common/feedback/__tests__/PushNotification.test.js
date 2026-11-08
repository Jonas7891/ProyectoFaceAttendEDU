import React from "react";
import { create, act } from "react-test-renderer";
import { TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../../context/ThemeContext";
import { PushNotificationProvider, usePushNotification } from "../PushNotification";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock("@expo/vector-icons", () => ({ Feather: () => null }));
jest.mock("../../../../../core/config/institutionConfig", () => ({
    ...jest.requireActual("../../../../../core/config/institutionConfig"),
    getInstitutionConfig: () => ({ pushDuration: 4 }),
}));

const METRICS = { frame: { x: 0, y: 0, width: 1280, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

let push;
function Probe() { push = usePushNotification(); return null; }

let root;
function mount(props = {}) {
    act(() => {
        root = create(
            <SafeAreaProvider initialMetrics={METRICS}>
                <ThemeProvider>
                    <PushNotificationProvider {...props}><Probe /></PushNotificationProvider>
                </ThemeProvider>
            </SafeAreaProvider>,
        );
    });
}
const tick = (ms) => act(() => { jest.advanceTimersByTime(ms); });
async function show(config) {
    let id;
    await act(async () => { id = await push.show(config); });
    return id;
}
const titles = () => [...new Set(root.root.findAll((n) => n.props.numberOfLines === 1 && typeof n.props.children === "string").map((n) => n.props.children))];

beforeEach(() => jest.useFakeTimers());
afterEach(() => { act(() => root?.unmount()); jest.useRealTimers(); });

test("usePushNotification outside the provider throws", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => act(() => { create(<Probe />); })).toThrow(/PushNotificationProvider/);
    console.error.mockRestore();
});

test("shows a notification and auto-dismisses it with reason timeout", async () => {
    mount();
    const onDismiss = jest.fn();
    const id = await show({ title: "Asistencia registrada", type: "success", duration: 3000, onDismiss });
    expect(typeof id).toBe("number");
    expect(titles()).toContain("Asistencia registrada");

    tick(3000);
    expect(onDismiss).toHaveBeenCalledWith("timeout");
    tick(200);
    expect(titles()).not.toContain("Asistencia registrada");
});

test("rejects duplicates unless allowed, and enforces the per-type and per-source limits", async () => {
    mount({ maxNotificationsByType: 2 });
    expect(await show({ title: "A", message: "x" })).not.toBeNull();
    expect(await show({ title: "A", message: "x" })).toBeNull();
    expect(await show({ title: "A", message: "x", allowDuplicates: true })).not.toBeNull();
    expect(await show({ title: "B" })).toBeNull(); // third "info" of the same source

    expect(await show({ title: "S1", type: "warning", source: "session", maxNotificationsBySource: 1 })).not.toBeNull();
    expect(await show({ title: "S2", type: "warning", source: "session", maxNotificationsBySource: 1 })).toBeNull();
});

test("queues past the screen limit and releases in priority order after a dismiss", async () => {
    mount({ maxNotifications: 1 });
    const first = await show({ title: "Primera", duration: 0 });
    await show({ title: "Baja", priority: "low", duration: 0 });
    await show({ title: "Urgente", priority: "urgent", duration: 0 });
    expect(push.getStatus()).toMatchObject({ active: 1, pending: 2 });

    await act(async () => { await push.dismiss(first); });
    tick(100);
    expect(titles()).toEqual(["Urgente"]);
    expect(push.getStatus().pending).toBe(1);
});

test("resolved sources close in two seconds and active sources live longer", async () => {
    mount();
    const onSourceResolved = jest.fn();
    await show({ title: "Captura", source: "camera", duration: 60000, onSourceResolved });
    act(() => push.markSourceAsActive("camera"));
    expect(push.getStatus().activeSources).toBe(1);

    act(() => push.markSourceAsResolved("camera"));
    expect(onSourceResolved).toHaveBeenCalledTimes(1);
    expect(push.getStatus().resolvedSources).toBe(1);
    tick(2400);
    expect(titles()).not.toContain("Captura");

    const onDismiss = jest.fn();
    await show({ title: "Larga", isActiveSource: true, duration: 1000, onDismiss });
    tick(1000);
    expect(onDismiss).not.toHaveBeenCalled(); // 1.5x: still on screen
    tick(500);
    expect(onDismiss).toHaveBeenCalledWith("timeout");
});

test("dismissBySource and dismissAll clear active and queued notifications", async () => {
    mount({ maxNotifications: 1 });
    const onDismiss = jest.fn();
    await show({ title: "Kiosco", source: "kiosk", duration: 0, onDismiss });
    await show({ title: "En cola", source: "kiosk", type: "warning", duration: 0 });

    let found;
    act(() => { found = push.dismissBySource("kiosk", "closed"); });
    expect(found).toBe(true);
    expect(onDismiss).toHaveBeenCalledWith("closed");
    expect(push.getStatus()).toMatchObject({ active: 0, pending: 0 });

    await show({ title: "Otra", duration: 0 });
    act(() => push.dismissAll());
    expect(push.getStatus().active).toBe(0);
});

test("pressing a notification navigates or runs its handler, then closes it", async () => {
    const onNavigate = jest.fn();
    mount({ onNavigate });
    await act(async () => { await push.withNavigation("Nueva justificación", "Revísala", "Justifications", { id: 4 }, { duration: 0 }); });
    const onPress = jest.fn();
    await act(async () => { await push.error("Error", "Algo falló", { duration: 0, onPress }); });
    await act(async () => { await push.warning("Aviso", "", { duration: 0 }); await push.info("Info", "", { duration: 0 }); });

    const rows = root.root.findAllByType(TouchableOpacity).filter((n) => n.props.activeOpacity !== undefined);
    act(() => rows.forEach((r) => !r.props.disabled && r.props.onPress()));
    tick(300);

    expect(onNavigate).toHaveBeenCalledWith({ screen: "Justifications", params: { id: 4 } });
    expect(onPress).toHaveBeenCalledWith(expect.objectContaining({ title: "Error" }));
    expect(titles()).toEqual(expect.arrayContaining(["Aviso", "Info"]));
    expect(titles()).not.toContain("Error");
});

test("a countdown notification shows the remaining time and ticks down", async () => {
    mount();
    await show({ title: "Sesión por expirar", type: "warning", duration: 90000, data: { showTimer: true, initialTimeSeconds: 90 } });
    const text = () => JSON.stringify(root.toJSON());
    expect(text()).toContain("1:30");
    tick(31000);
    expect(text()).toContain("0:59");
});
