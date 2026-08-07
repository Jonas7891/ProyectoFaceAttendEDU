// ============================================================
//  FaceAttend EDU — Dashboard Screen ViewModel
//  Controla qué tab está activo y filtra los tabs según el
//  rol del usuario autenticado via AuthContext.
// ============================================================

import { useState, useMemo } from "react";
import { useAuth }           from "../context/AuthContext";
import { useRolePermissions } from "../view/hooks/useRolePermissions";
import type { Tab }           from "../models/types";

export type TabKey =
    | "dashboard"
    | "students"
    | "courses"
    | "environments"
    | "reports"
    | "settings";

// Definición completa de todos los tabs posibles.
// Cada View decide si renderiza o no según los permisos.
const ALL_TABS: Tab[] = [
    { key: "dashboard",    label: "Inicio",        icon: "layout"      },
    { key: "students",     label: "Alumnos",        icon: "users"       },
    { key: "courses",      label: "Cursos",         icon: "book-open"   },
    { key: "environments", label: "Ambientes",      icon: "home"        },
    { key: "reports",      label: "Reportes",       icon: "bar-chart-2" },
    { key: "settings",     label: "Configuración",  icon: "settings"    },
];

export interface DashboardScreenViewModel {
    currentTab:  TabKey;
    bottomTabs:  Tab[];
    setTab:      (key: TabKey) => void;
}

export function useDashboardScreenViewModel(): DashboardScreenViewModel {
    const permissions = useRolePermissions();

    // Filtra los tabs según los permisos del rol actual
    const visibleTabs = useMemo(
        () => ALL_TABS.filter(t => permissions.visibleTabs.includes(t.key as TabKey)),
        [permissions.visibleTabs]
    );

    // Si el tab inicial (dashboard) no fuera visible, toma el primero disponible
    const initialTab = (visibleTabs[0]?.key ?? "dashboard") as TabKey;
    const [currentTab, setCurrentTab] = useState<TabKey>(initialTab);

    // Si por algún cambio de rol el tab actual ya no es visible, resetear
    const safeTab = permissions.visibleTabs.includes(currentTab)
        ? currentTab
        : initialTab;

    function setTab(key: TabKey) {
        if (permissions.visibleTabs.includes(key)) {
            setCurrentTab(key);
        }
    }

    return {
        currentTab:  safeTab,
        bottomTabs:  visibleTabs,
        setTab,
    };
}
