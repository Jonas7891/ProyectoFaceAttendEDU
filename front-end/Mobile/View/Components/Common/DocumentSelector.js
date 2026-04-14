import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { useTranslation } from 'react-i18next';

const documentosColombia = [
    { id: "cc", label: "Cédula de Ciudadanía (CC)", abreviatura: "CC" },
    { id: "ti", label: "Tarjeta de Identidad (TI)", abreviatura: "TI" },
    { id: "ce", label: "Cédula de Extranjería (CE)", abreviatura: "CE" }
];

export const DocumentSelector = ({ selectedDocument, onSelect }) => {
    const { t } = useTranslation();

    return (
        <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>{t('documentSelector.label')}</Text>
            <View style={styles.optionsContainer}>
                {documentosColombia.map((doc) => (
                    <TouchableOpacity
                        key={doc.id}
                        style={[
                            styles.option,
                            selectedDocument?.id === doc.id && styles.optionSelected
                        ]}
                        onPress={() => onSelect(doc)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.radioContainer}>
                            <View style={[
                                styles.radioOuter,
                                selectedDocument?.id === doc.id && styles.radioOuterSelected
                            ]}>
                                {selectedDocument?.id === doc.id && <View style={styles.radioInner} />}
                            </View>
                        </View>
                        <Text style={[
                            styles.optionText,
                            selectedDocument?.id === doc.id && styles.optionTextSelected
                        ]}>
                            {doc.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    selectorContainer: {
        marginBottom: 20,
    },
    selectorLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    optionsContainer: {
        gap: 10,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#F9F9F9",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    optionSelected: {
        backgroundColor: "#E3F2FD",
        borderColor: "#007AFF",
    },
    radioContainer: {
        marginRight: 12,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#999",
        justifyContent: "center",
        alignItems: "center",
    },
    radioOuterSelected: {
        borderColor: "#007AFF",
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#007AFF",
    },
    optionText: {
        fontSize: 14,
        color: "#555",
        flex: 1,
    },
    optionTextSelected: {
        color: "#007AFF",
        fontWeight: "500",
    },
});