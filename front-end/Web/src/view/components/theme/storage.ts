import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_MODE_KEY = "@faceattend_theme_mode";
const ACCENT_COLOR_KEY = "@faceattend_accent_color";

export async function saveThemeMode(mode: "light" | "dark") {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
}

export async function loadThemeMode(): Promise<"light" | "dark"> {
    const value = await AsyncStorage.getItem(THEME_MODE_KEY);

    if (value === "dark") {
        return "dark";
    }

    return "light";
}

export async function saveAccentColor(color: string) {
    await AsyncStorage.setItem(ACCENT_COLOR_KEY, color);
}

export async function loadAccentColor(): Promise<string> {
    const value = await AsyncStorage.getItem(ACCENT_COLOR_KEY);

    return value || "#2563EB";
}