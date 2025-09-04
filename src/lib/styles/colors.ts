/**
 * Color System for DTP Attendance
 *
 * This file defines the color hierarchy using Tailwind CSS v4 @theme directive
 * and provides utility functions for consistent color usage across components.
 */

// Base color palette (HSL values for better color manipulation)
export const baseColors = {
  // Primary brand colors
  primary: {
    50: 'hsl(210, 100%, 98%)',   // Very light blue
    100: 'hsl(210, 100%, 96%)',  // Light blue
    200: 'hsl(214, 95%, 93%)',   // Lighter blue
    300: 'hsl(213, 97%, 87%)',   // Light blue
    400: 'hsl(215, 100%, 80%)',  // Medium light blue
    500: 'hsl(217, 91%, 60%)',   // Main blue
    600: 'hsl(221, 83%, 53%)',   // Medium blue
    700: 'hsl(224, 76%, 48%)',   // Dark blue
    800: 'hsl(226, 71%, 40%)',   // Darker blue
    900: 'hsl(224, 64%, 33%)',   // Very dark blue
    950: 'hsl(229, 84%, 18%)',   // Darkest blue
  },
  
  // Secondary accent colors
  secondary: {
    50: 'hsl(220, 14%, 96%)',    // Very light gray-blue
    100: 'hsl(220, 13%, 91%)',   // Light gray-blue
    200: 'hsl(220, 13%, 81%)',   // Lighter gray-blue
    300: 'hsl(216, 12%, 84%)',   // Light gray-blue
    400: 'hsl(218, 11%, 65%)',   // Medium light gray-blue
    500: 'hsl(220, 9%, 46%)',    // Main gray-blue
    600: 'hsl(215, 14%, 34%)',   // Medium gray-blue
    700: 'hsl(217, 19%, 27%)',   // Dark gray-blue
    800: 'hsl(215, 28%, 17%)',   // Darker gray-blue
    900: 'hsl(221, 39%, 11%)',   // Very dark gray-blue
    950: 'hsl(229, 84%, 5%)',    // Darkest gray-blue
  },
  
  // Success colors
  success: {
    50: 'hsl(138, 76%, 97%)',    // Very light green
    100: 'hsl(141, 84%, 93%)',   // Light green
    200: 'hsl(141, 79%, 85%)',   // Lighter green
    300: 'hsl(142, 77%, 73%)',   // Light green
    400: 'hsl(142, 69%, 58%)',   // Medium light green
    500: 'hsl(142, 71%, 45%)',   // Main green
    600: 'hsl(142, 76%, 36%)',   // Medium green
    700: 'hsl(142, 72%, 29%)',   // Dark green
    800: 'hsl(143, 64%, 24%)',   // Darker green
    900: 'hsl(144, 61%, 20%)',   // Very dark green
    950: 'hsl(145, 80%, 14%)',   // Darkest green
  },
  
  // Warning colors
  warning: {
    50: 'hsl(48, 100%, 96%)',    // Very light yellow
    100: 'hsl(48, 96%, 89%)',    // Light yellow
    200: 'hsl(48, 96%, 77%)',    // Lighter yellow
    300: 'hsl(47, 95%, 57%)',    // Light yellow
    400: 'hsl(47, 95%, 44%)',    // Medium light yellow
    500: 'hsl(47, 96%, 89%)',    // Main yellow
    600: 'hsl(35, 100%, 50%)',   // Medium orange
    700: 'hsl(32, 95%, 44%)',    // Dark orange
    800: 'hsl(26, 90%, 37%)',    // Darker orange
    900: 'hsl(23, 83%, 31%)',    // Very dark orange
    950: 'hsl(15, 100%, 15%)',   // Darkest orange
  },
  
  // Error colors
  error: {
    50: 'hsl(0, 85%, 97%)',      // Very light red
    100: 'hsl(0, 93%, 94%)',     // Light red
    200: 'hsl(0, 96%, 89%)',     // Lighter red
    300: 'hsl(0, 94%, 82%)',     // Light red
    400: 'hsl(0, 91%, 71%)',     // Medium light red
    500: 'hsl(0, 84%, 60%)',     // Main red
    600: 'hsl(0, 72%, 51%)',     // Medium red
    700: 'hsl(0, 74%, 42%)',     // Dark red
    800: 'hsl(0, 70%, 35%)',     // Darker red
    900: 'hsl(0, 63%, 31%)',     // Very dark red
    950: 'hsl(0, 85%, 15%)',     // Darkest red
  },
  
  // Neutral colors
  neutral: {
    50: 'hsl(0, 0%, 98%)',       // Very light gray
    100: 'hsl(0, 0%, 96%)',      // Light gray
    200: 'hsl(0, 0%, 90%)',      // Lighter gray
    300: 'hsl(0, 0%, 83%)',      // Light gray
    400: 'hsl(0, 0%, 64%)',      // Medium light gray
    500: 'hsl(0, 0%, 45%)',      // Main gray
    600: 'hsl(0, 0%, 32%)',      // Medium gray
    700: 'hsl(0, 0%, 25%)',      // Dark gray
    800: 'hsl(0, 0%, 15%)',      // Darker gray
    900: 'hsl(0, 0%, 9%)',       // Very dark gray
    950: 'hsl(0, 0%, 4%)',       // Darkest gray
  },
} as const;

// Semantic color mapping
export const semanticColors = {
  // Background colors
  background: {
    primary: baseColors.neutral[50],
    secondary: baseColors.neutral[100],
    tertiary: baseColors.neutral[200],
    card: baseColors.neutral[50],
    muted: baseColors.neutral[100],
    accent: baseColors.primary[50],
  },
  
  // Text colors
  text: {
    primary: baseColors.neutral[900],
    secondary: baseColors.neutral[700],
    tertiary: baseColors.neutral[500],
    muted: baseColors.neutral[400],
    inverse: baseColors.neutral[50],
    accent: baseColors.primary[700],
  },
  
  // Border colors
  border: {
    primary: baseColors.neutral[200],
    secondary: baseColors.neutral[300],
    accent: baseColors.primary[200],
    muted: baseColors.neutral[100],
  },
  
  // Interactive colors
  interactive: {
    primary: baseColors.primary[600],
    primaryHover: baseColors.primary[700],
    primaryActive: baseColors.primary[800],
    secondary: baseColors.secondary[600],
    secondaryHover: baseColors.secondary[700],
    secondaryActive: baseColors.secondary[800],
  },
  
  // Status colors
  status: {
    success: baseColors.success[600],
    successLight: baseColors.success[100],
    warning: baseColors.warning[600],
    warningLight: baseColors.warning[100],
    error: baseColors.error[600],
    errorLight: baseColors.error[100],
    info: baseColors.primary[600],
    infoLight: baseColors.primary[100],
  },
} as const;

// Color utility functions
export function getColor(colorPath: string): string {
  const path = colorPath.split('.');
  let current: Record<string, any> = { ...baseColors, ...semanticColors };
  
  for (const key of path) {
    if (current[key] !== undefined) {
      current = current[key];
    } else {
      console.warn(`Color path "${colorPath}" not found`);
      return baseColors.neutral[500]; // Fallback
    }
  }
  
  return current;
}

export function getColorWithOpacity(colorPath: string, opacity: number): string {
  const color = getColor(colorPath);
  if (color.startsWith('hsl(')) {
    return color.replace(')', `, ${opacity})`).replace('hsl(', 'hsla(');
  }
  return color;
}

export function getContrastColor(backgroundColor: string): string {
  // Simple contrast calculation for light/dark backgrounds
  if (backgroundColor.includes('hsl(')) {
    const lightness = parseInt(backgroundColor.match(/,\s*(\d+)%/)![1]);
    return lightness > 50 ? baseColors.neutral[900] : baseColors.neutral[50];
  }
  return baseColors.neutral[900]; // Fallback
}

// CSS custom properties for use in CSS-in-JS or global styles
export const colorCSSVariables = {
  // Base colors
  '--color-primary-50': baseColors.primary[50],
  '--color-primary-100': baseColors.primary[100],
  '--color-primary-200': baseColors.primary[200],
  '--color-primary-300': baseColors.primary[300],
  '--color-primary-400': baseColors.primary[400],
  '--color-primary-500': baseColors.primary[500],
  '--color-primary-600': baseColors.primary[600],
  '--color-primary-700': baseColors.primary[700],
  '--color-primary-800': baseColors.primary[800],
  '--color-primary-900': baseColors.primary[900],
  '--color-primary-950': baseColors.primary[950],
  
  '--color-secondary-50': baseColors.secondary[50],
  '--color-secondary-100': baseColors.secondary[100],
  '--color-secondary-200': baseColors.secondary[200],
  '--color-secondary-300': baseColors.secondary[300],
  '--color-secondary-400': baseColors.secondary[400],
  '--color-secondary-500': baseColors.secondary[500],
  '--color-secondary-600': baseColors.secondary[600],
  '--color-secondary-700': baseColors.secondary[700],
  '--color-secondary-800': baseColors.secondary[800],
  '--color-secondary-900': baseColors.secondary[900],
  '--color-secondary-950': baseColors.secondary[950],
  
  '--color-success-50': baseColors.success[50],
  '--color-success-100': baseColors.success[100],
  '--color-success-200': baseColors.success[200],
  '--color-success-300': baseColors.success[300],
  '--color-success-400': baseColors.success[400],
  '--color-success-500': baseColors.success[500],
  '--color-success-600': baseColors.success[600],
  '--color-success-700': baseColors.success[700],
  '--color-success-800': baseColors.success[800],
  '--color-success-900': baseColors.success[900],
  '--color-success-950': baseColors.success[950],
  
  '--color-warning-50': baseColors.warning[50],
  '--color-warning-100': baseColors.warning[100],
  '--color-warning-200': baseColors.warning[200],
  '--color-warning-300': baseColors.warning[300],
  '--color-warning-400': baseColors.warning[400],
  '--color-warning-500': baseColors.warning[500],
  '--color-warning-600': baseColors.warning[600],
  '--color-warning-700': baseColors.warning[700],
  '--color-warning-800': baseColors.warning[800],
  '--color-warning-900': baseColors.warning[900],
  '--color-warning-950': baseColors.warning[950],
  
  '--color-error-50': baseColors.error[50],
  '--color-error-100': baseColors.error[100],
  '--color-error-200': baseColors.error[200],
  '--color-error-300': baseColors.error[300],
  '--color-error-400': baseColors.error[400],
  '--color-error-500': baseColors.error[500],
  '--color-error-600': baseColors.error[600],
  '--color-error-700': baseColors.error[700],
  '--color-error-800': baseColors.error[800],
  '--color-error-900': baseColors.error[900],
  '--color-error-950': baseColors.error[950],
  
  '--color-neutral-50': baseColors.neutral[50],
  '--color-neutral-100': baseColors.neutral[100],
  '--color-neutral-200': baseColors.neutral[200],
  '--color-neutral-300': baseColors.neutral[300],
  '--color-neutral-400': baseColors.neutral[400],
  '--color-neutral-500': baseColors.neutral[500],
  '--color-neutral-600': baseColors.neutral[600],
  '--color-neutral-700': baseColors.neutral[700],
  '--color-neutral-800': baseColors.neutral[800],
  '--color-neutral-900': baseColors.neutral[900],
  '--color-neutral-950': baseColors.neutral[950],
  
  // Semantic colors
  '--color-background-primary': semanticColors.background.primary,
  '--color-background-secondary': semanticColors.background.secondary,
  '--color-background-tertiary': semanticColors.background.tertiary,
  '--color-background-card': semanticColors.background.card,
  '--color-background-muted': semanticColors.background.muted,
  '--color-background-accent': semanticColors.background.accent,
  
  '--color-text-primary': semanticColors.text.primary,
  '--color-text-secondary': semanticColors.text.secondary,
  '--color-text-tertiary': semanticColors.text.tertiary,
  '--color-text-muted': semanticColors.text.muted,
  '--color-text-inverse': semanticColors.text.inverse,
  '--color-text-accent': semanticColors.text.accent,
  
  '--color-border-primary': semanticColors.border.primary,
  '--color-border-secondary': semanticColors.border.secondary,
  '--color-border-accent': semanticColors.border.accent,
  '--color-border-muted': semanticColors.border.muted,
  
  '--color-interactive-primary': semanticColors.interactive.primary,
  '--color-interactive-primary-hover': semanticColors.interactive.primaryHover,
  '--color-interactive-primary-active': semanticColors.interactive.primaryActive,
  '--color-interactive-secondary': semanticColors.interactive.secondary,
  '--color-interactive-secondary-hover': semanticColors.interactive.secondaryHover,
  '--color-interactive-secondary-active': semanticColors.interactive.secondaryActive,
  
  '--color-status-success': semanticColors.status.success,
  '--color-status-success-light': semanticColors.status.successLight,
  '--color-status-warning': semanticColors.status.warning,
  '--color-status-warning-light': semanticColors.status.warningLight,
  '--color-status-error': semanticColors.status.error,
  '--color-status-error-light': semanticColors.status.errorLight,
  '--color-status-info': semanticColors.status.info,
  '--color-status-info-light': semanticColors.status.infoLight,
} as const;

// Tailwind CSS v4 @theme directive content
export const colorThemeDirective = `
@theme {
  /* Base Colors */
  --color-primary-50: ${baseColors.primary[50]};
  --color-primary-100: ${baseColors.primary[100]};
  --color-primary-200: ${baseColors.primary[200]};
  --color-primary-300: ${baseColors.primary[300]};
  --color-primary-400: ${baseColors.primary[400]};
  --color-primary-500: ${baseColors.primary[500]};
  --color-primary-600: ${baseColors.primary[600]};
  --color-primary-700: ${baseColors.primary[700]};
  --color-primary-800: ${baseColors.primary[800]};
  --color-primary-900: ${baseColors.primary[900]};
  --color-primary-950: ${baseColors.primary[950]};
  
  --color-secondary-50: ${baseColors.secondary[50]};
  --color-secondary-100: ${baseColors.secondary[100]};
  --color-secondary-200: ${baseColors.secondary[200]};
  --color-secondary-300: ${baseColors.secondary[300]};
  --color-secondary-400: ${baseColors.secondary[400]};
  --color-secondary-500: ${baseColors.secondary[500]};
  --color-secondary-600: ${baseColors.secondary[600]};
  --color-secondary-700: ${baseColors.secondary[700]};
  --color-secondary-800: ${baseColors.secondary[800]};
  --color-secondary-900: ${baseColors.secondary[900]};
  --color-secondary-950: ${baseColors.secondary[950]};
  
  --color-success-50: ${baseColors.success[50]};
  --color-success-100: ${baseColors.success[100]};
  --color-success-200: ${baseColors.success[200]};
  --color-success-300: ${baseColors.success[300]};
  --color-success-400: ${baseColors.success[400]};
  --color-success-500: ${baseColors.success[500]};
  --color-success-600: ${baseColors.success[600]};
  --color-success-700: ${baseColors.success[700]};
  --color-success-800: ${baseColors.success[800]};
  --color-success-900: ${baseColors.success[900]};
  --color-success-950: ${baseColors.success[950]};
  
  --color-warning-50: ${baseColors.warning[50]};
  --color-warning-100: ${baseColors.warning[100]};
  --color-warning-200: ${baseColors.warning[200]};
  --color-warning-300: ${baseColors.warning[300]};
  --color-warning-400: ${baseColors.warning[400]};
  --color-warning-500: ${baseColors.warning[500]};
  --color-warning-600: ${baseColors.warning[600]};
  --color-warning-700: ${baseColors.warning[700]};
  --color-warning-800: ${baseColors.warning[800]};
  --color-warning-900: ${baseColors.warning[900]};
  --color-warning-950: ${baseColors.warning[950]};
  
  --color-error-50: ${baseColors.error[50]};
  --color-error-100: ${baseColors.error[100]};
  --color-error-200: ${baseColors.error[200]};
  --color-error-300: ${baseColors.error[300]};
  --color-error-400: ${baseColors.error[400]};
  --color-error-500: ${baseColors.error[500]};
  --color-error-600: ${baseColors.error[600]};
  --color-error-700: ${baseColors.error[700]};
  --color-error-800: ${baseColors.error[800]};
  --color-error-900: ${baseColors.error[900]};
  --color-error-950: ${baseColors.error[950]};
  
  --color-neutral-50: ${baseColors.neutral[50]};
  --color-neutral-100: ${baseColors.neutral[100]};
  --color-neutral-200: ${baseColors.neutral[200]};
  --color-neutral-300: ${baseColors.neutral[300]};
  --color-neutral-400: ${baseColors.neutral[400]};
  --color-neutral-500: ${baseColors.neutral[500]};
  --color-neutral-600: ${baseColors.neutral[600]};
  --color-neutral-700: ${baseColors.neutral[700]};
  --color-neutral-800: ${baseColors.neutral[800]};
  --color-neutral-900: ${baseColors.neutral[900]};
  --color-neutral-950: ${baseColors.neutral[950]};
  
  /* Semantic Colors */
  --color-background-primary: ${semanticColors.background.primary};
  --color-background-secondary: ${semanticColors.background.secondary};
  --color-background-tertiary: ${semanticColors.background.tertiary};
  --color-background-card: ${semanticColors.background.card};
  --color-background-muted: ${semanticColors.background.muted};
  --color-background-accent: ${semanticColors.background.accent};
  
  --color-text-primary: ${semanticColors.text.primary};
  --color-text-secondary: ${semanticColors.text.secondary};
  --color-text-tertiary: ${semanticColors.text.tertiary};
  --color-text-muted: ${semanticColors.text.muted};
  --color-text-inverse: ${semanticColors.text.inverse};
  --color-text-accent: ${semanticColors.text.accent};
  
  --color-border-primary: ${semanticColors.border.primary};
  --color-border-secondary: ${semanticColors.border.secondary};
  --color-border-accent: ${semanticColors.border.accent};
  --color-border-muted: ${semanticColors.border.muted};
  
  --color-interactive-primary: ${semanticColors.interactive.primary};
  --color-interactive-primary-hover: ${semanticColors.interactive.primaryHover};
  --color-interactive-primary-active: ${semanticColors.interactive.primaryActive};
  --color-interactive-secondary: ${semanticColors.interactive.secondary};
  --color-interactive-secondary-hover: ${semanticColors.interactive.secondaryHover};
  --color-interactive-secondary-active: ${semanticColors.interactive.secondaryActive};
  
  --color-status-success: ${semanticColors.status.success};
  --color-status-success-light: ${semanticColors.status.successLight};
  --color-status-warning: ${semanticColors.status.warning};
  --color-status-warning-light: ${semanticColors.status.warningLight};
  --color-status-error: ${semanticColors.status.error};
  --color-status-error-light: ${semanticColors.status.errorLight};
  --color-status-info: ${semanticColors.status.info};
  --color-status-info-light: ${semanticColors.status.infoLight};
}
`;

// Type exports for use in components
export type BaseColors = typeof baseColors;
export type SemanticColors = typeof semanticColors;
export type ColorPath = string;
