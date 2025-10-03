import React, { useState } from 'react';
import { fetchConversationMessages } from '../../utils/apiUtils';
import { MessageSquare, Send, Plus, Mic, Wrench, Settings } from 'lucide-react';

/**
 * AI Chat view component
 * @param {object} props - Component props
 * @param {Array} props.conversations - Array of conversation history
 * @param {string} props.chatInput - Current chat input value
 * @param {function} props.onChatInputChange - Function to handle chat input changes
 * @param {function} props.onSendMessage - Function to send a message
 * @returns {JSX.Element} AI Chat view component
 */
const AIChatView = ({
  conversations = [],
  chatInput = '',
  onChatInputChange,
  onSendMessage,
  onSelectConversation,
  onNewConversation,
  onPersistMessage
}) => {
  const [messages, setMessages] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  // Normalize role labels coming from backend (handles 'assistent' typo, etc.)
  const normalizeType = (val) => {
    const t = String(val || '').toLowerCase();
    if (t === 'assistant' || t === 'assistent' || t === 'ai' || t === 'bot') return 'assistant';
    if (t === 'user' || t === 'human') return 'user';
    return 'assistant';
  };

  const formatTime = (ts) => {
    try {
      if (!ts) return '';
      if (typeof ts === 'string') return new Date(ts).toLocaleTimeString();
      if (ts instanceof Date) return ts.toLocaleTimeString();
      return String(ts);
    } catch {
      return '';
    }
  };

  const handleSend = () => {
    if (chatInput.trim()) {
      // Add user message
      const newMessage = {
        id: Date.now(),
        type: 'user',
        content: chatInput.trim(),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Call parent handler
      if (onSendMessage) {
        onSendMessage(chatInput.trim());
      }

      // Persist user message
      if (onPersistMessage) {
        onPersistMessage('User', newMessage.content);
      }
      
      // Clear input
      onChatInputChange('');
      
      // Simulate AI response (replace with actual AI integration)
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `I understand you're asking about "${chatInput.trim()}". As your Bangladesh regional intelligence assistant, I can help analyze current events, social media trends, and provide insights based on the available data sources. How would you like me to proceed with this inquiry?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        if (onPersistMessage) {
          onPersistMessage('Assistant', aiResponse.content);
        }
      }, 1000);
    }
  };

  const handleLoadConversation = async (conv) => {
    setSelectedConversationId(conv.id);
    if (onSelectConversation) onSelectConversation(conv);
    // Use saved messages if available; otherwise try to fetch them, then seed
    let msgs = Array.isArray(conv.messages) ? conv.messages : [];
    if (!msgs.length) {
      try {
        msgs = await fetchConversationMessages(conv.id);
      } catch {}
    }
    const restored = Array.isArray(msgs) && msgs.length > 0
      ? msgs
          .map((m, i) => {
            const role = m.type ?? m.role ?? m.sender ?? m.author_role ?? m.role_name;
            const content = m.content ?? m.text ?? m.message ?? '';
            const ts = m.timestamp ?? m.created_at ?? m.createdAt ?? m.time;
            return {
              id: m.id ?? `${conv.id}-${i}`,
              type: normalizeType(role),
              content,
              timestamp: ts ?? new Date()
            };
          })
          .filter(m => (m.content ?? '').toString().trim().length > 0)
      : [
        {
          id: `${conv.id}-seed-1`,
          type: 'assistant',
          content: `Resuming: ${conv.title}. ${conv.summary || ''}`.trim(),
          timestamp: new Date()
        },
          {
            id: `${conv.id}-seed-2`,
            type: 'assistant',
            content: 'How would you like to continue this analysis?',
            timestamp: new Date()
          }
        ];
    setMessages(restored);
    // Clear composer so user can continue typing
    onChatInputChange('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 bg-white/70 backdrop-blur-md rounded-3xl p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-medium text-gray-800">AI Assistant</h2>
            <p className="text-sm text-gray-600 font-medium">
              Regional Intelligence • Bangladesh Focus
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 mb-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Welcome to Regional Intelligence Assistant
                </h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  I can help you analyze news reports, social media trends, timeline events, 
                  and PMESII factors for the Bangladesh region.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button 
                    onClick={() => onChatInputChange("What are the current economic trends in Bangladesh?")}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    Economic trends
                  </button>
                  <button 
                    onClick={() => onChatInputChange("Analyze recent social media sentiment")}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    Social sentiment
                  </button>
                  <button 
                    onClick={() => onChatInputChange("Summarize timeline events")}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                  >
                    Timeline summary
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-lg shadow-sm ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-[11px] opacity-70 mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Chat Input */}
        <div className="flex items-center gap-3 bg-gray-100 rounded-3xl px-6 py-4 flex-shrink-0">
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <Wrench className="w-5 h-5" />
          </button>
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            placeholder="Ask about regional intelligence, trends, or analysis..."
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-transparent outline-none text-lg placeholder-gray-500"
          />
          
          <button 
            onClick={handleSend}
            disabled={!chatInput.trim()}
            className="text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Conversation History Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-sm flex flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 mb-6 flex-shrink-0">
          <button className="w-10 h-10 rounded-2xl bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={async () => {
              try {
                if (onNewConversation) {
                  const id = await onNewConversation();
                  setSelectedConversationId(id);
                }
              } catch {}
              setMessages([]);
            }}
            className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
            title="New conversation"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1 text-right">
            <p className="text-sm font-medium text-gray-800">Conversations</p>
            <p className="text-xs text-gray-500">{conversations.length} saved</p>
          </div>
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-4">
            {/* Current Session */}
            {messages.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-1">Current Session</h3>
                <p className="text-xs text-blue-600">
                  {messages.length} messages • {new Date().toLocaleDateString()}
                </p>
              </div>
            )}
            
            {/* Saved Conversations */}
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No saved conversations</p>
                <p className="text-xs text-gray-400">Start chatting to create history</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleLoadConversation(conv)}
                  className={`w-full text-left bg-white/10 backdrop-blur-md border rounded-lg p-4 hover:shadow-sm transition-shadow ${
                    selectedConversationId === conv.id ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200'
                  }`}
                  title="Load conversation"
                >
                  <h3 className="text-sm font-medium text-gray-800 mb-1">{conv.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{conv.summary}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatView;
