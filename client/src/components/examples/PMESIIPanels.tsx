import { PMESIIPanels } from '../pmesii-panels'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../lib/i18n'

export default function PMESIIPanelsExample() {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="h-96 w-full">
        <PMESIIPanels />
      </div>
    </I18nextProvider>
  )
}