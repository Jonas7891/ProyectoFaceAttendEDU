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
import { useTheme } from './ThemeContext';
import stylescommon from './style/Style';

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
    const { colors } = useTheme();
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
                <View style={[stylescommon.facialModalOverlay, { backgroundColor: colors.modalOverlay }]}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={[stylescommon.facialModalContainer, { backgroundColor: colors.modalBackground }]}>
                            <Text style={[stylescommon.facialModalTitle, { color: colors.modalText }]}>{t('facialUpdate.updateParams')}</Text>
                            <Text style={[stylescommon.facialModalSubtitle, { color: colors.modalTextSecondary }]}>
                                {t('facialFail.updateParamsDescription')}
                            </Text>

                            <Text style={[stylescommon.facialSelectLabel, { color: colors.modalText }]}>{t('facialUpdate.selectOption')}:</Text>

                            {facialChanges.map((change) => (
                                <TouchableOpacity
                                    key={change.id}
                                    style={[
                                        stylescommon.facialChangeOption,
                                        selectedChange === change.id && stylescommon.facialChangeOptionSelected,
                                        { backgroundColor: selectedChange === change.id ? colors.modalOptionSelected : colors.modalBackground, borderColor: selectedChange === change.id ? colors.modalOptionBorder : colors.modalBorder }
                                    ]}
                                    onPress={() => setSelectedChange(change.id)}
                                >
                                    <View style={[stylescommon.facialRadioCircle, { borderColor: selectedChange === change.id ? colors.modalRadioSelected : colors.modalRadioBorder }]}>
                                        {selectedChange === change.id && <View style={[stylescommon.facialRadioSelected, { backgroundColor: colors.modalRadioSelected }]} />}
                                    </View>
                                    <Text style={[stylescommon.facialChangeLabel, { color: colors.modalText }]}>{t(change.label)}</Text>
                                </TouchableOpacity>
                            ))}

                            <View style={stylescommon.facialModalButtons}>
                                <TouchableOpacity
                                    style={[stylescommon.facialModalButton, stylescommon.facialCancelModalButton, { backgroundColor: colors.modalButtonSecondary, borderColor: colors.modalBorder }]}
                                    onPress={onClose}
                                >
                                    <Text style={[stylescommon.facialCancelModalButtonText, { color: colors.modalButtonSecondaryText }]}>{t('common.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[stylescommon.facialModalButton, stylescommon.facialConfirmModalButton, { backgroundColor: colors.modalButton }]}
                                    onPress={handleUpdate}
                                >
                                    <Text style={[stylescommon.facialConfirmModalButtonText, { color: colors.modalButtonText }]}>{t('facialUpdate.updateParams')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};