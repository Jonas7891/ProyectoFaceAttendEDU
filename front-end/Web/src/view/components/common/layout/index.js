/**
 * Barrel export para componentes de layout
 * 
 * Sistema completo de Sidebar con composition pattern.
 * Incluye container principal y sub-componentes para construcción flexible.
 * 
 * ## Componentes disponibles:
 * 
 * - **Sidebar**: Container principal con soporte para collapsed, animación, y accessibility
 * - **CollapsibleSidebar**: Sidebar con pestañita, swipe, y overlay (móvil)
 * - **SidebarHeader**: Sección superior con soporte para título, close, toggle
 * - **SidebarNav**: Contenedor scrollable para items de navegación
 * - **SidebarItem**: Item individual con icon, label, badge, estados y variantes
 * - **SidebarFooter**: Sección inferior con soporte para texto o contenido custom
 * - **SidebarDivider**: Separador visual entre secciones
 * 
 * ## Utilities:
 * 
 * - **SIDEBAR_CONSTANTS**: Constantes compartidas (dimensiones, animaciones, spacing)
 * - **getVariantColors**: Función para obtener colores según variante y estado
 * 
 * ## Características:
 * 
 * ✅ Composition pattern (máxima flexibilidad)
 * ✅ Código limpio sin duplicaciones
 * ✅ Hooks personalizados para animaciones y gestos
 * ✅ Accessibility completa (WCAG 2.1 AA)
 * ✅ Theme-aware (light/dark mode)
 * ✅ Responsive (desktop/móvil)
 * 
 * @example
 * import { CollapsibleSidebar, SidebarHeader, SidebarNav, SidebarItem } from './layout';
 * 
 * <CollapsibleSidebar>
 *   <SidebarHeader title="Mi App" />
 *   <SidebarNav>
 *     <SidebarItem icon="home" label="Inicio" active />
 *     <SidebarItem icon="users" label="Usuarios" badge={5} />
 *   </SidebarNav>
 * </CollapsibleSidebar>
 */

export { default as Sidebar } from './Sidebar';
export { default as CollapsibleSidebar } from './CollapsibleSidebar';
export { default as SidebarHeader } from './SidebarHeader';
export { default as SidebarNav } from './SidebarNav';
export { default as SidebarItem } from './SidebarItem';
export { default as SidebarFooter } from './SidebarFooter';
export { default as SidebarDivider } from './SidebarDivider';

// Exportar utilities
export { SIDEBAR_CONSTANTS, getVariantColors } from './constants';
