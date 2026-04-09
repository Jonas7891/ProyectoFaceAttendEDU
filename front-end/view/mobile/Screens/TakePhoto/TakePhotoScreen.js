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
import styles from "../Style/Style";

export default function TakePhotoScreen() {
    const navigation = useNavigation();
    const [facialParamsRegistered, setFacialParamsRegistered] = useState(false);

    const handleFacialParams = () => {
        // Simulación de ingreso de parámetros faciales
        console.log("Ingresando parámetros faciales...");

        setFacialParamsRegistered(true);

        // El estado hover se mantiene por 2 segundos
        setTimeout(() => {
            setFacialParamsRegistered(false);
        }, 2000);
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
                                source={require("../../../../assets/images/flecha.png")}
                                style={styles.backIconImage}
                            />
                        </View>
                    </TouchableOpacity>

                    <View style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 100
                    }}>
                        <View style={styles.imagePhoto}>
                            <Image
                                source={require("../../../../assets/images/perfil-del-usuario.png")}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>
                                Foto para Reconocimiento Facial{"\n"}Inicial
                            </Text>
                        </View>

                        <Text style={styles.instructionText}>
                            Centra tu rostro de tal manera que cubra la mayor parte de la cámara
                            para un mejor escaneo y velocidad de reconocimiento.
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.registerButton,
                                facialParamsRegistered && styles.registerButtonSuccess,
                            ]}
                            onPress={handleFacialParams}
                            activeOpacity={0.8}
                        >
                            <View style={styles.buttonContent}>
                                <Image
                                    source={require("../../../../assets/images/fotografia.png")}
                                    style={styles.icon}
                                />
                                <Text style={styles.registerButtonText}>
                                    {facialParamsRegistered
                                        ? '✓ Parámetros Registrados'
                                        : 'Ingresar Parámetros Faciales'
                                    }
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
                                    source={require("../../../../assets/images/configuraciones.png")}
                                    style={styles.settingsIcon}
                                />
                            </View>
                            <Text style={styles.settingsText}>Ajustes</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}