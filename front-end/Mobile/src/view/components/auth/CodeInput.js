import React, { useEffect, useRef } from 'react';
import { Animated, View, TextInput } from 'react-native';
import styleAuth from './style/Style';

/**
 * Componente de input de código con 6 cajitas separadas
 */
export function CodeInput({
                              value,
                              onChange,
                              error,
                              colors,
                              codeRefs,
                              onVerify,
                              disabled
                          }) {
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (error) {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        }
    }, [error, shakeAnim]);

    const handleChange = (text, index) => {
        const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

        // Detección de paste
        if (cleaned.length > 1) {
            const chars = cleaned.slice(0, 6).split('');
            const newCode = chars.join('').padEnd(6, ' ').trimEnd();
            onChange(newCode);

            const lastIndex = Math.min(chars.length, 5);
            setTimeout(() => codeRefs[lastIndex]?.current?.focus(), 50);

            if (chars.length === 6) {
                setTimeout(() => onVerify(), 100);
            }
            return;
        }

        const newValue = value.split('');
        newValue[index] = cleaned[0] || '';
        const newCode = newValue.join('');
        onChange(newCode);

        if (cleaned && index < 5) {
            setTimeout(() => codeRefs[index + 1]?.current?.focus(), 0);
        }

        if (newCode.replace(/ /g, '').length === 6) {
            setTimeout(() => onVerify(), 100);
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
            codeRefs[index - 1]?.current?.focus();
        }
    };

    return (
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <View style={styleAuth.codeInputRow}>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const hasValue = !!value[i];

                    return (
                        <TextInput
                            key={i}
                            ref={codeRefs[i]}
                            style={[
                                styleAuth.codeDigit,
                                {
                                    backgroundColor: colors.inputBackground,
                                    borderColor: error
                                        ? (colors.error ?? '#E53E3E')
                                        : hasValue
                                            ? (colors.primary ?? '#3B82F6')
                                            : (colors.border ?? colors.separator),
                                    color: colors.text,
                                    borderWidth: 2,
                                },
                            ]}
                            value={value[i] || ''}
                            onChangeText={(text) => handleChange(text, i)}
                            onKeyPress={(e) => handleKeyPress(e, i)}
                            maxLength={1}
                            keyboardType="default"
                            autoCapitalize="characters"
                            selectTextOnFocus
                            editable={!disabled}
                            accessibilityLabel={`Dígito ${i + 1} de 6`}
                            accessibilityHint={i === 0 ? 'Ingresa el código de 6 caracteres' : ''}
                        />
                    );
                })}
            </View>
        </Animated.View>
    );
}