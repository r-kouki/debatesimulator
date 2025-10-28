import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, VolumeX, Clock, Award, Send, StopCircle } from 'lucide-react';
import { debateService, profileService } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  score_impact: number;
}

const getRankForScore = (score: number) => {
  if (score >= 500) return 'Grandmaster';
  if (score >= 300) return 'Expert';
  if (score >= 150) return 'Adept';
  if (score >= 75) return 'Apprentice';
  return 'Novice';
};

export default function DebateSimulator() {
  const { user, profile, refreshProfile } = useAuth();
  const [topic, setTopic] = useState('');
  const [debateStarted, setDebateStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [selectedPersona, setSelectedPersona] = useState('Neutral');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [debateId, setDebateId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const personas = ['Neutral', 'Aggressive', 'Diplomatic', 'Skeptical', 'Enthusiastic'];

  useEffect(() => {
    if (debateStarted && !showResults) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [debateStarted, showResults]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startDebate = async () => {
    if (!topic.trim() || !user) return;

    const debate = await debateService.createDebate({
      user_id: user.id,
      topic,
      persona: selectedPersona
    });

    if (debate) {
      setDebateId(debate.id);
      setDebateStarted(true);

      const aiOpening: Message = {
        sender: 'ai',
        content: `I'm ready to debate "${topic}" with you. As a ${selectedPersona.toLowerCase()} opponent, I'll challenge your arguments. Please present your opening statement.`,
        timestamp: new Date(),
        score_impact: 0
      };

      setMessages([aiOpening]);

      if (debate.id) {
        await debateService.addMessage({
          debate_id: debate.id,
          sender: 'ai',
          content: aiOpening.content,
          score_impact: 0
        });
      }
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !debateId) return;

    const userMessage: Message = {
      sender: 'user',
      content: inputMessage,
      timestamp: new Date(),
      score_impact: Math.floor(Math.random() * 15) + 5
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserScore((prev) => prev + userMessage.score_impact);
    setInputMessage('');

    await debateService.addMessage({
      debate_id: debateId,
      sender: 'user',
      content: userMessage.content,
      score_impact: userMessage.score_impact
    });

    setAiTyping(true);
    setTimeout(async () => {
      const aiResponses = [
        "That's an interesting point, but have you considered the counterargument that...",
        "I appreciate your perspective, however, the evidence suggests otherwise...",
        "While I understand your reasoning, there are several flaws in that logic...",
        "That's a compelling argument, but let me challenge you with this...",
        "I see where you're coming from, but the data shows a different picture..."
      ];

      const aiMessage: Message = {
        sender: 'ai',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date(),
        score_impact: Math.floor(Math.random() * 15) + 5
      };

      setMessages((prev) => [...prev, aiMessage]);
      setAiScore((prev) => prev + aiMessage.score_impact);
      setAiTyping(false);

      await debateService.addMessage({
        debate_id: debateId,
        sender: 'ai',
        content: aiMessage.content,
        score_impact: aiMessage.score_impact
      });
    }, 2000);
  };

  const endDebate = async () => {
    if (!debateId || !user) return;

    const winner = userScore > aiScore ? 'user' : 'ai';
    const feedback = winner === 'user'
      ? 'Excellent debate! Your arguments were well-structured and persuasive. Keep developing your critical thinking skills.'
      : 'Good effort! The AI presented stronger counterarguments this time. Review the key points and try again.';

    await debateService.completeDebate(debateId, {
      user_score: userScore,
      ai_score: aiScore,
      duration_seconds: timer,
      status: 'completed',
      feedback,
      completed_at: new Date().toISOString()
    });

    if (profile) {
      const nextTotalDebates = profile.total_debates + 1;
      const nextWins = winner === 'user' ? profile.wins + 1 : profile.wins;
      const nextScore = profile.total_score + userScore;
      await profileService.updateProfile(user.id, {
        total_debates: nextTotalDebates,
        wins: nextWins,
        total_score: nextScore,
        rank: getRankForScore(nextScore)
      });
      await refreshProfile();
    }

    setShowResults(true);
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setInputMessage('I believe this is an important issue that requires careful consideration.');
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const winner = userScore > aiScore ? 'You Won!' : 'AI Won';
    const feedback = userScore > aiScore
      ? 'Excellent debate! Your arguments were well-structured and persuasive.'
      : 'Good effort! The AI presented stronger counterarguments this time.';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              userScore > aiScore ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <Award className={`w-12 h-12 ${userScore > aiScore ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{winner}</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-600">{userScore}</div>
                <div className="text-sm text-gray-600">Your Score</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-3xl font-bold text-gray-600">{aiScore}</div>
                <div className="text-sm text-gray-600">AI Score</div>
              </div>
            </div>
            <p className="text-gray-700 mb-6 text-lg">{feedback}</p>
            <div className="flex items-center justify-center space-x-2 text-gray-500 mb-6">
              <Clock className="w-5 h-5" />
              <span>Duration: {formatTime(timer)}</span>
            </div>
            <button
              onClick={() => {
                setShowResults(false);
                setDebateStarted(false);
                setMessages([]);
                setUserScore(0);
                setAiScore(0);
                setTimer(0);
                setTopic('');
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Start New Debate
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!debateStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Start a New Debate</h1>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Debate Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a debate topic..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Persona</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {personas.map((persona) => (
                  <button
                    key={persona}
                    onClick={() => setSelectedPersona(persona)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      selectedPersona === persona
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {persona}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startDebate}
              disabled={!topic.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              Start Debate
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{topic}</h2>
              <p className="text-sm text-gray-500">Persona: {selectedPersona}</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userScore}</div>
                <div className="text-xs text-gray-500">You</div>
              </div>
              <div className="text-2xl font-bold text-gray-400">VS</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{aiScore}</div>
                <div className="text-xs text-gray-500">AI</div>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono">{formatTime(timer)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex items-start space-x-3 max-w-[70%] ${
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <span className="text-white font-bold">
                      {message.sender === 'user' ? 'U' : 'AI'}
                    </span>
                  </div>
                  <div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {message.content}
                    </div>
                    {message.score_impact > 0 && (
                      <div className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-right text-blue-600' : 'text-gray-500'
                      }`}>
                        +{message.score_impact} points
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {aiTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <span className="text-white font-bold">AI</span>
                  </div>
                  <div className="px-4 py-3 bg-gray-100 rounded-2xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleVoiceInput}
                className={`p-3 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
              </button>
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-3 rounded-xl transition-all ${
                  ttsEnabled
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your argument..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
              <button
                onClick={endDebate}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <StopCircle className="w-5 h-5" />
                <span className="hidden sm:inline">End</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
