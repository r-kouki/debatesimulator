const STORAGE_KEYS = {
  users: 'debateai_users',
  profiles: 'debateai_profiles',
  debates: 'debateai_debates',
  messages: 'debateai_debate_messages',
  analyses: 'debateai_media_analyses',
  session: 'debateai_session'
} as const;

type ValuesOf<T> = T[keyof T];

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  total_debates: number;
  wins: number;
  total_score: number;
  rank: string;
  created_at: string;
  updated_at: string;
}

export interface Debate {
  id: string;
  user_id: string;
  topic: string;
  user_score: number;
  ai_score: number;
  duration_seconds: number;
  persona: string;
  status: string;
  feedback: string;
  created_at: string;
  completed_at?: string;
}

export interface DebateMessage {
  id: string;
  debate_id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  score_impact: number;
}

export interface MediaAnalysis {
  id: string;
  user_id: string;
  topic: string;
  summary: string;
  pros: string[];
  cons: string[];
  sentiment_score: number;
  engagement_data: {
    labels: string[];
    values: number[];
  };
  guest_personas: Array<{ name: string; expertise: string; stance: string }>;
  created_at: string;
}

type JsonRecord = Record<string, unknown> | unknown[];

const loadJson = <T extends JsonRecord | null>(key: ValuesOf<typeof STORAGE_KEYS>, fallback: T) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const saveJson = (key: ValuesOf<typeof STORAGE_KEYS>, value: JsonRecord | null) => {
  if (typeof window === 'undefined') return;
  if (value === null) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};

const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.random().toString(36).slice(2, 11)}`;
};

const hashPassword = (password: string) => {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(password);
  }
  return password;
};

const toAuthUser = (user: StoredUser): AuthUser => ({
  id: user.id,
  email: user.email,
  created_at: user.created_at
});

const defaultAvatar = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

const getUsers = (): StoredUser[] => loadJson<StoredUser[]>(STORAGE_KEYS.users, []) ?? [];
const getProfiles = (): Profile[] => loadJson<Profile[]>(STORAGE_KEYS.profiles, []) ?? [];
const getDebates = (): Debate[] => loadJson<Debate[]>(STORAGE_KEYS.debates, []) ?? [];
const getMessages = (): DebateMessage[] => loadJson<DebateMessage[]>(STORAGE_KEYS.messages, []) ?? [];
const getAnalyses = (): MediaAnalysis[] => loadJson<MediaAnalysis[]>(STORAGE_KEYS.analyses, []) ?? [];

const persist = {
  users: (value: StoredUser[]) => saveJson(STORAGE_KEYS.users, value),
  profiles: (value: Profile[]) => saveJson(STORAGE_KEYS.profiles, value),
  debates: (value: Debate[]) => saveJson(STORAGE_KEYS.debates, value),
  messages: (value: DebateMessage[]) => saveJson(STORAGE_KEYS.messages, value),
  analyses: (value: MediaAnalysis[]) => saveJson(STORAGE_KEYS.analyses, value)
};

const setSession = (userId: string | null) => {
  if (typeof window === 'undefined') return;
  if (userId) {
    window.localStorage.setItem(STORAGE_KEYS.session, userId);
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.session);
  }
};

export const authService = {
  async getSession(): Promise<{ user: AuthUser } | { user: null }> {
    await delay();
    if (typeof window === 'undefined') return { user: null };
    const userId = window.localStorage.getItem(STORAGE_KEYS.session);
    if (!userId) return { user: null };
    const user = getUsers().find((item) => item.id === userId) ?? null;
    return user ? { user: toAuthUser(user) } : { user: null };
  },

  async signIn(email: string, password: string): Promise<{ user: AuthUser }> {
    await delay();
    const users = getUsers();
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== hashPassword(password)) {
      throw new Error('Invalid email or password');
    }
    setSession(user.id);
    return { user: toAuthUser(user) };
  },

  async signUp(email: string, password: string, username: string): Promise<{ user: AuthUser; profile: Profile }> {
    await delay();
    const users = getUsers();
    if (users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already in use');
    }

    const now = new Date().toISOString();
    const user: StoredUser = {
      id: createId(),
      email,
      passwordHash: hashPassword(password),
      created_at: now
    };

    const profile: Profile = {
      id: user.id,
      username,
      avatar_url: defaultAvatar(username || email),
      total_debates: 0,
      wins: 0,
      total_score: 0,
      rank: 'Novice',
      created_at: now,
      updated_at: now
    };

    persist.users([...users, user]);
    persist.profiles([...getProfiles(), profile]);
    setSession(user.id);

    return { user: toAuthUser(user), profile };
  },

  async signOut(): Promise<void> {
    await delay();
    setSession(null);
  }
};

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    await delay();
    return getProfiles().find((profile) => profile.id === userId) ?? null;
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    await delay();
    const profiles = getProfiles();
    const index = profiles.findIndex((profile) => profile.id === userId);
    if (index === -1) {
      throw new Error('Profile not found');
    }
    const next: Profile = {
      ...profiles[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    profiles[index] = next;
    persist.profiles(profiles);
    return next;
  },

  async listProfiles(): Promise<Profile[]> {
    await delay();
    return [...getProfiles()].sort((a, b) => b.total_score - a.total_score);
  }
};

export const debateService = {
  async createDebate(payload: { user_id: string; topic: string; persona: string }): Promise<Debate> {
    await delay();
    const debates = getDebates();
    const now = new Date().toISOString();
    const debate: Debate = {
      id: createId(),
      user_id: payload.user_id,
      topic: payload.topic,
      persona: payload.persona,
      status: 'ongoing',
      user_score: 0,
      ai_score: 0,
      duration_seconds: 0,
      feedback: '',
      created_at: now
    };
    persist.debates([...debates, debate]);
    return debate;
  },

  async addMessage(payload: { debate_id: string; sender: 'user' | 'ai'; content: string; score_impact: number }): Promise<DebateMessage> {
    await delay();
    const messages = getMessages();
    const message: DebateMessage = {
      id: createId(),
      debate_id: payload.debate_id,
      sender: payload.sender,
      content: payload.content,
      score_impact: payload.score_impact,
      timestamp: new Date().toISOString()
    };
    persist.messages([...messages, message]);
    return message;
  },

  async completeDebate(debateId: string, updates: Pick<Debate, 'user_score' | 'ai_score' | 'duration_seconds' | 'status' | 'feedback' | 'completed_at'>): Promise<Debate> {
    await delay();
    const debates = getDebates();
    const index = debates.findIndex((debate) => debate.id === debateId);
    if (index === -1) {
      throw new Error('Debate not found');
    }
    const next: Debate = {
      ...debates[index],
      ...updates
    };
    debates[index] = next;
    persist.debates(debates);
    return next;
  },

  async listByUser(userId: string): Promise<Debate[]> {
    await delay();
    return getDebates()
      .filter((debate) => debate.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
};

export const mediaService = {
  async addAnalysis(payload: Omit<MediaAnalysis, 'id' | 'created_at'> & { user_id: string }): Promise<MediaAnalysis> {
    await delay();
    const analyses = getAnalyses();
    const analysis: MediaAnalysis = {
      ...payload,
      id: createId(),
      created_at: new Date().toISOString()
    };
    persist.analyses([analysis, ...analyses]);
    return analysis;
  },

  async listByUser(userId: string): Promise<MediaAnalysis[]> {
    await delay();
    return getAnalyses().filter((analysis) => analysis.user_id === userId);
  }
};

export const localDb = {
  auth: authService,
  profiles: profileService,
  debates: debateService,
  media: mediaService
};
