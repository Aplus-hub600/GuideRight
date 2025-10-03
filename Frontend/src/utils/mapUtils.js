// Enhanced map utilities for robust Leaflet initialization
// This file contains utilities to handle common map loading issues

export const MapUtils = {
  // Check if Leaflet is properly loaded
  isLeafletReady() {
    return window.L && window.L.map && window.L.tileLayer && window.L.circleMarker;
  },

  // Load Leaflet with retry logic
  async loadLeaflet(maxRetries = 5) {
    let attempts = 0;
    
    const tryLoad = () => {
      return new Promise((resolve, reject) => {
        attempts++;
        console.log(`🗺️ Loading Leaflet attempt ${attempts}/${maxRetries}`);

        // Check if already loaded
        if (this.isLeafletReady()) {
          console.log('✅ Leaflet already loaded');
          resolve(true);
          return;
        }

        // Load CSS first
        if (!document.querySelector('link[href*="leaflet"]')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
          document.head.appendChild(cssLink);
        }

        // Load JS
        if (!window.L) {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
          
          script.onload = () => {
            console.log('✅ Leaflet script loaded');
            // Wait a bit for full initialization
            setTimeout(() => {
              if (this.isLeafletReady()) {
                resolve(true);
              } else {
                reject(new Error('Leaflet loaded but not ready'));
              }
            }, 100);
          };
          
          script.onerror = () => {
            reject(new Error('Failed to load Leaflet script'));
          };
          
          document.head.appendChild(script);
        } else {
          // L exists but might not be fully ready
          setTimeout(() => {
            if (this.isLeafletReady()) {
              resolve(true);
            } else {
              reject(new Error('Leaflet exists but not fully ready'));
            }
          }, 100);
        }
      });
    };

    // Retry logic
    for (let i = 0; i < maxRetries; i++) {
      try {
        await tryLoad();
        return true;
      } catch (error) {
        console.warn(`❌ Leaflet load attempt ${attempts} failed:`, error.message);
        if (attempts >= maxRetries) {
          console.error('💥 Failed to load Leaflet after', maxRetries, 'attempts');
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500 * attempts));
      }
    }
  },

  // Validate container is ready for map
  validateContainer(container) {
    if (!container) {
      throw new Error('No container provided');
    }

    const rect = container.getBoundingClientRect();
    console.log('📐 Container dimensions:', rect.width, 'x', rect.height);

    if (rect.width < 50 || rect.height < 50) {
      throw new Error(`Container too small: ${rect.width}x${rect.height}`);
    }

    return { width: rect.width, height: rect.height };
  },

  // Create map with robust error handling
  createMap(container, options = {}) {
    const defaultOptions = {
      center: [23.6850, 90.3563],
      zoom: 7,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: false, // Use SVG for better compatibility
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true
    };

    const mapOptions = { ...defaultOptions, ...options };
    
    console.log('🎯 Creating map with options:', mapOptions);
    
    try {
      const map = window.L.map(container, mapOptions);
      console.log('✅ Map instance created successfully');
      return map;
    } catch (error) {
      console.error('💥 Failed to create map:', error);
      throw error;
    }
  },

  // Add tile layer with fallback servers
  async addTileLayer(map, retryCount = 0) {
    const tileServers = [
      {
        name: 'OpenStreetMap',
        // Single host avoids subdomain/DNS/adblock problems
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors'
      },
      {
        name: 'CartoDB Positron',
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: ['a', 'b', 'c', 'd']
      },
      {
        name: 'Humanitarian OSM',
        url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors, Tiles courtesy of Humanitarian OSM Team',
        subdomains: ['a', 'b', 'c']
      }
    ];

    const server = tileServers[retryCount % tileServers.length];
    console.log(`🌍 Adding tile layer: ${server.name}`);

    try {
      const tileLayer = window.L.tileLayer(server.url, {
        attribution: server.attribution,
        maxZoom: 18,
        subdomains: server.subdomains || ['a', 'b', 'c'],
        errorTileUrl: '' // Prevent error tiles from showing
      });

      // Listen for tile loading events
      tileLayer.on('loading', () => {
        console.log('📡 Tiles loading...');
      });

      tileLayer.on('load', () => {
        console.log('✅ Tiles loaded successfully');
      });

      tileLayer.on('tileerror', (error) => {
        console.warn('⚠️ Tile loading error:', error);
        if (retryCount < tileServers.length - 1) {
          console.log('🔄 Trying alternative tile server...');
          map.removeLayer(tileLayer);
          setTimeout(() => {
            this.addTileLayer(map, retryCount + 1);
          }, 1000);
        }
      });

      tileLayer.addTo(map);
      return tileLayer;
    } catch (error) {
      console.error('💥 Failed to add tile layer:', error);
      if (retryCount < tileServers.length - 1) {
        console.log('🔄 Trying alternative tile server...');
        return this.addTileLayer(map, retryCount + 1);
      }
      throw error;
    }
  },

  // Add city markers with error handling
  addCityMarkers(map, cities) {
    console.log('📍 Adding city markers...');
    const markers = [];

    cities.forEach((city, index) => {
      try {
        const markerColor = city.type === 'capital' ? '#dc2626' : 
                           city.type === 'major' ? '#ea580c' : 
                           city.type === 'division' ? '#7c3aed' : '#6b7280';
        
        const marker = window.L.circleMarker([city.lat, city.lng], {
          radius: city.type === 'capital' ? 8 : city.type === 'major' ? 6 : 4,
          fillColor: markerColor,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        });

        marker.bindPopup(`
          <div style="text-align: center; padding: 8px; min-width: 150px;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${city.name}</h4>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">Population: ${city.population}</p>
            <p style="margin: 0; color: #3b82f6; font-size: 13px; font-weight: 500;">${city.reports} active reports</p>
          </div>
        `);

        marker.addTo(map);
        markers.push(marker);
        console.log(`✅ Added marker for ${city.name}`);
      } catch (error) {
        console.error(`💥 Failed to add marker for ${city.name}:`, error);
      }
    });

    console.log(`✅ Added ${markers.length} markers total`);
    return markers;
  },

  // Force map resize with multiple attempts
  forceResize(map, attempts = 3) {
    if (!map) return;
    
    console.log('🔄 Forcing map resize...');
    
    const resizeAttempt = (attemptNum) => {
      setTimeout(() => {
        try {
          map.invalidateSize({
            debounceMoveend: true,
            pan: false
          });
          console.log(`✅ Map resize attempt ${attemptNum} complete`);
        } catch (error) {
          console.error(`💥 Map resize attempt ${attemptNum} failed:`, error);
        }
      }, attemptNum * 100);
    };

    for (let i = 1; i <= attempts; i++) {
      resizeAttempt(i);
    }
  },

  // Search for city and center map
  searchAndCenter(map, cities, searchTerm) {
    if (!map || !searchTerm) return false;
    
    const city = cities.find(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (city) {
      console.log(`🎯 Found city: ${city.name}`);
      try {
        map.setView([city.lat, city.lng], 10, {
          animate: true,
          duration: 0.5
        });
        
        // Find and open popup for this city
        map.eachLayer((layer) => {
          if (layer.getLatLng) {
            const layerPos = layer.getLatLng();
            if (Math.abs(layerPos.lat - city.lat) < 0.1 && 
                Math.abs(layerPos.lng - city.lng) < 0.1) {
              setTimeout(() => layer.openPopup(), 300);
            }
          }
        });
        
        return true;
      } catch (error) {
        console.error('💥 Failed to center on city:', error);
        return false;
      }
    }
    
    console.log(`❌ City not found: ${searchTerm}`);
    return false;
  },

  // Clean up map instance
  cleanup(mapInstance) {
    if (mapInstance) {
      try {
        console.log('🧹 Cleaning up map instance...');
        mapInstance.off(); // Remove all event listeners
        mapInstance.remove(); // Remove from DOM
        console.log('✅ Map cleanup complete');
      } catch (error) {
        console.warn('⚠️ Map cleanup warning:', error);
      }
    }
  }
};

export default MapUtils;
