// Utilidades de las pruebas de accesibilidad (AUD-18): render con los proveedores de la app
// y consulta de controles táctiles por su etiqueta.
import React from "react";
import { create, act } from "react-test-renderer";
import { TouchableOpacity, Pressable } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../context/ThemeContext";
import { ResponsiveProvider } from "../../context/ResponsiveContext";

const METRICS = { frame: { x: 0, y: 0, width: 1280, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

export function renderWithProviders(element) {
    let root;
    act(() => {
        root = create(
            <SafeAreaProvider initialMetrics={METRICS}>
                <ThemeProvider><ResponsiveProvider>{element}</ResponsiveProvider></ThemeProvider>
            </SafeAreaProvider>,
        );
    });
    return root;
}

const instanceText = (inst) => inst.children.map((c) => (typeof c === "string" ? c : instanceText(c))).join("");

export const touchables = (root) => root.root.findAll((n) => n.type === TouchableOpacity || n.type === Pressable);

// Controles táctiles sin etiqueta accesible ni texto visible.
export const unnamedTouchables = (root) => touchables(root).filter((n) => !n.props.accessibilityLabel && !instanceText(n).trim());

export const labelsOf = (root) => touchables(root).map((n) => n.props.accessibilityLabel).filter(Boolean);
