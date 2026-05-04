import React from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
} from "react-native";

const {width} = Dimensions.get("window");

export default function CustomAlert({
                                        visible,
                                        title,
                                        message,
                                        buttons = [],
                                        onClose,
                                        type = "default", // 'default', 'success', 'error', 'warning', 'confirm'
                                    }) {
    // Colores según el tipo de alerta
    const getColors = () => {
        switch (type) {
            case "success":
                return {background: "#4CAF50", text: "#FFFFFF"};
            case "error":
                return {background: "#F44336", text: "#FFFFFF"};
            case "warning":
                return {background: "#FF9800", text: "#FFFFFF"};
            case "confirm":
                return {background: "#2196F3", text: "#FFFFFF"};
            default:
                return {background: "#FFFFFF", text: "#333333"};
        }
    };

    const colors = getColors();

    // Si no se pasan botones, crear uno por defecto
    const alertButtons =
        buttons.length > 0
            ? buttons
            : [
                {
                    text: "OK",
                    onPress: onClose,
                    style: "default", // 'default', 'cancel', 'destructive'
                },
            ];

    // Estilo del botón según su tipo
    const getButtonStyle = (style) => {
        switch (style) {
            case "cancel":
                return {
                    backgroundColor: "#E0E0E0",
                    textColor: "#333333",
                };
            case "destructive":
                return {
                    backgroundColor: "#F44336",
                    textColor: "#FFFFFF",
                };
            default:
                return {
                    backgroundColor: type !== "default" ? colors.background : "#007AFF",
                    textColor: type !== "default" ? colors.text : "#FFFFFF",
                };
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    {/* Header con color según tipo */}
                    {type !== "default" && (
                        <View style={[styles.header, {backgroundColor: colors.background}]}>
                            <Text style={[styles.headerText, {color: colors.text}]}>
                                {getHeaderIcon(type)} {title}
                            </Text>
                        </View>
                    )}

                    {/* Título para tipo default */}
                    {type === "default" && title && (
                        <Text style={styles.defaultTitle}>{title}</Text>
                    )}

                    {/* Mensaje */}
                    <View style={styles.messageContainer}>
                        <Text style={styles.message}>{message}</Text>
                    </View>

                    {/* Botones */}
                    <View style={styles.buttonContainer}>
                        {alertButtons.map((button, index) => {
                            const buttonStyle = getButtonStyle(button.style);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.button,
                                        {backgroundColor: buttonStyle.backgroundColor},
                                        alertButtons.length > 1 && styles.buttonFlex,
                                    ]}
                                    onPress={() => {
                                        button.onPress && button.onPress();
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            {color: buttonStyle.textColor},
                                            button.style === "cancel" && styles.cancelButtonText,
                                        ]}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Iconos según el tipo (puedes usar emojis o importar iconos)
const getHeaderIcon = (type) => {
    switch (type) {
        case "success":
            return "✓";
        case "error":
            return "✕";
        case "warning":
            return "⚠";
        case "confirm":
            return "?";
        default:
            return "";
    }
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    alertContainer: {
        width: width * 0.85,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: "center",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    defaultTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#333333",
        textAlign: "center",
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    messageContainer: {
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    message: {
        fontSize: 15,
        color: "#666666",
        textAlign: "center",
        lineHeight: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonFlex: {
        flex: 1,
    },
    buttonText: {
        fontSize: 17,
        fontWeight: "600",
    },
    cancelButtonText: {
        fontWeight: "400",
    },
});