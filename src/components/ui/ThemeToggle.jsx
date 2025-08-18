import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme, themeMode } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative inline-flex h-10 w-20 items-center rounded-full bg-neutral-200 dark:bg-neutral-700 p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}
    >
      <motion.div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow-md"
        animate={{
          x: isDarkMode ? 40 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <motion.div
          initial={false}
          animate={{
            rotate: isDarkMode ? 180 : 0,
            scale: isDarkMode ? 0.8 : 1,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          {isDarkMode ? (
            <MoonIcon className="h-5 w-5 text-primary-500" />
          ) : (
            <SunIcon className="h-5 w-5 text-warning-500" />
          )}
        </motion.div>
      </motion.div>
      
      {/* Background gradient effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-warning-200 to-primary-200 dark:from-primary-800 dark:to-secondary-800 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
};

export default ThemeToggle; 