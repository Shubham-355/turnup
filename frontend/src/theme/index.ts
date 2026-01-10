// Base color values - Light Theme
const colorValues = {
  primary: '#FF6B35',
  primaryLight: '#FF8F66',
  primaryDark: '#E54E1A',
  secondary: '#6366F1',
  secondaryLight: '#818CF8',
  secondaryDark: '#4F46E5',
  accent: '#10B981',
  accentLight: '#34D399',
  accentDark: '#059669',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceLight: '#F3F4F6',
  surfaceLighter: '#E5E7EB',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  nightout: '#FF6B35',
  trip: '#6366F1',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  white: '#FFFFFF',
  black: '#000000',
};

export const colors = {
  // Flat colors (backward compatible)
  ...colorValues,
  overlay: 'rgba(0, 0, 0, 0.5)',
  skeleton: '#E5E7EB',
  messageSent: '#FF6B35',
  messageReceived: '#F3F4F6',
  positive: '#10B981',
  negative: '#EF4444',
  neutral: '#6B7280',

  // Nested structure (for new components)
  primary: {
    main: colorValues.primary,
    light: colorValues.primaryLight,
    dark: colorValues.primaryDark,
  },
  secondary: {
    main: colorValues.secondary,
    light: colorValues.secondaryLight,
    dark: colorValues.secondaryDark,
  },
  accent: {
    main: colorValues.accent,
    light: colorValues.accentLight,
    dark: colorValues.accentDark,
  },
  background: {
    primary: colorValues.background,
    secondary: colorValues.surface,
    tertiary: colorValues.surfaceLight,
    card: colorValues.surface,
  },
  text: {
    primary: colorValues.text,
    secondary: colorValues.textSecondary,
    tertiary: colorValues.textTertiary,
    inverse: colorValues.textInverse,
  },
  success: {
    main: colorValues.success,
    light: colorValues.successLight,
    dark: colorValues.accentDark,
  },
  warning: {
    main: colorValues.warning,
    light: colorValues.warningLight,
    dark: '#D97706',
  },
  error: {
    main: colorValues.error,
    light: colorValues.errorLight,
    dark: '#DC2626',
  },
  info: {
    main: colorValues.info,
    light: colorValues.infoLight,
    dark: '#2563EB',
  },
  category: {
    nightout: colorValues.nightout,
    trip: colorValues.trip,
  },
  border: {
    light: colorValues.border,
    main: colorValues.surfaceLighter,
    dark: colorValues.divider,
  },
  chat: {
    sent: colorValues.messageSent,
    received: colorValues.messageReceived,
  },
  expense: {
    positive: colorValues.positive,
    negative: colorValues.negative,
    neutral: colorValues.neutral,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export type Theme = typeof theme;
