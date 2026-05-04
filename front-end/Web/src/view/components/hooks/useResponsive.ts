import { useWindowDimensions } from "react-native";

export function useResponsive() {
    const { width, height } = useWindowDimensions();

    const NAVBAR_H = 68;
    const FOOTER_H = 52;
    const usableHeight = height - NAVBAR_H - FOOTER_H;

    const isSmall  = width < 768;
    const isMedium = width < 1024;
    const isLarge  = width >= 1280;

    // En móvil scale = 1.0 para que sp() devuelva px reales
    const BASE_W = 1280;
    const BASE_H = 640;
    const rawScale = Math.min(width / BASE_W, usableHeight / BASE_H);
    const scale = isSmall ? 1.0 : Math.min(Math.max(rawScale, 0.6), 1.35);

    // fontScale — más generoso en móvil que antes
    let fontScale: number;
    if (width <= 320)       fontScale = 0.88;
    else if (width < 768)   fontScale = 0.88 + ((width - 320) / (768 - 320)) * (1.0 - 0.88);
    else if (width < 1024)  fontScale = 1.0  + ((width - 768) / (1024 - 768)) * (1.05 - 1.0);
    else                    fontScale = 1.05 + ((width - 1024) / (1280 - 1024)) * (1.1 - 1.05);

    const fs = (base: number) => Math.round(base * fontScale);
    const sp = (base: number) => Math.round(base * scale);
    const vp = (percent: number) => Math.round((usableHeight * percent) / 100);

    return { scale, fontScale, fs, sp, vp, isSmall, isMedium, isLarge, width, height, usableHeight };
}