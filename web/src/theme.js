// Theme configuration matching frontend design system

// Base color values
export const colors = {
  // Primary colors
  primary: '#FF6B35',
  primaryLight: '#FF8F66',
  primaryDark: '#E54E1A',
  
  // Secondary colors
  secondary: '#6366F1',
  secondaryLight: '#818CF8',
  secondaryDark: '#4F46E5',
  
  // Accent colors
  accent: '#10B981',
  accentLight: '#34D399',
  accentDark: '#059669',
  
  // Background colors
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceLight: '#F3F4F6',
  surfaceLighter: '#E5E7EB',
  
  // Text colors
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Category colors
  nightout: '#FF6B35',
  trip: '#6366F1',
  
  // Utility colors
  border: '#E5E7EB',
  divider: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  white: '#FFFFFF',
  black: '#000000',
  
  // Chat colors
  messageSent: '#FF6B35',
  messageReceived: '#F3F4F6',
  
  // Expense colors
  positive: '#10B981',
  negative: '#EF4444',
  neutral: '#6B7280',
};

// Spacing scale
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  xxl: '3rem',      // 48px
};

// Border radius
export const borderRadius = {
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  xxl: '1.5rem',    // 24px
  full: '9999px',   // fully rounded
};

// Typography
export const typography = {
  h1: {
    fontSize: '2rem',         // 32px
    fontWeight: '700',
    lineHeight: '2.5rem',     // 40px
  },
  h2: {
    fontSize: '1.5rem',       // 24px
    fontWeight: '700',
    lineHeight: '2rem',       // 32px
  },
  h3: {
    fontSize: '1.25rem',      // 20px
    fontWeight: '600',
    lineHeight: '1.75rem',    // 28px
  },
  h4: {
    fontSize: '1.125rem',     // 18px
    fontWeight: '600',
    lineHeight: '1.5rem',     // 24px
  },
  subtitle: {
    fontSize: '1rem',         // 16px
    fontWeight: '600',
    lineHeight: '1.375rem',   // 22px
  },
  body: {
    fontSize: '1rem',         // 16px
    fontWeight: '400',
    lineHeight: '1.5rem',     // 24px
  },
  bodySmall: {
    fontSize: '0.875rem',     // 14px
    fontWeight: '400',
    lineHeight: '1.25rem',    // 20px
  },
  caption: {
    fontSize: '0.75rem',      // 12px
    fontWeight: '400',
    lineHeight: '1rem',       // 16px
  },
  button: {
    fontSize: '1rem',         // 16px
    fontWeight: '600',
    lineHeight: '1.5rem',     // 24px
  },
  buttonSmall: {
    fontSize: '0.875rem',     // 14px
    fontWeight: '600',
    lineHeight: '1.25rem',    // 20px
  },
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xxl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
};

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};

// Transitions
export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Export complete theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  breakpoints,
  zIndex,
  transitions,
};

export default theme;
