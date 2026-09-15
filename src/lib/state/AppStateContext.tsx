import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Campaign, Prospect, InboxThread, NeedsAttentionItem, Sequence, CompanyResearchResult } from '../../types';
import { getApiClient } from '../api/client';
import { isSupabaseConfigured } from '../supabase';
import { useWorkspace } from '../workspaces/WorkspaceProvider';
import { ManualProspectInput } from '../api/types';

interface AppState {
  campaigns: Campaign[];
  prospects: Prospect[];
  inboxThreads: InboxThread[];
  needsAttention: NeedsAttentionItem[];
  sequences: Sequence[];
  isLoading: boolean;
  error: Error | null;
  refreshCampaigns: () => Promise<void>;
  refreshProspects: () => Promise<void>;
  refreshInbox: () => Promise<void>;
  refreshSequences: () => Promise<void>;
  refreshAll: () => Promise<void>;
  updateCampaignStatus: (id: string, status: Campaign['status']) => Promise<void>;
  updateProspectStatus: (id: string, status: Prospect['status']) => Promise<void>;
  addProspectsToCampaign: (prospectIds: string[], campaignId: string) => Promise<void>;
  researchCompany: (domain: string, role?: string) => Promise<CompanyResearchResult>;
  addResearchedProspect: (result: CompanyResearchResult, campaignId?: string) => Promise<Prospect>;
  addManualProspect: (data: ManualProspectInput) => Promise<Prospect>;
  addCampaign: (campaign: Partial<Campaign>) => Promise<Campaign>;
  createSequence: (name: string, templateType?: string, steps?: any[]) => Promise<Sequence>;
  updateSequenceStep: (sequenceId: string, stepId: string, updates: any) => Promise<void>;
  addSequenceStep: (sequenceId: string, step: any) => Promise<Sequence>;
  discoverProspects: (criteria: any) => Promise<Prospect[]>;
  sendReply: (threadId: string, body: string) => Promise<void>;
  updateThreadClassification: (threadId: string, classification: string) => Promise<void>;
  resetStorage: () => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { workspaceId, isLoading: isWorkspaceLoading } = useWorkspace();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [inboxThreads, setInboxThreads] = useState<InboxThread[]>([]);
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionItem[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const api = getApiClient();

  const loadData = useCallback(async () => {
    // When Supabase is configured, require a workspace ID
    if (isSupabaseConfigured && !workspaceId) {
      setCampaigns([]);
      setProspects([]);
      setInboxThreads([]);
      setNeedsAttention([]);
      setSequences([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [c, p, i, n, s] = await Promise.all([
        api.getCampaigns(),
        api.getProspects(),
        api.getInboxThreads(),
        api.getNeedsAttention(),
        api.getSequences(),
      ]);
      setCampaigns(c);
      setProspects(p);
      setInboxThreads(i);
      setNeedsAttention(n);
      setSequences(s);
    } catch (err: any) {
      console.error('Failed to load workspace data:', err);
      setError(err);
      if (isSupabaseConfigured) {
        setCampaigns([]);
        setProspects([]);
        setInboxThreads([]);
        setNeedsAttention([]);
        setSequences([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (isWorkspaceLoading) return;
    loadData();
  }, [workspaceId, isWorkspaceLoading, loadData]);

  const refreshCampaigns = async () => {
    try {
      const c = await api.getCampaigns();
      setCampaigns(c);
    } catch (err: any) {
      console.error('Failed to refresh campaigns:', err);
    }
  };

  const refreshProspects = async () => {
    try {
      const p = await api.getProspects();
      setProspects(p);
    } catch (err: any) {
      console.error('Failed to refresh prospects:', err);
    }
  };

  const refreshInbox = async () => {
    try {
      const i = await api.getInboxThreads();
      setInboxThreads(i);
    } catch (err: any) {
      console.error('Failed to refresh inbox:', err);
    }
  };

  const refreshSequences = async () => {
    try {
      const s = await api.getSequences();
      setSequences(s);
    } catch (err: any) {
      console.error('Failed to refresh sequences:', err);
    }
  };

  const refreshAll = async () => {
    await loadData();
  };

  const updateSequenceStep = async (sequenceId: string, stepId: string, updates: any) => {
    try {
      const seq = await api.updateSequenceStep(sequenceId, stepId, updates);
      setSequences((prev) => prev.map((s) => (s.id === sequenceId ? seq : s)));
    } catch (err) {
      await refreshSequences();
      throw err;
    }
  };

  const createSequence = async (name: string, templateType?: string, steps?: any[]) => {
    const seq = await api.createSequence(name, templateType, steps);
    setSequences((prev) => [seq, ...prev]);
    return seq;
  };

  const addSequenceStep = async (sequenceId: string, step: any) => {
    const seq = await api.addSequenceStep(sequenceId, step);
    setSequences((prev) => prev.map((s) => (s.id === sequenceId ? seq : s)));
    return seq;
  };

  const updateCampaignStatus = async (id: string, status: Campaign['status']) => {
    // Optimistic update
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    try {
      await api.updateCampaign(id, { status });
    } catch (err) {
      await refreshCampaigns(); // revert on failure
      throw err;
    }
  };

  const updateProspectStatus = async (id: string, status: Prospect['status']) => {
    // Optimistic update
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    try {
      await api.updateProspectStatus(id, status);
    } catch (err) {
      await refreshProspects(); // revert on failure
      throw err;
    }
  };

  const addProspectsToCampaign = async (prospectIds: string[], campaignId: string) => {
    await api.addProspectsToCampaign(prospectIds, campaignId);
    await Promise.all([refreshProspects(), refreshCampaigns()]);
  };

  const researchCompany = async (domain: string, role?: string) => {
    return await api.researchCompany(domain, role);
  };

  const addResearchedProspect = async (result: CompanyResearchResult, campaignId?: string) => {
    const newProspect = await api.addResearchedProspect(result, campaignId);
    await Promise.all([refreshProspects(), refreshCampaigns()]);
    return newProspect;
  };

  const addManualProspect = async (input: ManualProspectInput) => {
    const newProspect = await api.addManualProspect(input);
    await Promise.all([refreshProspects(), refreshCampaigns()]);
    return newProspect;
  };

  const addCampaign = async (campaign: Partial<Campaign>) => {
    const newCampaign = await api.createCampaign(campaign);
    await Promise.all([refreshCampaigns(), refreshProspects()]);
    return newCampaign;
  };

  const discoverProspects = async (criteria: any) => {
    return await api.discoverProspects(criteria);
  };

  const sendReply = async (threadId: string, body: string) => {
    const updatedThread = await api.sendReply(threadId, body);
    setInboxThreads((prev) => prev.map((t) => (t.id === threadId ? updatedThread : t)));
  };

  const updateThreadClassification = async (threadId: string, classification: string) => {
    const updatedThread = await api.updateThreadClassification(threadId, classification);
    setInboxThreads((prev) => prev.map((t) => (t.id === threadId ? updatedThread : t)));
  };

  const resetStorage = () => {
    localStorage.removeItem('outboundos_state_v1');
    localStorage.removeItem('outbound_workspace_id');
    localStorage.removeItem('outbound_workspace_name');
    window.location.reload();
  };

  const value = {
    campaigns,
    prospects,
    inboxThreads,
    needsAttention,
    sequences,
    isLoading,
    error,
    refreshCampaigns,
    refreshProspects,
    refreshInbox,
    refreshSequences,
    refreshAll,
    updateCampaignStatus,
    updateProspectStatus,
    addProspectsToCampaign,
    researchCompany,
    addResearchedProspect,
    addManualProspect,
    addCampaign,
    createSequence,
    updateSequenceStep,
    addSequenceStep,
    discoverProspects,
    sendReply,
    updateThreadClassification,
    resetStorage,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
