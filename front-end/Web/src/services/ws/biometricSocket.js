// ============================================================
//  FaceAttend EDU — Cliente WebSocket del canal biométrico de asistencia
//
//  Canal delgado usado por el kiosco de asistencia para enviar mensajes
//  identify.* y recibir eventos attendance.event en tiempo real. No
//  conoce reglas de negocio: solo enruta solicitudes pendientes por
//  client_message_id y reconecta ante cortes inesperados.
// ============================================================

import { getToken, resolveBaseUrl } from "../../api/apiClient";

const HEARTBEAT_MS = 20000;
const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 8000];
// Mirrored locally (rather than read off global.WebSocket) so a test double
// that doesn't define the static WebSocket.OPEN constant still works.
const WS_OPEN = 1;

function toWsUrl(httpBaseUrl) {
    return httpBaseUrl.replace(/^http/i, "ws");
}

function generateClientMessageId() {
    return Math.random().toString(36).slice(2);
}

export function connectBiometricSocket({ token, baseUrl } = {}) {
    const pending = new Map(); // client_message_id -> { type, payload, direction, resolve, reject }
    const attendanceListeners = new Set();
    const statusListeners = new Set();

    let ws = null;
    let heartbeatTimer = null;
    let reconnectTimer = null;
    let reconnectAttempt = 0;
    let intentionalClose = false;

    function notifyStatus(status) {
        for (const listener of statusListeners) listener(status);
    }

    function stopHeartbeat() {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    }

    function startHeartbeat() {
        stopHeartbeat();
        heartbeatTimer = setInterval(() => {
            if (ws && ws.readyState === WS_OPEN) ws.send(JSON.stringify({ type: "ping" }));
        }, HEARTBEAT_MS);
    }

    function transmit(clientMessageId, entry) {
        ws.send(
            JSON.stringify({
                type: entry.type,
                client_message_id: clientMessageId,
                direction: entry.direction,
                payload: entry.payload,
            })
        );
    }

    // Runs on every `onopen` — the initial connect included, not just a reconnect.
    // A send() issued while the socket was still connecting is queued in `pending`
    // without having been transmitted; this flushes it the moment the socket opens.
    // A send() already in flight across a reconnect is flushed here too, under the
    // SAME client_message_id it was first assigned.
    function flushPending() {
        for (const [clientMessageId, entry] of pending) {
            transmit(clientMessageId, entry);
        }
    }

    function handleMessage(event) {
        let frame;
        try {
            frame = JSON.parse(event.data);
        } catch {
            return;
        }

        if (frame.type === "attendance.event") {
            for (const listener of attendanceListeners) listener(frame);
            return;
        }

        const isAck = typeof frame.type === "string" && frame.type.endsWith(".ack");
        const isError = frame.type === "error";
        if (!isAck && !isError) return;

        const entry = pending.get(frame.client_message_id);
        if (!entry) return;
        pending.delete(frame.client_message_id);

        if (isAck) {
            entry.resolve(frame.result);
        } else {
            entry.reject(new Error(frame.message || "Biometric socket returned an error frame"));
        }
    }

    function scheduleReconnect() {
        const delay = RECONNECT_DELAYS_MS[Math.min(reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)];
        reconnectAttempt += 1;
        reconnectTimer = setTimeout(() => {
            openSocket();
        }, delay);
    }

    function enterReconnecting() {
        notifyStatus("reconnecting");
        scheduleReconnect();
    }

    function handleClose() {
        stopHeartbeat();
        if (intentionalClose) {
            notifyStatus("closed");
            return;
        }
        enterReconnecting();
    }

    async function connectOnce() {
        const resolvedToken = token ?? (await getToken());
        const url = `${toWsUrl(resolveBaseUrl(baseUrl))}/api/v1/biometric/ws?token=${resolvedToken}`;
        ws = new WebSocket(url);
        ws.onopen = () => {
            reconnectAttempt = 0;
            notifyStatus("open");
            startHeartbeat();
            flushPending();
        };
        ws.onmessage = handleMessage;
        ws.onclose = handleClose;
        ws.onerror = () => {
            /* diagnostic only — the browser always follows with onclose, which
               drives the reconnect/backoff, so there is nothing to act on here. */
        };
    }

    function openSocket() {
        // connectOnce() can reject before any socket exists to fire onclose (e.g.
        // getToken() rejecting while resolving the token to connect with). Without
        // this catch, that failure would silently and permanently stall the
        // reconnect loop instead of being retried like any other disconnect.
        connectOnce().catch(() => {
            enterReconnecting();
        });
    }

    openSocket();
    // Deferred by one microtask so a caller that calls onStatusChange(...) right
    // after connectBiometricSocket(...) returns can still observe this initial
    // status (synchronous delivery would fire before any listener exists).
    Promise.resolve().then(() => notifyStatus("connecting"));

    function send(type, payload, direction) {
        const clientMessageId = generateClientMessageId();
        return new Promise((resolve, reject) => {
            const entry = { type, payload, direction, resolve, reject };
            pending.set(clientMessageId, entry);
            // Only transmit if there's actually an open socket to send on. Otherwise
            // the entry stays queued in `pending` — flushPending() sends it the
            // moment the socket (re)opens — instead of throwing on a null/half-open
            // `ws`, or being silently dropped.
            if (ws && ws.readyState === WS_OPEN) {
                transmit(clientMessageId, entry);
            }
        });
    }

    function onAttendanceEvent(listener) {
        attendanceListeners.add(listener);
        return () => attendanceListeners.delete(listener);
    }

    function onStatusChange(listener) {
        statusListeners.add(listener);
        return () => statusListeners.delete(listener);
    }

    function close() {
        intentionalClose = true;
        stopHeartbeat();
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        // A send() still awaiting an ack would otherwise hang forever once the
        // socket this task created is gone for good.
        for (const entry of pending.values()) {
            entry.reject(new Error("Biometric socket closed"));
        }
        pending.clear();
        if (ws) {
            ws.close(); // triggers onclose -> handleClose -> notifies "closed"
        } else {
            notifyStatus("closed");
        }
    }

    return { send, onAttendanceEvent, onStatusChange, close };
}
