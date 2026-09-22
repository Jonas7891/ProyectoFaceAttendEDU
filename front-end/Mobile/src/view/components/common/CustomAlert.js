import React from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from "react-native";

const {width} = Dimensions.get("window");

export default function CustomAlert({
                                        visible,
                                        title,
                                        message,
                                        buttons = [],
                                        onClose,
                                        type = "default",
                                    }) {
    // Paleta azulada y armónica
    const getColors = () => {
        switch (type) {
            case "success":
                return {background: "#2E86AB", text: "#FFFFFF"};
            case "error":
                return {background: "#D64545", text: "#FFFFFF"};
            case "warning":
                return {background: "#1E88E5", text: "#FFFFFF"};
            case "confirm":
                return {background: "#1565C0", text: "#FFFFFF"};
            default:
                return {background: "#FFFFFF", text: "#1A237E"};
        }
    };

    const colors = getColors();

    const alertButtons =
        buttons.length > 0
            ? buttons
            : [
                {
                    text: "OK",
                    onPress: onClose,
                    style: "default",
                },
            ];

    const getButtonStyle = (style) => {
        switch (style) {
            case "cancel":
                return {
                    backgroundColor: "#E8EAF6",
                    textColor: "#3949AB",
                };
            case "destructive":
                return {
                    backgroundColor: "#EF5350",
                    textColor: "#FFFFFF",
                };
            default:
                return {
                    backgroundColor: type !== "default" ? colors.background : "#2196F3",
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
                    {type !== "default" && (
                        <View style={[styles.header, {backgroundColor: colors.background}]}>
                            <Text style={[styles.headerText, {color: colors.text}]}>
                                {title}
                            </Text>
                        </View>
                    )}

                    {type === "default" && title && (
                        <Text style={styles.defaultTitle}>{title}</Text>
                    )}

                    <View style={styles.messageContainer}>
                        <Text style={styles.message}>{message}</Text>
                    </View>

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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    alertContainer: {
        width: width * 0.88,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingTop: 28,
        paddingBottom: 24,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: "center",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -28,
        marginBottom: 8,
    },
    headerText: {
        fontSize: 19,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    defaultTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1A237E",
        textAlign: "center",
        paddingTop: 8,
        paddingHorizontal: 24,
        marginBottom: 10,
    },
    messageContainer: {
        paddingVertical: 20,
        paddingHorizontal: 24,
    },
    message: {
        fontSize: 16,
        color: "#37474F",
        textAlign: "justify",
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        marginTop: 4,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        marginHorizontal: 6,
        marginTop: 8,
        marginBottom: 4,
    },
    buttonFlex: {
        flex: 1,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    cancelButtonText: {
        fontWeight: "500",
    },
});