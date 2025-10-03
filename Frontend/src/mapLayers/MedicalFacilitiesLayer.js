import * as L from 'leaflet';
import { featureLayer } from 'esri-leaflet';

// Factory for the Medical Facilities feature layer
export const createMedicalFacilitiesLayer = (map) => {
  const url = 'https://services-ap1.arcgis.com/iA7fZQOnjY9D67Zx/arcgis/rest/services/OSM_AS_Medical/FeatureServer/0';
  let layer = null;

  const buildLayer = () =>
    featureLayer({
      url,
      where: '1=1',
      simplifyFactor: 0.5,
      precision: 5,
      pointToLayer: (geojson, latlng) =>
        L.circleMarker(latlng, {
          radius: 4,
          color: '#0ea5e9', // outline
          weight: 1,
          fillColor: '#0284c7',
          fillOpacity: 0.7
        })
    })
      .on('loading', () => console.log('Medical facilities loading...'))
      .on('load', () => console.log('Medical facilities loaded'))
      .on('error', (e) => console.warn('Medical facilities error:', e));

  return {
    id: 'medicalFacilities',
    enable() {
      if (!layer) layer = buildLayer();
      if (!map.hasLayer(layer)) layer.addTo(map);
    },
    disable() {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    },
    destroy() {
      try { if (layer) map.removeLayer(layer); } catch {}
      layer = null;
    }
  };
};

export default createMedicalFacilitiesLayer;

