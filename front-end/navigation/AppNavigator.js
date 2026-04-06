import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomesScreen from '../view/mobile/HomesScreen';
import MenuScreen from '../view/mobile/MenuScreen';
import DashboardScreen from '../view/mobile/DashboardScreen';
import NewsScreen from '../view/mobile/NewsScreen';
import HistoricalScreen from '../view/mobile/HistoricalScreen';
import FacialFail from '../view/mobile/FacialFail';
import TakePhoto from '../view/mobile/UpdatePhoto';

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
            <Stack.Screen name="TakePhoto" component={TakePhoto} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}