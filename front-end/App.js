import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomesScreen from './View/mobile/Screens/Homes/HomesScreen';
import MenuScreen from './View/mobile/Screens/Menu/MenuScreen';
import DashboardScreen from './View/mobile/Screens/Dashboard/DashboardScreen';
import NewsScreen from './View/mobile/Screens/News/NewsScreen';
import HistoricalScreen from './View/mobile/Screens/Historical/HistoricalScreen';
import FacialFail from './View/mobile/Screens/FacialFail/FacialFailScreen';
import UpdatePhoto from './View/mobile/Screens/UpdatePhoto/UpdatePhotoScreen';
import TakePhotoScreen from './View/mobile/Screens/TakePhoto/TakePhotoScreen';
import DisplayingAttendance from './View/mobile/Screens/Attendance/DisplayingAttendance';
import MenuJustifyScreen from './View/mobile/Screens/MenuJustifiy/MenuJustifyScreen';
import ConsultJustify from './View/mobile/Screens/ConsultJustify/ConsultJustifyScreen'
import AddJustify from './View/mobile/Screens/AddOrEditJustify/AddJustifyScreen'

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}