// ============================================================
//  SessionManager — Componente que maneja las advertencias de sesión
// ============================================================
//
//  Este componente:
//  ✓ Monitorea el estado del timeout de sesión
//  ✓ Muestra advertencias cuando la sesión está por expirar
//  ✓ Permite al usuario extender o cerrar la sesión
//
//  Uso: Debe renderizarse en el nivel superior de la app autenticada
// ============================================================

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import SessionWarningModal from '../common/feedback/SessionWarningModal';

export default function SessionManager() {
    const { sessionTimeout, logout } = useAuth();

    if (!sessionTimeout) return null;

    const handleExtendSession = () => {
        if (sessionTimeout?.resetTimer) {
            sessionTimeout.resetTimer();
        }
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <SessionWarningModal
            visible={sessionTimeout.isWarning}
            timeRemaining={sessionTimeout.timeRemaining}
            onExtendSession={handleExtendSession}
            onLogout={handleLogout}
        />
    );
}