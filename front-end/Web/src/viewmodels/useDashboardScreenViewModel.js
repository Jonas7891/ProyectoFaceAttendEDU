import { useState, useMemo } from "react";
import { useAuth }           from "../context/AuthContext";
import { useRolePermissions } from "./useRolePermissions";

// Definición completa de todos los tabs posibles.
// Cada View decide si renderiza o no según los permisos.
// Soporta estructura jerárquica mediante la propiedad "children"
const ALL_TABS = [
    { key: "dashboard",    label: "Inicio",        icon: "layout"      },
    { key: "students",     label: "Alumnos",       icon: "users"       },
    { key: "courses",      label: "Cursos",        icon: "book-open"   },
    { key: "environments", label: "Ambientes",     icon: "home"        },
    { key: "reports",      label: "Reportes",      icon: "bar-chart-2" },
    { 
        key: "settings",     
        label: "Configuración",  
        icon: "settings",
        optionalNavigation: true, // No navega al hacer click, solo expande/contrae
        // Sub-secciones de configuración (se renderizarán como sub-items en la sidebar)
        children: [
            { key: "general",        label: "General",         icon: "globe",    adminOnly: true },
            { key: "facial",         label: "Reconocimiento",  icon: "aperture", adminOnly: true },
            { key: "notifications",  label: "Notificaciones",  icon: "bell",     adminOnly: false },
            { key: "security",       label: "Seguridad",       icon: "shield",   adminOnly: true },
            { key: "appearance",     label: "Apariencia",      icon: "sliders",  adminOnly: false },
        ]
    },
];

export function useDashboardScreenViewModel() {
    const permissions = useRolePermissions();

    // Filtra los tabs según los permisos del rol actual y aplica labels dinámicos
    const visibleTabs = useMemo(
        () => ALL_TABS
            .filter(t => permissions.visibleTabs.includes(t.key))
            .map(tab => {
                // Obtener label específico por rol si existe
                const roleSpecificLabel = permissions.getTabLabel(tab.key);
                
                // Procesar children si existen
                let processedChildren = undefined;
                if (tab.children) {
                    processedChildren = tab.children
                        .filter(child => !child.adminOnly || permissions.canManageUsers)
                        .map(child => ({
                            ...child,
                            // Aplicar label dinámico si existe
                            label: permissions.getTabLabel(child.key) || child.label,
                        }));
                }
                
                return {
                    ...tab,
                    label: roleSpecificLabel || tab.label,
                    children: processedChildren,
                    optionalNavigation: tab.optionalNavigation, // Preservar la propiedad
                };
            }),
        [permissions.visibleTabs, permissions.getTabLabel, permissions.canManageUsers]
    );

    // Si el tab inicial (dashboard) no fuera visible, toma el primero disponible
    const initialTab = (visibleTabs[0]?.key ?? "dashboard");
    const [currentTab, setCurrentTab] = useState(initialTab);
    
    // Estado para sub-tabs (para tabs jerárquicos como settings)
    const [currentSubTab, setCurrentSubTab] = useState(null);

    // Si por algún cambio de rol el tab actual ya no es visible, resetear
    const safeTab = permissions.visibleTabs.includes(currentTab)
        ? currentTab
        : initialTab;

    function setTab(key) {
        if (permissions.visibleTabs.includes(key)) {
            setCurrentTab(key);
            // Reset sub-tab cuando se cambia de tab principal
            setCurrentSubTab(null);
        }
    }
    
    function setSubTab(parentKey, subKey) {
        // Verificar que el tab principal esté visible
        if (permissions.visibleTabs.includes(parentKey)) {
            setCurrentTab(parentKey);
            setCurrentSubTab(subKey);
        }
    }

    return {
        currentTab: safeTab,
        currentSubTab,
        bottomTabs: visibleTabs || [],
        setTab,
        setSubTab,
    };
}
