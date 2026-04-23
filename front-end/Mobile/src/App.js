import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { I18nextProvider } from 'react-i18next';
import i18n from './utils/i18n';
import HomesScreen from './View/Screens/HomesScreen';
import MenuScreen from './View/Screens/MenuScreen';
import DashboardScreen from './View/Screens/DashboardScreen';
import NewsScreen from './View/Screens/NewsScreen';
import HistoricalScreen from './View/Screens/HistoricalScreen';
import FacialFail from './View/Screens/FacialFailScreen';
import UpdatePhoto from './View/Screens/UpdatePhotoScreen';
import TakePhotoScreen from './View/Screens/TakePhotoScreen';
import DisplayingAttendance from './View/Screens/DisplayingAttendance';
import MenuJustifyScreen from './View/Screens/MenuJustifyScreen';
import ConsultJustify from './View/Screens/ConsultJustifyScreen';
import AddJustify from './View/Screens/AddJustifyScreen';
import LanguageSettingsScreen from './View/Screens/LanguageSettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Homes">
          <Stack.Screen
            name="Homes"
            component={HomesScreen}
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
  );
}