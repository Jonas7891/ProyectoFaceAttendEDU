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
import { useTranslation } from 'react-i18next';

const facialChanges = [
    { id: "beard", label: "facialUpdate.beardChange" },
    { id: "hair", label: "facialUpdate.hairChange" },
    { id: "glasses", label: "facialUpdate.glasses" },
    { id: "weight", label: "facialUpdate.weightChange" },
    { id: "makeup", label: "facialUpdate.makeup" },
    { id: "expression", label: "facialUpdate.expression" }
];

export const FacialUpdateModal = ({ visible, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [selectedChange, setSelectedChange] = useState(null);

    const handleUpdate = () => {
        if (!selectedChange) {
            Alert.alert(t('facialUpdate.selectOption'), t('facialUpdate.selectOptionMessage'));
            return;
        }

        Alert.alert(
            t('facialUpdate.updateParams'),
            t('facialUpdate.confirmUpdate'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('facialUpdate.updateParams'),
                    onPress: () => {
                        Alert.alert(t('facialUpdate.success'), t('facialUpdate.paramsUpdated'));
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
                            <Text style={styles.modalTitle}>{t('facialUpdate.updateParams')}</Text>
                            <Text style={styles.modalSubtitle}>
                                {t('facialFail.updateParamsDescription')}
                            </Text>

                            <Text style={styles.selectLabel}>{t('facialUpdate.selectOption')}:</Text>

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
                                    <Text style={styles.changeLabel}>{t(change.label)}</Text>
                                </TouchableOpacity>
                            ))}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelModalButton]}
                                    onPress={onClose}
                                >
                                    <Text style={styles.cancelModalButtonText}>{t('common.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmModalButton]}
                                    onPress={handleUpdate}
                                >
                                    <Text style={styles.confirmModalButtonText}>{t('facialUpdate.updateParams')}</Text>
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