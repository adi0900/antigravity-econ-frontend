import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CommandMode {
  id: 'quick' | 'audit';
  label: string;
  description: string;
  icon: string;
}

const modes: CommandMode[] = [
  { id: 'quick', label: 'Quick Ask', description: 'Get instant estimates', icon: 'chat' },
  { id: 'audit', label: 'Full Audit', description: 'Comprehensive analysis', icon: 'auto_awesome' },
];

export function CommandCenter() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [activeMode, setActiveMode] = useState<'quick' | 'audit'>('quick');
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        setActiveMode(prev => prev === 'quick' ? 'audit' : 'quick');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (activeMode === 'quick') {
      navigate(`/chat?q=${encodeURIComponent(input)}`);
    } else {
      navigate(`/audit?context=${encodeURIComponent(input)}`);
    }
  };

  const handleModeSelect = (mode: 'quick' | 'audit') => {
    setActiveMode(mode);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fluid Background */}
      <div 
        className="absolute inset-0 bg-[#f6f6f8]/80 backdrop-blur-[2px] transition-all duration-500"
        onClick={() => navigate('/')}
      >
        {/* Floating Gradient Orbs */}
        <div className="absolute top-[10%] left-[30%] w-[500px] h-[500px] bg-[#585bf3]/10 rounded-full blur-[100px] pointer-events-none animate-float" />
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-orange-300/10 rounded-full blur-[80px] pointer-events-none animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Command Interface */}
      <div className="absolute inset-0 flex items-start justify-center pt-[25vh]">
        <div 
          className={`w-full max-w-[640px] mx-4 transition-all duration-500 ease-out ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          {/* Glass Container */}
          <div className="bg-white/90 backdrop-blur-[20px] rounded-3xl border border-white/70 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.5)] overflow-hidden">
            
            {/* Mode Selector Tabs */}
            <div className="flex border-b border-gray-100/80">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all relative ${
                    activeMode === mode.id 
                      ? 'text-gray-900' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${activeMode === mode.id ? 'text-[#585bf3]' : ''}`}>
                    {mode.icon}
                  </span>
                  <span>{mode.label}</span>
                  {activeMode === mode.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#585bf3]" />
                  )}
                </button>
              ))}
            </div>

            {/* Input Section */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={activeMode === 'quick' ? "Ask anything about emissions..." : "Describe what you want to audit..."}
                  className="w-full bg-gray-50/50 border border-gray-200/60 rounded-2xl text-lg text-gray-800 placeholder-gray-400 focus:ring-0 focus:border-[#585bf3]/30 focus:bg-white px-5 py-4 pr-14 transition-all"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#585bf3] text-white flex items-center justify-center transition-all hover:bg-[#4a4dd9] hover:shadow-lg hover:shadow-[#585bf3]/25 ${
                    input.trim() ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                  }`}
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Context Area */}
            <div className="px-6 pb-6">
              {activeMode === 'quick' ? (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Popular Questions</p>
                  <div className="flex flex-wrap gap-2">
                    {['Electricity usage', 'Flight emissions', 'Server carbon', 'Supply chain'].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="px-3 py-1.5 rounded-full bg-gray-50 hover:bg-white border border-gray-200/60 hover:border-[#585bf3]/20 text-sm text-gray-600 hover:text-gray-900 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Audit Templates</p>
                  <div className="space-y-2">
                    {[
                      { icon: 'cloud', label: 'Cloud Infrastructure', desc: 'AWS, Azure, GCP analysis' },
                      { icon: 'business', label: 'Office Operations', desc: 'Energy, travel, supplies' },
                      { icon: 'local_shipping', label: 'Supply Chain', desc: 'Logistics and manufacturing' },
                    ].map((template) => (
                      <button
                        key={template.label}
                        onClick={() => navigate('/audit')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-white border border-gray-200/60 hover:border-[#585bf3]/20 transition-all text-left group"
                      >
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-[#585bf3]">{template.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{template.label}</p>
                          <p className="text-xs text-gray-500">{template.desc}</p>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 group-hover:text-[#585bf3] group-hover:translate-x-1 transition-all">arrow_forward</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-3 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  <span>Recent: France Grid Analysis</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono text-[10px]">Tab</kbd>
                <span>to switch modes</span>
              </div>
            </div>
          </div>

          {/* Close Hint */}
          <div className="text-center mt-4 text-xs text-gray-400">
            Press <kbd className="px-1.5 py-0.5 bg-white/60 rounded border border-gray-200 font-mono">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}