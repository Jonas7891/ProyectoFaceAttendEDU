// ============================================================
//  CollapsibleSidebar - Sidebar con funcionalidad de colapso
// ============================================================
//  Sidebar independiente que puede ocultarse/mostrarse con:
//  - Click en la pestañita (tab handle)
//  - Drag/swipe para abrir/cerrar
//  - Animaciones suaves
//  - Overlay opcional en móvil
//
//  Este componente envuelve el Sidebar básico y agrega la 
//  funcionalidad de interacción avanzada.
// ============================================================

import React, { useRef, useState, useEffect } from "react";
import { View, Animated, TouchableOpacity, PanResponder } from "react-native";
import { Feather } from "@expo/vector-icons";
import Sidebar from "./Sidebar";
import { useTheme } from "../../hooks/useTheme";
import { useResponsive } from "../../hooks/useResponsive";

/**
 * CollapsibleSidebar - Sidebar con funcionalidad completa de colapso
 * 
 * @param {ReactNode} children - Contenido del sidebar
 * @param {number} width - Ancho del sidebar expandido (default: 240)
 * @param {boolean} defaultOpen - Estado inicial (default: true en desktop, false en móvil)
 * @param {function} onToggle - Callback cuando cambia el estado
 * @param {boolean} showOverlay - Mostrar overlay cuando está abierto en móvil (default: true)
 * @param {boolean} enableSwipe - Habilitar swipe para abrir/cerrar (default: true)
 * @param {object} style - Estilos adicionales
 */
export default function CollapsibleSidebar({
    children,
    width = 240,
    defaultOpen,
    onToggle,
    showOverlay = true,
    enableSwipe = true,
    style,
}) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const c = theme.colors;

    // Estado de apertura (defaultOpen depende del tamaño de pantalla si no se especifica)
    const [isOpen, setIsOpen] = useState(defaultOpen !== undefined ? defaultOpen : !isSmall);
    
    // Ref para el estado actual (para usar en PanResponders)
    const isOpenRef = useRef(isOpen);
    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);
    
    // Animated values
    const translateX = useRef(new Animated.Value(isOpen ? 0 : -width)).current;
    const animatedWidth = useRef(new Animated.Value(isOpen ? width : 0)).current;
    const overlayOpacity = useRef(new Animated.Value(isOpen && isSmall ? 0.5 : 0)).current;

    // Toggle función
    const toggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (onToggle) onToggle(newState);
    };

    // Animar cambios
    useEffect(() => {
        if (isSmall) {
            // En móvil: translateX con overlay
            Animated.parallel([
                Animated.spring(translateX, {
                    toValue: isOpen ? 0 : -width,
                    useNativeDriver: true,
                    friction: 9,
                    tension: 60,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: isOpen && showOverlay ? 0.5 : 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // En desktop: translateX + animatedWidth en paralelo
            Animated.parallel([
                Animated.spring(translateX, {
                    toValue: isOpen ? 0 : -width,
                    useNativeDriver: true,
                    friction: 9,
                    tension: 60,
                }),
                Animated.spring(animatedWidth, {
                    toValue: isOpen ? width : 0,
                    useNativeDriver: false,
                    friction: 9,
                    tension: 60,
                }),
            ]).start();
        }
    }, [isOpen, width, isSmall, showOverlay]);

    // PanResponder para drag/swipe (móvil: sidebar completo)
    const sidebarPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => enableSwipe && isSmall,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return enableSwipe && isSmall && Math.abs(gestureState.dx) > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                if (!isOpen && gestureState.dx > 0) {
                    const newValue = Math.min(0, -width + gestureState.dx);
                    translateX.setValue(newValue);
                } else if (isOpen && gestureState.dx < 0) {
                    const newValue = Math.max(-width, gestureState.dx);
                    translateX.setValue(newValue);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const threshold = width * 0.3;
                
                if (!isOpen && (gestureState.dx > threshold || gestureState.vx > 0.5)) {
                    setIsOpen(true);
                    if (onToggle) onToggle(true);
                } else if (isOpen && (gestureState.dx < -threshold || gestureState.vx < -0.5)) {
                    setIsOpen(false);
                    if (onToggle) onToggle(false);
                } else {
                    Animated.spring(translateX, {
                        toValue: isOpen ? 0 : -width,
                        useNativeDriver: true,
                        friction: 9,
                    }).start();
                }
            },
        })
    ).current;

    // PanResponder para la pestañita (desktop: arrastrar pestañita)
    const tabPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => enableSwipe && !isSmall,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return enableSwipe && !isSmall && Math.abs(gestureState.dx) > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                const currentIsOpen = isOpenRef.current;
                
                if (!currentIsOpen && gestureState.dx > 0) {
                    // Cerrado: arrastrar hacia la derecha para abrir
                    const newValue = Math.min(0, -width + gestureState.dx);
                    translateX.setValue(newValue);
                    
                    // Actualizar width proporcionalmente
                    const widthValue = width + newValue;
                    animatedWidth.setValue(Math.max(0, widthValue));
                } else if (currentIsOpen && gestureState.dx < 0) {
                    // Abierto: arrastrar hacia la izquierda para cerrar
                    const newValue = Math.max(-width, gestureState.dx);
                    translateX.setValue(newValue);
                    
                    // Actualizar width proporcionalmente
                    const widthValue = width + newValue;
                    animatedWidth.setValue(Math.max(0, widthValue));
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const threshold = width * 0.3;
                const currentIsOpen = isOpenRef.current;
                
                if (!currentIsOpen && (gestureState.dx > threshold || gestureState.vx > 0.5)) {
                    setIsOpen(true);
                    if (onToggle) onToggle(true);
                } else if (currentIsOpen && (gestureState.dx < -threshold || gestureState.vx < -0.5)) {
                    setIsOpen(false);
                    if (onToggle) onToggle(false);
                } else {
                    Animated.parallel([
                        Animated.spring(translateX, {
                            toValue: currentIsOpen ? 0 : -width,
                            useNativeDriver: true,
                            friction: 9,
                        }),
                        Animated.spring(animatedWidth, {
                            toValue: currentIsOpen ? width : 0,
                            useNativeDriver: false,
                            friction: 9,
                        }),
                    ]).start();
                }
            },
        })
    ).current;

    return (
        <Animated.View style={[
            { 
                position: "relative", 
                zIndex: 1,
                width: isSmall ? width : animatedWidth,
            },
        ]}>
            {/* Overlay (solo en móvil cuando está abierto) */}
            {isSmall && showOverlay && (
                <Animated.View
                    pointerEvents={isOpen ? "auto" : "none"}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "#000",
                        opacity: overlayOpacity,
                        zIndex: 999,
                    }}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={toggle}
                        style={{ flex: 1 }}
                    />
                </Animated.View>
            )}

            {/* Sidebar Container con pestañita integrada */}
            <Animated.View
                style={[
                    {
                        width: width,
                        height: "100%",
                        position: isSmall ? "absolute" : "relative",
                        left: isSmall ? 0 : undefined,
                        top: isSmall ? 0 : undefined,
                        bottom: isSmall ? 0 : undefined,
                        transform: [{ translateX }],
                        zIndex: isSmall ? 999 : 1,
                        elevation: isSmall ? 10 : 0,
                    },
                    style,
                ]}
                {...(enableSwipe && isSmall ? sidebarPanResponder.panHandlers : {})}
            >
                <Sidebar width={width}>
                    {children}
                </Sidebar>

                {/* Pestañita (Tab Handle) - Integrada en el sidebar */}
                {!isSmall && (
                    <View
                        style={{
                            position: "absolute",
                            right: -36,
                            top: 0,
                            bottom: 0,
                            width: 36,
                            zIndex: 999,
                        }}
                    >
                        <View
                            {...(enableSwipe ? tabPanResponder.panHandlers : {})}
                            style={{
                                position: "absolute",
                                left: 0,
                                top: "50%",
                                marginTop: -98,
                                width: 30,
                                height: 52,
                                backgroundColor: c.background.surface,
                                borderTopRightRadius: 12,
                                borderBottomRightRadius: 12,
                                borderWidth: 1,
                                borderLeftWidth: 0,
                                borderColor: c.border.primary,
                                justifyContent: "center",
                                alignItems: "center",
                                shadowColor: "#000",
                                shadowOffset: { width: 2, height: 0 },
                                shadowOpacity: 0.15,
                                shadowRadius: 6,
                                elevation: 10,
                            }}
                        >
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={toggle}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {/* Icono de la pestañita */}
                                <View style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 6,
                                }}>
                                    {/* Indicador visual (3 líneas horizontales) */}
                                    <View style={{ gap: 2.5 }}>
                                        <View style={{
                                            width: 14,
                                            height: 2,
                                            backgroundColor: c.text.tertiary,
                                            borderRadius: 1,
                                        }} />
                                        <View style={{
                                            width: 14,
                                            height: 2,
                                            backgroundColor: c.text.tertiary,
                                            borderRadius: 1,
                                        }} />
                                        <View style={{
                                            width: 14,
                                            height: 2,
                                            backgroundColor: c.text.tertiary,
                                            borderRadius: 1,
                                        }} />
                                    </View>
                                    
                                    {/* Flecha indicadora */}
                                    <Feather
                                        name={isOpen ? "chevron-left" : "chevron-right"}
                                        size={18}
                                        color={c.text.secondary}
                                        style={{ transform: [{ translateY: -8 }] }}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </Animated.View>
        </Animated.View>
    );
}
