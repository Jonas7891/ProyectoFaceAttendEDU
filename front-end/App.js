import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomesScreen from './view/mobile/Screens/Homes/HomesScreen';
import MenuScreen from './view/mobile/Screens/Menu/MenuScreen';
import DashboardScreen from './view/mobile/Screens/Dashboard/DashboardScreen';
import NewsScreen from './view/mobile/Screens/News/NewsScreen';
import HistoricalScreen from './view/mobile/Screens/Historical/HistoricalScreen';
import FacialFail from './view/mobile/Screens/FacialFail/FacialFailScreen';
import UpdatePhoto from './view/mobile/Screens/UpdatePhoto/UpdatePhotoScreen';
import TakePhotoScreen from './view/mobile/Screens/TakePhoto/TakePhotoScreen';
import DisplayingAttendance from './view/mobile/Screens/Attendance/DisplayingAttendance';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}