import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import styles from './Style';
import {useTheme} from '../components/common/ThemeContext';
import PrimaryButton from '../components/auth/PrimaryButton';
import {usePendingJustificationViewModel} from '../../viewmodels/usePendingJustificationViewModel';

/** Chip de filtro (Todos / Estudiantes / Docentes) */
const FilterChip = ({ label, count, active, onPress, colors }) => (
    <TouchableOpacity
        style={[
            styles.filterChipPending,
            {
                backgroundColor: active ? colors.primary : colors.card,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
            },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Text
            style={[
                styles.filterChipTextPending,
                { color: active ? '#FFFFFF' : colors.textSecondary },
                active && { fontWeight: '700' },
            ]}
        >
            {label} ({count})
        </Text>
    </TouchableOpacity>
);

/** Tarjeta de una justificación en la lista */
const JustificationCard = ({
                               item,
                               onPress,
                               getInitials,
                               getAvatarColor,
                               formatDate,
                               getTypeLabel,
                               getTypeColors,
                               getRoleLabel,
                               getRoleColors,
                               colors,
                           }) => {
    const typeColors = getTypeColors(item.type);
    const roleColors = getRoleColors(item.role);
    const avatarColor = getAvatarColor(item.userName);

    return (
        <TouchableOpacity
            style={[
                styles.cardPending,
                {
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                },
            ]}
            onPress={() => onPress(item)}
            activeOpacity={0.75}
        >
            {/* Cabecera */}
            <View style={styles.cardHeaderPending}>
                <View style={[styles.avatarContainerPending, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarTextPending}>{getInitials(item.userName)}</Text>
                </View>
                <View style={styles.cardHeaderInfoPending}>
                    <Text style={[styles.cardNamePending, { color: colors.text }]}>{item.userName}</Text>
                    <Text style={[styles.cardMetaPending, { color: colors.textSecondary }]}>
                        {item.userCode} · {item.userGroup}
                    </Text>
                </View>
            </View>

            {/* Badges */}
            <View style={styles.badgeRowPending}>
                <View style={[styles.typeBadgePending, { backgroundColor: typeColors.bg }]}>
                    <Text style={[styles.typeBadgeTextPending, { color: typeColors.text }]}>
                        {getTypeLabel(item.type)}
                    </Text>
                </View>
                <View style={[styles.roleBadgePending, { backgroundColor: roleColors.bg }]}>
                    <Text style={[styles.roleBadgeTextPending, { color: roleColors.text }]}>
                        {getRoleLabel(item.role)}
                    </Text>
                </View>
            </View>

            {/* Descripción recortada */}
            <Text style={[styles.cardDescriptionPending, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
            </Text>

            {/* Footer */}
            <View
                style={[
                    styles.cardFooterPending,
                    { borderTopWidth: 1, borderTopColor: colors.border },
                ]}
            >
                <View style={styles.attachmentIndicatorPending}>
                    {item.attachment ? (
                        <>
                            <Text style={{ fontSize: 13 }}>📎</Text>
                            <Text style={[styles.attachmentTextPending, { color: colors.textSecondary }]}>
                                {item.attachment.name}
                            </Text>
                        </>
                    ) : (
                        <Text style={[styles.attachmentTextPending, { color: colors.textSecondary }]}>
                            Sin adjunto
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    style={[
                        styles.viewButtonPending,
                        { borderWidth: 1, borderColor: colors.primary },
                    ]}
                    onPress={() => onPress(item)}
                >
                    <Text style={{ fontSize: 12 }}>👁</Text>
                    <Text style={[styles.viewButtonTextPending, { color: colors.primary }]}>Ver detalle</Text>
                </TouchableOpacity>
            </View>

            {/* Fecha de envío */}
            <Text style={[styles.cardDatePending, { marginTop: 6, color: colors.textSecondary }]}>
                Enviado: {formatDate(item.date)}
            </Text>
        </TouchableOpacity>
    );
};

/** Modal de detalle de una justificación */
const DetailModal = ({
                         visible,
                         item,
                         userRole,
                         onClose,
                         onApprove,
                         onReject,
                         getInitials,
                         getAvatarColor,
                         formatDate,
                         getFileIcon,
                         getTypeLabel,
                         getTypeColors,
                         getRoleLabel,
                         getRoleColors,
                         colors,
                     }) => {
    if (!item) return null;

    const typeColors = getTypeColors(item.type);
    const roleColors = getRoleColors(item.role);
    const avatarColor = getAvatarColor(item.userName);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.modalOverlayPending}>
                {/* Backdrop — cerrar al tocar fuera */}
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View
                    style={[
                        styles.modalSheetPending,
                        {
                            backgroundColor: colors.card,
                            borderWidth: 1,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    {/* Handle */}
                    <View style={[styles.modalHandlePending, { backgroundColor: colors.border }]} />

                    {/* Header del modal */}
                    <View
                        style={[
                            styles.modalHeaderPending,
                            { borderBottomWidth: 1, borderBottomColor: colors.border },
                        ]}
                    >
                        <Text style={[styles.modalTitlePending, { color: colors.text }]}>
                            Detalle de Justificación
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.modalCloseBtnPending,
                                { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
                            ]}
                            onPress={onClose}
                        >
                            <Text style={[styles.modalCloseTextPending, { color: colors.text }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.modalScrollPending}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── Usuario ── */}
                        <View
                            style={[
                                styles.detailUserRowPending,
                                {
                                    backgroundColor: colors.background,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                },
                            ]}
                        >
                            <View style={[styles.detailAvatarLargePending, { backgroundColor: avatarColor }]}>
                                <Text style={styles.detailAvatarTextPending}>{getInitials(item.userName)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.detailUserNamePending, { color: colors.text }]}>
                                    {item.userName}
                                </Text>
                                <Text style={[styles.detailUserMetaPending, { color: colors.textSecondary }]}>
                                    {item.userCode} · {item.userGroup}
                                </Text>
                                <View style={[styles.badgeRowPending, { marginTop: 6 }]}>
                                    <View style={[styles.typeBadgePending, { backgroundColor: typeColors.bg }]}>
                                        <Text style={[styles.typeBadgeTextPending, { color: typeColors.text }]}>
                                            {getTypeLabel(item.type)}
                                        </Text>
                                    </View>
                                    <View style={[styles.roleBadgePending, { backgroundColor: roleColors.bg }]}>
                                        <Text style={[styles.roleBadgeTextPending, { color: roleColors.text }]}>
                                            {getRoleLabel(item.role)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* ── Información del caso ── */}
                        <Text style={[styles.sectionLabelPending, { color: colors.text }]}>
                            Información del caso
                        </Text>
                        <View
                            style={[
                                styles.detailCardPending,
                                { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
                            ]}
                        >
                            {/* Tipo de caso */}
                            <View
                                style={[
                                    styles.detailRowPending,
                                    { borderBottomWidth: 1, borderBottomColor: colors.border },
                                ]}
                            >
                                <Text style={styles.detailIconPending}>📋</Text>
                                <Text style={[styles.detailKeyPending, { color: colors.textSecondary }]}>Caso</Text>
                                <Text style={[styles.detailValuePending, { color: colors.text }]}>
                                    {getTypeLabel(item.type)}
                                </Text>
                            </View>
                            {/* Fecha */}
                            <View
                                style={[
                                    styles.detailRowPending,
                                    { borderBottomWidth: 1, borderBottomColor: colors.border },
                                ]}
                            >
                                <Text style={styles.detailIconPending}>📅</Text>
                                <Text style={[styles.detailKeyPending, { color: colors.textSecondary }]}>Fecha</Text>
                                <Text style={[styles.detailValuePending, { color: colors.text }]}>
                                    {formatDate(item.date)}
                                </Text>
                            </View>
                            {/* Hora — solo para retardo */}
                            {item.type === 'retardo' && item.time && (
                                <View
                                    style={[
                                        styles.detailRowPending,
                                        { borderBottomWidth: 1, borderBottomColor: colors.border },
                                    ]}
                                >
                                    <Text style={styles.detailIconPending}>🕐</Text>
                                    <Text style={[styles.detailKeyPending, { color: colors.textSecondary }]}>
                                        Hora
                                    </Text>
                                    <Text style={[styles.detailValuePending, { color: colors.text }]}>
                                        {item.time}
                                    </Text>
                                </View>
                            )}
                            {/* Enviado */}
                            <View style={[styles.detailRowPending, styles.detailRowLastPending]}>
                                <Text style={styles.detailIconPending}>🕐</Text>
                                <Text style={[styles.detailKeyPending, { color: colors.textSecondary }]}>
                                    Enviado
                                </Text>
                                <Text style={[styles.detailValuePending, { color: colors.text }]}>
                                    {new Date(item.submittedAt).toLocaleString('es-CO', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </Text>
                            </View>
                        </View>

                        {/* ── Descripción ── */}
                        <Text style={[styles.sectionLabelPending, { color: colors.text }]}>
                            Descripción de la justificación
                        </Text>
                        <View
                            style={[
                                styles.descriptionBoxPending,
                                { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
                            ]}
                        >
                            <Text style={[styles.descriptionTextPending, { color: colors.text }]}>
                                {item.description}
                            </Text>
                        </View>

                        {/* ── Documento adjunto ── */}
                        <Text style={[styles.sectionLabelPending, { color: colors.text }]}>
                            Documento adjunto
                        </Text>
                        {item.attachment ? (
                            <View
                                style={[
                                    styles.attachmentBoxPending,
                                    { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.attachmentIconBoxPending,
                                        { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
                                    ]}
                                >
                                    <Text style={styles.attachmentIconTextPending}>
                                        {getFileIcon(item.attachment.mime)}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[styles.attachmentFileNamePending, { color: colors.text }]}
                                        numberOfLines={1}
                                    >
                                        {item.attachment.name}
                                    </Text>
                                    <Text style={[styles.attachmentFileSizePending, { color: colors.textSecondary }]}>
                                        {item.attachment.size}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View
                                style={[
                                    styles.attachmentBoxPending,
                                    { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.attachmentFileSizePending,
                                        { fontStyle: 'italic', color: colors.textSecondary },
                                    ]}
                                >
                                    No se adjuntó ningún documento.
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* ── Botones de acción (ocultos para estudiantes) ── */}
                    {userRole !== 'student' && (
                        <View
                            style={[
                                styles.actionRowPending,
                                {borderTopWidth: 1, borderTopColor: colors.border},
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.rejectBtnPending}
                                onPress={() => onReject(item.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={{fontSize: 16}}>✕</Text>
                                <Text style={styles.rejectBtnTextPending}>Rechazar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.approveBtnPending}
                                onPress={() => onApprove(item.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={{fontSize: 16}}>✓</Text>
                                <Text style={styles.approveBtnTextPending}>Aprobar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen principal
// ─────────────────────────────────────────────────────────────────────────────
export default function PendingJustificationScreen({ navigation }) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const handleBack = () => navigation.goBack();

    const {
        filtered,
        selectedItem,
        counts,
        activeFilter,
        isModalVisible,
        userRole,
        loadingRole,
        openDetail,
        closeDetail,
        approveJustification,
        rejectJustification,
        setActiveFilter,
        getInitials,
        getAvatarColor,
        formatDate,
        getFileIcon,
        getTypeLabel,
        getTypeColors,
        getRoleLabel,
        getRoleColors,
    } = usePendingJustificationViewModel();

    // Chips según rol: el profesor nunca ve "Docentes"; el estudiante no ve chips
    const FILTERS =
        userRole === 'teacher'
            ? [
                {key: 'all', label: 'Todos', count: counts.all},
                {key: 'student', label: 'Estudiantes', count: counts.student},
            ]
            : [
                {key: 'all', label: 'Todos', count: counts.all},
                {key: 'student', label: 'Estudiantes', count: counts.student},
                {key: 'teacher', label: 'Docentes', count: counts.teacher},
            ];

    // Subtítulo del header según rol
    const headerSubtitle =
        userRole === 'student'
            ? 'Mis justificaciones enviadas'
            : userRole === 'teacher'
                ? 'Pendientes de estudiantes'
                : 'Pendientes de revisión';

    const renderItem = ({ item }) => (
        <JustificationCard
            item={item}
            onPress={openDetail}
            getInitials={getInitials}
            getAvatarColor={getAvatarColor}
            formatDate={formatDate}
            getTypeLabel={getTypeLabel}
            getTypeColors={getTypeColors}
            getRoleLabel={getRoleLabel}
            getRoleColors={getRoleColors}
            colors={colors}
        />
    );

    const ListEmpty = () => (
        <View style={styles.emptyContainerPending}>
            <Text style={styles.emptyIconPending}>📭</Text>
            <Text style={[styles.emptyTitlePending, { color: colors.text }]}>
                {userRole === 'student'
                    ? 'Aún no has enviado justificaciones'
                    : 'Sin justificaciones pendientes'}
            </Text>
            <Text style={[styles.emptySubtitlePending, { color: colors.textSecondary }]}>
                {userRole === 'student'
                    ? 'Cuando envíes una justificación aparecerá aquí.'
                    : 'No hay justificaciones para este filtro en este momento.'}
            </Text>
        </View>
    );

    // Puerta de carga: no mostrar datos hasta conocer el rol (privacidad)
    if (loadingRole) {
        return (
            <SafeAreaView style={[styles.safeAreaPending, {backgroundColor: colors.background}]}>
                <View style={styles.emptyContainerPending}>
                    <ActivityIndicator color={colors.primary} size="large"/>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeAreaPending, { backgroundColor: colors.background }]}>
            <View style={styles.containerPending}>
                {/* Header */}
                <View style={[styles.headerPending, { backgroundColor: colors.background }]}>
                    <Text style={[styles.headerTitlePending, { color: colors.text }]}>Justificaciones</Text>
                    <Text style={[styles.headerSubtitlePending, { color: colors.textSecondary }]}>
                        {headerSubtitle}
                    </Text>
                </View>

                {/* Filtros — ocultos para estudiantes */}
                {userRole !== 'student' && (
                    <View style={styles.filterRowPending}>
                        {FILTERS.map((f) => (
                            <FilterChip
                                key={f.key}
                                label={f.label}
                                count={f.count}
                                active={activeFilter === f.key}
                                onPress={() => setActiveFilter(f.key)}
                                colors={colors}
                            />
                        ))}
                    </View>
                )}

                {/* Contador */}
                <View style={styles.resultsRowPending}>
                    <Text style={[styles.resultsTextPending, { color: colors.textSecondary }]}>Mostrando</Text>
                    <View style={[styles.resultsBadgePending, { backgroundColor: colors.primary }]}>
                        <Text style={styles.resultsBadgeTextPending}>{filtered.length}</Text>
                    </View>
                    <Text style={[styles.resultsTextPending, { color: colors.textSecondary }]}>
                        {filtered.length === 1 ? 'resultado' : 'resultados'}
                    </Text>
                </View>

                {/* Lista */}
                <FlatList
                    style={{ flex: 1 }}
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContentPending}
                    ListEmptyComponent={ListEmpty}
                    showsVerticalScrollIndicator={false}
                />

                <View style={[styles.buttonContainer, {marginTop: 1, marginBottom: 1}]}>
                    <PrimaryButton title={t('consultJustify.back')} onPress={handleBack} />
                </View>
            </View>

            {/* Modal de detalle */}
            <DetailModal
                visible={isModalVisible}
                item={selectedItem}
                userRole={userRole}
                onClose={closeDetail}
                onApprove={approveJustification}
                onReject={rejectJustification}
                getInitials={getInitials}
                getAvatarColor={getAvatarColor}
                formatDate={formatDate}
                getFileIcon={getFileIcon}
                getTypeLabel={getTypeLabel}
                getTypeColors={getTypeColors}
                getRoleLabel={getRoleLabel}
                getRoleColors={getRoleColors}
                colors={colors}
            />
        </SafeAreaView>
    );
}