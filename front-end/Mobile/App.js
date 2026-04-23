import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/Utils/i18n';
import Login from './src/View/Screens/Login/Login';
import MenuScreen from './src/View/Screens/MenuScreen';
import DashboardScreen from './src/View/Screens/DashboardScreen';
import NewsScreen from './src/View/Screens/NewsScreen';
import HistoricalScreen from './src/View/Screens/HistoricalScreen';
import FacialFail from './src/View/Screens/FacialFailScreen';
import UpdatePhoto from './src/View/Screens/UpdatePhotoScreen';
import TakePhotoScreen from './src/View/Screens/TakePhotoScreen';
import DisplayingAttendance from './src/View/Screens/DisplayingAttendance';
import MenuJustifyScreen from './src/View/Screens/MenuJustifyScreen';
import ConsultJustify from './src/View/Screens/ConsultJustifyScreen';
import AddJustify from './src/View/Screens/AddJustifyScreen';
import LanguageSettingsScreen from './src/View/Screens/LanguageSettingsScreen';
import AddValidJustificationScreen from './src/View/Screens/AddValidJustificationScreen';
import ValidJustificationsScreen from './src/View/Screens/ValidAllJustifications';

const Stack = createStackNavigator();

export default function App() {
  return (
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
          <Stack.Screen
            name="AddValidJustification"
            component={AddValidJustificationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ValidJustifications"
            component={ValidJustificationsScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
}