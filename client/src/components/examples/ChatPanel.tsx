import { ChatPanel } from '../chat-panel'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../lib/i18n'

export default function ChatPanelExample() {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="h-96 w-full">
        <ChatPanel 
          onQuerySubmit={(query, contextIds) => console.log('Query:', query, 'Context:', contextIds)}
          mediaContextIds={['media-1', 'media-2']}
        />
      </div>
    </I18nextProvider>
  )
}