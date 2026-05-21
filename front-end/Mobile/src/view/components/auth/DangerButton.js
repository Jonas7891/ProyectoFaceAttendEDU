import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
            // Limpiar almacenamiento
            await removeToken();

            // Ejecutar callback (que ya incluye la confirmación desde la pantalla)
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
                t('common.error', { defaultValue: 'Error' }),
                t('logout.error', { defaultValue: 'No se pudo cerrar sesión' }),
                hideAlert
            );
        }
    };

    return (
        <>
            <TouchableOpacity
                style={[styleAuth.dangerButton, disabled && styleAuth.buttonDisabled]}
                onPress={handleLogout}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <Text style={styleAuth.dangerButtonText}>{title}</Text>
            </TouchableOpacity>

            {/* Solo para mostrar errores, sin confirmación */}
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