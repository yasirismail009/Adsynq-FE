import React from 'react';
import { useToast } from '../../hooks/useToast';

const ToastExample = () => {
  const toast = useToast();

  const handleSuccessToast = () => {
    toast.success('This is a success message!');
  };

  const handleErrorToast = () => {
    toast.error('This is an error message!');
  };

  const handleWarningToast = () => {
    toast.warning('This is a warning message!');
  };

  const handleInfoToast = () => {
    toast.info('This is an info message!');
  };

  const handleLoadingToast = () => {
    const loadingToast = toast.loading('Loading...');
    
    // Simulate async operation
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success('Operation completed!');
    }, 2000);
  };

  const handlePromiseToast = async () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve() : reject();
      }, 2000);
    });

    toast.promise(promise, {
      loading: 'Processing...',
      success: 'Successfully processed!',
      error: 'Failed to process',
    });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Toast Examples
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={handleSuccessToast}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Success Toast
        </button>
        
        <button
          onClick={handleErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Error Toast
        </button>
        
        <button
          onClick={handleWarningToast}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Warning Toast
        </button>
        
        <button
          onClick={handleInfoToast}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Info Toast
        </button>
        
        <button
          onClick={handleLoadingToast}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Loading Toast
        </button>
        
        <button
          onClick={handlePromiseToast}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Promise Toast
        </button>
      </div>
    </div>
  );
};

export default ToastExample; 