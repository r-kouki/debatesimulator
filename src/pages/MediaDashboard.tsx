import { useState } from 'react';
import { Mic, Search, TrendingUp, TrendingDown, Users, BarChart3, Loader2 } from 'lucide-react';
import { mediaService, type MediaAnalysis } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function MediaDashboard() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MediaAnalysis | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setTopic('Climate Change Policy');
    }, 2000);
  };

  const handleAnalyze = async () => {
    if (!topic.trim() || !user) return;

    setLoading(true);

    setTimeout(async () => {
      const mockAnalysis = {
        topic,
        summary: `${topic} is a multifaceted issue involving complex social, economic, and ethical considerations. Current discourse suggests diverse perspectives ranging from progressive reform to conservative maintenance of existing frameworks.`,
        pros: [
          'Promotes innovation and technological advancement',
          'Addresses long-term sustainability concerns',
          'Creates new economic opportunities and jobs',
          'Improves public awareness and education'
        ],
        cons: [
          'May require significant financial investment',
          'Could face political and social resistance',
          'Implementation challenges and timeline concerns',
          'Potential unintended consequences'
        ],
        sentiment_score: 0.45,
        engagement_data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          values: [45, 62, 58, 75]
        },
        guest_personas: [
          { name: 'Policy Expert', expertise: 'Government Relations', stance: 'Moderate' },
          { name: 'Industry Leader', expertise: 'Business Strategy', stance: 'Pragmatic' },
          { name: 'Academic Researcher', expertise: 'Scientific Analysis', stance: 'Evidence-Based' }
        ]
      };

      const savedAnalysis = await mediaService.addAnalysis({
        user_id: user.id,
        topic: mockAnalysis.topic,
        summary: mockAnalysis.summary,
        pros: mockAnalysis.pros,
        cons: mockAnalysis.cons,
        sentiment_score: mockAnalysis.sentiment_score,
        engagement_data: mockAnalysis.engagement_data,
        guest_personas: mockAnalysis.guest_personas
      });

      setAnalysis(savedAnalysis);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Media Intelligence Dashboard</h1>
          <p className="text-gray-600">Analyze any topic with AI-powered insights</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter a topic to analyze..."
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              />
            </div>
            <button
              onClick={handleVoiceInput}
              className={`px-6 py-4 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading || !topic.trim()}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze</span>
              )}
            </button>
          </div>
        </div>

        {analysis && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{analysis.topic}</h2>
              <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Pros</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.pros.map((pro: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span className="text-gray-700">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">Cons</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.cons.map((con: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <span className="text-gray-700">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Sentiment Analysis</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Overall Sentiment</span>
                    <span className={`font-bold ${
                      analysis.sentiment_score > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {analysis.sentiment_score > 0 ? 'Positive' : 'Negative'} ({Math.abs(analysis.sentiment_score * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        analysis.sentiment_score > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.abs(analysis.sentiment_score) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Engagement Trend</h3>
                </div>
                <div className="flex items-end justify-between h-32 space-x-2">
                  {analysis.engagement_data.values.map((value: number, index: number) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600" style={{ height: `${value}%` }}></div>
                      <span className="text-xs text-gray-600 mt-2">{analysis.engagement_data.labels[index]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Guest Personas</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {analysis.guest_personas.map((persona, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                      {persona.name.charAt(0)}
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1">{persona.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{persona.expertise}</p>
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                      {persona.stance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
