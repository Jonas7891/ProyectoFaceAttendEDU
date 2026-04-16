import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import stylesAuth from './Style/Style'

export default function PrimaryButton({
    title,
    onPress = () => { },
    disabled = false,
    checked = false,
    onCheckChange = null,
}) {
    const [isChecked, setIsChecked] = useState(checked);

    const handlePress = () => {
        if (disabled) return;

        const newCheckedState = !isChecked;
        setIsChecked(newCheckedState);

        if (onCheckChange) {
            onCheckChange(newCheckedState);
        }

        onPress();
    };

    return (
        <TouchableOpacity
            style={[
                stylesAuth.containerSelectable,
                disabled && stylesAuth.containerDisabledSelectable,
            ]}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={[
                stylesAuth.checkboxSelectable,
                isChecked && stylesAuth.checkboxCheckedSelectable,
                disabled && stylesAuth.checkboxDisabledSelectable
            ]}>
                {isChecked && <Text style={stylesAuth.checkmarkSelectable}>✓</Text>}
            </View>
            <Text style={[
                stylesAuth.textSelectable,
                disabled && stylesAuth.textDisabledSelectable
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}