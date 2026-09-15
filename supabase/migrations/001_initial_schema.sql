-- OutboundOS Initial Database Schema (PostgreSQL / Supabase)
-- Multi-tenant architecture with Row Level Security (RLS)

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'Member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  owner_id UUID REFERENCES public.profiles(id),
  industry TEXT,
  geography TEXT,
  company_size TEXT,
  offer TEXT,
  mailbox_provider TEXT DEFAULT 'Set up later',
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Workspace Members Table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- 4. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'draft')) DEFAULT 'draft',
  audience_query TEXT,
  target_industry TEXT,
  target_geography TEXT,
  mailbox_email TEXT,
  daily_limit INT DEFAULT 35,
  sequence_steps_count INT DEFAULT 3,
  stats JSONB DEFAULT '{"prospects": 0, "contacted": 0, "sent": 0, "replies": 0, "positiveReplies": 0, "meetings": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  website_url TEXT,
  industry TEXT,
  location TEXT,
  employee_count TEXT,
  description TEXT,
  website_quality_score INT DEFAULT 80,
  source TEXT,
  source_url TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  email TEXT,
  email_verified BOOLEAN DEFAULT false,
  verification_source TEXT,
  phone TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Prospects Table
CREATE TABLE IF NOT EXISTS public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  fit_score INT DEFAULT 70,
  fit_label TEXT,
  primary_problem TEXT,
  status TEXT CHECK (status IN ('discovered', 'in_sequence', 'contacted', 'replied', 'interested', 'opt_out', 'bounced', 'ready')) DEFAULT 'discovered',
  research_status TEXT DEFAULT 'pending',
  source TEXT DEFAULT 'Discovery Engine',
  source_url TEXT,
  company_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_role TEXT,
  contact_email TEXT,
  evidence TEXT,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Research Reports Table
CREATE TABLE IF NOT EXISTS public.research_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  summary TEXT,
  services TEXT[] DEFAULT '{}',
  target_customers TEXT,
  location TEXT,
  website_quality_score INT DEFAULT 80,
  conversion_opportunities JSONB DEFAULT '[]'::jsonb,
  technology_signals TEXT[] DEFAULT '{}',
  evidence_urls TEXT[] DEFAULT '{}',
  confidence INT DEFAULT 85,
  raw_content JSONB DEFAULT '{}'::jsonb,
  domain TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Sequences Table
CREATE TABLE IF NOT EXISTS public.sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  template_type TEXT DEFAULT 'Gentle',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Sequence Steps Table
CREATE TABLE IF NOT EXISTS public.sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES public.sequences(id) ON DELETE CASCADE NOT NULL,
  step_number INT NOT NULL,
  name TEXT,
  subject TEXT,
  body TEXT,
  delay_days INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  reply_rate TEXT DEFAULT '0%',
  channel TEXT DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Inbox Threads Table
CREATE TABLE IF NOT EXISTS public.inbox_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  provider_thread_id TEXT,
  classification TEXT CHECK (classification IN ('interested', 'meeting_requested', 'question', 'not_now', 'not_interested', 'unsubscribe', 'out_of_office', 'unknown')) DEFAULT 'unknown',
  unread BOOLEAN DEFAULT false,
  last_message_snippet TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Email Messages Table (Drafts & Sent History)
CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  thread_id UUID REFERENCES public.inbox_threads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE SET NULL,
  sequence_step_id UUID REFERENCES public.sequence_steps(id) ON DELETE SET NULL,
  provider_message_id TEXT,
  sender TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'approved', 'scheduled', 'sending', 'sent', 'delivered', 'bounced', 'failed', 'replied')) DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Suppression List Table
CREATE TABLE IF NOT EXISTS public.suppression_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  reason TEXT DEFAULT 'manual',
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_workspace_suppression_email UNIQUE (workspace_id, email)
);

-- 14. Scheduled Jobs Table
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  sequence_step_id UUID REFERENCES public.sequence_steps(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  attempt_count INT DEFAULT 0,
  idempotency_key TEXT UNIQUE NOT NULL,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all workspace tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Helper Functions for Workspace Membership & Roles
CREATE OR REPLACE FUNCTION public.get_workspace_role(ws_id UUID)
RETURNS TEXT AS $$
DECLARE
  m_role TEXT;
BEGIN
  SELECT role INTO m_role FROM public.workspace_members
  WHERE workspace_id = ws_id AND user_id = auth.uid();
  RETURN m_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = ws_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policy
CREATE POLICY "Users can read/update own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Workspaces Policy
CREATE POLICY "Users can access owned or member workspaces" ON public.workspaces
  FOR ALL USING (owner_id = auth.uid() OR public.is_workspace_member(id));

-- Workspace Members Policy
CREATE POLICY "Members can view workspace membership" ON public.workspace_members
  FOR ALL USING (public.is_workspace_member(workspace_id) OR user_id = auth.uid());

-- RLS Policies for Member Access
CREATE POLICY "Workspace member access for campaigns" ON public.campaigns FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace member access for companies" ON public.companies FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace member access for contacts" ON public.contacts FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace member access for prospects" ON public.prospects FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace member access for research_reports" ON public.research_reports FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace member access for sequences" ON public.sequences FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace member access for sequence_steps" ON public.sequence_steps FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sequences s WHERE s.id = sequence_id AND public.is_workspace_member(s.workspace_id))
);
CREATE POLICY "Workspace member access for inbox_threads" ON public.inbox_threads FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace member access for email_messages" ON public.email_messages FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace member access for suppression_list" ON public.suppression_list FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace member access for scheduled_jobs" ON public.scheduled_jobs FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace member access for analytics_events" ON public.analytics_events FOR ALL USING (public.is_workspace_member(workspace_id));
