// ============================================================
//  FaceAttend EDU — Dashboard Screen ViewModel
//  Controla qué tab está activo y la lógica de navegación
//  entre secciones del dashboard principal.
// ============================================================

import { useState } from "react";
import type { Tab } from "../models/types";

export type TabKey = "dashboard" | "students" | "courses" | "reports" | "settings";

export const BOTTOM_TABS: Tab[] = [
    { key: "dashboard", label: "Inicio",   icon: "layout"      },
    { key: "students",  label: "Alumnos",  icon: "users"       },
    { key: "courses",   label: "Cursos",   icon: "book-open"   },
    { key: "reports",   label: "Reportes", icon: "bar-chart-2" },
    { key: "settings",  label: "Config",   icon: "settings"    },
];

export interface DashboardScreenViewModel {
    currentTab:  TabKey;
    bottomTabs:  Tab[];
    setTab:      (key: TabKey) => void;
}

export function useDashboardScreenViewModel(): DashboardScreenViewModel {
    const [currentTab, setTab] = useState<TabKey>("dashboard");

    return {
        currentTab,
        bottomTabs: BOTTOM_TABS,
        setTab,
    };
}
