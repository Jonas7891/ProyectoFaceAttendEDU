import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import stylesCommon from './Style/Style';

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
                <View style={stylesCommon.facialModalOverlay}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={stylesCommon.facialModalContainer}>
                            <Text style={stylesCommon.facialModalTitle}>{t('facialUpdate.updateParams')}</Text>
                            <Text style={stylesCommon.facialModalSubtitle}>
                                {t('facialFail.updateParamsDescription')}
                            </Text>

                            <Text style={stylesCommon.facialSelectLabel}>{t('facialUpdate.selectOption')}:</Text>

                            {facialChanges.map((change) => (
                                <TouchableOpacity
                                    key={change.id}
                                    style={[
                                        stylesCommon.facialChangeOption,
                                        selectedChange === change.id && stylesCommon.facialChangeOptionSelected
                                    ]}
                                    onPress={() => setSelectedChange(change.id)}
                                >
                                    <View style={stylesCommon.facialRadioCircle}>
                                        {selectedChange === change.id && <View style={stylesCommon.facialRadioSelected} />}
                                    </View>
                                    <Text style={stylesCommon.facialChangeLabel}>{t(change.label)}</Text>
                                </TouchableOpacity>
                            ))}

                            <View style={stylesCommon.facialModalButtons}>
                                <TouchableOpacity
                                    style={[stylesCommon.facialModalButton, stylesCommon.facialCancelModalButton]}
                                    onPress={onClose}
                                >
                                    <Text style={stylesCommon.facialCancelModalButtonText}>{t('common.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[stylesCommon.facialModalButton, stylesCommon.facialConfirmModalButton]}
                                    onPress={handleUpdate}
                                >
                                    <Text style={stylesCommon.facialConfirmModalButtonText}>{t('facialUpdate.updateParams')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};