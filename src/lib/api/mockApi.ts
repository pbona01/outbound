import { ApiClient } from './types';
import { mockCampaigns, mockProspects, mockInboxThreads, mockNeedsAttention } from '../../data/mockData';
import { Campaign, Prospect, InboxThread, NeedsAttentionItem } from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiClient implements ApiClient {
  private campaigns: Campaign[] = [...mockCampaigns];
  private prospects: Prospect[] = [...mockProspects];
  private threads: InboxThread[] = [...mockInboxThreads];
  private needsAttention: NeedsAttentionItem[] = [...mockNeedsAttention];

  async getCampaigns(): Promise<Campaign[]> {
    await delay(300);
    return [...this.campaigns];
  }

  async getCampaign(id: string): Promise<Campaign> {
    await delay(200);
    const c = this.campaigns.find(c => c.id === id);
    if (!c) throw new Error('Campaign not found');
    return { ...c };
  }

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    await delay(500);
    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: data.name || 'Untitled Campaign',
      status: data.status || 'draft',
      audienceQuery: data.audienceQuery || '',
      targetIndustry: data.targetIndustry || '',
      targetGeography: data.targetGeography || '',
      stats: data.stats || {
        prospects: 0,
        contacted: 0,
        sent: 0,
        replies: 0,
        positiveReplies: 0,
        meetings: 0,
      },
      createdAt: new Date().toISOString(),
      mailboxEmail: data.mailboxEmail || 'alex@growthstudio.co',
      dailyLimit: data.dailyLimit || 35,
      sequenceStepsCount: data.sequenceStepsCount || 4,
    };
    this.campaigns = [newCampaign, ...this.campaigns];
    return { ...newCampaign };
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    await delay(200);
    const index = this.campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    this.campaigns[index] = { ...this.campaigns[index], ...updates };
    return { ...this.campaigns[index] };
  }

  async getProspects(filters?: any): Promise<Prospect[]> {
    await delay(400);
    return [...this.prospects];
  }

  async getProspect(id: string): Promise<Prospect> {
    await delay(200);
    const p = this.prospects.find(p => p.id === id);
    if (!p) throw new Error('Prospect not found');
    return { ...p };
  }

  async updateProspectStatus(id: string, status: Prospect['status']): Promise<Prospect> {
    await delay(200);
    const index = this.prospects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Prospect not found');
    this.prospects[index] = { ...this.prospects[index], status };
    return { ...this.prospects[index] };
  }

  async getInboxThreads(): Promise<InboxThread[]> {
    await delay(300);
    return [...this.threads];
  }

  async getNeedsAttention(): Promise<NeedsAttentionItem[]> {
    await delay(200);
    return [...this.needsAttention];
  }

  async discoverProspects(criteria: any): Promise<Prospect[]> {
    await delay(2000);
    return [];
  }

  async researchCompany(domain: string): Promise<any> {
    await delay(1500);
    return {};
  }

  async generatePersonalizedEmail(prospectId: string, campaignId: string): Promise<any> {
    await delay(2000);
    return {};
  }
}
