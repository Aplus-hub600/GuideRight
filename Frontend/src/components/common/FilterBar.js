import React from 'react';
import { Filter } from 'lucide-react';

/**
 * Shared filter bar for News, Social, and Timeline
 * - Renders a Filter toggle button
 * - Shows inline panel with From, To, and Location (OSM + Local autocomplete)
 * - Clear Filters button clears view filters and the synced map search via onClearMapSearch
 */
const FilterBar = ({
  dateFrom = '',
  dateTo = '',
  locationFilter = '',
  onFilterChange,
  onClearMapSearch,
  onLocate,
  onClearGlobalSearch
}) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const [internalDateFrom, setInternalDateFrom] = React.useState(dateFrom);
  const [internalDateTo, setInternalDateTo] = React.useState(dateTo);
  const [internalLocation, setInternalLocation] = React.useState(locationFilter);

  React.useEffect(() => {
    setInternalDateFrom(dateFrom);
  }, [dateFrom]);

  React.useEffect(() => {
    setInternalDateTo(dateTo);
  }, [dateTo]);

  React.useEffect(() => {
    setInternalLocation(locationFilter);
  }, [locationFilter]);

  const handleFilterSubmit = () => {
    onFilterChange && onFilterChange({
      dateFrom: internalDateFrom,
      dateTo: internalDateTo,
      location: '',
    });
  };

  React.useEffect(() => {
    if (internalDateFrom && internalDateTo) {
      handleFilterSubmit();
    }
  }, [internalDateFrom, internalDateTo]);


  const clearAll = () => {
    setInternalDateFrom('');
    setInternalDateTo('');
    setInternalLocation('');
    onFilterChange && onFilterChange({ dateFrom: '', dateTo: '', location: '' });
    onClearGlobalSearch && onClearGlobalSearch('');
  };

  return (
    <div className="ml-2 relative">
      <button
        onClick={() => setShowFilters(v => !v)}
        className={`w-10 h-10 rounded-full flex items-center justify-center ${showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
        title="Toggle filters"
        type="button"
      >
        <Filter className="w-5 h-5" />
      </button>

      {showFilters && (
        <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-xl shadow-lg z-20 border w-[500px]">
          <button
            type="button"
            onClick={clearAll}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 mb-3"
          >
            Clear Filters
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <input
              type="date"
              value={internalDateFrom}
              onChange={(e) => setInternalDateFrom(e.target.value)}
              className="px-3 py-2 bg-gray-100 rounded-lg text-sm"
              title="From date"
            />
            <input
              type="date"
              value={internalDateTo}
              onChange={(e) => setInternalDateTo(e.target.value)}
              className="px-3 py-2 bg-gray-100 rounded-lg text-sm"
              title="To date"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
