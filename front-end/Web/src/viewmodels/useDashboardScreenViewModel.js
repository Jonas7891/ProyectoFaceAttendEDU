// ============================================================
//  FaceAttend EDU — Dashboard Screen ViewModel
//  Controla qué tab está activo y filtra los tabs según el
//  rol del usuario autenticado via AuthContext.
// ============================================================

import { useState, useMemo } from "react";
import { useAuth }           from "../context/AuthContext";
import { useRolePermissions } from "../view/hooks/useRolePermissions";

// Definición completa de todos los tabs posibles.
// Cada View decide si renderiza o no según los permisos.
const ALL_TABS = [
    { key: "dashboard",    label: "Inicio",        icon: "layout"      },
    { key: "students",     label: "Alumnos",        icon: "users"       },
    { key: "courses",      label: "Cursos",         icon: "book-open"   },
    { key: "environments", label: "Ambientes",      icon: "home"        },
    { key: "reports",      label: "Reportes",       icon: "bar-chart-2" },
    { key: "settings",     label: "Configuración",  icon: "settings"    },
];

export function useDashboardScreenViewModel() {
    const permissions = useRolePermissions();

    // Filtra los tabs según los permisos del rol actual
    const visibleTabs = useMemo(
        () => ALL_TABS.filter(t => permissions.visibleTabs.includes(t.key)),
        [permissions.visibleTabs]
    );

    // Si el tab inicial (dashboard) no fuera visible, toma el primero disponible
    const initialTab = (visibleTabs[0]?.key ?? "dashboard");
    const [currentTab, setCurrentTab] = useState(initialTab);

    // Si por algún cambio de rol el tab actual ya no es visible, resetear
    const safeTab = permissions.visibleTabs.includes(currentTab)
        ? currentTab
        : initialTab;

    function setTab(key) {
        if (permissions.visibleTabs.includes(key)) {
            setCurrentTab(key);
        }
    }

    return {
        currentTab: safeTab,
        bottomTabs: visibleTabs,
        setTab,
    };
}
