import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import stylesCommon from './Style/Style';

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
    const { t } = useTranslation();

    return (
        <View style={stylesCommon.rhSelectorContainer}>
            <Text style={stylesCommon.rhSelectorLabel}>{t('rhSelector.label')}</Text>
            <View style={stylesCommon.rhGridContainer}>
                {tiposRH.map((rh) => (
                    <TouchableOpacity
                        key={rh.id}
                        style={[
                            stylesCommon.rhOption,
                            selectedRH?.id === rh.id && stylesCommon.rhOptionSelected
                        ]}
                        onPress={() => onSelect(rh)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            stylesCommon.rhOptionText,
                            selectedRH?.id === rh.id && stylesCommon.rhOptionTextSelected
                        ]}>
                            {rh.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};