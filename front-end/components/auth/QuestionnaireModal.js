import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
    StyleSheet
} from 'react-native';
import { DocumentSelector } from '../common/DocumentSelector';
import { RHSelector } from '../common/RHSelector';
import { QuestionInput } from '../common/QuestionInput';
import { ProgressBar } from './ProgressBar';

const questions = [
    {
        id: 1,
        question: "Selecciona tu tipo de documento de identidad:",
        type: "selector",
        selectorType: "document"
    },
    {
        id: 2,
        question: "¿Cuál es tu número de documento de identidad?",
        placeholder: "Ejemplo: 12345678",
        type: "input",
        keyboardType: "numeric"
    },
    {
        id: 3,
        question: "Selecciona tu tipo de RH (Factor Rh):",
        type: "selector",
        selectorType: "rh"
    },
    {
        id: 4,
        question: "¿Documento del familiar asociado?",
        placeholder: "Ejemplo: 12345678",
        type: "input",
        keyboardType: "numeric"
    },
    {
        id: 5,
        question: "¿Cuál es tu fecha de nacimiento?",
        placeholder: "DD/MM/AAAA",
        hint: "Formato: 15/08/1990",
        type: "input",
        keyboardType: "numeric"
    },
    {
        id: 6,
        question: "¿Cuál es tu dirección de residencia?",
        placeholder: "Calle, número, ciudad",
        hint: "Ejemplo: Calle 123 #45-67, Bogotá",
        type: "input"
    },
    {
        id: 7,
        question: "¿Cuál es tu número de teléfono de contacto?",
        placeholder: "Ejemplo: 3001234567",
        hint: "Ingresa tu número sin espacios",
        type: "input",
        keyboardType: "numeric"
    }
];

export const QuestionnaireModal = ({ visible, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({});
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedRH, setSelectedRH] = useState(null);
    const inputRef = useRef(null);

    const dismissKeyboard = () => {
        Keyboard.dismiss();
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const validateCurrentStep = () => {
        const currentQuestion = questions[step - 1];

        if (currentQuestion.type === "selector") {
            if (currentQuestion.selectorType === "document") {
                if (!selectedDocument) {
                    Alert.alert("Campo requerido", "Por favor selecciona tu tipo de documento");
                    return false;
                }
            } else if (currentQuestion.selectorType === "rh") {
                if (!selectedRH) {
                    Alert.alert("Campo requerido", "Por favor selecciona tu tipo de RH");
                    return false;
                }
            }
        } else {
            if (!answers[currentQuestion.id]) {
                Alert.alert("Campo requerido", "Por favor responde la pregunta antes de continuar");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        dismissKeyboard();

        if (!validateCurrentStep()) {
            return;
        }

        if (step < questions.length) {
            setStep(step + 1);
        } else {
            const documentoInfo = answers.documento?.label || "No seleccionado";
            const numeroDocumento = answers[2] || "No proporcionado";
            const rhInfo = answers.tipoRH?.label || "No seleccionado";
            const familiarDocumento = answers[4] || "No proporcionado";

            Alert.alert(
                "Cuestionario Completado",
                `Documento: ${documentoInfo}\nNúmero: ${numeroDocumento}\nTipo RH: ${rhInfo}\nDocumento Familiar: ${familiarDocumento}\n\nTus respuestas han sido enviadas. En breve recibirás asistencia.`,
                [
                    {
                        text: "Aceptar",
                        onPress: () => {
                            onSuccess();
                            onClose();
                            setStep(1);
                            setAnswers({});
                            setSelectedDocument(null);
                            setSelectedRH(null);
                        }
                    }
                ]
            );
        }
    };

    const handlePrevious = () => {
        dismissKeyboard();
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleDocumentSelect = (documento) => {
        setSelectedDocument(documento);
        setAnswers({
            ...answers,
            documento: documento
        });
    };

    const handleRHSelect = (rh) => {
        setSelectedRH(rh);
        setAnswers({
            ...answers,
            tipoRH: rh
        });
    };

    const handleAnswer = (text) => {
        setAnswers({
            ...answers,
            [questions[step - 1].id]: text
        });
    };

    const renderQuestionContent = () => {
        const currentQuestion = questions[step - 1];

        if (currentQuestion.type === "selector") {
            if (currentQuestion.selectorType === "document") {
                return (
                    <DocumentSelector 
                        selectedDocument={selectedDocument}
                        onSelect={handleDocumentSelect}
                    />
                );
            } else if (currentQuestion.selectorType === "rh") {
                return (
                    <RHSelector 
                        selectedRH={selectedRH}
                        onSelect={handleRHSelect}
                    />
                );
            }
        }

        return (
            <QuestionInput
                ref={inputRef}
                placeholder={currentQuestion.placeholder}
                value={answers[currentQuestion.id] || ""}
                onChangeText={handleAnswer}
                keyboardType={currentQuestion.keyboardType}
                hint={currentQuestion.hint}
            />
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Cuestionario</Text>
                            <Text style={styles.modalSubtitle}>
                                Se debe realizar un cuestionario en el que se pregunten por cosas específicas las cuales solo conozca un usuario
                            </Text>

                            <ProgressBar currentStep={step} totalSteps={questions.length} />

                            <Text style={styles.questionText}>
                                {questions[step - 1].question}
                            </Text>

                            {renderQuestionContent()}

                            <View style={styles.modalButtons}>
                                {step > 1 && (
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.previousButton]}
                                        onPress={handlePrevious}
                                    >
                                        <Text style={styles.previousButtonText}>Anterior</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.nextButton]}
                                    onPress={handleNext}
                                >
                                    <Text style={styles.nextButtonText}>
                                        {step === questions.length ? "Enviar" : "Siguiente"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#FFF",
        borderRadius: 15,
        padding: 20,
        width: "90%",
        maxWidth: 400,
        maxHeight: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 10,
        textAlign: "center",
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 20,
        fontStyle: "italic",
    },
    questionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    previousButton: {
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    previousButtonText: {
        color: "#666",
        fontSize: 14,
        fontWeight: "600",
    },
    nextButton: {
        backgroundColor: "#007AFF",
    },
    nextButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
});