import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workflowsApi, type Workflow } from '../lib/api';

export function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', status: 'all' });

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      const params: { type?: string; status?: string } = {};
      if (filter.type !== 'all') params.type = filter.type;
      if (filter.status !== 'all') params.status = filter.status;
      
      const response = await workflowsApi.list(params);
      if (response.success && response.data) {
        setWorkflows(response.data.workflows);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [filter]);

  // Refresh on window focus
  useEffect(() => {
    const handleFocus = () => fetchWorkflows();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [filter]);

  const getStatusIcon = (status: Workflow['status']) => {
    switch (status) {
      case 'completed':
        return <span className="material-symbols-outlined text-green-500">check_circle</span>;
      case 'running':
        return <span className="material-symbols-outlined text-orange-500 animate-spin">refresh</span>;
      case 'failed':
        return <span className="material-symbols-outlined text-red-500">error</span>;
      default:
        return <span className="material-symbols-outlined text-gray-400">schedule</span>;
    }
  };

  const getStatusBadge = (status: Workflow['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      running: 'bg-orange-100 text-orange-700',
      failed: 'bg-red-100 text-red-700',
      pending: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const formatDuration = (startedAt: string | null, completedAt: string | null): string => {
    if (!startedAt) return 'Pending';
    if (!completedAt) return 'Running...';
    
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const duration = end - start;
    
    if (duration < 1000) return '< 1s';
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    if (duration < 3600000) return `${Math.round(duration / 60000)}m ${Math.round((duration % 60000) / 1000)}s`;
    return `${Math.round(duration / 3600000)}h ${Math.round((duration % 3600000) / 60000)}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="mt-1 text-gray-600">Manage and monitor your emissions workflows</p>
        </div>
        <Link 
          to="/audit" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Workflow
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">All Workflows</h2>
          <div className="flex gap-2">
            <select 
              value={filter.type}
              onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              <option value="all">All Types</option>
              <option value="estimate">Estimate</option>
              <option value="audit">Audit</option>
              <option value="optimize">Optimize</option>
            </select>
            <select 
              value={filter.status}
              onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="px-6 py-8 text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading workflows...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-gray-400 text-3xl">work</span>
              </div>
              <h3 className="text-gray-900 font-medium mb-2">No workflows yet</h3>
              <p className="text-gray-500 text-sm mb-6">
                Create your first audit to start tracking emissions
              </p>
              <Link
                to="/audit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Create Workflow
              </Link>
            </div>
          ) : (
            workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(workflow.status)}
                    <div>
                      <Link
                        to={`/workflows/${workflow.id}`}
                        className="font-medium text-gray-900 hover:text-orange-600 transition-colors"
                      >
                        {workflow.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {workflow.type.charAt(0).toUpperCase() + workflow.type.slice(1)} • {workflow.scope}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {workflow.started_at ? new Date(workflow.started_at).toLocaleDateString() : 'Not started'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDuration(workflow.started_at, workflow.completed_at)}
                      </p>
                    </div>
                    {getStatusBadge(workflow.status)}
                    {workflow.error && (
                      <span className="text-red-500 text-sm" title={workflow.error}>
                        <span className="material-symbols-outlined text-[18px]">info</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
