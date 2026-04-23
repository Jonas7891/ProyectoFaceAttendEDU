import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomesScreen from './Screens/Homes/HomesScreen';
import MenuScreen from './Screens/Menu/MenuScreen';
import DashboardScreen from './Screens/Dashboard/DashboardScreen';
import NewsScreen from './Screens/News/NewsScreen';
import HistoricalScreen from './Screens/Historical/HistoricalScreen';
import FacialFail from './Screens/FacialFail/FacialFailScreen';
import UpdatePhoto from './Screens/UpdatePhoto/UpdatePhotoScreen';
import TakePhoto from './Screens/TakePhoto/TakePhotoScreen';
import DisplayingAttendance from './Screens/Attendance/DisplayingAttendance';
import MenuJustify from './Screens/MenuJustifiy/MenuJustifyScreen';
import ConsultJustifiy from './Screens/ConsultJustify/ConsultJustifyScreen';
import AddJustification from './Screens/AddOrEditJustify/AddJustifyScreen';
import LanguageSettingsScreen from '../View/Screens/Settings/LanguageSettingsScreen';
import AddValidJustificationScreen from './Screens/AddValidJustification/AddValidJustificationScreen';
import ValidJustificationsScreen from './Screens/ValidJustifications';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Homes">
            {props => <HomesScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Menu" component={MenuScreen} />
            <Stack.Screen name="Novedades" component={NewsScreen} />
            <Stack.Screen name="Historial" component={HistoricalScreen} />
            <Stack.Screen name="FacialFail" component={FacialFail} />
            <Stack.Screen name="UpdatePhoto" component={UpdatePhoto} />
            <Stack.Screen name="TakePhoto" component={TakePhoto} />
            <Stack.Screen name="DisplayingAttendance" component={DisplayingAttendance} />
            <Stack.Screen name="MenuJustify" component={MenuJustify} />
            <Stack.Screen name="ConsultJustify" component={ConsultJustifiy} />
            <Stack.Screen name="AddJustify" component={AddJustification} />
            <Stack.Screen name='LanguageSettings' component={LanguageSettingsScreen} />
            <Stack.Screen name='AddValidJustification' component={AddValidJustificationScreen} />
            <Stack.Screen name='ValidJustifications' component={ValidJustificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}