import { Home, BarChart3, MessageSquare, Trophy, User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { profile, signOut } = useAuth();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'media', icon: BarChart3, label: 'Media Dashboard' },
    { id: 'debate', icon: MessageSquare, label: 'Debate Simulator' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              DebateAI
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            {profile && (
              <div className="flex items-center space-x-3">
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {profile.username}
                </span>
              </div>
            )}
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden flex items-center justify-around border-t border-gray-200 py-2">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all ${
                currentPage === item.id ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
