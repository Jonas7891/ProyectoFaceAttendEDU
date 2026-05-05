import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';
import { DocumentSelector } from './DocumentSelector';
import { RHSelector } from './RHSelector';
import { QuestionInput } from './QuestionInput';
import { ProgressBar } from './ProgressBar';
import stylescommon from './style/Style';
import CustomAlert from './CustomAlert';
import { useCustomAlert } from './useCustomAlert';

export const QuestionnaireModal = ({ visible, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({});
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedRH, setSelectedRH] = useState(null);
    const inputRef = useRef(null);

    const { alertConfig, hideAlert, showWarning, showAlert } = useCustomAlert();

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

    const handleNext = () => {
        dismissKeyboard();

        const currentQuestion = questions[step - 1];

        // Validación con alertas personalizadas
        if (currentQuestion.type === "selector") {
            if (currentQuestion.selectorType === "document" && !selectedDocument) {
                showWarning(
                    t('common.requiredField', { defaultValue: 'Campo requerido' }),
                    t('questionnaire.selectDocument', { defaultValue: 'Por favor selecciona tu tipo de documento' }),
                    [{ text: 'OK', onPress: hideAlert }]
                );
                return;
            }
            if (currentQuestion.selectorType === "rh" && !selectedRH) {
                showWarning(
                    t('common.requiredField', { defaultValue: 'Campo requerido' }),
                    t('questionnaire.selectRH', { defaultValue: 'Por favor selecciona tu tipo de RH' }),
                    [{ text: 'OK', onPress: hideAlert }]
                );
                return;
            }
        } else {
            if (!answers[currentQuestion.id]) {
                showWarning(
                    t('common.requiredField', { defaultValue: 'Campo requerido' }),
                    t('questionnaire.answerRequired', { defaultValue: 'Por favor responde la pregunta antes de continuar' }),
                    [{ text: 'OK', onPress: hideAlert }]
                );
                return;
            }
        }

        if (step < questions.length) {
            setStep(step + 1);
        } else {
            const documentoInfo = answers.documento?.label || t('common.notSelected', { defaultValue: 'No seleccionado' });
            const numeroDocumento = answers[2] || t('common.notProvided', { defaultValue: 'No proporcionado' });
            const rhInfo = answers.tipoRH?.label || t('common.notSelected', { defaultValue: 'No seleccionado' });
            const familiarDocumento = answers[4] || t('common.notProvided', { defaultValue: 'No proporcionado' });

            showAlert({
                title: t('questionnaire.completed', { defaultValue: 'Cuestionario Completado' }),
                message: `${t('questionnaire.document')}: ${documentoInfo}\n${t('questionnaire.number')}: ${numeroDocumento}\n${t('questionnaire.rhType')}: ${rhInfo}\n${t('questionnaire.relativeDocument')}: ${familiarDocumento}\n\n${t('questionnaire.successMessage', { defaultValue: 'Tus respuestas han sido enviadas. En breve recibirás asistencia.' })}`,
                type: 'success',
                buttons: [
                    {
                        text: t('common.accept', { defaultValue: 'Aceptar' }),
                        onPress: () => {
                            hideAlert();
                            onSuccess();
                            onClose();
                            setStep(1);
                            setAnswers({});
                            setSelectedDocument(null);
                            setSelectedRH(null);
                        },
                    },
                ],
            });
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
        <>
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={[stylescommon.questionnaireModalOverlay, { backgroundColor: colors.modalOverlay }]}>
                        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                            <View style={[stylescommon.questionnaireModalContainer, { backgroundColor: colors.modalBackground }]}>
                                <Text style={[stylescommon.questionnaireModalTitle, { color: colors.modalText }]}>
                                    {t('questionnaire.title', { defaultValue: 'Cuestionario' })}
                                </Text>
                                <Text style={[stylescommon.questionnaireQuestion, { color: colors.modalTextSecondary }]}>
                                    {t('questionnaire.description', { defaultValue: 'Se debe realizar un cuestionario en el que se pregunten por cosas específicas las cuales solo conozca un usuario' })}
                                </Text>

                                <ProgressBar currentStep={step} totalSteps={questions.length} />

                                <Text style={[stylescommon.questionnaireQuestion, { color: colors.modalText }]}>
                                    {questions[step - 1].question}
                                </Text>

                                {renderQuestionContent()}

                                <View style={stylescommon.questionnaireButtonsContainer}>
                                    {step > 1 && (
                                        <TouchableOpacity
                                            style={[stylescommon.questionnaireButton, stylescommon.questionnairePreviousButton, { backgroundColor: colors.modalButtonSecondary, borderColor: colors.modalBorder }]}
                                            onPress={handlePrevious}
                                        >
                                            <Text style={[stylescommon.questionnairePreviousButtonText, { color: colors.modalButtonSecondaryText }]}>
                                                {t('common.previous', { defaultValue: 'Anterior' })}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={[stylescommon.questionnaireButton, stylescommon.questionnaireNextButton, { backgroundColor: colors.modalButton }]}
                                        onPress={handleNext}
                                    >
                                        <Text style={[stylescommon.questionnaireNextButtonText, { color: colors.modalButtonText }]}>
                                            {step === questions.length
                                                ? t('common.send', { defaultValue: 'Enviar' })
                                                : t('common.next', { defaultValue: 'Siguiente' })}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

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
};