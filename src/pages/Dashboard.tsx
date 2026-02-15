import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi, getStoredUser, type Report } from '../lib/api';

interface MiniReport {
  id: string;
  title: string;
  subtitle: string;
  value: number;
  unit: string;
  change: number;
  trend: 'up' | 'down';
}

export function Dashboard() {
  const [userName, setUserName] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [reports, setReports] = useState<MiniReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmissions: 0,
    activeReports: 0,
    pendingAudits: 0,
    weeklyChange: 0,
  });

  // Load user data
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setUserName(user.name);
    }
  }, []);

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      const statsResponse = await reportsApi.getStats();
      if (statsResponse.success && statsResponse.data) {
        setStats({
          totalEmissions: statsResponse.data.totalEmissions,
          activeReports: statsResponse.data.reportCount,
          pendingAudits: statsResponse.data.pendingWorkflows,
          weeklyChange: statsResponse.data.weeklyChange.percentChange,
        });
      }

      // Fetch recent reports
      const reportsResponse = await reportsApi.list({ limit: 6 });
      if (reportsResponse.success && reportsResponse.data) {
        const miniReports: MiniReport[] = reportsResponse.data.reports.map((r: Report) => ({
          id: r.id,
          title: r.title,
          subtitle: r.type.charAt(0).toUpperCase() + r.type.slice(1),
          value: Number(r.total_emissions),
          unit: r.unit,
          change: 0, // Would need historical data to calculate
          trend: 'down' as const,
        }));
        setReports(miniReports);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatEmissions = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col px-8 lg:px-16 overflow-hidden bg-[#fafafa]">
      {/* Premium Hero Section */}
      <section className="flex-1 flex flex-col min-h-0">
        {/* Greeting - Editorial Typography */}
        <div className="pt-10 pb-8 animate-fade-in-up">
          <div className="flex items-baseline gap-4 mb-2">
            <h1 className="text-gray-900 text-5xl font-medium tracking-tight">
              {getGreeting()}{userName ? ',' : ''}
            </h1>
            {userName && (
              <span className="text-orange-500 text-5xl font-medium tracking-tight">{userName}</span>
            )}
          </div>
          <p className="text-gray-400 text-lg font-light tracking-wide">
            Your sustainability metrics are ready for review
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between py-6 border-y border-gray-200/50 mb-8">
          <div className="flex items-center gap-8">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium text-gray-900">
                {isLoading ? '...' : formatEmissions(stats.totalEmissions)}
              </span>
              <span className="text-sm text-gray-400 font-light">kgCO2e</span>
              {stats.weeklyChange !== 0 && (
                <span className={`text-xs ml-2 font-medium ${stats.weeklyChange < 0 ? 'text-green-500' : 'text-orange-500'}`}>
                  {stats.weeklyChange < 0 ? '↓' : '↑'} {Math.abs(stats.weeklyChange).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium text-gray-900">
                {isLoading ? '...' : stats.activeReports}
              </span>
              <span className="text-sm text-gray-400 font-light">Active Reports</span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium text-gray-900">
                {isLoading ? '...' : stats.pendingAudits}
              </span>
              <span className="text-sm text-gray-400 font-light">Pending Audits</span>
            </div>
          </div>
          <Link 
            to="/audit" 
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Run Audit
          </Link>
        </div>

        {/* Reports Grid - Premium Cards */}
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-gray-900 text-sm font-medium tracking-wide uppercase">
                Recent Calculations
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">
                {isLoading ? 'Loading...' : reports.length > 0 ? 'Latest emission reports' : 'No reports yet'}
              </p>
            </div>
            <Link
              to="/reports"
              className="text-sm text-gray-500 hover:text-orange-500 transition-colors flex items-center gap-1 group"
            >
              View Archive
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Premium 3x2 Grid */}
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-8" />
                  <div className="h-10 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {reports.map((report, index) => (
                <Link
                  key={report.id}
                  to={`/reports/${report.id}`}
                  className="premium-card group relative bg-white rounded-2xl p-6 cursor-pointer overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onMouseEnter={() => setHoveredCard(report.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Hover Gradient */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 transition-opacity duration-300 ${hoveredCard === report.id ? 'opacity-100' : ''}`}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h4 className="text-gray-900 text-sm font-medium mb-0.5">{report.title}</h4>
                        <p className="text-gray-400 text-xs">{report.subtitle}</p>
                      </div>
                      {report.change !== 0 && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${report.trend === 'down' ? 'text-green-500' : 'text-orange-500'}`}>
                          <span>{report.trend === 'down' ? '↓' : '↑'}</span>
                          <span>{Math.abs(report.change)}%</span>
                        </div>
                      )}
                    </div>

                    {/* Value */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-medium text-gray-900 tracking-tight">
                        {report.value.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 font-light">{report.unit}</span>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
                      <div 
                        className={`h-full bg-orange-500 transition-all duration-500 ease-out ${hoveredCard === report.id ? 'w-full' : 'w-0'}`}
                      />
                    </div>
                  </div>

                  {/* Corner Icon */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="material-symbols-outlined text-gray-300 text-lg">
                      arrow_outward
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-gray-400 text-3xl">eco</span>
              </div>
              <h3 className="text-gray-900 font-medium mb-2">No reports yet</h3>
              <p className="text-gray-500 text-sm mb-6">
                Run your first audit or ask AI to estimate emissions
              </p>
              <div className="flex gap-3">
                <Link
                  to="/audit"
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Run Audit
                </Link>
                <Link
                  to="/command"
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Ask AI
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Premium Floating Action Button - Opens Command Center */}
      <div className="fixed bottom-10 right-10 z-50">
        <Link
          to="/command"
          className="premium-fab group relative flex items-center gap-3 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-2xl shadow-gray-900/20 transition-all duration-300"
        >
          {/* Icon */}
          <div className="relative flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">
              auto_awesome
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          </div>
          
          {/* Text */}
          <span className="text-sm font-medium">Ask AI</span>
          
          {/* Hover Arrow */}
          <span className="material-symbols-outlined text-[18px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
            arrow_forward
          </span>
        </Link>
      </div>

      {/* Subtle Background Pattern */}
      <div 
        className="fixed inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}
