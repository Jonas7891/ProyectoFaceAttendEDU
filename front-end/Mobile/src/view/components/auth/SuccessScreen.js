import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import styleAuth from './style/Style';

export function SuccessScreen({ colors, t, onNavigateToLogin }) {
    return (
        <SafeAreaView style={[styleAuth.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]}>
            <View style={styleAuth.successContainer}>
                <Text style={[styleAuth.successTitle, { color: colors.text }]}>
                    {t('passwordUpdate.successTitle', { defaultValue: '¡Contraseña actualizada!' })}
                </Text>
                <Text style={[styleAuth.successMessage, { color: colors.textSecondary ?? '#666' }]}>
                    {t('passwordUpdate.successMessage', {
                        defaultValue: 'Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.',
                    })}
                </Text>
                <TouchableOpacity
                    style={[styleAuth.recoveryPrimaryButton, {
                        backgroundColor: colors.primary,
                        marginTop: 32,
                        padding: 10,
                    }]}
                    onPress={onNavigateToLogin}
                    activeOpacity={0.8}
                    accessibilityLabel="Ir al inicio de sesión"
                    accessibilityRole="button"
                >
                    <Text style={styleAuth.recoveryPrimaryButtonText}>
                        {t('passwordUpdate.goToLogin', { defaultValue: 'Ir al inicio de sesión' })}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}