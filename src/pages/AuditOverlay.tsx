import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowsApi } from '../lib/api';

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

const steps: WizardStep[] = [
  { id: 1, title: 'Scope', description: 'Choose audit type' },
  { id: 2, title: 'Data', description: 'Upload or connect' },
  { id: 3, title: 'Run', description: 'Schedule or execute' },
];

const scopeLabels: Record<string, string> = {
  infrastructure: 'Cloud Infrastructure',
  office: 'Office Operations',
  supply: 'Supply Chain',
  comprehensive: 'Comprehensive Audit',
};

export function AuditOverlay() {
  const navigate = useNavigate();
  
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [scope, setScope] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/command');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Create workflow via API
      const response = await workflowsApi.create({
        name: scopeLabels[scope] || 'Emissions Audit',
        type: 'audit',
        scope: scope,
        config: {
          dataSource: dataSource,
          frequency: frequency,
        },
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create workflow');
      }

      // If it's "Run Now", start the workflow
      if (frequency === 'once' && response.data?.workflow) {
        await workflowsApi.updateStatus(response.data.workflow.id, 'running');
      }

      setShowSuccess(true);
      
      // Navigate after showing success
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create audit');
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return scope !== '';
    if (currentStep === 2) return dataSource !== '';
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fluid Background */}
      <div className="absolute inset-0 bg-[#f6f6f8]/85 backdrop-blur-[4px]">
        <div className="absolute top-[5%] left-[20%] w-[600px] h-[600px] bg-[#585bf3]/8 rounded-full blur-[120px] pointer-events-none animate-float" />
        <div className="absolute bottom-[5%] right-[15%] w-[500px] h-[500px] bg-orange-300/8 rounded-full blur-[100px] pointer-events-none animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-green-400">check_circle</span>
            <span className="font-medium">
              {frequency === 'once' ? 'Audit started successfully!' : 'Audit scheduled!'}
            </span>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Overlay Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div 
          className={`w-full max-w-[600px] transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          {/* Glass Panel */}
          <div className="bg-white/95 backdrop-blur-[24px] rounded-3xl border border-white/70 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.2)] overflow-hidden">
            
            {/* Header with Context */}
            <div className="px-8 pt-8 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Emissions Audit</h1>
                  <p className="text-gray-500 text-sm mt-1">Comprehensive carbon footprint analysis</p>
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Stepper */}
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          currentStep >= step.id 
                            ? 'bg-[#585bf3] text-white shadow-md shadow-[#585bf3]/25' 
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        ) : (
                          step.id
                        )}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-[#585bf3]' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Step 1: Scope */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Choose Audit Scope</h2>
                    <p className="text-gray-500 text-sm">What would you like to analyze?</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'infrastructure', icon: 'cloud', title: 'Cloud Infrastructure', desc: 'AWS, Azure, GCP resources', detail: 'Analyzes compute, storage, and network emissions' },
                      { id: 'office', icon: 'business', title: 'Office Operations', desc: 'Energy, travel, supplies', detail: 'Electricity, commuting, and office equipment' },
                      { id: 'supply', icon: 'local_shipping', title: 'Supply Chain', desc: 'Logistics and vendors', detail: 'Transportation, manufacturing, and procurement' },
                      { id: 'comprehensive', icon: 'all_inclusive', title: 'Comprehensive', desc: 'All sources combined', detail: 'Full organizational carbon footprint' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setScope(option.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          scope === option.id 
                            ? 'border-[#585bf3] bg-[#585bf3]/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${scope === option.id ? 'bg-[#585bf3] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <span className="material-symbols-outlined">{option.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{option.title}</h3>
                            <p className="text-sm text-gray-500">{option.desc}</p>
                            <p className="text-xs text-gray-400 mt-1">{option.detail}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Data Source */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Data Source</h2>
                    <p className="text-gray-500 text-sm">How would you like to provide data?</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'upload', icon: 'upload_file', title: 'Upload CSV/Excel', desc: 'Import existing data files' },
                      { id: 'api', icon: 'link', title: 'Connect API', desc: 'Link cloud provider accounts' },
                      { id: 'manual', icon: 'edit', title: 'Manual Entry', desc: 'Input data through forms' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setDataSource(option.id)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                          dataSource === option.id 
                            ? 'border-[#585bf3] bg-[#585bf3]/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-2xl ${dataSource === option.id ? 'text-[#585bf3]' : 'text-gray-400'}`}>
                          {option.icon}
                        </span>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">{option.title}</h3>
                          <p className="text-sm text-gray-500">{option.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {dataSource === 'upload' && (
                    <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 text-center">
                      <span className="material-symbols-outlined text-3xl text-gray-400 mb-2">cloud_upload</span>
                      <p className="text-gray-600 font-medium">Drop files here or click to browse</p>
                      <p className="text-sm text-gray-400 mt-1">Supports CSV, XLSX, JSON</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Run */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Execution</h2>
                    <p className="text-gray-500 text-sm">When should this audit run?</p>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'once', icon: 'play_circle', title: 'Run Now', desc: 'Execute immediately', badge: 'Fastest' },
                      { id: 'daily', icon: 'schedule', title: 'Daily Schedule', desc: 'Every day at 9:00 AM', badge: 'Recommended' },
                      { id: 'weekly', icon: 'calendar_month', title: 'Weekly Report', desc: 'Every Monday morning', badge: null },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setFrequency(option.id)}
                        className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                          frequency === option.id 
                            ? 'border-[#585bf3] bg-[#585bf3]/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-2xl ${frequency === option.id ? 'text-[#585bf3]' : 'text-gray-400'}`}>
                          {option.icon}
                        </span>
                        <div className="text-left flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{option.title}</h3>
                            {option.badge && (
                              <span className="text-[10px] px-2 py-0.5 bg-[#585bf3]/10 text-[#585bf3] rounded-full font-medium">
                                {option.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{option.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Audit Summary</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Scope:</span>
                        <span className="text-gray-900 font-medium">{scopeLabels[scope] || scope}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Data Source:</span>
                        <span className="text-gray-900 font-medium capitalize">{dataSource}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Frequency:</span>
                        <span className="text-gray-900 font-medium capitalize">{frequency === 'once' ? 'Run Now' : frequency}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-6 py-2.5 text-gray-600 font-medium hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="px-8 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Audit...
                  </>
                ) : currentStep === 3 ? (
                  <>
                    Start Audit
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                ) : (
                  <>
                    Continue
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
