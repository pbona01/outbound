import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEV_MOCK_USER: UserProfile = {
  id: 'usr-dev-demo',
  email: 'demo@outboundos.com',
  full_name: 'Demo User',
  role: 'Owner',
  onboarding_completed: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const configured = isSupabaseConfigured();

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        setProfile(data);
      } else {
        const newProfile: UserProfile = {
          id: userId,
          email: email,
          full_name: email.split('@')[0],
          role: 'Owner',
          onboarding_completed: false,
        };
        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }
    } catch {
      setProfile({ id: userId, email, full_name: email.split('@')[0], onboarding_completed: false });
    }
  };

  useEffect(() => {
    if (!configured) {
      try {
        const storedMock = localStorage.getItem('outbound_mock_session');
        if (storedMock) {
          setProfile(JSON.parse(storedMock));
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      }
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '').finally(() => {
          setIsLoading(false);
        });
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const signIn = async (email: string, password?: string) => {
    if (!configured) {
      const mockProf: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        role: 'Owner',
        onboarding_completed: true,
      };
      localStorage.setItem('outbound_mock_session', JSON.stringify(mockProf));
      setProfile(mockProf);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '',
    });
    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    if (!configured) {
      return { error: new Error('Supabase is not configured.') };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    if (!configured) {
      const mockProf: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: fullName || email.split('@')[0],
        role: 'Owner',
        onboarding_completed: false,
      };
      localStorage.setItem('outbound_mock_session', JSON.stringify(mockProf));
      setProfile(mockProf);
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || '',
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (data.user) {
      await fetchProfile(data.user.id, email);
    }
    return { error };
  };

  const signOut = async () => {
    if (configured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('outbound_mock_session');
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!configured) return { error: null };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/signin`,
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user && !profile) return { error: new Error('No active user profile') };
    const targetId = user?.id || profile?.id;
    if (!targetId) return { error: new Error('No user id') };

    const merged = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(merged as UserProfile);
    if (!configured) {
      localStorage.setItem('outbound_mock_session', JSON.stringify(merged));
    }

    if (configured && user) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      return { error };
    }
    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email || '');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured: configured,
        signIn,
        signInWithMagicLink,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
