/**
 * Barrel export para componentes de layout
 * 
 * Sistema completo de Sidebar con composition pattern.
 * Incluye container principal y sub-componentes para construcción flexible.
 * 
 * ## Componentes disponibles:
 * 
 * - **Sidebar**: Container principal con soporte para collapsed, animación, scroll, y accessibility
 * - **SidebarHeader**: Sección superior con soporte para título, close, toggle, y contenido custom
 * - **SidebarNav**: Contenedor scrollable para items de navegación
 * - **SidebarItem**: Item individual con icon, label, badge, estados (active, disabled), y variantes
 * - **SidebarFooter**: Sección inferior con soporte para texto informativo o contenido custom
 * - **SidebarDivider**: Separador visual entre secciones
 * 
 * ## Características principales:
 * 
 * ✅ Composition pattern (máxima flexibilidad)
 * ✅ Animated collapsed state (250ms timing)
 * ✅ Accessibility completa (WCAG 2.1 AA)
 * ✅ Theme-aware (light/dark mode)
 * ✅ Responsive (configurable width)
 * ✅ Scrollable (automático con ScrollView)
 * ✅ Position (left/right)
 * ✅ 4 variantes en items (default, danger, success, warning)
 * 
 * ## Ejemplo completo:
 * 
 * ```javascript
 * <Sidebar 
 *   width={240} 
 *   collapsible 
 *   collapsed={isCollapsed}
 *   onToggle={setIsCollapsed}
 *   animated
 * >
 *   <SidebarHeader 
 *     title="Mi App" 
 *     showToggle 
 *     onToggle={setIsCollapsed}
 *     collapsed={isCollapsed}
 *   />
 *   
 *   <SidebarNav>
 *     <SidebarItem 
 *       icon="home" 
 *       label="Inicio" 
 *       active 
 *       onPress={() => navigate('home')}
 *     />
 *     <SidebarItem 
 *       icon="users" 
 *       label="Usuarios" 
 *       badge={5}
 *       onPress={() => navigate('users')}
 *     />
 *     <SidebarItem 
 *       icon="settings" 
 *       label="Configuración" 
 *       onPress={() => navigate('settings')}
 *     />
 *   </SidebarNav>
 *   
 *   <SidebarDivider />
 *   
 *   <SidebarFooter>
 *     <SidebarItem 
 *       icon="log-out" 
 *       label="Cerrar sesión" 
 *       variant="danger"
 *       onPress={handleLogout}
 *     />
 *   </SidebarFooter>
 * </Sidebar>
 * ```
 * 
 * @see Sidebar.js para props del container
 * @see SidebarItem.js para props de items
 * @see LAYOUT_AUDIT.md para documentación completa
 */

export { default as Sidebar } from './Sidebar';
export { default as CollapsibleSidebar } from './CollapsibleSidebar';
export { default as SidebarHeader } from './SidebarHeader';
export { default as SidebarNav } from './SidebarNav';
export { default as SidebarItem } from './SidebarItem';
export { default as SidebarFooter } from './SidebarFooter';
export { default as SidebarDivider } from './SidebarDivider';
