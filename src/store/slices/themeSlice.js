import { createSlice } from '@reduxjs/toolkit';

// Theme options
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  HIGH_CONTRAST: 'high-contrast',
  AUTO: 'auto',
};

export const COLOR_SCHEMES = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  NEUTRAL: 'neutral',
  CUSTOM: 'custom',
};

// Initial state
const initialState = {
  mode: THEME_MODES.LIGHT,
  colorScheme: COLOR_SCHEMES.PRIMARY,
  customColors: {
    primary: '#684DE7',
    secondary: '#0074F2',
    accent: '#10B981',
  },
  preferences: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    boldText: false,
  },
  systemPreferences: {
    prefersDark: false,
    prefersReducedMotion: false,
    prefersHighContrast: false,
  },
};

// Theme slice
const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    // Set theme mode
    setThemeMode: (state, action) => {
      state.mode = action.payload;
    },
    
    // Toggle between light and dark
    toggleTheme: (state) => {
      if (state.mode === THEME_MODES.LIGHT) {
        state.mode = THEME_MODES.DARK;
      } else if (state.mode === THEME_MODES.DARK) {
        state.mode = THEME_MODES.LIGHT;
      }
    },
    
    // Set color scheme
    setColorScheme: (state, action) => {
      state.colorScheme = action.payload;
    },
    
    // Update custom colors
    updateCustomColors: (state, action) => {
      state.customColors = { ...state.customColors, ...action.payload };
    },
    
    // Set accessibility preferences
    setAccessibilityPreference: (state, action) => {
      const { key, value } = action.payload;
      state.preferences[key] = value;
    },
    
    // Update system preferences
    updateSystemPreferences: (state, action) => {
      state.systemPreferences = { ...state.systemPreferences, ...action.payload };
    },
    
    // Reset theme to defaults
    resetTheme: (state) => {
      state.mode = THEME_MODES.LIGHT;
      state.colorScheme = COLOR_SCHEMES.PRIMARY;
      state.customColors = initialState.customColors;
      state.preferences = initialState.preferences;
    },
    
    // Apply system theme
    applySystemTheme: (state) => {
      if (state.systemPreferences.prefersDark) {
        state.mode = THEME_MODES.DARK;
      } else {
        state.mode = THEME_MODES.LIGHT;
      }
    },
  },
});

// Export actions
export const {
  setThemeMode,
  toggleTheme,
  setColorScheme,
  updateCustomColors,
  setAccessibilityPreference,
  updateSystemPreferences,
  resetTheme,
  applySystemTheme,
} = themeSlice.actions;

// Export selectors
export const selectTheme = (state) => state.theme;
export const selectThemeMode = (state) => state.theme.mode;
export const selectColorScheme = (state) => state.theme.colorScheme;
export const selectCustomColors = (state) => state.theme.customColors;
export const selectThemePreferences = (state) => state.theme.preferences;
export const selectSystemPreferences = (state) => state.theme.systemPreferences;

// Helper selectors
export const selectIsDarkMode = (state) => state.theme.mode === THEME_MODES.DARK;
export const selectIsLightMode = (state) => state.theme.mode === THEME_MODES.LIGHT;
export const selectIsHighContrast = (state) => state.theme.mode === THEME_MODES.HIGH_CONTRAST;
export const selectIsAutoMode = (state) => state.theme.mode === THEME_MODES.AUTO;

export const selectReducedMotion = (state) => 
  state.theme.preferences.reducedMotion || state.theme.systemPreferences.prefersReducedMotion;

export const selectHighContrast = (state) => 
  state.theme.preferences.highContrast || state.theme.systemPreferences.prefersHighContrast;

export const selectLargeText = (state) => state.theme.preferences.largeText;
export const selectBoldText = (state) => state.theme.preferences.boldText;

export default themeSlice.reducer; 