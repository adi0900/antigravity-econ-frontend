import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { reportsApi, type Report } from '../lib/api';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  savings: string;
  completed: boolean;
}

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOptimization, setShowOptimization] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const response = await reportsApi.get(id);
        if (response.success && response.data) {
          setReport(response.data.report);
          
          // Extract recommendations from report data if available
          const reportData = response.data.report.data as Record<string, unknown>;
          if (reportData.recommendations) {
            const recs = (reportData.recommendations as string[]).map((rec, idx) => ({
              id: idx.toString(),
              title: rec.split('.')[0] || rec,
              description: rec,
              impact: ['high', 'medium', 'low'][idx % 3] as 'high' | 'medium' | 'low',
              effort: ['low', 'medium', 'high'][idx % 3] as 'high' | 'medium' | 'low',
              savings: `~${Math.floor(Math.random() * 50 + 10)} kgCO2e/month`,
              completed: false,
            }));
            setRecommendations(recs);
          }
        } else {
          navigate('/reports');
        }
      } catch (error) {
        console.error('Failed to fetch report:', error);
        navigate('/reports');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate]);

  const handleEmailReport = async () => {
    if (!id) return;
    
    setIsEmailing(true);
    try {
      const response = await reportsApi.emailReport(id);
      if (response.success) {
        alert('Report sent to your email!');
      } else {
        alert(response.error || 'Failed to send email');
      }
    } catch (error) {
      alert('Failed to send email');
    } finally {
      setIsEmailing(false);
    }
  };

  const toggleComplete = (recId: string) => {
    setRecommendations(recommendations.map(rec => 
      rec.id === recId ? { ...rec, completed: !rec.completed } : rec
    ));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'low': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatEmissions = (value: number): string => {
    const num = Number(value);
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}`;
    }
    return num.toFixed(2);
  };

  const getUnit = (value: number): string => {
    return Number(value) >= 1000 ? 'tCO2e' : 'kgCO2e';
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-12 bg-gray-200 rounded w-1/2" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="w-full max-w-6xl mx-auto px-6 py-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Report not found</h1>
        <Link to="/reports" className="text-orange-600 hover:text-orange-700">
          Back to Reports
        </Link>
      </div>
    );
  }

  const reportData = report.data as Record<string, unknown>;
  const categoryBreakdown = (reportData.categoryBreakdown as Array<{ category: string; emissions: number; percentage: number }>) || [];
  const topSources = (reportData.topSources as Array<{ name: string; emissions: number }>) || [];

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link to="/reports" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Reports
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
              <span className="material-symbols-outlined">share</span>
            </button>
            <button 
              onClick={handleEmailReport}
              disabled={isEmailing}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50" 
              title="Email"
            >
              {isEmailing ? (
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined">mail</span>
              )}
            </button>
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">{report.title}</h1>
        <p className="text-gray-500">
          Generated on {new Date(report.created_at).toLocaleDateString()} • Type: {report.type}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Emissions</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-gray-900">
              {formatEmissions(report.total_emissions)}
            </span>
            <span className="text-sm text-gray-400">{getUnit(report.total_emissions)}</span>
          </div>
        </div>
        {categoryBreakdown.slice(0, 3).map((cat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-5 border border-gray-200">
            <p className="text-sm text-gray-500 mb-1 capitalize">{cat.category}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-900">
                {cat.emissions.toFixed(1)}
              </span>
              <span className="text-sm text-gray-400">kgCO2e</span>
            </div>
            <span className="text-xs text-gray-400">{cat.percentage.toFixed(1)}% of total</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Sources */}
          {topSources.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Emission Sources</h2>
              <div className="space-y-3">
                {topSources.map((source, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-900">{source.name}</span>
                    </div>
                    <span className="text-gray-600">{source.emissions.toFixed(2)} kgCO2e</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Emissions by Category</h2>
              <div className="space-y-4">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{cat.category}</span>
                      <span className="text-sm text-gray-500">{cat.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{cat.emissions.toFixed(2)} kgCO2e</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Optimization Plan CTA */}
          {!showOptimization && recommendations.length === 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
              <h3 className="font-semibold text-gray-900 mb-2">Get Optimization Plan</h3>
              <p className="text-sm text-gray-600 mb-4">AI-generated recommendations to reduce your emissions</p>
              <button 
                onClick={() => setShowOptimization(true)}
                className="w-full py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Generate Plan
              </button>
            </div>
          )}

          {/* Recommendations */}
          {(showOptimization || recommendations.length > 0) && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Action Plan</h3>
                {recommendations.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {recommendations.filter(r => r.completed).length}/{recommendations.length} done
                  </span>
                )}
              </div>
              
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className={`p-4 rounded-lg border transition-all ${rec.completed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={rec.completed}
                          onChange={() => toggleComplete(rec.id)}
                          className="mt-1 w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <h4 className={`font-medium text-sm ${rec.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {rec.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">{rec.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getImpactColor(rec.impact)}`}>
                              Impact: {rec.impact}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getEffortColor(rec.effort)}`}>
                              Effort: {rec.effort}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 font-medium mt-2">{rec.savings}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recommendations available for this report yet.
                </p>
              )}

              <button 
                onClick={handleEmailReport}
                disabled={isEmailing}
                className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isEmailing ? 'Sending...' : 'Email me this plan'}
              </button>
            </div>
          )}

          {/* Source Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Data Source</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="material-symbols-outlined text-emerald-500 text-[16px]">verified</span>
              Climatiq API
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
