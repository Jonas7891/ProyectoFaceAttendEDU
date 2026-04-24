import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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
import ConsultJustifiy from '../view/screens/ConsultJustifyScreen';
import AddJustification from '../view/screens/AddJustifyScreen';
import LanguageSettingsScreen from '../view/screens/LanguageSettingsScreen';
import AddValidJustificationScreen from '../view/screen/AddValidJustificationScreen';
import ValidJustificationsScreen from '../view/screens/ValidJustifications';
import { ThemeProvider } from '../view/components/common/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const [isauthenticated, setIsauthenticated] = React.useState(false);

  const handlelogin = () => {
    setIsauthenticated(true);
  };

  const handleLogout = () => {
    setIsauthenticated(false);
  };

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          {!isauthenticated ? (
            <Stack.Screen name="Home">
              {props => <HomesScreen {...props} onlogin={handlelogin} />}
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
    </ThemeProvider>
  );
}