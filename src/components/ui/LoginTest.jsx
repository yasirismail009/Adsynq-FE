import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../../hooks/useToast';

const LoginTest = () => {
  const { login, user, isAuthenticated } = useAuth();

  const handleTestLogin = async () => {
    try {
      const result = await login('fawad@test.com', 'your_password_here');
      if (result.success) {
        showSuccessToast('Login successful! Redirecting to dashboard...');
        console.log('User data:', user);
      } else {
        showErrorToast(result.error);
      }
    } catch (error) {
      showErrorToast('Login failed');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Login Test</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Authentication Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </p>
        </div>
        
        {user && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
            <h3 className="font-semibold mb-2">User Data:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
        
        <button
          onClick={handleTestLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Test Login
        </button>
      </div>
    </div>
  );
};

export default LoginTest; 