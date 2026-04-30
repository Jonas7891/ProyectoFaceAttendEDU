import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomesScreen from '../view/screens/login/Login';
import MenuScreen from '../view/screens/MenuScreen';
import DashboardScreen from '../view/screens/DashboardScreen';
import NewsScreen from '../view/screens/NewsScreen';
import FacialFail from '../view/screens/FacialFailScreen';
import UpdatePhoto from '../view/screens/UpdatePhotoScreen';
import DisplayingAttendance from '../view/screens/DisplayingAttendance';
import MenuJustify from '../view/screens/MenuJustifyScreen';
import ConsultJustify from '../view/screens/ConsultJustifyScreen';
import AddJustifyScreen from '../view/screens/AddJustifyScreen';
import LanguageSettingsScreen from '../view/screens/LanguageSettingsScreen';
import AddValidJustificationScreen from '../view/screens/AddValidJustificationScreen';
import ValidJustificationsScreen from '../view/screens/ValidJustificationsScreen';
import PendingJustificationsScreen from '../view/screens/PendingJustificationsScreen';
import ProfileScreen from '../view/screens/ProfileScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setIsAuthenticated(!!role);
        setUserRole(role);
      } catch (e) {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (role) => {
    try {
      await AsyncStorage.setItem('userRole', role);
      setIsAuthenticated(true);
      setUserRole(role);
    } catch (e) {
      console.error('Error guardando sesión:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userRole');
      setIsAuthenticated(false);
      setUserRole(null);
    } catch (e) {
      console.error('Error en logout:', e);
    }
  };

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {!isAuthenticated ? (
          <Stack.Screen name="Login">
            {props => (
              <HomesScreen
                {...props}
                onLogin={handleLogin}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Dashboard">
              {props => (
                <DashboardScreen
                  {...props}
                  onLogout={handleLogout}
                  userRole={userRole}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Menu" component={MenuScreen} />
            <Stack.Screen name="Novedades" component={NewsScreen} />
            <Stack.Screen name="FacialFail" component={FacialFail} />
            <Stack.Screen name="UpdatePhoto" component={UpdatePhoto} />
            <Stack.Screen name="DisplayingAttendance" component={DisplayingAttendance} />
            <Stack.Screen name="MenuJustify" component={MenuJustify} />
            <Stack.Screen name="ConsultJustify" component={ConsultJustify} />
            <Stack.Screen name="AddJustify" component={AddJustifyScreen} />
            <Stack.Screen name="AddValidJustification" component={AddValidJustificationScreen} />
            <Stack.Screen name="ValidJustifications" component={ValidJustificationsScreen} />
            <Stack.Screen name="PendingJustifications" component={PendingJustificationsScreen} />
            <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}