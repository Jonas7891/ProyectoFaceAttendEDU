import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Login from './View/Screens/Login/Login';
import MenuScreen from './View/Screens/Menu/MenuScreen';
import DashboardScreen from './View/Screens/Dashboard/DashboardScreen';
import NewsScreen from './View/Screens/News/NewsScreen';
import HistoricalScreen from './View/Screens/Historical/HistoricalScreen';
import FacialFail from './View/Screens/FacialFail/FacialFailScreen';
import UpdatePhoto from './View/Screens/UpdatePhoto/UpdatePhotoScreen';
import TakePhotoScreen from './View/Screens/TakePhoto/TakePhotoScreen';
import DisplayingAttendance from './View/Screens/Attendance/DisplayingAttendance';
import MenuJustifyScreen from './View/Screens/MenuJustifiy/MenuJustifyScreen';
import ConsultJustify from './View/Screens/ConsultJustify/ConsultJustifyScreen';
import AddJustify from './View/Screens/AddOrEditJustify/AddJustifyScreen';
import LanguageSettingsScreen from './View/Screens/Settings/LanguageSettingsScreen';

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
        </Stack.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
}