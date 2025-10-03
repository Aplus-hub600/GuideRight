import React from 'react';

/**
 * Reusable pin button component
 * @param {object} props - Component props
 * @param {string|number} props.itemId - ID of the item to pin
 * @param {boolean} props.isPinned - Whether the item is currently pinned
 * @param {function} props.onTogglePin - Function to call when pin is toggled
 * @param {string} props.size - Button size ('sm', 'md', 'lg')
 * @param {string} props.variant - Button variant ('primary', 'secondary')
 * @returns {JSX.Element} Pin button component
 */
const PinButton = ({ 
  itemId, 
  isPinned, 
  onTogglePin, 
  size = 'md',
  variant = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const baseClasses = 'rounded-lg font-medium transition-colors flex-shrink-0';
  
  const variantClasses = {
    primary: isPinned 
      ? 'bg-blue-600 text-white hover:bg-blue-700' 
      : 'bg-gray-800 text-white hover:bg-gray-700',
    secondary: isPinned
      ? 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
      : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200'
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onTogglePin(itemId); }}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`}
      title={isPinned ? `Unpin item ${itemId}` : `Pin item ${itemId} for report`}
    >
      {isPinned ? 'Pinned' : 'Pin for Report'}
    </button>
  );
};

export default PinButton;
