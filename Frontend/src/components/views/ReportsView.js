import React from 'react';
import { FileText, X } from 'lucide-react';

/**
 * Interactive Reports view component
 * @param {object} props - Component props
 * @param {string} props.reportContent - Current report content
 * @param {function} props.onReportContentChange - Function to handle report content changes
 * @param {function} props.onGenerateReport - Function to generate new report from pinned items
 * @param {function} props.onExportReport - Function to export report
 * @param {Array} props.pinnedItemsData - Array of pinned items data
 * @param {number} props.pinnedCount - Number of pinned items
 * @param {function} props.onRemovePin - Function to remove a pinned item
 * @param {function} props.onClearAllPins - Function to clear all pinned items
 * @returns {JSX.Element} Reports view component
 */
const ReportsView = ({
  reportContent = '',
  onReportContentChange,
  onGenerateReport,
  onExportReport,
  pinnedItemsData = [],
  pinnedCount = 0,
  onRemovePin,
  onClearAllPins
}) => {
  // Calculate report statistics
  const lineCount = reportContent.split('\n').length;
  const charCount = reportContent.length;
  const wordCount = reportContent.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="flex gap-6 h-full overflow-hidden">
      {/* Report Canvas */}
      <div className="flex-1 bg-white/70 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-medium text-gray-800">Interactive Report Canvas</h2>
              <p className="text-sm text-gray-600 mt-1">
                Generate AI reports from pinned items or create your own analysis
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onExportReport}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                title="Export report as text file"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full bg-white/70 border-2 border-gray-200 rounded-lg shadow-inner relative">
            {/* Document-like styling effects */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
            
            {/* Text Area */}
            <textarea
              value={reportContent}
              onChange={(e) => onReportContentChange(e.target.value)}
              placeholder="📝 Start typing your report here, or click 'Generate New Report' to create AI content from pinned items...

This is your interactive canvas - you can:
• Type directly to add your own analysis
• Generate AI reports from pinned items  
• Edit and modify any generated content
• Export your final report

Pin items from other views to build comprehensive reports!"
              className="w-full h-full p-8 pt-12 pb-12 resize-none outline-none text-gray-800 leading-relaxed text-base bg-transparent"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                lineHeight: '1.7'
              }}
            />
            
            {/* Canvas Status Bar */}
            <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-none">
              <div className="bg-gray-800 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-medium">
                {wordCount} words
              </div>
              <div className="bg-gray-800 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-medium">
                {lineCount} lines
              </div>
              <div className="bg-gray-800 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-medium">
                {charCount} chars
              </div>
              <div className="bg-green-600 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-medium">
                ✓ Live
              </div>
            </div>
            
            {/* Empty State Helper */}
            {reportContent.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-gray-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Interactive Report Canvas</p>
                  <p className="text-sm">Click anywhere to start typing or generate AI content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pinned Items Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-md rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Pinned Items</h3>
              <p className="text-sm text-gray-600">
                {pinnedCount} item{pinnedCount !== 1 ? 's' : ''} ready for analysis
              </p>
            </div>
            {pinnedCount > 0 && (
              <button
                onClick={onClearAllPins}
                className="text-xs text-red-600 hover:text-red-700 underline font-medium"
                title="Remove all pinned items"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
        
        {/* Pinned Items List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {pinnedItemsData.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {pinnedItemsData.map((item, index) => (
                <div key={`pinned-${item.id}-${index}`} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Item Title */}
                      <h4 className="font-medium text-gray-800 mb-1 leading-tight">
                        {item.type === 'news' ? (item.source?.name || String(item.source) || 'News Source') :
                         item.title || 'Unknown Item'}
                      </h4>
                      
                      {/* Item Content Preview */}
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {item.type === 'news' ? item.summary :
                         item.type === 'timeline' ? item.summary :
                         item.type === 'social' ? item.quote :
                         item.summary || 'No content available'}
                      </p>
                      
                      {/* Item Metadata */}
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          item.type === 'news' ? 'bg-red-100 text-red-800' :
                          item.type === 'timeline' ? 'bg-green-100 text-green-800' :
                          item.type === 'social' ? 'bg-purple-100 text-purple-800' :
                          item.type === 'pmesii' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.type.toUpperCase()}
                        </span>
                        
                        {item.type === 'timeline' && item.event_type && (
                          <span className="text-xs text-gray-500">
                            {item.event_type}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => onRemovePin(item.id)}
                      className="w-6 h-6 rounded hover:bg-red-100 flex items-center justify-center flex-shrink-0 group"
                      title={`Remove ${item.id} from report`}
                    >
                      <X className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-medium text-gray-700 mb-2">No items pinned yet</h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Pin items from News, Social Media, Timeline, or PMESII views to build comprehensive reports with AI analysis.
              </p>
              <div className="mt-4 space-y-2">
                <div className="text-xs text-gray-400">Navigate to other views and click:</div>
                <div className="inline-flex items-center px-3 py-1 bg-gray-800 text-white rounded text-xs font-medium">
                  Pin for Report
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {pinnedCount > 0 && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={onGenerateReport}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Generate Report from {pinnedCount} Item{pinnedCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
