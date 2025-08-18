import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { useAppDispatch } from '../../store/hooks';
import { setAccessibilityPreference } from '../../store/slices/themeSlice';
import { 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  EyeIcon,
  EyeSlashIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ThemeSwitcher = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { themeMode, isDarkMode, setTheme, THEME_MODES } = useTheme();
  const dispatch = useAppDispatch();

  const themeOptions = [
    {
      id: THEME_MODES.LIGHT,
      name: 'Light',
      icon: SunIcon,
      description: 'Light theme for daytime use',
    },
    {
      id: THEME_MODES.DARK,
      name: 'Dark',
      icon: MoonIcon,
      description: 'Dark theme for nighttime use',
    },
    {
      id: THEME_MODES.AUTO,
      name: 'Auto',
      icon: ComputerDesktopIcon,
      description: 'Follows system preference',
    },
  ];

  const accessibilityOptions = [
    {
      key: 'reducedMotion',
      name: 'Reduced Motion',
      description: 'Reduce animations and transitions',
      icon: SpeakerXMarkIcon,
    },
    {
      key: 'highContrast',
      name: 'High Contrast',
      description: 'Increase color contrast',
      icon: EyeIcon,
    },
    {
      key: 'largeText',
      name: 'Large Text',
      description: 'Increase text size',
      icon: EyeIcon,
    },
    {
      key: 'boldText',
      name: 'Bold Text',
      description: 'Make text bolder',
      icon: EyeIcon,
    },
  ];

  const handleAccessibilityToggle = (key) => {
    dispatch(setAccessibilityPreference({ key, value: !currentPreferences[key] }));
  };

  const currentPreferences = {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    boldText: false,
  };

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open theme settings"
      >
        <Cog6ToothIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-80 bg-white dark:bg-neutral-900 rounded-xl shadow-heavy border border-neutral-200 dark:border-neutral-700 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Theme Settings
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Theme Options */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Theme Mode
                </h4>
                <div className="space-y-2">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = themeMode === option.id;
                    
                    return (
                      <motion.button
                        key={option.id}
                        onClick={() => {
                          setTheme(option.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center p-3 rounded-lg border transition-all duration-200 ${
                          isActive
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <div className="font-medium">{option.name}</div>
                          <div className="text-xs opacity-75">{option.description}</div>
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="w-2 h-2 bg-primary-500 rounded-full ml-auto"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Accessibility Options */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Accessibility
                </h4>
                <div className="space-y-2">
                  {accessibilityOptions.map((option) => {
                    const Icon = option.icon;
                    const isEnabled = currentPreferences[option.key];
                    
                    return (
                      <motion.button
                        key={option.key}
                        onClick={() => handleAccessibilityToggle(option.key)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 text-neutral-500 mr-3" />
                          <div className="text-left">
                            <div className="font-medium text-neutral-700 dark:text-neutral-300">
                              {option.name}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              {option.description}
                            </div>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 transition-colors duration-200 ${
                          isEnabled
                            ? 'bg-primary-500 border-primary-500'
                            : 'bg-transparent border-neutral-300 dark:border-neutral-600'
                        }`}>
                          {isEnabled && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-white rounded-full m-auto"
                            />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher; 