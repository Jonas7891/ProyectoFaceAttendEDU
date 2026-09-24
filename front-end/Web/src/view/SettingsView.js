// ============================================================
//  FaceAttend EDU — SettingsView
//
//  Orquestador de configuración.
//  Delega a componentes específicos según el rol del usuario:
//  - AdminSettings: configuración completa (admin)
//  - TeacherSettings: configuración parcial (teacher)
//  - StudentSettings: configuración mínima (student)
//
//  NOTA: La validación de autorización se hace GLOBALMENTE en
//  AuthenticatedNavigator. Este componente solo se renderiza
//  si el usuario YA está autorizado.
// ============================================================

import React, { useState, useRef } from "react";
import { View, Text, ScrollView } from "react-native";
import { Button, PageHeader } from "./components/common";
import { useTheme } from "./components/hooks/useTheme";
import { generateTheme } from "../core/theme/generateTheme";
import { useResponsive } from "./components/hooks/useResponsive";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useRolePermissions } from "../viewmodels/useRolePermissions";
import { useAutomaticPeriodAdvance } from "./components/hooks/useAutomaticPeriodAdvance";
import { AdminSettings, TeacherSettings, StudentSettings } from "./authorized/settings";

export default function SettingsView({ section = "appearance" }) {
    const { isSmall } = useResponsive();
    const { theme, mode, accentColor, setAccentColor } = useTheme();
    const { t } = useTranslation();
    const permissions = useRolePermissions();
    const c = theme.colors;

    // Activar verificación automática de períodos expirados
    useAutomaticPeriodAdvance(true, 60); // Verificar cada 60 minutos

    const [previewAccent, setPreviewAccent] = useState(accentColor);
    const [hasUnsavedAccent, setHasUnsavedAccent] = useState(false);
    const [hasConfigChanges, setHasConfigChanges] = useState(false);
    const [hasColorChanges, setHasColorChanges] = useState(false);
    const [saved, setSaved] = useState(false);
    
    // Ref para almacenar la función de guardado del componente hijo
    const saveConfigRef = useRef(null);
    const discardConfigRef = useRef(null);
    const discardColorsRef = useRef(null);
    const saveSuccessColorsRef = useRef(null);

    const previewTheme = generateTheme(previewAccent, mode);

    function handlePreviewChange(hex) {
        setPreviewAccent(hex);
        setHasUnsavedAccent(hex.toLowerCase() !== accentColor.toLowerCase());
    }

    function handleConfigChanges(hasChanges) {
        setHasConfigChanges(hasChanges);
    }

    function handleColorsChange(hasChanges) {
        setHasColorChanges(hasChanges);
    }

    // Combinar todos los tipos de cambios
    const anyUnsavedChanges = hasUnsavedAccent || hasConfigChanges || hasColorChanges;

    function handleSave() {
        // Ejecutar la función de guardado del componente hijo
        if (saveConfigRef.current) {
            const success = saveConfigRef.current();
            
            if (success) {
                // Actualizar color de acento si cambió
                if (hasUnsavedAccent) {
                    setAccentColor(previewAccent);
                    setHasUnsavedAccent(false);
                }
                
                // Notificar a AccentColorSelector que actualice su initialColors
                if (saveSuccessColorsRef.current) {
                    saveSuccessColorsRef.current();
                }
                
                // Los componentes hijos actualizarán sus initialConfig/initialColors
                // Damos un momento para que React procese y recalcule hasChanges
                setTimeout(() => {
                    setHasConfigChanges(false);
                    setHasColorChanges(false);
                }, 0);
                
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }
        } else {
            // Si no hay función de guardado (solo cambios de UI)
            if (hasUnsavedAccent) {
                setAccentColor(previewAccent);
                setHasUnsavedAccent(false);
            }
            
            // Notificar a AccentColorSelector que actualice su initialColors
            if (saveSuccessColorsRef.current) {
                saveSuccessColorsRef.current();
            }
            
            setTimeout(() => {
                setHasConfigChanges(false);
                setHasColorChanges(false);
            }, 0);
            
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }
    }

    function handleDiscard() {
        // Revertir color de acento
        setPreviewAccent(accentColor);
        setHasUnsavedAccent(false);
        
        // Llamar función de descarte de configuración
        if (discardConfigRef.current) {
            discardConfigRef.current();
        }
        
        // Llamar función de descarte de colores
        if (discardColorsRef.current) {
            discardColorsRef.current();
        }
        
        // Resetear flags
        setHasConfigChanges(false);
        setHasColorChanges(false);
    }

    // Usuario AUTORIZADO confirmado por SettingsScreen
    // Props compartidas para componentes autorizados
    const sharedProps = {
        section,
        onSave: (saveFn) => {
            saveConfigRef.current = saveFn;
        },
        onDiscard: (discardFn) => {
            discardConfigRef.current = discardFn;
        },
        onDiscardColors: (discardFn) => {
            discardColorsRef.current = discardFn;
        },
        onSaveSuccessColors: (commitFn) => {
            saveSuccessColorsRef.current = commitFn;
        },
        previewAccent,
        onPreviewChange: handlePreviewChange,
        onHasChanges: handleConfigChanges, // Cambios en configuración general
        onColorChanges: handleColorsChange, // Cambios en paleta de colores
        previewTheme,
    };

    // Determinar qué componente de settings renderizar según rol
    let SettingsComponent;
    if (permissions.isAdmin) {
        SettingsComponent = <AdminSettings {...sharedProps} />;
    } else if (permissions.isTeacher) {
        SettingsComponent = <TeacherSettings {...sharedProps} />;
    } else {
        SettingsComponent = <StudentSettings {...sharedProps} />;
    }

    // Renderizar UI completa para usuarios autorizados
    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <PageHeader
                title={t("Configuración")}
                subtitle={t("Personaliza FaceAttend EDU a tu institución")}
                actions={
                    <>
                        {anyUnsavedChanges && (
                            <>
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    backgroundColor: c.status.warningLight,
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                    borderRadius: 12,
                                }}>
                                    <View style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: c.status.warning
                                    }} />
                                    <Text style={{
                                        fontSize: 13,
                                        color: c.status.warning,
                                        fontWeight: "600"
                                    }}>
                                        {t("Sin guardar")}
                                    </Text>
                                </View>
                                <Button variant="ghost" size="sm" onPress={handleDiscard}>
                                    {t("Descartar")}
                                </Button>
                                <Button variant="primary" onPress={handleSave} size="sm">
                                    {saved ? t("¡Guardado!") : t("Guardar cambios")}
                                </Button>
                            </>
                        )}
                    </>
                }
            />
            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
                showsVerticalScrollIndicator={false}
            >
                {SettingsComponent}
            </ScrollView>
        </View>
    );
}
