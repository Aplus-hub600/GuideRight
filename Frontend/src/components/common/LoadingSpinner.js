import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable loading spinner component
 * @param {object} props - Component props
 * @param {string} props.section - Section name being loaded
 * @param {string} props.size - Size of spinner ('sm', 'md', 'lg')
 * @param {string} props.message - Custom loading message
 * @returns {JSX.Element} Loading spinner component
 */
const LoadingSpinner = ({ 
  section = 'data', 
  size = 'md',
  message = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-8 h-8'
  };

  const containerClasses = {
    sm: 'h-16',
    md: 'h-32',
    lg: 'h-48'
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]}`}>
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className={`${sizeClasses[size]} animate-spin`} />
        <span className="text-sm">
          {message || `Loading ${section}...`}
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
