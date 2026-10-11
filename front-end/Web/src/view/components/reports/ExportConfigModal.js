// ============================================================
//  FaceAttend EDU — Export Config Modal
//
//  Modal para configurar opciones de exportación (Excel/PDF)
// ============================================================

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal as RNModal } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button } from "../common";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";

export function ExportConfigModal({ visible, onClose, onExport, selectedCount }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;

    const [exportExcel, setExportExcel] = useState(true);
    const [exportPDF, setExportPDF] = useState(false);

    const handleExport = () => {
        if (!exportExcel && !exportPDF) {
            return; // No hacer nada si no hay formato seleccionado
        }

        // Exportar según selección
        if (exportExcel) {
            onExport("excel");
        }
        if (exportPDF) {
            onExport("pdf");
        }
    };

    const canExport = exportExcel || exportPDF;

    return (
        <RNModal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: c.background.surface,
                        borderRadius: 16,
                        width: "100%",
                        maxWidth: 480,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.25,
                        shadowRadius: 24,
                        elevation: 8,
                    }}
                >
                    {/* Header */}
                    <View style={{
                        padding: 24,
                        borderBottomWidth: 1,
                        borderBottomColor: c.border.primary,
                    }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 20,
                                    fontWeight: "700",
                                    color: c.text.primary,
                                    marginBottom: 4,
                                }}>
                                    {t("Configurar exportación")}
                                </Text>
                                <Text style={{
                                    fontSize: 14,
                                    color: c.text.secondary,
                                }}>
                                    {selectedCount} {selectedCount === 1 ? t("registro seleccionado") : t("registros seleccionados")}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: c.background.secondary,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Feather name="x" size={18} color={c.text.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Body */}
                    <View style={{ padding: 24, gap: 20 }}>
                        <View>
                            <Text style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: c.text.primary,
                                marginBottom: 12,
                            }}>
                                {t("Selecciona el formato de exportación")}
                            </Text>

                            {/* Opción Excel */}
                            <TouchableOpacity
                                onPress={() => setExportExcel(!exportExcel)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: 16,
                                    gap: 12,
                                    borderRadius: 8,
                                    borderWidth: 2,
                                    borderColor: exportExcel ? c.status.success : c.border.primary,
                                    backgroundColor: exportExcel ? c.status.success + "10" : "transparent",
                                    marginBottom: 12,
                                }}
                            >
                                {/* Checkbox */}
                                <View style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 6,
                                    borderWidth: 2,
                                    borderColor: exportExcel ? c.status.success : c.border.primary,
                                    backgroundColor: exportExcel ? c.status.success : "transparent",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    {exportExcel && <Feather name="check" size={16} color="#fff" />}
                                </View>

                                {/* Icono y texto */}
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    backgroundColor: c.status.success + "20",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <Feather name="file-text" size={20} color={c.status.success} />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: 15,
                                        fontWeight: "600",
                                        color: c.text.primary,
                                        marginBottom: 2,
                                    }}>
                                        {t("Exportar a Excel")}
                                    </Text>
                                    <Text style={{
                                        fontSize: 13,
                                        color: c.text.secondary,
                                    }}>
                                        {t("Archivo .xlsx con datos tabulados")}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Opción PDF */}
                            <TouchableOpacity
                                onPress={() => setExportPDF(!exportPDF)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    padding: 16,
                                    gap: 12,
                                    borderRadius: 8,
                                    borderWidth: 2,
                                    borderColor: exportPDF ? c.status.danger : c.border.primary,
                                    backgroundColor: exportPDF ? c.status.danger + "10" : "transparent",
                                }}
                            >
                                {/* Checkbox */}
                                <View style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 6,
                                    borderWidth: 2,
                                    borderColor: exportPDF ? c.status.danger : c.border.primary,
                                    backgroundColor: exportPDF ? c.status.danger : "transparent",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    {exportPDF && <Feather name="check" size={16} color="#fff" />}
                                </View>

                                {/* Icono y texto */}
                                <View style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    backgroundColor: c.status.danger + "20",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>
                                    <Feather name="file" size={20} color={c.status.danger} />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: 15,
                                        fontWeight: "600",
                                        color: c.text.primary,
                                        marginBottom: 2,
                                    }}>
                                        {t("Exportar a PDF")}
                                    </Text>
                                    <Text style={{
                                        fontSize: 13,
                                        color: c.text.secondary,
                                    }}>
                                        {t("Documento con formato de impresión")}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Info adicional */}
                        <View style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            gap: 8,
                            padding: 12,
                            borderRadius: 8,
                            backgroundColor: c.background.secondary,
                        }}>
                            <Feather name="info" size={16} color={c.primary} style={{ marginTop: 2 }} />
                            <Text style={{
                                flex: 1,
                                fontSize: 12,
                                color: c.text.secondary,
                                lineHeight: 18,
                            }}>
                                {t("Puedes seleccionar ambos formatos para exportar simultáneamente")}
                            </Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={{
                        padding: 24,
                        paddingTop: 16,
                        borderTopWidth: 1,
                        borderTopColor: c.border.primary,
                        flexDirection: "row",
                        gap: 12,
                    }}>
                        <Button
                            variant="ghost"
                            onPress={onClose}
                            style={{ flex: 1 }}
                        >
                            {t("Cancelar")}
                        </Button>
                        <Button
                            variant="primary"
                            onPress={handleExport}
                            disabled={!canExport}
                            style={{ flex: 1 }}
                            leftIcon={<Feather name="download" size={16} color="#fff" />}
                        >
                            {t("Exportar")}
                        </Button>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </RNModal>
    );
}
