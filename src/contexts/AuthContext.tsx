import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, profileService, Profile, AuthUser } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { user: existingUser } = await authService.getSession();
      if (existingUser) {
        setUser(existingUser);
        const existingProfile = await profileService.getProfile(existingUser.id);
        setProfile(existingProfile);
      }
      setLoading(false);
    })();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const nextProfile = await profileService.getProfile(user.id);
    setProfile(nextProfile);
  };

  const signIn = async (email: string, password: string) => {
    const { user: signedInUser } = await authService.signIn(email, password);
    setUser(signedInUser);
    const userProfile = await profileService.getProfile(signedInUser.id);
    setProfile(userProfile);
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { user: newUser, profile: newProfile } = await authService.signUp(email, password, username);
    setUser(newUser);
    setProfile(newProfile);
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
