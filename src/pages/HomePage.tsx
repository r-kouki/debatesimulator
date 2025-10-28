import { BarChart3, MessageSquare, Sparkles, Trophy, Target, Zap } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 rounded-full"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center transform rotate-3 shadow-xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 bg-clip-text text-transparent">
            AI-Powered Debate Simulator
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Master the art of argumentation with AI-driven debates and comprehensive media intelligence analysis
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => onNavigate('media')}
              className="group relative px-8 py-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-100 w-full sm:w-auto"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900 text-lg">Media Dashboard</div>
                  <div className="text-sm text-gray-500">Analyze topics & trends</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('debate')}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg">Start Debating</div>
                  <div className="text-sm text-blue-100">Challenge AI opponents</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Topic Analysis</h3>
            <p className="text-gray-600">
              Get instant AI-powered insights on any topic with pros, cons, sentiment analysis, and expert recommendations
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Debates</h3>
            <p className="text-gray-600">
              Engage in live debates with AI personalities, receive instant feedback, and improve your argumentation skills
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Climb the leaderboard, earn ranks, and watch your debate skills improve with detailed analytics and history
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-3">Ready to Master Debate?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Join thousands of users improving their critical thinking and argumentation skills
          </p>
          <button
            onClick={() => onNavigate('debate')}
            className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Start Your First Debate
          </button>
        </div>
      </div>
    </div>
  );
}
