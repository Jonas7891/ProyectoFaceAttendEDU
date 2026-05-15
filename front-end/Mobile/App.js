import React, {useEffect, useState, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {I18nextProvider} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ThemeProvider} from './src/view/components/common/ThemeContext';
import i18n from './src/utils/i18n';

import HomesScreen from './src/view/screens/login/Login';
import MenuScreen from './src/view/screens/MenuScreen';
import DashboardScreen from './src/view/screens/DashboardScreen';
import NewsScreen from './src/view/screens/NewsScreen';
import FacialFail from './src/view/screens/FacialFailScreen';
import UpdatePhoto from './src/view/screens/UpdatePhotoScreen';
import DisplayingAttendance from './src/view/screens/DisplayingAttendance';
import MenuJustifyScreen from './src/view/screens/MenuJustifyScreen';
import ConsultJustify from './src/view/screens/ConsultJustifyScreen';
import AddJustification from './src/view/screens/AddJustifyScreen';
import LanguageSettingsScreen from './src/view/screens/LanguageSettingsScreen';
import ProfileScreen from './src/view/screens/ProfileScreen';
import JustificationsScreen from './src/view/screens/ValidAllJustifications';
import AddValidJustificationScreen from './src/view/screens/AddValidJustificationScreen';
import ManageUsersScreen from "./src/view/screens/ManageUsersScreen";
import AttendanceReportScreen from './src/view/screens/AttendanceReportScreen';
import SchoolConfigurationScreen from "./src/view/screens/SchoolConfigurationScreen"

const Stack = createStackNavigator();

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigationRef = useRef(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const role = await AsyncStorage.getItem('userRole');
                const authToken = await AsyncStorage.getItem('authToken');

                if (role && authToken) {
                    setIsAuthenticated(true);
                    setUserRole(role);
                } else {
                    await AsyncStorage.multiRemove(['userRole', 'userEmail', 'authToken']);
                    setIsAuthenticated(false);
                    setUserRole(null);
                }
            } catch (e) {
                console.error('Error checking auth:', e);
                setIsAuthenticated(false);
                setUserRole(null);
            }
        };
        checkAuth();
    }, []);

    const handleLogin = async (role, token) => {
        try {
            await AsyncStorage.multiSet([
                ['userRole', role],
                ['authToken', token || 'default-token']
            ]);
            setIsAuthenticated(true);
            setUserRole(role);
        } catch (e) {
            console.error('Error guardando sesión:', e);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove([
                'userRole',
                'userEmail',
                'authToken',
                'appLanguage'
            ]);

            await i18n.changeLanguage('es');

            setIsAuthenticated(false);
            setUserRole(null);

        } catch (e) {
            console.error('Error en logout:', e);
            setIsAuthenticated(false);
            setUserRole(null);
        }
    };

    if (isAuthenticated === null) return null;

    return (
        <ThemeProvider>
            <I18nextProvider i18n={i18n}>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator
                        screenOptions={{
                            headerShown: false,
                            gestureEnabled: false,
                        }}
                    >
                        {!isAuthenticated ? (
                            <Stack.Screen name="HomesScreen">
                                {props => (
                                    <HomesScreen
                                        {...props}
                                        onLogin={handleLogin}
                                    />
                                )}
                            </Stack.Screen>
                        ) : (
                            <>
                                <Stack.Screen name="DashboardScreen">
                                    {props => (
                                        <DashboardScreen
                                            {...props}
                                            onLogout={handleLogout}
                                            userRole={userRole}
                                        />
                                    )}
                                </Stack.Screen>
                                <Stack.Screen name="Menu">
                                    {props => (
                                        <MenuScreen
                                            {...props}
                                            onLogout={handleLogout}
                                        />
                                    )}
                                </Stack.Screen>
                                <Stack.Screen name="Novedades" component={NewsScreen}/>
                                <Stack.Screen name="FacialFail" component={FacialFail}/>
                                <Stack.Screen name="UpdatePhoto" component={UpdatePhoto}/>
                                <Stack.Screen name="DisplayingAttendance" component={DisplayingAttendance}/>
                                <Stack.Screen name="MenuJustify" component={MenuJustifyScreen}/>
                                <Stack.Screen name="ConsultJustify" component={ConsultJustify}/>
                                <Stack.Screen name="AddJustification" component={AddJustification}/>
                                <Stack.Screen name="ValidJustifications" component={JustificationsScreen}/>
                                <Stack.Screen name="AddValidJustification" component={AddValidJustificationScreen}/>
                                <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen}/>
                                <Stack.Screen name="Profile" component={ProfileScreen}/>
                                <Stack.Screen name="ManageUsersScreen" component={ManageUsersScreen}/>
                                <Stack.Screen name="AttendanceReportScreen" component={AttendanceReportScreen}/>
                                <Stack.Screen name="SchoolConfigurationScreen" component={SchoolConfigurationScreen}/>
                            </>
                        )}
                    </Stack.Navigator>
                </NavigationContainer>
            </I18nextProvider>
        </ThemeProvider>
    );
}