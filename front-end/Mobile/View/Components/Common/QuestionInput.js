import React, { forwardRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet
} from 'react-native';

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
                style={styles.questionInput}
                placeholder={placeholder}
                placeholderTextColor="#999"
                onChangeText={onChangeText}
                value={value}
                keyboardType={keyboardType}
                returnKeyType="done"
                blurOnSubmit={true}
            />
            {hint && (
                <Text style={styles.hintText}>
                    💡 {hint}
                </Text>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    questionInput: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: "#F9F9F9",
        marginBottom: 8,
    },
    hintText: {
        fontSize: 12,
        color: "#999",
        marginBottom: 20,
        fontStyle: "italic",
    },
});