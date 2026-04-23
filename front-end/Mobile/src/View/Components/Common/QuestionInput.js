import React, { forwardRef } from 'react';
import {
    View,
    Text,
    TextInput,
} from 'react-native';
import stylesCommon from './Style/Style';

export const QuestionInput = forwardRef(({ 
    placeholder, 
    value, 
    onChangeText, 
    keyboardType = "default",
    hint 
}, ref) => {
    return (
        <View>
            <TextInput
                ref={ref}
                style={stylesCommon.questionInput}
                placeholder={placeholder}
                placeholderTextColor="#999"
                onChangeText={onChangeText}
                value={value}
                keyboardType={keyboardType}
                returnKeyType="done"
                blurOnSubmit={true}
            />
            {hint && (
                <Text style={stylesCommon.hintText}>
                    💡 {hint}
                </Text>
            )}
        </View>
    );
});