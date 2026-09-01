import React, { useState, useCallback, useRef } from "react";
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Animated, Easing,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../../../i18n/hooks/useTranslation";

export function LanguageSelector() {
    const { theme } = useTheme();
    const c = theme.colors;
    const { language, setLanguage, supportedLanguages, currentLanguage, isLoading, t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const searchRef = useRef(null);
    const dropdownAnim = useRef(new Animated.Value(0)).current;

    // Altura del trigger en px
    const TRIGGER_H = 52;
    // Altura máxima del panel (hasta 6 ítems de 44px + 52 de buscador)
    const MAX_ITEMS = Math.min(supportedLanguages.length, 6);
    const PANEL_H = MAX_ITEMS * 44 + 52;

    const filtered = query.trim() === ""
        ? supportedLanguages
        : supportedLanguages.filter(l =>
            l.labelES.toLowerCase().includes(query.toLowerCase()) ||
            l.label.toLowerCase().includes(query.toLowerCase()) ||
            l.code.toLowerCase().includes(query.toLowerCase())
        );

    const animateOpen = useCallback(() => {
        setOpen(true);
        setQuery("");
        Animated.timing(dropdownAnim, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start(() => searchRef.current?.focus());
    }, [dropdownAnim]);

    const animateClose = useCallback(() => {
        Animated.timing(dropdownAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.quad),
            useNativeDriver: false,
        }).start(() => {
            setOpen(false);
            setQuery("");
        });
    }, [dropdownAnim]);

    const handleToggle = useCallback(() => {
        open ? animateClose() : animateOpen();
    }, [open, animateOpen, animateClose]);

    const handleSelect = useCallback((code) => {
        setLanguage(code);
        animateClose();
    }, [setLanguage, animateClose]);

    const panelHeight = dropdownAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, PANEL_H],
    });
    const panelOpacity = dropdownAnim.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0, 1, 1],
    });

    return (
        <View style={{ position: "relative", width: 260, zIndex: 200 }}>
            {/* ── Trigger ──────────────────────────────────────── */}
            <TouchableOpacity
                onPress={handleToggle}
                disabled={isLoading}
                activeOpacity={0.8}
                style={{
                    height: 52,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingHorizontal: 14,
                    borderRadius: 14,
                    borderWidth: open ? 2 : 1.5,
                    borderColor: open ? c.brand.primary : c.border.primary,
                    backgroundColor: open ? c.brand.primaryLight : c.background.surface,
                    borderBottomLeftRadius: open ? 0 : 14,
                    borderBottomRightRadius: open ? 0 : 14,
                    opacity: isLoading ? 0.5 : 1,
                    zIndex: 201,
                }}
            >
                <Text style={{ fontSize: 20, lineHeight: 22 }}>
                    {currentLanguage?.flag ?? "🌐"}
                </Text>
                <View style={{ flex: 1 }}>
                    <Text style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: open ? c.brand.primary : c.text.primary
                    }}>
                        {currentLanguage?.labelES ?? "Idioma"}
                    </Text>
                    <Text style={{
                        fontSize: 11,
                        color: c.text.secondary,
                        marginTop: 1
                    }}>
                        {currentLanguage?.label ?? ""}
                    </Text>
                </View>
                <Animated.View style={{
                    transform: [{
                        rotate: dropdownAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "180deg"],
                        }),
                    }],
                }}>
                    <Feather
                        name="chevron-down"
                        size={16}
                        color={open ? c.brand.primary : c.text.secondary}
                    />
                </Animated.View>
            </TouchableOpacity>

            {/* ── Dropdown flotante ────────── */}
            <Animated.View
                pointerEvents={open ? "auto" : "none"}
                style={{
                    position: "absolute",
                    top: TRIGGER_H,
                    left: 0,
                    right: 0,
                    zIndex: 200,
                    height: panelHeight,
                    opacity: panelOpacity,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderTopWidth: 0,
                    borderColor: c.brand.primary,
                    borderBottomLeftRadius: 14,
                    borderBottomRightRadius: 14,
                    backgroundColor: c.background.surface,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.12,
                    shadowRadius: 8,
                    elevation: 4,
                }}
            >
                {/* Buscador */}
                <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    margin: 8,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: c.border.primary,
                    backgroundColor: c.background.app,
                }}>
                    <Feather name="search" size={13} color={c.text.secondary} />
                    <TextInput
                        ref={searchRef}
                        value={query}
                        onChangeText={setQuery}
                        placeholder={t("Buscar idioma…")}
                        placeholderTextColor={c.text.secondary}
                        style={{
                            flex: 1,
                            fontSize: 11,
                            color: c.text.primary,
                            padding: 8,
                            // @ts-ignore — válido en web
                            outlineStyle: "none",
                        }}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setQuery("")}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                            <Feather name="x" size={13} color={c.text.secondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Lista */}
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {filtered.length === 0 ? (
                        <View style={{ paddingVertical: 20, alignItems: "center" }}>
                            <Text style={{ fontSize: 11, color: c.text.secondary }}>
                                {t("Sin resultados")}
                            </Text>
                        </View>
                    ) : filtered.map((lang, i) => {
                        const active = language === lang.code;
                        const isLast = i === filtered.length - 1;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => handleSelect(lang.code)}
                                activeOpacity={0.7}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 10,
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                    backgroundColor: active ? c.brand.primaryLight : "transparent",
                                    borderBottomWidth: isLast ? 0 : 1,
                                    borderBottomColor: c.border.primary,
                                }}
                            >
                                <Text style={{
                                    fontSize: 16,
                                    width: 28,
                                    textAlign: "center"
                                }}>
                                    {lang.flag}
                                </Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: 10,
                                        fontWeight: active ? "600" : "400",
                                        color: active ? c.brand.primary : c.text.primary,
                                    }}>
                                        {lang.labelES}
                                    </Text>
                                    <Text style={{
                                        fontSize: 11,
                                        color: c.text.secondary
                                    }}>
                                        {lang.label}
                                    </Text>
                                </View>
                                {active && (
                                    <View style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: 14,
                                        backgroundColor: c.brand.primary,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <Feather name="check" size={10} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </Animated.View>
        </View>
    );
}
