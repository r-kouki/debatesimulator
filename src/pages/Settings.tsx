import { useState } from 'react';
import { Volume2, Mic, Palette, Bell, Shield } from 'lucide-react';

export default function Settings() {
  const [ttsLanguage, setTtsLanguage] = useState('en-US');
  const [sttLanguage, setSttLanguage] = useState('en-US');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'zh-CN', name: 'Chinese' }
  ];

  const themes = [
    { id: 'light', name: 'Light', description: 'Clean and bright' },
    { id: 'dark', name: 'Dark', description: 'Easy on the eyes' },
    { id: 'auto', name: 'Auto', description: 'Match system' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Text-to-Speech</h2>
                <p className="text-sm text-gray-500">Configure voice output settings</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TTS Language
                </label>
                <select
                  value={ttsLanguage}
                  onChange={(e) => setTtsLanguage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Enable TTS by default</div>
                  <div className="text-sm text-gray-500">Automatically read AI responses</div>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    autoSave ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      autoSave ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Speech-to-Text</h2>
                <p className="text-sm text-gray-500">Configure voice input settings</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                STT Language
              </label>
              <select
                value={sttLanguage}
                onChange={(e) => setSttLanguage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-gray-900"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
                <p className="text-sm text-gray-500">Customize the interface theme</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {themes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    theme === themeOption.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-gray-900 mb-1">{themeOption.name}</div>
                  <div className="text-sm text-gray-500">{themeOption.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-500">Manage notification preferences</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Push Notifications</div>
                  <div className="text-sm text-gray-500">Receive debate invitations and updates</div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifications ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      notifications ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">Email Digest</div>
                  <div className="text-sm text-gray-500">Weekly summary of your debates</div>
                </div>
                <button
                  className="relative w-14 h-8 rounded-full bg-blue-600"
                >
                  <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transform translate-x-6"></div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Privacy & Security</h2>
                <p className="text-sm text-gray-500">Manage your data and security</p>
              </div>
            </div>

            <div className="space-y-3">
              <button className="w-full px-4 py-3 text-left border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                <div className="font-medium text-gray-900">Change Password</div>
                <div className="text-sm text-gray-500">Update your account password</div>
              </button>

              <button className="w-full px-4 py-3 text-left border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                <div className="font-medium text-gray-900">Download My Data</div>
                <div className="text-sm text-gray-500">Export all your debate history</div>
              </button>

              <button className="w-full px-4 py-3 text-left border-2 border-red-200 rounded-xl hover:border-red-300 transition-colors">
                <div className="font-medium text-red-600">Delete Account</div>
                <div className="text-sm text-red-400">Permanently remove your account</div>
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
              Reset to Defaults
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
