import { Campaign, Prospect, InboxThread, NeedsAttentionItem, Sequence } from '../types';
import { mockCampaigns, mockProspects, mockInboxThreads, mockNeedsAttention } from '../data/mockData';

const STORAGE_KEY = 'outboundos_state_v1';

export interface AppStorageData {
  campaigns: Campaign[];
  prospects: Prospect[];
  inboxThreads: InboxThread[];
  needsAttention: NeedsAttentionItem[];
  sequences: Sequence[];
}

export const storage = {
  get: (): AppStorageData => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not read from localStorage', error);
    }
    // Return mock data as default
    return {
      campaigns: [...mockCampaigns],
      prospects: [...mockProspects],
      inboxThreads: [...mockInboxThreads],
      needsAttention: [...mockNeedsAttention],
      sequences: [],
    };
  },
  
  set: (data: AppStorageData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Could not write to localStorage', error);
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Could not clear localStorage', error);
    }
  }
};
