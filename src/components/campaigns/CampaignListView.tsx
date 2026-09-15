import { useState } from 'react';
import { Plus, Search, Send, Users, MessageSquare, CheckCircle2, Calendar, Pause, Play } from 'lucide-react';
import { Campaign } from '../../types';

interface CampaignListViewProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaign: Campaign) => void;
  onCreateCampaign: () => void;
  onToggleStatus: (campaignId: string) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export function CampaignListView({
  campaigns,
  onSelectCampaign,
  onCreateCampaign,
  onToggleStatus,
  onShowToast,
}: CampaignListViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');

  const filtered = campaigns.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.targetIndustry.toLowerCase().includes(search.toLowerCase()) ||
      c.targetGeography.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Campaigns</h1>
          <p className="text-[14px] text-[#686868] mt-0.5">
            Automated multi-step outbound sequences targeted by specific industry ICP criteria.
          </p>
        </div>
        <button
          onClick={onCreateCampaign}
          className="px-4 py-2 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-colors flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create campaign
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-black/[0.07] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#949494] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by name, industry, or geography..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-black/[0.06] bg-[#F7F7F5]/50 text-[13px] text-[#111111] placeholder:text-[#949494] focus:outline-none focus:bg-white focus:border-[#3157FF] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl w-full sm:w-auto justify-center">
            {(['all', 'active', 'draft'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium capitalize transition-all ${
                  statusFilter === s ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : 'text-[#686868]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign Cards List */}
      <div className="space-y-3">
        {filtered.map((campaign) => (
          <div
            key={campaign.id}
            onClick={() => onSelectCampaign(campaign)}
            className="p-5 bg-white rounded-2xl border border-black/[0.07] hover:border-black/[0.14] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[17px] font-semibold text-[#111111] leading-tight hover:text-[#3157FF] transition-colors">
                    {campaign.name}
                  </h3>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                      campaign.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {campaign.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </div>
                <p className="text-[13px] text-[#686868] mt-1 line-clamp-1">{campaign.audienceQuery}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(campaign.id);
                    onShowToast(
                      campaign.status === 'active' ? 'Campaign Paused' : 'Campaign Resumed',
                      `"${campaign.name}" schedule updated.`
                    );
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-black/[0.08] hover:bg-stone-50 text-[12px] font-medium text-[#686868] hover:text-[#111111] transition-colors flex items-center gap-1.5"
                >
                  {campaign.status === 'active' ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-emerald-600" />
                      <span>Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Campaign Key Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-black/[0.04] text-[13px]">
              <div>
                <span className="text-[11px] text-[#949494] block uppercase tracking-wider">Prospects</span>
                <span className="font-semibold text-[#111111] tnum">{campaign.stats.prospects}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#949494] block uppercase tracking-wider">Sent</span>
                <span className="font-semibold text-[#111111] tnum">{campaign.stats.sent}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#949494] block uppercase tracking-wider">Replies</span>
                <span className="font-semibold text-[#111111] tnum">{campaign.stats.replies}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#949494] block uppercase tracking-wider">Positive</span>
                <span className="font-semibold text-emerald-700 tnum">{campaign.stats.positiveReplies}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#949494] block uppercase tracking-wider">Meetings</span>
                <span className="font-semibold text-[#3157FF] tnum">{campaign.stats.meetings}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
