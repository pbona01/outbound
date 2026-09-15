import { ApiClient } from './types';
import { AppStorageData, storage } from '../storage';
import { Campaign, Prospect, InboxThread, NeedsAttentionItem, Sequence, CompanyResearchResult } from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiClient implements ApiClient {
  private get data(): AppStorageData {
    return storage.get();
  }

  private save(data: AppStorageData) {
    storage.set(data);
  }

  async getCampaigns(): Promise<Campaign[]> {
    await delay(300);
    return this.data.campaigns;
  }

  async getCampaign(id: string): Promise<Campaign> {
    await delay(200);
    const c = this.data.campaigns.find(c => c.id === id);
    if (!c) throw new Error('Campaign not found');
    return c;
  }

  async createCampaign(data: Partial<Campaign>, prospects?: Prospect[]): Promise<Campaign> {
    await delay(500);
    const state = this.data;
    const newCampaignId = `camp-${Date.now()}`;
    const newCampaignName = data.name || 'Untitled Campaign';

    // Find available unassigned prospects to enroll
    const unassigned = state.prospects.filter(p => !p.campaignId);
    const toAssign = unassigned.slice(0, 4);
    toAssign.forEach(p => {
      p.campaignId = newCampaignId;
      p.campaignName = newCampaignName;
      p.status = 'in_sequence';
    });

    const newCampaign: Campaign = {
      id: newCampaignId,
      name: newCampaignName,
      status: data.status || 'draft',
      audienceQuery: data.audienceQuery || '',
      targetIndustry: data.targetIndustry || '',
      targetGeography: data.targetGeography || '',
      stats: {
        prospects: toAssign.length,
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
    state.campaigns = [newCampaign, ...state.campaigns];
    this.save(state);
    return newCampaign;
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    await delay(200);
    const state = this.data;
    const index = state.campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    state.campaigns[index] = { ...state.campaigns[index], ...updates };
    this.save(state);
    return state.campaigns[index];
  }

  async getProspects(filters?: any): Promise<Prospect[]> {
    await delay(400);
    return this.data.prospects;
  }

  async getProspect(id: string): Promise<Prospect> {
    await delay(200);
    const p = this.data.prospects.find(p => p.id === id);
    if (!p) throw new Error('Prospect not found');
    return p;
  }

  async updateProspectStatus(id: string, status: Prospect['status']): Promise<Prospect> {
    await delay(200);
    const state = this.data;
    const index = state.prospects.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Prospect not found');
    state.prospects[index] = { ...state.prospects[index], status };
    this.save(state);
    return state.prospects[index];
  }

  async addProspectsToCampaign(prospectIds: string[], campaignId: string): Promise<void> {
    await delay(300);
    const state = this.data;
    const campaign = state.campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    prospectIds.forEach(id => {
      const pIndex = state.prospects.findIndex(p => p.id === id);
      if (pIndex !== -1) {
        state.prospects[pIndex] = {
          ...state.prospects[pIndex],
          campaignId: campaign.id,
          campaignName: campaign.name,
          status: 'in_sequence'
        };
      }
    });

    // Update campaign stats roughly (mock)
    campaign.stats.prospects += prospectIds.length;
    
    this.save(state);
  }

  async getInboxThreads(): Promise<InboxThread[]> {
    await delay(300);
    return this.data.inboxThreads;
  }

  async sendReply(threadId: string, body: string): Promise<InboxThread> {
    await delay(500);
    const state = this.data;
    const index = state.inboxThreads.findIndex(t => t.id === threadId);
    if (index === -1) throw new Error('Thread not found');
    
    const thread = state.inboxThreads[index];
    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user' as const,
      from: 'alex@growthstudio.co',
      timestamp: new Date().toISOString(),
      body
    };

    thread.messages.push(newMessage);
    thread.unread = false;
    thread.lastMessageSnippet = body.substring(0, 50) + (body.length > 50 ? '...' : '');
    
    state.inboxThreads[index] = { ...thread };
    this.save(state);
    return state.inboxThreads[index];
  }

  async updateThreadClassification(threadId: string, classification: string): Promise<InboxThread> {
    await delay(200);
    const state = this.data;
    const index = state.inboxThreads.findIndex(t => t.id === threadId);
    if (index === -1) throw new Error('Thread not found');

    const thread = state.inboxThreads[index];
    thread.classification = classification as any;
    state.inboxThreads[index] = { ...thread };
    this.save(state);
    return state.inboxThreads[index];
  }

  async getSequences(): Promise<Sequence[]> {
    await delay(200);
    const state = this.data;
    // For now, let's create a default sequence if none exist
    if (state.sequences.length === 0) {
      state.sequences = [{
        id: 'seq-1',
        name: 'Default Outbound Sequence',
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            name: 'Initial Value-Led Outreach',
            subject: 'Quick idea for {{company.name}}',
            delayDays: 0,
            description: 'Cites specific mobile UX friction or portfolio conversion gap and offers a visual mockup.',
            replyRate: '5.8%',
            active: true,
            body: 'Hey {{prospect.firstName}},\n\nI was looking at your portfolio and had a quick idea...'
          },
          {
            id: 'step-2',
            stepNumber: 2,
            name: 'Figma Mockup Walkthrough Follow-up',
            subject: 'Re: Quick idea for {{company.name}}',
            delayDays: 3,
            description: 'Sends short 90-second video walkthrough illustrating the 1-click consultation flow.',
            replyRate: '3.4%',
            active: true,
            body: 'Just bubbling this up in case you missed it. I recorded a quick 90s video...'
          }
        ]
      }];
      this.save(state);
    }
    return state.sequences;
  }

  async updateSequenceStep(sequenceId: string, stepId: string, updates: any): Promise<Sequence> {
    await delay(200);
    const state = this.data;
    const seqIndex = state.sequences.findIndex(s => s.id === sequenceId);
    if (seqIndex === -1) throw new Error('Sequence not found');

    const seq = state.sequences[seqIndex];
    const stepIndex = seq.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) throw new Error('Step not found');

    seq.steps[stepIndex] = { ...seq.steps[stepIndex], ...updates };
    state.sequences[seqIndex] = { ...seq };
    this.save(state);
    return seq;
  }

  async addSequenceStep(sequenceId: string, step: any): Promise<Sequence> {
    await delay(200);
    const state = this.data;
    const seqIndex = state.sequences.findIndex(s => s.id === sequenceId);
    if (seqIndex === -1) throw new Error('Sequence not found');

    const seq = state.sequences[seqIndex];
    const newStep = {
      id: `step-${Date.now()}`,
      stepNumber: seq.steps.length + 1,
      type: 'email' as const,
      name: step.name || `Step ${seq.steps.length + 1}`,
      subject: step.subject || 'Follow-up message',
      body: step.body || '',
      delayDays: step.delayDays ?? 3,
      active: true,
      replyRate: '0%',
      channel: 'email' as const,
      isAvailable: true,
    };
    seq.steps.push(newStep);
    state.sequences[seqIndex] = { ...seq };
    this.save(state);
    return seq;
  }

  async getNeedsAttention(): Promise<NeedsAttentionItem[]> {
    await delay(200);
    return this.data.needsAttention;
  }

  async discoverProspects(_criteria: any): Promise<Prospect[]> {
    await delay(1200);
    return this.data.prospects;
  }

  async researchCompany(rawInput: string, role?: string): Promise<CompanyResearchResult> {
    await delay(1000);
    const state = this.data;
    const cleanDomain = rawInput
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .toLowerCase()
      .trim();

    // Check if domain matches an existing prospect
    const existing = state.prospects.find(
      p => p.company.domain.toLowerCase() === cleanDomain || p.company.websiteUrl.toLowerCase().includes(cleanDomain)
    );

    if (existing) {
      return {
        companyName: existing.company.name,
        domain: existing.company.domain,
        industry: existing.company.industry,
        location: existing.company.location,
        decisionMaker: {
          name: existing.contact.fullName,
          role: role || existing.contact.role,
          email: existing.contact.email,
          verified: existing.contact.emailVerified,
        },
        score: existing.fitScore,
        techStack: existing.research.techStack.length > 0
          ? existing.research.techStack
          : ['WordPress', 'Google Tag Manager', 'Cloudflare CDN'],
        observations: existing.research.websiteOpportunities.map(o => ({
          issue: o.issue,
          evidence: o.detail,
        })),
        generatedEmail: {
          subject: existing.generatedEmail.subject,
          body: existing.generatedEmail.body,
        },
      };
    }

    // Synthesize realistic research based on domain keywords
    const domainPrefix = cleanDomain.split('.')[0] || 'innovative';
    const formattedName = domainPrefix
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    let industry = 'Commercial & Residential Services';
    let problem = 'Primary estimate request form lacks responsive mobile autofocus and validation.';
    let evidence = 'Viewport test on iOS Safari indicates 1.8s tap-to-input lag with no instant validation feedback.';

    if (cleanDomain.includes('roof')) {
      industry = 'Roofing & Exterior Contracting';
      problem = 'Emergency inspection CTA is hidden below secondary project gallery.';
      evidence = 'Hero section lacks click-to-call phone number; lead capture form requires 1,200px scroll depth.';
    } else if (cleanDomain.includes('remodel') || cleanDomain.includes('kitchen') || cleanDomain.includes('bath')) {
      industry = 'Kitchen & Bath Remodeling';
      problem = 'Primary consultation booking is placed below the fold without budget tiering.';
      evidence = 'Prospects bounce before reaching the consultation calendar embed at bottom of page.';
    } else if (cleanDomain.includes('plumb') || cleanDomain.includes('drain')) {
      industry = 'Plumbing & Mechanical Systems';
      problem = 'After-hours dispatch phone button lacks tap-to-call tel: protocol on mobile.';
      evidence = 'Click event triggers raw text selection rather than native mobile dialer on Android.';
    } else if (cleanDomain.includes('hvac') || cleanDomain.includes('air') || cleanDomain.includes('cool')) {
      industry = 'HVAC & Climate Control';
      problem = 'Seasonal maintenance membership sign-up has high drop-off at multi-step payment step.';
      evidence = 'Multi-step wizard lacks persistent step indicators and Apple Pay / Google Pay one-touch integration.';
    }

    const decisionMakerName = 'Marcus Vance';
    const decisionMakerRole = role || 'Founder & Principal';
    const contactEmail = `marcus@${cleanDomain}`;

    return {
      companyName: formattedName,
      domain: cleanDomain,
      industry,
      location: 'Austin, Texas',
      decisionMaker: {
        name: decisionMakerName,
        role: decisionMakerRole,
        email: contactEmail,
        verified: true,
      },
      score: 91,
      techStack: ['WordPress', 'Elementor', 'Google Tag Manager', 'Cloudflare CDN', 'HubSpot Form'],
      observations: [
        {
          issue: problem,
          evidence,
        },
        {
          issue: 'Portfolio imagery lacks verified timeline, scope, and budget benchmarks.',
          evidence: 'Case study pages contain 18+ high-resolution galleries without sq ft specs or project timelines.',
        },
        {
          issue: 'Mobile navigation hides instant quotation triggers behind hamburger menu.',
          evidence: 'Requires two friction-heavy taps to surface primary contact actions on mobile viewports.',
        },
      ],
      generatedEmail: {
        subject: `Quick optimization thought for ${formattedName}`,
        body: `Hi ${decisionMakerName.split(' ')[0]},\n\nI was looking through ${formattedName}'s work and recent projects — the craftsmanship on your latest client builds is impressive.\n\nWhile reviewing your website on mobile, I noticed that the ${problem.toLowerCase()} For prospective high-value clients, that often leads to drop-offs before booking.\n\nI mapped out a clean, high-converting layout tweak that surfaces your project proof and direct consultation booking immediately upfront.\n\nOpen to seeing a quick 90-second video walkthrough?\n\n— Alex`,
      },
    };
  }

  async addResearchedProspect(result: CompanyResearchResult, campaignId?: string): Promise<Prospect> {
    const state = this.data;
    const campaign = campaignId ? state.campaigns.find(c => c.id === campaignId) : undefined;

    const newProspect: Prospect = {
      id: `prospect-${Date.now()}`,
      companyId: `comp-${Date.now()}`,
      company: {
        id: `comp-${Date.now()}`,
        name: result.companyName,
        domain: result.domain,
        industry: result.industry,
        location: result.location,
        city: result.location.split(',')[0]?.trim() || 'Austin',
        state: result.location.split(',')[1]?.trim() || 'TX',
        country: 'USA',
        employeeCount: '10-50',
        websiteUrl: `https://${result.domain}`,
        websiteQualityScore: result.score,
        description: `${result.companyName} is a premier ${result.industry.toLowerCase()} company based in ${result.location}.`,
      },
      contact: {
        id: `contact-${Date.now()}`,
        fullName: result.decisionMaker.name,
        firstName: result.decisionMaker.name.split(' ')[0] || 'Leader',
        lastName: result.decisionMaker.name.split(' ').slice(1).join(' ') || '',
        role: result.decisionMaker.role,
        email: result.decisionMaker.email,
        emailVerified: result.decisionMaker.verified,
      },
      fitScore: result.score,
      fitScoreBreakdown: {
        businessRelevance: 24,
        commercialValue: 19,
        websiteOpportunity: 19,
        activity: 13,
        contactability: 9,
        digitalPresence: 7,
      },
      fitLabel: result.score >= 90 ? 'Excellent fit' : 'Strong fit',
      primaryProblem: result.observations[0]?.issue || 'Conversion friction on mobile lead intake',
      status: campaign ? 'in_sequence' : 'ready',
      campaignId: campaign?.id,
      campaignName: campaign?.name,
      research: {
        summary: `Verified decision maker and audited conversion gaps for ${result.companyName}.`,
        whyTheyFit: [
          'High ticket transaction values with clear conversion optimization upside',
          'Established digital footprint with active service territory',
          'Decision maker email verified and reachable',
        ],
        websiteOpportunities: result.observations.map((obs, idx) => ({
          id: `opp-${idx}`,
          issue: obs.issue,
          detail: obs.evidence,
          sourceUrl: `https://${result.domain}`,
        })),
        techStack: result.techStack,
        recentSignals: ['Active marketing presence', 'Recently refreshed service territory'],
        suggestedAngle: 'Highlight mobile conversion friction and present quick concept walkthrough.',
      },
      generatedEmail: {
        subject: result.generatedEmail.subject,
        body: result.generatedEmail.body,
        personalizations: [
          {
            text: result.observations[0]?.issue || 'Conversion friction',
            source: 'Website Audit',
            explanation: 'Factual issue verified during crawling.',
          },
        ],
        charCount: result.generatedEmail.body.length,
      },
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'discovered',
          title: 'Researched in AI Lab',
          description: `Extracted ICP attributes and generated personalized email copy.`,
          timestamp: 'Just now',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    state.prospects = [newProspect, ...state.prospects];
    if (campaign) {
      campaign.stats.prospects += 1;
    }
    this.save(state);
    return newProspect;
  }

  async addManualProspect(data: any): Promise<Prospect> {
    await delay(300);
    const state = this.data;
    const newProspect: Prospect = {
      id: `pros-${Date.now()}`,
      companyId: `comp-${Date.now()}`,
      company: {
        id: `comp-${Date.now()}`,
        name: data.companyName,
        domain: data.domain,
        industry: data.industry || 'General Business',
        location: data.location || 'United States',
        city: '',
        state: '',
        country: 'USA',
        employeeCount: '10-50',
        websiteUrl: `https://${data.domain}`,
        websiteQualityScore: data.fitScore || 75,
        description: data.primaryProblem || 'Manual prospect entry',
      },
      contact: {
        id: `cnt-${Date.now()}`,
        fullName: data.contactName,
        firstName: data.contactName.split(' ')[0] || '',
        lastName: data.contactName.split(' ').slice(1).join(' ') || '',
        role: data.contactRole || 'Decision Maker',
        email: data.contactEmail || '',
        emailVerified: Boolean(data.contactEmail),
      },
      fitScore: data.fitScore || 75,
      fitScoreBreakdown: {
        businessRelevance: 20,
        commercialValue: 20,
        websiteOpportunity: 15,
        activity: 10,
        contactability: 5,
        digitalPresence: 5,
      },
      fitLabel: 'Strong fit',
      primaryProblem: data.primaryProblem || 'Verified commercial outreach target',
      status: data.campaignId ? 'in_sequence' : 'ready',
      campaignId: data.campaignId,
      research: {
        summary: data.primaryProblem || 'Verified prospect',
        whyTheyFit: ['Matches workspace criteria'],
        websiteOpportunities: [],
        techStack: [],
        recentSignals: [],
        suggestedAngle: 'Direct outreach',
      },
      generatedEmail: {
        subject: `Quick note for ${data.companyName}`,
        body: `Hi ${data.contactName.split(' ')[0]},\n\nReaching out regarding your team at ${data.companyName}.`,
        personalizations: [],
        charCount: 80,
      },
      activities: [],
      createdAt: new Date().toISOString(),
    };

    state.prospects = [newProspect, ...state.prospects];
    this.save(state);
    return newProspect;
  }

  async createSequence(name: string, templateType = 'custom', steps: any[] = []): Promise<Sequence> {
    await delay(300);
    const state = this.data;
    const newSeq: Sequence = {
      id: `seq-${Date.now()}`,
      name,
      templateType: templateType as any,
      steps: steps.map((s, idx) => ({
        id: `step-${Date.now()}-${idx}`,
        stepNumber: idx + 1,
        type: 'email',
        name: s.name || `Step ${idx + 1}`,
        subject: s.subject || '',
        bodyPreview: (s.body || '').slice(0, 50),
        body: s.body || '',
        delayDays: s.delayDays ?? 3,
        active: true,
        replyRate: '0%',
        channel: 'email',
        isAvailable: true,
      })),
    };
    state.sequences = [newSeq, ...(state.sequences || [])];
    this.save(state);
    return newSeq;
  }

  async generatePersonalizedEmail(_prospectId: string, _campaignId: string): Promise<any> {
    await delay(1000);
    return {};
  }
}
