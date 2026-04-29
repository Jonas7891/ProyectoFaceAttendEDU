import React, { forwardRef } from 'react';
import {
    View,
    Text,
    TextInput,
} from 'react-native';
import { useTheme } from './ThemeContext';
import stylescommon from './style/Style';

export const QuestionInput = forwardRef(({ 
    placeholder, 
    value, 
    onChangeText, 
    keyboardType = "default",
    hint 
}, ref) => {
    const { colors, theme } = useTheme();

    return (
        <View>
            <TextInput
                ref={ref}
                style={[stylescommon.questionInput, { backgroundColor: colors.modalInputBackground, color: colors.modalInputText, borderColor: colors.modalBorder }]}
                placeholder={placeholder}
                placeholderTextColor={colors.modalInputPlaceholder}
                onChangeText={onChangeText}
                value={value}
                keyboardType={keyboardType}
                returnKeyType="done"
                blurOnSubmit={true}
            />
            {hint && (
                <Text style={[stylescommon.hintText, { color: colors.modalTextSecondary }]}>
                    💡 {hint}
                </Text>
            )}
        </View>
    );
});