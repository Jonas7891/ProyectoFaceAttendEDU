import React, { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import PrimaryButton from "../../components/auth/PrimaryButton";
import { QuestionnaireModal } from "../../components/auth/QuestionnaireModal";
import { FacialUpdateModal } from "../../components/auth/FacialUpdateModal";
import CustomLogo from "../../components/auth/logo";

export default function FacialFail() {
    const navigation = useNavigation();
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [showFacialUpdate, setShowFacialUpdate] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleQuestionnaire = () => {
        setShowQuestionnaire(true);
    };

    const handleFacialUpdate = () => {
        setShowFacialUpdate(true);
    };

    const handleBack = () => {
        setIsLoading(true);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.mainTitle}>
                                    Fallo en el Reconocimiento {"\n"} Facial
                                </Text>
                                <CustomLogo
                                    size="small"
                                    rounded={true}
                                    backgroundColor="#000000"
                                    marginBottom={20}
                                />
                            </View>

                            <Text style={styles.subtitle}>
                                Selecciona la opción con base a tu caso:
                            </Text>

                            <TouchableOpacity
                                style={styles.optionCard}
                                onPress={handleQuestionnaire}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.optionTitle}>1. Cuestionario</Text>
                                <Text style={styles.optionDescription}>
                                    Se debe realizar un cuestionario en el que se pregunten por cosas específicas las cuales solo conozca un usuario
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.optionCard}
                                onPress={handleFacialUpdate}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.optionTitle}>2. Actualizaciones de Parametros Faciales</Text>
                                <Text style={styles.optionDescription}>
                                    Muchas ocasiones el Reconocimiento Facial puede fallar por cierta modificación en el rostro de un usuario
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.separator} />

                            <Text style={styles.recommendationsTitle}>
                                Recomendaciones:
                            </Text>

                            <View style={styles.recommendationCard}>
                                <Text style={styles.recommendationSubtitle}>
                                    Calidad o Ángulo de la Camara
                                </Text>
                                <Text style={styles.recommendationText}>
                                    Otra de las razones por la que ocurre fallos en el sistema es debido a la iluminación del lugar, la calidad de la camara o en que angulo se pone el dispositivo para realizar el escaneo.
                                </Text>
                            </View>

                            <PrimaryButton
                                title={isLoading ? "Volviendo al Menu..." : "Volver"}
                                onPress={handleBack}
                                isLoading={isLoading}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </ScrollView>

            <QuestionnaireModal
                visible={showQuestionnaire}
                onClose={() => setShowQuestionnaire(false)}
                onSuccess={() => console.log("Cuestionario completado")}
            />

            <FacialUpdateModal
                visible={showFacialUpdate}
                onClose={() => setShowFacialUpdate(false)}
                onSuccess={() => console.log("Parámetros actualizados")}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        marginTop: Platform.OS === 'android' ? 25 : 20
    },
    scrollContent: {
        flexGrow: 1,
    },
    keyboardView: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
    },
    mainTitle: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#1a1a1a",
        flex: 1,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 20,
    },
    optionCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    optionDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        fontStyle: "italic",
    },
    separator: {
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        marginVertical: 20,
    },
    recommendationsTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 12,
    },
    recommendationCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    recommendationSubtitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    recommendationText: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
});