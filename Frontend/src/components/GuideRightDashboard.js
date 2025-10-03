import React, { useState, useEffect } from 'react';
import { VIEW_TYPES } from '../utils/constants';
import { useAllData } from '../hooks/useAPI';
import { usePinning, useReportGeneration } from '../hooks/usePinning';
import { createConversation, addConversationMessage, fetchAISummary } from '../utils/apiUtils';

// Component imports
import Navigation from './Navigation';
import MapComponent from './MapComponent';
import AIChatView from './views/AIChatView';
import NewsView from './views/NewsView';
import SocialMediaView from './views/SocialMediaView';
import TimelineView from './views/TimelineView';
import PMESIIView from './views/PMESIIView';
import ReportsView from './views/ReportsView';

const GuideRightDashboard = () => {
  // ===== GLOBAL STATE =====
  const [activeView, setActiveView] = useState(VIEW_TYPES.TOP_NEWS);
  const [globalSearch, setGlobalSearch] = useState('');
  const [regionSearch, setRegionSearch] = useState('');
  const [contentHidden, setContentHidden] = useState(false); // Content is visible by default
  const [mapFocus, setMapFocus] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [contentDateFrom, setContentDateFrom] = useState('');
  const [contentDateTo, setContentDateTo] = useState('');
  const [contentLocation, setContentLocation] = useState('');
  const [timelineDateFrom, setTimelineDateFrom] = useState('');
  const [timelineDateTo, setTimelineDateTo] = useState('');
  const [timelineLocation, setTimelineLocation] = useState('');
  const [newsAISummary, setNewsAISummary] = useState(null);
  const [socialAISummary, setSocialAISummary] = useState(null);
  const [timelineAISummary, setTimelineAISummary] = useState(null);

  // ===== CUSTOM HOOKS =====
  const { newsReports, timelineEvents, socialMediaPosts, conversations, loadingStates, errors, handleSearch, refetchNews, refetchTimeline, refetchSocial, refetchConversations } = useAllData();
  const { pinnedItems, togglePin, removePin, clearAllPins, isPinned, getPinnedItemsData, pinnedCount } = usePinning();
  const pinnedItemsData = getPinnedItemsData({ newsReports, socialMediaPosts, timelineEvents, pmesiiData: require('../utils/constants').PMESII_DATA });
  const { reportContent, setReportContent, generateReportFromPinnedItems, exportReport } = useReportGeneration(pinnedItemsData);

  // ===== EVENT HANDLERS =====
  const handleViewChange = (newView) => {
    setActiveView(newView);
  };

  const handleGlobalSearchChange = (searchQuery) => {
    setGlobalSearch(searchQuery);
    const loc = activeView === VIEW_TYPES.TIMELINE ? (timelineLocation || regionSearch) : (contentLocation || regionSearch);
    const df = activeView === VIEW_TYPES.TIMELINE ? timelineDateFrom : contentDateFrom;
    const dt = activeView === VIEW_TYPES.TIMELINE ? timelineDateTo : contentDateTo;
    handleSearch(searchQuery, activeView, loc, df, dt);
  };

  const handleRegionSearchChange = (searchQuery) => {
    setRegionSearch(searchQuery);
    setContentLocation(searchQuery);
    setTimelineLocation(searchQuery);
    const df = activeView === VIEW_TYPES.TIMELINE ? timelineDateFrom : contentDateFrom;
    const dt = activeView === VIEW_TYPES.TIMELINE ? timelineDateTo : contentDateTo;
    handleSearch(globalSearch, activeView, searchQuery, df, dt);
  };

  const handleContentFilterChange = ({ dateFrom, dateTo, location }) => {
    if (dateFrom !== undefined) setContentDateFrom(dateFrom);
    if (dateTo !== undefined) setContentDateTo(dateTo);
    if (location !== undefined) setContentLocation(location);
    handleSearch(globalSearch, activeView, (location ?? contentLocation) || regionSearch, dateFrom ?? contentDateFrom, dateTo ?? contentDateTo);
  };

  const handleTimelineFilterChange = ({ dateFrom, dateTo, location }) => {
    if (dateFrom !== undefined) setTimelineDateFrom(dateFrom);
    if (dateTo !== undefined) setTimelineDateTo(dateTo);
    if (location !== undefined) setTimelineLocation(location);
    handleSearch(globalSearch, VIEW_TYPES.TIMELINE, (location ?? timelineLocation) || regionSearch, dateFrom ?? timelineDateFrom, dateTo ?? timelineDateTo);
  };

  // ===== AI Summary Handlers =====
  const regenerateNewsSummary = async (searchQuery = '') => {
    try {
      const data = await fetchAISummary('news', {
        search: searchQuery || globalSearch,
        region: contentLocation || regionSearch,
        dateFrom: contentDateFrom,
        dateTo: contentDateTo,
        k: 12
      });
      setNewsAISummary({ summary: data.summary, meta: data });
    } catch (e) {
      setNewsAISummary({ summary: 'AI summary unavailable. Please try again later.' });
    }
  };

  const regenerateSocialSummary = async (searchQuery = '') => {
    try {
      const data = await fetchAISummary('social', {
        search: searchQuery || globalSearch,
        region: contentLocation || regionSearch,
        dateFrom: contentDateFrom,
        dateTo: contentDateTo,
        k: 12
      });
      setSocialAISummary({ summary: data.summary, meta: data });
    } catch (e) {
      setSocialAISummary({ summary: 'AI summary unavailable. Please try again later.' });
    }
  };

  const regenerateTimelineSummary = async (searchQuery = '') => {
    try {
      const data = await fetchAISummary('timeline', {
        search: searchQuery || globalSearch,
        region: timelineLocation || regionSearch,
        dateFrom: timelineDateFrom,
        dateTo: timelineDateTo,
        k: 12
      });
      setTimelineAISummary({ summary: data.summary, meta: data });
    } catch (e) {
      setTimelineAISummary({ summary: 'AI summary unavailable. Please try again later.' });
    }
  };

  const handleLocateOnMap = ({ lat = null, lng = null, label = '', searchText = '' } = {}) => {
    if (searchText) setRegionSearch(searchText);
    if (lat != null && lng != null) {
      setMapFocus({ lat, lng, label: label || 'Selected location', ts: Date.now() });
    }
  };

  const handleChatInputChange = (input) => {
    setChatInput(input);
  };

  const handleSendMessage = (message) => {
    console.log('Send message:', message);
    setChatInput('');
  };

  const ensureConversation = async (proposedTitle = 'Conversation') => {
    if (currentConversationId) return currentConversationId;
    const title = proposedTitle || `Conversation - ${new Date().toLocaleString()}`;
    const conv = await createConversation(title, '');
    setCurrentConversationId(conv.id);
    try { await refetchConversations(); } catch {}
    return conv.id;
  };

  const handleSelectConversation = async (conv) => {
    setCurrentConversationId(conv?.id ?? null);
  };

  const handleNewConversation = async () => {
    const title = `Conversation - ${new Date().toLocaleString()}`;
    const conv = await createConversation(title, '');
    setCurrentConversationId(conv.id);
    try { await refetchConversations(); } catch {}
    return conv.id;
  };

  const handlePersistMessage = async (role, content) => {
    try {
      const convId = await ensureConversation(content?.slice(0, 60));
      await addConversationMessage(convId, role, content);
      try { await refetchConversations(); } catch {}
    } catch (e) {
      console.error('Persist message failed:', e);
    }
  };

  const handleToggleContentVisibility = () => {
    setContentHidden(!contentHidden);
  };

  // ===== VIEW RENDERER =====
  const renderCurrentView = () => {
    const commonProps = { pinnedItems, onTogglePin: togglePin };
    switch (activeView) {
      case VIEW_TYPES.AI_CHAT:
        return <AIChatView conversations={conversations} chatInput={chatInput} onChatInputChange={handleChatInputChange} onSendMessage={handleSendMessage} onSelectConversation={handleSelectConversation} onNewConversation={handleNewConversation} onPersistMessage={handlePersistMessage} />;
      case VIEW_TYPES.TOP_NEWS:
        return <NewsView newsReports={newsReports} globalSearch={globalSearch} onSearchChange={handleGlobalSearchChange} dateFrom={contentDateFrom} dateTo={contentDateTo} locationFilter={contentLocation} onFilterChange={handleContentFilterChange} onClearMapSearch={() => handleRegionSearchChange('')} loading={loadingStates.news} error={errors.news} onRetry={refetchNews} onRegenerateAISummary={regenerateNewsSummary} onLocateOnMap={handleLocateOnMap} aiSummary={newsAISummary} {...commonProps} />;
      case VIEW_TYPES.SOCIAL_MEDIA:
        return <SocialMediaView socialMediaPosts={socialMediaPosts} globalSearch={globalSearch} onSearchChange={handleGlobalSearchChange} dateFrom={contentDateFrom} dateTo={contentDateTo} locationFilter={contentLocation} onFilterChange={handleContentFilterChange} onClearMapSearch={() => handleRegionSearchChange('')} loading={loadingStates.social} error={errors.social} onRetry={refetchSocial} onRegenerateAISummary={regenerateSocialSummary} onLocateOnMap={handleLocateOnMap} aiSummary={socialAISummary} {...commonProps} />;
      case VIEW_TYPES.TIMELINE:
        return <TimelineView timelineEvents={timelineEvents} globalSearch={globalSearch} onSearchChange={handleGlobalSearchChange} dateFrom={timelineDateFrom} dateTo={timelineDateTo} locationFilter={timelineLocation} onFilterChange={handleTimelineFilterChange} onClearMapSearch={() => handleRegionSearchChange('')} loading={loadingStates.timeline} error={errors.timeline} onRetry={refetchTimeline} onRegenerateAISummary={regenerateTimelineSummary} onLocateOnMap={handleLocateOnMap} aiSummary={timelineAISummary} {...commonProps} />;
      case VIEW_TYPES.PMESII:
        return <PMESIIView loading={false} error={null} onRetry={() => {}} onRegenerateAISummary={() => {}} {...commonProps} />;
      case VIEW_TYPES.REPORTS:
        return <ReportsView reportContent={reportContent} onReportContentChange={setReportContent} onGenerateReport={generateReportFromPinnedItems} onExportReport={exportReport} pinnedItemsData={pinnedItemsData} pinnedCount={pinnedCount} onRemovePin={removePin} onClearAllPins={clearAllPins} />;
      default:
        return <div className="flex items-center justify-center h-full"><div className="text-center text-gray-500"><h3 className="text-lg font-medium mb-2">View Not Found</h3><p>Please select a valid view from the navigation.</p></div></div>;
    }
  };

  // ===== EFFECTS =====
  useEffect(() => {
    if (activeView === VIEW_TYPES.REPORTS && pinnedItemsData.length > 0) {
      generateReportFromPinnedItems();
    }
  }, [activeView, pinnedItemsData.length, generateReportFromPinnedItems]);

  useEffect(() => {
    if (activeView === VIEW_TYPES.TIMELINE) {
      handleSearch(globalSearch, activeView, timelineLocation || regionSearch, timelineDateFrom, timelineDateTo);
    } else {
      handleSearch(globalSearch, activeView, contentLocation || regionSearch, contentDateFrom, contentDateTo);
    }
  }, [activeView]);

  // ===== RENDER =====
  return (
    <div className="h-screen w-screen bg-gray-100 relative">
      <MapComponent
        expanded={true}
        onToggleExpand={handleToggleContentVisibility}
        regionSearch={regionSearch}
        onRegionSearchChange={handleRegionSearchChange}
        focusLocation={mapFocus}
      />
      <Navigation
        activeView={activeView}
        onViewChange={handleViewChange}
        onToggleMap={handleToggleContentVisibility}
        expanded={true}
      />
      <div
        className={`absolute top-1/2 left-1/2 h-3/4 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
          contentHidden ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        style={{ zIndex: 55 }}
      >
      <div className="h-full rounded-3xl p-6 overflow-y-auto">
        {renderCurrentView()}
      </div>
    </div>
    </div>
  );
};

export default GuideRightDashboard;
