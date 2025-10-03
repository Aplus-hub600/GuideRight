// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  // Existing endpoints
  news: '/news-reports/',
  timeline: '/timeline-events/',
  social: '/social-media-posts/',
  conversations: '/conversations/',
  pinned: '/pinned-items/',
  pmesii: '/pmesii-analysis/',
  aiSummary: '/rag/summary/',
  
  // Map-specific endpoints (matching Django working_api_views.py)
  cities: '/cities/',
  regions: '/regions/',
  mapSearch: '/cities/',  // Cities endpoint supports search parameter
  mapBoundaries: '/map/boundaries/'  // Future endpoint
};

// Map Configuration
export const MAP_CONFIG = {
  center: [23.6850, 90.3563], // Dhaka coordinates
  zoom: 7,
  minZoom: 6,
  maxZoom: 18,
  tileLayer: {
    // Use single-host OSM tiles to avoid subdomain blocking issues
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }
};

// Navigation Items
export const NAVIGATION_ITEMS = [
  { id: 'topNews', icon: 'FileText', label: 'News' },
  { id: 'socialMedia', icon: 'TrendingUp', label: 'Social' },
  { id: 'timeline', icon: 'Calendar', label: 'Timeline' },
  { id: 'pmesii', icon: 'BarChart3', label: 'PMESII' },
  { id: 'reports', icon: 'FileText', label: 'Reports' }
];

// PMESII Matrix Data
export const PMESII_DATA = [
  {
    category: 'Areas',
    data: [
      'Areas - Political (District boundary, Party affiliation areas, voting districts, administrative zones)',
      'Areas - Military (Coalition / UN bases, border embarkation lines)',
      'Areas - Economic (Bazaars, shops, markets)',
      'Areas - Social (parks and other meeting areas)',
      'Areas - Information (Radio/TV/newspaper areas)',
      'Areas - Infrastructure (irrigation networks, water tables, medical coverage)'
    ]
  },
  {
    category: 'Structures',
    data: [
      'Structures - Political (Police, judicial government offices)',
      'Structures - Military (HQ locations)',
      'Structures - Economic (Banks, markets, storage facilities)',
      'Structures - Social (Churches, restaurants, bars)',
      'Structures - Information (Cell/Radio/TV towers, print shops)',
      'Structures - Infrastructure (roads, bridges, power lines, rails, dams)'
    ]
  },
  {
    category: 'Capabilities',
    data: [
      'Capabilities - Political (legislative power, managerial capabilities)',
      'Capabilities - Military (security and force strengths and weaknesses)',
      'Capabilities - Economic (access to banks, ability to distribute/purchase)',
      'Capabilities - Social (strength of local & influential families)',
      'Capabilities - Info (Literacy rate, availability of media/phone service)',
      'Capabilities - Infrastructure (Ability to build/maintain roads, rails, dams)'
    ]
  },
  {
    category: 'Organizations',
    data: [
      'Organizations - Political (Political parties, UN, Bangladesh Awami League, BNP, local councils)',
      'Organizations - Military (Military units, police, security forces present)',
      'Organizations - Economic (Banks, big land holders, big businesses)',
      'Organizations - Social (tribes, clans, families, youth groups, NGOs)',
      'Organizations - Info (News groups, influential people who pass information)',
      'Organizations - Infrastructure (Government ministries, construction companies)'
    ]
  },
  {
    category: 'People',
    data: [
      'People - Political (Government officials, elders)',
      'People - Military (Leaders from coalition and local forces)',
      'People - Economic (Bankers, landholders, merchants)',
      'People - Social (Religious leaders, influential families)',
      'People - Info (Media owners, community leaders)',
      'People - Infrastructure (Builders, contractors, development councils)'
    ]
  },
  {
    category: 'Events',
    data: [
      'Events - Political (elections, council meetings)',
      'Events - Military (operations, security incidents)',
      'Events - Economic (harvest, business activities)',
      'Events - Social (holidays, weddings, religious days)',
      'Events - Info (campaigns, project openings)',
      'Events - Infrastructure (construction projects, maintenance)'
    ]
  }
];

// Map Marker Configuration
export const getMarkerColor = (type) => {
  switch (type) {
    case 'capital': return '#dc2626'; // Red for capital
    case 'major': return '#ea580c';   // Orange for major cities
    case 'division': return '#7c3aed'; // Purple for divisions
    case 'district': return '#059669'; // Green for districts
    case 'city': return '#6b7280';    // Gray for regular cities
    default: return '#6b7280';        // Gray for others
  }
};

export const getMarkerSize = (type) => {
  switch (type) {
    case 'capital': return 12;
    case 'major': return 10;
    case 'division': return 8;
    case 'district': return 7;
    case 'city': return 6;
    default: return 7;
  }
};

// View Types
export const VIEW_TYPES = {
  AI_CHAT: 'aiChat',
  TOP_NEWS: 'topNews', 
  SOCIAL_MEDIA: 'socialMedia',
  TIMELINE: 'timeline',
  PMESII: 'pmesii',
  REPORTS: 'reports'
};

// Pin Types
export const PIN_TYPES = {
  NEWS: 'news',
  SOCIAL: 'social', 
  TIMELINE: 'timeline',
  PMESII: 'pmesii',
  AI_SUMMARY: 'ai'
};
