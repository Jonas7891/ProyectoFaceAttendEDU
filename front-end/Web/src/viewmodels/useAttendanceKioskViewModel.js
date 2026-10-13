// ============================================================
//  FaceAttend EDU — useAttendanceKioskViewModel
//
//  Viewmodel para la pantalla de toma de asistencia ("kiosco").
//  Parte A: ciclo de vida de la sesión de clase.
//    - todaysBlocks: bloques horarios del instructor para hoy.
//    - startClass(block): resuelve-o-crea la sesión de hoy y la abre.
//    - endClass(): cierra la sesión activa.
//  Parte B (tarea siguiente) añade captura biométrica/dedup/registro
//  de asistencia al mismo hook.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listBlocks } from "../services/api/referenceData";
import { schedulingApi } from "../services/api/schedulingApi";

/** getDay(): 0=domingo..6=sábado -> ISO 1..7 del DBML (1=lunes..7=domingo). */
export function isoWeekday(date = new Date()) {
    return ((date.getDay() + 6) % 7) + 1;
}

export function useAttendanceKioskViewModel() {
    const { user } = useAuth();

    const [view, setView] = useState("SELECT_SESSION");
    const [blocks, setBlocks] = useState([]);
    const [session, setSession] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        listBlocks()
            .then(setBlocks)
            .catch(() => setStatusMessage("No se pudieron cargar los bloques de horario"));
    }, []);

    const todaysBlocks = blocks.filter(
        (b) => b.instructorActorId === user?.academicActorId && b.dayOfWeek === isoWeekday()
    );

    const startClass = useCallback(async (block) => {
        const today = new Date().toISOString().slice(0, 10);
        const sessions = await schedulingApi.listSessions();
        let nextSession = sessions.find(
            (s) => s.scheduleBlockId === block.scheduleBlockId && s.sessionDate === today
        );

        if (!nextSession) {
            nextSession = await schedulingApi.createSession({
                scheduleBlockId: block.scheduleBlockId,
                sessionDate: today,
            });
        }

        try {
            nextSession = await schedulingApi.openSession(nextSession.classSessionId);
        } catch (e) {
            if (e?.status !== 400) throw e;
            // Ya estaba Open: seguir con la sesión ya conocida.
        }

        setSession(nextSession);
        setView("WAITING");
    }, []);

    const endClass = useCallback(async () => {
        await schedulingApi.closeSession(session.classSessionId);
        setSession(null);
        setView("SELECT_SESSION");
    }, [session]);

    return {
        view,
        todaysBlocks,
        startClass,
        endClass,
        session,
        statusMessage,
    };
}
