import { useState, useEffect } from 'react';
import { Trophy, Target, Award, Clock, TrendingUp, Calendar } from 'lucide-react';
import { debateService, type Debate } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { profile } = useAuth();
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    (async () => {
      setLoading(true);
      const data = await debateService.listByUser(profile.id);
      setDebates(data.slice(0, 10));
      setLoading(false);
    })();
  }, [profile]);

  const winRate = profile && profile.total_debates > 0
    ? Math.round((profile.wins / profile.total_debates) * 100)
    : 0;

  const avgScore = profile && profile.total_debates > 0
    ? Math.round(profile.total_score / profile.total_debates)
    : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins}m ${seconds % 60}s`;
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative">
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-32 h-32 rounded-full border-4 border-blue-600"
              />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.username}</h1>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-full mb-4">
                {profile.rank}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{profile.total_score}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Score</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{profile.wins}</div>
                  <div className="text-sm text-gray-600 mt-1">Wins</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{profile.total_debates}</div>
                  <div className="text-sm text-gray-600 mt-1">Debates</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{winRate}%</div>
                  <div className="text-sm text-gray-600 mt-1">Win Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Average Score</h3>
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{avgScore}</div>
            <p className="text-gray-500 text-sm">Points per debate</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Performance</h3>
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {winRate >= 60 ? 'Excellent' : winRate >= 40 ? 'Good' : 'Improving'}
            </div>
            <p className="text-gray-500 text-sm">Current status</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
            </div>
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {profile.total_debates >= 10 ? '3' : profile.total_debates >= 5 ? '2' : '1'}
            </div>
            <p className="text-gray-500 text-sm">Badges earned</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Recent Debates</h2>
          </div>

          {debates.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {debates.map((debate) => {
                const isWin = debate.user_score > debate.ai_score;
                return (
                  <div key={debate.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{debate.topic}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(debate.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(debate.duration_seconds)}</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {debate.persona}
                          </span>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full font-bold ${
                        isWin ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isWin ? 'Won' : 'Lost'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Your Score:</span>
                        <span className="text-xl font-bold text-blue-600">{debate.user_score}</span>
                      </div>
                      <div className="text-gray-400">vs</div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">AI Score:</span>
                        <span className="text-xl font-bold text-gray-600">{debate.ai_score}</span>
                      </div>
                    </div>

                    {debate.feedback && (
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        {debate.feedback}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No debates yet. Start your first debate!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
