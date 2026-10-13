// ============================================================
//  FaceAttend EDU — AttendanceKioskView
//
//  Pantalla «Kiosco de asistencia»: el profesor abre la clase de hoy
//  y, a partir de ahí, cada estudiante se identifica por rostro
//  (ciclo pasivo, sin tocar nada) o por huella (botón explícito).
//  Backend: ms-biometric (WebSocket) + ms-attendance/ms-scheduling.
//
//  `useAttendanceKioskViewModel().view` solo puede valer
//  SELECT_SESSION / WAITING / SUCCESS / DUPLICATE / ERROR — no sabe
//  si hay una captura facial o de huella en curso, porque eso depende
//  de qué hook de captura está corriendo en ESTA pantalla, no de la
//  sesión de clase. Por eso el estado "¿qué se está capturando ahora?"
//  (activeCapture) vive aquí, local, y solo afecta al banner cuando
//  kioskVm.view sigue en WAITING.
// ============================================================

import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
// Importados desde sus archivos concretos, no desde el barrel
// `./components/common` — ese índice agrega `./navigation` y `./tabs`,
// que ambos re-exportan un `Tabs` distinto; al evaluarse juntos lanzan
// `TypeError: Cannot redefine property: Tabs` (bug preexistente, fuera
// de alcance de esta tarea). Nada en este archivo necesita ese barrel.
import { PageHeader } from "./components/common/navigation/PageHeader";
import { Card } from "./components/common/cards/Card";
import { Button } from "./components/common/buttons/Button";
import { useTheme } from "./components/hooks/useTheme";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useAttendanceKioskViewModel } from "../viewmodels/useAttendanceKioskViewModel";
import { useFaceCapture } from "../viewmodels/useFaceCapture";
import { useFingerprintReader } from "../viewmodels/useFingerprintReader";

const TONE_COLOR_KEY = {
    default: "secondary",
    primary: "brand",
    success: "success",
    warning: "warning",
    danger: "danger",
};

function toneColor(colors, tone) {
    switch (TONE_COLOR_KEY[tone]) {
        case "brand":
            return colors.brand.primary;
        case "success":
            return colors.status.success;
        case "warning":
            return colors.status.warning;
        case "danger":
            return colors.status.danger;
        default:
            return colors.text.secondary;
    }
}

function SelectSessionPanel({ kioskVm }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <PageHeader
                title={t("Tomar asistencia")}
                subtitle={t("Selecciona la clase de hoy para abrir el kiosco")}
            />
            <ScrollView
                contentContainerStyle={{ padding: 24, gap: 16, alignItems: "center" }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ width: "100%", maxWidth: 640, gap: 12 }}>
                    {kioskVm.todaysBlocks.length === 0 ? (
                        <Card padding="lg">
                            <View style={{ alignItems: "center", gap: 8, paddingVertical: 16 }}>
                                <Feather name="calendar" size={32} color={c.text.secondary} />
                                <Text style={{ color: c.text.secondary, fontSize: 14, textAlign: "center" }}>
                                    {t("No tienes clases programadas para hoy")}
                                </Text>
                            </View>
                        </Card>
                    ) : (
                        kioskVm.todaysBlocks.map((block) => (
                            <Card key={block.scheduleBlockId} padding="lg">
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 12,
                                    }}
                                >
                                    <View style={{ gap: 4, flex: 1 }}>
                                        <Text style={{ color: c.text.primary, fontSize: 16, fontWeight: "700" }}>
                                            {t("Clase de hoy")}
                                        </Text>
                                        <Text style={{ color: c.text.secondary, fontSize: 13 }}>
                                            {block.startsAt} – {block.endsAt}
                                        </Text>
                                    </View>
                                    <Button variant="primary" onPress={() => kioskVm.startClass(block)}>
                                        {t("Iniciar clase")}
                                    </Button>
                                </View>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

function CapturePanel({ kioskVm }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    // null | "FACE" | "FINGER" — qué captura está corriendo ahora mismo en
    // ESTA pantalla. kioskVm.view nunca distingue esto (ver cabecera del
    // archivo), así que el banner lo deriva combinando ambos más abajo.
    const [activeCapture, setActiveCapture] = useState(null);

    // vm mínimo que esperan useFaceCapture/useFingerprintReader. No hay
    // persona preseleccionada (no es el flujo de Biometrics), así que
    // requirePersonId/refreshSummary son no-ops; run es pasante porque
    // esta pantalla no tiene su propio estado "busy".
    const vm = useMemo(
        () => ({
            run: (op) => op(),
            setStatus: () => {},
            requirePersonId: () => null,
            refreshSummary: () => Promise.resolve(null),
        }),
        []
    );

    const face = useFaceCapture({
        vm,
        socket: kioskVm.socket,
        onIdentified: (data) =>
            kioskVm.onIdentified(data.person_id, { biometricType: "FACIAL", score: data.score }),
    });
    const fingerprint = useFingerprintReader({
        vm,
        socket: kioskVm.socket,
        onIdentified: (data) =>
            kioskVm.onIdentified(data.person_id, { biometricType: "FINGERPRINT", score: data.score }),
    });

    // Enciende la cámara una sola vez al entrar al kiosco: es un modo
    // pasivo/desatendido, no tiene sentido pedir al profesor que pulse
    // "dar acceso a la cámara" cada vez que abre una clase.
    useEffect(() => {
        face.startCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Ciclo pasivo: mientras se espera (WAITING) y la cámara ya está
    // lista, intenta reconocer el rostro de quien se acerque. Vuelve a
    // dispararse solo cuando activeCapture regresa a null (la captura
    // anterior terminó) y kioskVm.view vuelve a WAITING (tras el timer
    // de SUCCESS/DUPLICATE/ERROR del viewmodel).
    useEffect(() => {
        if (kioskVm.view !== "WAITING") return;
        if (!face.cameraReady) return;
        if (activeCapture !== null) return;

        let cancelled = false;
        setActiveCapture("FACE");
        face
            .loginFace()
            .catch((e) => kioskVm.onCaptureError(e.message))
            .finally(() => {
                if (!cancelled) setActiveCapture(null);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kioskVm.view, face.cameraReady, activeCapture]);

    const handleFingerprintPress = () => {
        setActiveCapture("FINGER");
        fingerprint
            .loginFingerprint()
            .catch((e) => kioskVm.onCaptureError(e.message))
            .finally(() => setActiveCapture(null));
    };

    // El viewmodel central solo conoce SELECT_SESSION/WAITING/SUCCESS/
    // DUPLICATE/ERROR. CAPTURING_FACE/CAPTURING_FINGER son una derivación
    // puramente local: solo tienen sentido mientras el viewmodel sigue en
    // WAITING y esta pantalla sabe que ya lanzó una captura.
    const displayState =
        activeCapture === "FACE" && kioskVm.view === "WAITING"
            ? "CAPTURING_FACE"
            : activeCapture === "FINGER" && kioskVm.view === "WAITING"
              ? "CAPTURING_FINGER"
              : kioskVm.view;

    const messages = {
        WAITING: { icon: "user", tone: "default", title: t("Acércate al lector") },
        CAPTURING_FACE: { icon: "camera", tone: "primary", title: t("Verificando rostro...") },
        CAPTURING_FINGER: { icon: "target", tone: "primary", title: t("Verificando huella...") },
        SUCCESS: { icon: "check-circle", tone: "success", title: t("Asistencia registrada") },
        DUPLICATE: { icon: "repeat", tone: "warning", title: t("Ya registrado") },
        ERROR: { icon: "x-circle", tone: "danger", title: t("No se pudo verificar") },
    };
    const banner = messages[displayState] || messages.WAITING;
    const bannerColor = toneColor(c, banner.tone);

    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <PageHeader
                title={t("Kiosco de asistencia")}
                subtitle={t("Cada estudiante se acerca y se identifica por rostro o huella")}
            />
            <ScrollView
                contentContainerStyle={{ padding: 24, gap: 20, alignItems: "center", flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ width: "100%", maxWidth: 560, gap: 20, alignItems: "center" }}>
                    <Card
                        padding="lg"
                        style={{ width: "100%" }}
                        contentStyle={{ alignItems: "center", gap: 16, paddingVertical: 48 }}
                    >
                        <View
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: 48,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: `${bannerColor}22`,
                            }}
                        >
                            <Feather name={banner.icon} size={48} color={bannerColor} />
                        </View>
                        <Text style={{ color: c.text.primary, fontSize: 24, fontWeight: "700", textAlign: "center" }}>
                            {banner.title}
                        </Text>
                        {displayState === "ERROR" && !!kioskVm.statusMessage && (
                            <Text style={{ color: c.text.secondary, fontSize: 14, textAlign: "center" }}>
                                {kioskVm.statusMessage}
                            </Text>
                        )}
                        <Text style={{ color: c.text.secondary, fontSize: 13 }}>
                            {t("Registrados")}: {kioskVm.registeredActorIds.size}
                        </Text>
                    </Card>

                    <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                        {fingerprint.deviceReady && (
                            <Button
                                variant="outline"
                                style={{ flex: 1 }}
                                disabled={activeCapture !== null}
                                leftIcon={<Feather name="target" size={16} color={c.brand.primary} />}
                                onPress={handleFingerprintPress}
                            >
                                {t("Usa tu huella")}
                            </Button>
                        )}
                        <Button
                            variant="danger"
                            style={{ flex: 1 }}
                            leftIcon={<Feather name="stop-circle" size={16} color={c.brand.textOnPrimary} />}
                            onPress={kioskVm.endClass}
                        >
                            {t("Finalizar clase")}
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default function AttendanceKioskView() {
    const kioskVm = useAttendanceKioskViewModel();

    if (kioskVm.view === "SELECT_SESSION") {
        return <SelectSessionPanel kioskVm={kioskVm} />;
    }

    return <CapturePanel kioskVm={kioskVm} />;
}
