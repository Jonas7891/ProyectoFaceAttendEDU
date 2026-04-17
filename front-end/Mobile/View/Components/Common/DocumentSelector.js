import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import stylesCommon from './Style/Style';

const documentosColombia = [
    { id: "cc", label: "Cédula de Ciudadanía (CC)", abreviatura: "CC" },
    { id: "ti", label: "Tarjeta de Identidad (TI)", abreviatura: "TI" },
    { id: "ce", label: "Cédula de Extranjería (CE)", abreviatura: "CE" }
];

export const DocumentSelector = ({ selectedDocument, onSelect }) => {
    const { t } = useTranslation();

    return (
        <View style={stylesCommon.selectorContainer}>
            <Text style={stylesCommon.selectorLabelSelector}>{t('documentSelector.label')}</Text>
            <View style={stylesCommon.optionsContainerSelector}>
                {documentosColombia.map((doc) => (
                    <TouchableOpacity
                        key={doc.id}
                        style={[
                            stylesCommon.optionSelector,
                            selectedDocument?.id === doc.id && stylesCommon.optionSelected
                        ]}
                        onPress={() => onSelect(doc)}
                        activeOpacity={0.7}
                    >
                        <View style={stylesCommon.radioContainerSelector}>
                            <View style={[
                                stylesCommon.radioOuterSelector,
                                selectedDocument?.id === doc.id && stylesCommon.radioOuterSelected
                            ]}>
                                {selectedDocument?.id === doc.id && <View style={stylesCommon.radioInnerSelector} />}
                            </View>
                        </View>
                        <Text style={[
                            stylesCommon.optionTextSelector,
                            selectedDocument?.id === doc.id && stylesCommon.optionTextSelected
                        ]}>
                            {doc.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};