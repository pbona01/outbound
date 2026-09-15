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
  mailbox_provider?: string;
  onboarding_completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  switchWorkspace: (workspaceId: string) => void;
  updateWorkspace: (updates: Partial<Workspace>) => Promise<Workspace | null>;
  createWorkspace: (data: Partial<Workspace>) => Promise<Workspace | null>;
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

  const configured = isSupabaseConfigured();

  const loadWorkspaces = async () => {
    setIsLoading(true);
    setError(null);

    if (!configured) {
      try {
        const storedWs = localStorage.getItem('outbound_workspace_data');
        if (storedWs) {
          const parsed = JSON.parse(storedWs);
          setWorkspace(parsed);
          setWorkspaces([parsed]);
        } else {
          setWorkspace(null);
          setWorkspaces([]);
        }
      } catch {
        setWorkspace(null);
        setWorkspaces([]);
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
      } else {
        setWorkspaces([]);
        setWorkspace(null);
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
    }
  };

  const updateWorkspace = async (updates: Partial<Workspace>): Promise<Workspace | null> => {
    if (!workspace) return null;
    const updated = { ...workspace, ...updates, updated_at: new Date().toISOString() };
    setWorkspace(updated);
    if (!configured) {
      localStorage.setItem('outbound_workspace_data', JSON.stringify(updated));
    }

    if (configured) {
      const { error: err } = await supabase.from('workspaces').update(updates).eq('id', workspace.id);
      if (err) throw err;
    }
    return updated;
  };

  const createWorkspace = async (data: Partial<Workspace>): Promise<Workspace | null> => {
    if (!configured || !user) {
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
        workspaces,
        isLoading,
        error,
        switchWorkspace,
        updateWorkspace,
        createWorkspace,
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
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
