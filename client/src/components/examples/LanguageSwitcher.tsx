import { LanguageSwitcher } from '../language-switcher'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../lib/i18n'

export default function LanguageSwitcherExample() {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="p-4">
        <LanguageSwitcher />
      </div>
    </I18nextProvider>
  )
}