export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  onboarding_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  industry?: string;
  geography?: string;
  company_size?: string;
  offer?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceMemberRecord {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'member';
  workspaceId: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: 'Starter' | 'Growth' | 'Scale' | 'Enterprise';
  slug: string;
  membersCount: number;
}

export interface Contact {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  linkedinUrl?: string;
}

export interface WebsiteOpportunity {
  id: string;
  issue: string;
  detail: string;
  sourceUrl: string;
}

export interface ResearchResult {
  summary: string;
  whyTheyFit: string[];
  websiteOpportunities: WebsiteOpportunity[];
  techStack: string[];
  recentSignals: string[];
  suggestedAngle: string;
}

export interface PersonalizationHighlight {
  text: string;
  source: string;
  explanation: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  personalizations: PersonalizationHighlight[];
  charCount: number;
}

export interface CompanyResearchResult {
  companyName: string;
  domain: string;
  industry: string;
  location: string;
  decisionMaker: {
    name: string;
    role: string;
    email: string;
    verified: boolean;
  };
  score: number;
  techStack: string[];
  observations: {
    issue: string;
    evidence: string;
  }[];
  generatedEmail: {
    subject: string;
    body: string;
  };
}

export interface LeadScoreBreakdown {
  businessRelevance: number; // max 25
  commercialValue: number; // max 20
  websiteOpportunity: number; // max 20
  activity: number; // max 15
  contactability: number; // max 10
  digitalPresence: number; // max 10
}

export interface ActivityEvent {
  id: string;
  type:
    | 'discovered'
    | 'researched'
    | 'verified'
    | 'added_to_campaign'
    | 'sent'
    | 'follow_up_sent'
    | 'reply_received'
    | 'marked_interested'
    | 'meeting_booked';
  title: string;
  description?: string;
  timestamp: string;
}

export type ProspectStatus =
  | 'ready'
  | 'in_sequence'
  | 'contacted'
  | 'interested'
  | 'not_interested'
  | 'unverified';

export interface Company {
  id: string;
  name: string;
  domain: string;
  industry: string;
  location: string;
  city: string;
  state: string;
  country: string;
  employeeCount: string;
  websiteUrl: string;
  websiteQualityScore: number;
  phone?: string;
  description: string;
}

export interface Prospect {
  id: string;
  companyId: string;
  company: Company;
  contact: Contact;
  fitScore: number;
  fitScoreBreakdown: LeadScoreBreakdown;
  fitLabel: 'Excellent fit' | 'Strong fit' | 'Moderate fit' | 'Low fit';
  primaryProblem: string;
  status: ProspectStatus;
  campaignId?: string;
  campaignName?: string;
  research: ResearchResult;
  generatedEmail: GeneratedEmail;
  activities: ActivityEvent[];
  createdAt: string;
}

export interface CampaignStats {
  prospects: number;
  contacted: number;
  sent: number;
  replies: number;
  positiveReplies: number;
  meetings: number;
}

export interface Campaign {
  id: string;
  name: string;
  audienceQuery: string;
  targetIndustry: string;
  targetGeography: string;
  status: 'active' | 'paused' | 'draft' | 'completed';
  stats: CampaignStats;
  createdAt: string;
  mailboxEmail: string;
  dailyLimit: number;
  sequenceStepsCount: number;
}

export interface SequenceStep {
  id: string;
  stepNumber: number;
  type?: 'email' | 'wait';
  name?: string;
  delayDays?: number;
  subject?: string;
  bodyPreview?: string;
  description?: string;
  replyRate?: string;
  active?: boolean;
  body?: string;
  channel?: 'email' | 'linkedin' | 'whatsapp';
  isAvailable?: boolean;
}

export interface Sequence {
  id: string;
  name: string;
  templateType?: 'Gentle' | 'Direct' | 'Value-led';
  steps: SequenceStep[];
}

export interface InboxThread {
  id: string;
  prospectId: string;
  prospectName: string;
  prospectRole: string;
  companyName: string;
  companyDomain: string;
  email: string;
  subject?: string;
  classification: 'interested' | 'neutral' | 'not_interested' | 'follow_up';
  lastMessageSnippet: string;
  timestamp: string;
  unread: boolean;
  category: 'all' | 'unread' | 'interested' | 'not_interested' | 'follow_up' | 'archived';
  messages: {
    id: string;
    sender: 'prospect' | 'user';
    from: string;
    timestamp: string;
    body: string;
  }[];
  suggestedReply: {
    text: string;
    rationale: string;
  };
}

export interface MailboxAccount {
  id: string;
  email: string;
  provider: 'Google' | 'Microsoft' | 'SMTP';
  status: 'Healthy' | 'Warning' | 'Needs Attention' | 'Disconnected';
  dailyLimit: number;
  sentToday: number;
  warmupStatus: 'Active (Week 3)' | 'Completed' | 'Paused';
}

export interface Integration {
  id: string;
  name: string;
  category: 'Email Provider' | 'Calendar & Scheduling' | 'CRM & Contacts' | 'Notifications & Webhooks';
  description: string;
  state: 'Connected' | 'Connect' | 'Coming in next build';
  connectedAccount?: string;
  iconType: string;
}

export interface UsageRecord {
  prospectsResearched: number;
  prospectsResearchedLimit: number;
  aiResearchCredits: number;
  aiResearchCreditsLimit: number;
  verifiedContacts: number;
  verifiedContactsLimit: number;
  emailsSent: number;
  emailsSentLimit: number;
  plan: string;
  billingDate: string;
  monthlyCost: number;
}

export interface NeedsAttentionItem {
  id: string;
  type: 'approval' | 'reply' | 'limit';
  title: string;
  description: string;
  actionText: string;
  targetTab: string;
}
