import { useState, useEffect, useCallback } from 'react';
import { fetchPinnedItems, apiCall } from '../utils/apiUtils';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Custom hook for managing pinned items functionality
 * @returns {object} - Pinned items set and management functions
 */
export const usePinning = () => {
  const [pinnedItems, setPinnedItems] = useState(new Set());
    const [pinIdMap, setPinIdMap] = useState({}); // clientKey -> backend pin id
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize pinned items from backend
  useEffect(() => {
  const initializePinnedItems = async () => {
      setLoading(true);
      try {
    const { pinnedIds, pinIdMap: fetchedMap } = await fetchPinnedItems();
    setPinnedItems(pinnedIds);
    setPinIdMap(fetchedMap || {});
      } catch (err) {
        setError(err.message);
        console.error('Failed to initialize pinned items:', err);
      } finally {
        setLoading(false);
      }
    };

    initializePinnedItems();
  }, []);

  /**
   * Toggle pin status for an item
   * @param {string|number} itemId - ID of the item to pin/unpin
   */
  const togglePin = useCallback(async (itemId) => {
    const stringId = String(itemId);

    // Determine current pinned state synchronously (avoid reading stale state after setState)
    const isCurrentlyPinned = pinnedItems.has(stringId);

    // Optimistic UI update
    setPinnedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stringId)) {
        newSet.delete(stringId);
      } else {
        newSet.add(stringId);
      }
      return newSet;
    });

    // DJANGO INTEGRATION CODE - POST or DELETE to /api/pinned-items/
    try {
      if (isCurrentlyPinned) {
        // Use backend pin id if available
        const backendPinId = pinIdMap[stringId];
        if (backendPinId) {
          await apiCall(`${API_ENDPOINTS.pinned}${backendPinId}/`, { method: 'DELETE' });
        } else {
          // No backend id mapping - refetch to reconcile
          const { pinnedIds, pinIdMap: fetchedMap } = await fetchPinnedItems();
          setPinnedItems(pinnedIds);
          setPinIdMap(fetchedMap || {});
          // Try delete again if we now have a mapping
          const newBackendId = fetchedMap ? fetchedMap[stringId] : null;
          if (newBackendId) {
            await apiCall(`${API_ENDPOINTS.pinned}${newBackendId}/`, { method: 'DELETE' });
            setPinIdMap(prev => { const copy = { ...prev }; delete copy[stringId]; return copy; });
          }
        }
        // Remove mapping locally
        setPinIdMap(prev => {
          const copy = { ...prev };
          delete copy[stringId];
          return copy;
        });
      } else {
        // Build request body based on id format
        let requestBody = {};
        if (stringId.startsWith('pmesii-')) {
          const [, rowIndex, cellIndex] = stringId.split('-');
          requestBody = {
            type: 'pmesii',
            content_id: `${rowIndex}-${cellIndex}`,
            metadata: { row: parseInt(rowIndex, 10), column: parseInt(cellIndex, 10) }
          };
        } else if (stringId === 'ai-summary' || stringId === 'pmesii-summary' || stringId === 'news-ai-summary') {
          requestBody = {
            type: 'ai_summary',
            content_id: stringId,
            metadata: { source_view: stringId }
          };
        } else {
          let type, contentId;
          if (stringId.startsWith('news-')) {
            type = 'news';
            contentId = parseInt(stringId.replace('news-', ''), 10);
          } else if (stringId.startsWith('timeline-')) {
            type = 'timeline';
            contentId = parseInt(stringId.replace('timeline-', ''), 10);
          } else if (stringId.startsWith('social-')) {
            type = 'social';
            contentId = parseInt(stringId.replace('social-', ''), 10);
          }
          requestBody = { type, content_id: contentId };
        }

        const created = await apiCall(API_ENDPOINTS.pinned, {
          method: 'POST',
          body: JSON.stringify(requestBody)
        });
        // Backend should return created resource with `id` and original fields
        if (created && created.id !== undefined) {
          setPinIdMap(prev => ({ ...prev, [stringId]: created.id }));
        }
      }
    } catch (error) {
      console.error('Failed to toggle pin (backend):', error);
      setError(error.message || String(error));
      // Try to reconcile by refetching pinned items
      try { const { pinnedIds, pinIdMap: fetchedMap } = await fetchPinnedItems(); setPinnedItems(pinnedIds); setPinIdMap(fetchedMap || {}); } catch (e) {}
    }
  }, [pinnedItems, pinIdMap]);

  /**
   * Remove a specific pinned item
   * @param {string|number} itemId - ID of the item to remove
   */
  const removePin = useCallback((itemId) => {
    const stringId = String(itemId);
    
    setPinnedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(stringId);
      return newSet;
    });
    // Attempt to delete from backend if we have an id
    (async () => {
      try {
    const backendPinId = pinIdMap[stringId];
        if (backendPinId) {
          await apiCall(`${API_ENDPOINTS.pinned}${backendPinId}/`, { method: 'DELETE' });
          setPinIdMap(prev => { const copy = { ...prev }; delete copy[stringId]; return copy; });
        } else {
          await apiCall(`${API_ENDPOINTS.pinned}${stringId}/`, { method: 'DELETE' });
        }
      } catch (e) {
        console.warn('Backend delete for removePin failed:', e);
      }
    })();
  }, [pinIdMap]);

  /**
   * Clear all pinned items
   */
  const clearAllPins = useCallback(() => {
    setPinnedItems(new Set());
    // Optionally delete all pinned items from backend
    (async () => {
      try {
        const entries = Object.entries(pinIdMap || {});
        for (const [, backendId] of entries) {
          try { await apiCall(`${API_ENDPOINTS.pinned}${backendId}/`, { method: 'DELETE' }); } catch {}
        }
        setPinIdMap({});
      } catch (e) { console.warn('Failed to clear backend pins:', e); }
    })();
  }, [pinIdMap]);

  /**
   * Check if an item is pinned
   * @param {string|number} itemId - ID of the item to check
   * @returns {boolean} - Whether the item is pinned
   */
  const isPinned = useCallback((itemId) => {
    return pinnedItems.has(String(itemId));
  }, [pinnedItems]);

  /**
   * Get pinned items data for reports
   * @param {object} allData - All available data (news, social, timeline, etc.)
   * @returns {Array} - Array of pinned items with their data
   */
  const getPinnedItemsData = useCallback((allData) => {
    const { newsReports = [], socialMediaPosts = [], timelineEvents = [], pmesiiData = [] } = allData;
    
    return Array.from(pinnedItems).map(id => {
      const originalId = String(id);
      
      if (originalId.startsWith('news-')) {
        const newsId = originalId.replace('news-', '');
        const newsReport = newsReports.find(r => String(r.id) === newsId);
        if (newsReport) {
          return { 
            ...newsReport,
            type: 'news', 
            id: originalId
          };
        }
      }
      
      if (originalId.startsWith('social-')) {
        const socialId = originalId.replace('social-', '');
        const socialPost = socialMediaPosts.find(p => String(p.id) === socialId);
        if (socialPost) {
          return { 
            ...socialPost,
            type: 'social', 
            id: originalId
          };
        }
      }
      
      if (originalId.startsWith('timeline-')) {
        const timelineId = originalId.replace('timeline-', '');
        const timelineEvent = timelineEvents.find(e => String(e.id) === timelineId);
        if (timelineEvent) {
          return { 
            ...timelineEvent,
            // Preserve original event type under a different key
            event_type: timelineEvent.type,
            type: 'timeline', 
            id: originalId
          };
        }
      }
      
      if (originalId === 'ai-summary') {
        return { 
          type: 'ai', 
          id: 'ai-summary', 
          title: 'Social Media AI Summary', 
          summary: 'BLUF summary of social media trends' 
        };
      }
      
      if (originalId === 'news-ai-summary' || originalId === 'news-summary') {
        return {
          type: 'ai',
          id: 'news-ai-summary',
          title: 'News AI Summary',
          summary: 'BLUF summary of top news narratives and patterns'
        };
      }
      
      if (originalId === 'pmesii-summary') {
        return { 
          type: 'ai', 
          id: 'pmesii-summary', 
          title: 'PMESII/ASCOPE AI Summary', 
          summary: 'BLUF summary of PMESII analysis' 
        };
      }
      
      if (originalId.startsWith('pmesii-')) {
        const [, rowIndex, cellIndex] = originalId.split('-');
        const categories = ['Areas', 'Structures', 'Capabilities', 'Organizations', 'People', 'Events'];
        const columns = ['Political', 'Military', 'Economic', 'Social', 'Information', 'Infrastructure'];
        const cellContent = pmesiiData[parseInt(rowIndex)]?.data[parseInt(cellIndex)];
        
        if (cellContent) {
          return {
            type: 'pmesii',
            id: originalId,
            title: `${categories[parseInt(rowIndex)]} - ${columns[parseInt(cellIndex)]}`,
            summary: cellContent
          };
        }
      }

      if (originalId === 'timeline-ai-summary' || originalId === 'timeline-summary') {
        return {
          type: 'ai',
          id: 'timeline-ai-summary',
          title: 'Timeline AI Summary',
          summary: 'BLUF summary of recent timeline events and patterns'
        };
      }
      
      return null;
    }).filter(Boolean);
  }, [pinnedItems]);

  return {
    pinnedItems,
    loading,
    error,
    togglePin,
    removePin,
    clearAllPins,
    isPinned,
    getPinnedItemsData,
    pinnedCount: pinnedItems.size
  };
};

/**
 * Hook for generating reports from pinned items
 * @param {object} pinnedItemsData - Data of pinned items
 * @returns {object} - Report content and generation functions
 */
export const useReportGeneration = (pinnedItemsData = []) => {
  const [reportContent, setReportContent] = useState('');

  const generateReportFromPinnedItems = useCallback(() => {
    if (pinnedItemsData.length === 0) {
      setReportContent(`# Regional Intelligence Report

## No Pinned Items

Please pin items from the News, Social Media, Timeline, or PMESII views to generate a comprehensive report.

You can:
1. Navigate to different views using the left sidebar
2. Pin relevant items using the "Pin for Report" buttons
3. Return here to generate an AI-powered analysis

---

*This is an interactive canvas - you can type directly here to add your own analysis.*`);
      return;
    }

    let reportText = `# Regional Intelligence Report
*Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}*

## Executive Summary

Based on analysis of ${pinnedItemsData.length} pinned intelligence sources, this report provides situational awareness for the Bangladesh region.

## Pinned Data Analysis

`;

    pinnedItemsData.forEach((item, index) => {
      const itemTitle = item.type === 'news' ? (item.source?.name || 'News Source') : (item.title || 'Untitled');
      reportText += `### ${index + 1}. ${itemTitle}
**Type:** ${item.type.toUpperCase()}
**Content:** ${item.type === 'news' ? item.summary : 
                  item.type === 'timeline' ? item.summary :
                  item.type === 'social' ? item.quote :
                  item.summary}

`;
    });

    reportText += `## Key Insights

*[Add your analysis here - this section is fully editable]*

## Recommendations

*[Add your recommendations here]*

## Next Steps

*[Add action items here]*

---

*This report was AI-generated from pinned items and is fully editable. Click anywhere to modify the content.*`;

    setReportContent(reportText);
  }, [pinnedItemsData]);

  const exportReport = useCallback(() => {
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Regional_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [reportContent]);

  // Initialize with default content
  useEffect(() => {
    if (reportContent === '') {
      setReportContent(`# AI Generated Regional Report

## Executive Summary

Based on the analysis of pinned reports, social media trends, and timeline events, the Bangladesh region shows continued stability with positive economic indicators.

## Key Findings

Regional news sources indicate strong government cooperation on development initiatives. Social media sentiment analysis reveals public support for infrastructure projects.

## Recommendations

Continue monitoring economic indicators and infrastructure progress. Maintain focus on climate resilience programs.

---

*This report is AI-generated and fully editable. You can modify any section, add your own analysis, or restructure the content as needed.*`);
    }
  }, [reportContent]);

  return {
    reportContent,
    setReportContent,
    generateReportFromPinnedItems,
    exportReport
  };
};
