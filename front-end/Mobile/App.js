import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from './src/view/components/common/ThemeContext';
import i18n from './src/utils/i18n';
import Login from './src/view/screens/login/Login';
import MenuScreen from './src/view/screens/MenuScreen';
import DashboardScreen from './src/view/screens/DashboardScreen';
import NewsScreen from './src/view/screens/NewsScreen';
import HistoricalScreen from './src/view/screens/HistoricalScreen';
import FacialFail from './src/view/screens/FacialFailScreen';
import UpdatePhoto from './src/view/screens/UpdatePhotoScreen';
import TakePhotoScreen from './src/view/screens/TakePhotoScreen';
import DisplayingAttendance from './src/view/screens/DisplayingAttendance';
import MenuJustifyScreen from './src/view/screens/MenuJustifyScreen';
import ConsultJustify from './src/view/screens/ConsultJustifyScreen';
import AddJustify from './src/view/screens/AddJustifyScreen';
import LanguageSettingsScreen from './src/view/screens/LanguageSettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Menu"
              component={MenuScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Novedades"
              component={NewsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Historial"
              component={HistoricalScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FacialFail"
              component={FacialFail}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UpdatePhoto"
              component={UpdatePhoto}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TakePhoto"
              component={TakePhotoScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DisplayingAttendance"
              component={DisplayingAttendance}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MenuJustify"
              component={MenuJustifyScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ConsultJustify"
              component={ConsultJustify}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddJustify"
              component={AddJustify}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LanguageSettings"
              component={LanguageSettingsScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </I18nextProvider>
    </ThemeProvider>
  );
}