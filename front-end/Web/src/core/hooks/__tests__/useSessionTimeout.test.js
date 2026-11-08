import React from "react";
import { create, act } from "react-test-renderer";
import { useSessionTimeout } from "../useSessionTimeout";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let session;
function Probe(props) { session = useSessionTimeout(props); return null; }

const roots = [];
function mount(props) {
    let root;
    act(() => { root = create(<Probe {...props} />); });
    roots.push(root);
    return root;
}
const tick = (ms) => act(() => { jest.advanceTimersByTime(ms); });

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
    // Unmount every hook so its document listeners do not leak into the next test.
    act(() => { roots.splice(0).forEach((r) => { try { r.unmount(); } catch { /* already unmounted */ } }); });
    jest.useRealTimers();
});

test("counts down, warns in the last minutes and logs out once", () => {
    const onTimeout = jest.fn();
    mount({ timeoutMinutes: 2, warningMinutes: 1, onTimeout });
    expect(session.timeRemainingFormatted).toBe("2:00");

    tick(30_000);
    expect(session.timeRemaining).toBe(90);
    expect(session.isWarning).toBe(false);

    tick(45_000);
    expect(session.isWarning).toBe(true);
    expect(session.timeRemainingFormatted).toBe("0:45");

    tick(60_000);
    expect(session.isExpired).toBe(true);
    expect(session.isWarning).toBe(false);
    tick(10_000);
    expect(onTimeout).toHaveBeenCalledTimes(1);
});

test("user activity on the page restarts the countdown and tells the push notices", () => {
    const onTimeout = jest.fn();
    const seen = jest.fn();
    window.addEventListener("userActivityDetected", seen);
    mount({ timeoutMinutes: 1, warningMinutes: 1, onTimeout });

    tick(50_000);
    expect(session.timeRemaining).toBe(10);
    act(() => { document.dispatchEvent(new Event("keydown")); });
    tick(1_000);
    expect(session.timeRemaining).toBe(59);
    expect(seen).toHaveBeenCalled();
    const before = seen.mock.calls.length;

    // Throttled: a burst inside 500 ms counts once.
    tick(600);
    act(() => {
        document.dispatchEvent(new Event("mousemove"));
        document.dispatchEvent(new Event("mousemove"));
    });
    expect(seen.mock.calls.length - before).toBe(1);
    expect(onTimeout).not.toHaveBeenCalled();
    window.removeEventListener("userActivityDetected", seen);
});

test("resetTimer restarts the countdown after a warning", () => {
    mount({ timeoutMinutes: 1, warningMinutes: 1 });
    tick(40_000);
    expect(session.isWarning).toBe(true);
    act(() => session.resetTimer());
    expect(session.timeRemaining).toBe(60);
    expect(session.isWarning).toBe(false);
});

test("disabled (logged out) it never expires and ignores activity", () => {
    const onTimeout = jest.fn();
    mount({ timeoutMinutes: 1, onTimeout, enabled: false });
    act(() => { session.handleActivity(); session.resetTimer(); });
    tick(120_000);
    expect(session.timeRemaining).toBe(60);
    expect(session.isExpired).toBe(false);
    expect(onTimeout).not.toHaveBeenCalled();
});

test("logging in again starts a fresh countdown instead of expiring at once", () => {
    const onTimeout = jest.fn();
    const root = mount({ timeoutMinutes: 1, onTimeout, enabled: true });
    tick(50_000);
    act(() => root.update(<Probe timeoutMinutes={1} onTimeout={onTimeout} enabled={false} />));
    tick(60_000);
    act(() => root.update(<Probe timeoutMinutes={1} onTimeout={onTimeout} enabled />));
    tick(5_000);
    expect(session.timeRemaining).toBe(55);
    expect(onTimeout).not.toHaveBeenCalled();
});

test("clearTimer stops the countdown and unmounting cleans up", () => {
    const onTimeout = jest.fn();
    const root = mount({ timeoutMinutes: 1, onTimeout });
    act(() => session.clearTimer());
    tick(120_000);
    expect(onTimeout).not.toHaveBeenCalled();
    act(() => root.unmount());
    tick(1_000);
});
