import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '../ui/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser } from '../../store/slices/authSlice';
import { fetchCurrentSubscription } from '../../store/slices/subscriptionSlice';
import { useSubscription } from '../../hooks/useSubscription';
import { showErrorToast } from '../../hooks/useToast';
import { isValidEmail } from '../../utils/validation';

const LoginPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hasSubscription } = useSubscription();
  const { error, isLoading } = useAppSelector((state) => state.auth);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = t('auth.validEmail');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!formData.email || !formData.password) {
      setErrors({ general: t('auth.fillAllFields') });
      return;
    }
    
    if (!isValidEmail(formData.email)) {
      setErrors({ email: t('auth.validEmail') });
      return;
    }
    
    try {
      const result = await dispatch(loginUser({ email: formData.email, password: formData.password })).unwrap();

      if (result) {
        // Fetch current subscription data to get detailed status
        try {
          const subscriptionData = await dispatch(fetchCurrentSubscription()).unwrap();

          // Determine navigation based on subscription and connection status
          if (!subscriptionData || subscriptionData.status !== 'active') {
            // No active subscription - go to pricing
            navigate('/pricing');
          } else {
            // Has active subscription - check connection status
            const hasGoogleConnected = subscriptionData.has_google_account;
            const hasMetaConnected = subscriptionData.has_meta_account;
            const hasGoogleSelected = subscriptionData.google_customer_status?.has_selected;
            const hasMetaSelected = subscriptionData.meta_ad_account_status?.has_selected;

            // If any account is connected but not selected, go to integrations
            if ((hasGoogleConnected && !hasGoogleSelected) || (hasMetaConnected && !hasMetaSelected)) {
              navigate('/integrations');
            } else {
              // Everything is set up - go to dashboard
              navigate('/dashboard');
            }
          }
        } catch (subscriptionError) {
          console.warn('Failed to fetch subscription data:', subscriptionError);
          // If we can't fetch subscription, assume no subscription and go to pricing
          navigate('/pricing');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: error });
      showErrorToast(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob rtl:left-auto rtl:right-0"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 rtl:right-auto rtl:left-0"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 rtl:left-auto rtl:right-20"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white text-2xl font-bold">A</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              {t('auth.welcomeBack')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              {t('auth.signInToAccount')}
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {(errors.general || error) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                >
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {errors.general || error}
                  </p>
                </motion.div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('auth.email')} *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 ltr:left-0 ltr:pl-4 rtl:right-0 rtl:pr-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 rtl:pl-4 rtl:pr-12 ${
                      errors.email 
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    placeholder={t('auth.enterEmail')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('auth.password')} *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 ltr:left-0 ltr:pl-4 rtl:right-0 rtl:pr-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-12 pr-12 py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 rtl:pr-12 rtl:pl-12 ${
                      errors.password 
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    placeholder={t('auth.enterPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 ltr:right-0 ltr:pr-4 rtl:left-0 rtl:pl-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between rtl:flex-row-reverse">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {t('auth.rememberMe')}
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {t('auth.signIn')}
                      {document.documentElement.dir === 'rtl' ? (
                        <ArrowLeftIcon className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                      ) : (
                        <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.dontHaveAccount')}{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {t('auth.signUpForFree')}
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage; 