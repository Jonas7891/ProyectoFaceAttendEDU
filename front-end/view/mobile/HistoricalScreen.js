import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    RefreshControl,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../../components/common/BarraNavegacion";
import ScrollViewWrapper from "../../components/common/ScrollView";
import CustomTabs from "../../components/common/CustomTabs";

export default function HistoricalScreen() {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalEmpleados: 0,
        presentesHoy: 0,
        ausentesHoy: 0,
        tardanzasHoy: 0,
        porcentajeAsistencia: 0
    });

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = () => {
        setStats({
            totalEmpleados: 45,
            presentesHoy: 38,
            ausentesHoy: 5,
            tardanzasHoy: 2,
            porcentajeAsistencia: 84
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await cargarEstadisticas();
        setRefreshing(false);
    };

    const handleSettings = () => {
        console.log("Abrir configuración");
        navigation.navigate("Menu")
    };

    const handleProfile = () => {
        console.log("Abrir perfil");

    };

    const handleSearch = () => {
        console.log("Abrir búsqueda");

    };

    const asistenciasRecientes = [
        {
            id: 1,
            nombre: "Ana Martínez",
            hora: "08:15 AM"
        },
        {
            id: 2,
            nombre: "Luis Fernández",
            hora: "08:22 AM"
        },
        {
            id: 3,
            nombre: "Carmen López",
            hora: "08:30 AM"
        },
        {
            id: 4,
            nombre: "Roberto Díaz",
            hora: "08:45 AM"
        }
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollViewWrapper>
                <View style={styles.container}>
                    <CustomTabs
                    />

                    <View style={styles.informacionContainer}>
                        <Text style={styles.informacionText}>
                            Trabajadores Registrados
                        </Text>

                        <View style={styles.recentSection}>
                            {asistenciasRecientes.map((item) => (
                                <View key={item.id} style={styles.recentItem}>
                                    <View style={styles.recentInfo}>
                                        <Text style={styles.recentName}>{item.nombre}</Text>
                                        <Text style={styles.recentTime}>{item.hora}</Text>
                                    </View>

                                    <View style={[styles.statusBadge]}>
                                        <TouchableOpacity>
                                            <Image
                                                source={require("../../assets/images/lupa.png")}
                                                style={styles.icon}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.bottomSpace} />
                </View>
            </ScrollViewWrapper>
            <BottomBar
                onPressSettings={handleSettings}
                onPressProfile={handleProfile}
                onPressSearch={handleSearch}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        marginTop: 20
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    bottomSpace: {
        height: 90,
    },
    informacionContainer: {
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: "#B5EAF4",
        borderRadius: 10,
    },
    informacionText: {
        fontSize: 25,
        fontWeight: "800",
        color: "#000000",
        alignSelf: "center",
        marginTop: 25,
        marginBottom: 25,
    },
    recentSection: {
        marginBottom: 25,
    },
    seeAllText: {
        fontSize: 12,
        color: "#4CAF50",
        fontWeight: "500",
    },
    recentItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        marginRight: 20,
        marginLeft: 20,
    },
    recentInfo: {
        flex: 1,
    },
    recentName: {
        fontSize: 14,
        fontWeight: "500",
        color: "#000000",
    },
    recentTime: {
        fontSize: 12,
        color: "#999999",
        marginTop: 2,
    },
    icon: {
        width: 28,
        height: 28,
        tintColor: "#000",
    },
});