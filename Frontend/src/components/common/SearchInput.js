import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable search input component
 * @param {object} props - Component props
 * @param {string} props.value - Current search value
 * @param {function} props.onSearch - Function to call when enter is pressed
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Whether input is disabled
 * @returns {JSX.Element} Search input component
 */
const SearchInput = ({ 
  value, 
  onSearch, 
  placeholder = "Search...", 
  disabled = false 
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(inputValue);
    }
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="bg-gray-200 rounded-3xl pl-10 pr-4 py-2 text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 w-full disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default SearchInput;