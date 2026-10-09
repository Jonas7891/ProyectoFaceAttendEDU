// ============================================================
//  FaceAttend EDU — Contacts VIEW (Presentation Layer)
//
//  RESPONSABILIDAD: Contacto de la sede y directorio de
//  instructores (nav-map /contacts · solo lectura).
//
//  Toda la lógica de negocio está en useContactsViewModel.
// ============================================================

import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Alert, Avatar, Card, EmptyState, PageHeader } from "./components/common";
import { useTheme } from "./components/hooks/useTheme";
import { useResponsive } from "./components/hooks/useResponsive";
import { useTranslation } from "../core/utils/i18n/hooks/useTranslation";
import { useContactsViewModel } from "../viewmodels/useContactsViewModel";

function ContactLine({ icon, value }) {
    const { theme } = useTheme();
    const c = theme.colors;
    if (!value) return null;
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Feather name={icon} size={14} color={c.text.secondary} />
            <Text style={{ color: c.text.primary, fontSize: 14 }}>{value}</Text>
        </View>
    );
}

export default function ContactsView() {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const { t } = useTranslation();
    const vm = useContactsViewModel();

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: c.background.app }}>
            <PageHeader
                title={t("Contactos")}
                subtitle={t("Canales de contacto de tu sede y de tus instructores")}
            />

            <ScrollView
                contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {vm.error && <Alert type="error" title={t("No se pudo cargar")} message={vm.error} closable />}

                {/* Sede */}
                {vm.school && (
                    <View style={{ gap: 12 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Feather name="home" size={16} color={c.brand.primary} />
                            <Text style={{ fontSize: 16, fontWeight: "800", color: c.text.primary }}>
                                {vm.school.name}
                            </Text>
                        </View>
                        <Card variant="outlined">
                            <View style={{ gap: 8 }}>
                                <ContactLine icon="map-pin" value={vm.school.address} />
                                <ContactLine icon="phone" value={vm.school.phone} />
                                <ContactLine icon="mail" value={vm.school.email} />
                                {!vm.school.address && !vm.school.phone && !vm.school.email ? (
                                    <Text style={{ color: c.text.secondary, fontSize: 13 }}>
                                        {t("La sede no tiene datos de contacto registrados")}
                                    </Text>
                                ) : null}
                            </View>
                        </Card>
                    </View>
                )}

                {/* Instructores */}
                <View style={{ gap: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Feather name="users" size={16} color={c.brand.primary} />
                        <Text style={{ fontSize: 16, fontWeight: "800", color: c.text.primary }}>
                            {t("Instructores")}
                        </Text>
                        <Text style={{ fontSize: 13, color: c.text.secondary }}>({vm.instructors.length})</Text>
                    </View>

                    {vm.instructors.length === 0 ? (
                        <EmptyState
                            icon="users"
                            title={t("Sin instructores asignados")}
                            message={t("Aún no hay instructores vinculados a tu alcance")}
                        />
                    ) : (
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                            {vm.instructors.map((person) => (
                                <Card
                                    key={person.id}
                                    variant="outlined"
                                    style={{ flexBasis: 280, flexGrow: 1 }}
                                >
                                    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                                        <Avatar name={person.name} size={40} />
                                        <View style={{ flex: 1, gap: 4 }}>
                                            <Text
                                                style={{ fontWeight: "700", color: c.text.primary }}
                                                numberOfLines={1}
                                            >
                                                {person.name}
                                            </Text>
                                            {person.courses ? (
                                                <Text style={{ color: c.text.secondary, fontSize: 12 }} numberOfLines={1}>
                                                    {person.courses}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>
                                    <View style={{ gap: 6, marginTop: 10 }}>
                                        <ContactLine icon="mail" value={person.email} />
                                        <ContactLine icon="phone" value={person.phone} />
                                        {!person.email && !person.phone ? (
                                            <Text style={{ color: c.text.secondary, fontSize: 12 }}>
                                                {t("Sin datos de contacto")}
                                            </Text>
                                        ) : null}
                                    </View>
                                </Card>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
