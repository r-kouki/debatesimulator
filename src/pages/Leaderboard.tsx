import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { profileService, type Profile } from '../lib/supabase';

export default function Leaderboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const data = await profileService.listProfiles();
    setProfiles(data.slice(0, 50));
    setLoading(false);
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-500 font-bold">#{index + 1}</span>;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-400 to-yellow-600';
    if (index === 1) return 'from-gray-300 to-gray-500';
    if (index === 2) return 'from-orange-400 to-orange-600';
    return 'from-blue-500 to-blue-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Top debaters ranked by total score</p>
        </div>

        {profiles.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {profiles.slice(0, 3).map((profile, index) => (
              <div
                key={profile.id}
                className={`bg-white rounded-2xl shadow-xl p-6 text-center transform transition-all hover:scale-105 ${
                  index === 0 ? 'md:order-2 md:-mt-8' : index === 1 ? 'md:order-1' : 'md:order-3'
                }`}
              >
                <div className="flex justify-center mb-4">
                  {getMedalIcon(index)}
                </div>
                <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${getRankColor(index)} p-1`}>
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full rounded-full border-4 border-white"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{profile.username}</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">{profile.total_score}</div>
                <div className="text-sm text-gray-500 mb-4">Total Score</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="font-bold text-gray-900">{profile.total_debates}</div>
                    <div className="text-gray-500">Debates</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="font-bold text-green-600">{profile.wins}</div>
                    <div className="text-gray-500">Wins</div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {profile.rank}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debates
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wins
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Win Rate
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profiles.map((profile, index) => {
                  const winRate = profile.total_debates > 0
                    ? Math.round((profile.wins / profile.total_debates) * 100)
                    : 0;

                  return (
                    <tr
                      key={profile.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index < 3 ? (
                            getMedalIcon(index)
                          ) : (
                            <span className="text-gray-600 font-medium">#{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <img
                            src={profile.avatar_url}
                            alt={profile.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <span className="font-medium text-gray-900">{profile.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-blue-600">{profile.total_score}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                        {profile.total_debates}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-green-600 font-medium">{profile.wins}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="font-medium text-gray-900">{winRate}%</span>
                          {winRate >= 60 && <TrendingUp className="w-4 h-4 text-green-500" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          {profile.rank}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No rankings yet. Be the first to debate!</p>
          </div>
        )}
      </div>
    </div>
  );
}
