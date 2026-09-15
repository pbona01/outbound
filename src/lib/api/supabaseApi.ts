import { supabase } from '../supabase';
import { ApiClient } from './types';
import { Campaign, Prospect, InboxThread, NeedsAttentionItem, Sequence, CompanyResearchResult, ProspectStatus } from '../../types';

export class SupabaseApiClient implements ApiClient {
  private getWorkspaceId(): string {
    const wsId = localStorage.getItem('outbound_workspace_id');
    if (!wsId) {
      throw new Error('No active workspace selected. Please select or create a workspace.');
    }
    return wsId;
  }

  private mapDbProspectToProspect(p: any): Prospect {
    const statusVal: ProspectStatus = (p.status as ProspectStatus) || 'ready';
    return {
      id: p.id,
      companyId: p.company_id || `comp-${p.id}`,
      company: {
        id: p.company_id || `comp-${p.id}`,
        name: p.company_name || 'Target Account',
        domain: p.domain || '',
        industry: p.industry || 'Business Services',
        location: p.location || 'United States',
        city: p.city || '',
        state: p.state || '',
        country: p.country || 'USA',
        employeeCount: p.employee_count || '10-50',
        websiteUrl: p.source_url || (p.domain ? `https://${p.domain}` : ''),
        websiteQualityScore: p.fit_score || 70,
        description: p.evidence || 'Target prospect account',
      },
      contact: {
        id: `cnt-${p.id}`,
        fullName: p.contact_name || 'Prospect Contact',
        firstName: (p.contact_name || 'Prospect').split(' ')[0],
        lastName: (p.contact_name || '').split(' ').slice(1).join(' ') || '',
        role: p.contact_role || 'Executive',
        email: p.contact_email || (p.domain ? `contact@${p.domain}` : ''),
        emailVerified: p.verified ?? false,
      },
      fitScore: p.fit_score || 70,
      fitScoreBreakdown: {
        businessRelevance: 20,
        commercialValue: 15,
        websiteOpportunity: 15,
        activity: 10,
        contactability: 5,
        digitalPresence: 5,
      },
      fitLabel: p.fit_score >= 85 ? 'Excellent fit' : p.fit_score >= 75 ? 'Strong fit' : 'Moderate fit',
      primaryProblem: p.primary_problem || 'Website conversion friction',
      status: statusVal,
      campaignId: p.campaign_id,
      campaignName: p.campaign_name,
      research: {
        summary: p.evidence || 'Analyzed target website and domain signals.',
        whyTheyFit: ['Matches ICP criteria'],
        websiteOpportunities: [
          {
            id: 'opp-1',
            issue: p.primary_problem || 'Conversion friction',
            detail: p.evidence || 'Audit highlights optimization potential.',
            sourceUrl: p.source_url || (p.domain ? `https://${p.domain}` : ''),
          },
        ],
        techStack: [],
        recentSignals: [],
        suggestedAngle: 'Focus on clear conversion improvements.',
      },
      generatedEmail: {
        subject: `Quick idea for ${p.company_name || 'your team'}`,
        body: `Hi ${(p.contact_name || '').split(' ')[0] || 'there'},\n\nNoticed ${p.company_name || 'your company'} is growing. Thought of a quick way to improve conversions.\n\nBest,\n[Your Name]`,
        personalizations: [
          {
            text: p.evidence || 'Site audit',
            source: 'Website Audit',
            explanation: 'Detected optimization opportunity',
          },
        ],
        charCount: 140,
      },
      activities: [
        {
          id: `act-${p.id}`,
          type: 'discovered',
          title: 'Prospect Discovered',
          timestamp: p.discovered_at || p.created_at || new Date().toISOString(),
        },
      ],
      createdAt: p.created_at || new Date().toISOString(),
    };
  }

  // CAMPAIGNS
  async getCampaigns(): Promise<Campaign[]> {
    let wsId: string;
    try {
      wsId = this.getWorkspaceId();
    } catch {
      return [];
    }

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to load campaigns: ${error.message}`);
    }

    if (!data) return [];

    return data.map((c) => ({
      id: c.id,
      name: c.name,
      audienceQuery: c.audience_query || '',
      targetIndustry: c.target_industry || '',
      targetGeography: c.target_geography || '',
      status: c.status || 'draft',
      stats: c.stats || { prospects: 0, contacted: 0, sent: 0, replies: 0, positiveReplies: 0, meetings: 0 },
      createdAt: c.created_at,
      mailboxEmail: c.mailbox_email || '',
      dailyLimit: c.daily_limit || 50,
      sequenceStepsCount: c.sequence_steps_count || 3,
    }));
  }

  async getCampaign(id: string): Promise<Campaign> {
    const wsId = this.getWorkspaceId();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('workspace_id', wsId)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new Error(`Campaign not found: ${error?.message || 'Not found'}`);
    }

    return {
      id: data.id,
      name: data.name,
      audienceQuery: data.audience_query || '',
      targetIndustry: data.target_industry || '',
      targetGeography: data.target_geography || '',
      status: data.status || 'draft',
      stats: data.stats || { prospects: 0, contacted: 0, sent: 0, replies: 0, positiveReplies: 0, meetings: 0 },
      createdAt: data.created_at,
      mailboxEmail: data.mailbox_email || '',
      dailyLimit: data.daily_limit || 50,
      sequenceStepsCount: data.sequence_steps_count || 3,
    };
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const wsId = this.getWorkspaceId();
    const newCamp = {
      workspace_id: wsId,
      name: campaign.name || 'New Campaign',
      audience_query: campaign.audienceQuery || '',
      target_industry: campaign.targetIndustry || '',
      target_geography: campaign.targetGeography || '',
      status: campaign.status || 'draft',
      stats: campaign.stats || { prospects: 0, contacted: 0, sent: 0, replies: 0, positiveReplies: 0, meetings: 0 },
      mailbox_email: campaign.mailboxEmail || '',
      daily_limit: campaign.dailyLimit || 50,
      sequence_steps_count: campaign.sequenceStepsCount || 3,
    };

    const { data, error } = await supabase.from('campaigns').insert(newCamp).select().single();
    if (error || !data) {
      throw new Error(`Failed to create campaign: ${error?.message || 'Database error'}`);
    }

    return this.getCampaign(data.id);
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const wsId = this.getWorkspaceId();
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.stats !== undefined) payload.stats = updates.stats;
    if (updates.dailyLimit !== undefined) payload.daily_limit = updates.dailyLimit;

    const { error } = await supabase
      .from('campaigns')
      .update(payload)
      .eq('workspace_id', wsId)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update campaign: ${error.message}`);
    }
    return this.getCampaign(id);
  }

  // PROSPECTS
  async getProspects(filters?: any): Promise<Prospect[]> {
    let wsId: string;
    try {
      wsId = this.getWorkspaceId();
    } catch {
      return [];
    }

    let query = supabase
      .from('prospects')
      .select('*')
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.campaignId) {
      query = query.eq('campaign_id', filters.campaignId);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to load prospects: ${error.message}`);
    }
    if (!data) return [];

    return data.map((p) => this.mapDbProspectToProspect(p));
  }

  async getProspect(id: string): Promise<Prospect> {
    const wsId = this.getWorkspaceId();
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('workspace_id', wsId)
      .eq('id', id)
      .single();

    if (error || !data) throw new Error(`Prospect not found: ${error?.message || 'Not found'}`);
    return this.mapDbProspectToProspect(data);
  }

  async updateProspectStatus(id: string, status: Prospect['status']): Promise<Prospect> {
    const wsId = this.getWorkspaceId();
    const { error } = await supabase
      .from('prospects')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('workspace_id', wsId)
      .eq('id', id);

    if (error) throw new Error(`Failed to update prospect status: ${error.message}`);
    return this.getProspect(id);
  }

  async addProspectsToCampaign(prospectIds: string[], campaignId: string): Promise<void> {
    const wsId = this.getWorkspaceId();
    const campaign = await this.getCampaign(campaignId);

    const { error } = await supabase
      .from('prospects')
      .update({
        campaign_id: campaignId,
        campaign_name: campaign.name,
        status: 'in_sequence',
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', wsId)
      .in('id', prospectIds);

    if (error) throw new Error(`Failed to add prospects to campaign: ${error.message}`);

    const updatedProspectsCount = (campaign.stats.prospects || 0) + prospectIds.length;
    await this.updateCampaign(campaignId, {
      stats: { ...campaign.stats, prospects: updatedProspectsCount }
    });
  }

  async addResearchedProspect(result: CompanyResearchResult, campaignId?: string): Promise<Prospect> {
    const wsId = this.getWorkspaceId();
    let campaignName = undefined;
    if (campaignId) {
      const c = await this.getCampaign(campaignId);
      campaignName = c.name;
    }

    const newProspectData = {
      workspace_id: wsId,
      campaign_id: campaignId || null,
      campaign_name: campaignName || null,
      company_name: result.companyName,
      domain: result.domain,
      contact_name: result.decisionMaker.name,
      contact_role: result.decisionMaker.role,
      contact_email: result.decisionMaker.email,
      verified: result.decisionMaker.verified,
      fit_score: result.score,
      status: campaignId ? 'in_sequence' : 'ready',
      primary_problem: result.observations[0]?.issue || 'Conversion friction',
      evidence: result.observations[0]?.evidence || 'Live site DOM analysis',
      source: 'AI Research Lab',
      source_url: `https://${result.domain}`,
      discovered_at: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('prospects')
      .insert(newProspectData)
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Failed to create prospect: ${error?.message || 'Database error'}`);
    }

    return this.mapDbProspectToProspect(created);
  }

  // INBOX
  async getInboxThreads(): Promise<InboxThread[]> {
    let wsId: string;
    try {
      wsId = this.getWorkspaceId();
    } catch {
      return [];
    }

    const { data, error } = await supabase
      .from('inbox_threads')
      .select('*')
      .eq('workspace_id', wsId)
      .order('last_message_at', { ascending: false });

    if (error) throw new Error(`Failed to load inbox: ${error.message}`);
    if (!data) return [];

    return data.map((t) => ({
      id: t.id,
      prospectId: t.prospect_id,
      prospectName: t.prospect_name,
      prospectRole: t.prospect_role,
      companyName: t.company_name,
      companyDomain: t.company_domain,
      email: t.email || `contact@${t.company_domain || 'domain.com'}`,
      subject: t.subject || 'Outreach Discussion',
      classification: t.classification || 'interested',
      lastMessageSnippet: t.last_message_snippet || 'Let us know if you have time for a call.',
      timestamp: t.last_message_at || new Date().toISOString(),
      unread: t.unread ?? true,
      category: t.classification === 'interested' ? 'interested' : 'all',
      messages: t.messages || [
        {
          id: `m-1`,
          sender: 'prospect',
          from: t.prospect_name,
          timestamp: t.last_message_at || new Date().toISOString(),
          body: t.last_message_snippet || 'Thanks for reaching out.',
        },
      ],
      suggestedReply: t.suggested_reply || {
        text: 'Thanks for replying! Would Tuesday or Thursday work better for a brief 15-min chat?',
        rationale: 'High buying signal detected. Propose concrete time slots.',
      },
    }));
  }

  async sendReply(threadId: string, body: string): Promise<InboxThread> {
    const wsId = this.getWorkspaceId();
    const res = await fetch(`/api/mailboxes/gmail/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, body }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.thread;
    }

    // Direct DB update fallback
    const { error } = await supabase
      .from('inbox_threads')
      .update({
        unread: false,
        last_message_at: new Date().toISOString(),
      })
      .eq('workspace_id', wsId)
      .eq('id', threadId);

    if (error) throw new Error(`Failed to send reply: ${error.message}`);

    const threads = await this.getInboxThreads();
    return threads.find((t) => t.id === threadId)!;
  }

  // SEQUENCES
  async getSequences(): Promise<Sequence[]> {
    let wsId: string;
    try {
      wsId = this.getWorkspaceId();
    } catch {
      return [];
    }

    const { data, error } = await supabase
      .from('sequences')
      .select('*, sequence_steps(*)')
      .eq('workspace_id', wsId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to load sequences: ${error.message}`);
    if (!data) return [];

    return data.map((s) => ({
      id: s.id,
      name: s.name,
      templateType: s.template_type,
      steps: (s.sequence_steps || []).map((step: any) => ({
        id: step.id,
        stepNumber: step.step_number,
        type: step.type,
        name: step.name,
        subject: step.subject,
        bodyPreview: step.body_preview,
        body: step.body,
        delayDays: step.delay_days,
        active: step.active,
        replyRate: step.reply_rate,
        channel: step.channel,
        isAvailable: true,
      })),
    }));
  }

  async updateSequenceStep(sequenceId: string, stepId: string, updates: any): Promise<Sequence> {
    const { error } = await supabase.from('sequence_steps').update(updates).eq('id', stepId);
    if (error) throw new Error(`Failed to update step: ${error.message}`);
    const sequences = await this.getSequences();
    return sequences.find((s) => s.id === sequenceId)!;
  }

  // NEEDS ATTENTION
  async getNeedsAttention(): Promise<NeedsAttentionItem[]> {
    const threads = await this.getInboxThreads();
    const interested = threads.filter((t) => t.classification === 'interested');

    return interested.map((t) => ({
      id: `att-${t.id}`,
      type: 'reply' as const,
      title: `High Intent Reply: ${t.companyName}`,
      description: `${t.prospectName} (${t.prospectRole}) requested details on "${t.subject || 'Outreach'}".`,
      actionText: 'Review Reply',
      targetTab: 'inbox',
    }));
  }

  // AI & DISCOVERY
  async discoverProspects(criteria: any): Promise<Prospect[]> {
    const res = await fetch('/api/discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria),
    });

    if (res.ok) {
      const data = await res.json();
      return data.prospects;
    }
    return [];
  }

  async researchCompany(domain: string, role?: string): Promise<CompanyResearchResult> {
    const res = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, role }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.result;
    }

    throw new Error('Failed to complete AI research');
  }

  async generatePersonalizedEmail(prospectId: string, campaignId: string): Promise<any> {
    const res = await fetch('/api/draft-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospectId, campaignId }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.email;
    }

    return {
      subject: 'Quick question for your team',
      body: 'Hi, noticed your recent growth and thought of a quick optimization angle.',
    };
  }
}
