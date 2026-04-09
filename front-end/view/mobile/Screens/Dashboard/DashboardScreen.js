import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomBar from "../../Components/Common/NavigationBar";
import ScrollViewWrapper from "../../Components/Common/ScrollView";
import CustomTabs from "../../Components/Common/CustomTabs";
import styles from "../Style/Style";

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

  const handleSettings = () => {
    console.log("Abrir configuración");
    navigation.navigate("Menu")
  };

  const handleProfile = () => {
    console.log("Abrir perfil");
    navigation.navigate("TakePhoto");
  };

  const handleSearch = () => {
    console.log("Abrir búsqueda");
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
          <CustomTabs />
          {/* Header con fecha */}
          <View style={styles.header}>
            <View style={styles.dataBar}>
              <View style={styles.leftContent}>
                <Text style={styles.greeting}>Buen día</Text>
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
          <View style={styles.bottomSpace} />
        </View>
      </ScrollViewWrapper>
      <BottomBar />
    </SafeAreaView >
  );
}
