import { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

const ThemeProvider = ({ children }) => {
  const { themeMode, isDarkMode } = useTheme();

  // Add theme class to body for global styling
  useEffect(() => {
    document.body.classList.remove('light', 'dark', 'high-contrast');
    document.body.classList.add(themeMode);
  }, [themeMode]);

  // Add theme meta tag for external tools
  useEffect(() => {
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    
    // Set theme color based on current theme
    if (isDarkMode) {
      metaTheme.content = '#231F23';
    } else {
      metaTheme.content = '#6C5DD3';
    }
  }, [isDarkMode]);

  return children;
};

export default ThemeProvider; 