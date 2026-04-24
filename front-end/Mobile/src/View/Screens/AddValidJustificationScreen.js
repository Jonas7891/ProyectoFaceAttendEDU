import React, { useState } from "react";
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
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrimaryButton from "../components/auth/PrimaryButton";
import { useTheme } from "../components/common/ThemeContext"; // 🔥
import styles from "./Style";

export default function AddValidJustificationScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { colors } = useTheme(); // 🔥

    const [type, setType] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [requiresDocument, setRequiresDocument] = useState(true);

    const categories = [
        { id: "salud", label: t('admin.categoryHealth') },
        { id: "familiar", label: t('admin.categoryFamily') },
        { id: "legal", label: t('admin.categoryLegal') },
        { id: "academica", label: t('admin.categoryAcademic') },
        { id: "otro", label: t('admin.categoryOther') },
    ];

    const types = [
        { id: "medica", label: t('admin.typeMedical') },
        { id: "familiar", label: t('admin.typeFamily') },
        { id: "personal", label: t('admin.typePersonal') },
        { id: "academica", label: t('admin.typeAcademic') },
        { id: "laboral", label: t('admin.typeWork') },
        { id: "otro", label: t('admin.typeOther') },
    ];

    const handleBack = () => navigation.goBack();

    const handleSave = async () => {
        if (!type.trim() || !description.trim() || !category.trim()) {
            Alert.alert(t('common.error'), t('admin.completeAllFields'));
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

            const stored = await AsyncStorage.getItem('validJustifications');
            let justifications = stored ? JSON.parse(stored) : [];

            justifications.push(newJustification);

            await AsyncStorage.setItem('validJustifications', JSON.stringify(justifications));

            Alert.alert(t('common.success'), t('admin.justificationCreated'), [
                { text: t('common.accept'), onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert(t('common.error'), t('admin.errorCreating'));
        }
    };

    return (
        <SafeAreaView style={[styles.safeAreaWhite, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardview}
            >
                <ScrollView
                    style={styles.ScrollView}
                    contentContainerstyle={styles.ScrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.containerAddValidJustification}>

                        {/* TITULO */}
                        <Text style={[styles.mainTitle, { color: colors.text }]}>
                            {t('justify.title')}
                        </Text>

                        {/* CATEGORÍA */}
                        <Text style={[styles.inputLabel, { color: colors.text, marginTop: 30 }]}>
                            {t('admin.category')} *
                        </Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryButton,
                                        {
                                            backgroundColor:
                                                category === cat.label ? colors.primary : colors.card,
                                            borderColor: colors.border
                                        }
                                    ]}
                                    onPress={() => setCategory(cat.label)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryButtonText,
                                            {
                                                color:
                                                    category === cat.label ? "#fff" : colors.text
                                            }
                                        ]}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* TIPO */}
                        <Text style={[styles.inputLabel, { color: colors.text, marginTop: 30 }]}>
                            {t('admin.justificationType')} *
                        </Text>

                        <View style={styles.typeGrid}>
                            {types.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.typeButton,
                                        {
                                            backgroundColor:
                                                type === item.label ? colors.primary : colors.card,
                                            borderColor: colors.border
                                        }
                                    ]}
                                    onPress={() => setType(item.label)}
                                >
                                    <Text
                                        style={[
                                            styles.typeButtonText,
                                            {
                                                color:
                                                    type === item.label ? "#fff" : colors.text
                                            }
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* DESCRIPCIÓN */}
                        <Text style={[styles.inputLabel, { color: colors.text, marginTop: 15 }]}>
                            {t('admin.description')} *
                        </Text>

                        <TextInput
                            style={[
                                styles.textInput,
                                styles.textArea,
                                {
                                    backgroundColor: colors.inputBackground,
                                    color: colors.text,
                                    borderColor: colors.border
                                }
                            ]}
                            placeholder={t('admin.descriptionPlaceholder')}
                            placeholderTextColor={colors.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />

                        {/* TOGGLE */}
                        <Text style={[styles.inputLabel, { color: colors.text, marginTop: 10 }]}>
                            {t('admin.requiresDocument')}
                        </Text>

                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    {
                                        backgroundColor: requiresDocument ? colors.primary : colors.card, marginRight: 5
                                    }
                                ]}
                                onPress={() => setRequiresDocument(true)}
                            >
                                <Text style={{ color: requiresDocument ? "#fff" : colors.text }}>
                                    {t('common.yes')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    {
                                        backgroundColor: !requiresDocument ? colors.primary : colors.card, marginLeft: 5
                                    }
                                ]}
                                onPress={() => setRequiresDocument(false)}
                            >
                                <Text style={{ color: !requiresDocument ? "#fff" : colors.text }}>
                                    {t('common.no')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* BOTONES */}
                        <View style={styles.actionButtonsContainer}>
                            <PrimaryButton
                                title={t('admin.saveJustification')}
                                onPress={handleSave}
                            />

                            <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
                                <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
                                    {t('common.back')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}