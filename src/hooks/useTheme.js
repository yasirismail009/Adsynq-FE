import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  selectThemeMode, 
  selectIsDarkMode, 
  selectIsHighContrast,
  selectReducedMotion,
  selectLargeText,
  selectBoldText,
  setThemeMode,
  updateSystemPreferences,
  THEME_MODES,
} from '../store/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(selectThemeMode);
  const isDarkMode = useAppSelector(selectIsDarkMode);
  const isHighContrast = useAppSelector(selectIsHighContrast);
  const reducedMotion = useAppSelector(selectReducedMotion);
  const largeText = useAppSelector(selectLargeText);
  const boldText = useAppSelector(selectBoldText);

  // Apply theme to DOM
  const applyTheme = useCallback((mode) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'high-contrast');
    
    // Add new theme class
    root.classList.add(mode);
    
    // Set data-theme attribute
    root.setAttribute('data-theme', mode);
    
    // Apply accessibility preferences
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    if (largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    if (boldText) {
      root.classList.add('bold-text');
    } else {
      root.classList.remove('bold-text');
    }
  }, [reducedMotion, largeText, boldText]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newMode = isDarkMode ? THEME_MODES.LIGHT : THEME_MODES.DARK;
    dispatch(setThemeMode(newMode));
  }, [dispatch, isDarkMode]);

  // Set specific theme
  const setTheme = useCallback((mode) => {
    dispatch(setThemeMode(mode));
  }, [dispatch]);

  // Initialize theme from system preferences
  useEffect(() => {
    // Check system preferences
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

    // Update system preferences in store
    dispatch(updateSystemPreferences({
      prefersDark: mediaQuery.matches,
      prefersReducedMotion,
      prefersHighContrast,
    }));

    // Listen for system theme changes
    const handleSystemThemeChange = (e) => {
      dispatch(updateSystemPreferences({ prefersDark: e.matches }));
      
      // Auto-apply system theme if in auto mode
      if (themeMode === THEME_MODES.AUTO) {
        const newMode = e.matches ? THEME_MODES.DARK : THEME_MODES.LIGHT;
        dispatch(setThemeMode(newMode));
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [dispatch, themeMode]);

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode, applyTheme]);

  // Apply accessibility preferences when they change
  useEffect(() => {
    applyTheme(themeMode);
  }, [reducedMotion, largeText, boldText, applyTheme, themeMode]);

  return {
    themeMode,
    isDarkMode,
    isHighContrast,
    reducedMotion,
    largeText,
    boldText,
    toggleTheme,
    setTheme,
    THEME_MODES,
  };
}; 