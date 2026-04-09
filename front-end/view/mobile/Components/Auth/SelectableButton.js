import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

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
                styles.container,
                disabled && styles.containerDisabled,
            ]}
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <View style={[
                styles.checkbox,
                isChecked && styles.checkboxChecked,
                disabled && styles.checkboxDisabled
            ]}>
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[
                styles.text,
                disabled && styles.textDisabled
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 10,
        alignSelf: 'center',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#1081D2',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: '#1081D2',
    },
    checkboxDisabled: {
        opacity: 0.5,
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    text: {
        color: '#333333',
        fontSize: 16,
        fontWeight: '500',
    },
    textDisabled: {
        opacity: 0.5,
    },
    containerDisabled: {
        opacity: 0.6,
    },
});