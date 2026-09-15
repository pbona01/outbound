import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  onboarding_completed?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isLoading: boolean;
  configured: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const user = session?.user ?? null;

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(currentSession);

        if (currentSession?.user) {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          if (mounted) {
            if (dbProfile) {
              setProfile({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                full_name: dbProfile.full_name || currentSession.user.user_metadata?.full_name || '',
                role: dbProfile.role || currentSession.user.user_metadata?.role || 'Operator',
                onboarding_completed: Boolean(dbProfile.onboarding_completed),
              });
            } else {
              setProfile({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                full_name: currentSession.user.user_metadata?.full_name || '',
                role: currentSession.user.user_metadata?.role || 'Operator',
                onboarding_completed: Boolean(currentSession.user.user_metadata?.onboarding_completed),
              });
            }
          }
        }
      } catch (err) {
        console.error('Error during initAuth:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) {
        setLoading(true);
        try {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', nextSession.user.id)
            .maybeSingle();

          if (mounted) {
            if (dbProfile) {
              setProfile({
                id: nextSession.user.id,
                email: nextSession.user.email || '',
                full_name: dbProfile.full_name || nextSession.user.user_metadata?.full_name || '',
                role: dbProfile.role || nextSession.user.user_metadata?.role || 'Operator',
                onboarding_completed: Boolean(dbProfile.onboarding_completed),
              });
            } else {
              setProfile({
                id: nextSession.user.id,
                email: nextSession.user.email || '',
                full_name: nextSession.user.user_metadata?.full_name || '',
                role: nextSession.user.user_metadata?.role || 'Operator',
                onboarding_completed: Boolean(nextSession.user.user_metadata?.onboarding_completed),
              });
            }
          }
        } catch (err) {
          console.error('Error during authStateChange profile fetch:', err);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user,
    profile,
    loading,
    isLoading: loading,
    configured: isSupabaseConfigured,
    isConfigured: isSupabaseConfigured,
    signIn: async (email, password) => {
      if (!supabase) throw new Error('Supabase is not configured. Add the Vercel environment variables first.');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signUp: async (email, password, fullName) => {
      if (!supabase) throw new Error('Supabase is not configured. Add the Vercel environment variables first.');
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) throw error;
    },
    signOut: async () => {
      if (!supabase) return;
      localStorage.removeItem('outbound_workspace_id');
      localStorage.removeItem('outbound_workspace_name');
      setProfile(null);
      setSession(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    resetPassword: async (email) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
    },
    refreshProfile: async () => {
      if (!supabase || !user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: data.full_name || user.user_metadata?.full_name || '',
          role: data.role || user.user_metadata?.role || 'Operator',
          onboarding_completed: Boolean(data.onboarding_completed),
        });
      }
    },
  }), [loading, session, profile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
