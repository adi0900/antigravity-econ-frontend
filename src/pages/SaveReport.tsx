import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { reportsApi } from '../lib/api';

interface Tag {
  id: string;
  label: string;
}

// Data passed from ChatResult page
interface ReportData {
  emissions: number;
  unit: string;
  activity: number;
  activityUnit: string;
  region: string;
  factor: number;
  factorUnit: string;
  query: string;
}

export function SaveReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Parse report data from URL params
  const reportData: ReportData = {
    emissions: parseFloat(searchParams.get('emissions') || '0'),
    unit: searchParams.get('unit') || 'kgCO2e',
    activity: parseFloat(searchParams.get('activity') || '0'),
    activityUnit: searchParams.get('activityUnit') || 'kWh',
    region: searchParams.get('region') || 'Unknown',
    factor: parseFloat(searchParams.get('factor') || '0'),
    factorUnit: searchParams.get('factorUnit') || 'kg/kWh',
    query: searchParams.get('query') || 'Quick estimate',
  };
  
  const [isVisible, setIsVisible] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState(
    `${reportData.region} ${reportData.activityUnit} Estimate`
  );

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleClose = () => {
    // Navigate back preserving params
    const resultParams = new URLSearchParams({
      q: reportData.query,
      emissions: reportData.emissions.toString(),
      unit: reportData.unit,
      region: reportData.region,
      activity: reportData.activity.toString(),
      activityUnit: reportData.activityUnit,
      factor: reportData.factor.toString(),
      factorUnit: reportData.factorUnit,
    });
    navigate(`/result?${resultParams.toString()}`);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      setTags([...tags, { id: Date.now().toString(), label: newTag.trim() }]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await reportsApi.create({
        title: reportTitle,
        type: 'estimate',
        total_emissions: reportData.emissions,
        unit: reportData.unit,
        data: {
          query: reportData.query,
          activity: reportData.activity,
          activityUnit: reportData.activityUnit,
          region: reportData.region,
          factor: reportData.factor,
          factorUnit: reportData.factorUnit,
          tags: tags.map(t => t.label),
        },
      });
      
      if (response.success) {
        navigate('/reports');
      } else {
        setError(response.error || 'Failed to save report');
        setIsSaving(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background - Blurred Context */}
      <div className="absolute inset-0 bg-[#F9FAFB]/30 backdrop-blur-[8px]">
        {/* Mock Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-64 h-32 bg-white rounded-lg shadow-sm border border-gray-100"></div>
          <div className="absolute top-10 right-20 w-64 h-32 bg-white rounded-lg shadow-sm border border-gray-100"></div>
          <div className="absolute top-52 left-10 w-96 h-64 bg-white rounded-lg shadow-sm border border-gray-100"></div>
          <div className="absolute bottom-20 right-10 size-16 rounded-full bg-white shadow-lg"></div>
        </div>
      </div>

      {/* Modal Container */}
      <div className="absolute inset-0 flex items-end justify-center sm:items-center p-0 sm:p-4">
        <div className="relative w-full max-w-[600px]">
          {/* Modal Card */}
          <div 
            className={`relative w-full bg-white sm:rounded-lg rounded-t-[32px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-white/60 overflow-hidden transition-all duration-500 ${
              isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-full'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {/* Gradient Top Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#6366F1] via-[#818cf8] to-emerald-400"></div>

            {/* Header */}
            <div className="px-6 pt-6 pb-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-full bg-[#6366F1]/10 text-[#6366F1]">
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                </div>
                <h2 className="text-[#2D3436] font-semibold text-xl tracking-tight">New Report</h2>
              </div>
              <button 
                onClick={handleClose}
                className="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-6">
              {/* Report Title Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide pl-1">Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-[#2D3436] focus:ring-1 focus:ring-[#6366F1]/20 focus:border-[#6366F1] transition-all text-sm"
                  placeholder="Enter report title..."
                />
              </div>
              
              {/* Data Grid */}
              <div className="space-y-3">
                {/* Activity Row */}
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">bolt</span>
                    <span className="text-sm font-medium text-gray-500">Activity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#2D3436] font-medium">{reportData.activity || '—'}</span>
                    <span className="text-gray-400 text-sm">{reportData.activityUnit}</span>
                  </div>
                </div>
                
                {/* Region Row */}
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">public</span>
                    <span className="text-sm font-medium text-gray-500">Region</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#2D3436] font-medium">{reportData.region}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono">
                      {reportData.region.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Factor Row */}
                <div className="flex justify-between items-baseline">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400 text-[18px]">science</span>
                    <span className="text-sm font-medium text-gray-500">Factor</span>
                  </div>
                  <div className="font-mono text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    {reportData.factor > 0 ? `${reportData.factor} ${reportData.factorUnit}` : '—'}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200"></div>

              {/* Total Block */}
              <div className="flex flex-col gap-1 items-center justify-center py-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Total Emissions</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold text-[#2D3436] tracking-tight">
                    {reportData.emissions > 0 ? reportData.emissions.toFixed(2) : '—'}
                  </span>
                  <span className="text-lg font-medium text-gray-500">{reportData.unit}</span>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Tag Input Section */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide pl-1">Tags</label>
                <div 
                  className="flex flex-wrap items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-200 focus-within:border-[#6366F1] focus-within:ring-1 focus-within:ring-[#6366F1]/20 transition-all cursor-text"
                  onClick={() => document.getElementById('tag-input')?.focus()}
                >
                  {tags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1 shadow-sm">
                      <span className="text-xs font-medium text-[#2D3436]">{tag.label}</span>
                      <button 
                        onClick={() => handleRemoveTag(tag.id)}
                        className="hover:text-red-500 text-gray-400 flex items-center"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                  <input
                    id="tag-input"
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tags (e.g. Operations)..."
                    className="flex-1 bg-transparent border-none text-sm text-[#2D3436] placeholder-gray-400 focus:ring-0 p-0 h-6 min-w-[120px] outline-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full group relative overflow-hidden rounded-md bg-[#2D3436] hover:bg-[#1a1f21] text-white font-medium py-3.5 px-4 transition-all duration-200 shadow-[0_4px_14px_0_rgba(0,0,0,0.3)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSaving ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Save to Dashboard</span>
                        <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                </button>
              </div>
            </div>

            {/* Bottom Decorative Edge */}
            <div className="h-6 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-1">
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
            </div>
          </div>

          {/* Shadow */}
          <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/5 blur-xl rounded-full -z-10"></div>
        </div>
      </div>
    </div>
  );
}
