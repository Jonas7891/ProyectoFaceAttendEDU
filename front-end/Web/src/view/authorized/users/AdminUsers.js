// ============================================================
//  FaceAttend EDU — AdminUsers
//
//  Tabla dirigida por configuración:
//    1. Las columnas se definen UNA sola vez (COLUMNS).
//    2. Header y filas se dibujan desde esa misma definición,
//       por eso siempre quedan alineados.
//    3. Cada columna decide cuándo se muestra (`visible`),
//       así la tabla se adapta a filtros y permisos.
//
//  Para agregar una columna: añade un objeto a COLUMNS. Nada más.
// ============================================================

import React, { useMemo } from "react";
import {
    View, Text, ScrollView, TextInput,
    TouchableOpacity, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
    Card, Badge, Avatar, ProgressBar, EmptyState,
    AnimatedDropdown, useAttendanceColor,
} from "../../components/common";
import { useTheme } from "../../components/hooks/useTheme";
import { useResponsive } from "../../components/hooks/useResponsive";
import { useUsersViewModel } from "../../../viewmodels/useUsersViewModel";
import { useRolePermissions } from "../../../viewmodels/useRolePermissions";
import { useTranslation } from "../../../core/utils/i18n/hooks/useTranslation";
import RegisterStudentModal from "../../components/students/RegisterStudentModal";
import ImportStudentsModal from "../../components/students/ImportStudentsModal";
import StudentDetailModal from "../../components/students/StudentDetailModal";

// ── Constantes de layout (única fuente de espaciado) ──────

const LAYOUT = {
    rowPaddingX: 16,   // padding horizontal de header y filas
    rowPaddingY: 12,   // padding vertical de filas
    headerPaddingY: 10,
    cellPaddingX: 14,  // padding interno de cada celda
    avatarSize: 36,
    avatarGap: 10,
};

const ROLE_VARIANT = {
    student: "default",
    teacher: "info",
    admin: "primary",
};

// ── Definición de columnas ────────────────────────────────
//
//  id            clave única
//  label         clave de traducción del header
//  flex          ancho relativo de la columna
//  align         alineación de los ITEMS: "left" | "center" | "right"
//                (si hay contentWidth, es la alineación DENTRO del bloque)
//  headerAlign   alineación del TÍTULO (opcional, por defecto "center")
//  contentWidth  ancho máximo del bloque de contenido (opcional).
//                El bloque se centra en la columna, así el header
//                centrado queda sobre el mismo eje que el contenido.
//                Ajústalo al ancho REAL del texto más largo: si es
//                mucho mayor, el header se ve corrido respecto al texto.
//  offsetX       ajuste fino en px del contenido de las filas (opcional).
//                Negativo = izquierda, positivo = derecha.
//  headerOffsetX ajuste fino en px del TÍTULO del header (opcional).
//                Negativo = izquierda, positivo = derecha.
//  visible       ({ roleFilter, canManage }) => boolean  (opcional)
//  render        (user, ctx) => ReactNode
//                ctx = { t, c, attColor, roleVariant }

const COLUMNS = [
    {
        id: "role",
        label: "Rol",
        flex: 0.9,
        align: "center",
        // Si ya filtras por rol desde el sidebar, esta columna es redundante
        visible: ({ roleFilter }) => !roleFilter,
        render: (user, { t, roleVariant }) => (
            <Badge variant={roleVariant}>{t(user.typeLabelKey || "Usuario")}</Badge>
        ),
    },
    {
        id: "name",
        label: "Nombre",
        flex: 2,
        align: "left",
        contentWidth: 240,
        offsetX: 0,
        render: (user, { c }) => (
            <View
                style={{
                    flexShrink: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: LAYOUT.avatarGap,
                }}
            >
                <Avatar name={user.name} size={LAYOUT.avatarSize} />
                <View style={{ flexShrink: 1 }}>
                    <Text
                        numberOfLines={1}
                        style={{ fontWeight: "600", fontSize: 14, color: c.text.primary }}
                    >
                        {user.name}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 12, color: c.text.secondary }}>
                        {user.code}
                    </Text>
                </View>
            </View>
        ),
    },
    {
        id: "email",
        label: "Correo",
        flex: 1.7,
        align: "left",
        contentWidth: 135,
        headerOffsetX: -8,   // título 3px a la izquierda
        render: (user, { c }) => (
            <Text
                numberOfLines={1}
                style={{ flexShrink: 1, fontSize: 13, color: c.text.secondary }}
            >
                {user.email || "—"}
            </Text>
        ),
    },
    {
        id: "program",
        label: "Programa",
        flex: 1.6,
        align: "left",
        contentWidth: 150,
        headerOffsetX: -10,   // título 2px a la izquierda
        render: (user, { c }) => (
            <Text
                numberOfLines={1}
                style={{ flexShrink: 1, fontSize: 13, color: c.text.primary }}
            >
                {user.course || "—"}
            </Text>
        ),
    },
    {
        id: "attendance",
        label: "Asistencia",
        flex: 1.1,
        align: "center",
        render: (user, { attColor }) => (
            <View style={{ width: "100%", maxWidth: 110, alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: attColor }}>
                    {user.attendance || 0}%
                </Text>
                <ProgressBar value={user.attendance || 0} color={attColor} height={5} />
            </View>
        ),
    },
    {
        id: "face",
        label: "Facial",
        flex: 1,
        align: "center",
        visible: ({ canManage }) => canManage,
        render: (user, { t }) => (
            <Badge variant={user.registered ? "success" : "warning"}>
                {user.registered ? t("Registrado") : t("Pendiente")}
            </Badge>
        ),
    },
    {
        id: "status",
        label: "Estado",
        flex: 0.9,
        align: "center",
        render: (user, { t }) => (
            <Badge variant={user.status === "active" ? "success" : "default"}>
                {user.status === "active" ? t("Activo") : t("Inactivo")}
            </Badge>
        ),
    },
];

const DEFAULT_HEADER_ALIGN = "center";

const ALIGN_TO_JUSTIFY = { left: "flex-start", center: "center", right: "flex-end" };

// ── Celdas base (compartidas por header y filas) ──────────
//
//  La celda es una FILA y alinea con `justifyContent`.
//  Así no importa si el hijo (ej. Badge) trae su propio `alignSelf`:
//  en una fila, `alignSelf` afecta el eje vertical, no el horizontal.

function Cell({ col, align, children }) {
    return (
        <View
            style={{
                flex: col.flex,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: ALIGN_TO_JUSTIFY[align],
                paddingHorizontal: LAYOUT.cellPaddingX,
            }}
        >
            {children}
        </View>
    );
}

// Celda de fila: si la columna define `contentWidth`, el contenido va en un
// bloque de ese ancho centrado en la celda, con `col.align` dentro del bloque.
function BodyCell({ col, children }) {
    const offsetStyle = col.offsetX
        ? { transform: [{ translateX: col.offsetX }] }
        : null;

    if (!col.contentWidth) {
        return (
            <Cell col={col} align={col.align}>
                {offsetStyle ? <View style={offsetStyle}>{children}</View> : children}
            </Cell>
        );
    }

    return (
        <Cell col={col} align="center">
            <View
                style={[
                    {
                        width: "100%",
                        maxWidth: col.contentWidth,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: ALIGN_TO_JUSTIFY[col.align],
                    },
                    offsetStyle,
                ]}
            >
                {children}
            </View>
        </Cell>
    );
}

function HeaderCell({ col, label }) {
    const { theme } = useTheme();
    const headerAlign = col.headerAlign || DEFAULT_HEADER_ALIGN;

    return (
        <Cell col={col} align={headerAlign}>
            <Text
                numberOfLines={1}
                style={{
                    flexShrink: 1,
                    fontSize: 11,
                    fontWeight: "600",
                    color: theme.colors.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    textAlign: headerAlign,
                    transform: [{ translateX: col.headerOffsetX || 0 }],
                }}
            >
                {label}
            </Text>
        </Cell>
    );
}

// ── Header ────────────────────────────────────────────────

function TableHeader({ columns }) {
    const { t } = useTranslation();
    const { theme } = useTheme();

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: LAYOUT.headerPaddingY,
                paddingHorizontal: LAYOUT.rowPaddingX,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border.primary,
            }}
        >
            {columns.map((col) => (
                <HeaderCell key={col.id} col={col} label={t(col.label)} />
            ))}
        </View>
    );
}

// ── Fila (escritorio / tablet) ────────────────────────────

function UserRow({ user, columns, onPress, isLast }) {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const c = theme.colors;
    const attColor = useAttendanceColor(user.attendance || 0);
    const roleVariant = ROLE_VARIANT[user.userType] || "default";
    const ctx = { t, c, attColor, roleVariant };

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: LAYOUT.rowPaddingY,
                paddingHorizontal: LAYOUT.rowPaddingX,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: c.border.primary,
            }}
        >
            {columns.map((col) => (
                <BodyCell key={col.id} col={col}>
                    {col.render(user, ctx)}
                </BodyCell>
            ))}
        </TouchableOpacity>
    );
}

// ── Fila compacta (móvil) ─────────────────────────────────

function UserCompactRow({ user, onPress, isLast, showRole, canManage }) {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const c = theme.colors;
    const attColor = useAttendanceColor(user.attendance || 0);
    const roleVariant = ROLE_VARIANT[user.userType] || "default";

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: LAYOUT.rowPaddingY,
                paddingHorizontal: LAYOUT.rowPaddingX,
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: c.border.primary,
            }}
        >
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: LAYOUT.avatarGap }}>
                <Avatar name={user.name} size={LAYOUT.avatarSize} />
                <View style={{ flexShrink: 1 }}>
                    <Text numberOfLines={1} style={{ fontWeight: "600", fontSize: 14, color: c.text.primary }}>
                        {user.name}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 12, color: c.text.secondary }}>
                        {user.code}
                    </Text>
                </View>
            </View>

            <View style={{ alignItems: "flex-end", gap: 4 }}>
                {showRole && (
                    <Badge variant={roleVariant}>{t(user.typeLabelKey || "Usuario")}</Badge>
                )}
                <Text style={{ fontSize: 12, fontWeight: "700", color: attColor }}>
                    {user.attendance || 0}%
                </Text>
                {canManage && (
                    <Badge variant={user.registered ? "success" : "warning"}>
                        {user.registered ? t("Facial OK") : t("Pendiente")}
                    </Badge>
                )}
            </View>
        </TouchableOpacity>
    );
}

// ── AdminUsers ─────────────────────────────────────────────

export function AdminUsers() {
    const { isSmall } = useResponsive();
    const { theme } = useTheme();
    const c = theme.colors;
    const vm = useUsersViewModel();
    const { t } = useTranslation();
    const permissions = useRolePermissions();

    // Filtro de tipo de usuario desde el ViewModel
    // (falsy / "" / "all" = sin filtro, se muestran todos los tipos)
    const roleFilter = vm.userTypeFilter && vm.userTypeFilter !== "all" ? vm.userTypeFilter : null;
    const canManage = permissions.canManageStudents;

    // Columnas visibles según filtro y permisos
    const visibleColumns = useMemo(() => {
        const ctx = { roleFilter, canManage };
        return COLUMNS.filter((col) => (col.visible ? col.visible(ctx) : true));
    }, [roleFilter, canManage]);

    if (vm.isLoading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={c.brand.primary} />
            </View>
        );
    }

    const courseItems = [
        { value: "", label: t("Todos"), icon: "layers" },
        ...vm.courses,
    ];

    const users = vm.filteredUsers;

    return (
        <ScrollView
            contentContainerStyle={{ padding: isSmall ? 16 : 24, gap: 16 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Filtros */}
            <Card padding={14}>
                <View style={{ flexDirection: isSmall ? "column" : "row", gap: 12, flexWrap: "wrap" }}>
                    <View style={{ flex: 1, minWidth: 200, position: "relative", justifyContent: "center" }}>
                        <View style={{ position: "absolute", left: 14, zIndex: 1 }}>
                            <Feather name="search" size={16} color={c.text.secondary} />
                        </View>
                        <TextInput
                            placeholder={t("Buscar por nombre o código...")}
                            value={vm.search}
                            onChangeText={vm.setSearch}
                            style={{
                                height: 48, borderWidth: 1.5, borderColor: c.border.primary,
                                borderRadius: 14, paddingLeft: 40, paddingRight: 14,
                                fontSize: 14, backgroundColor: c.background.surface,
                                color: c.text.primary,
                            }}
                            placeholderTextColor={c.text.disabled}
                        />
                    </View>

                    <AnimatedDropdown
                        items={courseItems}
                        value={vm.courseFilter}
                        onSelect={vm.setCourseFilter}
                        triggerIcon="book-open"
                        style={{ minWidth: 200 }}
                    />
                </View>
            </Card>

            {/* Tabla */}
            <Card padding={0}>
                {!isSmall && <TableHeader columns={visibleColumns} />}

                {users.length === 0 ? (
                    <EmptyState
                        icon={<Feather name="users" size={40} color={c.text.secondary} />}
                        title={t("Sin resultados")}
                        description={t("Ajusta los filtros o agrega nuevos estudiantes")}
                    />
                ) : (
                    users.map((user, i) => {
                        const isLast = i === users.length - 1;
                        const onPress = () => vm.selectUser(user);

                        return isSmall ? (
                            <UserCompactRow
                                key={user.id}
                                user={user}
                                onPress={onPress}
                                isLast={isLast}
                                showRole={!roleFilter}
                                canManage={canManage}
                            />
                        ) : (
                            <UserRow
                                key={user.id}
                                user={user}
                                columns={visibleColumns}
                                onPress={onPress}
                                isLast={isLast}
                            />
                        );
                    })
                )}
            </Card>

            {/* Modales */}
            <StudentDetailModal
                student={vm.selected}
                onClose={vm.clearSelection}
                canManage={canManage}
                canRegisterFace={permissions.canRegisterFace}
            />

            {canManage && (
                <RegisterStudentModal
                    visible={vm.showRegisterModal}
                    onClose={vm.closeRegisterModal}
                    onSubmit={vm.registerUser}
                />
            )}

            {permissions.canImportStudents && (
                <ImportStudentsModal
                    visible={vm.showImportModal}
                    onClose={vm.closeImportModal}
                    onImport={vm.importUsers}
                />
            )}
        </ScrollView>
    );
}