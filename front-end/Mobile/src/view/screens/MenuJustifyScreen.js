import React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import PrimaryButton from '../components/auth/PrimaryButton';
import CustomLogo from '../components/common/logo';
import Separador from '../components/common/Separador';
import styles from './Style';
import { useTheme } from '../components/common/ThemeContext';
import { useLanguageRefresh } from '../../utils/useLanguageRefresh';
import { useMenuJustifyViewModel } from '../../viewmodels/useMenuJustifyViewModel';

export default function MenuJustifyScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const refreshKey = useLanguageRefresh();

  const {
    userRole,
    pendingCount,
    updateKey,
    handleBack,
    handleConsultJustify,
    handleAddOrEditJustify,
    handleValidJustifications,
  } = useMenuJustifyViewModel();

  // Componentes presentacionales reutilizados dentro de la pantalla
  const Header = ({ title }) => (
      <View style={styles.headerContainer}>
        <Text style={[styles.mainTitle, { color: colors.text }]}>
          {title}
        </Text>
        <CustomLogo
            size="small"
            rounded={true}
            backgroundColor={colors.card}
            marginBottom={35}
        />
      </View>
  );

  const MenuItem = ({ label, onPress, showBadge = false }) => (
      <>
        <Separador />
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <View style={styles.menuItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={[styles.sectionTitleMenu, { color: colors.text, flex: 1 }]}>
                {label}
              </Text>
              {showBadge && pendingCount > 0 && (
                  <View style={[styles.badgeContainer, { backgroundColor: colors.primary, marginLeft: 10 }]}>
                    <Text style={[styles.badgeText, { color: '#fff' }]}>
                      {pendingCount}
                    </Text>
                  </View>
              )}
            </View>
            <Image
                source={require('../../assets/images/flecha-volver.png')}
                style={[styles.arrowImage, { tintColor: colors.text }]}
            />
          </View>
        </TouchableOpacity>
      </>
  );

  return (
      <SafeAreaView
          style={[styles.safeAreaWhite, { backgroundColor: colors.backgroundWhite }]}
          key={`${refreshKey}-${updateKey}`}
      >
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardview}
        >
          <ScrollView
              style={styles.ScrollView}
              contentContainerStyle={styles.ScrollViewContent}
              showsVerticalScrollIndicator={false}
          >
            <View style={styles.containerMenuJustify}>
              {userRole === 'Estudiante' ? (
                  <View style={styles.mainContent}>
                    <Header title={t('justify.title')} />
                    <MenuItem
                        label={t('consultJustify.mainTitle')}
                        onPress={handleConsultJustify}
                    />
                    <MenuItem
                        label={t('justify.addAbsence')}
                        onPress={handleAddOrEditJustify}
                    />
                  </View>
              ) : (
                  <View style={styles.mainContent}>
                    <Header title={t('admin.justificationManagement')} />
                    <MenuItem
                        label={t('admin.validJustifications')}
                        onPress={handleValidJustifications}
                    />
                    <MenuItem
                        label={t('admin.pendingJustifications')}
                        // onPress={} – puedes añadir un manejador si es necesario
                        showBadge
                    />
                    <MenuItem
                        label={t('admin.addNewJustification')}
                        onPress={handleAddOrEditJustify}
                    />
                  </View>
              )}

              <View style={styles.spacer} />

              <View style={styles.buttonContainer}>
                <PrimaryButton
                    title={t('consultJustify.back')}
                    onPress={handleBack}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}