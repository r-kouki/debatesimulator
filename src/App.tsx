import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import MediaDashboard from './pages/MediaDashboard';
import DebateSimulator from './pages/DebateSimulator';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AuthPage from './pages/AuthPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'media':
        return <MediaDashboard />;
      case 'debate':
        return <DebateSimulator />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
