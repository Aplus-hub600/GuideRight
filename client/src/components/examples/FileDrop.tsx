import { FileDrop } from '../file-drop'
import { I18nextProvider } from 'react-i18next'
import i18n from '../../lib/i18n'

export default function FileDropExample() {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="p-4">
        <FileDrop 
          onAnalysisComplete={(fileId, items) => console.log('Analysis:', fileId, items)}
          onFilesChange={(fileIds) => console.log('Files changed:', fileIds)}
        />
      </div>
    </I18nextProvider>
  )
}