import { supabase } from '../supabase';
import { ApiClient, ManualProspectInput } from './types';
import { Campaign, Prospect, InboxThread, NeedsAttentionItem, Sequence, CompanyResearchResult, ProspectStatus } from '../../types';

export class SupabaseApiClient implements ApiClient {
  private getWorkspaceId(): string {
    const wsId = localStorage.getItem('outbound_workspace_id');
    if (!wsId) {
      throw new Error('No active workspace selected. Please select or create a workspace.');
    }
    return wsId;
  }

  private mapDbStatusToApp(status: string): ProspectStatus {
    if (status === 'discovered') return 'ready';
    if (status === 'opt_out') return 'not_interested';
    if (status === 'bounced') return 'unverified';
    if (['ready', 'in_sequence', 'contacted', 'interested', 'not_interested', 'unverified'].includes(status)) {
      return status as ProspectStatus;
    }
    return 'ready';
  }

  private mapAppStatusToDb(status: ProspectStatus): string {
    if (status === 'not_interested') return 'opt_out';
    if (status === 'unverified') return 'bounced';
    return status;
  }

  private mapDbProspectToProspect(p: any): Prospect {
    const statusVal: ProspectStatus = this.mapDbStatusToApp(p.status || 'ready');
    const contactEmail = p.contact_email || '';
    const domain = p.domain || '';

    return {
      id: p.id,
      companyId: p.company_id || `comp-${p.id}`,
      company: {
        id: p.company_id || `comp-${p.id}`,
        name: p.company_name || 'Target Account',
        domain: domain,
        industry: p.industry || 'Business Services',
        location: p.location || 'United States',
        city: p.city || '',
        state: p.state || '',
        country: p.country || 'USA',
        employeeCount: p.employee_count || '10-50',
        websiteUrl: p.source_url || (domain ? `https://${domain}` : ''),
        websiteQualityScore: p.fit_score || 70,
        description: p.evidence || 'Target prospect account',
      },
      contact: {
        id: `cnt-${p.id}`,
        fullName: p.contact_name || 'Prospect Contact',
        firstName: (p.contact_name || 'Prospect').split(' ')[0],
        lastName: (p.contact_name || '').split(' ').slice(1).join(' ') || '',
        role: p.contact_role || 'Decision Maker',
        email: contactEmail,
        emailVerified: Boolean(p.verified || (contactEmail && contactEmail.includes('@'))),
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
      research: {
        summary: p.evidence || 'Analyzed target website and domain signals.',
        whyTheyFit: ['Matches ICP criteria'],
        websiteOpportunities: [
          {
            id: 'opp-1',
            issue: p.primary_problem || 'Conversion friction',
            detail: p.evidence || 'Audit highlights optimization potential.',
            sourceUrl: p.source_url || (domain ? `https://${domain}` : ''),
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
    if (!supabase) return [];
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
    if (!supabase) throw new Error('Supabase client not initialized');
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

  async createCampaign(campaign: Partial<Campaign>, prospects?: Prospect[]): Promise<Campaign> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const wsId = this.getWorkspaceId();

    if (campaign.status === 'active') {
      const { data: connectedMailboxes, error: mbError } = await supabase
        .from('mailboxes')
        .select('id')
        .eq('workspace_id', wsId)
        .eq('status', 'connected');
      
      if (mbError || !connectedMailboxes || connectedMailboxes.length === 0) {
        throw new Error('Active campaigns cannot be created without a connected sending mailbox. Please save as a draft or connect your Gmail first under Integrations.');
      }
    }

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

    const campaignId = data.id;

    if (prospects && prospects.length > 0) {
      const dbProspects = prospects.map((p) => {
        const contactEmail = p.contact?.email || '';
        return {
          workspace_id: wsId,
          campaign_id: campaignId,
          company_name: p.company?.name || 'Target Account',
          domain: p.company?.domain || '',
          contact_name: p.contact?.fullName || 'Contact',
          contact_role: p.contact?.role || 'Executive',
          contact_email: contactEmail || null,
          verified: Boolean(p.contact?.emailVerified || contactEmail.includes('@')),
          fit_score: p.fitScore || 75,
          status: 'in_sequence',
          primary_problem: p.primaryProblem || 'Website conversion friction',
          evidence: p.company?.description || p.research?.summary || 'Discovered during campaign creation',
          source: (p as any).source || 'Discovery Engine',
          source_url: p.company?.websiteUrl || (p.company?.domain ? `https://${p.company.domain}` : ''),
          discovered_at: p.createdAt || new Date().toISOString(),
        };
      });

      const { error: insertError } = await supabase.from('prospects').insert(dbProspects);
      if (insertError) {
        console.error('Failed to enroll discovered prospects:', insertError.message);
        // Rollback campaign creation to ensure atomicity
        await supabase.from('campaigns').delete().eq('id', campaignId);
        throw new Error(`Failed to enroll prospects: ${insertError.message}. Campaign creation rolled back.`);
      } else {
        // Update stats on the campaign
        const { count } = await supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', wsId)
          .eq('campaign_id', campaignId);
        
        if (count !== null && count > 0) {
          await supabase
            .from('campaigns')
            .update({
              stats: {
                ...newCamp.stats,
                prospects: count,
              }
            })
            .eq('id', campaignId);
        }
      }
    }

    return this.getCampaign(campaignId);
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const wsId = this.getWorkspaceId();

    if (updates.status === 'active') {
      const { data: connectedMailboxes, error: mbError } = await supabase
        .from('mailboxes')
        .select('id')
        .eq('workspace_id', wsId)
        .eq('status', 'connected');
      
      if (mbError || !connectedMailboxes || connectedMailboxes.length === 0) {
        throw new Error('Active campaigns cannot be started without a connected sending mailbox. Please go to Integrations to connect your Gmail.');
      }
    }

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
    if (!supabase) return [];
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
      const dbStatus = this.mapAppStatusToDb(filters.status);
      query = query.eq('status', dbStatus);
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
    if (!supabase) throw new Error('Supabase client not initialized');
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
    if (!supabase) throw new Error('Supabase client not initialized');
    const wsId = this.getWorkspaceId();
    const dbStatus = this.mapAppStatusToDb(status);
    const { error } = await supabase
      .from('prospects')
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq('workspace_id', wsId)
      .eq('id', id);

    if (error) throw new Error(`Failed to update prospect status: ${error.message}`);
    return this.getProspect(id);
  }

  async addProspectsToCampaign(prospectIds: string[], campaignId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const wsId = this.getWorkspaceId();
    const campaign = await this.getCampaign(campaignId);

    const { error } = await supabase
      .from('prospects')
      .update({
        campaign_id: campaignId,
        status: 'in_sequence',
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', wsId)
      .in('id', prospectIds);

    if (error) throw new Error(`Failed to add prospects to campaign: ${error.message}`);

    const { count } = await supabase
      .from('prospects')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', wsId)
      .eq('campaign_id', campaignId);

    const updatedProspectsCount = count ?? ((campaign.stats.prospects || 0) + prospectIds.length);
    await this.updateCampaign(campaignId, {
      stats: { ...campaign.stats, prospects: updatedProspectsCount }
    });
  }

  async addResearchedProspect(result: CompanyResearchResult, campaignId?: string): Promise<Prospect> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const wsId = this.getWorkspaceId();

    // Prevent duplicate prospects by workspace and domain
    const { data: existing } = await supabase
      .from('prospects')
      .select('id')
      .eq('workspace_id', wsId)
      .eq('domain', result.domain)
      .maybeSingle();

    if (existing) {
      if (campaignId) {
        await this.addProspectsToCampaign([existing.id], campaignId);
      }
      return this.getProspect(existing.id);
    }

    const newProspectData = {
      workspace_id: wsId,
      campaign_id: campaignId || null,
      company_name: result.companyName,
      domain: result.domain,
      contact_name: result.decisionMaker?.name || 'Contact',
      contact_role: result.decisionMaker?.role || 'Executive',
      contact_email: result.decisionMaker?.email || null,
      verified: Boolean(result.decisionMaker?.verified),
      fit_score: result.score || 75,
      status: campaignId ? 'in_sequence' : 'ready',
      primary_problem: result.observations?.[0]?.issue || 'Conversion friction',
      evidence: result.observations?.[0]?.evidence || 'Live site analysis',
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

    if (campaignId) {
      const campaign = await this.getCampaign(campaignId);
      await this.updateCampaign(campaignId, {
        stats: { ...campaign.stats, prospects: (campaign.stats.prospects || 0) + 1 }
      });
    }

    return this.mapDbProspectToProspect(created);
  }

  async addManualProspect(input: ManualProspectInput): Promise<Prospect> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const wsId = this.getWorkspaceId();
    const cleanDomain = input.domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    // Duplicate check
    const { data: existing } = await supabase
      .from('prospects')
      .select('id')
      .eq('workspace_id', wsId)
      .eq('domain', cleanDomain)
      .maybeSingle();

    if (existing) {
      throw new Error(`A prospect with domain "${cleanDomain}" already exists in this workspace.`);
    }

    const newProspectData = {
      workspace_id: wsId,
      campaign_id: input.campaignId || null,
      company_name: input.companyName.trim(),
      domain: cleanDomain,
      contact_name: input.contactName.trim(),
      contact_role: input.contactRole?.trim() || 'Decision Maker',
      contact_email: input.contactEmail?.trim() || null,
      verified: Boolean(input.contactEmail?.includes('@')),
      fit_score: input.fitScore || 75,
      status: input.campaignId ? 'in_sequence' : 'ready',
      primary_problem: input.primaryProblem?.trim() || 'Target commercial account',
      evidence: `Manually added to workspace. ${input.industry || ''} • ${input.location || ''}`.trim(),
      source: 'Manual Verification',
      source_url: `https://${cleanDomain}`,
      discovered_at: new Date().toISOString(),
    };

    const { data: created, error } = await supabase
      .from('prospects')
      .insert(newProspectData)
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Failed to add prospect: ${error?.message || 'Database error'}`);
    }

    if (input.campaignId) {
      const campaign = await this.getCampaign(input.campaignId);
      await this.updateCampaign(input.campaignId, {
        stats: { ...campaign.stats, prospects: (campaign.stats.prospects || 0) + 1 }
      });
    }

    return this.mapDbProspectToProspect(created);
  }

  // INBOX
  async getInboxThreads(): Promise<InboxThread[]> {
    if (!supabase) return [];
    let wsId: string;
    try {
      wsId = this.getWorkspaceId();
    } catch {
      return [];
    }

    const { data, error } = await supabase
      .from('inbox_threads')
      .select('*, prospects(*), email_messages(*)')
      .eq('workspace_id', wsId)
      .order('last_message_at', { ascending: false });

    if (error) {
      // If table is empty or error, don't throw mock data, return empty array
      console.warn('Inbox query notice:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    return data.map((t) => {
      const p = t.prospects;
      const prospectName = p?.contact_name || 'Prospect Contact';
      const prospectRole = p?.contact_role || 'Executive';
      const companyName = p?.company_name || 'Target Account';
      const companyDomain = p?.domain || '';
      const email = p?.contact_email || '';

      const messages = (t.email_messages && t.email_messages.length > 0)
        ? [...t.email_messages]
            .sort((a, b) => new Date(a.created_at || a.sent_at || 0).getTime() - new Date(b.created_at || b.sent_at || 0).getTime())
            .map((m: any) => ({
              id: m.id,
              sender: (m.sender === 'user' || m.status === 'sent' || m.direction === 'outbound') ? ('user' as const) : ('prospect' as const),
              from: m.sender || prospectName,
              timestamp: (m.sent_at || m.created_at) ? new Date(m.sent_at || m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              body: m.body || m.body_text || '',
            }))
        : [
            {
              id: `m-${t.id}`,
              sender: 'prospect' as const,
              from: prospectName,
              timestamp: t.last_message_at ? new Date(t.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
              body: t.last_message_snippet || 'No message content available.',
            },
          ];

      return {
        id: t.id,
        prospectId: t.prospect_id,
        prospectName,
        prospectRole,
        companyName,
        companyDomain,
        email,
        subject: 'Outreach Follow-up',
        classification: (t.classification === 'interested' || t.classification === 'meeting_requested')
          ? 'interested'
          : (t.classification === 'not_interested' || t.classification === 'unsubscribe')
          ? 'not_interested'
          : 'follow_up',
        rawClassification: t.classification,
        lastMessageSnippet: t.last_message_snippet || '',
        timestamp: t.last_message_at ? new Date(t.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently',
        unread: t.unread ?? false,
        category: t.classification === 'interested' ? 'interested' : 'all',
        messages,
        suggestedReply: {
          text: 'Thanks for getting back to me. Would you have 15 minutes this week for a brief review?',
          rationale: 'Positive engagement detected. Recommend suggesting specific availability.',
        },
      };
    });
  }

  async sendReply(threadId: string, body: string): Promise<InboxThread> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const wsId = this.getWorkspaceId();

    // Check thread to get prospect info
    const { data: threadRow } = await supabase
      .from('inbox_threads')
      .select('*, prospects(*)')
      .eq('id', threadId)
      .single();

    const recipientEmail = threadRow?.prospects?.contact_email || 'prospect@account.com';
    const prospectId = threadRow?.prospect_id;

    // Save outbound email into email_messages
    await supabase.from('email_messages').insert({
      workspace_id: wsId,
      thread_id: threadId,
      prospect_id: prospectId,
      sender: 'user',
      recipient: recipientEmail,
      subject: 'Re: Outreach Follow-up',
      body: body,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    // Update thread in database
    await supabase
      .from('inbox_threads')
      .update({
        unread: false,
        last_message_snippet: body.slice(0, 140),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', wsId)
      .eq('id', threadId);

    const threads = await this.getInboxThreads();
    const updated = threads.find((t) => t.id === threadId);
    if (!updated) throw new Error('Thread not found after update');
    return updated;
  }

  async updateThreadClassification(threadId: string, classification: string): Promise<InboxThread> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const wsId = this.getWorkspaceId();

    await supabase
      .from('inbox_threads')
      .update({
        classification,
        updated_at: new Date().toISOString(),
      })
      .eq('workspace_id', wsId)
      .eq('id', threadId);

    const threads = await this.getInboxThreads();
    const updated = threads.find((t) => t.id === threadId);
    if (!updated) throw new Error('Thread not found after classification update');
    return updated;
  }

  // SEQUENCES
  async getSequences(): Promise<Sequence[]> {
    if (!supabase) return [];
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

    if (error) {
      console.warn('Sequences query notice:', error.message);
      return [];
    }
    if (!data) return [];

    return data.map((s) => ({
      id: s.id,
      name: s.name,
      templateType: s.template_type || 'Value-led',
      steps: ((s.sequence_steps || []) as any[])
        .sort((a, b) => (a.step_number || 0) - (b.step_number || 0))
        .map((step: any) => ({
          id: step.id,
          stepNumber: step.step_number,
          type: 'email' as const,
          name: step.name,
          subject: step.subject,
          bodyPreview: (step.body || '').slice(0, 60),
          body: step.body,
          delayDays: step.delay_days ?? 3,
          active: step.active ?? true,
          replyRate: step.reply_rate || '0%',
          channel: 'email' as const,
          isAvailable: true,
        })),
    }));
  }

  async createSequence(name: string, templateType = 'Value-led', steps: any[] = []): Promise<Sequence> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const wsId = this.getWorkspaceId();

    const { data: seq, error: seqError } = await supabase
      .from('sequences')
      .insert({
        workspace_id: wsId,
        name,
        template_type: templateType,
        status: 'active',
      })
      .select()
      .single();

    if (seqError || !seq) throw new Error(`Failed to create sequence: ${seqError?.message}`);

    const defaultSteps = steps.length > 0 ? steps : [
      {
        name: 'Initial Value-Led Email',
        subject: 'Quick question regarding {{company.name}}',
        body: 'Hi {{contact.first_name}},\n\nNoticed {{primary_opportunity}} on your website.\n\nWould you be open to a quick comparison?\n\nBest,\n[Your Name]',
        delayDays: 0,
      },
      {
        name: 'Follow-up with Relevant Angle',
        subject: 'Following up / {{company.name}}',
        body: 'Hi {{contact.first_name}},\n\nWanted to float this to the top of your inbox.\n\nLet me know if this is relevant to your team right now.',
        delayDays: 3,
      },
      {
        name: 'Final Check-in',
        subject: 'Closing the loop',
        body: 'Hi {{contact.first_name}},\n\nAssuming this is not a priority right now. Will check back next quarter.\n\nBest regards,',
        delayDays: 5,
      },
    ];

    const stepRows = defaultSteps.map((st, idx) => ({
      sequence_id: seq.id,
      step_number: idx + 1,
      name: st.name || `Step ${idx + 1}`,
      subject: st.subject || 'Outreach note',
      body: st.body || '',
      delay_days: st.delayDays ?? 3,
      active: true,
      reply_rate: '0%',
      channel: 'email',
    }));

    const { error: stepsError } = await supabase.from('sequence_steps').insert(stepRows);
    if (stepsError) throw new Error(`Failed to insert sequence steps: ${stepsError.message}`);

    const sequences = await this.getSequences();
    return sequences.find((s) => s.id === seq.id)!;
  }

  async updateSequenceStep(sequenceId: string, stepId: string, updates: any): Promise<Sequence> {
    if (!supabase) throw new Error('Supabase client not initialized');
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.subject !== undefined) payload.subject = updates.subject;
    if (updates.body !== undefined) payload.body = updates.body;
    if (updates.delayDays !== undefined) payload.delay_days = updates.delayDays;
    if (updates.active !== undefined) payload.active = updates.active;

    const { error } = await supabase.from('sequence_steps').update(payload).eq('id', stepId);
    if (error) throw new Error(`Failed to update step: ${error.message}`);
    const sequences = await this.getSequences();
    const found = sequences.find((s) => s.id === sequenceId);
    if (!found) throw new Error('Sequence not found after update');
    return found;
  }

  async addSequenceStep(sequenceId: string, step: any): Promise<Sequence> {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    // Determine the current step number
    const { data: existingSteps } = await supabase
      .from('sequence_steps')
      .select('step_number')
      .eq('sequence_id', sequenceId)
      .order('step_number', { ascending: false });

    const maxStep = existingSteps && existingSteps.length > 0 ? (existingSteps[0].step_number || 0) : 0;
    const nextStepNum = maxStep + 1;

    const { error } = await supabase.from('sequence_steps').insert({
      sequence_id: sequenceId,
      step_number: nextStepNum,
      name: step.name || `Step ${nextStepNum} • Follow-up`,
      subject: step.subject || 'Follow-up note',
      body: step.body || '',
      delay_days: step.delayDays ?? 3,
      active: true,
      reply_rate: '0%',
      channel: 'email',
    });

    if (error) throw new Error(`Failed to add sequence step: ${error.message}`);

    const sequences = await this.getSequences();
    const found = sequences.find((s) => s.id === sequenceId);
    if (!found) throw new Error('Sequence not found after add');
    return found;
  }

  // NEEDS ATTENTION
  async getNeedsAttention(): Promise<NeedsAttentionItem[]> {
    const threads = await this.getInboxThreads();
    const interested = threads.filter((t) => t.classification === 'interested');

    return interested.map((t) => ({
      id: `att-${t.id}`,
      type: 'reply' as const,
      title: `High Intent Reply: ${t.companyName}`,
      description: `${t.prospectName} (${t.prospectRole}) replied to your outreach.`,
      actionText: 'Review Reply',
      targetTab: 'inbox',
    }));
  }

  // AI & DISCOVERY
  async discoverProspects(criteria: any): Promise<Prospect[]> {
    try {
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria),
      });

      if (!res.ok) {
        const error: any = new Error('Discovery provider not connected');
        error.code = 'PROVIDER_UNAVAILABLE';
        throw error;
      }

      const data = await res.json();
      if (!data.prospects || !Array.isArray(data.prospects)) return [];
      
      // Map API response to Prospect type shape
      return data.prospects.map((p: any) => {
        return {
          id: p.id || `disc-${Date.now()}-${Math.random()}`,
          companyId: p.companyId || `comp-${p.id}`,
          company: {
            id: p.company?.id || `comp-${p.id}`,
            name: p.company?.name || 'Target Account',
            domain: p.company?.domain || '',
            industry: p.company?.industry || criteria.industry || 'Business Services',
            location: p.company?.location || criteria.geography || 'United States',
            city: p.company?.city || '',
            state: p.company?.state || '',
            country: p.company?.country || 'USA',
            employeeCount: p.company?.employeeCount || '10-50',
            websiteUrl: p.company?.websiteUrl || (p.company?.domain ? `https://${p.company.domain}` : ''),
            websiteQualityScore: p.company?.websiteQualityScore || p.fitScore || 70,
            description: p.company?.description || p.evidence || 'Target prospect account',
          },
          contact: {
            id: p.contact?.id || `cnt-${p.id}`,
            fullName: p.contact?.fullName || 'Prospect Contact',
            firstName: p.contact?.firstName || (p.contact?.fullName || 'Prospect').split(' ')[0],
            lastName: p.contact?.lastName || (p.contact?.fullName || '').split(' ').slice(1).join(' ') || '',
            role: p.contact?.role || 'Decision Maker',
            email: p.contact?.email || '',
            emailVerified: Boolean(p.contact?.emailVerified || p.contact?.email?.includes('@')),
          },
          fitScore: p.fitScore || 70,
          fitScoreBreakdown: p.fitScoreBreakdown || {
            businessRelevance: 20,
            commercialValue: 15,
            websiteOpportunity: 15,
            activity: 10,
            contactability: 5,
            digitalPresence: 5,
          },
          fitLabel: p.fitScore >= 85 ? 'Excellent fit' : p.fitScore >= 75 ? 'Strong fit' : 'Moderate fit',
          primaryProblem: p.primaryProblem || 'Website conversion friction',
          status: 'ready',
          campaignId: p.campaignId,
          research: p.research || {
            summary: p.evidence || 'Analyzed target website and domain signals.',
            whyTheyFit: ['Matches ICP criteria'],
            websiteOpportunities: [
              {
                id: 'opp-1',
                issue: p.primaryProblem || 'Conversion friction',
                detail: p.evidence || 'Audit highlights optimization potential.',
                sourceUrl: p.sourceUrl || (p.company?.domain ? `https://${p.company.domain}` : ''),
              },
            ],
            techStack: [],
            recentSignals: [],
            suggestedAngle: 'Focus on clear conversion improvements.',
          },
          generatedEmail: p.generatedEmail || {
            subject: `Quick idea for ${p.company?.name || 'your team'}`,
            body: `Hi ${p.contact?.firstName || (p.contact?.fullName || '').split(' ')[0] || 'there'},\n\nNoticed ${p.company?.name || 'your company'} is growing. Thought of a quick way to improve conversions.\n\nBest,\n[Your Name]`,
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
              type: 'discovered' as const,
              title: 'Prospect Discovered',
              timestamp: p.discoveredAt || new Date().toISOString(),
            },
          ],
          createdAt: p.discoveredAt || new Date().toISOString(),
        };
      });
    } catch (err: any) {
      const error: any = new Error('Discovery provider not connected. Live commercial registry discovery requires an active backend provider.');
      error.code = 'PROVIDER_UNAVAILABLE';
      throw error;
    }
  }

  async researchCompany(domain: string, role?: string): Promise<CompanyResearchResult> {
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, role }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.result;
      }
    } catch {
      // Fall through to error
    }

    throw new Error('Research provider not connected. Domain inspection requires a live backend service.');
  }

  async generatePersonalizedEmail(_prospectId: string, _campaignId: string): Promise<any> {
    try {
      const res = await fetch('/api/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId: _prospectId, campaignId: _campaignId }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.email;
      }
    } catch {
      // Fall through
    }

    return {
      subject: 'Outreach Follow-up',
      body: 'Hi, reaching out regarding your current conversion pipeline.',
    };
  }
}
