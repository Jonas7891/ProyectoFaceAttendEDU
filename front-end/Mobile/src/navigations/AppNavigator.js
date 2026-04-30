import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import HomesScreen from '../view/screens/login/Login';
import MenuScreen from '../view/screens/MenuScreen';
import DashboardScreen from '../view/screens/DashboardScreen';
import NewsScreen from '../view/screens/NewsScreen';
import HistoricalScreen from '../view/screens/HistoricalScreen';
import FacialFail from '../view/screens/FacialFailScreen';
import UpdatePhoto from '../view/screens/UpdatePhotoScreen';
import TakePhoto from '../view/screens/TakePhotoScreen';
import DisplayingAttendance from '../view/screens/DisplayingAttendance';
import MenuJustify from '../view/screens/MenuJustifyScreen';
import ConsultJustify from '../view/screens/ConsultJustifyScreen';
import AddJustification from '../view/screens/AddJustifyScreen';
import LanguageSettingsScreen from '../view/screens/LanguageSettingsScreen';
import AddValidJustificationScreen from '../view/screen/AddValidJustificationScreen';
import ValidJustificationsScreen from '../view/screens/ValidJustifications';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setIsAuthenticated(!!role);
      } catch (e) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // 🔐 LOGIN
  const handleLogin = async (role) => {
    try {
      await AsyncStorage.setItem('userRole', role);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Error guardando sesión:', e);
    }
  };

  // 🚪 LOGOUT
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userRole');
      setIsAuthenticated(false);
    } catch (e) {
      console.error('Error en logout:', e);
    }
  };

  // ⏳ Mientras verifica sesión
  if (isAuthenticated === null) {
    return null; // o splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {!isAuthenticated ? (
          // 🔓 NO autenticado → Login
          <Stack.Screen name="Login">
            {props => (
              <HomesScreen
                {...props}
                onLogin={handleLogin}
              />
            )}
          </Stack.Screen>
        ) : (
          // 🔒 Autenticado → App completa
          <>
            <Stack.Screen name="Dashboard">
              {props => (
                <DashboardScreen
                  {...props}
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Menu" component={MenuScreen} />
            <Stack.Screen name="Novedades" component={NewsScreen} />
            <Stack.Screen name="Historial" component={HistoricalScreen} />
            <Stack.Screen name="FacialFail" component={FacialFail} />
            <Stack.Screen name="UpdatePhoto" component={UpdatePhoto} />
            <Stack.Screen name="TakePhoto" component={TakePhoto} />
            <Stack.Screen name="DisplayingAttendance" component={DisplayingAttendance} />
            <Stack.Screen name="MenuJustify" component={MenuJustify} />
            <Stack.Screen name="ConsultJustify" component={ConsultJustify} />
            <Stack.Screen name="AddJustify" component={AddJustification} />
            <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
            <Stack.Screen name="AddValidJustification" component={AddValidJustificationScreen} />
            <Stack.Screen name="ValidJustifications" component={ValidJustificationsScreen} />
          </>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}