import React from 'react';
import { AlertCircle, RefreshCcw, Filter } from 'lucide-react';
import SearchInput from '../common/SearchInput';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import PinButton from '../common/PinButton';
import FilterBar from '../common/FilterBar';

/**
 * Social Media Trends view component
 * @param {object} props - Component props
 * @param {Array} props.socialMediaPosts - Array of social media posts
 * @param {string} props.globalSearch - Current search query
 * @param {function} props.onSearchChange - Function to handle search changes
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.error - Error message if any
 * @param {function} props.onRetry - Function to retry data fetching
 * @param {Set} props.pinnedItems - Set of pinned item IDs
 * @param {function} props.onTogglePin - Function to toggle pin status
 * @returns {JSX.Element} Social Media view component
 */
import { extractLocation, extractDateTime, formatDateTime } from '../../utils/mapLinking';
import { searchMapLocations } from '../../utils/apiUtils';
import { MapPin, Clock } from 'lucide-react';

const SocialMediaView = ({
  socialMediaPosts = [],
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
  // Filter social media posts based on search
  const filteredPosts = React.useMemo(() => {
    if (!globalSearch) return socialMediaPosts;
    
    return socialMediaPosts.filter(post => 
      post.quote?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      post.title?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      post.description?.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [socialMediaPosts, globalSearch]);

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-medium text-gray-800 flex-shrink-0">
            Social Media Trends
          </h2>
          <SearchInput value={globalSearch} onSearch={onSearchChange} placeholder="Search social media posts..." />
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
              {aiSummary?.summary || 'BLUF summary shows increased discussion around infrastructure development, climate adaptation, and economic growth in Bangladesh region.'}
            </p>
          </div>
          <div className="flex gap-2">
            <PinButton
              itemId="ai-summary"
              isPinned={pinnedItems.has('ai-summary')}
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
          <LoadingSpinner section="social media posts" />
        ) : error ? (
          <ErrorMessage 
            error={error} 
            onRetry={onRetry}
            title="Failed to load social media posts"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-8">
                {globalSearch ? 'No social media posts match your search.' : 'No social media posts available.'}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-white/70 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (!onLocateOnMap) return;
                    const loc = extractLocation(post) || {};
                    const label = 'Social Post: ' + (post.title || post.quote || 'Anonymous');
                    onLocateOnMap({ lat: loc?.lat ?? null, lng: loc?.lng ?? null, label, searchText: loc?.label || '' });
                  }}
                >
                  {/* Header row: avatar + identity | divider | quote content */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Identity */}
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <img
                        src={post.avatar}
                        alt={`${post.title} avatar`}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/48x48/6b7280/ffffff?text=USR';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-700 leading-tight">{post.title}</p>
                        <p className="text-sm text-gray-500 leading-tight">{post.description}</p>
                      </div>
                    </div>
                    {/* Vertical divider */}
                    <div className="w-px bg-gray-200 self-stretch" />
                    {/* Quote to the right */}
                    <p className="flex-1 text-gray-800 italic leading-relaxed">
                      {post.quote}
                    </p>
                  </div>
                  {/* Pin Button and metadata on the same row */}
                  <div className="mt-2 mb-1 flex items-center gap-4">
                    <PinButton
                      itemId={`social-${post.id}`}
                      isPinned={pinnedItems.has(`social-${post.id}`)}
                      onTogglePin={onTogglePin}
                      size="sm"
                    />
                    {(() => {
                      const dt = extractDateTime(post);
                      const loc = extractLocation(post);
                      const label = loc?.label;
                      return (dt || label) ? (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
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
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaView;
