import { Campaign, Prospect, InboxThread, NeedsAttentionItem } from '../../types';

export interface ApiClient {
  // Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign>;
  createCampaign(data: Partial<Campaign>): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;

  // Prospects
  getProspects(filters?: any): Promise<Prospect[]>;
  getProspect(id: string): Promise<Prospect>;
  updateProspectStatus(id: string, status: Prospect['status']): Promise<Prospect>;

  // Inbox
  getInboxThreads(): Promise<InboxThread[]>;

  // Needs Attention
  getNeedsAttention(): Promise<NeedsAttentionItem[]>;

  // AI & Research Tasks
  discoverProspects(criteria: any): Promise<Prospect[]>;
  researchCompany(domain: string): Promise<any>;
  generatePersonalizedEmail(prospectId: string, campaignId: string): Promise<any>;
}
