/**
 * Centralized theme configuration for consistent fonts and colors across the website
 * Uses CSS custom properties defined in index.css
 */

// Font families
export const FONTS = {
  display: 'var(--font-display)',  // 'Bebas Neue', sans-serif
  body: 'var(--font-body)',        // 'Inter', sans-serif
};

// Brand color palette - corresponds to Tailwind brand-* classes
export const COLORS = {
  // Primary palette (earth tones)
  dark: 'var(--color-earth-dark)',        // #0D0907 - Main dark background
  brown: 'var(--color-earth-brown)',      // #2C1810 - Border/accent
  forest: 'var(--color-forest)',          // #161616 - Secondary dark
  beige: 'var(--color-beige)',            // #F2F2F2 - Light background
  stone: 'var(--color-stone)',            // #A0A0A0 - Medium gray
  rust: 'var(--color-rust)',              // #3b3b3b - Dark gray/text
  
  // Extended palette
  lightGray: 'var(--color-light-gray)',   // #D4D4D4
  darkGray: 'var(--color-dark-gray)',     // #8B8B8B
  veryDark: 'var(--color-very-dark)',     // #0D0D0D
};

// Tailwind class mappings for easy use
export const BRAND_CLASSES = {
  // Backgrounds
  bgDark: 'bg-brand-dark',
  bgBrown: 'bg-brand-brown',
  bgForest: 'bg-brand-forest',
  bgBeige: 'bg-brand-beige',
  bgStone: 'bg-brand-stone',
  bgRust: 'bg-brand-rust',
  bgLightGray: 'bg-brand-light-gray',
  bgDarkGray: 'bg-brand-dark-gray',
  
  // Text colors
  textDark: 'text-brand-dark',
  textBrown: 'text-brand-brown',
  textForest: 'text-brand-forest',
  textBeige: 'text-brand-beige',
  textStone: 'text-brand-stone',
  textRust: 'text-brand-rust',
  textLightGray: 'text-brand-light-gray',
  textDarkGray: 'text-brand-dark-gray',
  
  // Borders
  borderDark: 'border-brand-dark',
  borderBrown: 'border-brand-brown',
  borderForest: 'border-brand-forest',
  borderBeige: 'border-brand-beige',
  borderStone: 'border-brand-stone',
  borderRust: 'border-brand-rust',
  borderLightGray: 'border-brand-light-gray',
  borderDarkGray: 'border-brand-dark-gray',
  
  // Font families
  fontDisplay: 'font-display',
  fontBody: 'font-body',
};

// Recommended color combinations
export const COLOR_COMBINATIONS = {
  // Primary: Dark backgrounds with stone text
  primary: {
    bg: BRAND_CLASSES.bgDark,
    text: BRAND_CLASSES.textStone,
    border: BRAND_CLASSES.borderRust,
  },
  
  // Secondary: Forest backgrounds with beige/stone text
  secondary: {
    bg: BRAND_CLASSES.bgForest,
    text: BRAND_CLASSES.textStone,
    border: BRAND_CLASSES.borderRust,
  },
  
  // Accent: Stone backgrounds with dark text
  accent: {
    bg: BRAND_CLASSES.bgStone,
    text: BRAND_CLASSES.textDark,
    border: BRAND_CLASSES.borderRust,
  },
  
  // Light: Beige backgrounds with dark text
  light: {
    bg: BRAND_CLASSES.bgBeige,
    text: BRAND_CLASSES.textDark,
    border: BRAND_CLASSES.borderRust,
  },
};

// Default font families for common elements
export const ELEMENT_FONTS = {
  headings: FONTS.display,      // Use Bebas Neue for headings
  body: FONTS.body,             // Use Inter for body text
  nav: FONTS.body,              // Use Inter for navigation
  buttons: FONTS.body,          // Use Inter for buttons
};

// Common Tailwind utilities using theme
export const UTILITY_CLASSES = {
  // Navigation styles
  navLink: 'font-body text-sm tracking-widest uppercase transition-colors hover:text-white',
  navLinkActive: 'text-white',
  navLinkInactive: 'text-brand-stone/80',
  
  // Button styles
  buttonPrimary: 'px-3 py-2 rounded-md border text-xs tracking-widest uppercase transition-colors border-brand-rust text-brand-stone hover:text-white hover:border-brand-stone',
  buttonPrimaryActive: 'border-white text-black bg-white',
  
  // Heading styles
  headingLarge: 'font-display text-6xl tracking-wider text-brand-light-gray',
  headingMedium: 'font-display text-4xl tracking-wider text-brand-light-gray',
  headingSmall: 'font-display text-2xl tracking-wider text-brand-light-gray',
  
  // Divider
  divider: 'w-px bg-brand-rust',
};
