import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomesScreen from './view/mobile/HomesScreen';
import MenuScreen from './view/mobile/MenuScreen';
import DashboardScreen from './view/mobile/DashboardScreen';
import NewsScreen from './view/mobile/NewsScreen';
import HistoricalScreen from './view/mobile/HistoricalScreen';
import FacialFail from './view/mobile/FacialFail';
import TakePhoto from './view/mobile/UpdatePhoto';

const Stack = createStackNavigator();

export default function App() {
  return (
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
          name="TakePhoto" 
          component={TakePhoto} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}