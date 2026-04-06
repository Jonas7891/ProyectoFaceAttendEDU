import React, { useState } from "react";
import {
    Text,
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { QuestionInput } from "../../components/common/QuestionInput";

export default function UpdatePhoto() {
    const navigation = useNavigation();
    const [attendanceRegistered, setAttendanceRegistered] = useState(false);

    const [formData, setFormData] = useState({
        nombreCompleto: "",
        documento: "",
        telefono: ""
    });

    const handleInputChange = (field, value) => {
        setFormData(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const handleRegisterAttendance = () => {
        if (!formData.nombreCompleto || !formData.documento || !formData.telefono) {
            alert("Por favor, complete todos los campos");
            return;
        }

        console.log("Datos del usuario:", formData);
        setAttendanceRegistered(true);
        setTimeout(() => {
            setAttendanceRegistered(false);
        }, 1500);
    };

    const handleMenu = () => {
        navigation.navigate("Menu");
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.scrollViewContent}
                    bounces={true}
                    alwaysBounceVertical={true}
                >
                    <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
                        <View style={styles.backIcon}>
                            <Image
                                source={require("../../assets/images/flecha.png")}
                                style={styles.backIconImage}
                            />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.imagePhoto}>
                        <Image
                            source={require("../../assets/images/perfil-del-usuario.png")}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Foto para Reconocimiento Facial</Text>
                    </View>

                    <Text style={styles.instructionText}>
                        Centra tu rostro de tal manera que cubra la mayor parte de la cámara para un mejor escaneo y velocidad de reconocimiento.
                    </Text>

                    <View style={styles.formSection}>
                        <Text style={styles.formTitle}>Información Personal</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Nombre Completo</Text>
                            <QuestionInput
                                placeholder="Ejemplo: Juan Pérez"
                                value={formData.nombreCompleto}
                                onChangeText={(value) => handleInputChange("nombreCompleto", value)}
                                keyboardType="default"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Número de documento de identidad</Text>
                            <QuestionInput
                                placeholder="Ejemplo: 12345678"
                                value={formData.documento}
                                onChangeText={(value) => handleInputChange("documento", value)}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Número de Teléfono</Text>
                            <QuestionInput
                                placeholder="Ejemplo: 3001234567"
                                value={formData.telefono}
                                onChangeText={(value) => handleInputChange("telefono", value)}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.registerButton,
                            attendanceRegistered && styles.registerButtonSuccess,
                        ]}
                        onPress={handleRegisterAttendance}
                        activeOpacity={0.8}
                    >
                        <View style={styles.buttonContent}>
                            <Image
                                source={require("../../assets/images/fotografia.png")}
                                style={styles.icon}
                            />
                            <Text style={styles.registerButtonText}>
                                {attendanceRegistered ? '✓ Asistencia Registrada' : 'Registrar Asistencia'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleMenu}
                        style={styles.settingsContainer}
                        activeOpacity={0.7}
                    >
                        <View style={styles.settingsContent}>
                            <Image
                                source={require("../../assets/images/configuraciones.png")}
                                style={styles.settingsIcon}
                            />
                        </View>
                        <Text style={styles.settingsText}>Ajustes</Text>
                    </TouchableOpacity>

                    <View style={styles.footer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    keyboardView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    backIcon: {
        top: 20,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 20,
    },
    backIconImage: {
        width: '100%',
        height: '100%',
    },
    imagePhoto: {
        width: 150,
        height: 150,
        marginBottom: 20,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A2E',
        textAlign: 'center',
    },
    instructionText: {
        marginHorizontal: 30,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    formSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    registerButton: {
        backgroundColor: '#4CAF50',
        marginHorizontal: 20,
        marginVertical: 15,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        shadowColor: '#4CAF50',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        alignSelf: 'center',
    },
    registerButtonSuccess: {
        backgroundColor: '#2E7D32',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: "#FFFFFF",
    },
    settingsContainer: {
        marginTop: 10,
        marginBottom: 10,
        alignSelf: "center",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    settingsContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsIcon: {
        width: 40,
        height: 40,
        tintColor: "black"
    },
    settingsText: {
        color: 'black',
        fontSize: 20,
        fontWeight: '600',
    },
    footer: {
        height: 40,
    },
});