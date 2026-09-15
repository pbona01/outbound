import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Search,
  Target,
  Mail,
  Sparkles,
  Building2,
  UserCheck,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useWorkspace } from '../../lib/workspaces/WorkspaceProvider';
import { useAppState } from '../../lib/state/AppStateContext';

interface WorkspaceSetupChecklistProps {
  onCreateCampaign?: () => void;
}

export function WorkspaceSetupChecklist({ onCreateCampaign }: WorkspaceSetupChecklistProps) {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { workspace } = useWorkspace();
  const { campaigns, prospects } = useAppState();

  const isProfileComplete = Boolean(profile?.full_name && profile?.role);
  const isWorkspaceConfigured = Boolean(workspace?.name && workspace?.industry);
  const isProspectAdded = prospects.length > 0;
  const isCampaignCreated = campaigns.length > 0;
  const isMailboxConnected = Boolean(
    workspace?.mailbox_provider && workspace.mailbox_provider !== 'Set up later'
  );

  const checklistItems = useMemo(
    () => [
      {
        id: 'profile',
        title: 'Profile complete',
        description: isProfileComplete
          ? `${profile?.full_name || 'Your name'} • ${profile?.role || 'Operator'}`
          : 'Set up your operator name and role',
        isComplete: isProfileComplete,
        icon: UserCheck,
        actionText: isProfileComplete ? 'View profile' : 'Complete profile',
        onClick: () => navigate('/app/settings'),
      },
      {
        id: 'workspace',
        title: 'Workspace configured',
        description: isWorkspaceConfigured
          ? `${workspace?.name || 'Your workspace'} • ${workspace?.industry || 'Target industry'}`
          : 'Define company size, industry, and offer positioning',
        isComplete: isWorkspaceConfigured,
        icon: Building2,
        actionText: isWorkspaceConfigured ? 'View settings' : 'Configure workspace',
        onClick: () => navigate('/app/settings'),
      },
      {
        id: 'prospect',
        title: 'First prospect added',
        description: isProspectAdded
          ? `${prospects.length} account${prospects.length === 1 ? '' : 's'} in your pipeline`
          : 'Discover high-fit target accounts matching your ICP',
        isComplete: isProspectAdded,
        icon: Search,
        actionText: isProspectAdded ? 'View prospects' : 'Discover prospects',
        onClick: () => navigate('/app/prospects'),
      },
      {
        id: 'campaign',
        title: 'First campaign created',
        description: isCampaignCreated
          ? `${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'} staged`
          : 'Build an automated multi-stage touchpoint cadence',
        isComplete: isCampaignCreated,
        icon: Target,
        actionText: isCampaignCreated ? 'View campaigns' : 'Create campaign',
        onClick: () => {
          if (onCreateCampaign) {
            onCreateCampaign();
          } else {
            navigate('/app/campaigns');
          }
        },
      },
      {
        id: 'mailbox',
        title: 'Mailbox connected',
        description: isMailboxConnected
          ? `Connected via ${workspace?.mailbox_provider}`
          : 'Connect Google Workspace or Microsoft 365 (sending locked until connected)',
        isComplete: isMailboxConnected,
        icon: Mail,
        actionText: isMailboxConnected ? 'Manage mailbox' : 'Connect mailbox',
        onClick: () => navigate('/app/integrations'),
      },
    ],
    [
      isProfileComplete,
      isWorkspaceConfigured,
      isProspectAdded,
      isCampaignCreated,
      isMailboxConnected,
      profile,
      workspace,
      prospects.length,
      campaigns.length,
      navigate,
      onCreateCampaign,
    ]
  );

  const completedCount = checklistItems.filter((item) => item.isComplete).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="bg-white border border-black/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
      {/* Header with Welcome and Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#3157FF] border border-blue-100">
              Setup Guide
            </span>
            <span className="text-[12px] text-[#686868]">
              {completedCount} of {checklistItems.length} steps complete
            </span>
          </div>
          <h2 className="text-xl font-semibold text-[#111111] tracking-tight mt-1.5">
            Welcome to {workspace?.name || 'your new workspace'}
          </h2>
          <p className="text-[13px] text-[#686868] mt-0.5">
            Complete the operational checklist to start discovering accounts and staging personalized outreach.
          </p>
        </div>

        {/* Progress bar */}
        <div className="sm:w-48 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#686868]">
            <span>Readiness</span>
            <span className="font-semibold text-[#111111]">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3157FF] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive 5-Step Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {checklistItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                item.isComplete
                  ? 'bg-stone-50/60 border-black/[0.06] hover:border-black/[0.12]'
                  : 'bg-white border-[#3157FF]/30 hover:border-[#3157FF] hover:shadow-[0_2px_8px_rgba(49,87,255,0.06)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      item.isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#3157FF]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#111111]">{item.title}</h3>
                  </div>
                </div>

                {item.isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-300 group-hover:text-[#3157FF] transition-colors shrink-0 mt-1" />
                )}
              </div>

              <p className="text-[12px] text-[#686868] mt-2.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-3 pt-2.5 border-t border-black/[0.04] flex items-center justify-between text-[11px] font-medium">
                <span className={item.isComplete ? 'text-emerald-700' : 'text-[#3157FF]'}>
                  {item.actionText}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#949494] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* 4 Direct Launch Action Cards */}
      <div className="pt-2">
        <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider mb-3">
          Quick Launch Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/app/prospects')}
            className="p-4 rounded-2xl bg-white border border-black/[0.07] hover:border-black/[0.14] text-left transition-all hover:-translate-y-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3157FF] flex items-center justify-center mb-3">
              <Search className="w-4 h-4" />
            </div>
            <h4 className="text-[13px] font-semibold text-[#111111]">Discover prospects</h4>
            <p className="text-[11px] text-[#686868] mt-1 leading-normal">
              Filter by industry, location, and headcount to find target companies.
            </p>
          </button>

          <button
            onClick={() => {
              if (onCreateCampaign) onCreateCampaign();
              else navigate('/app/campaigns');
            }}
            className="p-4 rounded-2xl bg-white border border-black/[0.07] hover:border-black/[0.14] text-left transition-all hover:-translate-y-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <Target className="w-4 h-4" />
            </div>
            <h4 className="text-[13px] font-semibold text-[#111111]">Create campaign</h4>
            <p className="text-[11px] text-[#686868] mt-1 leading-normal">
              Stage multi-touch sequences, daily sending limits, and ICP rules.
            </p>
          </button>

          <button
            onClick={() => navigate('/app/research')}
            className="p-4 rounded-2xl bg-white border border-black/[0.07] hover:border-black/[0.14] text-left transition-all hover:-translate-y-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-[13px] font-semibold text-[#111111]">Research a company</h4>
            <p className="text-[11px] text-[#686868] mt-1 leading-normal">
              Inspect website signals, tech stack, and conversion friction points.
            </p>
          </button>

          <button
            onClick={() => navigate('/app/integrations')}
            className="p-4 rounded-2xl bg-white border border-black/[0.07] hover:border-black/[0.14] text-left transition-all hover:-translate-y-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Mail className="w-4 h-4" />
            </div>
            <h4 className="text-[13px] font-semibold text-[#111111]">Connect a mailbox</h4>
            <p className="text-[11px] text-[#686868] mt-1 leading-normal">
              Authenticate your sender. Sending stays locked until setup is complete.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
