// DisplayingAttendance.js (simplificado)
import React from "react";
import {
    Text, View, SafeAreaView, TextInput, TouchableOpacity,
    FlatList, Image, Platform, Modal, ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "./Style";
import BottomBar from "../components/common/NavigationBar";
import CustomTabs from "../components/common/CustomTabs";
import { useAttendanceViewModel, STATUS_CONFIG, APPROVAL_CONFIG, formatDateDisplay } from "../../viewmodels/useDisplayingAttendanceViewModel";

// ─────────────────────────────────────────────────────────────────────────────
// FILA DE DETALLE reutilizable en los modales
// ─────────────────────────────────────────────────────────────────────────────

function DetailRow({icon, label, value, colors, valueColor}) {
    if (!value || value === "—") return null;
    return (
        <View style={{
            flexDirection: "row", alignItems: "flex-start",
            paddingVertical: 10,
            borderBottomWidth: 1, borderBottomColor: colors.separator ?? "#F0F0F0",
            gap: 12,
        }}>
            <Text style={{fontSize: 18, width: 26, textAlign: "center"}}>{icon}</Text>
            <View style={{flex: 1}}>
                <Text style={{fontSize: 11, color: colors.textMuted, marginBottom: 2}}>{label}</Text>
                <Text style={{fontSize: 14, fontWeight: "600", color: valueColor ?? colors.text}}>
                    {value}
                </Text>
            </View>
        </View>
    );
}

function SectionLabel({text, colors}) {
    return (
        <Text style={{
            fontSize: 11, fontWeight: "700", color: colors.primary,
            letterSpacing: 0.8, marginTop: 20, marginBottom: 4,
            textTransform: "uppercase",
        }}>
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
                              style={{flex: 1, backgroundColor: "rgba(0,0,0,0.5)"}}/>
            <View style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                backgroundColor: colors.background,
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                paddingBottom: Platform.OS === "ios" ? 40 : 24,
                maxHeight: "84%",
            }}>
                {/* Handle */}
                <View style={{
                    width: 40, height: 4, borderRadius: 2,
                    backgroundColor: colors.separator ?? "#E0E0E0",
                    alignSelf: "center", marginTop: 12, marginBottom: 20,
                }}/>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 16}}
                >
                    {/* Cabecera */}
                    <View style={{
                        flexDirection: "row", alignItems: "center",
                        gap: 14, marginBottom: 24,
                    }}>
                        <View style={{
                            width: 58, height: 58, borderRadius: 29,
                            backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                            justifyContent: "center", alignItems: "center",
                            borderWidth: 2, borderColor: cfg.color,
                        }}>
                            <Text style={{fontSize: 20, fontWeight: "700", color: cfg.color}}>
                                {initials}
                            </Text>
                        </View>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize: 18, fontWeight: "700", color: colors.text}}>
                                {item.nombre}
                            </Text>
                            <Text style={{fontSize: 13, color: colors.textSecondary, marginTop: 2}}>
                                {item.materia} · {item.codigo_curso}
                            </Text>
                        </View>
                    </View>

                    {/* Asistencia */}
                    <SectionLabel text={t("attendance.sectionAttendance", {defaultValue: "Registro de asistencia"})}
                                  colors={colors}/>
                    <DetailRow icon="📅" label={t("attendance.date", {defaultValue: "Fecha"})} value={item.fecha}
                               colors={colors}/>
                    <DetailRow icon="⏰" label={t("attendance.time", {defaultValue: "Hora de entrada"})}
                               value={item.hora} colors={colors} valueColor={cfg.color}/>
                    <DetailRow icon="📆" label={t("attendance.day", {defaultValue: "Día de clase"})} value={item.dia}
                               colors={colors}/>
                    <DetailRow icon="🕐" label={t("attendance.schedule", {defaultValue: "Horario"})}
                               value={`${item.hora_inicio} – ${item.hora_fin}`} colors={colors}/>

                    {/* Materia */}
                    <SectionLabel text={t("attendance.sectionCourse", {defaultValue: "Materia"})} colors={colors}/>
                    <DetailRow icon="📚" label={t("attendance.subject", {defaultValue: "Materia"})} value={item.materia}
                               colors={colors}/>
                    <DetailRow icon="🔖" label={t("attendance.courseCode", {defaultValue: "Código de curso"})}
                               value={item.codigo_curso} colors={colors}/>
                    <DetailRow icon="🏫" label={t("attendance.classroom", {defaultValue: "Salón"})} value={item.salon}
                               colors={colors}/>

                    {/* Período */}
                    <SectionLabel text={t("attendance.sectionPeriod", {defaultValue: "Período académico"})}
                                  colors={colors}/>
                    <DetailRow icon="🗓️" label={t("attendance.period", {defaultValue: "Período"})} value={item.periodo}
                               colors={colors}/>
                    <DetailRow icon="▶️" label={t("attendance.periodStart", {defaultValue: "Inicio"})}
                               value={item.periodo_inicio} colors={colors}/>
                    <DetailRow icon="⏹️" label={t("attendance.periodEnd", {defaultValue: "Fin"})}
                               value={item.periodo_fin} colors={colors}/>
                </ScrollView>

                <TouchableOpacity
                    onPress={onClose}
                    style={{
                        marginHorizontal: 24, marginTop: 8,
                        paddingVertical: 14, borderRadius: 14,
                        backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
                        alignItems: "center",
                    }}
                >
                    <Text style={{fontSize: 15, fontWeight: "600", color: colors.textSecondary}}>
                        {t("common.close", {defaultValue: "Cerrar"})}
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
                              style={{flex: 1, backgroundColor: "rgba(0,0,0,0.5)"}}/>
            <View style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                backgroundColor: colors.background,
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                paddingBottom: Platform.OS === "ios" ? 40 : 24,
                maxHeight: "88%",
            }}>
                {/* Handle */}
                <View style={{
                    width: 40, height: 4, borderRadius: 2,
                    backgroundColor: colors.separator ?? "#E0E0E0",
                    alignSelf: "center", marginTop: 12, marginBottom: 20,
                }}/>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{paddingHorizontal: 24, paddingBottom: 16}}
                >
                    {/* Cabecera */}
                    <View style={{
                        backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                        borderRadius: 16, padding: 16,
                        flexDirection: "row", alignItems: "center",
                        gap: 14, marginBottom: 24,
                        borderWidth: 1, borderColor: cfg.color + "55",
                    }}>
                        <Text style={{fontSize: 36}}>📖</Text>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize: 17, fontWeight: "700", color: cfg.color}}>
                                {item.materia}
                            </Text>
                            <Text style={{fontSize: 12, color: cfg.color + "BB", marginTop: 2}}>
                                {item.codigo_curso}
                            </Text>
                        </View>
                    </View>

                    {/* Registro */}
                    <SectionLabel text={t("attendance.sectionAttendance", {defaultValue: "Registro de asistencia"})}
                                  colors={colors}/>
                    <DetailRow icon="📅" label={t("attendance.date", {defaultValue: "Fecha"})} value={item.fecha}
                               colors={colors}/>
                    <DetailRow icon="⏰" label={t("attendance.time", {defaultValue: "Hora registrada"})}
                               value={item.hora} colors={colors} valueColor={cfg.color}/>

                    {/* Clase */}
                    <SectionLabel text={t("attendance.sectionClass", {defaultValue: "Información de la clase"})}
                                  colors={colors}/>
                    <DetailRow icon="👨‍🏫" label={t("attendance.teacher", {defaultValue: "Docente"})}
                               value={item.docente} colors={colors}/>
                    <DetailRow icon="🏫" label={t("attendance.classroom", {defaultValue: "Salón"})} value={item.salon}
                               colors={colors}/>
                    <DetailRow icon="📆" label={t("attendance.day", {defaultValue: "Día"})} value={item.dia}
                               colors={colors}/>
                    <DetailRow icon="🕐" label={t("attendance.schedule", {defaultValue: "Horario"})}
                               value={`${item.hora_inicio} – ${item.hora_fin}`} colors={colors}/>

                    {/* Período */}
                    <SectionLabel text={t("attendance.sectionPeriod", {defaultValue: "Período académico"})}
                                  colors={colors}/>
                    <DetailRow icon="🗓️" label={t("attendance.period", {defaultValue: "Período"})} value={item.periodo}
                               colors={colors}/>
                    <DetailRow icon="▶️" label={t("attendance.periodStart", {defaultValue: "Inicio"})}
                               value={item.periodo_inicio} colors={colors}/>
                    <DetailRow icon="⏹️" label={t("attendance.periodEnd", {defaultValue: "Fin"})}
                               value={item.periodo_fin} colors={colors}/>

                    {/* Justificación */}
                    {item.justificacion && (
                        <>
                            <SectionLabel text={t("attendance.sectionJustification", {defaultValue: "Justificación"})}
                                          colors={colors}/>

                            {/* Badge de aprobación */}
                            <View style={{
                                flexDirection: "row", alignItems: "center", gap: 10,
                                paddingVertical: 10,
                                borderBottomWidth: 1, borderBottomColor: colors.separator ?? "#F0F0F0",
                            }}>
                                <Text style={{fontSize: 18, width: 26, textAlign: "center"}}>📋</Text>
                                <View style={{flex: 1}}>
                                    <Text style={{fontSize: 11, color: colors.textMuted, marginBottom: 6}}>
                                        {t("attendance.approvalStatus", {defaultValue: "Estado de aprobación"})}
                                    </Text>
                                    <View style={{
                                        alignSelf: "flex-start",
                                        backgroundColor: justCfg.color + "22",
                                        borderRadius: 20,
                                        paddingHorizontal: 12, paddingVertical: 4,
                                        borderWidth: 1, borderColor: justCfg.color + "55",
                                    }}>
                                        <Text style={{fontSize: 13, fontWeight: "700", color: justCfg.color}}>
                                            {t(justCfg.label, {defaultValue: item.justificacion.estado})}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <DetailRow icon="📝" label={t("attendance.justificationText", {defaultValue: "Descripción"})}
                                       value={item.justificacion.texto} colors={colors}/>
                            <DetailRow icon="👤" label={t("attendance.reviewedBy", {defaultValue: "Revisado por"})}
                                       value={item.justificacion.revisado_por} colors={colors}/>
                            <DetailRow icon="🕓" label={t("attendance.reviewedAt", {defaultValue: "Fecha revisión"})}
                                       value={item.justificacion.revisado_en} colors={colors}/>
                        </>
                    )}

                    {/* Sin justificación + ausente → aviso */}
                    {!item.justificacion && item.estado === "ausente" && (
                        <View style={{
                            marginTop: 20,
                            backgroundColor: isDark ? "#451A03" : "#FEF3C7",
                            borderRadius: 12, padding: 14,
                            borderWidth: 1, borderColor: "#F59E0B55",
                        }}>
                            <Text style={{fontSize: 13, fontWeight: "600", color: "#F59E0B", marginBottom: 4}}>
                                ⚠️ {t("attendance.noJustification", {defaultValue: "Sin justificación registrada"})}
                            </Text>
                            <Text style={{fontSize: 12, color: isDark ? "#FDE68A" : "#92400E"}}>
                                {t("attendance.noJustificationHint", {defaultValue: "Puedes agregar una desde el menú de justificaciones."})}
                            </Text>
                        </View>
                    )}
                </ScrollView>

                <TouchableOpacity
                    onPress={onClose}
                    style={{
                        marginHorizontal: 24, marginTop: 8,
                        paddingVertical: 14, borderRadius: 14,
                        backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
                        alignItems: "center",
                    }}
                >
                    <Text style={{fontSize: 15, fontWeight: "600", color: colors.textSecondary}}>
                        {t("common.close", {defaultValue: "Cerrar"})}
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
        <View style={{
            backgroundColor: colors.card,
            borderRadius: 14, marginHorizontal: 20, marginBottom: 10, padding: 14,
            flexDirection: "row", alignItems: "center", gap: 12,
            borderWidth: 1, borderColor: colors.separator ?? "#F0F0F0",
            borderLeftWidth: 4, borderLeftColor: cfg.color,
        }}>
            <View style={{
                width: 46, height: 46, borderRadius: 23,
                backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                justifyContent: "center", alignItems: "center",
            }}>
                <Text style={{fontSize: 15, fontWeight: "700", color: cfg.color}}>{initials}</Text>
            </View>

            <View style={{flex: 1}}>
                <Text style={{fontSize: 15, fontWeight: "600", color: colors.text, marginBottom: 2}}>
                    {item.nombre}
                </Text>
                <Text style={{fontSize: 12, color: colors.textSecondary}}>
                    {item.materia} · <Text style={{color: colors.textMuted}}>{item.codigo_curso}</Text>
                </Text>
                <Text style={{fontSize: 11, color: colors.textMuted, marginTop: 2}}>
                    {item.fecha} · {item.estado !== "ausente" ? item.hora : "—"}
                </Text>
            </View>

            {/* LUPA CLICKEABLE PARA ABRIR MODAL */}
            <TouchableOpacity
                onPress={() => onInfo(item)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Image
                    source={require("../../assets/images/lupa.png")}
                    style={{width: 18, height: 18, tintColor: cfg.color}}
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
        <View style={{
            backgroundColor: colors.card,
            borderRadius: 14, marginHorizontal: 20, marginBottom: 10, padding: 14,
            borderWidth: 1, borderColor: colors.separator ?? "#F0F0F0",
        }}>
            <View
                style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10}}>
                <View style={{flexDirection: "row", alignItems: "center", gap: 6}}>
                    <Text style={{fontSize: 13, fontWeight: "700", color: colors.primary}}>{item.fecha}</Text>
                    {item.estado !== "ausente" && (
                        <Text style={{fontSize: 12, color: colors.textSecondary}}>· {item.hora}</Text>
                    )}
                </View>

                {/* LUPA CLICKEABLE PARA ABRIR MODAL */}
                <TouchableOpacity
                    onPress={() => onInfo(item)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: isDark ? cfg.darkBg : cfg.bg,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Image
                        source={require("../../assets/images/lupa2.png")}
                        style={{ width: 18, height: 18, tintColor: cfg.color }}
                    />
                </TouchableOpacity>
            </View>

            <View style={{
                flexDirection: "row", gap: 8,
                paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.separator ?? "#F0F0F0",
            }}>
                <View style={{flex: 1}}>
                    <Text style={{fontSize: 11, color: colors.textMuted, marginBottom: 2}}>
                        {t("attendance.subject", {defaultValue: "Materia"})}
                    </Text>
                    <Text style={{fontSize: 14, fontWeight: "600", color: colors.text}}>{item.materia}</Text>
                </View>
                <View style={{flex: 1}}>
                    <Text style={{fontSize: 11, color: colors.textMuted, marginBottom: 2}}>
                        {t("attendance.teacher", {defaultValue: "Docente"})}
                    </Text>
                    <Text style={{fontSize: 14, color: colors.text}}>{item.docente}</Text>
                </View>
                {hasJustification && (
                    <View style={{
                        alignSelf: "flex-end",
                        backgroundColor: isDark ? "#2E1065" : "#EDE9FE",
                        borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                        <Text style={{fontSize: 11, fontWeight: "700", color: "#8B5CF6"}}>
                            📋 {t("attendance.justified", {defaultValue: "Justificado"})}
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
        isAdmin,
        isDark,
        colors,
        refreshKey,
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
            style={[styles.safeArea, { backgroundColor: colors.background }]}
            key={`${refreshKey}-${updateKey}`}
        >
            <View style={{ flex: 1, backgroundColor: colors.background, marginTop: Platform.OS === "ios" ? 15 : 10 }}>
                <CustomTabs userRole={isAdmin ? "admin" : "student"} />

                {/* Filtros */}
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10, marginHorizontal: 20, marginTop: 20 }}>
                    {isAdmin && (
                        <View style={{ flex: 2, flexDirection: "row", alignItems: "center", backgroundColor: colors.inputBackground, borderWidth: 1.5, borderColor: searchText ? colors.primary : (colors.separator ?? "#E0E0E0"), borderRadius: 10, paddingHorizontal: 12 }}>
                            <TextInput
                                style={{ flex: 1, paddingVertical: 10, color: colors.text, fontSize: 14 }}
                                placeholder={t("attendance.searchByName", { defaultValue: "Buscar docente..." })}
                                placeholderTextColor={colors.textMuted}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                            {searchText ? (
                                <TouchableOpacity onPress={() => setSearchText("")}>
                                    <Text style={{ color: colors.danger, fontSize: 16, fontWeight: "700" }}>✕</Text>
                                </TouchableOpacity>
                            ) : (
                                <Image source={require("../../assets/images/lupa2.png")} style={{ width: 16, height: 16, tintColor: colors.textMuted }} />
                            )}
                        </View>
                    )}

                    <TouchableOpacity onPress={handleOpenPicker} style={{ flex: isAdmin ? 1.2 : 1, flexDirection: "row", alignItems: "center", backgroundColor: colors.inputBackground, borderWidth: 1.5, borderColor: selectedDate ? colors.primary : (colors.separator ?? "#E0E0E0"), borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 6 }}>
                        <Text style={{ fontSize: 15 }}>📅</Text>
                        <Text style={{ flex: 1, color: selectedDate ? colors.text : colors.textMuted, fontSize: 13 }} numberOfLines={1}>
                            {formatDateDisplay(selectedDate, t)}
                        </Text>
                        {selectedDate && (
                            <TouchableOpacity onPress={() => setSelectedDate(null)}>
                                <Text style={{ color: colors.danger, fontSize: 16, fontWeight: "700" }}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                {/* DateTimePicker Android */}
                {showPicker && Platform.OS === "android" && (
                    <DateTimePicker value={tempDate} mode="date" display="default" onChange={handleAndroidChange} maximumDate={new Date()} />
                )}

                {/* DateTimePicker iOS Modal */}
                <Modal transparent visible={showIOSModal} animationType="slide" onRequestClose={() => setShowIOSModal(false)}>
                    <TouchableOpacity activeOpacity={1} onPress={() => setShowIOSModal(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} />
                    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: 34 }}>
                        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.separator ?? "#E0E0E0", alignSelf: "center", marginBottom: 14 }} />
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                            <TouchableOpacity onPress={() => setShowIOSModal(false)}>
                                <Text style={{ color: colors.danger, fontSize: 16, fontWeight: "600" }}>{t("common.cancel")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setSelectedDate(tempDate); setShowIOSModal(false); }}>
                                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}>{t("common.accept")}</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker value={tempDate} mode="date" display="spinner" onChange={(_, date) => date && setTempDate(date)} maximumDate={new Date()} style={{ backgroundColor: colors.card }} textColor={colors.text} />
                    </View>
                </Modal>

                {/* Lista */}
                <FlatList
                    data={activeData}
                    keyExtractor={item => item.id.toString()}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
                    renderItem={({ item }) =>
                        isAdmin
                            ? <TeacherCard item={item} colors={colors} t={t} isDark={isDark} onInfo={openDetail} />
                            : <MyAttendanceCard item={item} colors={colors} t={t} isDark={isDark} onInfo={openDetail} />
                    }
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", paddingVertical: 50 }}>
                            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
                            <Text style={{ color: colors.textMuted, fontSize: 14, textAlign: "center" }}>
                                {t("attendance.noResults", { defaultValue: "Sin resultados para los filtros aplicados" })}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={<View style={{ paddingBottom: Platform.OS === "ios" ? 50 : 70 }} />}
                />
            </View>

            <BottomBar />

            {/* Modales */}
            {isAdmin ? (
                <TeacherDetailModal item={detailItem} visible={showDetailModal} onClose={closeDetail} colors={colors} t={t} isDark={isDark} />
            ) : (
                <StudentDetailModal item={detailItem} visible={showDetailModal} onClose={closeDetail} colors={colors} t={t} isDark={isDark} />
            )}
        </SafeAreaView>
    );
}