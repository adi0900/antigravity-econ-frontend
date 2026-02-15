import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

interface StreamingTextProps {
  text: string;
  delay?: number;
}

function StreamingText({ text, delay = 0 }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= text.length) {
          setDisplayedText(text.slice(0, index));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, 20);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span className={`${isComplete ? '' : 'animate-pulse'}`}>
      {displayedText}
      {!isComplete && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />}
    </span>
  );
}

// Result data passed via URL params or state
interface ResultData {
  query: string;
  emissions: number;
  unit: string;
  region: string;
  activity: number;
  activityUnit: string;
  factor: number;
  factorUnit: string;
  source: string;
  explanation: string;
}

export function ChatResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Parse result data from URL params
  const resultData: ResultData = {
    query: searchParams.get('q') || 'Estimate emissions from electricity usage',
    emissions: parseFloat(searchParams.get('emissions') || '0'),
    unit: searchParams.get('unit') || 'kgCO2e',
    region: searchParams.get('region') || 'Unknown',
    activity: parseFloat(searchParams.get('activity') || '0'),
    activityUnit: searchParams.get('activityUnit') || 'kWh',
    factor: parseFloat(searchParams.get('factor') || '0'),
    factorUnit: searchParams.get('factorUnit') || 'kg/kWh',
    source: searchParams.get('source') || 'Climatiq API',
    explanation: searchParams.get('explanation') || 'Carbon emissions calculated based on the provided activity data and regional emission factors.',
  };
  
  const [isVisible, setIsVisible] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    setTimeout(() => setShowResponse(true), 800);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/chat');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background - Blurred Dashboard */}
      <div className="absolute inset-0 bg-[#f6f6f8]">
        {/* Background Gradient Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#585bf3]/5 rounded-full blur-3xl opacity-70 animate-float pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-3xl opacity-70 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
        
        {/* Blurred Dashboard Context */}
        <div className="w-full h-full opacity-40 blur-[2px] pointer-events-none">
          <header className="flex items-center justify-between px-10 py-5">
            <div className="flex items-center gap-4">
              <div className="size-8 text-slate-800">
                <span className="material-symbols-outlined text-3xl">eco</span>
              </div>
              <h2 className="text-slate-900 text-lg font-bold tracking-tight">Antigravity</h2>
            </div>
            <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
          </header>
          <main className="px-10 py-8 flex-1">
            <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="h-48 bg-white rounded-2xl shadow-sm"></div>
              <div className="h-48 bg-white rounded-2xl shadow-sm"></div>
              <div className="h-48 bg-white rounded-2xl shadow-sm"></div>
            </div>
          </main>
        </div>
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-[#F9FAFB]/60 backdrop-blur-sm" />

      {/* Result Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          className={`w-full max-w-[640px] transition-all duration-500 ease-out ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'
          }`}
        >
          {/* Glass Panel */}
          <div className="bg-white/85 backdrop-blur-[24px] rounded-2xl border border-white/60 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.4)] overflow-hidden relative">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-[#585bf3] via-indigo-400 to-[#585bf3] w-full animate-pulse" />

            {/* Modal Header */}
            <div className="px-8 pt-6 pb-2 flex justify-between items-start">
              <div className="flex items-center gap-2 text-[#585bf3]/80">
                <span className="material-symbols-outlined text-[20px] animate-pulse">auto_awesome</span>
                <span className="text-xs font-medium uppercase tracking-wider">Antigravity Intelligence</span>
              </div>
              <Link to="/chat" className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </Link>
            </div>

            {/* Content */}
            <div className="p-8 pt-4 flex flex-col gap-8">
              {/* User Query */}
              <div className="flex gap-4 items-start group">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600" />
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-xs font-medium text-slate-400">You asked</span>
                  <p className="text-lg text-slate-500 font-light leading-relaxed">
                    {resultData.query}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              {/* AI Response */}
              {showResponse && (
                <div className="flex gap-4 items-start animate-fade-in-up">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#585bf3] to-indigo-600 flex items-center justify-center shrink-0 shadow-md text-white">
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                  </div>
                  <div className="flex flex-col gap-5 w-full">
                    {/* Text Stream */}
                    <div className="flex flex-col gap-3">
                      <span className="text-xs font-medium text-[#585bf3] mb-1">Answer generated</span>
                      <p className="text-slate-800 text-[16px] leading-relaxed">
                        <StreamingText 
                          text={resultData.explanation} 
                          delay={0}
                        />
                      </p>
                      {resultData.factor > 0 && (
                        <p className="text-slate-800 text-[16px] leading-relaxed">
                          <StreamingText 
                            text={`Using emission factor of ${resultData.factor} ${resultData.factorUnit} for ${resultData.region}.`}
                            delay={1500}
                          />
                        </p>
                      )}
                    </div>

                    {/* Result Highlight Block */}
                    <div 
                      className="bg-gradient-to-br from-[#585bf3]/5 to-[#585bf3]/12 border border-[#585bf3]/10 rounded-xl p-5 flex items-center justify-between group cursor-default transition-all duration-300 hover:shadow-md animate-fade-in-up"
                      style={{ animationDelay: '2s' }}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Total Emissions</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-semibold text-slate-900 tracking-tight">
                            {resultData.emissions > 0 ? resultData.emissions.toFixed(2) : '—'}
                          </span>
                          <span className="text-lg font-medium text-slate-500">{resultData.unit}</span>
                        </div>
                      </div>
                      {/* Source Pill */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-white/50 shadow-sm hover:bg-white transition-colors cursor-help group/tooltip relative">
                        <span className="material-symbols-outlined text-[14px] text-emerald-500">verified</span>
                        <span className="text-[11px] font-medium text-slate-600">Source: {resultData.source}</span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none font-mono">
                          <div className="text-[10px] leading-normal opacity-80">
                            {'{'}
                            <br/>
                            &nbsp;&nbsp;"region": "{resultData.region}",
                            <br/>
                            &nbsp;&nbsp;"activity": {resultData.activity} {resultData.activityUnit},
                            <br/>
                            &nbsp;&nbsp;"factor": {resultData.factor},
                            <br/>
                            &nbsp;&nbsp;"unit": "{resultData.factorUnit}"
                            <br/>
                            {'}'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-50/50 border-t border-slate-100 px-8 py-5 flex items-center justify-between backdrop-blur-sm">
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${resultData.emissions.toFixed(2)} ${resultData.unit}`);
                  }}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" 
                  title="Copy result"
                >
                  <span className="material-symbols-outlined text-[20px]">content_copy</span>
                </button>
                <button 
                  onClick={() => navigate('/chat')}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" 
                  title="New calculation"
                >
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate('/chat')}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Back
                </button>
                {/* Run Full Audit */}
                <button 
                  onClick={() => navigate('/audit')}
                  className="px-4 py-2 text-sm font-medium text-[#585bf3] hover:bg-[#585bf3]/5 rounded-xl transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  Run Full Audit
                </button>
                {/* Save CTA */}
                <button 
                  onClick={() => {
                    // Pass result data to save page via URL params
                    const saveParams = new URLSearchParams({
                      emissions: resultData.emissions.toString(),
                      unit: resultData.unit,
                      activity: resultData.activity.toString(),
                      activityUnit: resultData.activityUnit,
                      region: resultData.region,
                      factor: resultData.factor.toString(),
                      factorUnit: resultData.factorUnit,
                      query: resultData.query,
                    });
                    navigate(`/save?${saveParams.toString()}`);
                  }}
                  className="group relative px-5 py-2.5 rounded-xl bg-white text-[#585bf3] text-sm font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-sm overflow-hidden isolate"
                >
                  <div className="absolute inset-0 rounded-xl border border-[#585bf3]/20 group-hover:border-[#585bf3]/40 transition-colors z-10"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[#585bf3]/5 transition-opacity z-0"></div>
                  <div className="relative z-20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">save_alt</span>
                    <span>Save as Mini-Report</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}