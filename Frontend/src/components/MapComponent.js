import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin, Search, Layers, Expand, AlertCircle, Loader2 } from 'lucide-react';
import { MAP_CONFIG, getMarkerColor, getMarkerSize } from '../utils/constants';
import { apiCall, API_ENDPOINTS } from '../utils/apiUtils';
import MapUtils from '../utils/mapUtils';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { featureLayer, query } from 'esri-leaflet';
import { createMedicalFacilitiesLayer } from '../mapLayers/MedicalFacilitiesLayer';

/**
 * Interactive Map component for Bangladesh region
 * @param {object} props - Component props
 * @param {boolean} props.expanded - Whether the map is expanded
 * @param {function} props.onToggleExpand - Function to toggle map expansion
 * @param {string} props.regionSearch - Current region search query
 * @param {function} props.onRegionSearchChange - Function to handle region search changes
 * @returns {JSX.Element} Map component
 */
const MapComponent = ({
  expanded = false,
  onToggleExpand,
  regionSearch = '',
  onRegionSearchChange,
  focusLocation = null
}) => {
  // Refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const resizeObserverRef = useRef(null);
  const focusMarkerRef = useRef(null);
  const medicalLayerRef = useRef(null);
  // Registry for modular map layers
  const layersRegistryRef = useRef({});

  // State
  const [mapStatus, setMapStatus] = useState('initializing');
  const [cities, setCities] = useState([]);
  const [mapLayers, setMapLayers] = useState({
    cities: true,
    incidents: false,
    infrastructure: false,
    boundaries: false,
    medicalFacilities: false
  });
  const [error, setError] = useState(null);
  const [focusMarker, setFocusMarker] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [remoteSuggestions, setRemoteSuggestions] = useState([]); // Nominatim results
  const [activeSugIndex, setActiveSugIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const [showLayerMenu, setShowLayerMenu] = useState(false);


  // Helper functions for map data
  const fetchCitiesFromAPI = useCallback(async () => {
    try {
      console.log('🌍 Fetching cities from Django API...');
      const response = await apiCall('/cities/');
      console.log('✅ Cities data received:', response);
      
      // Transform Django response to match expected format
      const citiesData = (response.results || response).map(city => ({
        id: city.id,
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
        type: city.city_type || 'city',
        population: city.population || 'N/A',
        reports_count: city.active_reports_count || 0
      }));
      
      setCities(citiesData);
      return citiesData;
    } catch (error) {
      console.error('❌ Failed to fetch cities from API:', error);
      // Fallback to placeholder data
      const fallbackCities = [
        { id: 1, name: 'Dhaka', latitude: 23.8103, longitude: 90.4125, type: 'capital', population: '9.5M', reports_count: 24 },
        { id: 2, name: 'Chittagong', latitude: 22.3569, longitude: 91.7832, type: 'major', population: '2.6M', reports_count: 18 },
        { id: 3, name: 'Sylhet', latitude: 24.8949, longitude: 91.8687, type: 'division', population: '500K', reports_count: 8 },
        { id: 4, name: 'Rajshahi', latitude: 24.3636, longitude: 88.6241, type: 'division', population: '800K', reports_count: 12 },
        { id: 5, name: 'Khulna', latitude: 22.8456, longitude: 89.5403, type: 'division', population: '1.2M', reports_count: 15 },
        { id: 6, name: 'Rangpur', latitude: 25.7439, longitude: 89.2752, type: 'division', population: '300K', reports_count: 6 }
      ];
      setCities(fallbackCities);
      return fallbackCities;
    }
  }, []);

  const createCityPopup = useCallback((city) => {
    // Return a string (not a React element) so Leaflet can render it in the popup
    return `
      <div style="text-align: center; padding: 8px; min-width: 150px;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${city.name}</h4>
        <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">Population: ${city.population}</p>
        <p style="margin: 0; color: #3b82f6; font-size: 13px; font-weight: 500;">${city.reports_count} active reports</p>
      </div>
    `;
  }, []);

  const searchCity = useCallback((searchTerm) => {
    if (!searchTerm || !cities.length) return null;
    
    return cities.find(city =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cities]);

  // Initialize map function - simplified approach based on archived version
  const initializeMap = useCallback(async () => {
    if (mapInstanceRef.current || !mapRef.current) {
      return;
    }

    console.log('🗺️ Starting map initialization...');
    setMapStatus('loading');
    setError(null);

    try {
      // Step 1: Load cities data from Django API
      console.log('📍 Fetching cities from Django...');
      const citiesData = await fetchCitiesFromAPI();
      
      // Step 2: Ensure Leaflet is available and container is valid
      if (!MapUtils.isLeafletReady()) {
        await MapUtils.loadLeaflet();
      }

      // Validate container size to avoid zero-height initialization
      const container = mapRef.current;
      let dims;
      try {
        dims = MapUtils.validateContainer(container);
      } catch (e) {
        console.warn('Container size invalid at init, applying temp height...', e.message);
        container.style.minHeight = '300px';
        dims = MapUtils.validateContainer(container);
      }
      // If the container is very short at init, give it more breathing room
      if (dims.height < 180) {
        container.style.minHeight = '320px';
      }

      // Step 3: Create map instance
      console.log('🌍 Creating map instance...');
      container.innerHTML = ''; // Clear container
      const map = MapUtils.createMap(container, { center: MAP_CONFIG.center, zoom: MAP_CONFIG.zoom });

      // Step 4: Add OpenStreetMap tiles
      console.log('🗺️ Adding OpenStreetMap tiles...');
      // Use single-host OSM tiles to avoid subdomain/DNS/adblock issues
      await MapUtils.addTileLayer(map);

      // Step 5: Add city markers
      console.log('📌 Adding city markers...');
      const markers = [];
      
      citiesData.forEach(city => {
        try {
          const markerColor = '#eb2525ff';
          const markerRadius = getMarkerSize(city.type) + 1.5; 
          
          const marker = window.L.circleMarker([city.latitude, city.longitude], {
            radius: markerRadius,
            fillColor: markerColor,
            color: '#f6f6f6ff', // darker blue outline
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.95
          });

          marker.bindPopup(createCityPopup(city));
          marker.addTo(map);
          markers.push(marker);
          console.log(`✅ Added marker for ${city.name}`);
        } catch (error) {
          console.error(`❌ Failed to add marker for ${city.name}:`, error);
        }
      });

      markersRef.current = markers;
      mapInstanceRef.current = map;
      // Initialize layers registry
      layersRegistryRef.current = {
        medicalFacilities: createMedicalFacilitiesLayer(map)
      };

      // Remove the temporary focus marker when clicking anywhere on the map
      map.on('click', () => {
        try {
          if (focusMarkerRef.current) {
            map.removeLayer(focusMarkerRef.current);
            focusMarkerRef.current = null;
            setFocusMarker(null);
          }
          map.closePopup();
        } catch (e) {
          console.warn('Focus marker cleanup on map click failed:', e);
        }
      });

      // Step 6: Finalize
      // Observe container size changes and invalidate map size as needed
      if ('ResizeObserver' in window && container) {
        const ro = new ResizeObserver(() => {
          try {
            map.invalidateSize();
          } catch {}
        });
        ro.observe(container);
        resizeObserverRef.current = ro;
      }

      // Force a few resizes to settle layout
      MapUtils.forceResize(map, 4);
      setTimeout(() => setMapStatus('ready'), 350);

    } catch (error) {
      console.error('❌ Map initialization failed:', error);
      setMapStatus('error');
      setError(error.message);
    }
  }, [fetchCitiesFromAPI, createCityPopup]);

  // Region search handler - simplified
  const handleRegionSearch = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.length < 2 || !mapInstanceRef.current) return;

    console.log('🔍 Searching for:', searchTerm);
    
    const city = searchCity(searchTerm);
    
    if (city) {
      console.log(`🎯 Found city: ${city.name}`);
      try {
        mapInstanceRef.current.setView([city.latitude, city.longitude], 10, {
          animate: true,
          duration: 0.5
        });
        
        // Find and open popup for this city
        setTimeout(() => {
          markersRef.current.forEach((marker) => {
            const markerPos = marker.getLatLng();
            if (
              Math.abs(markerPos.lat - city.latitude) < 0.1 &&
              Math.abs(markerPos.lng - city.longitude) < 0.1
            ) {
              marker.openPopup();
            }
          });
        }, 300);
      } catch (error) {
        console.error('❌ Failed to center on city:', error);
      }
    } else {
      console.log(`❌ City not found: ${searchTerm}`);
    }
  }, [searchCity]);

  // Toggle map layer function
  const toggleMapLayer = useCallback((layerName) => {
    setMapLayers(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
    
    console.log(`🔄 Toggle layer: ${layerName}`);
  }, []);

  // City name suggestions for the search bar
  const citySuggestions = React.useMemo(() => {
    const seen = new Set();
    const list = [];
    cities.forEach(c => {
      if (!seen.has(c.name)) {
        list.push({ name: c.name, reports: c.reports_count || 0, type: c.type || 'city' });
        seen.add(c.name);
      }
    });
    // Sort by reports desc, then name
    list.sort((a, b) => (b.reports - a.reports) || a.name.localeCompare(b.name));
    return list;
  }, [cities]);

  const filteredSuggestions = React.useMemo(() => {
    if (!regionSearch) return citySuggestions.slice(0, 8);
    const q = regionSearch.toLowerCase();
    return citySuggestions.filter(s => s.name.toLowerCase().includes(q)).slice(0, 8);
  }, [citySuggestions, regionSearch]);

  // Combine remote Nominatim suggestions with local city ones
  const combinedSuggestions = React.useMemo(() => {
    const locals = filteredSuggestions.map(s => ({
      key: `local-${s.name}`,
      name: s.name,
      source: 'local'
    }));
    const remotes = (remoteSuggestions || []).map((r, idx) => ({
      key: `remote-${idx}-${r.place_id || r.osm_id || r.display_name}`,
      name: r.display_name || r.name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      bbox: r.boundingbox,
      source: 'nominatim'
    }));
    // Prefer remote first when typing; fall back to locals
    const list = (regionSearch ? [...remotes, ...locals] : locals).slice(0, 10);
    // Reset active index if it exceeds list length
    if (activeSugIndex >= list.length) setActiveSugIndex(list.length - 1);
    return list;
  }, [filteredSuggestions, remoteSuggestions, regionSearch]);

  const handleSearchFocus = () => {
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 120);
  };

  const handleSearchChange = (e) => {
    onRegionSearchChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (sug) => {
    const name = typeof sug === 'string' ? sug : (sug?.name || '');
    onRegionSearchChange(name);
    setShowSuggestions(false);
    if (sug && typeof sug === 'object' && typeof sug.lat === 'number' && typeof sug.lon === 'number') {
      try {
        // If a bounding box is present, fit bounds dynamically like standard search
        if (Array.isArray(sug.bbox) && sug.bbox.length === 4) {
          // Nominatim order: [south, north, west, east]
          const south = parseFloat(sug.bbox[0]);
          const north = parseFloat(sug.bbox[1]);
          const west = parseFloat(sug.bbox[2]);
          const east = parseFloat(sug.bbox[3]);
          const bounds = window.L.latLngBounds([[south, west], [north, east]]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
        } else {
          mapInstanceRef.current.setView([sug.lat, sug.lon], 11, { animate: true, duration: 0.5 });
        }
        if (focusMarkerRef.current) {
          try { mapInstanceRef.current.removeLayer(focusMarkerRef.current); } catch {}
          focusMarkerRef.current = null;
        }
        const marker = window.L.circleMarker([sug.lat, sug.lon], {
          radius: 9,
          fillColor: '#2563eb',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(mapInstanceRef.current);
        marker.bindPopup(`<div style=\"max-width:260px; font-weight:600;\">${name}</div>`).openPopup();
        focusMarkerRef.current = marker;
        setFocusMarker(marker);
      } catch (e) {
        console.warn('Failed to center to Nominatim result:', e);
      }
    } else {
      // Fallback to local search
      try { handleRegionSearch(name); } catch {}
    }
  };

  // Debounced Nominatim search for global locations
  useEffect(() => {
    let abort = false;
    const q = regionSearch?.trim();
    if (!q || q.length < 3 || mapStatus !== 'ready') {
      setRemoteSuggestions([]);
      return () => {};
    }
    const timer = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`Nominatim error ${res.status}`);
        const data = await res.json();
        if (!abort) setRemoteSuggestions(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!abort) setRemoteSuggestions([]);
        console.warn('Nominatim search failed:', e);
      }
    }, 400);
    return () => { abort = true; clearTimeout(timer); };
  }, [regionSearch, mapStatus]);

  // Reset map to center view
  const resetMapView = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
      try {
        // Clear any focus marker and close popups
        if (focusMarkerRef?.current) {
          mapInstanceRef.current.removeLayer(focusMarkerRef.current);
          focusMarkerRef.current = null;
          setFocusMarker(null);
        }
        mapInstanceRef.current.closePopup();
      } catch {}
      // Clear the search bar and hide suggestions
      if (typeof onRegionSearchChange === 'function') {
        onRegionSearchChange('');
      }
      setShowSuggestions(false);
      console.log('🔄 Map view reset to Bangladesh center (search cleared)');
    }
  }, [onRegionSearchChange]);

  // Effects
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        initializeMap();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup map when component unmounts
      if (mapInstanceRef.current) {
        try {
          console.log('🧹 Cleaning up map instance...');
          try {
            const reg = layersRegistryRef.current || {};
            Object.values(reg).forEach(l => l && l.destroy && l.destroy());
          } catch {}
          mapInstanceRef.current.off(); // Remove event listeners
          mapInstanceRef.current.remove(); // Remove from DOM
          mapInstanceRef.current = null;
          markersRef.current = [];
          console.log('✅ Map cleanup complete');
        } catch (e) {
          console.warn('⚠️ Map cleanup warning:', e);
        }
      }
      if (resizeObserverRef.current) {
        try { resizeObserverRef.current.disconnect(); } catch {}
        resizeObserverRef.current = null;
      }
    };
  }, [initializeMap]);

  // Handle map resize
  useEffect(() => {
    if (mapInstanceRef.current && mapStatus === 'ready') {
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          console.log('🔄 Map resized');
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [expanded, mapStatus]);

  // Handle external focus by coordinates
  useEffect(() => {
    if (!focusLocation || !mapInstanceRef.current || mapStatus !== 'ready') return;
    const { lat, lng, label } = focusLocation;
    if (typeof lat === 'number' && typeof lng === 'number') {
      try {
        mapInstanceRef.current.setView([lat, lng], 11, { animate: true, duration: 0.5 });
        // Highlight marker
        if (focusMarkerRef.current) {
          try { mapInstanceRef.current.removeLayer(focusMarkerRef.current); } catch {}
          focusMarkerRef.current = null;
        }
        const marker = window.L.circleMarker([lat, lng], {
          radius: 9,
          fillColor: '#2563eb',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(mapInstanceRef.current);
        if (label) {
          marker.bindPopup(`<div style=\"max-width:260px; font-weight:600; text-align:center\">${label}</div>`).openPopup();
        }
        setFocusMarker(marker);
        focusMarkerRef.current = marker;
      } catch (e) {
        console.warn('Failed to set external focus:', e);
      }
    }
  }, [focusLocation, mapStatus]);

  // Handle region search with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (regionSearch.length >= 2 && mapStatus === 'ready') {
        handleRegionSearch(regionSearch);
      }
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [regionSearch, mapStatus, handleRegionSearch]);

  // Toggle modular layers via registry (e.g., medical facilities)
  useEffect(() => {
    if (!mapInstanceRef.current || mapStatus !== 'ready') return;
    const reg = layersRegistryRef.current || {};
    const med = reg.medicalFacilities;
    if (med) {
      if (mapLayers.medicalFacilities) med.enable(); else med.disable();
    }
  }, [mapLayers.medicalFacilities, mapStatus]);

  const outerClasses = `transition-all duration-500 ease-in-out ${expanded ? '' : 'mx-6 mt-6 mb-6'}`;
  const outerStyle = expanded
    ? { position: 'fixed', inset: 0, zIndex: 50, height: '100vh', width: '100vw' }
    : { height: '25vh' };

  return (
    <div className={outerClasses} style={outerStyle}>
      <div className={`bg-white rounded-3xl overflow-hidden shadow-sm h-full ${expanded ? 'relative' : 'flex flex-col'}`}>
        
        {/* Map Header - Overlays map in expanded view */}
        <div className={`transition-all duration-300 ${expanded 
            ? 'absolute top-0 left-0 right-0 z-20 bg-white/60 backdrop-blur-md border-b border-white/30 px-6 py-4' 
            : 'p-6 h-1/5 border-b border-gray-100'
        }`}>
          <div className="flex items-center gap-4 h-full">
            <div className="flex-shrink-0">
              <h2 className="text-2xl font-medium text-gray-800">Interactive Map</h2>
              <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                Bangladesh Region 
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${ 
                  mapStatus === 'ready' ? 'bg-green-100 text-green-800' :
                  mapStatus === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                  mapStatus === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {mapStatus === 'ready' ? '● Ready' :
                   mapStatus === 'loading' ? '● Loading' :
                   mapStatus === 'error' ? '● Error' :
                   '● Initializing'}
                </span>
                {cities.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {cities.length} cities
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex-1">
              <div className="relative">
                <div className={`flex items-center gap-2 rounded-3xl px-6 py-3 w-full ${expanded ? 'bg-white/70 backdrop-blur-md' : 'bg-gray-200'}`}>
                  <Search className="w-5 h-5 text-gray-600" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search places worldwide (powered by OSM)"
                    value={regionSearch}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const chosen = activeSugIndex >= 0 ? combinedSuggestions[activeSugIndex] : combinedSuggestions[0];
                        if (chosen) handleSuggestionClick(chosen);
                        else if (regionSearch) handleRegionSearch(regionSearch);
                        setShowSuggestions(false);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        if (!showSuggestions) setShowSuggestions(true);
                        const next = (activeSugIndex + 1) % Math.max(combinedSuggestions.length, 1);
                        setActiveSugIndex(next);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (!showSuggestions) setShowSuggestions(true);
                        const len = Math.max(combinedSuggestions.length, 1);
                        const prev = (activeSugIndex - 1 + len) % len;
                        setActiveSugIndex(prev);
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                        setActiveSugIndex(-1);
                      }
                    }}
                    disabled={mapStatus !== 'ready'}
                    className="bg-transparent text-gray-800 placeholder-gray-500 outline-none flex-1 disabled:opacity-50"
                  />
                </div>
                {showSuggestions && combinedSuggestions.length > 0 && (
                  <div className={`absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden ${expanded ? 'bg-white/80 backdrop-blur-md' : ''}`}>
                    {combinedSuggestions.map((sug, idx) => (
                      <button
                        key={sug.key || sug.name}
                        type="button"
                        className={`w-full text-left px-4 py-2 flex items-center justify-between ${idx === activeSugIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(sug); }}
                      >
                        <span className="text-gray-800 truncate">{sug.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{sug.source === 'nominatim' ? 'OSM' : 'Local'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <button 
                onClick={resetMapView}
                disabled={mapStatus !== 'ready'}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset to Bangladesh view"
              >
                <MapPin className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="relative">
                <button
                    onClick={() => setShowLayerMenu(!showLayerMenu)}
                    disabled={mapStatus !== 'ready'}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
                      expanded
                        ? (showLayerMenu ? 'bg-white/70 backdrop-blur-md' : 'bg-white/60 backdrop-blur-md hover:bg-white/70')
                        : (showLayerMenu ? 'bg-gray-200' : 'hover:bg-gray-100')
                    }`}
                    title="Toggle map layers"
                >
                    <Layers className="w-5 h-5 text-gray-600" />
                </button>
                {showLayerMenu && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 border ${
                      expanded ? 'bg-white/70 backdrop-blur-md border-white/30' : 'bg-white border-gray-200'
                    }`}>
                        <div className="p-2">
                            <label className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${expanded ? 'hover:bg-white/40' : 'hover:bg-gray-100'}`}>
                                <span className="text-sm font-medium text-gray-700">Medical Facilities</span>
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                    checked={mapLayers.medicalFacilities}
                                    onChange={() => toggleMapLayer('medicalFacilities')}
                                />
                            </label>
                            <label className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer ${expanded ? 'hover:bg-white/40' : 'hover:bg-gray-100'}`}>
                                <span className="text-sm font-medium text-gray-700">Admin Boundaries</span>
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-blue-600 rounded"
                                    checked={mapLayers.boundaries}
                                    onChange={() => toggleMapLayer('boundaries')}
                                />
                            </label>
                        </div>
                    </div>
                )}
              </div>
              
              <button 
                onClick={onToggleExpand}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                title={expanded ? "Collapse map" : "Expand map"}
              >
                <Expand className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Map Container - Takes full space in expanded view */}
        <div className={`${expanded ? 'h-full' : 'h-4/5'} relative overflow-hidden`}>
          <div 
            ref={mapRef}
            className="w-full h-full"
            style={{ backgroundColor: '#f9fafb' }}
          />
          
          {/* Overlays */}
          {(mapStatus === 'loading' || mapStatus === 'initializing') && (
            <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-30">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Loading Interactive Map</p>
                <p className="text-gray-500 text-sm mt-1">
                  {mapStatus === 'initializing' ? 'Preparing map engine...' : 'Fetching map data...'}
                </p>
              </div>
            </div>
          )}
          
          {mapStatus === 'ready' && (
            <div className="absolute bottom-4 right-4 z-20">
              <div className="flex gap-2">
                <button 
                  onClick={resetMapView}
                  className={`${expanded ? 'bg-white/70 backdrop-blur-md border-white/30' : 'bg-white border-gray-200'} px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 text-sm font-medium border`}
                >
                  <MapPin className="w-4 h-4" />
                  Reset View
                </button>
                <button 
                  onClick={onToggleExpand}
                  className={`${expanded ? 'bg-white/70 backdrop-blur-md border-white/30' : 'bg-white border-gray-200'} px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 text-sm font-medium border`}
                >
                  <Expand className="w-4 h-4" />
                  {expanded ? 'Collapse' : 'Expand'}
                </button>
              </div>
            </div>
          )}
          
          {mapStatus === 'error' && (
            <div className="absolute top-4 right-4 z-30">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Map Error</p>
                  <p className="text-xs opacity-90">Click reload to retry</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-white text-red-600 px-2 py-1 rounded text-xs hover:bg-gray-100 transition-colors"
                >
                  Reload
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
