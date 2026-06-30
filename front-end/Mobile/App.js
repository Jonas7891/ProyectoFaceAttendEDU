import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from './src/view/components/common/ThemeContext';
import { AlertsConfigProvider } from './src/utils/AlertsConfigContext';
import { UserProvider } from './src/utils/UserContext';
import i18n from './src/utils/i18n';
import AppNavigator from './src/navigations/AppNavigator';

export default function App() {
  return (
    <AlertsConfigProvider>
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          <UserProvider>
            <AppNavigator />
          </UserProvider>
        </I18nextProvider>
      </ThemeProvider>
    </AlertsConfigProvider>
  );
}