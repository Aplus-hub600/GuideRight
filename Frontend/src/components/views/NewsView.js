import React from 'react';
import SearchInput from '../common/SearchInput';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import PinButton from '../common/PinButton';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import FilterBar from '../common/FilterBar';

/**
 * Top News Reports view component
 * @param {object} props - Component props
 * @param {Array} props.newsReports - Array of news reports
 * @param {string} props.globalSearch - Current search query
 * @param {function} props.onSearchChange - Function to handle search changes
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.error - Error message if any
 * @param {function} props.onRetry - Function to retry data fetching
 * @param {Set} props.pinnedItems - Set of pinned item IDs
 * @param {function} props.onTogglePin - Function to toggle pin status
 * @returns {JSX.Element} News view component
 */
import { extractLocation, extractDateTime, formatDateTime } from '../../utils/mapLinking';
import { searchMapLocations } from '../../utils/apiUtils';
import { MapPin, Clock } from 'lucide-react';

const NewsView = ({
  newsReports = [],
  globalSearch = '',
  onSearchChange,
  dateFrom = '',
  dateTo = '',
  locationFilter = '',
  onFilterChange,
  onClearMapSearch,
  loading = false,
  error = null,
  onRetry,
  pinnedItems = new Set(),
  onTogglePin,
  onLocateOnMap,
  onRegenerateAISummary,
  aiSummary = null
}) => {
  // Filter news reports based on search
  const filteredReports = React.useMemo(() => {
    if (!globalSearch) return newsReports;
    
    return newsReports.filter(report => 
      report.source?.name?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      report.summary?.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [newsReports, globalSearch]);

  // Filters handled by shared FilterBar component

  return (
    <div className="bg-white rounded-3xl bg-white/70 backdrop-blur-md shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-medium text-gray-800 flex-shrink-0">
            Top News Reports
          </h2>
          <SearchInput value={globalSearch} onSearch={onSearchChange} placeholder="Search news reports..." />
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
      <div className="p-6 bg-blue-50/70 backdrop-blur-md border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-800 mb-2">AI Summary</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {aiSummary?.summary || 'BLUF summary of top news patterns and narratives across Bangladesh media in the current feed window.'}
            </p>
          </div>
          <div className="flex gap-2">
            <PinButton
              itemId="news-ai-summary"
              isPinned={pinnedItems.has('news-ai-summary')}
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
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {loading ? (
          <LoadingSpinner section="news reports" />
        ) : error ? (
          <ErrorMessage 
            error={error} 
            onRetry={onRetry}
            title="Failed to load news reports"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReports.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {globalSearch ? 'No news reports match your search.' : 'No news reports available.'}
              </div>
            ) : (
              filteredReports.map((report) => (
                <div 
                  key={report.id} 
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (!onLocateOnMap) return;
                    const loc = extractLocation(report) || {};
                    const label = 'News Item: ' + (report.title || report.headline || report.summary || report.source?.name || 'Anonymous');
                    onLocateOnMap({ lat: loc?.lat ?? null, lng: loc?.lng ?? null, label, searchText: loc?.label || '' });
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <img
                      src={report.thumbnail}
                      alt={`${report.source?.name || 'News'} thumbnail`}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x64/6b7280/ffffff?text=IMG';
                      }}
                    />
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-800 mb-1">
                        {report.source?.name || 'Unknown Source'}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {report.summary}
                      </p>
                      {/* Metadata: time + location */}
                      {(() => {
                        const dt = extractDateTime(report);
                        const loc = extractLocation(report);
                        const label = loc?.label;
                        return (dt || label) ? (
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {dt && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {formatDateTime(dt)}
                              </span>
                            )}
                            {label && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {label}
                              </span>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    
                    {/* Pin Button */}
                    <PinButton
                      itemId={`news-${report.id}`}
                      isPinned={pinnedItems.has(`news-${report.id}`)}
                      onTogglePin={onTogglePin}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsView;
