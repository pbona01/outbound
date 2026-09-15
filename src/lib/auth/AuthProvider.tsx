import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ error: any }>;
  signUp: (email: string, password?: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local fallback user for dev mode or when unauthenticated
const DEV_FALLBACK_USER: UserProfile = {
  id: 'usr-dev-alex',
  email: 'alex@growthstudio.co',
  full_name: 'Alex Vance',
  role: 'Agency Founder',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEV_FALLBACK_USER);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const configured = isSupabaseConfigured();

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data);
      } else {
        // Auto-create initial profile record if missing
        const newProfile: UserProfile = {
          id: userId,
          email: email,
          full_name: email.split('@')[0],
          role: 'Owner',
        };
        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }
    } catch {
      setProfile({ id: userId, email, full_name: email.split('@')[0] });
    }
  };

  useEffect(() => {
    if (!configured) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setProfile(DEV_FALLBACK_USER);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const signIn = async (email: string, password?: string) => {
    if (!configured) {
      // Mock login for dev
      setProfile({ id: 'usr-dev-alex', email, full_name: email.split('@')[0], role: 'Owner' });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: password || 'Outbound123!',
    });
    return { error };
  };

  const signUp = async (email: string, password?: string, fullName?: string) => {
    if (!configured) {
      setProfile({ id: `usr-${Date.now()}`, email, full_name: fullName || email.split('@')[0], role: 'Owner' });
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password: password || 'Outbound123!',
      options: { data: { full_name: fullName } },
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
    setUser(null);
    setSession(null);
    setProfile(DEV_FALLBACK_USER);
  };

  const resetPassword = async (email: string) => {
    if (!configured) return { error: null };
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
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
        signUp,
        signOut,
        resetPassword,
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
