import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../../components/common/BarraNavegacion";
import ScrollViewWrapper from "../../components/common/ScrollView";
import CustomTabs from "../../components/common/CustomTabs";

export default function DashboardScreen() {
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

  // Manejadores para el BottomBar
  const handleSettings = () => {
    console.log("Abrir configuración");
    navigation.navigate("Menu")
  };

  const handleProfile = () => {
    console.log("Abrir perfil");
    // Navegar a pantalla de perfil
  };

  const handleSearch = () => {
    console.log("Abrir búsqueda");
    // Navegar a pantalla de búsqueda
  };

  const menuAccionesRapidas = [
    {
      id: 1,
      title: "Registrar Asistencia",
      description: "Registro facial de empleados",
      color: "#4CAF50",
      screen: "RegistroAsistencia"
    },
    {
      id: 2,
      title: "Gestión de Empleados",
      description: "Agregar, editar o eliminar empleados",
      color: "#2196F3",
      screen: "GestionEmpleados"
    },
    {
      id: 3,
      title: "Reportes",
      description: "Generar reportes de asistencia",
      color: "#FF9800",
      screen: "Reportes"
    },
    {
      id: 4,
      title: "Configuración Facial",
      description: "Actualizar parámetros faciales",
      color: "#9C27B0",
      screen: "ConfiguracionFacial"
    }
  ];

  const asistenciasRecientes = [
    {
      id: 1,
      nombre: "Ana Martínez",
      hora: "08:15 AM",
      estado: "presente",
      tipo: "Entrada"
    },
    {
      id: 2,
      nombre: "Luis Fernández",
      hora: "08:22 AM",
      estado: "presente",
      tipo: "Entrada"
    },
    {
      id: 3,
      nombre: "Carmen López",
      hora: "08:30 AM",
      estado: "presente",
      tipo: "Entrada"
    },
    {
      id: 4,
      nombre: "Roberto Díaz",
      hora: "08:45 AM",
      estado: "tarde",
      tipo: "Entrada"
    }
  ];

  const novedadesRecientes = [
    {
      id: 1,
      titulo: "Nuevo empleado registrado",
      descripcion: "María González se ha registrado exitosamente",
      tiempo: "Hace 5 minutos",
      tipo: "success"
    },
    {
      id: 2,
      titulo: "Tardanza detectada",
      descripcion: "Carlos Ruiz registró entrada 15 minutos tarde",
      tiempo: "Hace 30 minutos",
      tipo: "warning"
    },
    {
      id: 3,
      titulo: "Reconocimiento facial mejorado",
      descripcion: "El sistema ha actualizado sus algoritmos",
      tiempo: "Hace 2 horas",
      tipo: "info"
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollViewWrapper>
        <View style={styles.container}>
          <CustomTabs
            onPressSettings={handleSettings}
            onPressProfile={handleProfile}
            onPressSearch={handleSearch}
            style={styles.customTabs}
          />
          {/* Header con fecha */}
          <View style={styles.header}>
            <View style={styles.dataBar}>
              <Text style={styles.greeting}>Buenos días,</Text>
              <Text style={styles.adminName}>Administrador</Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          {/* Indicador de asistencia */}
          <View style={styles.attendanceIndicator}>
            <View style={styles.indicatorHeader}>
              <Text style={styles.sectionTitle}>Asistencia Hoy</Text>
              <Text style={styles.percentageText}>
                {stats.porcentajeAsistencia}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats.porcentajeAsistencia}%` }
                ]}
              />
            </View>
            <View style={styles.indicatorDetails}>
              <Text style={styles.indicatorText}>
                {stats.presentesHoy} de {stats.totalEmpleados} empleados presentes
              </Text>
            </View>
          </View>

          {/* Acciones rápidas */}
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsContainer}>
            {menuAccionesRapidas.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickActionCard}
                onPress={() => console.log(item.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: item.color }]}>
                </View>
                <Text style={styles.actionTitle}>{item.title}</Text>
                <Text style={styles.actionDescription}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Asistencias recientes */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Asistencias Recientes</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            {asistenciasRecientes.map((item) => (
              <View key={item.id} style={styles.recentItem}>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{item.nombre}</Text>
                  <Text style={styles.recentTime}>{item.hora}</Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  item.estado === 'presente' ? styles.statusPresente : styles.statusTarde
                ]}>
                  <Text style={[
                    styles.statusText,
                    item.estado === 'presente' ? styles.statusTextPresente : styles.statusTextTarde
                  ]}>
                    {item.estado === 'presente' ? 'Presente' : 'Tarde'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Novedades */}
          <View style={styles.novedadesSection}>
            <Text style={styles.sectionTitle}>Novedades</Text>
            {novedadesRecientes.map((item) => (
              <View key={item.id} style={styles.novedadCard}>
                <View style={[
                  styles.novedadIcon,
                  item.tipo === 'success' && styles.novedadSuccess,
                  item.tipo === 'warning' && styles.novedadWarning,
                  item.tipo === 'info' && styles.novedadInfo
                ]}>
                </View>
                <View style={styles.novedadContent}>
                  <Text style={styles.novedadTitle}>{item.titulo}</Text>
                  <Text style={styles.novedadDescripcion}>{item.descripcion}</Text>
                  <Text style={styles.novedadTiempo}>{item.tiempo}</Text>
                </View>
              </View>
            ))}
          </View>
          {/* Espacio adicional para el BottomBar */}
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
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  adminName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: "#999999",
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationIcon: {
    width: 24,
    height: 24,
    tintColor: "#666666",
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#F44336",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
    tintColor: "#4CAF50",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
  },
  attendanceIndicator: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indicatorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  percentageText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  indicatorDetails: {
    alignItems: "center",
  },
  indicatorText: {
    fontSize: 12,
    color: "#666666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 15,
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionIconImage: {
    width: 28,
    height: 28,
    tintColor: "#FFFFFF",
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 11,
    color: "#666666",
    textAlign: "center",
  },
  recentSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
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
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPresente: {
    backgroundColor: "#E8F5E9",
  },
  statusTarde: {
    backgroundColor: "#FFF3E0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusTextPresente: {
    color: "#4CAF50",
  },
  statusTextTarde: {
    color: "#FF9800",
  },
  novedadesSection: {
    marginBottom: 20,
  },
  novedadCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  novedadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  novedadIconImage: {
    width: 20,
    height: 20,
    tintColor: "#FFFFFF",
  },
  novedadSuccess: {
    backgroundColor: "#4CAF50",
  },
  novedadWarning: {
    backgroundColor: "#FF9800",
  },
  novedadInfo: {
    backgroundColor: "#2196F3",
  },
  novedadContent: {
    flex: 1,
  },
  novedadTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  novedadDescripcion: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  novedadTiempo: {
    fontSize: 10,
    color: "#999999",
  },
  bottomSpace: {
    height: 90,
  }
});