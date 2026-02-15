import { useState, useEffect } from 'react';
import {
  BellIcon,
  CircleStackIcon,
  KeyIcon,
  UserIcon,
  CloudIcon,
  ClockIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { getStoredUser, clearAuth, type User } from '../lib/api';

interface ScheduledAudit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
}

export function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [userData, setUserData] = useState<User | null>(null);
  const [scheduledAudits, setScheduledAudits] = useState<ScheduledAudit[]>([]);

  // Load user data
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setUserData(user);
    }
  }, []);

  const handleSignOut = () => {
    // Clear all auth data
    clearAuth();
    
    // Force page reload to trigger re-check of onboarding status
    window.location.href = '/';
  };

  const tabs = [
    { id: 'general', name: 'General', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'automation', name: 'Automation', icon: ClockIcon },
    { id: 'data-sources', name: 'Data Sources', icon: CircleStackIcon },
    { id: 'api-keys', name: 'API Keys', icon: KeyIcon },
    { id: 'integrations', name: 'Integrations', icon: CloudIcon },
  ];

  const toggleAudit = (id: string) => {
    setScheduledAudits(scheduledAudits.map(audit => 
      audit.id === id ? { ...audit, enabled: !audit.enabled } : audit
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Configure your Antigravity workspace</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              <div className="grid gap-6">
                {/* User Profile Section */}
                {userData && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Your Profile</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-medium text-lg">
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{userData.name}</p>
                        <p className="text-sm text-gray-500">{userData.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    defaultValue="My Company"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Region
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent outline-none">
                    <option>United States</option>
                    <option>Europe</option>
                    <option>Asia Pacific</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Dark Mode</p>
                    <p className="text-sm text-gray-500">Enable dark theme</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                  </button>
                </div>

                {/* Sign Out Section */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    This will clear your local data and return to the welcome screen
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
              <div className="space-y-4">
                {['Email me when a workflow completes', 'Weekly summary reports', 'Daily emissions alerts'].map((setting) => (
                  <div key={setting} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">{setting}</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-900 transition-colors">
                      <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Scheduled Audits</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure automated emissions audits</p>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  New Schedule
                </button>
              </div>

              <div className="space-y-3">
                {scheduledAudits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${audit.enabled ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                        <span className="material-symbols-outlined">schedule</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{audit.name}</h3>
                        <p className="text-sm text-gray-500">
                          {audit.frequency.charAt(0).toUpperCase() + audit.frequency.slice(1)} at {audit.time}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleAudit(audit.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        audit.enabled ? 'bg-gray-900' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        audit.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Schedule Form */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Create New Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Audit Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Monthly Review"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent outline-none text-sm">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input 
                      type="time" 
                      defaultValue="09:00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data-sources' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Connected Data Sources</h2>
              <div className="space-y-4">
                {['AWS Cost Explorer', 'Azure Monitor', 'Google Cloud Billing', 'Manual CSV Uploads'].map((source) => (
                  <div key={source} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CircleStackIcon className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{source}</span>
                    </div>
                    <button className="text-sm font-medium text-gray-900 hover:text-gray-700">
                      Configure
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Manage your API keys for external integrations.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Production Key</p>
                      <p className="text-xs text-gray-500">Created Jan 10, 2024</p>
                    </div>
                    <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700">
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                Generate New Key
              </button>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Third-Party Integrations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Slack', 'Microsoft Teams', 'Discord', 'Jira'].map((integration) => (
                  <div key={integration} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">{integration}</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">Not Connected</span>
                    </div>
                    <button className="w-full px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}