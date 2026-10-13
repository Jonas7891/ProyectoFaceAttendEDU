import { connectBiometricSocket } from "../biometricSocket";

class FakeWebSocket {
    constructor(url) {
        this.url = url;
        this.sent = [];
        FakeWebSocket.instances.push(this);
    }
    send(data) { this.sent.push(data); }
    close() { this.onclose?.({ code: 1000 }); }
    triggerOpen() { this.onopen?.(); }
    triggerMessage(obj) { this.onmessage?.({ data: JSON.stringify(obj) }); }
    triggerClose(code = 1006) { this.onclose?.({ code }); }
}
FakeWebSocket.instances = [];

beforeEach(() => {
    FakeWebSocket.instances = [];
    global.WebSocket = FakeWebSocket;
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

test("send() resolves with the ack result for the matching client_message_id", async () => {
    const socket = connectBiometricSocket({ token: "t" });
    const ws = FakeWebSocket.instances[0];
    ws.triggerOpen();

    const pending = socket.send("facial.identify_image", { image_base64: "x" });
    const sentBody = JSON.parse(ws.sent[0]);
    ws.triggerMessage({
        type: "facial.identify_image.ack",
        client_message_id: sentBody.client_message_id,
        result: { person_id: "p1", score: 0.99 },
    });

    await expect(pending).resolves.toEqual({ person_id: "p1", score: 0.99 });
});

test("send() rejects when the server returns an error frame for that client_message_id", async () => {
    const socket = connectBiometricSocket({ token: "t" });
    const ws = FakeWebSocket.instances[0];
    ws.triggerOpen();

    const pending = socket.send("facial.identify_image", { image_base64: "x" });
    const sentBody = JSON.parse(ws.sent[0]);
    ws.triggerMessage({
        type: "error",
        client_message_id: sentBody.client_message_id,
        error: "NotFound",
        message: "no match found",
    });

    await expect(pending).rejects.toMatchObject({ message: "no match found" });
});

test("resends the same client_message_id once after a reconnect, before the ack arrives", async () => {
    const socket = connectBiometricSocket({ token: "t" });
    const ws1 = FakeWebSocket.instances[0];
    ws1.triggerOpen();

    const pending = socket.send("facial.identify_image", { image_base64: "x" });
    const firstId = JSON.parse(ws1.sent[0]).client_message_id;
    ws1.triggerClose();

    jest.advanceTimersByTime(1000); // first reconnect backoff
    const ws2 = FakeWebSocket.instances[1];
    ws2.triggerOpen();

    expect(JSON.parse(ws2.sent[0]).client_message_id).toBe(firstId);

    ws2.triggerMessage({
        type: "facial.identify_image.ack",
        client_message_id: firstId,
        result: { person_id: "p1", score: 0.99 },
    });
    await expect(pending).resolves.toEqual({ person_id: "p1", score: 0.99 });
});

test("sends a ping heartbeat every 20 seconds", () => {
    const socket = connectBiometricSocket({ token: "t" });
    const ws = FakeWebSocket.instances[0];
    ws.triggerOpen();

    jest.advanceTimersByTime(20000);
    expect(JSON.parse(ws.sent.at(-1)).type).toBe("ping");
});

test("close() is intentional and does not trigger a reconnect attempt", () => {
    const socket = connectBiometricSocket({ token: "t" });
    const ws1 = FakeWebSocket.instances[0];
    ws1.triggerOpen();

    socket.close();
    jest.advanceTimersByTime(10000);

    expect(FakeWebSocket.instances.length).toBe(1);
});

test("onAttendanceEvent notifies listeners on attendance.event frames and supports unsubscribe", () => {
    const socket = connectBiometricSocket({ token: "t" });
    const ws = FakeWebSocket.instances[0];
    ws.triggerOpen();

    const listener = jest.fn();
    const unsubscribe = socket.onAttendanceEvent(listener);

    ws.triggerMessage({ type: "attendance.event", payload: { foo: "bar" } });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    ws.triggerMessage({ type: "attendance.event", payload: { foo: "baz" } });
    expect(listener).toHaveBeenCalledTimes(1);
});

test("onStatusChange reports connecting/open/reconnecting/closed transitions", () => {
    const socket = connectBiometricSocket({ token: "t" });
    const ws1 = FakeWebSocket.instances[0];

    const statuses = [];
    socket.onStatusChange((status) => statuses.push(status));

    ws1.triggerOpen();
    ws1.triggerClose();
    jest.advanceTimersByTime(1000);
    const ws2 = FakeWebSocket.instances[1];
    ws2.triggerOpen();
    socket.close();

    expect(statuses).toEqual(["open", "reconnecting", "open", "closed"]);
});
