import React, {useState} from "react";
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    Alert,
    KeyboardAvoidingView,
    Modal,
    FlatList,
} from "react-native";
import {useTranslation} from "react-i18next";
import {useNavigation} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PrimaryButton from "../components/auth/PrimaryButton";
import {useTheme} from "../components/common/ThemeContext";
import styles from "./Style";

// ─── Selector desplegable reutilizable ─────────────────────────────────────────
function DropdownSelector({label, placeholder, value, options, onSelect, colors}) {
    const [visible, setVisible] = useState(false);

    return (
        <>
            {/* Campo selector */}
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setVisible(true)}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: colors.inputBackground,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderWidth: 1.5,
                    borderColor: value ? colors.primary : colors.border ?? "#E0E0E0",
                    marginBottom: 4,
                }}
            >
                <Text
                    style={{
                        fontSize: 15,
                        color: value ? colors.text : colors.textMuted,
                        flex: 1,
                    }}
                >
                    {value || placeholder}
                </Text>
                <Text style={{fontSize: 18, color: colors.primary}}>›</Text>
            </TouchableOpacity>

            {/* Modal bottom-sheet */}
            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={() => setVisible(false)}
            >
                {/* Overlay oscuro */}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                    style={{flex: 1, backgroundColor: "rgba(0,0,0,0.45)"}}
                />

                {/* Panel inferior */}
                <View
                    style={{
                        backgroundColor: colors.background,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        paddingTop: 12,
                        paddingBottom: Platform.OS === "ios" ? 36 : 24,
                        maxHeight: "70%",
                        // Posición fija en la parte inferior
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    {/* Handle bar */}
                    <View
                        style={{
                            width: 40,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: colors.border ?? "#E0E0E0",
                            alignSelf: "center",
                            marginBottom: 16,
                        }}
                    />

                    {/* Título del panel */}
                    <Text
                        style={{
                            fontSize: 17,
                            fontWeight: "700",
                            color: colors.text,
                            paddingHorizontal: 24,
                            marginBottom: 16,
                        }}
                    >
                        {label}
                    </Text>

                    {/* Lista de opciones */}
                    <FlatList
                        data={options}
                        keyExtractor={(item) => item.id}
                        ItemSeparatorComponent={() => (
                            <View
                                style={{
                                    height: 1,
                                    backgroundColor: colors.border ?? "#F0F0F0",
                                    marginHorizontal: 24,
                                }}
                            />
                        )}
                        renderItem={({item}) => {
                            const isSelected = value === item.label;
                            return (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        onSelect(item.label);
                                        setVisible(false);
                                    }}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 24,
                                        paddingVertical: 16,
                                        backgroundColor: isSelected
                                            ? colors.primary + "15"
                                            : "transparent",
                                    }}
                                >
                                    {/* Ícono de la opción */}
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: isSelected
                                                ? colors.primary
                                                : colors.card ?? "#F5F5F5",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            marginRight: 14,
                                        }}
                                    >
                                        <Text style={{fontSize: 18}}>{item.icon}</Text>
                                    </View>

                                    {/* Texto */}
                                    <View style={{flex: 1}}>
                                        <Text
                                            style={{
                                                fontSize: 15,
                                                fontWeight: isSelected ? "700" : "500",
                                                color: isSelected ? colors.primary : colors.text,
                                            }}
                                        >
                                            {item.label}
                                        </Text>
                                        {item.description ? (
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    color: colors.textMuted,
                                                    marginTop: 2,
                                                }}
                                            >
                                                {item.description}
                                            </Text>
                                        ) : null}
                                    </View>

                                    {/* Checkmark */}
                                    {isSelected && (
                                        <Text
                                            style={{
                                                fontSize: 18,
                                                color: colors.primary,
                                                fontWeight: "700",
                                            }}
                                        >
                                            ✓
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </Modal>
        </>
    );
}

// ─── Pantalla principal ─────────────────────────────────────────────────────────
export default function AddValidJustificationScreen() {
    const navigation = useNavigation();
    const {t} = useTranslation();
    const {colors} = useTheme();

    const [type, setType] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [requiresDocument, setRequiresDocument] = useState(true);

    // ── Categorías con ícono y descripción ────────────────────────────────────
    const categories = [
        {
            id: "salud",
            label: t("admin.categoryHealth"),
            icon: "🏥",
            description: t("admin.categoryHealthDesc") ?? "Incapacidades y citas médicas",
        },
        {
            id: "familiar",
            label: t("admin.categoryFamily"),
            icon: "👨‍👩‍👧",
            description: t("admin.categoryFamilyDesc") ?? "Situaciones de carácter familiar",
        },
        {
            id: "legal",
            label: t("admin.categoryLegal"),
            icon: "⚖️",
            description: t("admin.categoryLegalDesc") ?? "Diligencias judiciales o legales",
        },
        {
            id: "academica",
            label: t("admin.categoryAcademic"),
            icon: "🎓",
            description: t("admin.categoryAcademicDesc") ?? "Actividades académicas externas",
        },
        {
            id: "otro",
            label: t("admin.categoryOther"),
            icon: "📋",
            description: t("admin.categoryOtherDesc") ?? "Otros motivos justificados",
        },
    ];

    // ── Tipos con ícono y descripción ─────────────────────────────────────────
    const types = [
        {
            id: "medica",
            label: t("admin.typeMedical"),
            icon: "💊",
            description: t("admin.typeMedicalDesc") ?? "Consulta, cirugía o incapacidad",
        },
        {
            id: "familiar",
            label: t("admin.typeFamily"),
            icon: "🏠",
            description: t("admin.typeFamilyDesc") ?? "Fallecimiento o calamidad familiar",
        },
        {
            id: "personal",
            label: t("admin.typePersonal"),
            icon: "👤",
            description: t("admin.typePersonalDesc") ?? "Asunto personal de fuerza mayor",
        },
        {
            id: "academica",
            label: t("admin.typeAcademic"),
            icon: "📚",
            description: t("admin.typeAcademicDesc") ?? "Evento, congreso o representación",
        },
        {
            id: "laboral",
            label: t("admin.typeWork"),
            icon: "💼",
            description: t("admin.typeWorkDesc") ?? "Comisión o actividad laboral",
        },
        {
            id: "otro",
            label: t("admin.typeOther"),
            icon: "📝",
            description: t("admin.typeOtherDesc") ?? "Otro tipo de justificación",
        },
    ];

    const handleBack = () => navigation.goBack();

    const handleSave = async () => {
        if (!type.trim() || !description.trim() || !category.trim()) {
            Alert.alert(t("common.error"), t("admin.completeAllFields"));
            return;
        }

        try {
            const newJustification = {
                id: Date.now().toString(),
                type,
                description,
                category,
                requiresDocument,
                createdAt: new Date().toISOString(),
            };

            const stored = await AsyncStorage.getItem("validJustifications");
            const justifications = stored ? JSON.parse(stored) : [];
            justifications.push(newJustification);
            await AsyncStorage.setItem("validJustifications", JSON.stringify(justifications));

            Alert.alert(t("common.success"), t("admin.justificationCreated"), [
                {text: t("common.accept"), onPress: () => navigation.goBack()},
            ]);
        } catch (error) {
            Alert.alert(t("common.error"), t("admin.errorCreating"));
        }
    };

    // ── Resumen de lo seleccionado ─────────────────────────────────────────────
    const selectedCategory = categories.find((c) => c.label === category);
    const selectedType = types.find((tp) => tp.label === type);

    return (
        <SafeAreaView style={[styles.safeAreaWhite, {backgroundColor: colors.background}]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardview}
            >
                <ScrollView
                    style={styles.ScrollView}
                    contentContainerStyle={styles.ScrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.containerAddValidJustification}>

                        {/* ── Encabezado ───────────────────────────────────────── */}
                        <Text style={[styles.mainTitle, {color: colors.text}]}>
                            {t("justify.title")}
                        </Text>

                        {/* ── Tarjeta de resumen (aparece cuando ambos están seleccionados) ── */}
                        {selectedCategory && selectedType && (
                            <View
                                style={{
                                    backgroundColor: colors.primary + "12",
                                    borderRadius: 14,
                                    padding: 16,
                                    marginTop: 16,
                                    marginBottom: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                    borderWidth: 1,
                                    borderColor: colors.primary + "30",
                                }}
                            >
                                <Text style={{fontSize: 32}}>{selectedType.icon}</Text>
                                <View style={{flex: 1}}>
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            color: colors.textMuted,
                                            marginBottom: 2,
                                        }}
                                    >
                                        {selectedCategory.icon}{"  "}{selectedCategory.label}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 15,
                                            fontWeight: "700",
                                            color: colors.primary,
                                        }}
                                    >
                                        {selectedType.label}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* ── Selector de categoría ────────────────────────────── */}
                        <Text style={[styles.inputLabel, {color: colors.text, marginTop: 24}]}>
                            {t("admin.category")} *
                        </Text>
                        <DropdownSelector
                            label={t("admin.category")}
                            placeholder={t("admin.selectCategory") ?? "Selecciona una categoría..."}
                            value={category}
                            options={categories}
                            onSelect={setCategory}
                            colors={colors}
                        />

                        {/* ── Selector de tipo ─────────────────────────────────── */}
                        <Text style={[styles.inputLabel, {color: colors.text, marginTop: 20}]}>
                            {t("admin.justificationType")} *
                        </Text>
                        <DropdownSelector
                            label={t("admin.justificationType")}
                            placeholder={t("admin.selectType") ?? "Selecciona un tipo..."}
                            value={type}
                            options={types}
                            onSelect={setType}
                            colors={colors}
                        />

                        {/* ── Descripción ──────────────────────────────────────── */}
                        <Text style={[styles.inputLabel, {color: colors.text, marginTop: 20}]}>
                            {t("admin.description")} *
                        </Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                styles.textArea,
                                {
                                    backgroundColor: colors.inputBackground,
                                    color: colors.text,
                                    borderColor: description
                                        ? colors.primary
                                        : colors.border ?? "#E0E0E0",
                                    borderWidth: 1.5,
                                },
                            ]}
                            placeholder={t("admin.descriptionPlaceholder")}
                            placeholderTextColor={colors.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        {/* ── Toggle ¿Requiere documento? ──────────────────────── */}
                        <Text style={[styles.inputLabel, {color: colors.text, marginTop: 4}]}>
                            {t("admin.requiresDocument")}
                        </Text>

                        <View
                            style={{
                                flexDirection: "row",
                                gap: 10,
                                marginBottom: 8,
                            }}
                        >
                            {/* Opción SÍ */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setRequiresDocument(true)}
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    borderWidth: 1.5,
                                    borderColor: requiresDocument
                                        ? colors.primary
                                        : colors.border ?? "#E0E0E0",
                                    backgroundColor: requiresDocument
                                        ? colors.primary
                                        : colors.inputBackground,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: "600",
                                        color: requiresDocument ? "#fff" : colors.text,
                                    }}
                                >
                                    {t("common.yes")}
                                </Text>
                            </TouchableOpacity>

                            {/* Opción NO */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => setRequiresDocument(false)}
                                style={{
                                    flex: 1,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    borderWidth: 1.5,
                                    borderColor: !requiresDocument
                                        ? colors.primary
                                        : colors.border ?? "#E0E0E0",
                                    backgroundColor: !requiresDocument
                                        ? colors.primary
                                        : colors.inputBackground,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: "600",
                                        color: !requiresDocument ? "#fff" : colors.text,
                                    }}
                                >
                                    {t("common.no")}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── Botones de acción ────────────────────────────────── */}
                        <View style={styles.actionButtonsContainer}>
                            <PrimaryButton
                                title={t("admin.saveJustification")}
                                onPress={handleSave}
                            />
                            <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
                                <Text
                                    style={[
                                        styles.secondaryButtonText,
                                        {color: colors.textSecondary},
                                    ]}
                                >
                                    {t("common.back")}
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}