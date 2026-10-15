// ============================================================
//  FaceAttend EDU — Alerts ViewModel
//
//  Bandeja de alertas web (HU-JUS-003, FR 6.3): alertas del propio
//  actor académico (08-ms-notification). Sin actor (super admin sin
//  academic_actor) muestra las no resueltas globales, acotadas.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { notificationApi } from "../services/api/notificationApi";

const PAGE_SIZE = 50;

function alertListOf(response) {
    if (Array.isArray(response)) return response;
    return response?.alerts ?? response?.data ?? response?.content ?? [];
}

function typeListOf(response) {
    if (Array.isArray(response)) return response;
    return response?.alert_types ?? response?.data ?? response?.content ?? [];
}

export function useAlertsViewModel() {
    const { user } = useAuth();
    const { t } = useTranslation();

    const [alerts, setAlerts] = useState([]);
    const [types, setTypes] = useState(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showResolved, setShowResolved] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const actorId = user?.academicActorId ?? null;

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [alertRes, typeRes] = await Promise.all([
                notificationApi.listAlerts({
                    ...(actorId != null ? { actorId } : { resolved: false }),
                    limit: PAGE_SIZE,
                    offset: 0,
                }),
                notificationApi.listAlertTypes().catch(() => []),
            ]);
            setAlerts(alertListOf(alertRes));
            const map = new Map();
            for (const type of typeListOf(typeRes)) {
                const id = type.alertTypeId ?? type.alert_type_id ?? type.AlertTypeID ?? type.id;
                if (id != null) map.set(Number(id), type);
            }
            setTypes(map);
        } catch (e) {
            setError(e?.message || t("No se pudieron cargar las alertas."));
        } finally {
            setIsLoading(false);
        }
    }, [actorId, t]);

    useEffect(() => {
        load();
    }, [load]);

    const visible = showResolved ? alerts : alerts.filter((a) => !a.resolvedAt && !a.resolved_at);

    const resolve = useCallback(
        async (alert) => {
            const id = alert.alertId ?? alert.alert_id ?? alert.id;
            if (id == null) return;
            setBusyId(id);
            try {
                await notificationApi.resolveAlert(id);
                setAlerts((prev) =>
                    prev.map((a) =>
                        (a.alertId ?? a.alert_id ?? a.id) === id
                            ? { ...a, resolvedAt: new Date().toISOString(), resolved_at: new Date().toISOString() }
                            : a
                    )
                );
            } catch (e) {
                setError(e?.message || t("No se pudo resolver la alerta."));
            } finally {
                setBusyId(null);
            }
        },
        [t]
    );

    const remove = useCallback(
        async (alert) => {
            const id = alert.alertId ?? alert.alert_id ?? alert.id;
            if (id == null) return;
            setBusyId(id);
            try {
                await notificationApi.deleteAlert(id);
                setAlerts((prev) => prev.filter((a) => (a.alertId ?? a.alert_id ?? a.id) !== id));
            } catch (e) {
                setError(e?.message || t("No se pudo eliminar la alerta."));
            } finally {
                setBusyId(null);
            }
        },
        [t]
    );

    return {
        alerts: visible,
        openCount: alerts.filter((a) => !a.resolvedAt && !a.resolved_at).length,
        types,
        isLoading,
        error,
        showResolved,
        setShowResolved,
        busyId,
        resolve,
        remove,
        refresh: load,
    };
}
