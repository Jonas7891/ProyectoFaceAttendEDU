// AUD-58: con 7 a 9 ítems la barra inferior móvil dejaba Alertas/Configuración fuera de pantalla.
import React from "react";
import { TouchableOpacity } from "react-native";
import { create, act } from "react-test-renderer";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../../../../../context/ThemeContext";
import BottomTabBar, { MAX_VISIBLE_TABS } from "../BottomTabBar";

jest.mock("@expo/vector-icons", () => ({ Feather: (props) => `Feather:${props.name}` }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const METRICS = { frame: { x: 0, y: 0, width: 375, height: 800 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };

const mk = (n) => Array.from({ length: n }, (_, i) => ({ key: `k${i}`, icon: "home", label: `Tab ${i}` }));

function setup(tabs, activeKey = "k0") {
    const onSelect = jest.fn();
    let root;
    act(() => {
        root = create(
            <SafeAreaProvider initialMetrics={METRICS}>
                <ThemeProvider>
                    <BottomTabBar tabs={tabs} activeKey={activeKey} onSelect={onSelect} t={(s) => s} />
                </ThemeProvider>
            </SafeAreaProvider>,
        );
    });
    return { root, onSelect };
}

const touchables = (root) => root.root.findAll((n) => n.type === TouchableOpacity);
const labels = (root) => touchables(root).map((n) => n.props.accessibilityLabel);

const press = (root, label) => {
    const node = touchables(root).find((n) => n.props.accessibilityLabel === label);
    act(() => node.props.onPress());
};

test("up to the limit every tab is a direct button and there is no «Más»", () => {
    const { root } = setup(mk(MAX_VISIBLE_TABS));
    expect(labels(root)).toEqual(mk(MAX_VISIBLE_TABS).map((t) => t.label));
});

test("with 8 tabs only (limit - 1) show up front plus «Más», in the original order", () => {
    const { root } = setup(mk(8));
    expect(labels(root)).toEqual([...mk(MAX_VISIBLE_TABS - 1).map((t) => t.label), "Más"]);
});

test("«Más» reveals every remaining tab, in order, and selecting one navigates and closes it", () => {
    const { root, onSelect } = setup(mk(8));
    press(root, "Más");
    expect(labels(root)).toEqual(expect.arrayContaining(["Tab 4", "Tab 5", "Tab 6", "Tab 7"]));
    const overflow = labels(root).filter((l) => /^Tab [4-7]$/.test(l));
    expect(overflow).toEqual(["Tab 4", "Tab 5", "Tab 6", "Tab 7"]);

    press(root, "Tab 7");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ key: "k7" }));
    expect(labels(root)).not.toContain("Tab 7");
});

test("«Más» is highlighted when the active tab lives in the overflow", () => {
    const { root } = setup(mk(8), "k6");
    const more = touchables(root).find((n) => n.props.accessibilityLabel === "Más");
    expect(more.props.accessibilityState).toMatchObject({ selected: true });
});
