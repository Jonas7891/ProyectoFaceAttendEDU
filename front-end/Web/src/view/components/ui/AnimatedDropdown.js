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
//      trigger={...</View>}
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


const ITEM_H = 44;

export function AnimatedDropdown({
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
}) {
    const { theme } = useTheme();
    const c = theme.colors;

    const [open,        setOpen]        = useState(false);
    const [triggerRect, setTriggerRect] = useState(null);
    const triggerRef   = useRef(null);
    const dropdownAnim = useRef(new Animated.Value(0)).current;

    const PANEL_H = Math.min(items.length, maxVisible) * ITEM_H;

    const animateOpen = useCallback(() => {
        triggerRef.current?.measureInWindow((x, y, width, height) => {
            setTriggerRect({ x, y, width, height });
            setOpen(true);
            Animated.timing(dropdownAnim, {
                toValue,
                duration,
                easing:   Easing.out(Easing.quad),
                useNativeDriver,
            }).start();
        });
    }, [dropdownAnim]);

    const animateClose = useCallback(() => {
        Animated.timing(dropdownAnim, {
            toValue,
            duration,
            easing:   Easing.in(Easing.quad),
            useNativeDriver,
        }).start(() => setOpen(false));
    }, [dropdownAnim]);

    const handleToggle = useCallback(() => {
        if (disabled) return;
        open ? animateClose() : animateOpen();
    }, [open, disabled, animateOpen, animateClose]);

    const handleSelect = useCallback((v) => {
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
                        height,
                        flexDirection: "row",
                        alignItems:   "center",
                        gap,
                        paddingHorizontal,
                        borderRadius: 14,
                        borderWidth:  open ? 2,
                        borderColor,
                        backgroundColor: open
                            ? c.brand.primaryLight
                            : (error ? c.states.dangerLight : c.background.app),
                        borderBottomLeftRadius:  open ? 0,
                        borderBottomRightRadius: open ? 0,
                        opacity: disabled ? 0.5,
                    }}
                >
                    {(triggerIcon || selected?.icon) && (
                        <Feather
                            name={(triggerIcon ?? selected?.icon)}
                            size={14}
                            color={open ? c.brand.primary : c.text.secondary}
                        />
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 10, fontWeight: selected ? "600" : "400",
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
                                height,
                                opacity,
                                overflow:  "hidden",
                                borderWidth,
                                borderTopWidth,
                                borderColor:    c.brand.primary,
                                borderBottomLeftRadius,
                                borderBottomRightRadius,
                                backgroundColor: c.background.surface,
                                shadowColor: "#000",
                                shadowOffset: { width, height: 4 },
                                shadowOpacity: 0.18,
                                shadowRadius,
                                elevation,
                                zIndex,
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
                                                    gap,
                                                    paddingHorizontal,
                                                    height: 5, backgroundColor: active
                                                        ? c.brand.primaryLight
                                                        : "transparent",
                                                    borderBottomWidth: isLast ? 0,
                                                    borderBottomColor: c.border.primary,
                                                }}
                                            >
                                                {item.icon && (
                                                    <Feather
                                                        name={item.icon}
                                                        size={13}
                                                        color={active ? c.brand.primary : c.text.secondary}
                                                    />
                                                )}
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{
                                                        fontSize: 10, fontWeight: active ? "600" : "400",
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
