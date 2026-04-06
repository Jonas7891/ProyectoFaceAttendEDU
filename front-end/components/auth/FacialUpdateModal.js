import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Alert,
    StyleSheet
} from 'react-native';

const facialChanges = [
    { id: "beard", label: "Cambio de barba/bigote" },
    { id: "hair", label: "Cambio de peinado" },
    { id: "glasses", label: "Uso de gafas" },
    { id: "weight", label: "Cambio de peso significativo" },
    { id: "makeup", label: "Maquillaje diferente" },
    { id: "expression", label: "Expresión facial diferente" }
];

export const FacialUpdateModal = ({ visible, onClose, onSuccess }) => {
    const [selectedChange, setSelectedChange] = useState(null);

    const handleUpdate = () => {
        if (!selectedChange) {
            Alert.alert("Selecciona una opción", "Por favor selecciona qué cambio has tenido en tu rostro");
            return;
        }

        Alert.alert(
            "Actualizar Parámetros",
            "¿Estás seguro de que deseas actualizar tus parámetros faciales?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Actualizar",
                    onPress: () => {
                        Alert.alert("Éxito", "Tus parámetros faciales han sido actualizados");
                        onSuccess();
                        onClose();
                        setSelectedChange(null);
                    }
                }
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Actualizaciones de Parámetros Faciales</Text>
                            <Text style={styles.modalSubtitle}>
                                Muchas ocasiones el Reconocimiento Facial puede fallar por cierta modificación en el rostro de un usuario
                            </Text>

                            <Text style={styles.selectLabel}>Selecciona el cambio que has tenido:</Text>

                            {facialChanges.map((change) => (
                                <TouchableOpacity
                                    key={change.id}
                                    style={[
                                        styles.changeOption,
                                        selectedChange === change.id && styles.changeOptionSelected
                                    ]}
                                    onPress={() => setSelectedChange(change.id)}
                                >
                                    <View style={styles.radioCircle}>
                                        {selectedChange === change.id && <View style={styles.radioSelected} />}
                                    </View>
                                    <Text style={styles.changeLabel}>{change.label}</Text>
                                </TouchableOpacity>
                            ))}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelModalButton]}
                                    onPress={onClose}
                                >
                                    <Text style={styles.cancelModalButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmModalButton]}
                                    onPress={handleUpdate}
                                >
                                    <Text style={styles.confirmModalButtonText}>Actualizar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#FFF",
        borderRadius: 15,
        padding: 20,
        width: "90%",
        maxWidth: 400,
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 10,
        textAlign: "center",
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
        fontStyle: "italic",
    },
    selectLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 15,
    },
    changeOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        backgroundColor: "#FFF",
    },
    changeOptionSelected: {
        borderColor: "#007AFF",
        backgroundColor: "#F0F8FF",
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#007AFF",
        marginRight: 12,
        justifyContent: "center",
        alignItems: "center",
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#007AFF",
    },
    changeLabel: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelModalButton: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    cancelModalButtonText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "600",
    },
    confirmModalButton: {
        backgroundColor: "#007AFF",
    },
    confirmModalButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
});