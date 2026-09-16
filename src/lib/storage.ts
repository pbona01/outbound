import { Campaign, Prospect, InboxThread, NeedsAttentionItem, Sequence } from '../types';

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
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          return JSON.parse(data);
        }
      }
    } catch (error) {
      console.warn('Could not read from localStorage', error);
    }
    // Return empty state by default for clean new user experience
    return {
      campaigns: [],
      prospects: [],
      inboxThreads: [],
      needsAttention: [],
      sequences: [],
    };
  },
  
  set: (data: AppStorageData) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Could not write to localStorage', error);
    }
  },

  clear: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Could not clear localStorage', error);
    }
  }
};

export default storage;
