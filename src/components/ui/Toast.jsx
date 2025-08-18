import { Toaster } from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon, 
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        className: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg',
        style: {
          padding: '16px',
          color: 'inherit',
        },
        // Success toast
        success: {
          duration: 4000,
          className: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg rounded-lg',
          icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
        },
        // Error toast
        error: {
          duration: 5000,
          className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg rounded-lg',
          icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
        },
        // Warning toast
        custom: {
          duration: 4000,
          className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 shadow-lg rounded-lg',
          icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />,
        },
        // Loading toast
        loading: {
          className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg rounded-lg',
        },
        // Info toast (default)
        default: {
          className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg rounded-lg',
          icon: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
        },
      }}
    />
  );
};

export default Toast; 