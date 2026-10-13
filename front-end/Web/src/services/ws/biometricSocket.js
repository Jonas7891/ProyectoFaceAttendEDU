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
            ws?.send(JSON.stringify({ type: "ping" }));
        }, HEARTBEAT_MS);
    }

    function resendPending() {
        for (const [clientMessageId, entry] of pending) {
            ws.send(
                JSON.stringify({
                    type: entry.type,
                    client_message_id: clientMessageId,
                    direction: entry.direction,
                    payload: entry.payload,
                })
            );
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
            entry.reject(new Error(frame.message));
        }
    }

    function scheduleReconnect() {
        const delay = RECONNECT_DELAYS_MS[Math.min(reconnectAttempt, RECONNECT_DELAYS_MS.length - 1)];
        reconnectAttempt += 1;
        reconnectTimer = setTimeout(() => {
            openSocket();
        }, delay);
    }

    function handleClose(event) {
        stopHeartbeat();
        if (intentionalClose) {
            notifyStatus("closed");
            return;
        }
        notifyStatus("reconnecting");
        scheduleReconnect();
    }

    async function openSocket() {
        const resolvedToken = token ?? (await getToken());
        const url = `${toWsUrl(resolveBaseUrl(baseUrl))}/api/v1/biometric/ws?token=${resolvedToken}`;
        ws = new WebSocket(url);
        ws.onopen = () => {
            reconnectAttempt = 0;
            notifyStatus("open");
            startHeartbeat();
            resendPending();
        };
        ws.onmessage = handleMessage;
        ws.onclose = handleClose;
    }

    notifyStatus("connecting");
    openSocket();

    function send(type, payload, direction) {
        const clientMessageId = generateClientMessageId();
        return new Promise((resolve, reject) => {
            pending.set(clientMessageId, { type, payload, direction, resolve, reject });
            ws.send(JSON.stringify({ type, client_message_id: clientMessageId, direction, payload }));
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
        if (ws) {
            ws.close(); // triggers onclose -> handleClose -> notifies "closed"
        } else {
            notifyStatus("closed");
        }
    }

    return { send, onAttendanceEvent, onStatusChange, close };
}
