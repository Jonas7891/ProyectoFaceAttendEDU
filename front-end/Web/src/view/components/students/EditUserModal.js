// ============================================================
//  FaceAttend EDU — EditUserModal
//  Edición de datos básicos de cualquier usuario (estudiante,
//  docente o administrador): nombre, documento, correo, teléfono,
//  usuario y estado. La contraseña no se edita aquí.
//  La validación vive en el ViewModel; el guardado real es
//  PUT /persons/{id} + PUT /users/{id} (+ PATCH status).
// ============================================================

import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Button, BaseModal, TextInput } from "../common";
import { useTheme } from "../hooks/useTheme";
import { useResponsive } from "../hooks/useResponsive";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";

const ROLE_TITLES = {
    student: "Editar estudiante",
    teacher: "Editar docente",
    admin: "Editar administrador",
};

export default function EditUserModal({ visible, onClose, onSubmit, user }) {
    const { theme } = useTheme();
    const { isSmall } = useResponsive();
    const { t } = useTranslation();
    const c = theme.colors;

    const [form, setForm] = useState(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    // Cargar datos al abrir (una sola vez por apertura).
    React.useEffect(() => {
        if (visible && user) {
            const parts = String(user.name ?? "").trim().split(/\s+/).filter(Boolean);
            setForm({
                name: parts[0] ?? "",
                lastName: parts.slice(1).join(" "),
                documentNumber: user.document ?? "",
                email: user.email ?? "",
                phone: user.telefono ?? user.phone ?? "",
                username: user.username ?? "",
                status: user.status ?? "active",
            });
            setError(null);
            setShowErrors(false);
            setSaving(false);
        }
    }, [visible, user]);

    if (!visible) return null;

    const setField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (showErrors) setError(null);
    };

    const handleClose = () => {
        setForm(null);
        setError(null);
        setShowErrors(false);
        setSaving(false);
        onClose();
    };

    const handleSubmit = async () => {
        setShowErrors(true);
        setError(null);
        setSaving(true);
        const err = await onSubmit(form);
        setSaving(false);
        if (err) {
            setError(err);
        } else {
            onClose();
        }
    };

    const isEmpty = (v) => showErrors && !String(v ?? "").trim();
    const title = ROLE_TITLES[user?.userType] || t("Editar usuario");

    return (
        <BaseModal
            visible={visible}
            onClose={handleClose}
            title={t(title)}
            subtitle={user?.email || ""}
            icon="edit"
            maxWidth={520}
            footer={
                <React.Fragment>
                    <Button variant="ghost" onPress={handleClose} disabled={saving}>
                        {t("Cancelar")}
                    </Button>
                    <Button variant="primary" onPress={handleSubmit} disabled={saving}>
                        {saving
                            ? <ActivityIndicator size="small" color={c.brand.textOnPrimary} />
                            : t("Guardar cambios")}
                    </Button>
                </React.Fragment>
            }
        >
            {error && (
                <View style={{
                    backgroundColor: c.status.dangerLight,
                    borderRadius: 14,
                    padding: 12,
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 14,
                }}>
                    <Text style={{ fontSize: 11, color: c.status.danger, flex: 1 }}>{error}</Text>
                </View>
            )}

            <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12 }}>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Nombre") + " *"}
                        value={form?.name ?? ""}
                        onChangeText={v => setField("name", v)}
                        error={isEmpty(form?.name)}
                        errorMessage={isEmpty(form?.name) ? t("Campo requerido") : ""}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Apellido") + " *"}
                        value={form?.lastName ?? ""}
                        onChangeText={v => setField("lastName", v)}
                        error={isEmpty(form?.lastName)}
                        errorMessage={isEmpty(form?.lastName) ? t("Campo requerido") : ""}
                    />
                </View>
            </View>

            <TextInput
                label={t("Número de documento") + " *"}
                value={form?.documentNumber ?? ""}
                onChangeText={v => setField("documentNumber", v)}
                error={isEmpty(form?.documentNumber)}
                errorMessage={isEmpty(form?.documentNumber) ? t("Campo requerido") : ""}
            />

            <TextInput
                label={t("Correo electrónico") + " *"}
                value={form?.email ?? ""}
                onChangeText={v => setField("email", v)}
                type="email"
                error={isEmpty(form?.email)}
                errorMessage={isEmpty(form?.email) ? t("Campo requerido") : ""}
            />

            <View style={{ flexDirection: isSmall ? "column" : "row", gap: isSmall ? 0 : 12 }}>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Teléfono")}
                        value={form?.phone ?? ""}
                        onChangeText={v => setField("phone", v)}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <TextInput
                        label={t("Usuario") + " *"}
                        value={form?.username ?? ""}
                        onChangeText={v => setField("username", v)}
                        error={isEmpty(form?.username)}
                        errorMessage={isEmpty(form?.username) ? t("Campo requerido") : ""}
                    />
                </View>
            </View>

            <View style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: c.text.secondary, marginBottom: 6 }}>
                    {t("Estado")}
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                    {[
                        { value: "active", label: t("Activo") },
                        { value: "inactive", label: t("Inactivo") },
                    ].map((s) => (
                        <TouchableOpacity
                            key={s.value}
                            onPress={() => setField("status", s.value)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 8,
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                borderRadius: 14,
                                borderWidth: 1.5,
                                borderColor: form?.status === s.value
                                    ? c.brand.primary
                                    : c.border.primary,
                                backgroundColor: form?.status === s.value
                                    ? c.brand.primaryLight
                                    : c.background.app,
                            }}
                        >
                            <Text style={{
                                fontSize: 13,
                                fontWeight: "600",
                                color: form?.status === s.value
                                    ? c.brand.primary
                                    : c.text.secondary,
                            }}>
                                {s.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </BaseModal>
    );
}
