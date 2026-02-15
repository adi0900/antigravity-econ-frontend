import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { chatApi } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    source?: string;
    emissions?: number;
    unit?: string;
  };
}

interface SuggestionChip {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

const suggestionChips: SuggestionChip[] = [
  { id: '1', label: 'Electricity', icon: 'bolt', prompt: 'Estimate emissions for 1000 kWh of electricity in the US' },
  { id: '2', label: 'Flight', icon: 'flight_takeoff', prompt: 'How much CO2 does a 500 km flight produce?' },
  { id: '3', label: 'Cloud', icon: 'dns', prompt: 'Estimate AWS emissions for 200 kWh usage' },
  { id: '4', label: 'Travel', icon: 'directions_car', prompt: 'Emissions for driving 100 km by car' },
];

export function Chat() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [input, setInput] = useState(initialQuery);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Auto-submit if query parameter is present
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatApi.send(messageText, sessionId);
      
      if (response.success && response.data) {
        setSessionId(response.data.session_id);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.message,
          metadata: response.data.metadata,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.error || 'Sorry, I encountered an error. Please try again.',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Network error. Please check your connection and try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleChipClick = (chip: SuggestionChip) => {
    handleSendMessage(chip.prompt);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-[#f6f6f8] opacity-40 transition-opacity duration-500"
        onClick={() => navigate('/')}
      >
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-[#585bf3]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-[#f9fafb]/30 backdrop-blur-[4px]" />

      {/* Chat Interface */}
      <div className="absolute inset-0 flex items-start justify-center pt-[10vh]">
        <div 
          className={`w-full max-w-[720px] mx-4 h-[75vh] flex flex-col transition-all duration-500 ease-out ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'
          }`}
        >
          {/* Glass Panel */}
          <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-[24px] rounded-3xl border border-white/60 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#585bf3] to-purple-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Antigravity AI</h3>
                  <p className="text-xs text-gray-500">Emissions estimation assistant</p>
                </div>
              </div>
              <Link
                to="/audit"
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">assessment</span>
                Run Full Audit
              </Link>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#585bf3]/10 to-purple-100 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[#585bf3] text-3xl">eco</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ask about emissions</h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-md">
                    I can help you estimate carbon emissions for electricity, flights, cloud computing, and more.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestionChips.map((chip) => (
                      <button
                        key={chip.id}
                        onClick={() => handleChipClick(chip)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 hover:border-[#585bf3]/30 hover:shadow-sm transition-all text-sm text-gray-600 hover:text-gray-900"
                      >
                        <span className="material-symbols-outlined text-[18px] text-gray-400">
                          {chip.icon}
                        </span>
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-gray-900 text-white'
                            : 'bg-white border border-gray-100 shadow-sm'
                        }`}
                      >
                        <div className={`text-sm whitespace-pre-wrap ${
                          message.role === 'user' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {message.content.split('**').map((part, i) => 
                            i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                          )}
                        </div>
                        {message.metadata?.source && (
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            Source: {message.metadata.source}
                            {message.metadata.emissions && (
                              <span className="ml-2 px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                                {message.metadata.emissions.toFixed(2)} {message.metadata.unit}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#585bf3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-[#585bf3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-[#585bf3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about emissions..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#585bf3]/20 focus:border-[#585bf3]/30 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-9 h-9 flex items-center justify-center rounded-lg bg-[#585bf3] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a4dd9] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Close Hint */}
          <div className="text-center mt-4 text-xs text-gray-400">
            Press <kbd className="px-1.5 py-0.5 bg-white/60 rounded border border-gray-200 font-mono">ESC</kbd> to close
          </div>
        </div>
      </div>

      {/* Close Button */}
      <Link
        to="/"
        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 bg-white/50 hover:bg-white/80 rounded-full transition-all duration-200"
      >
        <span className="material-symbols-outlined text-[24px]">close</span>
      </Link>
    </div>
  );
}
