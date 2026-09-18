import React, { useEffect, useRef } from 'react';
import { Animated, View, Text } from 'react-native';
import styleAuth from './style/Style';

/**
 * Componente de requisito de contraseña con animación
 */
export function PasswordRequirement({ met, label, colors }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.15,
                duration: 150,
                useNativeDriver: true
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
            }),
        ]).start();
    }, [met, scaleAnim]);

    const iconColor = met
        ? (colors.success ?? '#38A169')
        : (colors.textSecondary ?? '#999');
    const icon = met ? '✓' : '○';

    return (
        <View style={styleAuth.passwordReqRow}>
            <Animated.Text
                style={[
                    styleAuth.passwordReqIcon,
                    { color: iconColor, transform: [{ scale: scaleAnim }] },
                ]}
            >
                {icon}
            </Animated.Text>
            <Text
                style={[styleAuth.passwordReqText, { color: iconColor }]}
                accessibilityLabel={`${label}, ${met ? 'cumplido' : 'pendiente'}`}
            >
                {label}
            </Text>
        </View>
    );
}