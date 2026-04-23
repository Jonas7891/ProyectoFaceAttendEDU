import React, { useState, useEffect } from "react";
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
import PrimaryButton from "../Components/Auth/PrimaryButton";
import styles from "./Style";

export default function AddValidJustificationScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const [type, setType] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [requiresDocument, setRequiresDocument] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleBack = () => {
        navigation.goBack();
    };
    
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

    const handleSave = async () => {
        if (!type.trim() || !description.trim() || !category.trim()) {
            Alert.alert(
                t('common.error'),
                t('admin.completeAllFields')
            );
            return;
        }

        try {
            const newJustification = {
                id: Date.now().toString(),
                type: type,
                description: description,
                category: category,
                requiresDocument: requiresDocument,
                createdAt: new Date().toISOString(),
            };

            // Obtener justificaciones existentes
            const stored = await AsyncStorage.getItem('validJustifications');
            let justifications = [];
            if (stored) {
                justifications = JSON.parse(stored);
            }

            // Agregar nueva justificación
            justifications.push(newJustification);

            // Guardar en AsyncStorage
            await AsyncStorage.setItem('validJustifications', JSON.stringify(justifications));

            Alert.alert(
                t('common.success'),
                t('admin.justificationCreated'),
                [
                    {
                        text: t('common.accept'),
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error al guardar:', error);
            Alert.alert(
                t('common.error'),
                t('admin.errorCreating')
            );
        }
    };

    const handleCancel = () => {
        if (type.trim() || description.trim() || category.trim()) {
            Alert.alert(
                t('common.confirm'),
                t('admin.confirmDiscard'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                        text: t('common.discard'),
                        style: 'destructive',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.safeAreaWhite}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.containerAddValidJustification}>
                        {/* Header */}
                        <View style={styles.headerContainer}>
                            <Text style={styles.mainTitle}>
                                {t('justify.title')} {"\n"}
                            </Text>
                        </View>

                        {/* Formulario */}
                        <View style={styles.formSection}>
                            {/* Seleccionar Categoría */}
                            <Text style={styles.inputLabel}>
                                {t('admin.category')} *
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.categoryScroll}
                            >
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryButton,
                                            category === cat.label && styles.categoryButtonActive,
                                        ]}
                                        onPress={() => setCategory(cat.label)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryButtonText,
                                                category === cat.label && styles.categoryButtonTextActive,
                                            ]}
                                        >
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Seleccionar Tipo */}
                            <Text style={styles.inputLabel}>
                                {t('admin.justificationType')} *
                            </Text>
                            <View style={styles.typeGrid}>
                                {types.map((t) => (
                                    <TouchableOpacity
                                        key={t.id}
                                        style={[
                                            styles.typeButton,
                                            type === t.label && styles.typeButtonActive,
                                        ]}
                                        onPress={() => setType(t.label)}
                                    >
                                        <Text
                                            style={[
                                                styles.typeButtonText,
                                                type === t.label && styles.typeButtonTextActive,
                                            ]}
                                        >
                                            {t.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Descripción */}
                            <Text style={styles.inputLabel}>
                                {t('admin.description')} *
                            </Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder={t('admin.descriptionPlaceholder')}
                                placeholderTextColor="#999"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                            {/* Requiere Documento */}
                            <Text style={styles.inputLabel}>
                                {t('admin.requiresDocument')}
                            </Text>
                            <View style={styles.toggleContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.toggleButton,
                                        requiresDocument && styles.toggleButtonActive,
                                    ]}
                                    onPress={() => setRequiresDocument(true)}
                                >
                                    <Text
                                        style={[
                                            styles.toggleButtonText,
                                            requiresDocument && styles.toggleButtonTextActive,
                                        ]}
                                    >
                                        {t('common.yes')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.toggleButton,
                                        !requiresDocument && styles.toggleButtonInactive,
                                    ]}
                                    onPress={() => setRequiresDocument(false)}
                                >
                                    <Text
                                        style={[
                                            styles.toggleButtonText,
                                            !requiresDocument && styles.toggleButtonTextInactive,
                                        ]}
                                    >
                                        {t('common.no')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Botones de acción */}
                        <View style={styles.actionButtonsContainer}>
                            <PrimaryButton
                                title={t('admin.saveJustification')}
                                onPress={handleSave}
                            />
                            
                            {/* Botón Volver secundario */}
                            <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
                                <Text style={styles.secondaryButtonText}>{t('common.back')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}