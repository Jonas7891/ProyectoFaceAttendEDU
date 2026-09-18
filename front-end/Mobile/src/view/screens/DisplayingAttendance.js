// DisplayingAttendance.js (simplificado)
import React from "react";
import {
    FlatList,
    Image,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "./Styles/DisplayingAttendance/Style";
import BottomBar from "../components/common/NavigationBar";
import CustomTabs from "../components/common/CustomTabs";
import {
    APPROVAL_CONFIG,
    formatDateDisplay,
    getSubjectLabel,
    STATUS_CONFIG,
    useAttendanceViewModel
} from "../../viewmodels/useDisplayingAttendanceViewModel";

// ─────────────────────────────────────────────────────────────────────────────
// FILA DE DETALLE reutilizable en los modales
// ─────────────────────────────────────────────────────────────────────────────

function DetailRow({icon, label, value, colors, valueColor}) {
    if (!value || value === "—") return null;
    return (
        <View style={[styles.detailRow, {borderBottomColor: colors.separator ?? "#F0F0F0"}]}>
            <View style={styles.detailRowBody}>
                <Text style={[styles.detailRowLabel, {color: colors.textMuted}]}>{label}</Text>
                <Text style={[styles.detailRowValue, {color: valueColor ?? colors.text}]}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

function SectionLabel({text, colors}) {
    return (
        <Text style={[styles.sectionLabel, {color: colors.primary}]}>
            {text}
        </Text>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DETALLE — ADMIN (docente)
// ─────────────────────────────────────────────────────────────────────────────

function TeacherDetailModal({item, visible, onClose, colors, t, isDark}) {
    if (!item) return null;
    const cfg = STATUS_CONFIG[item.estado] ?? STATUS_CONFIG.ausente;
    const initials = item.nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={onClose}
                              style={styles.modalOverlay}/>
            <View style={[styles.bottomSheet, {
                backgroundColor: colors.background,
                paddingBottom: Platform.OS === "ios" ? 40 : 24,
            }]}>
                {/* Handle */}
                <View style={[styles.sheetHandle, {
                    backgroundColor: colors.separator ?? "#E0E0E0",
                }]}/>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.sheetScrollContent}
                >
                    {/* Cabecera */}
                    <View style={styles.sheetHeaderRow}>
                        <View style={[styles.avatarLarge, {
                            backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                            borderColor: cfg.color,
                        }]}>
                            <Text style={[styles.avatarLargeText, {color: cfg.color}]}>
                                {initials}
                            </Text>
                        </View>
                        <View style={styles.headerBody}>
                            <Text style={[styles.headerName, {color: colors.text}]}>
                                {item.nombre}
                            </Text>
                            <Text style={[styles.headerMeta, {color: colors.textSecondary}]}>
                                {getSubjectLabel(item.materia, t)} · {item.codigo_curso}
                            </Text>
                        </View>
                    </View>

                    {/* Asistencia */}
                    <SectionLabel text={t("attendance.sectionAttendance")}
                                  colors={colors}/>
                    <DetailRow label={t("attendance.date")} value={item.fecha}
                               colors={colors}/>
                    <DetailRow label={t("attendance.time")}
                               value={item.hora} colors={colors} valueColor={cfg.color}/>
                    <DetailRow label={t("attendance.day")} value={item.dia}
                               colors={colors}/>
                    <DetailRow label={t("attendance.schedule")}
                               value={`${item.hora_inicio} – ${item.hora_fin}`} colors={colors}/>

                    {/* Materia */}
                    <SectionLabel text={t("attendance.sectionCourse")} colors={colors}/>
                    <DetailRow label={t("attendance.subject")} value={getSubjectLabel(item.materia, t)}
                               colors={colors}/>
                    <DetailRow label={t("attendance.courseCode")}
                               value={item.codigo_curso} colors={colors}/>
                    <DetailRow label={t("attendance.classroom")} value={item.salon}
                               colors={colors}/>

                    {/* Período */}
                    <SectionLabel text={t("attendance.sectionPeriod")}
                                  colors={colors}/>
                    <DetailRow label={t("attendance.period")} value={item.periodo}
                               colors={colors}/>
                    <DetailRow label={t("attendance.periodStart")}
                               value={item.periodo_inicio} colors={colors}/>
                    <DetailRow label={t("attendance.periodEnd")}
                               value={item.periodo_fin} colors={colors}/>
                </ScrollView>

                <TouchableOpacity
                    onPress={onClose}
                    style={[styles.sheetCloseButton, {
                        backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
                    }]}
                >
                    <Text style={[styles.sheetCloseText, {color: colors.textSecondary}]}>
                        {t("common.close")}
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL DETALLE — ESTUDIANTE (registro propio)
// ─────────────────────────────────────────────────────────────────────────────

function StudentDetailModal({item, visible, onClose, colors, t, isDark}) {
    if (!item) return null;
    const cfg = STATUS_CONFIG[item.estado] ?? STATUS_CONFIG.ausente;
    const justCfg = item.justificacion
        ? (APPROVAL_CONFIG[item.justificacion.estado] ?? APPROVAL_CONFIG.Pending)
        : null;

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity activeOpacity={1} onPress={onClose}
                              style={styles.modalOverlay}/>
            <View style={[styles.bottomSheetTall, {
                backgroundColor: colors.background,
                paddingBottom: Platform.OS === "ios" ? 40 : 24,
            }]}>
                {/* Handle */}
                <View style={[styles.sheetHandle, {
                    backgroundColor: colors.separator ?? "#E0E0E0",
                }]}/>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.sheetScrollContent}
                >
                    {/* Cabecera */}
                    <View style={[styles.statusCard, {
                        backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                        borderColor: cfg.color + "55",
                    }]}>
                        <View style={styles.statusCardBody}>
                            <Text style={[styles.statusCardTitle, {color: cfg.color}]}>
                                {getSubjectLabel(item.materia, t)}
                            </Text>
                            <Text style={[styles.statusCardCode, {color: cfg.color + "BB"}]}>
                                {item.codigo_curso}
                            </Text>
                        </View>
                    </View>

                    {/* Registro */}
                    <SectionLabel text={t("attendance.sectionAttendance")}
                                  colors={colors}/>
                    <DetailRow label={t("attendance.date")} value={item.fecha}
                               colors={colors}/>
                    <DetailRow label={t("attendance.time")}
                               value={item.hora} colors={colors} valueColor={cfg.color}/>

                    {/* Clase */}
                    <SectionLabel text={t("attendance.sectionClass")}
                                  colors={colors}/>
                    <DetailRow label={t("attendance.teacher")}
                               value={item.docente} colors={colors}/>
                    <DetailRow label={t("attendance.classroom")} value={item.salon}
                               colors={colors}/>
                    <DetailRow label={t("attendance.day")} value={item.dia}
                               colors={colors}/>
                    <DetailRow label={t("attendance.schedule")}
                               value={`${item.hora_inicio} – ${item.hora_fin}`} colors={colors}/>

                    {/* Período */}
                    <SectionLabel text={t("attendance.sectionPeriod")}
                                  colors={colors}/>
                    <DetailRow label={t("attendance.period")} value={item.periodo}
                               colors={colors}/>
                    <DetailRow label={t("attendance.periodStart")}
                               value={item.periodo_inicio} colors={colors}/>
                    <DetailRow label={t("attendance.periodEnd")}
                               value={item.periodo_fin} colors={colors}/>

                    {/* Justificación */}
                    {item.justificacion && (
                        <>
                            <SectionLabel text={t("attendance.sectionJustification")}
                                          colors={colors}/>

                            {/* Badge de aprobación */}
                            <View style={[styles.approvalRow, {borderBottomColor: colors.separator ?? "#F0F0F0"}]}>
                                <View style={styles.approvalBody}>
                                    <Text style={[styles.approvalLabel, {color: colors.textMuted}]}>
                                        {t("attendance.approvalStatus")}
                                    </Text>
                                    <View style={[styles.approvalBadge, {
                                        backgroundColor: justCfg.color + "22",
                                        borderColor: justCfg.color + "55",
                                    }]}>
                                        <Text style={[styles.approvalBadgeText, {color: justCfg.color}]}>
                                            {t(justCfg.label)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <DetailRow label={t("attendance.justificationText")}
                                       value={item.justificacion.texto} colors={colors}/>
                            <DetailRow label={t("attendance.reviewedBy")}
                                       value={item.justificacion.revisado_por} colors={colors}/>
                            <DetailRow label={t("attendance.reviewedAt")}
                                       value={item.justificacion.revisado_en} colors={colors}/>
                        </>
                    )}

                    {/* Sin justificación + ausente → aviso */}
                    {!item.justificacion && item.estado === "ausente" && (
                        <View style={[styles.warnBox, {
                            backgroundColor: isDark ? "#451A03" : "#FEF3C7",
                            borderColor: "#F59E0B55",
                        }]}>
                            <Text style={[styles.warnTitle, {color: "#F59E0B"}]}>
                                {t("attendance.noJustification")}
                            </Text>
                            <Text style={[styles.warnMsg, {color: isDark ? "#FDE68A" : "#92400E"}]}>
                                {t("attendance.noJustificationHint")}
                            </Text>
                        </View>
                    )}
                </ScrollView>

                <TouchableOpacity
                    onPress={onClose}
                    style={[styles.sheetCloseButton, {
                        backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
                    }]}
                >
                    <Text style={[styles.sheetCloseTextPlain, {color: colors.textSecondary}]}>
                        {t("common.close")}
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETA ADMIN
// ─────────────────────────────────────────────────────────────────────────────

function TeacherCard({item, colors, t, isDark, onInfo}) {
    const initials = item.nombre.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const cfg = STATUS_CONFIG[item.estado] ?? STATUS_CONFIG.ausente;

    return (
        <View style={[styles.teacherCard, {
            backgroundColor: colors.card,
            borderColor: colors.separator ?? "#F0F0F0",
            borderLeftColor: cfg.color,
        }]}>
            <View style={[styles.teacherAvatar, {
                backgroundColor: isDark ? cfg.darkBg : cfg.bg,
            }]}>
                <Text style={[styles.teacherAvatarText, {color: cfg.color}]}>{initials}</Text>
            </View>

            <View style={styles.teacherBody}>
                <Text style={[styles.teacherName, {color: colors.text}]}>
                    {item.nombre}
                </Text>
                <Text style={[styles.teacherMeta, {color: colors.textSecondary}]}>
                    {getSubjectLabel(item.materia, t)} · <Text
                    style={{color: colors.textMuted}}>{item.codigo_curso}</Text>
                </Text>
                <Text style={[styles.teacherSub, {color: colors.textMuted}]}>
                    {item.fecha} · {item.estado !== "ausente" ? item.hora : "—"}
                </Text>
            </View>

            {/* LUPA CLICKEABLE PARA ABRIR MODAL */}
            <TouchableOpacity
                onPress={() => onInfo(item)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                style={[styles.infoButton, {
                    backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                }]}
            >
                <Image
                    source={require("../../assets/images/lupa.png")}
                    style={[styles.infoIcon, {tintColor: cfg.color}]}
                />
            </TouchableOpacity>
        </View>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// TARJETA ESTUDIANTE
// ─────────────────────────────────────────────────────────────────────────────

function MyAttendanceCard({item, colors, t, isDark, onInfo}) {
    const cfg = STATUS_CONFIG[item.estado] ?? STATUS_CONFIG.ausente;
    const hasJustification = !!item.justificacion;

    return (
        <View style={[styles.myCard, {
            backgroundColor: colors.card,
            borderColor: colors.separator ?? "#F0F0F0",
        }]}>
            <View
                style={styles.myCardHeader}>
                <View style={styles.myCardDateRow}>
                    <Text style={[styles.myCardDate, {color: colors.primary}]}>{item.fecha}</Text>
                    {item.estado !== "ausente" && (
                        <Text style={[styles.myCardTime, {color: colors.textSecondary}]}>· {item.hora}</Text>
                    )}
                </View>

                {/* LUPA CLICKEABLE PARA ABRIR MODAL */}
                <TouchableOpacity
                    onPress={() => onInfo(item)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                    style={[styles.infoButton, {
                        backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                    }]}
                >
                    <Image
                        source={require("../../assets/images/lupa.png")}
                        style={[styles.infoIcon, {tintColor: cfg.color}]}
                    />
                </TouchableOpacity>
            </View>

            <View style={[styles.myCardBody, {
                borderTopColor: colors.separator ?? "#F0F0F0",
            }]}>
                <View style={styles.myCardField}>
                    <Text style={[styles.myCardFieldLabel, {color: colors.textMuted}]}>
                        {t("attendance.subject")}
                    </Text>
                    <Text style={[styles.myCardFieldValue, {color: colors.text}]}>{getSubjectLabel(item.materia, t)}</Text>
                </View>
                <View style={styles.myCardField}>
                    <Text style={[styles.myCardFieldLabel, {color: colors.textMuted}]}>
                        {t("attendance.teacher")}
                    </Text>
                    <Text style={[styles.myCardFieldValuePlain, {color: colors.text}]}>{item.docente}</Text>
                </View>
                {hasJustification && (
                    <View style={[styles.justifiedBadge, {
                        backgroundColor: isDark ? "#2E1065" : "#EDE9FE",
                    }]}>
                        <Text style={styles.justifiedBadgeText}>
                            {t("attendance.justified")}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

export default function DisplayingAttendance() {
    // Extraemos todas las propiedades UNA SOLA VEZ
    const {
        t,                      // <--- Obtenemos t
        locale,
        isAdmin,
        isDark,
        colors,
        updateKey,
        searchText,
        setSearchText,
        selectedDate,
        setSelectedDate,
        showPicker,
        showIOSModal,
        setShowIOSModal,
        tempDate,
        setTempDate,
        activeData,
        detailItem,
        showDetailModal,
        openDetail,
        closeDetail,
        handleOpenPicker,
        handleAndroidChange,
    } = useAttendanceViewModel();

    return (
        <SafeAreaView
            style={[styles.safeArea, {backgroundColor: colors.background}]}
            key={`${updateKey}`}
        >
            <View style={[styles.mainContainer, {
                backgroundColor: colors.background,
                marginTop: Platform.OS === "ios" ? 15 : 10,
            }]}>
                <View style={styles.tabsWrap}>
                    <CustomTabs userRole={isAdmin ? "admin" : "student"}/>
                </View>

                {/* Filtros */}
                <View style={styles.filtersRow}>
                    {isAdmin && (
                        <View style={[styles.searchBox, {
                            backgroundColor: colors.inputBackground,
                            borderColor: searchText ? colors.primary : (colors.separator ?? "#E0E0E0"),
                        }]}>
                            <TextInput
                                style={[styles.searchInput, {color: colors.text}]}
                                placeholder={t("attendance.searchByName")}
                                placeholderTextColor={colors.textMuted}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            {searchText ? (
                                <TouchableOpacity onPress={() => setSearchText("")}>
                                    <Text style={[styles.clearText, {color: colors.danger}]}>✕</Text>
                                </TouchableOpacity>
                            ) : (
                                <Image source={require("../../assets/images/lupa.png")}
                                       style={[styles.searchIcon, {tintColor: colors.textMuted}]}/>
                            )}
                        </View>
                    )}

                    <TouchableOpacity onPress={handleOpenPicker} style={[styles.dateButton, {
                        flex: isAdmin ? 1.2 : 1,
                        backgroundColor: colors.inputBackground,
                        borderColor: selectedDate ? colors.primary : (colors.separator ?? "#E0E0E0"),
                    }]}>
                        <Text style={[styles.dateText, {color: selectedDate ? colors.text : colors.textMuted}]}
                              numberOfLines={1}>
                            {formatDateDisplay(selectedDate, t, locale)}
                        </Text>
                        {selectedDate && (
                            <TouchableOpacity onPress={() => setSelectedDate(null)}>
                                <Text style={[styles.clearText, {color: colors.danger}]}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                {/* DateTimePicker Android */}
                {showPicker && Platform.OS === "android" && (
                    <DateTimePicker value={tempDate} mode="date" display="default" onChange={handleAndroidChange}
                                    maximumDate={new Date()}/>
                )}

                {/* DateTimePicker iOS Modal */}
                <Modal transparent visible={showIOSModal} animationType="slide"
                       onRequestClose={() => setShowIOSModal(false)}>
                    <TouchableOpacity activeOpacity={1} onPress={() => setShowIOSModal(false)}
                                      style={styles.modalOverlayLight}/>
                    <View style={[styles.iosSheet, {backgroundColor: colors.card}]}>
                        <View style={[styles.iosHandle, {
                            backgroundColor: colors.separator ?? "#E0E0E0",
                        }]}/>
                        <View style={styles.iosActionsRow}>
                            <TouchableOpacity onPress={() => setShowIOSModal(false)}>
                                <Text style={[styles.iosActionText, {
                                    color: colors.danger,
                                }]}>{t("common.cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setSelectedDate(tempDate);
                                setShowIOSModal(false);
                            }}>
                                <Text style={[styles.iosActionText, {
                                    color: colors.primary,
                                }]}>{t("common.accept")}</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker value={tempDate} mode="date" display="spinner"
                                        onChange={(_, date) => date && setTempDate(date)} maximumDate={new Date()}
                                        style={{backgroundColor: colors.card}} textColor={colors.text}/>
                    </View>
                </Modal>

                {/* Lista */}
                <FlatList
                    data={activeData}
                    keyExtractor={item => item.id.toString()}
                    style={styles.listStyle}
                    contentContainerStyle={styles.listContent}
                    renderItem={({item}) =>
                        isAdmin
                            ? <TeacherCard item={item} colors={colors} t={t} isDark={isDark} onInfo={openDetail}/>
                            : <MyAttendanceCard item={item} colors={colors} t={t} isDark={isDark} onInfo={openDetail}/>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={[styles.emptyText, {color: colors.textMuted}]}>
                                {t("attendance.noResults")}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={<View style={{paddingBottom: Platform.OS === "ios" ? 50 : 70}}/>}
                />
            </View>

            <BottomBar/>

            {/* Modales */}
            {isAdmin ? (
                <TeacherDetailModal item={detailItem} visible={showDetailModal} onClose={closeDetail} colors={colors}
                                    t={t} isDark={isDark}/>
            ) : (
                <StudentDetailModal item={detailItem} visible={showDetailModal} onClose={closeDetail} colors={colors}
                                    t={t} isDark={isDark}/>
            )}
        </SafeAreaView>
    );
}
