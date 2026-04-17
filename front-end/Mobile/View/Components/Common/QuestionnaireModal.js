import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { DocumentSelector } from './DocumentSelector';
import { RHSelector } from './RHSelector';
import { QuestionInput } from './QuestionInput';
import { ProgressBar } from './ProgressBar';
import stylesCommon from './Style/Style';

export const QuestionnaireModal = ({ visible, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({});
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedRH, setSelectedRH] = useState(null);
    const inputRef = useRef(null);

    const questions = [
        {
            id: 1,
            question: t('questionnaire.documentQuestion'),
            type: "selector",
            selectorType: "document"
        },
        {
            id: 2,
            question: t('questionnaire.documentPlaceholder'),
            placeholder: t('questionnaire.documentPlaceholder'),
            type: "input",
            keyboardType: "numeric"
        },
        {
            id: 3,
            question: t('questionnaire.rhQuestion'),
            type: "selector",
            selectorType: "rh"
        },
        {
            id: 4,
            question: t('questionnaire.relativeDocumentQuestion'),
            placeholder: t('questionnaire.documentPlaceholder'),
            type: "input",
            keyboardType: "numeric"
        },
        {
            id: 5,
            question: t('questionnaire.birthDateQuestion'),
            placeholder: t('questionnaire.birthDatePlaceholder'),
            hint: t('questionnaire.birthDateHint'),
            type: "input",
            keyboardType: "numeric"
        },
        {
            id: 6,
            question: t('questionnaire.addressQuestion'),
            placeholder: t('questionnaire.addressPlaceholder'),
            hint: t('questionnaire.addressHint'),
            type: "input"
        },
        {
            id: 7,
            question: t('questionnaire.phoneQuestion'),
            placeholder: t('questionnaire.phonePlaceholder'),
            hint: t('questionnaire.phoneHint'),
            type: "input",
            keyboardType: "numeric"
        }
    ];

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
                <View style={stylesCommon.questionnaireModalOverlay}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={stylesCommon.questionnaireModalContainer}>
                            <Text style={stylesCommon.questionnaireModalTitle}>Cuestionario</Text>
                            <Text style={stylesCommon.questionnaireQuestion}>
                                Se debe realizar un cuestionario en el que se pregunten por cosas específicas las cuales solo conozca un usuario
                            </Text>

                            <ProgressBar currentStep={step} totalSteps={questions.length} />

                            <Text style={stylesCommon.questionnaireQuestion}>
                                {questions[step - 1].question}
                            </Text>

                            {renderQuestionContent()}

                            <View style={stylesCommon.questionnaireButtonsContainer}>
                                {step > 1 && (
                                    <TouchableOpacity
                                        style={[stylesCommon.questionnaireButton, stylesCommon.questionnairePreviousButton]}
                                        onPress={handlePrevious}
                                    >
                                        <Text style={stylesCommon.questionnairePreviousButtonText}>Anterior</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={[stylesCommon.questionnaireButton, stylesCommon.questionnaireNextButton]}
                                    onPress={handleNext}
                                >
                                    <Text style={stylesCommon.questionnaireNextButtonText}>
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