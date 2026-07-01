import { useWindowDimensions, PixelRatio } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useResponsive() {

    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    // Safe area real
    const safeHeight = height - insets.top - insets.bottom;

    const NAVBAR_H = 68;
    const FOOTER_H = 52;

    const usableHeight =
        safeHeight
        - NAVBAR_H
        - FOOTER_H;

    const isSmall  = width < 768;
    const isMedium = width >= 768 && width < 1024;
    const isLarge  = width >= 1280;

    const BASE_W = 1280;
    const BASE_H = 720;

    const widthScale  = width / BASE_W;
    const heightScale = usableHeight / BASE_H;

    // mezcla progresiva
    let scale = (widthScale * 0.72) + (heightScale * 0.28);

    // móvil conserva más el diseño original
    if (isSmall) {
        scale *= 0.98;
    }

    // límites suaves
    scale = Math.max(0.82, Math.min(scale, 1.22));

    let fontScale: number;

    if (width <= 320) {
        fontScale = 0.88;
    }
    else if (width < 768) {

        // transición suave móvil
        const t = (width - 320) / (768 - 320);

        fontScale =
            0.88 +
            (t * (1.0 - 0.88));
    }
    else if (width < 1024) {

        const t = (width - 768) / (1024 - 768);

        fontScale =
            1.0 +
            (t * (1.05 - 1.0));
    }
    else {

        const t = Math.min(
            (width - 1024) / (1440 - 1024),
            1
        );

        fontScale =
            1.05 +
            (t * (1.1 - 1.05));
    }

    // ajuste dinámico leve
    fontScale *= Math.min(scale * 1.02, 1.05);

    // protección extrema
    fontScale = Math.max(0.88, Math.min(fontScale, 1.12));

    // ---------- HELPERS ----------

    const fs = (base: number) => {
        return Math.round(
            PixelRatio.roundToNearestPixel(
                base * fontScale
            )
        );
    };

    const sp = (base: number) => {
        return Math.round(
            PixelRatio.roundToNearestPixel(
                base * scale
            )
        );
    };

    const vp = (percent: number) => {
        return Math.round(
            (usableHeight * percent) / 100
        );
    };

    return {
        width,
        height,

        usableHeight,

        insets,

        scale,
        fontScale,

        fs,
        sp,
        vp,

        isSmall,
        isMedium,
        isLarge,

        isPortrait: height >= width,
        isLandscape: width > height,
    };
}