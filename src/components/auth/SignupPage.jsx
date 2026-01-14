import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '../ui/ThemeToggle';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { signupUser } from '../../store/slices/authSlice';
import { showErrorToast } from '../../hooks/useToast';
import { 
  isValidEmail, 
  isValidPhone, 
  validatePassword, 
  getPasswordStrength,
  validateUsername,
  validateName
} from '../../utils/validation';
import logo from '../../assets/logo.svg';

const SignupPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    address: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

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
    
    // Validate first name
    const nameError = validateName(formData.name, 'Name');
    if (nameError) {
      newErrors.name = nameError;
    }
    
    // Validate username
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      newErrors.username = usernameError;
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors[0]; // Show first error
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await dispatch(signupUser(formData)).unwrap();
      
      if (result) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: error });
      showErrorToast(error);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob rtl:left-auto rtl:right-0"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 rtl:right-auto rtl:left-0"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 rtl:left-auto rtl:right-20"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-2xl">
        {/* Logo/Brand */}
        <motion.div
            initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <img src={logo} alt="Logo" className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              {t('auth.welcomeToAdSynq')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              {t('auth.createAccount')}
          </p>
        </motion.div>

        {/* Signup Form */}
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
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 col-span-2"
              >
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.general || error}
                </p>
              </motion.div>
            )}

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name Field */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('auth.fullName')} *
                </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 ltr:left-0 ltr:pl-4 rtl:right-0 rtl:pr-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                      id="fullName"
                      name="fullName"
                    type="text"
                      autoComplete="name"
                    required
                      value={`${formData.name}`.trim()}
                      onChange={(e) => {
                        const names = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          name: names || ''
                        }));
                      }}
                      className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 rtl:pl-4 rtl:pr-12 ${
                        errors.name
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                      placeholder={t('auth.fullName')}
                  />
                </div>
                  {(errors.name) && (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {errors.name}
                  </p>
                )}
              </div>

                {/* Username Field */}
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('auth.username')} *
                </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 ltr:left-0 ltr:pl-4 rtl:right-0 rtl:pr-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                      id="username"
                      name="username"
                    type="text"
                      autoComplete="username"
                    required
                      value={formData.username}
                    onChange={handleInputChange}
                      className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 rtl:pl-4 rtl:pr-12 ${
                        errors.username 
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                      placeholder={t('auth.username')}
                  />
                </div>
                  {errors.username && (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {errors.username}
                  </p>
                )}
            </div>

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

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('auth.phoneNumber')} *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 ltr:left-0 ltr:pl-4 rtl:right-0 rtl:pr-4 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`block w-full pl-12 pr-4 py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 rtl:pl-4 rtl:pr-12 ${
                        errors.phone 
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      placeholder={t('auth.phoneNumber')}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio and Address - Full Width */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bio Field */}
                <div className="space-y-2">
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('auth.bio')}
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 resize-none"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>

                {/* Address Field */}
                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('auth.address')}
              </label>
                  <div className="relative group">
                    <div className="absolute top-4 left-4 flex items-center pointer-events-none rtl:left-auto rtl:right-4">
                      <MapPinIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500 resize-none rtl:pl-4 rtl:pr-12"
                      placeholder={t('auth.address')}
                    />
                  </div>
                </div>
              </div>

              {/* Password Fields - Full Width */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                      className={`block w-full pl-12 pr-12 py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 rtl:pl-12 rtl:pr-12 ${
                    errors.password 
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  placeholder={t('auth.createStrongPassword')}
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </div>
                </div>
              )}
              
              {errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('auth.confirmPassword')} *
              </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 ltr:left-0 ltr:pl-4 rtl:right-0 rtl:pr-4 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                      className={`block w-full pl-12 pr-12 py-4 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 rtl:pl-12 rtl:pr-12 ${
                    errors.confirmPassword 
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  placeholder={t('auth.confirmYourPassword')}
                />
                <button
                  type="button"
                      className="absolute inset-y-0 ltr:right-0 ltr:pr-4 rtl:left-0 rtl:pl-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {errors.confirmPassword}
                </p>
              )}
                </div>
            </div>

              {/* Terms and Conditions - Full Width */}
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-0"
                />
              </div>
                <div className="text-sm">
                  <label htmlFor="agreeToTerms" className="text-gray-700 dark:text-gray-300 font-medium">
                  {t('auth.agreeToTerms')}{' '}
                  <Link
                    to="/terms"
                      className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    {t('auth.termsOfService')}
                  </Link>{' '}
                  {t('auth.and')}{' '}
                  <Link
                    to="/privacy"
                      className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    {t('auth.privacyPolicy')}
                  </Link>
                </label>
                {errors.agreeToTerms && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>
            </div>

              {/* Submit Button - Full Width */}
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
                    {t('auth.createAccountButton')}
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

          {/* Sign In Link */}
            <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {t('auth.signInHere')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
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

export default SignupPage; 