import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon,
  BellIcon,
  CogIcon,
  UserCircleIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import LanguageSwitcher from '../ui/LanguageSwitcher';

const Header = ({ onMenuToggle, showMenuButton = false }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [notifications] = useState([
    { id: 1, message: 'New customer signed up', time: '2 min ago', unread: true },
    { id: 2, message: 'Monthly report ready', time: '1 hour ago', unread: true },
    { id: 3, message: 'System update completed', time: '3 hours ago', unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate anyway even if logout fails
      navigate('/login');
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {showMenuButton && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
            >
              <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 ltr:left-0 ltr:pl-3 rtl:right-0 rtl:pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-80 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rtl:pl-3 rtl:pr-10"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
              <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>
          </div>

          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <CogIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="hidden sm:block text-right rtl:text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user ? `${user.name}` : 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'User'}
                </p>
              </div>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rtl:space-x-reverse"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
              </button>
            </div>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 rtl:right-auto rtl:left-0"
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rtl:flex-row-reverse"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 rtl:mr-0 rtl:ml-3" />
                  {t('common.logout')}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="mt-4 md:hidden">
        <div className="relative">
          <div className="absolute inset-y-0 ltr:left-0 ltr:pl-3 rtl:right-0 rtl:pr-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 rtl:pl-3 rtl:pr-10"
          />
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 