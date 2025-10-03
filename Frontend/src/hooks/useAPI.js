import { useState, useEffect, useCallback } from 'react';
import { 
  fetchNewsReports, 
  fetchTimelineEvents, 
  fetchSocialMediaPosts, 
  fetchConversations,
  fetchPinnedItems
} from '../utils/apiUtils';

/**
 * Custom hook for managing API data fetching with loading and error states
 * @param {string} dataType - Type of data to fetch ('news', 'timeline', 'social', 'conversations')
 * @returns {object} - Data, loading state, error state, and refetch function
 */
export const useAPIData = (dataType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (searchQuery = '', ...params) => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      
      switch (dataType) {
        case 'news':
          result = await fetchNewsReports(searchQuery, ...params);
          break;
        case 'timeline':
          result = await fetchTimelineEvents(searchQuery, ...params);
          break;
        case 'social':
          result = await fetchSocialMediaPosts(searchQuery, ...params);
          break;
        case 'conversations':
          result = await fetchConversations();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }
      
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error(`Failed to fetch ${dataType}:`, err);
    } finally {
      setLoading(false);
    }
  }, [dataType]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Return refetch function that accepts search parameters
  const refetch = useCallback((searchQuery, ...params) => {
    return fetchData(searchQuery, ...params);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

/**
 * Custom hook for managing multiple data sources with search functionality
 * @returns {object} - All data sources, loading states, errors, and search functions
 */
export const useAllData = () => {
  // Individual data hooks
  const newsApi = useAPIData('news');
  const timelineApi = useAPIData('timeline');
  const socialApi = useAPIData('social');
  const conversationsApi = useAPIData('conversations');

  // Global search functionality
  const handleSearch = useCallback((searchQuery, activeView, regionFilter = '', dateFrom = '', dateTo = '') => {
    switch (activeView) {
      case 'topNews':
        newsApi.refetch(searchQuery, regionFilter, dateFrom, dateTo);
        break;
      case 'timeline':
        timelineApi.refetch(searchQuery, dateFrom, dateTo, regionFilter);
        break;
      case 'socialMedia':
        socialApi.refetch(searchQuery, '', '', regionFilter, dateFrom, dateTo);
        break;
      default:
        break;
    }
  }, [newsApi, timelineApi, socialApi]);

  return {
    // Data
    newsReports: newsApi.data,
    timelineEvents: timelineApi.data,
    socialMediaPosts: socialApi.data,
    conversations: conversationsApi.data,
    
    // Loading states
    loadingStates: {
      news: newsApi.loading,
      timeline: timelineApi.loading,
      social: socialApi.loading,
      conversations: conversationsApi.loading
    },
    
    // Error states
    errors: {
      news: newsApi.error,
      timeline: timelineApi.error,
      social: socialApi.error,
      conversations: conversationsApi.error
    },
    
    // Functions
    handleSearch,
    refetchNews: newsApi.refetch,
    refetchTimeline: timelineApi.refetch,
    refetchSocial: socialApi.refetch,
    refetchConversations: conversationsApi.refetch
  };
};

/**
 * Custom hook specifically for map data management
 * @returns {object} - Map data, loading state, error state, and fetch functions
 */
export const useMapData = () => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapStatus, setMapStatus] = useState('initializing');

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMapStatus('loading');
    
    try {
      // This will be updated when Django backend is ready
      // const cities = await fetchMapCities();
      // const boundaries = await fetchMapBoundaries();
      
      // For now, use placeholder data
      const cities = [];
      const boundaries = null;
      
      const mapDataObj = {
        cities,
        boundaries,
        lastUpdated: new Date().toISOString()
      };
      
      setMapData(mapDataObj);
      setMapStatus('ready');
    } catch (err) {
      setError(err.message);
      setMapStatus('error');
      console.error('Failed to fetch map data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  return {
    mapData,
    loading,
    error,
    mapStatus,
    refetch: fetchMapData
  };
};
