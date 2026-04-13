import React, { useState } from "react";
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import PrimaryButton from "../../Components/Auth/PrimaryButton";
import { QuestionnaireModal } from "../../Components/Common/QuestionnaireModal";
import { FacialUpdateModal } from "../../Components/Common/FacialUpdateModal";
import CustomLogo from "../../Components/Auth/logo";
import styles from "../Style/Style";

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
        <SafeAreaView style={styles.safeAreaFacialFail}>
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
