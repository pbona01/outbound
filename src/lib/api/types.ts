import { Campaign, Prospect, InboxThread, NeedsAttentionItem, Sequence, CompanyResearchResult } from '../../types';

export interface ManualProspectInput {
  companyName: string;
  domain: string;
  industry?: string;
  location?: string;
  contactName: string;
  contactRole?: string;
  contactEmail?: string;
  fitScore?: number;
  primaryProblem?: string;
  campaignId?: string;
}

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
  addProspectsToCampaign(prospectIds: string[], campaignId: string): Promise<void>;
  addResearchedProspect(result: CompanyResearchResult, campaignId?: string): Promise<Prospect>;
  addManualProspect(data: ManualProspectInput): Promise<Prospect>;

  // Inbox
  getInboxThreads(): Promise<InboxThread[]>;
  sendReply(threadId: string, body: string): Promise<InboxThread>;
  updateThreadClassification(threadId: string, classification: string): Promise<InboxThread>;

  // Sequences
  getSequences(): Promise<Sequence[]>;
  updateSequenceStep(sequenceId: string, stepId: string, updates: any): Promise<Sequence>;
  createSequence(name: string, templateType?: string, steps?: any[]): Promise<Sequence>;
  addSequenceStep(sequenceId: string, step: any): Promise<Sequence>;

  // Needs Attention
  getNeedsAttention(): Promise<NeedsAttentionItem[]>;

  // AI & Research Tasks
  discoverProspects(criteria: any): Promise<Prospect[]>;
  researchCompany(domain: string, role?: string): Promise<CompanyResearchResult>;
  generatePersonalizedEmail(prospectId: string, campaignId: string): Promise<any>;
}
