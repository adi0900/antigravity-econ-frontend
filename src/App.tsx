import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { CommandCenter } from './pages/CommandCenter';
import { Chat } from './pages/Chat';
import { AuditOverlay } from './pages/AuditOverlay';
import { ChatResult } from './pages/ChatResult';
import { SaveReport } from './pages/SaveReport';
import { ReportDetail } from './pages/ReportDetail';
import { Workflows } from './pages/Workflows';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Welcome } from './pages/Welcome';
import { isAuthenticated } from './lib/api';

// Synchronous check - runs before any render
function isUserOnboarded(): boolean {
  return isAuthenticated() && !!localStorage.getItem('antigravity_user');
}

// Protected Route wrapper - redirects to /welcome if not onboarded
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isUserOnboarded()) {
    return <Navigate to="/welcome" replace />;
  }
  return <>{children}</>;
}

// Auth Route wrapper - redirects to / if already onboarded
function AuthRoute({ children }: { children: React.ReactNode }) {
  if (isUserOnboarded()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

// Dashboard with overlay support
function DashboardWithOverlay({ overlay }: { overlay?: React.ReactNode }) {
  if (overlay) {
    return (
      <>
        <div className="blur-[2px] opacity-40 pointer-events-none">
          <Layout>
            <Dashboard />
          </Layout>
        </div>
        {overlay}
      </>
    );
  }
  
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        {/* Welcome/Onboarding - only accessible if NOT logged in */}
        <Route path="/welcome" element={
          <AuthRoute>
            <Welcome />
          </AuthRoute>
        } />
        
        {/* Main Dashboard - protected */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardWithOverlay />
          </ProtectedRoute>
        } />
        
        {/* Overlays - protected, render over dashboard */}
        <Route path="/command" element={
          <ProtectedRoute>
            <DashboardWithOverlay overlay={<CommandCenter />} />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <DashboardWithOverlay overlay={<Chat />} />
          </ProtectedRoute>
        } />
        <Route path="/audit" element={
          <ProtectedRoute>
            <DashboardWithOverlay overlay={<AuditOverlay />} />
          </ProtectedRoute>
        } />
        <Route path="/result" element={
          <ProtectedRoute>
            <DashboardWithOverlay overlay={<ChatResult />} />
          </ProtectedRoute>
        } />
        <Route path="/save" element={
          <ProtectedRoute>
            <DashboardWithOverlay overlay={<SaveReport />} />
          </ProtectedRoute>
        } />
        
        {/* Other pages - protected */}
        <Route path="/workflows" element={
          <ProtectedRoute>
            <Layout><Workflows /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports/:id" element={
          <ProtectedRoute>
            <Layout><ReportDetail /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;