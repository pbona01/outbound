import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Campaign, Prospect, InboxThread, NeedsAttentionItem, Sequence, CompanyResearchResult } from '../../types';
import { getApiClient } from '../api/client';
import { isSupabaseConfigured } from '../supabase';

interface AppState {
  campaigns: Campaign[];
  prospects: Prospect[];
  inboxThreads: InboxThread[];
  needsAttention: NeedsAttentionItem[];
  sequences: Sequence[];
  refreshSequences: () => Promise<void>;
  updateSequenceStep: (sequenceId: string, stepId: string, updates: any) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  refreshCampaigns: () => Promise<void>;
  refreshProspects: () => Promise<void>;
  refreshInbox: () => Promise<void>;
  updateCampaignStatus: (id: string, status: Campaign['status']) => Promise<void>;
  updateProspectStatus: (id: string, status: Prospect['status']) => Promise<void>;
  addProspectsToCampaign: (prospectIds: string[], campaignId: string) => Promise<void>;
  researchCompany: (domain: string, role?: string) => Promise<CompanyResearchResult>;
  addResearchedProspect: (result: CompanyResearchResult, campaignId?: string) => Promise<Prospect>;
  addCampaign: (campaign: Partial<Campaign>) => Promise<Campaign>;
  sendReply: (threadId: string, body: string) => Promise<void>;
  resetStorage: () => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [inboxThreads, setInboxThreads] = useState<InboxThread[]>([]);
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionItem[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const api = getApiClient();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [c, p, i, n, s] = await Promise.all([
        api.getCampaigns(),
        api.getProspects(),
        api.getInboxThreads(),
        api.getNeedsAttention(),
        api.getSequences()
      ]);
      setCampaigns(c);
      setProspects(p);
      setInboxThreads(i);
      setNeedsAttention(n);
      setSequences(s);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // A configured Supabase project is the real-app mode. Do not show the old
    // demo dataset there; the Supabase data adapter is added in the next phase.
    if (isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }
    loadData();
  }, []);

  const refreshCampaigns = async () => {
    const c = await api.getCampaigns();
    setCampaigns(c);
  };

  const refreshProspects = async () => {
    const p = await api.getProspects();
    setProspects(p);
  };

  const refreshInbox = async () => {
    const i = await api.getInboxThreads();
    setInboxThreads(i);
  };

  const refreshSequences = async () => {
    const s = await api.getSequences();
    setSequences(s);
  };

  const updateSequenceStep = async (sequenceId: string, stepId: string, updates: any) => {
    try {
      const seq = await api.updateSequenceStep(sequenceId, stepId, updates);
      setSequences(prev => prev.map(s => s.id === sequenceId ? seq : s));
    } catch (error) {
      await refreshSequences();
      throw error;
    }
  };

  const updateCampaignStatus = async (id: string, status: Campaign['status']) => {
    // Optimistic update
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    try {
      await api.updateCampaign(id, { status });
    } catch (error) {
      await refreshCampaigns(); // revert
      throw error;
    }
  };

  const updateProspectStatus = async (id: string, status: Prospect['status']) => {
    // Optimistic update
    setProspects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    try {
      await api.updateProspectStatus(id, status);
    } catch (error) {
      await refreshProspects(); // revert
      throw error;
    }
  };

  const addProspectsToCampaign = async (prospectIds: string[], campaignId: string) => {
    try {
      await api.addProspectsToCampaign(prospectIds, campaignId);
      await Promise.all([refreshProspects(), refreshCampaigns()]);
    } catch (error) {
      throw error;
    }
  };

  const researchCompany = async (domain: string, role?: string) => {
    return await api.researchCompany(domain, role);
  };

  const addResearchedProspect = async (result: CompanyResearchResult, campaignId?: string) => {
    const newProspect = await api.addResearchedProspect(result, campaignId);
    await Promise.all([refreshProspects(), refreshCampaigns()]);
    return newProspect;
  };

  const addCampaign = async (campaign: Partial<Campaign>) => {
    const newCampaign = await api.createCampaign(campaign);
    await Promise.all([refreshCampaigns(), refreshProspects()]);
    return newCampaign;
  };

  const sendReply = async (threadId: string, body: string) => {
    const updatedThread = await api.sendReply(threadId, body);
    setInboxThreads(prev => prev.map(t => t.id === threadId ? updatedThread : t));
  };

  const resetStorage = () => {
    localStorage.removeItem('outboundos_state_v1');
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
    updateCampaignStatus,
    updateProspectStatus,
    addProspectsToCampaign,
    researchCompany,
    addResearchedProspect,
    updateSequenceStep,
    addCampaign,
    sendReply,
    resetStorage
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
