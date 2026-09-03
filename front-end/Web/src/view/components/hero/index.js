/**
 * Barrel export para componentes hero genéricos
 * 
 * Componentes reutilizables para crear secciones hero en cualquier View.
 * Todos son configurables mediante props y soportan composición flexible.
 */

export { default as HeroSection } from './HeroSection';
export { default as HeroMediaSection } from './HeroMediaSection';
export { default as HeroStats } from './heroStats';
export { default as HeroTitle } from './heroTitle';

// Deprecated - usar Button directamente
// export { default as HeroButtons } from './heroButtons';

// Deprecated - usar HeroSection
// export { default as HeroLeft } from './heroLeft';

// Deprecated - usar HeroMediaSection
// export { default as HeroRight } from './heroRight';
