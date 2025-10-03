import React from 'react';
import { MessageSquare, FileText, TrendingUp, Calendar, BarChart3, Map } from 'lucide-react';
import { NAVIGATION_ITEMS, VIEW_TYPES } from '../utils/constants';

const NavItems = ({ activeView, onViewChange, onToggleMap, iconMap, direction = 'col' }) => {
  const itemLayoutClasses = direction === 'col' ? 'flex-col' : 'flex-row';

  return (
    <div className={`flex ${direction === 'col' ? 'flex-col gap-14' : 'flex-row items-center gap-4'}`}>
      {/* User Account and AI Chat Buttons */}
      <div className={`flex gap-3 ${itemLayoutClasses}`}>
        <button onClick={onToggleMap} className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors flex-shrink-0">
          <Map className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={() => onViewChange(VIEW_TYPES.AI_CHAT)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
            activeView === VIEW_TYPES.AI_CHAT 
              ? (direction === 'col' ? 'bg-white shadow-lg' : 'bg-blue-500')
              : (direction === 'col' ? 'bg-black hover:bg-gray-800' : 'bg-white/20 hover:bg-white/30')
          }`}
        >
          <MessageSquare className={`w-5 h-5 ${activeView === VIEW_TYPES.AI_CHAT ? (direction === 'col' ? 'text-black' : 'text-white') : 'text-white'}`} />
        </button>
      </div>

      {direction === 'row' && <div className="h-8 w-px bg-white/30"></div>}

      {/* Main Navigation Tabs */}
      <div className={`flex gap-3 ${itemLayoutClasses}`}>
        {NAVIGATION_ITEMS.map(({ id, icon, label }) => {
          const IconComponent = iconMap[icon];
          const isActive = activeView === id;
          
          if (direction === 'col') {
            return (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive ? 'bg-gray-200 shadow-lg' : 'hover:bg-gray-200'
                }`}
                title={label}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-gray-800' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                  {label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                isActive ? 'bg-blue-500' : 'bg-white/20 hover:bg-white/30'
              }`}
              title={label}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-200'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Navigation rail component
 * @param {object} props - Component props
 * @param {string} props.activeView - Currently active view
 * @param {function} props.onViewChange - Function to call when view changes
 * @param {function} props.onToggleMap - Function to toggle map visibility
 * @param {boolean} props.expanded - Whether the map is expanded
 * @returns {JSX.Element} Navigation component
 */
const Navigation = ({ activeView, onViewChange, onToggleMap, expanded = false }) => {
  // Icon mapping
  const iconMap = {
    FileText,
    TrendingUp,
    Calendar,
    BarChart3,
    MessageSquare,
    Map
  };

  if (expanded) {
    return (
      <div className="absolute bottom-0 left-0 w-full flex justify-center p-4 pointer-events-none" style={{ zIndex: 60 }}>
        <div className="w-auto bg-black/50 backdrop-blur-md flex flex-row items-center p-2 gap-2 rounded-full border border-white/30 shadow-lg pointer-events-auto">
          <NavItems activeView={activeView} onViewChange={onViewChange} onToggleMap={onToggleMap} iconMap={iconMap} direction="row" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-20 bg-gray-100 flex flex-col items-center py-11 gap-14 border-r border-gray-200 flex-shrink-0">
      <NavItems activeView={activeView} onViewChange={onViewChange} onToggleMap={onToggleMap} iconMap={iconMap} direction="col" />
    </div>
  );
};

export default Navigation;
