import React from 'react';
import {Image, Platform, SafeAreaView, Text, View,} from 'react-native';
import {useTranslation} from 'react-i18next';
import BottomBar from '../components/common/NavigationBar';
import ScrollViewWrapper from '../components/common/ScrollView';
import CustomTabs from '../components/common/CustomTabs';
import Separador from '../components/common/Separador';
import styles from './Style';
import {useTheme} from '../components/common/ThemeContext';
import {useNewsViewModel} from '../../viewmodels/useNewsViewModel';

export default function NewsScreen() {
    const { t } = useTranslation();
    const { colors, theme } = useTheme();

    const { userRole, updateKey } = useNewsViewModel();

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                { backgroundColor: colors.background }
            ]}
            key={`${updateKey}`}
        >
            <ScrollViewWrapper>
                <View style={styles.container} marginHorizontal={10}>
                    <CustomTabs userRole={userRole} />

                    <View style={{ marginLeft: 25, marginRight: 25 }}>
                        <Image
                            source={require('../../assets/images/persona.png')}
                            style={{
                                width: '100%',
                                height: 200,
                                marginTop: 40,
                                borderRadius: 10
                            }}
                        />
                    </View>

                    <View>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                marginTop: 30,
                                color: theme === 'dark' ? colors.primary : '#000000'
                            }}
                        >
                            {t('news.title')}
                        </Text>

                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '300',
                                marginTop: 15,
                                color: colors.textSecondary
                            }}
                        >
                            {t('news.creationDate')}: {t('news.unknownDate')}
                        </Text>
                    </View>

                    <View style={{ marginTop: 15 }}>
                        <Separador />
                    </View>

                    <View style={{ marginHorizontal: Platform.OS === 'android' ? 10 : 0 }}>
                        <Text
                            style={{
                                fontSize: 15,
                                marginTop: 15,
                                textAlign: 'justify',
                                color: colors.text
                            }}
                        >
                            {t('news.content')}
                        </Text>
                    </View>

                    <View style={styles.bottomSpace} />
                </View>
            </ScrollViewWrapper>

            <BottomBar />
        </SafeAreaView>
    );
}