import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
    Pressable,
    StyleSheet,
} from 'react-native';
import styles from './Style';
import { usePendingJustificationViewModel } from '../../viewmodels/usePendingJustificationViewModel';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────────────────────────────────────

/** Chip de filtro (Todos / Estudiantes / Docentes) */
const FilterChip = ({ label, count, active, onPress }) => (
    <TouchableOpacity
        style={[styles.filterChipPending, active && styles.filterChipActivePending]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Text style={[styles.filterChipTextPending, active && styles.filterChipTextActivePending]}>
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
}) => {
    const typeColors = getTypeColors(item.type);
    const roleColors = getRoleColors(item.role);
    const avatarColor = getAvatarColor(item.userName);

    return (
        <TouchableOpacity style={styles.cardPending} onPress={() => onPress(item)} activeOpacity={0.75}>
            {/* Cabecera */}
            <View style={styles.cardHeaderPending}>
                <View style={[styles.avatarContainerPending, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarTextPending}>{getInitials(item.userName)}</Text>
                </View>
                <View style={styles.cardHeaderInfoPending}>
                    <Text style={styles.cardNamePending}>{item.userName}</Text>
                    <Text style={styles.cardMetaPending}>
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
            <Text style={styles.cardDescriptionPending} numberOfLines={2}>
                {item.description}
            </Text>

            {/* Footer */}
            <View style={styles.cardFooterPending}>
                <View style={styles.attachmentIndicatorPending}>
                    {item.attachment ? (
                        <>
                            <Text style={{ fontSize: 13 }}>📎</Text>
                            <Text style={styles.attachmentTextPending}>{item.attachment.name}</Text>
                        </>
                    ) : (
                        <Text style={styles.attachmentTextPending}>Sin adjunto</Text>
                    )}
                </View>
                <TouchableOpacity style={styles.viewButtonPending} onPress={() => onPress(item)}>
                    <Text style={{ fontSize: 12 }}>👁</Text>
                    <Text style={styles.viewButtonTextPending}>Ver detalle</Text>
                </TouchableOpacity>
            </View>

            {/* Fecha de envío */}
            <Text style={[styles.cardDatePending, { marginTop: 6 }]}>
                Enviado: {formatDate(item.date)}
            </Text>
        </TouchableOpacity>
    );
};

/** Modal de detalle de una justificación */
const DetailModal = ({
    visible,
    item,
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

                <View style={styles.modalSheetPending}>
                    {/* Handle */}
                    <View style={styles.modalHandlePending} />

                    {/* Header del modal */}
                    <View style={styles.modalHeaderPending}>
                        <Text style={styles.modalTitlePending}>Detalle de Justificación</Text>
                        <TouchableOpacity style={styles.modalCloseBtnPending} onPress={onClose}>
                            <Text style={styles.modalCloseTextPending}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.modalScrollPending}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── Usuario ── */}
                        <View style={styles.detailUserRowPending}>
                            <View style={[styles.detailAvatarLargePending, { backgroundColor: avatarColor }]}>
                                <Text style={styles.detailAvatarTextPending}>{getInitials(item.userName)}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.detailUserNamePending}>{item.userName}</Text>
                                <Text style={styles.detailUserMetaPending}>
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
                        <Text style={styles.sectionLabelPending}>Información del caso</Text>
                        <View style={styles.detailCardPending}>
                            {/* Tipo de caso */}
                            <View style={styles.detailRowPending}>
                                <Text style={styles.detailIconPending}>📋</Text>
                                <Text style={styles.detailKeyPending}>Caso</Text>
                                <Text style={styles.detailValuePending}>{getTypeLabel(item.type)}</Text>
                            </View>

                            {/* Fecha */}
                            <View style={styles.detailRowPending}>
                                <Text style={styles.detailIconPending}>📅</Text>
                                <Text style={styles.detailKeyPending}>Fecha</Text>
                                <Text style={styles.detailValuePending}>{formatDate(item.date)}</Text>
                            </View>

                            {/* Hora — solo para retardo */}
                            {item.type === 'retardo' && item.time && (
                                <View style={styles.detailRowPending}>
                                    <Text style={styles.detailIconPending}>🕐</Text>
                                    <Text style={styles.detailKeyPending}>Hora</Text>
                                    <Text style={styles.detailValuePending}>{item.time}</Text>
                                </View>
                            )}

                            {/* Enviado */}
                            <View style={[styles.detailRowPending, styles.detailRowLastPending]}>
                                <Text style={styles.detailIconPending}>🕐</Text>
                                <Text style={styles.detailKeyPending}>Enviado</Text>
                                <Text style={styles.detailValuePending}>
                                    {new Date(item.submittedAt).toLocaleString('es-CO', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </Text>
                            </View>
                        </View>

                        {/* ── Descripción ── */}
                        <Text style={styles.sectionLabelPending}>Descripción de la justificación</Text>
                        <View style={styles.descriptionBoxPending}>
                            <Text style={styles.descriptionTextPending}>{item.description}</Text>
                        </View>

                        {/* ── Documento adjunto ── */}
                        <Text style={styles.sectionLabelPending}>Documento adjunto</Text>
                        {item.attachment ? (
                            <View style={styles.attachmentBoxPending}>
                                <View style={styles.attachmentIconBoxPending}>
                                    <Text style={styles.attachmentIconTextPending}>
                                        {getFileIcon(item.attachment.mime)}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.attachmentFileNamePending} numberOfLines={1}>
                                        {item.attachment.name}
                                    </Text>
                                    <Text style={styles.attachmentFileSizePending}>{item.attachment.size}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.attachmentBoxPending}>
                                <Text style={[styles.attachmentFileSizePending, { fontStyle: 'italic' }]}>
                                    No se adjuntó ningún documento.
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* ── Botones de acción ── */}
                    <View style={styles.actionRowPending}>
                        <TouchableOpacity
                            style={styles.rejectBtnPending}
                            onPress={() => onReject(item.id)}
                            activeOpacity={0.8}
                        >
                            <Text style={{ fontSize: 16 }}>✕</Text>
                            <Text style={styles.rejectBtnTextPending}>Rechazar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.approveBtnPending}
                            onPress={() => onApprove(item.id)}
                            activeOpacity={0.8}
                        >
                            <Text style={{ fontSize: 16 }}>✓</Text>
                            <Text style={styles.approveBtnTextPending}>Aprobar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Screen principal
// ─────────────────────────────────────────────────────────────────────────────

export default function PendingJustificationScreen() {
    const {
        filtered,
        selectedItem,
        counts,
        activeFilter,
        isModalVisible,
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

    const FILTERS = [
        { key: 'all', label: 'Todos', count: counts.all },
        { key: 'student', label: 'Estudiantes', count: counts.student },
        { key: 'teacher', label: 'Docentes', count: counts.teacher },
    ];

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
        />
    );

    const ListEmpty = () => (
        <View style={styles.emptyContainerPending}>
            <Text style={styles.emptyIconPending}>📭</Text>
            <Text style={styles.emptyTitlePending}>Sin justificaciones pendientes</Text>
            <Text style={styles.emptySubtitlePending}>
                No hay justificaciones para este filtro en este momento.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeAreaPending}>
            <View style={styles.containerPending}>
                {/* Header */}
                <View style={styles.headerPending}>
                    <Text style={styles.headerTitlePending}>Justificaciones</Text>
                    <Text style={styles.headerSubtitlePending}>Pendientes de revisión</Text>
                </View>

                {/* Filtros */}
                <View style={styles.filterRowPending}>
                    {FILTERS.map((f) => (
                        <FilterChip
                            key={f.key}
                            label={f.label}
                            count={f.count}
                            active={activeFilter === f.key}
                            onPress={() => setActiveFilter(f.key)}
                        />
                    ))}
                </View>

                {/* Contador */}
                <View style={styles.resultsRowPending}>
                    <Text style={styles.resultsTextPending}>Mostrando</Text>
                    <View style={styles.resultsBadgePending}>
                        <Text style={styles.resultsBadgeTextPending}>{filtered.length}</Text>
                    </View>
                    <Text style={styles.resultsTextPending}>
                        {filtered.length === 1 ? 'resultado' : 'resultados'}
                    </Text>
                </View>

                {/* Lista */}
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContentPending}
                    ListEmptyComponent={ListEmpty}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Modal de detalle */}
            <DetailModal
                visible={isModalVisible}
                item={selectedItem}
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
            />
        </SafeAreaView>
    );
}
