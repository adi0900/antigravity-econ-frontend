import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi, type Report } from '../lib/api';

export function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [emailingReport, setEmailingReport] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params: { type?: string } = {};
      if (filter !== 'all') params.type = filter;
      
      const response = await reportsApi.list(params);
      if (response.success && response.data) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => fetchReports();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [filter]);

  const handleEmailReport = async (e: React.MouseEvent, reportId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setEmailingReport(reportId);
    try {
      const response = await reportsApi.emailReport(reportId);
      if (response.success) {
        alert('Report sent to your email!');
      } else {
        alert(response.error || 'Failed to send email');
      }
    } catch (error) {
      alert('Failed to send email');
    } finally {
      setEmailingReport(null);
    }
  };

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'audit':
        return 'bg-blue-100 text-blue-700';
      case 'estimate':
        return 'bg-green-100 text-green-700';
      case 'optimization':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatEmissions = (value: number): string => {
    const num = Number(value);
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)} t`;
    }
    return `${num.toFixed(2)} kg`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-gray-600">View and manage your emissions reports</p>
        </div>
        <Link 
          to="/audit" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Report
        </Link>
      </div>

      <div className="flex gap-2">
        {['all', 'audit', 'estimate', 'optimization'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === type
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="w-16 h-5 bg-gray-200 rounded-full" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="border-t border-gray-100 pt-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-gray-400 text-3xl">description</span>
          </div>
          <h3 className="text-gray-900 font-medium mb-2">No reports yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Run an audit or use the chat to create your first emissions report
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">assessment</span>
              Run Audit
            </Link>
            <Link
              to="/command"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              Ask AI
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <span className="material-symbols-outlined text-gray-600">description</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                  {report.type}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{report.title}</h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatEmissions(report.total_emissions)} <span className="text-sm font-normal text-gray-500">CO2e</span>
                </p>
                <p className="text-xs text-gray-500">Total Emissions</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={(e) => handleEmailReport(e, report.id)}
                  disabled={emailingReport === report.id}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {emailingReport === report.id ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">email</span>
                  )}
                  Email
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">share</span>
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
