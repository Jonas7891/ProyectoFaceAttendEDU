import { useState, useCallback } from "react";

export const useCustomAlert = () => {
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: "",
        message: "",
        buttons: [],
        type: "default",
    });

    const showAlert = useCallback(({ title, message, buttons, type = "default" }) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            buttons,
            type,
        });
    }, []);

    const hideAlert = useCallback(() => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    }, []);

    // Funciones de conveniencia para alertas comunes
    const showSuccess = useCallback((title, message, onPress) => {
        showAlert({
            title,
            message,
            type: "success",
            buttons: [{ text: "OK", onPress: () => { hideAlert(); onPress && onPress(); } }],
        });
    }, [showAlert, hideAlert]);

    const showError = useCallback((title, message, onPress) => {
        showAlert({
            title,
            message,
            type: "error",
            buttons: [{ text: "OK", onPress: () => { hideAlert(); onPress && onPress(); } }],
        });
    }, [showAlert, hideAlert]);

    const showWarning = useCallback((title, message, buttons) => {
        showAlert({
            title,
            message,
            type: "warning",
            buttons: buttons || [{ text: "OK", onPress: hideAlert }],
        });
    }, [showAlert, hideAlert]);

    const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
        showAlert({
            title,
            message,
            type: "confirm",
            buttons: [
                {
                    text: "Cancelar",
                    style: "cancel",
                    onPress: () => { hideAlert(); onCancel && onCancel(); },
                },
                {
                    text: "Confirmar",
                    onPress: () => { hideAlert(); onConfirm && onConfirm(); },
                },
            ],
        });
    }, [showAlert, hideAlert]);

    return {
        alertConfig,
        showAlert,
        hideAlert,
        showSuccess,
        showError,
        showWarning,
        showConfirm,
    };
};