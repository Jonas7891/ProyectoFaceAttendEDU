import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {saveLanguageForRole} from '../view/components/common/languageByRole';
import {getCurrentUserRole} from "../services/UserService";
import {useLanguageRefresh} from '../utils/useLanguageRefresh';
import {request, GET} from '../api/apiClient';

function unwrap(data) {
  if (data && Array.isArray(data.value)) return data.value;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return [data];
  return [];
}

export function useMenuJustifyViewModel() {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();

    const [userRole, setUserRole] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    const updateKey = useLanguageRefresh();

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    const role = await getCurrentUserRole();
                    const finalRole = role || 'Estudiante';
                    setUserRole(finalRole);
                    await saveLanguageForRole(finalRole);

                    const jData = await request({ method: GET, url: 'justification', params: { _limit: 200 }, requiresAuth: false });
                    const records = unwrap(jData);
                    const pending = records.filter(j => j.review_status === 'Pending').length;
                    setPendingCount(pending);
                } catch (error) {
                    console.error('Error loading data:', error);
                    setUserRole('Estudiante');
                }
            };
            loadData();
        }, [])
    );

    const handleBack = useCallback(() => navigation.goBack(), [navigation]);
    const handleValidJustifications = useCallback(() => navigation.navigate('ValidJustifications'), [navigation]);
    const handlePendingJustificationScreen = useCallback(() => navigation.navigate('PendingJustificationScreen'), [navigation]);

    const handleAddOrEditJustify = useCallback(() => {
        const screenName = (userRole || '').toLowerCase().includes('estudiante') ? 'AddJustification' : 'AddValidJustification';
        navigation.navigate(screenName);
    }, [navigation, userRole]);

    return {
        userRole, pendingCount, updateKey,
        handleBack, handleAddOrEditJustify, handleValidJustifications, handlePendingJustificationScreen,
    };
}
