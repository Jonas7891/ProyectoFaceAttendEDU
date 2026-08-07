// ============================================================
//  FaceAttend EDU — AnimatedDropdown (UI reutilizable)
//
//  Dropdown animado que flota sobre todo el contenido usando
//  un Modal transparente + measureInWindow para posicionarse
//  exactamente debajo del trigger.
//
//  Reemplaza las implementaciones duplicadas de:
//    - CourseFilterSelector (StudentsView)
//    - RoleSelector (RegisterStudentModal)
//    - LanguageSelector (SettingsView)
//
//  Uso:
//    <AnimatedDropdown
//      trigger={<View>...</View>}
//      items={[{ value: "a", label: "Opción A", icon: "user" }]}
//      value="a"
//      onSelect={v => onChange(v)}
//    />
// ============================================================

import React, { useRef, useState, useCallback } from "react";
import {
    View, Text, TouchableOpacity, ScrollView,
    Modal, Animated, Easing, ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";

export interface DropdownItem<T extends string = string> {
    value:       T;
    label:       string;
    /** Nombre de ícono de Feather (opcional) */
    icon?:       string;
    /** Descripción secundaria */
    description?: string;
}

export interface AnimatedDropdownProps<T extends string = string> {
    items:       DropdownItem<T>[];
    value:       T;
    onSelect:    (v: T) => void;
    placeholder?: string;
    /** Ícono del trigger */
    triggerIcon?: string;
    disabled?:   boolean;
    error?:      boolean;
    /** Altura del trigger en px */
    triggerHeight?: number;
    /** Número máximo de ítems visibles antes de scrollear */
    maxVisible?:  number;
    style?:       ViewStyle;
}

const ITEM_H = 44;

export function AnimatedDropdown<T extends string = string>({
    items,
    value,
    onSelect,
    placeholder  = "Seleccionar…",
    triggerIcon,
    disabled     = false,
    error        = false,
    triggerHeight = 40,
    maxVisible   = 6,
    style,
}: AnimatedDropdownProps<T>) {
    const { theme } = useTheme();
    const c = theme.colors;

    const [open,        setOpen]        = useState(false);
    const [triggerRect, setTriggerRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const triggerRef   = useRef<View>(null);
    const dropdownAnim = useRef(new Animated.Value(0)).current;

    const PANEL_H = Math.min(items.length, maxVisible) * ITEM_H;

    const animateOpen = useCallback(() => {
        triggerRef.current?.measureInWindow((x, y, width, height) => {
            setTriggerRect({ x, y, width, height });
            setOpen(true);
            Animated.timing(dropdownAnim, {
                toValue:  1,
                duration: 170,
                easing:   Easing.out(Easing.quad),
                useNativeDriver: false,
            }).start();
        });
    }, [dropdownAnim]);

    const animateClose = useCallback(() => {
        Animated.timing(dropdownAnim, {
            toValue:  0,
            duration: 130,
            easing:   Easing.in(Easing.quad),
            useNativeDriver: false,
        }).start(() => setOpen(false));
    }, [dropdownAnim]);

    const handleToggle = useCallback(() => {
        if (disabled) return;
        open ? animateClose() : animateOpen();
    }, [open, disabled, animateOpen, animateClose]);

    const handleSelect = useCallback((v: T) => {
        onSelect(v);
        animateClose();
    }, [onSelect, animateClose]);

    const panelHeight  = dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PANEL_H] });
    const panelOpacity = dropdownAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] });

    const selected = items.find(i => i.value === value);
    const label    = selected?.label ?? placeholder;

    const borderColor = error
        ? c.states.danger
        : open ? c.brand.primary : c.border.primary;

    return (
        <View style={style}>
            {/* ── Trigger ─────────────────────────────── */}
            <View ref={triggerRef} collapsable={false}>
                <TouchableOpacity
                    onPress={handleToggle}
                    activeOpacity={0.8}
                    style={{
                        height:       triggerHeight,
                        flexDirection: "row",
                        alignItems:   "center",
                        gap:          8,
                        paddingHorizontal: 12,
                        borderRadius: 6,
                        borderWidth:  open ? 2 : 1,
                        borderColor,
                        backgroundColor: open
                            ? c.brand.primaryLight
                            : (error ? c.states.dangerLight : c.background.app),
                        borderBottomLeftRadius:  open ? 0 : 6,
                        borderBottomRightRadius: open ? 0 : 6,
                        opacity: disabled ? 0.5 : 1,
                    }}
                >
                    {(triggerIcon || selected?.icon) && (
                        <Feather
                            name={(triggerIcon ?? selected?.icon) as any}
                            size={14}
                            color={open ? c.brand.primary : c.text.secondary}
                        />
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize:   13,
                            fontWeight: selected ? "600" : "400",
                            color: open
                                ? c.brand.primary
                                : (selected ? c.text.primary : c.text.secondary),
                        }} numberOfLines={1}>
                            {label}
                        </Text>
                        {selected?.description && (
                            <Text style={{ fontSize: 11, color: c.text.secondary, marginTop: 1 }}>
                                {selected.description}
                            </Text>
                        )}
                    </View>
                    <Animated.View style={{
                        transform: [{
                            rotate: dropdownAnim.interpolate({
                                inputRange:  [0, 1],
                                outputRange: ["0deg", "180deg"],
                            }),
                        }],
                    }}>
                        <Feather
                            name="chevron-down"
                            size={14}
                            color={open ? c.brand.primary : c.text.secondary}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            {/* ── Panel flotante en Modal transparente ── */}
            {open && triggerRect && (
                <Modal
                    transparent
                    animationType="none"
                    visible={open}
                    onRequestClose={animateClose}
                    statusBarTranslucent
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={animateClose}
                    >
                        <Animated.View
                            pointerEvents="box-none"
                            style={{
                                position:  "absolute",
                                top:       triggerRect.y + triggerRect.height,
                                left:      triggerRect.x,
                                width:     triggerRect.width,
                                height:    panelHeight,
                                opacity:   panelOpacity,
                                overflow:  "hidden",
                                borderWidth:    2,
                                borderTopWidth: 0,
                                borderColor:    c.brand.primary,
                                borderBottomLeftRadius:  6,
                                borderBottomRightRadius: 6,
                                backgroundColor: c.background.surface,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.18,
                                shadowRadius:  10,
                                elevation: 20,
                                zIndex: 9999,
                            }}
                        >
                            <TouchableOpacity activeOpacity={1}>
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    style={{ maxHeight: PANEL_H }}
                                >
                                    {items.map((item, i) => {
                                        const active = value === item.value;
                                        const isLast = i === items.length - 1;
                                        return (
                                            <TouchableOpacity
                                                key={item.value}
                                                onPress={() => handleSelect(item.value)}
                                                activeOpacity={0.7}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems:   "center",
                                                    gap:          10,
                                                    paddingHorizontal: 12,
                                                    height: ITEM_H,
                                                    backgroundColor: active
                                                        ? c.brand.primaryLight
                                                        : "transparent",
                                                    borderBottomWidth: isLast ? 0 : 1,
                                                    borderBottomColor: c.border.primary,
                                                }}
                                            >
                                                {item.icon && (
                                                    <Feather
                                                        name={item.icon as any}
                                                        size={13}
                                                        color={active ? c.brand.primary : c.text.secondary}
                                                    />
                                                )}
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{
                                                        fontSize:   13,
                                                        fontWeight: active ? "600" : "400",
                                                        color: active ? c.brand.primary : c.text.primary,
                                                    }} numberOfLines={1}>
                                                        {item.label}
                                                    </Text>
                                                    {item.description && (
                                                        <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                </View>
                                                {active && (
                                                    <Feather name="check" size={13} color={c.brand.primary} />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </TouchableOpacity>
                        </Animated.View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
}
