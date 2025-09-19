import { Dashboard } from '../dashboard'
import { ThemeProvider } from '../theme-provider'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../lib/i18n'

export default function DashboardExample() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <div className="h-screen w-full">
          <Dashboard />
        </div>
      </I18nextProvider>
    </ThemeProvider>
  )
}