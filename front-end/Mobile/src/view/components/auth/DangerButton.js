import React from 'react';
import { TouchableOpacity, Text, View, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import styleAuth from './style/Style';
import { useCustomAlert } from '../common/useCustomAlert';
import CustomAlert from '../common/CustomAlert';
import { removeToken } from "../../../storage/TokenStorage";

export default function DangerButton({ title, disabled = false, onLogout }) {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { alertConfig, hideAlert, showError } = useCustomAlert();

    const handleLogout = async () => {
        try {
            await removeToken();

            if (onLogout) {
                await onLogout();
            } else {
                console.warn('onLogout no está disponible en DangerButton');
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'HomesScreen' }],
                });
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            showError(
                t('common.error'),
                t('logout.error'),
                hideAlert
            );
        }
    };

    return (
        <>
            {/* Contenedor que asegura la posición inferior y márgenes seguros */}
            <View style={styleAuth.dangerButtonContainer}>
                <TouchableOpacity
                    style={[styleAuth.dangerButton, disabled && styleAuth.buttonDisabled]}
                    onPress={handleLogout}
                    disabled={disabled}
                    activeOpacity={0.7}
                >
                    <Text style={styleAuth.dangerButtonText}>{title || t('common.logout')}</Text>
                </TouchableOpacity>
            </View>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                type={alertConfig.type}
                onClose={hideAlert}
            />
        </>
    );
}
