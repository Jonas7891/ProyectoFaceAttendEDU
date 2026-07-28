import React, {useEffect, useState, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../utils/i18n';
import HomesScreen from '../view/screens/login/Login';
import MenuScreen from '../view/screens/MenuScreen';
import DashboardScreen from '../view/screens/DashboardScreen';
import NewsScreen from '../view/screens/NewsScreen';
import FacialFail from '../view/screens/FacialFailScreen';
import UpdatePhoto from '../view/screens/UpdatePhotoScreen';
import DisplayingAttendance from '../view/screens/DisplayingAttendance';
import MenuJustify from '../view/screens/MenuJustifyScreen';
import AddJustification from '../view/screens/AddJustifyScreen';
import LanguageSettingsScreen from '../view/screens/LanguageSettingsScreen';
import AddValidJustificationScreen from '../view/screens/AddValidJustificationScreen';
import ValidJustificationsScreen from '../view/screens/ConsultJustifyScreen';
import ProfileScreen from '../view/screens/ProfileScreen';
import ManageUsersScreen from '../view/screens/ManageUsersScreen';
import AttendanceReportScreen from '../view/screens/AttendanceReportScreen';
import SchoolConfigurationScreen from '../view/screens/SchoolConfigurationScreen';
import VerifyCodeScreen from "../view/screens/login/Verifycodescreen";
import ForgotPasswordScreen from "../view/screens/login/Forgotpasswordscreen";
import PendingJustificationScreen from "../view/screens/PendingJustificationScreen";
import ManageEnviromentScreen from "../view/screens/ManageEnviromentScreen";

const Stack = createStackNavigator();

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const navigationRef = useRef(null);

    useEffect(() => {
        checkAuth();
    }, []);

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

    if (isAuthenticated === null) {
        return null;
    }

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            >
                {!isAuthenticated ? (
                    <>
                        <Stack.Screen name="HomesScreen">
                            {(props) => (
                                <HomesScreen
                                    {...props}
                                    onLogin={handleLogin}
                                />
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen}/>
                        <Stack.Screen name="VerifyCodeScreen" component={VerifyCodeScreen}/>
                    </>
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
                        <Stack.Screen name="LanguageSettingsScreen" component={LanguageSettingsScreen}/>
                        <Stack.Screen name="DisplayingAttendance" component={DisplayingAttendance}/>
                        <Stack.Screen name="MenuJustify" component={MenuJustify}/>
                        <Stack.Screen name="AddJustification" component={AddJustification}/>
                        <Stack.Screen name="AddValidJustification" component={AddValidJustificationScreen}/>
                        <Stack.Screen name="ValidJustifications" component={ValidJustificationsScreen}/>
                        <Stack.Screen name="Profile" component={ProfileScreen}/>
                        <Stack.Screen name="ManageUsersScreen">
                            {props => (
                                <ManageUsersScreen
                                    {...props}
                                    userRole={userRole}
                                    onLogout={handleLogout}
                                />
                            )}
                        </Stack.Screen>
                        <Stack.Screen name="ManageEnviromentScreen" component={ManageEnviromentScreen}/>
                        <Stack.Screen name="AttendanceReportScreen" component={AttendanceReportScreen}/>
                        <Stack.Screen name="SchoolConfigurationScreen" component={SchoolConfigurationScreen}/>
                        <Stack.Screen name="PendingJustificationScreen" component={PendingJustificationScreen}/>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}