// ============================================================
//  FaceAttend EDU — useAttendanceKioskViewModel
//
//  Viewmodel para la pantalla de toma de asistencia ("kiosco").
//  Parte A: ciclo de vida de la sesión de clase.
//    - todaysBlocks: bloques horarios del instructor para hoy.
//    - startClass(block): resuelve-o-crea la sesión de hoy y la abre.
//    - endClass(): cierra la sesión activa.
//  Parte B: captura biométrica/dedup/registro de asistencia sobre esa
//  misma sesión.
//    - socket: canal biométrico abierto mientras hay una sesión activa.
//    - onIdentified(personId, {biometricType, score}): resuelve la
//      persona a academicActorId vía el cohorte, aplica dedup local y
//      crea el attendance_record.
//    - onCaptureError(message): estado terminal ERROR para un fallo de
//      captura (p. ej. sin match).
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { attendanceApi } from "../services/api/attendanceApi";
import { cohortActorByPerson, listBlocks } from "../services/api/referenceData";
import { schedulingApi } from "../services/api/schedulingApi";
import { connectBiometricSocket } from "../services/ws/biometricSocket";

/** getDay(): 0=domingo..6=sábado -> ISO 1..7 del DBML (1=lunes..7=domingo). */
export function isoWeekday(date = new Date()) {
    return ((date.getDay() + 6) % 7) + 1;
}

// Cuánto se queda la pantalla en SUCCESS/DUPLICATE/ERROR antes de volver
// a WAITING para la siguiente captura.
const TERMINAL_VIEW_RESET_MS = 2000;

export function useAttendanceKioskViewModel() {
    const { user } = useAuth();

    const [view, setView] = useState("SELECT_SESSION");
    const [blocks, setBlocks] = useState([]);
    const [session, setSession] = useState(null);
    const [block, setBlock] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [registeredActorIds, setRegisteredActorIds] = useState(new Set());

    // Refs: leídos por onIdentified/el listener del socket, que deben ver
    // siempre el valor más reciente sin forzar su propia recreación.
    const socketRef = useRef(null);
    const actorByPersonRef = useRef(new Map());
    const registeredActorIdsRef = useRef(new Set());
    const unsubscribeAttendanceRef = useRef(null);
    const resetTimerRef = useRef(null);

    useEffect(() => {
        listBlocks()
            .then(setBlocks)
            .catch(() => setStatusMessage("No se pudieron cargar los bloques de horario"));
    }, []);

    // Al desmontar sin pasar por endClass (navegación, cierre de pestaña):
    // no dejar el socket ni el timer de reset vivos.
    useEffect(() => {
        return () => {
            if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
            if (unsubscribeAttendanceRef.current) unsubscribeAttendanceRef.current();
            if (socketRef.current) socketRef.current.close();
        };
    }, []);

    const todaysBlocks = blocks.filter(
        (b) => b.instructorActorId === user?.academicActorId && b.dayOfWeek === isoWeekday()
    );

    function syncRegisteredActorIds() {
        setRegisteredActorIds(new Set(registeredActorIdsRef.current));
    }

    // Otro kiosco en la misma sesión ya registró a este actor: reflejarlo
    // localmente sin round-trip propio a attendanceApi.
    function handleAttendanceEvent(frame) {
        const payload = frame?.payload ?? frame ?? {};
        const personId = payload.personId;
        const academicActorId =
            payload.academicActorId ?? (personId != null ? actorByPersonRef.current.get(personId) : null);
        if (academicActorId == null) return;
        registeredActorIdsRef.current.add(academicActorId);
        syncRegisteredActorIds();
    }

    function scheduleReturnToWaiting() {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => {
            resetTimerRef.current = null;
            setView("WAITING");
        }, TERMINAL_VIEW_RESET_MS);
    }

    const startClass = useCallback(async (nextBlock) => {
        const today = new Date().toISOString().slice(0, 10);
        const sessions = await schedulingApi.listSessions();
        let nextSession = sessions.find(
            (s) => s.scheduleBlockId === nextBlock.scheduleBlockId && s.sessionDate === today
        );

        if (!nextSession) {
            nextSession = await schedulingApi.createSession({
                scheduleBlockId: nextBlock.scheduleBlockId,
                sessionDate: today,
            });
        }

        try {
            nextSession = await schedulingApi.openSession(nextSession.classSessionId);
        } catch (e) {
            if (e?.status !== 400) throw e;
            // Ya estaba Open: seguir con la sesión ya conocida.
        }

        // Canal biométrico + estado local de dedup para esta sesión.
        const nextSocket = connectBiometricSocket({});
        socketRef.current = nextSocket;
        setSocket(nextSocket);
        unsubscribeAttendanceRef.current = nextSocket.onAttendanceEvent(handleAttendanceEvent);

        const [records, actorByPerson] = await Promise.all([
            attendanceApi.recordsBySession(nextSession.classSessionId),
            cohortActorByPerson(nextBlock.cohortId),
        ]);
        actorByPersonRef.current = actorByPerson;
        registeredActorIdsRef.current = new Set(records.map((r) => r.academicActorId));
        setRegisteredActorIds(new Set(registeredActorIdsRef.current));

        setSession(nextSession);
        setBlock(nextBlock);
        setView("WAITING");
    }, []);

    const endClass = useCallback(async () => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
            resetTimerRef.current = null;
        }
        if (unsubscribeAttendanceRef.current) {
            unsubscribeAttendanceRef.current();
            unsubscribeAttendanceRef.current = null;
        }
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        setSocket(null);

        await schedulingApi.closeSession(session.classSessionId);

        actorByPersonRef.current = new Map();
        registeredActorIdsRef.current = new Set();
        setRegisteredActorIds(new Set());
        setSession(null);
        setBlock(null);
        setView("SELECT_SESSION");
    }, [session]);

    const onIdentified = useCallback(
        async (personId, { biometricType, score }) => {
            if (!session) return;

            const academicActorId = actorByPersonRef.current.get(personId);
            if (academicActorId == null) {
                setStatusMessage("No pertenece a esta clase");
                setView("ERROR");
                scheduleReturnToWaiting();
                return;
            }

            if (registeredActorIdsRef.current.has(academicActorId)) {
                setStatusMessage("");
                setView("DUPLICATE");
                scheduleReturnToWaiting();
                return;
            }

            try {
                await attendanceApi.createRecord({
                    classSessionId: session.classSessionId,
                    academicActorId,
                    attendanceStatus: "Present",
                    captureMethod: biometricType,
                    matchScore: score,
                });
                registeredActorIdsRef.current.add(academicActorId);
                syncRegisteredActorIds();
                setStatusMessage("");
                setView("SUCCESS");
            } catch (e) {
                if (e?.status === 409) {
                    // Otro kiosco ganó la carrera: mismo resultado que un duplicado local.
                    registeredActorIdsRef.current.add(academicActorId);
                    syncRegisteredActorIds();
                    setStatusMessage("");
                    setView("DUPLICATE");
                } else {
                    setStatusMessage(e?.message || "No se pudo registrar la asistencia");
                    setView("ERROR");
                }
            }

            scheduleReturnToWaiting();
        },
        [session]
    );

    const onCaptureError = useCallback((message) => {
        setStatusMessage(message);
        setView("ERROR");
        scheduleReturnToWaiting();
    }, []);

    return {
        view,
        todaysBlocks,
        startClass,
        endClass,
        session,
        statusMessage,
        socket,
        registeredActorIds,
        onIdentified,
        onCaptureError,
    };
}
