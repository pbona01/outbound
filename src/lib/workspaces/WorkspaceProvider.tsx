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
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  updateWorkspace: (updates: Partial<Workspace>) => Promise<Workspace | null>;
  createWorkspace: (data: Partial<Workspace>) => Promise<Workspace | null>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const DEV_FALLBACK_WORKSPACE: Workspace = {
  id: 'ws-growthstudio-01',
  name: 'GrowthStudio',
  industry: 'Kitchen & Bath Remodeling',
  geography: 'Texas',
  company_size: '5–50 employees',
  offer: 'Conversion-focused website redesigns & instant quote calculators',
  mailbox_provider: 'Google Workspace',
  onboarding_completed_at: new Date().toISOString(),
};

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(DEV_FALLBACK_WORKSPACE);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([DEV_FALLBACK_WORKSPACE]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const configured = isSupabaseConfigured();

  const loadWorkspaces = async () => {
    if (!configured || !user) {
      setWorkspace(DEV_FALLBACK_WORKSPACE);
      setWorkspaces([DEV_FALLBACK_WORKSPACE]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch user's workspaces via workspace_members or owner_id
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0 && !error) {
        setWorkspaces(data);
        const storedId = localStorage.getItem('outbound_workspace_id');
        const matched = data.find((w) => w.id === storedId) || data[0];
        setWorkspace(matched);
      } else {
        // Create default workspace for new user
        const defaultWs: Partial<Workspace> = {
          name: profile?.full_name ? `${profile.full_name}'s Workspace` : 'Northstar Sales',
          owner_id: user.id,
          industry: 'B2B Services',
          geography: 'United States',
          mailbox_provider: 'Google Workspace',
        };
        const { data: created } = await supabase.from('workspaces').insert(defaultWs).select().single();
        if (created) {
          await supabase.from('workspace_members').insert({
            workspace_id: created.id,
            user_id: user.id,
            role: 'owner',
          });
          setWorkspace(created);
          setWorkspaces([created]);
        }
      }
    } catch {
      setWorkspace(DEV_FALLBACK_WORKSPACE);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, [user, configured]);

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

    if (configured) {
      await supabase.from('workspaces').update(updates).eq('id', workspace.id);
    }
    return updated;
  };

  const createWorkspace = async (data: Partial<Workspace>): Promise<Workspace | null> => {
    const newWs: Workspace = {
      id: `ws-${Date.now()}`,
      name: data.name || 'New Workspace',
      industry: data.industry || '',
      geography: data.geography || '',
      company_size: data.company_size || '5-50 employees',
      offer: data.offer || '',
      mailbox_provider: data.mailbox_provider || 'Set up later',
      onboarding_completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    if (configured && user) {
      const { data: dbWs } = await supabase
        .from('workspaces')
        .insert({ ...data, owner_id: user.id })
        .select()
        .single();
      if (dbWs) {
        await supabase.from('workspace_members').insert({
          workspace_id: dbWs.id,
          user_id: user.id,
          role: 'owner',
        });
        setWorkspaces((prev) => [dbWs, ...prev]);
        setWorkspace(dbWs);
        return dbWs;
      }
    }

    setWorkspaces((prev) => [newWs, ...prev]);
    setWorkspace(newWs);
    return newWs;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        workspaces,
        isLoading,
        switchWorkspace,
        updateWorkspace,
        createWorkspace,
        refreshWorkspaces: loadWorkspaces,
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
