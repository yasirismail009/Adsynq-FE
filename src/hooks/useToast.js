import toast from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Custom toast hook
export const useToast = () => {
  const showSuccess = (message, options = {}) => {
    return toast.success(message, {
      duration: 4000,
      className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg rounded-lg',
      ...options,
    });
  };

  const showError = (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg rounded-lg',
      ...options,
    });
  };

  const showWarning = (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-lg rounded-lg',
      ...options,
    });
  };

  const showInfo = (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg rounded-lg',
      ...options,
    });
  };

  const showLoading = (message, options = {}) => {
    return toast.loading(message, {
      className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg rounded-lg',
      ...options,
    });
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  // Promise-based toast for async operations
  const promise = (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong!',
      },
      {
        className: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg',
      }
    );
  };

  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    loading: showLoading,
    dismiss,
    dismissAll,
    promise,
    // Direct access to react-hot-toast for advanced usage
    toast,
  };
};

// Export individual functions for direct import
export const showSuccessToast = (message, options) => {
  return toast.success(message, {
    duration: 4000,
    className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg rounded-lg',
    ...options,
  });
};

export const showErrorToast = (message, options) => {
  return toast.error(message, {
    duration: 5000,
    className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg rounded-lg',
    ...options,
  });
};

export const showWarningToast = (message, options) => {
  return toast(message, {
    duration: 4000,
    className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-lg rounded-lg',
    ...options,
  });
};

export const showInfoToast = (message, options) => {
  return toast(message, {
    duration: 4000,
    className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg rounded-lg',
    ...options,
  });
};

export const showLoadingToast = (message, options) => {
  return toast.loading(message, {
    className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg rounded-lg',
    ...options,
  });
};

export default useToast; 