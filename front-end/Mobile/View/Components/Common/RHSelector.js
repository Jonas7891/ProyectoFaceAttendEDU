import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';

const tiposRH = [
    { id: "a+", label: "A+" },
    { id: "a-", label: "A-" },
    { id: "b+", label: "B+" },
    { id: "b-", label: "B-" },
    { id: "ab+", label: "AB+" },
    { id: "ab-", label: "AB-" },
    { id: "o+", label: "O+" },
    { id: "o-", label: "O-" }
];

export const RHSelector = ({ selectedRH, onSelect }) => {
    return (
        <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Selecciona tu tipo de RH:</Text>
            <View style={styles.rhGridContainer}>
                {tiposRH.map((rh) => (
                    <TouchableOpacity
                        key={rh.id}
                        style={[
                            styles.rhOption,
                            selectedRH?.id === rh.id && styles.rhOptionSelected
                        ]}
                        onPress={() => onSelect(rh)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.rhOptionText,
                            selectedRH?.id === rh.id && styles.rhOptionTextSelected
                        ]}>
                            {rh.label}
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
    rhGridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 10,
    },
    rhOption: {
        width: "23%",
        backgroundColor: "#F9F9F9",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    rhOptionSelected: {
        backgroundColor: "#007AFF",
        borderColor: "#007AFF",
    },
    rhOptionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    rhOptionTextSelected: {
        color: "#FFF",
    },
});