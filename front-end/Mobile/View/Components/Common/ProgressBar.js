import React from 'react';
import {
    View,
    Text,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import stylesCommon from './Style/Style';

export const ProgressBar = ({ currentStep, totalSteps }) => {
    const { t } = useTranslation();
    const progress = (currentStep / totalSteps) * 100;
    
    return (
        <View style={stylesCommon.progressContainer}>
            <Text style={stylesCommon.progressText}>{t('progressBar.question', { currentStep, totalSteps })}</Text>
            <View style={stylesCommon.progressBar}>
                <View style={[stylesCommon.progressFill, { width: `${progress}%` }]} />
            </View>
        </View>
    );
};