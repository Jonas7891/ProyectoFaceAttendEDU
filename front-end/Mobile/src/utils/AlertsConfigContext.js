import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AlertsConfigContext = createContext();

export const AlertsConfigProvider = ({ children }) => {
    const [alertsConfig, setAlertsConfig] = useState({
        enableSuccess: true,
        enableError: true,
        enableWarning: true,
        enableConfirm: true,
        enableDefault: true,
    });

    const [isLoading, setIsLoading] = useState(true);

    // Cargar configuración al iniciar
    useEffect(() => {
        loadAlertsConfig();
    }, []);

    const loadAlertsConfig = async () => {
        try {
            const saved = await AsyncStorage.getItem('alertsConfig');
            if (saved) {
                setAlertsConfig(JSON.parse(saved));
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error cargando configuración de alertas:', error);
            setIsLoading(false);
        }
    };

    const saveAlertsConfig = async (config) => {
        try {
            setAlertsConfig(config);
            await AsyncStorage.setItem('alertsConfig', JSON.stringify(config));
        } catch (error) {
            console.error('Error guardando configuración de alertas:', error);
        }
    };

    const toggleAlertType = (type) => {
        const key = `enable${type.charAt(0).toUpperCase()}${type.slice(1)}`;
        const newConfig = {
            ...alertsConfig,
            [key]: !alertsConfig[key],
        };
        saveAlertsConfig(newConfig);
    };

    const isAlertEnabled = (type) => {
        const key = `enable${type.charAt(0).toUpperCase()}${type.slice(1)}`;
        return alertsConfig[key] !== false;
    };

    return (
        <AlertsConfigContext.Provider
            value={{
                alertsConfig,
                isLoading,
                saveAlertsConfig,
                toggleAlertType,
                isAlertEnabled,
            }}
        >
            {children}
        </AlertsConfigContext.Provider>
    );
};

export const useAlertsConfig = () => {
    const context = useContext(AlertsConfigContext);
    if (!context) {
        throw new Error('useAlertsConfig debe ser usado dentro de AlertsConfigProvider');
    }
    return context;
};
