import { useState } from 'react';
import {
  ArrowLeft,
  Pause,
  Play,
  Edit2,
  Users,
  Send,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Layers,
  Settings as SettingsIcon,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { Campaign, Prospect } from '../../types';
import { getScoreColor, getStatusBadge } from '../../lib/utils';

interface CampaignDetailViewProps {
  campaign: Campaign;
  prospects: Prospect[];
  onBack: () => void;
  onSelectProspect: (prospect: Prospect) => void;
  onToggleStatus: (campaignId: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export function CampaignDetailView({
  campaign,
  prospects,
  onBack,
  onSelectProspect,
  onToggleStatus,
  onShowToast,
}: CampaignDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'prospects' | 'sequence' | 'settings'>('overview');

  const campaignProspects = prospects.filter(
    (p) => p.campaignId === campaign.id || p.campaignName === campaign.name
  );

  const funnelSteps = [
    { label: 'Prospects', value: campaign.stats.prospects, desc: 'Researched & Verified' },
    { label: 'Contacted', value: campaign.stats.contacted || Math.round(campaign.stats.prospects * 0.86), desc: 'Step 1 Dispatched' },
    { label: 'Replies', value: campaign.stats.replies, desc: 'Direct Responses' },
    { label: 'Interested', value: campaign.stats.positiveReplies, desc: 'Positive Intent' },
    { label: 'Meetings', value: campaign.stats.meetings, desc: 'Calls Scheduled' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar: Back, Title, Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-[#686868] hover:text-[#111111] hover:bg-stone-100 transition-colors"
            aria-label="Back to campaigns"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[24px] font-semibold text-[#111111] tracking-tight">{campaign.name}</h1>
              <span
                className={`text-[12px] font-medium px-2 py-0.5 rounded-full border ${
                  campaign.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                {campaign.status === 'active' ? 'Active' : 'Paused'}
              </span>
            </div>
            <p className="text-[13px] text-[#686868] mt-0.5">{campaign.audienceQuery}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onToggleStatus(campaign.id);
              onShowToast(
                campaign.status === 'active' ? 'Campaign Paused' : 'Campaign Resumed',
                `"${campaign.name}" schedule updated.`
              );
            }}
            className="px-3.5 py-2 rounded-xl text-[13px] font-medium border border-black/[0.08] hover:bg-stone-100 transition-colors flex items-center gap-1.5"
          >
            {campaign.status === 'active' ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Campaign Primary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Prospects', value: campaign.stats.prospects, icon: Users },
          { label: 'Sent', value: campaign.stats.sent, icon: Send },
          { label: 'Replies', value: campaign.stats.replies, icon: MessageSquare },
          { label: 'Positive', value: campaign.stats.positiveReplies, icon: CheckCircle2 },
          { label: 'Meetings', value: campaign.stats.meetings, icon: Calendar },
        ].map((m, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white border border-black/[0.07] space-y-1">
            <span className="text-[12px] font-medium text-[#686868] flex items-center gap-1.5">
              <m.icon className="w-3.5 h-3.5 text-[#949494]" />
              {m.label}
            </span>
            <div className="text-[22px] font-semibold text-[#111111] tnum">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-black/[0.06] text-[13px] font-medium">
        {(['overview', 'prospects', 'sequence', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors relative ${
              activeTab === tab ? 'text-[#111111]' : 'text-[#686868] hover:text-[#111111]'
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3157FF]" />}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Conversion Funnel */}
          <div className="p-6 rounded-2xl bg-white border border-black/[0.07] space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[#111111]">Outreach Conversion Funnel</h3>
                <p className="text-[12px] text-[#686868] mt-0.5">
                  Focusing strictly on high-intent outcome metrics: Replies, Positive interest, and Meetings.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#949494]">Updated 12m ago</span>
            </div>

            {/* Visual Funnel Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {funnelSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="p-4 rounded-xl bg-stone-50/70 border border-black/[0.05] space-y-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#949494] block">
                      {step.label}
                    </span>
                    <span className="text-[24px] font-semibold text-[#111111] tnum block">{step.value}</span>
                    <span className="text-[11px] text-[#686868] block">{step.desc}</span>
                  </div>
                  {idx < funnelSteps.length - 1 && (
                    <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 text-stone-300 z-10">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Strategy Dossier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-black/[0.07] space-y-3">
              <h4 className="text-[14px] font-semibold text-[#111111]">Campaign Audience Criteria</h4>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between py-1 border-b border-black/[0.04]">
                  <span className="text-[#686868]">Target Geography:</span>
                  <span className="font-medium text-[#111111]">{campaign.targetGeography}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.04]">
                  <span className="text-[#686868]">Target Industry:</span>
                  <span className="font-medium text-[#111111]">{campaign.targetIndustry}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.04]">
                  <span className="text-[#686868]">Connected Mailbox:</span>
                  <span className="font-mono text-[12px] text-[#111111]">{campaign.mailboxEmail}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#686868]">Daily Warmup Limit:</span>
                  <span className="font-medium text-[#111111] tnum">{campaign.dailyLimit} per day</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-black/[0.07] space-y-3">
              <h4 className="text-[14px] font-semibold text-[#111111]">Observed Campaign Performance</h4>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between py-1 border-b border-black/[0.04]">
                  <span className="text-[#686868]">Reply Rate:</span>
                  <span className="font-semibold text-emerald-700 tnum">
                    {((campaign.stats.replies / (campaign.stats.sent || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/[0.04]">
                  <span className="text-[#686868]">Positive Intent Rate:</span>
                  <span className="font-semibold text-emerald-700 tnum">
                    {((campaign.stats.positiveReplies / (campaign.stats.sent || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#686868]">Meeting Booking Rate:</span>
                  <span className="font-semibold text-[#3157FF] tnum">
                    {((campaign.stats.meetings / (campaign.stats.sent || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROSPECTS IN THIS CAMPAIGN */}
      {activeTab === 'prospects' && (
        <div className="bg-white rounded-2xl border border-black/[0.07] overflow-hidden">
          <div className="p-4 border-b border-black/[0.06] flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#111111]">
              Assigned Prospects ({campaignProspects.length})
            </h3>
            <span className="text-[12px] text-[#686868]">Click row to open research drawer</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-black/[0.06] bg-stone-50/50 text-[11px] font-semibold text-[#686868] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Company</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4 text-center">Fit Score</th>
                  <th className="py-2.5 px-4">Problem</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {campaignProspects.map((p) => {
                  const score = getScoreColor(p.fitScore);
                  const status = getStatusBadge(p.status);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => onSelectProspect(p)}
                      className="hover:bg-stone-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-[#111111]">{p.company.name}</td>
                      <td className="py-3 px-4 text-[#686868]">
                        {p.contact.fullName} ({p.contact.role})
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${score.bg} ${score.text}`}>
                          {p.fitScore}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#686868] truncate max-w-[200px]">“{p.primaryProblem}”</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border ${status.classes}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SEQUENCE */}
      {activeTab === 'sequence' && (
        <div className="p-6 bg-white rounded-2xl border border-black/[0.07] space-y-4">
          <h3 className="text-[16px] font-semibold text-[#111111]">Active Outreach Sequence</h3>
          <div className="space-y-3 max-w-xl">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.05] space-y-1">
              <span className="text-[11px] font-semibold text-[#3157FF] uppercase tracking-wider">
                Step 1 • Initial Email
              </span>
              <h4 className="text-[13px] font-medium text-[#111111]">Quick idea for {"{{company.name}}"}</h4>
              <p className="text-[12px] text-[#686868]">Highlights custom website opportunity with invitation to review Figma mockup.</p>
            </div>
            <div className="text-center text-[11px] text-[#949494]">↓ Wait 3 business days</div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.05] space-y-1">
              <span className="text-[11px] font-semibold text-[#3157FF] uppercase tracking-wider">
                Step 2 • Follow-up with Mockup
              </span>
              <h4 className="text-[13px] font-medium text-[#111111]">Re: Quick idea for {"{{company.name}}"}</h4>
              <p className="text-[12px] text-[#686868]">Presents 90-second walkthrough video addressing mobile CTA friction.</p>
            </div>
            <div className="text-center text-[11px] text-[#949494]">↓ Wait 4 business days</div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.05] space-y-1">
              <span className="text-[11px] font-semibold text-[#3157FF] uppercase tracking-wider">
                Step 3 • Benchmark Case Study
              </span>
              <h4 className="text-[13px] font-medium text-[#111111]">Texas remodeling conversion benchmark</h4>
              <p className="text-[12px] text-[#686868]">Shares +34% conversion case study from a peer custom builder in Austin.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 bg-white rounded-2xl border border-black/[0.07] max-w-xl space-y-4">
          <h3 className="text-[16px] font-semibold text-[#111111]">Campaign Settings</h3>
          <div className="space-y-3 text-[13px]">
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[#686868]">Sending Account</label>
              <input
                disabled
                value={campaign.mailboxEmail}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-black/[0.08] text-[13px] text-[#111111]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] font-medium text-[#686868]">Daily Sending Throttle</label>
              <input
                defaultValue={campaign.dailyLimit}
                type="number"
                className="w-full px-3.5 py-2 rounded-xl border border-black/[0.08] text-[13px] text-[#111111]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
