import React from 'react';
import SearchInput from '../common/SearchInput';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import PinButton from '../common/PinButton';
import { AlertCircle, RefreshCcw, Filter } from 'lucide-react';
import FilterBar from '../common/FilterBar';

/**
 * Event Timeline view component
 * @param {object} props - Component props
 * @param {Array} props.timelineEvents - Array of timeline events
 * @param {string} props.globalSearch - Current search query
 * @param {function} props.onSearchChange - Function to handle search changes
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.error - Error message if any
 * @param {function} props.onRetry - Function to retry data fetching
 * @param {Set} props.pinnedItems - Set of pinned item IDs
 * @param {function} props.onTogglePin - Function to toggle pin status
 * @returns {JSX.Element} Timeline view component
 */
import { extractLocation, extractDateTime, formatDateTime } from '../../utils/mapLinking';
import { MapPin, Clock } from 'lucide-react';

const TimelineView = ({
  timelineEvents = [],
  globalSearch = '',
  onSearchChange,
  dateFrom = '',
  dateTo = '',
  locationFilter = '',
  onFilterChange,
  loading = false,
  error = null,
  onRetry,
  pinnedItems = new Set(),
  onTogglePin,
  onLocateOnMap,
  onRegenerateAISummary,
  onClearMapSearch,
  aiSummary = null
}) => {
  // Filter timeline events based on search
  const filteredEvents = React.useMemo(() => {
    if (!globalSearch) return timelineEvents;
    
    return timelineEvents.filter(event => 
      event.title?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      event.summary?.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [timelineEvents, globalSearch]);

  // Get event type styling
  const getEventTypeStyle = (type) => {
    switch (type) {
      case 'economic':
        return 'bg-green-100 text-green-800';
      case 'infrastructure':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'environment':
        return 'bg-emerald-100 text-emerald-800';
      case 'political':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-medium text-gray-800 flex-shrink-0">
            Event Timeline
          </h2>
          <SearchInput value={globalSearch} onSearch={onSearchChange} placeholder="Search timeline events..." />
          <FilterBar
            dateFrom={dateFrom}
            dateTo={dateTo}
            locationFilter={locationFilter}
            onFilterChange={onFilterChange}
            onClearMapSearch={onClearMapSearch}
            onLocate={onLocateOnMap}
            onClearGlobalSearch={onSearchChange}
          />
        </div>
      </div>

      {/* AI Summary */}
      <div className="p-6 bg-blue-50/70 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-800 mb-2">AI Summary</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {aiSummary?.summary || 'BLUF summary of notable events and temporal patterns observed in the current timeline view.'}
            </p>
          </div>
          <div className="flex gap-2">
            <PinButton
              itemId="timeline-ai-summary"
              isPinned={pinnedItems.has('timeline-ai-summary')}
              onTogglePin={onTogglePin}
              size="sm"
            />
            <button 
              onClick={() => onRegenerateAISummary && onRegenerateAISummary(globalSearch)}
              className="w-8 h-8 rounded-lg hover:bg-gray-200 flex items-center justify-center"
              title="Regenerate summary for current filters"
            >
              <RefreshCcw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {loading ? (
          <LoadingSpinner section="timeline events" />
        ) : error ? (
          <ErrorMessage 
            error={error} 
            onRetry={onRetry}
            title="Failed to load timeline events"
          />
        ) : (
          <div className="relative">
            {filteredEvents.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {globalSearch ? 'No timeline events match your search.' : 'No timeline events available.'}
              </div>
            ) : (
              <>
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                
                {/* Timeline Events */}
                <div className="space-y-8">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="relative">
                      {/* Timeline Marker */}
                      <div className="absolute left-4 w-4 h-4 bg-white border-4 border-gray-400 rounded-full"></div>
                      
                      {/* Event Card */}
                      <div 
                        className="ml-16 bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          if (!onLocateOnMap) return;
                          const loc = extractLocation(event) || {};
                          const label = 'Timeline Event: ' + (event.title || 'Unknown');
                          onLocateOnMap({ lat: loc?.lat ?? null, lng: loc?.lng ?? null, label, searchText: loc?.label || '' });
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-medium text-gray-800 mb-1">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3 font-medium">
                              {(() => {
                                const dt = extractDateTime(event) || event.date;
                                return dt ? formatDateTime(dt) : 'No date';
                              })()}
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-4">
                              {event.summary}
                            </p>
                            
                            {/* Event Type Badge */}
                            {event.type && (
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getEventTypeStyle(event.type)}`}>
                                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                              </span>
                            )}
                            {/* Location */}
                            {(() => {
                              const loc = extractLocation(event);
                              const label = loc?.label;
                              return label ? (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500 ml-3">
                                  <MapPin className="w-3 h-3" /> {label}
                                </span>
                              ) : null;
                            })()}
                          </div>
                        </div>
                        
                        {/* Pin Button */}
                        <PinButton
                          itemId={`timeline-${event.id}`}
                          isPinned={pinnedItems.has(`timeline-${event.id}`)}
                          onTogglePin={onTogglePin}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
