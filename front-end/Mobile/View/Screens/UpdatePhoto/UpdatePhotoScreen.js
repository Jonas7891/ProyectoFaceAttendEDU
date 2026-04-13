import React, { useState } from "react";
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { QuestionInput } from "../../Components/Common/QuestionInput";
import styles from "../Style/Style";

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
                                source={require("../../../assets/images/flecha.png")}
                                style={styles.backIconImage}
                            />
                        </View>
                    </TouchableOpacity>

                    <View>
                        <Text>{"\n"}</Text>
                    </View>

                    <View style={styles.imagePhoto}>
                        <Image
                            source={require("../../../assets/images/perfil-del-usuario.png")}
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
                                source={require("../../../assets/images/fotografia.png")}
                                style={styles.icon}
                            />
                            <Text style={styles.registerButtonText}>
                                {attendanceRegistered ? '✓ Asistencia Registrada' : 'Registrar Asistencia'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <View>
                        <Text>{"\n"}{"\n"}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleMenu}
                        style={styles.settingsContainer}
                        activeOpacity={0.7}
                    >
                        <View style={styles.settingsContent}>
                            <Image
                                source={require("../../../assets/images/configuraciones.png")}
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
