// ============================================================
//  FaceAttend EDU � FaceRegistrationModal  v4  (face-api.js real)
//
//  Usa @vladmandic/face-api para:
//  - Detecci�n de rostro (SSD MobileNetV1)
//  - 68 landmarks faciales
//  - Descriptor real de 128 floats (face recognition model)
//
//  Flujo:
//   options ? camera (loop de an�lisis) ? confirm ? done
//
//  Autocaptura: cuando faceFound + centered + sizeOk + brightOk
//  se mantienen 8 frames seguidos (~1.5s a 5fps).
//
//  Recorte: solo el rostro + margen, exportado como PNG.
//
//  Alternativa: carga de .json faceattend-v1 preexistente.
// ============================================================

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    Modal, View, Text, TouchableOpacity, ScrollView,
    ActivityIndicator, Animated, Easing, Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme }       from "../hooks/useTheme";
import { useResponsive }  from "../hooks/useResponsive";
import { useTranslation } from "../../../i18n/hooks/useTranslation";

// -- Funciones auxiliares ----------------------------------------`n`nlet faceapiModule = null;
let modelsLoaded = false;

async function loadFaceApi(modelPath) {
    if (modelsLoaded && faceapiModule) return true;
    try {
        // Import din�mico para no bloquear el bundle inicial
        faceapiModule = await import("@vladmandic/face-api");
        const fa = faceapiModule;
        await Promise.all([
            fa.nets.ssdMobilenetv1.loadFromUri(modelPath),
            fa.nets.faceLandmark68Net.loadFromUri(modelPath),
            fa.nets.faceRecognitionNet.loadFromUri(modelPath),
        ]);
        modelsLoaded = true;
        return true;
    } catch (e) {
        console.warn("[face-api] Error cargando modelos:", e);
        return false;
    }
}

// -- An�lisis de frame -------------------------------------

async function analyzeFrame(
    video,
    workCanvas,
) {
    const W = video.videoWidth  || 640;
    const H = video.videoHeight || 480;
    workCanvas.width  = W;
    workCanvas.height = H;
    const ctx = workCanvas.getContext("2d");
    ctx.save();
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, W, H);
    ctx.restore();

    // -- Brillo --------------------------------------------
    const sid = ctx.getImageData(W * 0.2, H * 0.1, W * 0.6, H * 0.8);
    let lum = 0;
    for (let i = 0; i < sid.data.length; i += 16) {
        lum += 0.299 * sid.data[i] + 0.587 * sid.data[i + 1] + 0.114 * sid.data[i + 2];
    }
    lum /= sid.data.length / 16;
    const brightOk = lum > 45 && lum < 215;

    const FAIL = { faceFound: false, centered: false, sizeOk: false, brightOk, frontal: false, pitchOk: false, eyesOpen: false, bbox: null, descriptor: null, landmarks: null };

    if (!faceapiModule || !modelsLoaded) return FAIL;

    const fa = faceapiModule;
    try {
        const detection = await fa
            .detectSingleFace(workCanvas, new fa.SsdMobilenetv1Options({ minConfidence: 0.65 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) return FAIL;

        const { x, y, width, height } = detection.detection.box;
        const bbox = { x, y, w: width, h: height };

        const cx = x + width  / 2;
        const cy = y + height / 2;

        // -- Centrado estricto -----------------------------
        const centered = cx > W * 0.30 && cx < W * 0.70 &&
                         cy > H * 0.20 && cy < H * 0.75;

        // -- Tama�o m�nimo: la cara debe ocupar =22% del alto -
        const sizeOk = height / H >= 0.22 && width / W >= 0.15;

        const lm = detection.landmarks.positions;

        // -- �ngulo frontal (yaw) -------------------------
        // Comparamos la distancia nariz?oreja izquierda vs nariz?oreja derecha.
        // Landmarks: nariz tip = 30, oreja izq � pt0, oreja der � pt16
        // Asimetr�a tolerable: =25% de diferencia entre los dos lados
        const noseTip = lm[30];
        const earL    = lm[0];
        const earR    = lm[16];
        const distL   = Math.abs(noseTip.x - earL.x);
        const distR   = Math.abs(noseTip.x - earR.x);
        const maxDist = Math.max(distL, distR);
        const yawRatio = maxDist > 0 ? Math.abs(distL - distR) / maxDist : 1;
        const frontal  = yawRatio < 0.28;   // =28% de asimetr�a ? frontal

        // -- Inclinaci�n vertical (pitch) -----------------
        // Comparamos posici�n vertical de los ojos con la nariz.
        // Centro de ojo izq: promedio pts 36�41, ojo der: 42�47
        const eyeLY = (lm[37].y + lm[38].y + lm[40].y + lm[41].y) / 4;
        const eyeRY = (lm[43].y + lm[44].y + lm[46].y + lm[47].y) / 4;
        const eyeAvgY = (eyeLY + eyeRY) / 2;
        // Distancia normalizada entre ojos y nariz respecto al bbox
        const eyeNoseNorm = (noseTip.y - eyeAvgY) / height;
        // Si la cabeza baja, los ojos suben en relaci�n a la nariz
        // Si sube, los ojos bajan. Rango aceptable: 0.25�0.48
        const pitchOk = eyeNoseNorm > 0.22 && eyeNoseNorm < 0.50;

        // -- Ojos abiertos --------------------------------
        // Eye Aspect Ratio (EAR) est�ndar: EAR = (A+B) / (2*C)
        // donde A,B son distancias verticales de los p�rpados y C horizontal
        const earEye = (pts) => {
            const [p1,p2,p3,p4,p5,p6] = pts.map(i => lm[i]);
            const A = Math.hypot(p2.x - p6.x, p2.y - p6.y);
            const B = Math.hypot(p3.x - p5.x, p3.y - p5.y);
            const C = Math.hypot(p1.x - p4.x, p1.y - p4.y);
            return C > 0 ? (A + B) / (2 * C) : 0;
        };
        const earLeft  = earEye([36, 37, 38, 39, 40, 41]);
        const earRight = earEye([42, 43, 44, 45, 46, 47]);
        const earAvg   = (earLeft + earRight) / 2;
        // EAR < 0.20 = ojos cerrados, > 0.20 = abiertos
        const eyesOpen = earAvg > 0.20;

        const desc = Array.from(detection.descriptor);
        const lmPoints = lm.map(p => ({ x: p.x, y: p.y }));

        return { faceFound: true, centered, sizeOk, brightOk, frontal, pitchOk, eyesOpen, bbox, descriptor: desc, landmarks: lmPoints };
    } catch {
        return FAIL;
    }
}

// -- Recorte del rostro � m�scara el�ptica sobre bbox -----
//
// Misma elipse proporcional al �valo gu�a visual.
// Sin path de landmarks (genera deformaciones).
// Recorte centrado en el bbox + m�rgenes, con blur en bordes.

function cropFace(src, bbox, _landmarks) {
    if (!bbox) return src.toDataURL("image/jpeg", 0.9);

    // M�rgenes ajustados � recorte m�s ce�ido al rostro
    const mX  = bbox.w * 0.52;   // lateral: incluye orejas sin exceso
    const mYt = bbox.h * 0.68;   // arriba: frente + algo de cabello
    const mYb = bbox.h * 0.35;   // abajo: solo cuello

    const sx = Math.max(0,         Math.round(bbox.x - mX));
    const sy = Math.max(0,         Math.round(bbox.y - mYt));
    const ex = Math.min(src.width, Math.round(bbox.x + bbox.w + mX));
    const ey = Math.min(src.height,Math.round(bbox.y + bbox.h + mYb));
    const sw = ex - sx;
    const sh = ey - sy;

    // Canvas de salida = solo el recorte
    const out = document.createElement("canvas");
    out.width  = sw;
    out.height = sh;
    const ctx  = out.getContext("2d");
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);

    // M�scara el�ptica � misma proporci�n que el �valo gu�a (ry/rx � 1/0.78)
    const mask  = document.createElement("canvas");
    mask.width  = sw;
    mask.height = sh;
    const mctx  = mask.getContext("2d");

    const cx = sw / 2;
    const cy = sh * 0.46;       // ligeramente desplazado hacia arriba
    const rx = sw * 0.46;
    const ry = sh * 0.50;

    mctx.beginPath();
    mctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    mctx.fillStyle = "#fff";
    mctx.fill();

    // Blur en canvas intermedio para bordes suaves
    const blurred  = document.createElement("canvas");
    blurred.width  = sw;
    blurred.height = sh;
    const bctx     = blurred.getContext("2d");
    (bctx).filter = "blur(10px)";
    bctx.drawImage(mask, 0, 0);
    (bctx).filter = "none";

    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(blurred, 0, 0);
    ctx.globalCompositeOperation = "source-over";

    return out.toDataURL("image/png");
}

// -- Descarga JSON -----------------------------------------

function downloadJson(data) {
    if (Platform.OS !== "web") return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `face_${data.studentId}_${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
}

// -- Componente principal ----------------------------------

export default function FaceRegistrationModal({ visible, studentName, studentId, onClose, onConfirm }) {
    const { theme }   = useTheme();
    const { isSmall } = useResponsive();
    const { t }       = useTranslation();
    const c           = theme.colors;

    const [step,        setStep]       = useState("options");
    const [camState,    setCamState]   = useState("requesting");
    const [modelState,  setModelState] = useState("idle");
    const [capturedUrl, setCaptured]   = useState(null);
    const [descriptor,  setDescriptor] = useState(null);
    const [loadError,   setLoadError]  = useState(null);
    const [processing,  setProcessing] = useState(false);
    const [quality,     setQuality]    = useState({
        faceFound, centered, sizeOk,
        brightOk, frontal, pitchOk, eyesOpen,
        bbox, descriptor, landmarks,
    });
    const [stableProgress, setStableProgress] = useState(0); // 0-100

    const videoRef   = useRef(null);
    const workCanvas = useRef(null);   // canvas oculto para an�lisis
    const overlayRef = useRef(null);   // canvas visible superpuesto
    const streamRef  = useRef(null);
    const fileRef    = useRef(null);
    const loopTimer  = useRef(null);
    const stableCnt  = useRef(0);
    const didCapture = useRef(false);

    const STABLE_TARGET = 8;   // ~1.5s

    // -- Reset -----------------------------------------

    const stopStream = useCallback(() => {
        clearTimeout(loopTimer.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
    }, []);

    const resetAll = useCallback(() => {
        stopStream();
        stableCnt.current  = 0;
        didCapture.current = false;
        setStep("options"); setCamState("requesting");
        setCaptured(null);  setDescriptor(null);
        setLoadError(null); setProcessing(false);
        setStableProgress(0);
        setQuality({ faceFound, centered, sizeOk, brightOk, frontal, pitchOk, eyesOpen, bbox, descriptor, landmarks: null });
    }, [stopStream]);

    useEffect(() => { if (!visible) resetAll(); }, [visible, resetAll]);

    // -- Loop de detecci�n ~5fps ------------------------

    const analysisLoop = useCallback(async () => {
        if (didCapture.current) return;
        const video = videoRef.current;
        const wc    = workCanvas.current;
        if (!video || !wc || video.readyState < 2) {
            loopTimer.current = setTimeout(analysisLoop, 250);
            return;
        }

        const q = await analyzeFrame(video, wc);
        const allOk = q.faceFound && q.centered && q.sizeOk && q.brightOk &&
                      q.frontal && q.pitchOk && q.eyesOpen;

        stableCnt.current = allOk
            ? Math.min(stableCnt.current + 1, STABLE_TARGET)
            : Math.max(stableCnt.current - 1, 0);

        setQuality(q);
        setStableProgress(Math.round((stableCnt.current / STABLE_TARGET) * 100));

        // Overlay visual del bbox
        const overlay = overlayRef.current;
        if (overlay) {
            const W = overlay.width  = video.videoWidth  || 640;
            const H = overlay.height = video.videoHeight || 480;
            const ctx = overlay.getContext("2d");
            ctx.clearRect(0, 0, W, H);

            // Fondo oscuro sobre todo, luego "recortamos" el bbox
            if (q.bbox) {
                const { x, y, w, h } = q.bbox;
                // Opacidad variable seg�n progreso (m�s oscuro = mejor)
                const alpha = 0.25 + (stableCnt.current / STABLE_TARGET) * 0.25;
                ctx.fillStyle = `rgba(0,0,0,${alpha})`;
                // Cuatro rect�ngulos alrededor del bbox
                ctx.fillRect(0, 0, W, y);
                ctx.fillRect(0, y + h, W, H - y - h);
                ctx.fillRect(0, y, x, h);
                ctx.fillRect(x + w, y, W - x - w, h);

                // Borde del rostro
                const color = allOk ? "#10b981" : q.faceFound ? "#38bdf8" : "#ef4444";
                ctx.strokeStyle = color;
                ctx.lineWidth   = 3;
                ctx.shadowColor = color;
                ctx.shadowBlur  = 10;
                const r = 10;
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y,     x + w, y + h,     r);
                ctx.arcTo(x + w, y + h, x,     y + h,     r);
                ctx.arcTo(x,     y + h, x,     y,         r);
                ctx.arcTo(x,     y,     x + w, y,         r);
                ctx.closePath();
                ctx.stroke();

                // Barra de progreso arriba del bbox
                if (stableCnt.current > 0) {
                    const barW = w * (stableCnt.current / STABLE_TARGET);
                    ctx.fillStyle = "#10b981";
                    ctx.shadowBlur = 0;
                    ctx.fillRect(x, y - 6, barW, 4);
                }
            }
        }

        // Autocaptura
        if (stableCnt.current >= STABLE_TARGET && !didCapture.current) {
            didCapture.current = true;
            stopStream();
            const faceUrl = cropFace(wc, q.bbox, q.landmarks);
            setCaptured(faceUrl);
            // Guardar descriptor real en ref para confirmar luego
            if (q.descriptor) {
                (window).__faceDescriptor__ = q.descriptor;
            }
            setStep("confirm");
            return;
        }

        loopTimer.current = setTimeout(analysisLoop, 200);
    }, [stopStream]);

    // -- Iniciar c�mara --------------------------------

    const startCamera = useCallback(async () => {
        setStep("camera"); setCamState("requesting");
        setCaptured(null);
        stableCnt.current  = 0;
        didCapture.current = false;
        setStableProgress(0);
        setQuality({ faceFound, centered, sizeOk, brightOk, frontal, pitchOk, eyesOpen, bbox, descriptor, landmarks: null });

        if (Platform.OS !== "web") { setCamState("unsupported"); return; }

        // Cargar modelos si no est�n listos
        if (!modelsLoaded) {
            setModelState("loading");
            const ok = await loadFaceApi("/models");
            setModelState(ok ? "ready" : "error");
            if (!ok) { setCamState("active"); } // igual abrimos c�mara, con fallback
        } else {
            setModelState("ready");
        }

        try {
            const stream = await (navigator).mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
                audio,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setCamState("active");
            setTimeout(analysisLoop, 1000); // dar tiempo al video
        } catch { setCamState("denied"); }
    }, [analysisLoop]);

    const handleManualCapture = useCallback(() => {
        if (!workCanvas.current || didCapture.current) return;
        didCapture.current = true;
        stopStream();
        const lastDesc = (window).__faceDescriptor__;
        const faceUrl  = cropFace(workCanvas.current, quality.bbox, quality.landmarks);
        setCaptured(faceUrl);
        if (lastDesc) (window).__faceDescriptor__ = lastDesc;
        setStep("confirm");
    }, [quality.bbox, quality.landmarks, stopStream]);

    const handleRetake = useCallback(() => { setCaptured(null); startCamera(); }, [startCamera]);

    const handleConfirmCapture = useCallback(() => {
        if (!capturedUrl) return;
        setProcessing(true);
        setTimeout(() => {
            // Usar descriptor real si est� disponible, si no usar sint�tico
            const realDesc).__faceDescriptor__ ?? null;
            delete (window).__faceDescriptor__;
            const desc = {
                version:     "faceattend-v1",
                studentId,
                studentName,
                capturedAt:  new Date().toISOString(),
                descriptor:  realDesc ?? [],
                imageDataUrl,
            };
            setDescriptor(desc);
            setProcessing(false);
            setStep("done");
        }, 400);
    }, [capturedUrl, studentId, studentName]);

    // -- Carga de archivo ------------------------------

    const openFilePicker = useCallback(() => fileRef.current?.click(), []);

    const handleFileLoad = useCallback((e) => {
        const file = e.target?.files?.[0];
        if (!file) return;
        setLoadError(null);
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target?.result);
                if (!parsed.version?.startsWith("faceattend") || !Array.isArray(parsed.descriptor) || parsed.descriptor.length !== 128) {
                    setLoadError(t("Archivo inv�lido. Debe ser un descriptor faceattend-v1 con 128 valores."));
                    return;
                }
                setDescriptor({ ...parsed, studentId: parsed.studentId || studentId, studentName: parsed.studentName || studentName });
                setStep("done");
            } catch { setLoadError(t("El archivo no es un JSON v�lido.")); }
        };
        reader.readAsText(file);
        e.target.value = "";
    }, [studentId, studentName, t]);

    const handleFinalConfirm = useCallback(() => {
        if (!descriptor) return;
        onConfirm({ ...descriptor, imageDataUrl: "" });
        resetAll();
    }, [descriptor, onConfirm, resetAll]);

    const handleClose = useCallback(() => { stopStream(); resetAll(); onClose(); }, [onClose, stopStream, resetAll]);

    if (!visible) return null;

    const stepIndex = { options, camera, confirm, done: 3 }[step];
    const allQOk    = quality.faceFound && quality.centered && quality.sizeOk &&
                      quality.brightOk && quality.frontal && quality.pitchOk && quality.eyesOpen;

    return (
        <Modal transparent animationType="fade" visible={visible}
            onRequestClose={handleClose} statusBarTranslucent>
            <View style={{ flex: 1, backgroundColor: c.background.overlay,
                justifyContent: "center", alignItems: "center",
                padding: isSmall ? 8,
            }}>
                <TouchableOpacity
                    style={{ position: "absolute", top, bottom, left, right: 0 }}
                    activeOpacity={1} onPress={handleClose} />

                <View style={{
                    backgroundColor: c.background.surface, borderRadius: 14,
                    width: isSmall ? "100%" : 500, maxHeight: "96%",
                    overflow: "hidden",
                    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius, elevation,
                }}>
                    {/* Header */}
                    <View style={{
                        flexDirection: "row", alignItems: "center",
                        justifyContent: "space-between",
                        padding, borderBottomWidth, borderBottomColor: c.border.primary,
                    }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <View style={{
                                width, height, borderRadius: 14,
                                backgroundColor: c.brand.primaryLight,
                                alignItems: "center", justifyContent: "center",
                            }}>
                                <Feather name="aperture" size={16} color={c.brand.primary} />
                            </View>
                            
                                <Text style={{ fontSize: 10, fontWeight: "700", color: c.text.primary }}>
                                    {t("Registro facial")}
                                </Text>
                                <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                    {studentName || "�"}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose}
                            hitSlop={{ top, bottom, left, right: 8 }}>
                            <Feather name="x" size={20} color={c.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Barra de progreso */}
                    <View style={{ flexDirection: "row", gap, paddingHorizontal, paddingTop, paddingBottom: 4 }}>
                        {["options","camera","confirm","done"].map((s, i) => (
                            <View key={s} style={{ flex: 1, height, borderRadius: 14,
                                backgroundColor: i <= stepIndex ? c.brand.primary : c.border.primary,
                            }} />
                        ))}
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ padding, paddingBottom: 20 }}>

                        {/* PASO OPTIONS */}
                        {step === "options" && (
                            <OptionsStep c={c} t={t}
                                onCamera={startCamera} onFileLoad={openFilePicker}
                                loadError={loadError} />
                        )}

                        {/* PASO CAMERA */}
                        {step === "camera" && (
                            <CameraStep
                                c={c} t={t}
                                camState={camState}
                                modelState={modelState}
                                videoRef={videoRef}
                                workCanvas={workCanvas}
                                overlayRef={overlayRef}
                                quality={quality}
                                stableProgress={stableProgress}
                                allQOk={allQOk}
                                onCapture={handleManualCapture}
                                onBack={() => { stopStream(); setStep("options"); }}
                            />
                        )}

                        {/* PASO CONFIRM */}
                        {step === "confirm" && (
                            <ConfirmStep c={c} t={t}
                                capturedUrl={capturedUrl}
                                processing={processing}
                                onRetake={handleRetake}
                                onConfirm={handleConfirmCapture} />
                        )}

                        {/* PASO DONE */}
                        {step === "done" && descriptor && (
                            <DoneStep c={c} t={t}
                                descriptor={descriptor}
                                onDownload={() => downloadJson(descriptor)}
                                onConfirm={handleFinalConfirm} />
                        )}
                    </ScrollView>
                </View>

                {/* Input file oculto */}
                {Platform.OS === "web" && (
                                        <input ref={fileRef} type="file"
                        accept=".json,application/json"
                        style={{ display: "none" }}
                        onChange={handleFileLoad} />
                )}
            </View>
        </Modal>
    );
}

// -- Sub-componentes ---------------------------------------

function OptionsStep({ c, t, onCamera, onFileLoad, loadError }) {
    return (
        
            <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.primary, textAlign: "center", marginBottom: 4 }}>
                {t("�C�mo deseas registrar el rostro?")}
            </Text>
            <Text style={{ fontSize: 11, color: c.text.secondary, textAlign: "center", marginBottom: 20 }}>
                {t("Captura en vivo o carga un archivo de descriptor existente")}
            </Text>

            <TouchableOpacity onPress={onCamera} style={{
                flexDirection: "row", alignItems: "center", gap,
                padding, borderRadius: 14,
                borderWidth: 1.5, borderColor: c.brand.primary,
                backgroundColor: c.brand.primaryLight, marginBottom,
            }}>
                <View style={{
                    width, height, borderRadius: 14,
                    backgroundColor: c.brand.primary,
                    alignItems: "center", justifyContent: "center",
                }}>
                    <Feather name="camera" size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: c.brand.primary }}>
                        {t("Capturar con c�mara")}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 2 }}>
                        {t("Usa la c�mara del dispositivo para capturar el rostro en tiempo real")}
                    </Text>
                </View>
                <Feather name="chevron-right" size={16} color={c.brand.primary} />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center", gap, marginBottom: 12 }}>
                <View style={{ flex: 1, height: 5, backgroundColor: c.border.primary }} />
                <Text style={{ fontSize: 11, color: c.text.disabled }}>{t("o tambi�n")}</Text>
                <View style={{ flex: 1, height: 5, backgroundColor: c.border.primary }} />
            </View>

            <TouchableOpacity onPress={onFileLoad} style={{
                flexDirection: "row", alignItems: "center", gap,
                padding, borderRadius: 14,
                borderWidth, borderColor: c.border.primary,
                backgroundColor: c.background.app,
            }}>
                <Feather name="upload" size={16} color={c.text.secondary} />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.secondary }}>
                        {t("Cargar descriptor facial (.json)")}
                    </Text>
                    <Text style={{ fontSize: 11, color: c.text.disabled, marginTop: 1 }}>
                        {t("Si ya tienes el archivo generado previamente")}
                    </Text>
                </View>
                <Feather name="chevron-right" size={14} color={c.text.disabled} />
            </TouchableOpacity>

            {loadError && (
                <View style={{
                    flexDirection: "row", alignItems: "center", gap,
                    marginTop, padding, borderRadius: 14,
                    backgroundColor: c.states.dangerLight,
                }}>
                    <Feather name="alert-circle" size={13} color={c.states.danger} />
                    <Text style={{ fontSize: 11, color: c.states.danger, flex: 1 }}>{loadError}</Text>
                </View>
            )}

            <View style={{
                marginTop, padding, borderRadius: 14,
                backgroundColor: c.background.app,
                borderWidth, borderColor: c.border.primary,
            }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap, marginBottom: 4 }}>
                    <Feather name="info" size={12} color={c.text.secondary} />
                    <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.secondary }}>
                        {t("Formato de archivo")}
                    </Text>
                </View>
                <Text style={{ fontSize: 11, color: c.text.disabled, lineHeight: 16 }}>
                    {t("El archivo .json debe tener el esquema faceattend-v1: descriptor de 128 valores float normalizados (compatible con face-api.js y face_recognition de Python).")}
                </Text>
            </View>
        </View>
    );
}

function CameraStep({ c, t, camState, modelState, videoRef, workCanvas, overlayRef,
    quality, stableProgress, allQOk, onCapture, onBack }) {

    const criteria = [
        { key: "faceFound", label: t("Rostro detectado"),      ok: quality.faceFound  },
        { key: "frontal",   label: t("De frente"),             ok: quality.frontal    },
        { key: "pitchOk",   label: t("Cabeza nivelada"),       ok: quality.pitchOk    },
        { key: "eyesOpen",  label: t("Ojos abiertos"),         ok: quality.eyesOpen   },
        { key: "centered",  label: t("Rostro centrado"),       ok: quality.centered   },
        { key: "sizeOk",    label: t("Tama�o adecuado"),       ok: quality.sizeOk     },
        { key: "brightOk",  label: t("Iluminaci�n correcta"),  ok: quality.brightOk   },
    ];

    return (
        
            {/* Cargando modelos */}
            {modelState === "loading" && (
                <View style={{
                    flexDirection: "row", alignItems: "center", gap,
                    padding, borderRadius: 14, marginBottom,
                    backgroundColor: c.brand.primaryLight,
                    borderWidth, borderColor: c.brand.primary,
                }}>
                    <ActivityIndicator size="small" color={c.brand.primary} />
                    <Text style={{ fontSize: 11, color: c.brand.primary, flex: 1 }}>
                        {t("Cargando modelos de reconocimiento facial�")}
                    </Text>
                </View>
            )}

            {modelState === "error" && (
                <View style={{
                    flexDirection: "row", alignItems: "center", gap,
                    padding, borderRadius: 14, marginBottom,
                    backgroundColor: c.states.dangerLight,
                }}>
                    <Feather name="alert-triangle" size={13} color={c.states.danger} />
                    <Text style={{ fontSize: 11, color: c.states.danger, flex: 1 }}>
                        {t("No se pudieron cargar los modelos. Verifica la conexi�n.")}
                    </Text>
                </View>
            )}

            {/* Visor de c�mara � video + canvas overlay superpuesto */}
            <View style={{
                width: "100%", aspectRatio: 4 / 3,
                borderRadius: 14, overflow: "hidden",
                backgroundColor: "#060a10", marginBottom,
                borderWidth,
                borderColor: allQOk ? c.states.success
                    : quality.faceFound ? c.brand.primary : c.border.primary,
            }}>
                {Platform.OS === "web" && (
                    
                        {}
                        <video ref={videoRef} autoPlay playsInline muted style={{
                            position: "absolute", top, left,
                            width: "100%", height: "100%",
                            objectFit: "cover",
                            transform: "scaleX(-1)",
                        }} />
                        {/* Canvas de an�lisis � oculto */}
                        {}
                        <canvas ref={workCanvas} style={{ display: "none" }} />
                        {/* Canvas de overlay � visible sobre el video */}
                        {}
                        <canvas ref={overlayRef} style={{
                            position: "absolute", top, left,
                            width: "100%", height: "100%",
                            pointerEvents: "none",
                        }} />
                    </>
                )}

                {camState === "requesting" && (
                    <View style={{
                        position: "absolute", top, bottom, left, right,
                        alignItems: "center", justifyContent: "center", gap,
                    }}>
                        <ActivityIndicator size="large" color={c.brand.primary} />
                        <Text style={{ fontSize: 11, color: "#aaa" }}>
                            {t("Solicitando acceso a la c�mara�")}
                        </Text>
                    </View>
                )}
                {camState === "denied" && (
                    <View style={{
                        position: "absolute", top, bottom, left, right,
                        alignItems: "center", justifyContent: "center", gap, padding,
                    }}>
                        <Feather name="camera-off" size={32} color={c.states.danger} />
                        <Text style={{ fontSize: 10, fontWeight: "600", color: c.states.danger, textAlign: "center" }}>
                            {t("Permiso de c�mara requerido")}
                        </Text>
                        <Text style={{ fontSize: 11, color: "#999", textAlign: "center" }}>
                            {t("Permite el acceso a la c�mara desde la configuraci�n de tu navegador")}
                        </Text>
                    </View>
                )}

                {/* Barra de progreso autocaptura */}
                {camState === "active" && stableProgress > 0 && (
                    <View style={{
                        position: "absolute", bottom, left, right, height: 5, backgroundColor: "rgba(0,0,0,0.3)",
                    }}>
                        <View style={{
                            width: `${stableProgress}%`,
                            height: 5, backgroundColor: c.states.success,
                        }} />
                    </View>
                )}

                {/* Badge de estado */}
                {camState === "active" && (
                    <View style={{
                        position: "absolute", top, alignSelf: "center",
                        flexDirection: "row", alignItems: "center", gap,
                        backgroundColor: "rgba(0,0,0,0.65)",
                        borderRadius: 14, paddingHorizontal: 6, paddingVertical: 2,
                    }}>
                        {allQOk ? (
                            <Feather name="check-circle" size={11} color={c.states.success} />
                            <Text style={{ fontSize: 11, color: c.states.success, fontWeight: "600" }}>
                                {t("Capturando�")}
                            </Text></>
                        ) : quality.faceFound ? (
                            <Feather name="user" size={11} color={c.brand.primary} />
                            <Text style={{ fontSize: 11, color: c.brand.primary, fontWeight: "600" }}>
                                {t("Rostro detectado")}
                            </Text></>
                        ) : (
                            <Feather name="search" size={11} color="#aaa" />
                            <Text style={{ fontSize: 11, color: "#aaa" }}>
                                {t("Buscando rostro�")}
                            </Text></>
                        )}
                    </View>
                )}
            </View>

            {/* Checklist de criterios */}
            {camState === "active" && (
                <View style={{
                    flexDirection: "row", flexWrap: "wrap", gap, marginBottom,
                }}>
                    {criteria.map(cr => (
                        <View key={cr.key} style={{
                            flexDirection: "row", alignItems: "center", gap,
                            backgroundColor: cr.ok ? c.states.successLight : c.background.app,
                            borderRadius: 14, paddingHorizontal: 6, paddingVertical: 2,
                            borderWidth,
                            borderColor: cr.ok ? c.states.success : c.border.primary,
                        }}>
                            <Feather
                                name={cr.ok ? "check-circle" : "circle"}
                                size={11}
                                color={cr.ok ? c.states.success : c.text.disabled}
                            />
                            <Text style={{
                                fontSize: 10, fontWeight: "600",
                                color: cr.ok ? c.states.success : c.text.disabled,
                            }}>
                                {cr.label}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Botones */}
            <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={onBack} style={{ flex: 1, flexDirection: "row", alignItems: "center",
                    justifyContent: "center", gap,
                    paddingVertical, borderRadius: 14,
                    borderWidth, borderColor: c.border.primary,
                    backgroundColor: c.background.app,
                }}>
                    <Feather name="arrow-left" size={14} color={c.text.secondary} />
                    <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.secondary }}>{t("Volver")}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onCapture}
                    disabled={camState !== "active"}
                    style={{ flex: 1, flexDirection: "row", alignItems: "center",
                        justifyContent: "center", gap,
                        paddingVertical, borderRadius: 14, apiKey = == "active"
                            ? (allQOk ? c.states.success : c.brand.primary)
                            : c.interactive.disabled,
                    }}>
                    <Feather name="camera" size={16} color="#fff" />
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>
                        {allQOk ? t("Autocapturando�") : t("Capturar ahora")}
                    </Text>
                </TouchableOpacity>
            </View>

            {!allQOk && camState === "active" && (
                <Text style={{ fontSize: 11, color: c.text.disabled, textAlign: "center", marginTop: 8 }}>
                    {t("La imagen se captura autom�ticamente cuando todos los criterios son correctos")}
                </Text>
            )}
        </View>
    );
}

function ConfirmStep({ c, t, capturedUrl, processing, onRetake, onConfirm }) {
    return (
        
            <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.primary, textAlign: "center", marginBottom: 12 }}>
                {t("�Se ve bien el rostro?")}
            </Text>

            {/* Foto capturada real */}
            <View style={{
                width: "100%", aspectRatio: 4 / 3,
                borderRadius: 14, overflow: "hidden", marginBottom,
                borderWidth, borderColor: c.states.success,
                backgroundColor: "transparent",
                alignItems: "center", justifyContent: "center",
            }}>
                {capturedUrl && Platform.OS === "web" && (
                                        <img src={capturedUrl} style={{
                        width: "100%", height: "100%", objectFit: "cover",
                    }} />
                )}
                <View style={{
                    position: "absolute", top, right,
                    flexDirection: "row", alignItems: "center", gap,
                    backgroundColor: "rgba(16,185,129,0.2)",
                    borderRadius: 14, paddingHorizontal: 6, paddingVertical: 2,
                    borderWidth, borderColor: c.states.success,
                }}>
                    <Feather name="check" size={10} color={c.states.success} />
                    <Text style={{ fontSize: 11, color: c.states.success, fontWeight: "700" }}>OK</Text>
                </View>
            </View>

            <Text style={{ fontSize: 11, color: c.text.secondary, textAlign: "center", marginBottom: 16 }}>
                {t("Al confirmar se generar� el descriptor facial para el backend")}
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={onRetake} disabled={processing} style={{ flex: 1, flexDirection: "row", alignItems: "center",
                    justifyContent: "center", gap,
                    paddingVertical, borderRadius: 14,
                    borderWidth, borderColor: c.border.primary,
                    backgroundColor: c.background.app,
                }}>
                    <Feather name="refresh-cw" size={14} color={c.text.secondary} />
                    <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.secondary }}>{t("Repetir")}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onConfirm} disabled={processing} style={{ flex: 1, flexDirection: "row", alignItems: "center",
                    justifyContent: "center", gap,
                    paddingVertical, borderRadius: 14,
                    backgroundColor: processing ? c.interactive.disabled : c.brand.primary,
                }}>
                    {processing
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Feather name="cpu" size={15} color="#fff" />
                    }
                    <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>
                        {processing ? t("Procesando rostro�") : t("Confirmar y generar")}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function DoneStep({ c, t, descriptor, onDownload, onConfirm }) {
    const hasRealDesc = descriptor?.descriptor?.length === 128;
    return (
        
            <View style={{ alignItems: "center", marginBottom: 16 }}>
                <View style={{
                    width, height, borderRadius: 14,
                    backgroundColor: c.states.successLight,
                    alignItems: "center", justifyContent: "center", marginBottom,
                }}>
                    <Feather name="check-circle" size={32} color={c.states.success} />
                </View>
                <Text style={{ fontSize: 10, fontWeight: "700", color: c.text.primary, marginBottom: 4 }}>
                    {t("Descriptor generado")}
                </Text>
                <Text style={{ fontSize: 11, color: c.text.secondary, textAlign: "center" }}>
                    {t("El descriptor facial est� listo para enviarse al backend")}
                </Text>
            </View>

            <View style={{
                backgroundColor: c.background.app, borderRadius: 14,
                padding, borderWidth, borderColor: c.border.primary, marginBottom,
            }}>
                {[
                    { label: t("Estudiante:"),  value: descriptor.studentName },
                    { label: "ID:",             value: descriptor.studentId   },
                    { label: t("Capturado:"),   value: new Date(descriptor.capturedAt).toLocaleString() },
                    { label: t("Dimensiones:"), value: hasRealDesc ? "128D � face-api.js real" : "�" },
                    { label: t("Formato:"),     value: descriptor.version },
                ].map(({ label, value }) => (
                    <View key={label} style={{ flexDirection: "row", gap, marginBottom: 5 }}>
                        <Text style={{ fontSize: 11, color: c.text.secondary, width: 90 }}>{label}</Text>
                        <Text style={{ fontSize: 11, color: c.text.primary, flex: 1 }}>{value}</Text>
                    </View>
                ))}
            </View>

            {/* Badge descriptor real vs sint�tico */}
            <View style={{
                flexDirection: "row", alignItems: "center", gap,
                padding, borderRadius: 14, marginBottom,
                backgroundColor: hasRealDesc ? c.states.successLight : c.states.dangerLight,
                borderWidth, borderColor: hasRealDesc ? c.states.success : c.states.danger,
            }}>
                <Feather
                    name={hasRealDesc ? "shield" : "alert-triangle"}
                    size={12}
                    color={hasRealDesc ? c.states.success : c.states.danger}
                />
                <Text style={{ fontSize: 11, color: hasRealDesc ? c.states.success : c.states.danger, flex: 1 }}>
                    {hasRealDesc
                        ? t("Descriptor real generado con face-api.js (128D)")
                        : t("Descriptor no generado � los modelos no cargaron correctamente")}
                </Text>
            </View>

            <TouchableOpacity onPress={onDownload} style={{
                flexDirection: "row", alignItems: "center",
                justifyContent: "center", gap,
                paddingVertical, borderRadius: 14,
                borderWidth, borderColor: c.border.primary,
                backgroundColor: c.background.app, marginBottom,
            }}>
                <Feather name="download" size={14} color={c.text.secondary} />
                <Text style={{ fontSize: 10, fontWeight: "600", color: c.text.secondary }}>
                    {t("Descargar descriptor (.json)")}
                </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "flex-start", gap, marginBottom: 16 }}>
                <Feather name="shield" size={11} color={c.text.disabled} style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 11, color: c.text.disabled, flex, lineHeight: 15 }}>
                    {t("La imagen original no se almacena en el sistema. Solo se env�a el descriptor num�rico al backend.")}
                </Text>
            </View>

            <TouchableOpacity onPress={onConfirm} style={{
                flexDirection: "row", alignItems: "center",
                justifyContent: "center", gap,
                paddingVertical, borderRadius: 14,
                backgroundColor: c.brand.primary,
            }}>
                <Feather name="user-check" size={16} color="#fff" />
                <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>
                    {t("Registrar estudiante")}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
