import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable error message component
 * @param {object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {function} props.onRetry - Function to call when retry button is clicked
 * @param {string} props.title - Optional error title
 * @returns {JSX.Element} Error message component
 */
const ErrorMessage = ({ 
  error, 
  onRetry = null,
  title = "Failed to load data" 
}) => {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 mb-2 font-medium">{title}</p>
        <p className="text-sm text-gray-500 mb-3 max-w-xs mx-auto">{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
