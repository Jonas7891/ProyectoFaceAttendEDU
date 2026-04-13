import React, { useState } from "react";
import {
    Text,
    View,
    SafeAreaView,
    KeyboardAvoidingView,
    TouchableOpacity,
    Platform,
    Image,
    ScrollView,
    FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import PrimaryButton from "../../Components/Auth/PrimaryButton";
import Separador from "../../Components/Common/Separador";
import styles from "../Style/Style";

export default function ValidJustificationsScreen() {
    const navigation = useNavigation();

    const [activeSection, setActiveSection] = useState("inasistencias");

    // Datos de ejemplo para inasistencias justificadas
    const inasistenciasData = [
        { id: 1, fecha: "2024-03-15", motivo: "Incapacidad médica", estado: "Aprobada" },
        { id: 2, fecha: "2024-03-10", motivo: "Emergencia familiar", estado: "Aprobada" },
        { id: 3, fecha: "2024-03-05", motivo: "Cita médica", estado: "Pendiente" },
        { id: 4, fecha: "2024-02-28", motivo: "Problemas de transporte", estado: "Aprobada" },
    ];

    // Datos de ejemplo para retardos justificados
    const retardosData = [
        { id: 1, fecha: "2024-03-18", hora: "08:35 AM", motivo: "Tránsito pesado", estado: "Aprobada" },
        { id: 2, fecha: "2024-03-12", hora: "08:45 AM", motivo: "Cita médica", estado: "Aprobada" },
        { id: 3, fecha: "2024-03-08", hora: "08:28 AM", motivo: "Problemas mecánicos", estado: "Aprobada" },
        { id: 4, fecha: "2024-03-01", hora: "08:50 AM", motivo: "Emergencia personal", estado: "Pendiente" },
    ];

    const handleBack = () => {
        navigation.goBack();
    };

    const getEstadoColor = (estado) => {
        return estado === "Aprobada" ? "#4CAF50" : "#FF9800";
    };

    const renderInasistenciaItem = ({ item }) => (
        <View style={styles.justificationCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{item.fecha}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={styles.statusText}>{item.estado}</Text>
                </View>
            </View>
            <Text style={styles.cardReason}>{item.motivo}</Text>
        </View>
    );

    const renderRetardoItem = ({ item }) => (
        <View style={styles.justificationCard}>
            <View style={styles.cardHeader}>
                <View style={styles.dateTimeContainer}>
                    <Text style={styles.cardDate}>{item.fecha}</Text>
                    <Text style={styles.cardTime}>{item.hora}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
                    <Text style={styles.statusText}>{item.estado}</Text>
                </View>
            </View>
            <Text style={styles.cardReason}>{item.motivo}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeAreaWhite}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.containerValidJustifications}>
                        {/* Título principal */}
                        <Text style={styles.mainTitleValidJustifications}>
                            Consulta de Justificaciones
                        </Text>

                        {/* Subtítulo */}
                        <Text style={styles.subTitleValidJustifications}>
                            Lista de Justificaciones
                        </Text>

                        <Separador />
                        {/* Selector de sección */}
                        <View style={styles.sectionSelector}>
                            <TouchableOpacity
                                style={[
                                    styles.sectionTab,
                                    activeSection === "inasistencias" && styles.activeSectionTab,
                                ]}
                                onPress={() => setActiveSection("inasistencias")}
                            >
                                <Text
                                    style={[
                                        styles.sectionTabText,
                                        activeSection === "inasistencias" && styles.activeSectionTabText,
                                    ]}
                                >
                                    Sección de Inasistencias
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.sectionTab,
                                    activeSection === "retardos" && styles.activeSectionTab,
                                ]}
                                onPress={() => setActiveSection("retardos")}
                            >
                                <Text
                                    style={[
                                        styles.sectionTabText,
                                        activeSection === "retardos" && styles.activeSectionTabText,
                                    ]}
                                >
                                    Sección de Retardos
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Lista de inasistencias */}
                        {activeSection === "inasistencias" && (
                            <View style={styles.listContainer}>
                                <Text style={styles.sectionTitle}>Inasistencias Justificadas</Text>
                                {inasistenciasData.length > 0 ? (
                                    <FlatList
                                        data={inasistenciasData}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={renderInasistenciaItem}
                                        scrollEnabled={false}
                                    />
                                ) : (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>No hay inasistencias registradas</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Lista de retardos */}
                        {activeSection === "retardos" && (
                            <View style={styles.listContainer}>
                                <Text style={styles.sectionTitle}>Retardos Justificados</Text>
                                {retardosData.length > 0 ? (
                                    <FlatList
                                        data={retardosData}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={renderRetardoItem}
                                        scrollEnabled={false}
                                    />
                                ) : (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>No hay retardos registrados</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Espaciador */}
                        <View style={styles.spacer} />

                        {/* Botón Volver */}
                        <View style={styles.buttonContainer}>
                            <PrimaryButton title="Volver" onPress={handleBack} />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}