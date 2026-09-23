// ============================================================
//  InstructorAutocomplete — Autocompletado para instructores
// ============================================================

import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput as RNTextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Badge } from "../common";
import { useTheme } from "../hooks/useTheme";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";

/**
 * Campo de autocompletado para buscar y seleccionar instructores
 * 
 * @param {string} query - Texto de búsqueda actual
 * @param {function} onChangeQuery - Callback al cambiar el texto
 * @param {function} onSelect - Callback al seleccionar un instructor
 * @param {function} searchFn - Función de búsqueda que retorna resultados
 * @param {boolean} error - Si hay error de validación
 */
export function InstructorAutocomplete({ query, onChangeQuery, onSelect, searchFn, error }) {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const c = theme.colors;
    const [open, setOpen] = useState(false);
    const results = searchFn(query);

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{
                fontSize: 13,
                fontWeight: "600",
                color: error ? c.status.danger : c.text.secondary,
                marginBottom: 8,
            }}>
                {t("Instructor / Docente encargado")} *
            </Text>
            
            <View style={{ position: "relative" }}>
                <View style={{ position: "absolute", left: 14, top: 14, zIndex: 1 }}>
                    <Feather name="search" size={16} color={c.text.secondary} />
                </View>
                
                <RNTextInput
                    value={query}
                    onChangeText={(v) => {
                        onChangeQuery(v);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    placeholder={t("Buscar instructor por nombre...")}
                    placeholderTextColor={c.text.disabled}
                    style={{
                        height: 48,
                        borderWidth: 1,
                        borderColor: error ? c.status.danger : c.border.primary,
                        borderRadius: 12,
                        paddingLeft: 44,
                        paddingRight: 14,
                        fontSize: 14,
                        backgroundColor: c.background.app,
                        color: c.text.primary,
                    }}
                />
            </View>
            
            {open && results.length > 0 && (
                <View style={{
                    borderWidth: 1,
                    borderColor: c.border.primary,
                    borderRadius: 12,
                    backgroundColor: c.background.elevated,
                    marginTop: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    elevation: 6,
                    zIndex: 100,
                }}>
                    {results.map((u, i) => (
                        <TouchableOpacity
                            key={u.id}
                            onPress={() => {
                                onSelect(u);
                                setOpen(false);
                            }}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                                padding: 14,
                                borderBottomWidth: i < results.length - 1 ? 1 : 0,
                                borderBottomColor: c.border.primary,
                            }}
                        >
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: c.brand.primaryLight,
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <Feather name="user" size={18} color={c.brand.primary} />
                            </View>
                            
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: "600",
                                    color: c.text.primary,
                                    marginBottom: 2,
                                }}>
                                    {u.name}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    color: c.text.secondary,
                                }}>
                                    {u.department ?? u.email}
                                </Text>
                            </View>
                            
                            <Badge variant={u.role === "admin" ? "warning" : "primary"}>
                                {u.role === "admin" ? t("Admin") : t("Docente")}
                            </Badge>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

export default InstructorAutocomplete;
