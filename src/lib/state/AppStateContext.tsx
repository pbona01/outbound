import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Campaign, Prospect, InboxThread, NeedsAttentionItem } from '../../types';
import { getApiClient } from '../api/client';

interface AppState {
  campaigns: Campaign[];
  prospects: Prospect[];
  inboxThreads: InboxThread[];
  needsAttention: NeedsAttentionItem[];
  isLoading: boolean;
  error: Error | null;
  refreshCampaigns: () => Promise<void>;
  refreshProspects: () => Promise<void>;
  refreshInbox: () => Promise<void>;
  updateCampaignStatus: (id: string, status: Campaign['status']) => Promise<void>;
  updateProspectStatus: (id: string, status: Prospect['status']) => Promise<void>;
  addCampaign: (campaign: Partial<Campaign>) => Promise<Campaign>;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [inboxThreads, setInboxThreads] = useState<InboxThread[]>([]);
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const api = getApiClient();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [c, p, i, n] = await Promise.all([
        api.getCampaigns(),
        api.getProspects(),
        api.getInboxThreads(),
        api.getNeedsAttention()
      ]);
      setCampaigns(c);
      setProspects(p);
      setInboxThreads(i);
      setNeedsAttention(n);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

  const addCampaign = async (campaign: Partial<Campaign>) => {
    const newCampaign = await api.createCampaign(campaign);
    setCampaigns(prev => [newCampaign, ...prev]);
    return newCampaign;
  };

  const value = {
    campaigns,
    prospects,
    inboxThreads,
    needsAttention,
    isLoading,
    error,
    refreshCampaigns,
    refreshProspects,
    refreshInbox,
    updateCampaignStatus,
    updateProspectStatus,
    addCampaign
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
