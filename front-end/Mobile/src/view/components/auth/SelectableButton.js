import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import stylesAuth from './Style/Style';

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
                stylesauth.containerSelectable,
                disabled && stylesauth.containerDisabledSelectable,
            ]}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={[
                stylesauth.checkboxSelectable,
                isChecked && stylesauth.checkboxCheckedSelectable,
                disabled && stylesauth.checkboxDisabledSelectable
            ]}>
                {isChecked && <Text style={stylesauth.checkmarkSelectable}>✓</Text>}
            </View>
            <Text style={[
                stylesauth.textSelectable,
                disabled && stylesauth.textDisabledSelectable
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}