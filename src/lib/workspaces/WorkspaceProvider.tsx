import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  owner_id?: string;
  industry?: string;
  geography?: string;
  company_size?: string;
  offer?: string;
  booking_link?: string;
  ai_reply_mode?: 'suggest' | 'approve' | 'auto';
  mailbox_provider?: string;
  onboarding_completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaceId: string | null;
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  switchWorkspace: (workspaceId: string) => void;
  updateWorkspace: (updates: Partial<Workspace>) => Promise<Workspace | null>;
  createWorkspace: (data: Partial<Workspace>) => Promise<Workspace | null>;
  refreshWorkspace: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const MOCK_FALLBACK_WORKSPACE: Workspace = {
  id: 'ws-demo-01',
  name: 'Demo Workspace',
  industry: 'B2B Software',
  geography: 'North America',
  company_size: '10–50 employees',
  offer: 'AI Outbound System',
  mailbox_provider: 'Set up later',
  created_at: new Date().toISOString(),
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const configured = Boolean(isSupabaseConfigured);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    setError(null);

    if (!configured || !supabase) {
      try {
        const storedWs = localStorage.getItem('outbound_workspace_data');
        if (storedWs) {
          const parsed = JSON.parse(storedWs);
          setWorkspace(parsed);
          setWorkspaces([parsed]);
        } else {
          setWorkspace(MOCK_FALLBACK_WORKSPACE);
          setWorkspaces([MOCK_FALLBACK_WORKSPACE]);
        }
      } catch {
        setWorkspace(MOCK_FALLBACK_WORKSPACE);
        setWorkspaces([MOCK_FALLBACK_WORKSPACE]);
      }
      setIsLoading(false);
      return;
    }

    if (!user) {
      setWorkspace(null);
      setWorkspaces([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch workspaces where user is owner or member
      const { data, error: wsErr } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (wsErr) {
        throw wsErr;
      }

      if (data && data.length > 0) {
        setWorkspaces(data);
        const storedId = localStorage.getItem('outbound_workspace_id');
        const matched = data.find((w) => w.id === storedId) || data[0];
        setWorkspace(matched);
        localStorage.setItem('outbound_workspace_id', matched.id);
        localStorage.setItem('outbound_workspace_name', matched.name);
      } else {
        setWorkspaces([]);
        setWorkspace(null);
        localStorage.removeItem('outbound_workspace_id');
        localStorage.removeItem('outbound_workspace_name');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, [user?.id, configured]);

  const switchWorkspace = (workspaceId: string) => {
    const found = workspaces.find((w) => w.id === workspaceId);
    if (found) {
      setWorkspace(found);
      localStorage.setItem('outbound_workspace_id', found.id);
      localStorage.setItem('outbound_workspace_name', found.name);
    }
  };

  const updateWorkspace = async (updates: Partial<Workspace>): Promise<Workspace | null> => {
    if (!workspace) return null;
    const updated = { ...workspace, ...updates, updated_at: new Date().toISOString() };
    setWorkspace(updated);
    if (!configured) {
      localStorage.setItem('outbound_workspace_data', JSON.stringify(updated));
    }

    if (configured && supabase) {
      const { error: err } = await supabase.from('workspaces').update(updates).eq('id', workspace.id);
      if (err) throw err;
    }
    return updated;
  };

  const createWorkspace = async (data: Partial<Workspace>): Promise<Workspace | null> => {
    if (!configured || !user || !supabase) {
      const mockWs: Workspace = {
        id: `ws-${Date.now()}`,
        name: data.name || 'My Workspace',
        slug: data.slug || `ws-${Date.now()}`,
        industry: data.industry || '',
        geography: data.geography || '',
        company_size: data.company_size || '5-50 employees',
        offer: data.offer || '',
        mailbox_provider: data.mailbox_provider || 'Set up later',
        created_at: new Date().toISOString(),
      };
      setWorkspace(mockWs);
      setWorkspaces((prev) => [mockWs, ...prev]);
      localStorage.setItem('outbound_workspace_id', mockWs.id);
      localStorage.setItem('outbound_workspace_name', mockWs.name);
      localStorage.setItem('outbound_workspace_data', JSON.stringify(mockWs));
      return mockWs;
    }

    try {
      const slug = data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : `ws-${Date.now()}`);
      const payload = {
        name: data.name || 'My Workspace',
        slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
        owner_id: user.id,
        industry: data.industry || '',
        geography: data.geography || '',
        company_size: data.company_size || '5-50 employees',
        offer: data.offer || '',
        mailbox_provider: data.mailbox_provider || 'Set up later',
        onboarding_completed_at: new Date().toISOString(),
      };

      const { data: dbWs, error: insertError } = await supabase
        .from('workspaces')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      if (dbWs) {
        // Add user as owner in workspace_members
        await supabase.from('workspace_members').insert({
          workspace_id: dbWs.id,
          user_id: user.id,
          role: 'owner',
        });

        setWorkspace(dbWs);
        setWorkspaces((prev) => [dbWs, ...prev]);
        localStorage.setItem('outbound_workspace_id', dbWs.id);
        localStorage.setItem('outbound_workspace_name', dbWs.name);
        return dbWs;
      }
      return null;
    } catch (err: any) {
      setError(err.message || 'Error creating workspace');
      throw err;
    }
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        workspaceId: workspace?.id || null,
        workspaces,
        isLoading,
        error,
        switchWorkspace,
        updateWorkspace,
        createWorkspace,
        refreshWorkspace: refreshWorkspaces,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    return {
      workspace: MOCK_FALLBACK_WORKSPACE,
      workspaceId: MOCK_FALLBACK_WORKSPACE.id,
      workspaces: [MOCK_FALLBACK_WORKSPACE],
      isLoading: false,
      error: null,
      switchWorkspace: () => {},
      updateWorkspace: async () => MOCK_FALLBACK_WORKSPACE,
      createWorkspace: async () => MOCK_FALLBACK_WORKSPACE,
      refreshWorkspace: async () => {},
      refreshWorkspaces: async () => {},
    };
  }
  return context;
}
