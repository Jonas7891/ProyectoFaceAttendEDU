import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';
import stylescommon from './style/Style';

const documentosColombia = [
    { id: "cc", label: "Cédula de Ciudadanía (CC)", abreviatura: "CC" },
    { id: "ti", label: "Tarjeta de Identidad (TI)", abreviatura: "TI" },
    { id: "ce", label: "Cédula de Extranjería (CE)", abreviatura: "CE" }
];

export const DocumentSelector = ({ selectedDocument, onSelect }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();

    return (
        <View style={stylescommon.selectorContainer}>
            <Text style={[stylescommon.selectorLabelSelector, { color: colors.modalText }]}>{t('documentSelector.label')}</Text>
            <View style={stylescommon.optionsContainerSelector}>
                {documentosColombia.map((doc) => (
                    <TouchableOpacity
                        key={doc.id}
                        style={[
                            stylescommon.optionSelector,
                            selectedDocument?.id === doc.id && stylescommon.optionSelected,
                            { backgroundColor: selectedDocument?.id === doc.id ? colors.modalOptionSelected : colors.modalInputBackground, borderColor: selectedDocument?.id === doc.id ? colors.modalOptionBorder : colors.modalBorder }
                        ]}
                        onPress={() => onSelect(doc)}
                        activeOpacity={0.7}
                    >
                        <View style={stylescommon.radioContainerSelector}>
                            <View style={[
                                stylescommon.radioOuterSelector,
                                selectedDocument?.id === doc.id && stylescommon.radioOuterSelected,
                                { borderColor: selectedDocument?.id === doc.id ? colors.modalRadioSelected : colors.modalRadioBorder }
                            ]}>
                                {selectedDocument?.id === doc.id && <View style={[stylescommon.radioInnerSelector, { backgroundColor: colors.modalRadioSelected }]} />}
                            </View>
                        </View>
                        <Text style={[
                            stylescommon.optionTextSelector,
                            selectedDocument?.id === doc.id && stylescommon.optionTextSelected,
                            { color: selectedDocument?.id === doc.id ? colors.modalOptionBorder : colors.modalInputText }
                        ]}>
                            {doc.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};