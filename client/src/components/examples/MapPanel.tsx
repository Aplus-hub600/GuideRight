import { MapPanel } from '../map-panel'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../lib/i18n'

export default function MapPanelExample() {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="h-96 w-full">
        <MapPanel 
          aoi={{
            name: "Kandahar City",
            lat: 31.6089,
            lng: 65.7372,
            radiusKm: 5
          }}
          riskScore={67}
          onAOIChange={(aoi) => console.log('AOI changed:', aoi)}
          onMovementPlanRequest={() => console.log('Movement plan requested')}
        />
      </div>
    </I18nextProvider>
  )
}