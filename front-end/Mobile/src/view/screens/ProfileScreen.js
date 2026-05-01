import React, { useState, useEffect, useCallback } from "react";
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    Platform
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../components/common/ThemeContext';
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { saveLanguageForRole } from '../components/common/languageByRole';
import BottomBar from "../components/common/NavigationBar";
import PrimaryButton from "../components/auth/PrimaryButton";
import LanguageSelector from '../components/common/LanguageSelector';
import styles from "./Style";

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { colors, theme, toggleTheme, loadThemeForRole } = useTheme();
    const refreshKey = useLanguageRefresh();

    const [userRole, setUserRole] = useState(null);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [updateKey, setUpdateKey] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const handleBack = () => navigation.goBack();
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        role: '',
        joinDate: '',
        colegio: '',
    });

    const mockUserData = {
        admin: {
            name: "Jonattan Rizo",
            email: "admin@empresa.com",
            role: "Administrador",
            joinDate: "15/01/2024",
            employeeId: "ADM-001",
            colegio: "Instituto Tecnico Superior Neiva",
        },
        student: {
            name: "The Jonas",
            email: "estudiante@empresa.com",
            role: "Estudiante",
            joinDate: "20/03/2024",
            employeeId: "EST-042",
            colegio: "Instituto Tecnico Superior Neiva",
        }
    };

    useEffect(() => {
        const handleLanguageChanged = (lng) => {
            setCurrentLanguage(lng);
            setUpdateKey(prev => prev + 1);
        };

        setCurrentLanguage(i18n.language);
        i18n.on('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            const loadUserData = async () => {
                try {
                    const role = await AsyncStorage.getItem('userRole');
                    setUserRole(role);

                    if (role === 'admin') {
                        setUserInfo(mockUserData.admin);
                    } else {
                        setUserInfo(mockUserData.student);
                    }

                    if (role) {
                        await loadThemeForRole(role);
                    }
                } catch (error) {
                    console.error('Error cargando datos de usuario:', error);
                }
            };
            loadUserData();
        }, [])
    );

    const handleLogout = async () => {
        Alert.alert(
            t('profile.logout'),
            t('profile.logoutConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.accept'),
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            if (userRole) {
                                await saveLanguageForRole(userRole, i18n.language);
                            }
                            await AsyncStorage.removeItem('userRole');
                            navigation.navigate("login");
                        } catch (error) {
                            console.error('Error en logout:', error);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSettings = () => navigation.navigate("Menu");
    const handleProfile = () => navigation.navigate("UpdatePhoto");
    const handleSearch = () => navigation.navigate("DisplayingAttendance");

    const InfoField = ({ label, value, icon }) => (
        <View style={[
            styles.infoFieldContainerProfile,
        ]}>
            <Text style={[styles.infoFieldLabelProfile, { color: colors.textSecondary }]}>
                {icon && <Text>{icon}  </Text>}
                {label}
            </Text>
            <Text style={[styles.infoFieldValueProfile, { color: colors.text }]}>
                {value}
            </Text>
        </View>
    );

    return (
        <SafeAreaView
            style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]}
            key={`${refreshKey}-${updateKey}`}            
        >
            <ScrollView contentContainerStyle={styles.ScrollViewContent}>
                <View style={styles.container} marginHorizontal={15} >

                    <View style={[styles.profileHeaderSectionProfile, { marginTop: Platform.OS === 'ios' ? 30 : 40 }]}>
                        <Text style={[styles.userNameProfile, { color: colors.text }]}>
                            {userInfo.name}
                        </Text>

                        <View style={[
                            styles.roleBadgeProfile,
                            { backgroundColor: userRole === 'admin' ? colors.primary + '20' : colors.success + '20' }
                        ]}>
                            <Text style={[
                                styles.roleBadgeTextProfile,
                                { color: userRole === 'admin' ? colors.primary : colors.primary }
                            ]}>
                                {userInfo.role}
                            </Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={[styles.sectionTitleMenuProfile, { color: colors.text, marginBottom: 10 }]}>
                            {t('profile.personalInfo')}
                        </Text>

                        <InfoField
                            label={t('profile.email')}
                            value={userInfo.email}
                        />

                        <InfoField
                            label={t('profile.employeeId')}
                            value={userInfo.employeeId}
                        />

                        <InfoField
                            label={t('profile.joinDate')}
                            value={userInfo.joinDate}
                        />

                        <InfoField
                            label={t('profile.school')}
                            value={userInfo.colegio}
                        />
                    </View>

                    <View style={{ marginTop: 25 }}>
                        <Text style={[styles.sectionTitleMenuProfile, { color: colors.text, marginBottom: 10 }]}>
                            {t('profile.quickSettings')}
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.profileSettingsButtonProfile,
                                { backgroundColor: colors.card }
                            ]}
                            onPress={toggleTheme}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View>
                                    <Text style={[styles.profileSettingsTitleProfile, { color: colors.text }]}>
                                        {t('settings.theme')}
                                    </Text>
                                    <Text style={[styles.profileSettingsSubtitleProfile, { color: colors.textSecondary }]}>
                                        {theme === 'dark'
                                            ? t('settings.darkTheme')
                                            : t('settings.lightTheme')}
                                    </Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 14, color: colors.text, textDecorationLine: 'underline' }}>
                                {t('settings.changeTheme')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{
                        marginTop: Platform.OS === 'ios' ? 50 : 80,
                    }}>
                        <View style={styles.buttonContainer} marginTop={60}>
                            <PrimaryButton
                                title={t('consultJustify.back')}
                                onPress={handleBack}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}