import { useWindowDimensions } from "react-native";

export function useResponsive() {
    const { width, height } = useWindowDimensions();

    const NAVBAR_H = 68;
    const FOOTER_H = 52;

    const usableHeight = height - NAVBAR_H - FOOTER_H;

    const BASE_W = 1280;
    const BASE_H = 640;

    // ── Layout / spacing scale (igual que antes) ──────────────────────────
    // Controla: padding, gap, tamaños de contenedores, imágenes, círculos…
    const scaleW = width / BASE_W;
    const scaleH = usableHeight / BASE_H;

    const scale = Math.min(
        Math.max(Math.min(scaleW, scaleH), 0.55),
        1.35
    );

    // ── Font scale: curva lineal suave por breakpoint ─────────────────────
    // Completamente independiente del layout scale para que las fuentes
    // nunca queden ni demasiado pequeñas en móvil ni demasiado grandes en
    // desktop.
    //
    //  Mobile  320 → 768  :  0.72 → 0.88   (displayXL:  37 → 46 px)
    //  Tablet  768 → 1024 :  0.88 → 1.00   (displayXL:  46 → 52 px)
    //  Desktop 1024 → 1280:  1.00 → 1.10   (displayXL:  52 → 57 px)
    //
    // Para ajustar a tu gusto solo toca los 6 valores numéricos de los
    // límites inferiores/superiores de cada rama.

    let fontScale: number;
    if (width <= 320) {
        fontScale = 0.72;
    } else if (width <= 768) {
        fontScale = 0.72 + ((width - 320) / (768 - 320)) * (0.88 - 0.72);
    } else if (width <= 1024) {
        fontScale = 0.88 + ((width - 768) / (1024 - 768)) * (1.0 - 0.88);
    } else {
        fontScale = 1.0 + ((width - 1024) / (1280 - 1024)) * (1.1 - 1.0);
    }

    const isSmall  = width < 768;
    const isMedium = width < 1024;
    const isLarge  = width >= 1280;

    // fs → SOLO para fontSize (usa fontScale)
    const fs = (base: number) => Math.round(base * fontScale);

    // sp → para padding, gap, tamaños de contenedor (usa scale de layout)
    const sp = (base: number) => Math.round(base * scale);

    const vp = (percent: number) =>
        Math.round((usableHeight * percent) / 100);

    return {
        scale,
        fontScale,
        fs,
        sp,
        vp,
        isSmall,
        isMedium,
        isLarge,
        width,
        height,
        usableHeight,
    };
}
