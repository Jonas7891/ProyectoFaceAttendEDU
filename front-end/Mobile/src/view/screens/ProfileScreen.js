import React from 'react';
import {
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../components/common/ThemeContext';
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import PrimaryButton from '../components/auth/PrimaryButton';
import styles from './Style';
import { useProfileViewModel } from '../../viewmodels/useProfileViewModel';

export default function ProfileScreen() {
    const { t } = useTranslation();
    const { colors, theme } = useTheme();
    const refreshKey = useLanguageRefresh();

    const {
        userRole,
        userInfo,
        updateKey,
        handleBack,
        toggleTheme,
    } = useProfileViewModel();

    const InfoField = ({ label, value, icon }) => (
        <View style={styles.infoFieldContainerProfile}>
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
                <View style={styles.container} marginHorizontal={15}>
                    <View style={[styles.profileHeaderSectionProfile, { marginTop: Platform.OS === 'ios' ? 45 : 70 }]}>
                        <Text style={[styles.userNameProfile, { color: colors.text }]}>
                            {userInfo.name}
                        </Text>
                        <View
                            style={[
                                styles.roleBadgeProfile,
                                { backgroundColor: userRole === 'Administrador' ? colors.primary + '20' : colors.success + '20' },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.roleBadgeTextProfile,
                                    { color: userRole === 'Administrador' ? colors.primary : colors.primary },
                                ]}
                            >
                                {userInfo.role}
                            </Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 20 }}>
                        <Text style={[styles.sectionTitleMenuProfile, { color: colors.text, marginBottom: 10 }]}>
                            {t('profile.personalInfo')}
                        </Text>
                        <InfoField label={t('profile.email')} value={userInfo.email} />
                        <InfoField label={t('profile.employeeId')} value={userInfo.employeeId} />
                        <InfoField label={t('profile.joinDate')} value={userInfo.joinDate} />
                        <InfoField label={t('profile.school')} value={userInfo.colegio} />
                    </View>

                    <View style={{ marginTop: 25 }}>
                        <Text style={[styles.sectionTitleMenuProfile, { color: colors.text, marginBottom: 10 }]}>
                            {t('profile.quickSettings')}
                        </Text>
                        <TouchableOpacity
                            style={[styles.profileSettingsButtonProfile, { backgroundColor: colors.card }]}
                            onPress={toggleTheme}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View>
                                    <Text style={[styles.profileSettingsTitleProfile, { color: colors.text }]}>
                                        {t('settings.theme')}
                                    </Text>
                                    <Text style={[styles.profileSettingsSubtitleProfile, { color: colors.textSecondary }]}>
                                        {theme === 'dark' ? t('settings.darkTheme') : t('settings.lightTheme')}
                                    </Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 14, color: colors.text, textDecorationLine: 'underline' }}>
                                {t('settings.changeTheme')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginTop: Platform.OS === 'ios' ? 50 : 80 }}>
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