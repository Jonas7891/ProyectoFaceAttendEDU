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
import { useTranslation } from "../i18n/hooks/useTranslation";
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
    const [hasUnsaved, setHasUnsaved] = useState(false);
    const [saved, setSaved] = useState(false);
    
    // Ref para almacenar la función de guardado del componente hijo
    const saveConfigRef = useRef(null);

    const previewTheme = generateTheme(previewAccent, mode);

    function handlePreviewChange(hex) {
        setPreviewAccent(hex);
        setHasUnsaved(hex.toLowerCase() !== accentColor.toLowerCase());
    }

    function handleSave() {
        // Ejecutar la función de guardado del componente hijo
        if (saveConfigRef.current) {
            const success = saveConfigRef.current();
            
            if (success) {
                // Actualizar color de acento si cambió
                if (hasUnsaved) {
                    setAccentColor(previewAccent);
                    setHasUnsaved(false);
                }
                
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
            }
        } else {
            // Si no hay función de guardado (solo cambio de color)
            if (hasUnsaved) {
                setAccentColor(previewAccent);
                setHasUnsaved(false);
            }
            
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }
    }

    function handleDiscard() {
        setPreviewAccent(accentColor);
        setHasUnsaved(false);
    }

    // Usuario AUTORIZADO confirmado por SettingsScreen
    // Props compartidas para componentes autorizados
    const sharedProps = {
        section,
        onSave: (saveFn) => {
            saveConfigRef.current = saveFn;
        },
        previewAccent,
        onPreviewChange: handlePreviewChange,
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
                        {hasUnsaved && (
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
                            </>
                        )}
                        <Button variant="primary" onPress={handleSave} size="sm">
                            {saved ? t("¡Guardado!") : t("Guardar cambios")}
                        </Button>
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
