import { API_BASE_URL, API_ENDPOINTS } from './constants';

/**
 * Generic API call utility function
 * @param {string} endpoint - API endpoint to call
 * @param {object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} - API response data
 */
// Read Django CSRF token from cookies
const getCSRFCookie = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )csrftoken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

export const apiCall = async (endpoint, options = {}) => {
  try {
    const method = (options.method || 'GET').toUpperCase();
    const isUnsafe = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    const csrfToken = isUnsafe ? getCSRFCookie() : null;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        // Add authentication headers when Django backend is ready
        // 'Authorization': `Bearer ${getAuthToken()}`,
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetch news reports from Django backend
 * @param {string} searchQuery - Search query string
 * @param {string} region - Region filter
 * @returns {Promise<Array>} - Array of news reports
 */
export const fetchNewsReports = async (searchQuery = '', region = '', dateFrom = '', dateTo = '') => {
  /*
  Django API Call Example:
  GET /api/news-reports/?search=economic&region=dhaka&limit=20&offset=0
  
  Query Parameters:
  - search: string (searches title, summary, content)
  - region: string (filters by region)
  - category: string (filters by category)
  - date_from: ISO date string
  - date_to: ISO date string
  - limit: number (pagination)
  - offset: number (pagination)
  */
  
  try {
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    if (region) queryParams.append('region', region);
    if (dateFrom) queryParams.append('date_from', dateFrom);
    if (dateTo) queryParams.append('date_to', dateTo);
    queryParams.append('limit', '50');
    
    const data = await apiCall(`${API_ENDPOINTS.news}?${queryParams}`);
    return data.results || data; // Handle Django REST pagination
  } catch (error) {
    console.error('Failed to fetch news reports:', error);
  // Surface error to caller so UI shows backend state instead of placeholder data
  throw error;
  }
};

/**
 * Fetch timeline events from Django backend
 * @param {string} searchQuery - Search query string
 * @param {string} dateFrom - Start date filter
 * @param {string} dateTo - End date filter
 * @returns {Promise<Array>} - Array of timeline events
 */
export const fetchTimelineEvents = async (searchQuery = '', dateFrom = '', dateTo = '', location = '') => {
  /*
  Django API Call Example:
  GET /api/timeline-events/?search=summit&type=economic&date_from=2025-08-01&date_to=2025-08-31
  */
  
  try {
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    if (dateFrom) queryParams.append('date_from', dateFrom);
    if (dateTo) queryParams.append('date_to', dateTo);
    if (location) queryParams.append('location', location);
    queryParams.append('ordering', '-date');
    queryParams.append('limit', '50');
    
    const data = await apiCall(`${API_ENDPOINTS.timeline}?${queryParams}`);
    return data.results || data;
  } catch (error) {
    console.error('Failed to fetch timeline events:', error);
  throw error;
  }
};

/**
 * Fetch social media posts from Django backend
 * @param {string} searchQuery - Search query string
 * @param {string} platform - Platform filter
 * @param {string} sentiment - Sentiment filter
 * @returns {Promise<Array>} - Array of social media posts
 */
export const fetchSocialMediaPosts = async (searchQuery = '', platform = '', sentiment = '', region = '', dateFrom = '', dateTo = '') => {
  /*
  Django API Call Example:
  GET /api/social-media-posts/?search=infrastructure&platform=twitter&sentiment=positive
  */
  
  try {
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    if (platform) queryParams.append('platform', platform);
    if (sentiment) queryParams.append('sentiment', sentiment);
    if (region) queryParams.append('region', region);
    if (dateFrom) queryParams.append('date_from', dateFrom);
    if (dateTo) queryParams.append('date_to', dateTo);
    queryParams.append('ordering', '-published_date');
    queryParams.append('limit', '20');
    
    const data = await apiCall(`${API_ENDPOINTS.social}?${queryParams}`);
    return data.results || data;
  } catch (error) {
    console.error('Failed to fetch social media posts:', error);
  throw error;
  }
};

/**
 * Fetch conversations from Django backend
 * @returns {Promise<Array>} - Array of conversations
 */
export const fetchConversations = async () => {
  /*
  Django API Call Example:
  GET /api/conversations/?limit=10&ordering=-updated_at
  */
  
  try {
    const data = await apiCall(`${API_ENDPOINTS.conversations}?limit=10&ordering=-updated_at`);
    return data.results || data;
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return getPlaceholderConversationsData();
  }
};

/**
 * Fetch AI summary via RAG endpoint
 * @param {('news'|'social'|'timeline')} scope
 * @param {object} params - { search, region, dateFrom, dateTo, k }
 */
export const fetchAISummary = async (scope, { search = '', region = '', dateFrom = '', dateTo = '', k = 12 } = {}) => {
  try {
    const qp = new URLSearchParams();
    if (scope) qp.append('scope', scope);
    if (search) qp.append('q', search);
    if (region) qp.append('region', region);
    if (dateFrom) qp.append('date_from', dateFrom);
    if (dateTo) qp.append('date_to', dateTo);
    if (k) qp.append('k', String(k));
    const data = await apiCall(`${API_ENDPOINTS.aiSummary}?${qp.toString()}`);
    return data;
  } catch (error) {
    console.error('Failed to fetch AI summary:', error);
    throw error;
  }
};

// Conversations persistence helpers
const normalizeRoleForAPI = (role) => {
  const r = String(role || '').toLowerCase();
  if (r.startsWith('user')) return 'User';
  if (r.startsWith('assistant') || r === 'ai' || r === 'bot' || r === 'assistent') return 'Assistant';
  return 'Assistant';
};

/**
 * Create a new conversation
 * @param {string} title
 * @param {string} summary
 * @returns {Promise<object>} conversation object
 */
export const createConversation = async (title, summary = '') => {
  try {
    const body = { title, summary };
    const conversation = await apiCall(API_ENDPOINTS.conversations, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return conversation;
  } catch (error) {
    console.error('Failed to create conversation:', error);
    throw error;
  }
};

/**
 * Append a message to a conversation. Tries a few sensible endpoints.
 * @param {number|string} conversationId
 * @param {string} role - 'User' | 'Assistant'
 * @param {string} content
 */
export const addConversationMessage = async (conversationId, role, content) => {
  const common = { role: normalizeRoleForAPI(role), content };
  const payloadsByEndpoint = [
    { ep: `${API_ENDPOINTS.conversations}${conversationId}/messages/`, body: common },
    { ep: `/conversation-messages/`, body: { ...common, conversation: conversationId } },
    { ep: `${API_ENDPOINTS.conversations}messages/`, body: { ...common, conversation: conversationId } }
  ];

  let lastError;
  for (const { ep, body } of payloadsByEndpoint) {
    try {
      const data = await apiCall(ep, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      return data;
    } catch (e) {
      lastError = e;
    }
  }
  console.error('Failed to add conversation message:', lastError);
  throw lastError;
};

/**
 * Fetch messages for a specific conversation
 * @param {number|string} conversationId
 */
export const fetchConversationMessages = async (conversationId) => {
  const candidateEndpoints = [
    `${API_ENDPOINTS.conversations}${conversationId}/messages/`,
    `/conversation-messages/?conversation=${conversationId}`
  ];
  let lastError;
  for (const ep of candidateEndpoints) {
    try {
      const data = await apiCall(ep);
      return data.results || data;
    } catch (e) { lastError = e; }
  }
  console.error('Failed to fetch conversation messages:', lastError);
  throw lastError;
};

/**
 * Fetch pinned items from Django backend
 * @returns {Promise<Set>} - Set of pinned item IDs
 */
export const fetchPinnedItems = async () => {
  /*
  Django API Call Example:
  GET /api/pinned-items/
  
  Returns array of pinned item IDs and metadata:
  [
    { id: "1", type: "news", content_id: 1, pinned_at: "2025-08-22T10:00:00Z" },
    { id: "ai-summary", type: "ai_summary", content_id: "social", pinned_at: "2025-08-22T11:00:00Z" }
  ]
  */
  
  try {
    const data = await apiCall(API_ENDPOINTS.pinned);
    // Be resilient to non-array responses or paginated format
    const items = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
    // Build both a Set of client keys and a mapping from client key -> backend pin id
    const pinnedIds = new Set();
    const pinIdMap = {}; // clientKey -> backendPinId
    items.forEach(item => {
      let clientKey;
      if (item.type === 'pmesii') {
        // content_id expected like "row-col" or similar
        clientKey = `pmesii-${item.content_id}`;
      } else if (item.type === 'ai_summary') {
        clientKey = String(item.content_id);
      } else if (item.type === 'news') {
        clientKey = `news-${item.content_id}`;
      } else if (item.type === 'timeline') {
        clientKey = `timeline-${item.content_id}`;
      } else if (item.type === 'social') {
        clientKey = `social-${item.content_id}`;
      } else {
        clientKey = String(item.content_id);
      }
      pinnedIds.add(clientKey);
      if (item.id !== undefined && item.id !== null) pinIdMap[clientKey] = item.id;
    });
    return { pinnedIds, pinIdMap };
  } catch (error) {
    console.error('Failed to fetch pinned items:', error);
  return { pinnedIds: new Set(), pinIdMap: {} };
  }
};

/**
 * Map Data Fetching Functions - Ready for Django Integration
 */

/**
 * Fetch cities data from Django backend
 * @returns {Promise<Array>} - Array of city data
 */
export const fetchMapCities = async () => {
  /*
  Expected Django response format from /api/cities/:
  {
    "results": [
      {
        "id": 1,
        "name": "Dhaka",
        "latitude": 23.8103,
        "longitude": 90.4125,
        "city_type": "capital",
        "population": "9.5M",
        "active_reports_count": 24
      }
    ]
  }
  */
  
  try {
    console.log('🌍 Attempting to fetch cities from Django API...');
    const data = await apiCall('/cities/');
    console.log('✅ Django cities API response:', data);
  return data.results || data;
  } catch (error) {
    console.error('❌ Failed to fetch cities from Django API:', error);
  // Surface the error so component can fall back or show message
  throw error;
  }
};

/**
 * Search map locations using Django API
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of matching cities
 */
export const searchMapLocations = async (query) => {
  try {
    console.log(`🔍 Searching cities for: ${query}`);
    const queryParams = new URLSearchParams();
    queryParams.append('search', query);
    
    const data = await apiCall(`/cities/?${queryParams}`);
    console.log('✅ Search results:', data);
    return data.results || data;
  } catch (error) {
    console.error('❌ Map search failed:', error);
    // Fallback to client-side search
    const cities = await fetchMapCities();
    return cities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// ===== PLACEHOLDER DATA FUNCTIONS =====
// These will be removed when Django backend is integrated

const getPlaceholderNewsData = () => [
  {
    id: 1,
    source: 'The Daily Star',
    summary: 'AI summary with supporting line text regarding economic developments in Dhaka region.',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=64&h=64&fit=crop&crop=face'
  },
  {
    id: 2,
    source: 'Prothom Alo',
    summary: 'Regional security update with analysis of border area incidents and responses.',
    thumbnail: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=64&h=64&fit=crop&crop=center'
  },
  {
    id: 3,
    source: 'Bangladesh Post',
    summary: 'Infrastructure development progress report for transportation projects.',
    thumbnail: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=64&h=64&fit=crop&crop=center'
  },
  {
    id: 4,
    source: 'Dhaka Tribune',
    summary: 'Climate and weather analysis affecting agricultural production zones.',
    thumbnail: 'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=64&h=64&fit=crop&crop=center'
  },
  {
    id: 5,
    source: 'New Age',
    summary: 'Political developments and governance updates from regional authorities.',
    thumbnail: 'https://images.unsplash.com/photo-1523540939399-141cbff6a8d7?w=64&h=64&fit=crop&crop=center'
  },
  {
    id: 6,
    source: 'Financial Express',
    summary: 'Economic indicators and trade developments affecting the region.',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=64&h=64&fit=crop&crop=center'
  }
];

const getPlaceholderTimelineData = () => [
  {
    id: 1,
    title: 'Economic Summit Agreement',
    date: '15/08/2025',
    summary: 'Regional economic cooperation agreements signed between Bangladesh and neighboring countries.',
    type: 'economic'
  },
  {
    id: 2,
    title: 'Infrastructure Project Launch',
    date: '12/08/2025',
    summary: 'Major transportation infrastructure project launched in Chittagong region.',
    type: 'infrastructure'
  },
  {
    id: 3,
    title: 'Climate Adaptation Program',
    date: '10/08/2025',
    summary: 'New climate resilience program announced for coastal areas vulnerable to flooding.',
    type: 'environment'
  }
];

const getPlaceholderSocialData = () => [
  {
    id: 1,
    quote: '"Impressed by the rapid infrastructure development in Dhaka. The new metro system is transforming urban mobility."',
    title: '@infrastructure_bd',
    description: 'Infrastructure Analyst',
    avatar: 'https://via.placeholder.com/48x48/3b82f6/ffffff?text=IB'
  },
  {
    id: 2,
    quote: '"Climate resilience initiatives in coastal Bangladesh are setting a global example for adaptive strategies."',
    title: '@climate_watch',
    description: 'Environmental Researcher',
    avatar: 'https://via.placeholder.com/48x48/10b981/ffffff?text=CW'
  }
];

const getPlaceholderConversationsData = () => [
  { id: 1, title: 'Previous Conversation 1', summary: 'Summary of conversation about regional security analysis' },
  { id: 2, title: 'Previous Conversation 2', summary: 'Discussion on economic indicators and trade developments' }
];

const getPlaceholderCitiesData = () => [
  {
    id: 1,
    name: 'Dhaka',
    latitude: 23.8103,
    longitude: 90.4125,
    city_type: 'capital',
    population: '9.5M',
    active_reports_count: 24
  },
  {
    id: 2,
    name: 'Chittagong',
    latitude: 22.3569,
    longitude: 91.7832,
    city_type: 'major',
    population: '2.6M',
    active_reports_count: 18
  },
  {
    id: 3,
    name: 'Sylhet',
    latitude: 24.8949,
    longitude: 91.8687,
    city_type: 'division',
    population: '500K',
    active_reports_count: 8
  },
  {
    id: 4,
    name: 'Rajshahi',
    latitude: 24.3636,
    longitude: 88.6241,
    city_type: 'division',
    population: '800K',
    active_reports_count: 12
  },
  {
    id: 5,
    name: 'Khulna',
    latitude: 22.8456,
    longitude: 89.5403,
    city_type: 'division',
    population: '1.2M',
    active_reports_count: 15
  },
  {
    id: 6,
    name: 'Rangpur',
    latitude: 25.7439,
    longitude: 89.2752,
    city_type: 'division',
    population: '300K',
    active_reports_count: 6
  },
  {
    id: 7,
    name: 'Barisal',
    latitude: 22.7010,
    longitude: 90.3535,
    city_type: 'division',
    population: '400K',
    active_reports_count: 7
  },
  {
    id: 8,
    name: 'Mymensingh',
    latitude: 24.7471,
    longitude: 90.4203,
    city_type: 'division',
    population: '500K',
    active_reports_count: 9
  },
  {
    id: 9,
    name: "Cox's Bazar",
    latitude: 21.4272,
    longitude: 92.0058,
    city_type: 'city',
    population: '200K',
    active_reports_count: 3
  },
  {
    id: 10,
    name: 'Comilla',
    latitude: 23.4607,
    longitude: 91.1809,
    city_type: 'city',
    population: '400K',
    active_reports_count: 5
  }
];
