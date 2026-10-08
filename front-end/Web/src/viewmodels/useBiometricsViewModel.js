// ============================================================
//  FaceAttend EDU — useBiometricsViewModel
//
//  Estado compartido de la pantalla «Biometría»: identidad (usuario),
//  estado/mensajes, directorio de personas registradas y sesiones
//  biométricas activas. La captura de rostro y de huella viven en
//  useFaceCapture / useFingerprintReader (se montan solo cuando su
//  módulo está visible, para soltar cámara y lector al salir).
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { faceAuthApi } from "../services/api/faceAuthApi";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";

export const BIOMETRIC_SECTIONS = ["face-register", "face-login", "fingerprint"];
export const DEFAULT_BIOMETRIC_SECTION = "face-register";

export function normalizeBiometricSection(section) {
    return BIOMETRIC_SECTIONS.includes(section) ? section : DEFAULT_BIOMETRIC_SECTION;
}

export function useBiometricsViewModel() {
    const { t } = useTranslation();
    const { user } = useAuth();

    // Se precarga con el usuario de la sesión; se puede cambiar para registrar a otra persona.
    const [username, setUsername] = useState(user?.username ?? "");
    const [busy, setBusy] = useState(false);
    const [status, setStatusState] = useState({
        text: t("Elige un módulo y sigue las instrucciones."),
        tone: "info",
    });
    const [health, setHealth] = useState("checking"); // checking | ok | down
    const [users, setUsers] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [sideView, setSideView] = useState("directory"); // directory | active
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const setStatus = useCallback((text, tone = "info") => {
        if (mounted.current) setStatusState({ text, tone });
    }, []);

    const loadUsers = useCallback(async () => {
        try {
            const [all, active] = await Promise.all([
                faceAuthApi.listUsers(),
                faceAuthApi.listActiveUsers(),
            ]);
            if (!mounted.current) return;
            setUsers(Array.isArray(all) ? all : []);
            setActiveUsers(Array.isArray(active) ? active : []);
        } catch (e) {
            setStatus(e.message, "error");
        }
    }, [setStatus]);

    const checkHealth = useCallback(async () => {
        try {
            const data = await faceAuthApi.health();
            if (mounted.current) setHealth(data?.status === "ok" ? "ok" : "down");
            return data?.status === "ok";
        } catch {
            if (mounted.current) setHealth("down");
            return false;
        }
    }, []);

    useEffect(() => {
        (async () => {
            if (await checkHealth()) await loadUsers();
        })();
    }, [checkHealth, loadUsers]);

    /** Ejecuta una operación con bloqueo anti doble envío y reporte de errores unificado. */
    const run = useCallback(
        async (operation) => {
            if (busy) return;
            setBusy(true);
            try {
                await operation();
            } catch (e) {
                setStatus(e?.message || t("Error de solicitud"), "error");
            } finally {
                if (mounted.current) setBusy(false);
            }
        },
        [busy, setStatus, t]
    );

    const requireUsername = useCallback(() => {
        const name = username.trim();
        if (!name) throw new Error(t("Escribe un usuario."));
        return name;
    }, [username, t]);

    const checkUser = useCallback(
        () =>
            run(async () => {
                const name = requireUsername();
                setStatus(t("Consultando usuario..."));
                const data = await faceAuthApi.userExists(name);
                if (!data?.exists) {
                    setStatus(`"${name}" ${t("no está registrado todavía.")}`);
                    return;
                }
                setStatus(
                    `"${name}" ${t("existe")} — ${t("rostro")}: ${data.has_face ? t("sí") : t("no")}, ${t("huella")}: ${
                        data.has_fingerprint ? t("sí") : t("no")
                    }`
                );
            }),
        [run, requireUsername, setStatus, t]
    );

    return {
        username,
        setUsername,
        requireUsername,
        busy,
        run,
        status,
        setStatus,
        health,
        checkHealth,
        users,
        activeUsers,
        loadUsers,
        sideView,
        setSideView,
        checkUser,
    };
}
