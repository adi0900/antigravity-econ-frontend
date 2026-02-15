import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

const steps: WizardStep[] = [
  { id: 1, title: 'Scope', description: 'Choose audit type' },
  { id: 2, title: 'Data Source', description: 'Upload or connect data' },
  { id: 3, title: 'Frequency', description: 'Schedule or run now' },
];

export function WorkflowWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [scope, setScope] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [frequency, setFrequency] = useState('once');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/workflows');
    }, 2000);
  };

  const canProceed = () => {
    if (currentStep === 1) return scope !== '';
    if (currentStep === 2) return dataSource !== '';
    return true;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/workflows" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Workflows
        </Link>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Run Emissions Audit</h1>
        <p className="text-gray-500">Complete the wizard to analyze your carbon footprint</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  currentStep >= step.id 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {currentStep > step.id ? (
                  <span className="material-symbols-outlined text-[20px]">check</span>
                ) : (
                  step.id
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-orange-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        {/* Step 1: Scope */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Choose Audit Scope</h2>
            <p className="text-gray-500">Select the type of data you want to analyze</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'app-logs', icon: 'code', title: 'App Usage Logs', desc: 'Server & application logs' },
                { id: 'energy-csv', icon: 'table', title: 'Energy CSV', desc: 'Upload consumption data' },
                { id: 'manual', icon: 'edit', title: 'Manual Input', desc: 'Enter data manually' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setScope(option.id)}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    scope === option.id 
                      ? 'border-orange-500 bg-orange-50/50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`material-symbols-outlined text-3xl mb-3 ${scope === option.id ? 'text-orange-500' : 'text-gray-400'}`}>
                    {option.icon}
                  </span>
                  <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                  <p className="text-sm text-gray-500">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Data Source */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Configure Data Source</h2>
            <p className="text-gray-500">How would you like to provide the data?</p>
            
            <div className="space-y-4">
              {[
                { id: 'upload', icon: 'upload_file', title: 'Upload CSV File', desc: 'Drag & drop or select file' },
                { id: 'api', icon: 'link', title: 'Connect API', desc: 'Link to external data source' },
                { id: 'manual-entry', icon: 'keyboard', title: 'Manual Entry', desc: 'Type in values directly' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setDataSource(option.id)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    dataSource === option.id 
                      ? 'border-orange-500 bg-orange-50/50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${dataSource === option.id ? 'text-orange-500' : 'text-gray-400'}`}>
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
              <div className="mt-6 p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">cloud_upload</span>
                <p className="text-gray-600 font-medium">Drop your CSV file here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Frequency */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Set Frequency</h2>
            <p className="text-gray-500">How often should this audit run?</p>
            
            <div className="space-y-4">
              {[
                { id: 'once', icon: 'play_circle', title: 'Run Once Now', desc: 'Execute immediately and generate report' },
                { id: 'daily', icon: 'schedule', title: 'Schedule Daily', desc: 'Run every day at 9:00 AM' },
                { id: 'weekly', icon: 'calendar_month', title: 'Schedule Weekly', desc: 'Run every Monday at 9:00 AM' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFrequency(option.id)}
                  className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    frequency === option.id 
                      ? 'border-orange-500 bg-orange-50/50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${frequency === option.id ? 'text-orange-500' : 'text-gray-400'}`}>
                    {option.icon}
                  </span>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{option.title}</h3>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6 py-2.5 text-gray-600 font-medium hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className="px-8 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin">refresh</span>
              Processing...
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
  );
}