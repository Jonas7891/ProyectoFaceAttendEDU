import React from 'react';
import {Text, TouchableOpacity, View,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useTheme} from './ThemeContext';
import stylescommon from './style/Style';

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
    const { colors } = useTheme();

    return (
        <View style={stylescommon.rhSelectorContainer}>
            <View style={stylescommon.rhGridContainer}>
                {tiposRH.map((rh) => (
                    <TouchableOpacity
                        key={rh.id}
                        style={[
                            stylescommon.rhOption,
                            selectedRH?.id === rh.id && stylescommon.rhOptionSelected,
                            { backgroundColor: selectedRH?.id === rh.id ? colors.modalButton : colors.modalInputBackground, borderColor: colors.modalBorder }
                        ]}
                        onPress={() => onSelect(rh)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            stylescommon.rhOptionText,
                            selectedRH?.id === rh.id && stylescommon.rhOptionTextSelected,
                            { color: selectedRH?.id === rh.id ? colors.modalButtonText : colors.modalInputText }
                        ]}>
                            {rh.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};