import { useState } from 'react';
import { useAppState } from '../../lib/state/AppStateContext';
import { BarChart3, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

export function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const { campaigns, prospects, inboxThreads, isLoading } = useAppState();

  const totalCampaigns = campaigns.length;
  const totalProspects = prospects.length;

  const totalSent = campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0);
  const totalReplies = campaigns.reduce((acc, c) => acc + (c.stats?.replies || 0), 0);
  const totalPositive = campaigns.reduce((acc, c) => acc + (c.stats?.positiveReplies || 0), 0);
  const replyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) + '%' : '0.0%';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Outreach Analytics</h1>
          <p className="text-[14px] text-[#686868] mt-0.5">
            Deliverability, positive engagement, and pipeline generation metrics.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium uppercase transition-all ${
                timeRange === r ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : 'text-[#686868]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-5 rounded-2xl bg-white border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[12px] font-medium text-[#686868]">Total Sent</span>
          <div className="text-[26px] font-semibold text-[#111111] tnum">{totalSent}</div>
          <span className="text-[11px] text-[#949494]">Across active campaigns</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[12px] font-medium text-[#686868]">Reply Rate</span>
          <div className="text-[26px] font-semibold text-emerald-700 tnum">{replyRate}</div>
          <span className="text-[11px] text-[#949494]">Verified replies / total sent</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[12px] font-medium text-[#686868]">Interested Leads</span>
          <div className="text-[26px] font-semibold text-[#111111] tnum">{totalPositive}</div>
          <span className="text-[11px] text-[#686868]">High intent categorizations</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[12px] font-medium text-[#686868]">Total Prospects</span>
          <div className="text-[26px] font-semibold text-stone-700 tnum">{totalProspects}</div>
          <span className="text-[11px] text-[#949494]">In active pipeline</span>
        </div>
      </div>

      {/* Campaign Performance Breakdown */}
      <div className="p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#111111]">Campaign Benchmarks</h3>
          <span className="text-[11px] text-[#949494]">{totalCampaigns} campaigns in workspace</span>
        </div>

        {campaigns.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#888888] border border-dashed border-black/10 rounded-xl space-y-2">
            <BarChart3 className="w-8 h-8 text-[#ccc] mx-auto" />
            <p className="font-medium text-[#444]">No campaign data available yet</p>
            <p className="text-[11px]">Launch an outbound campaign to start tracking performance metrics.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((aud) => (
              <div
                key={aud.id}
                className="p-3.5 rounded-xl bg-stone-50/70 border border-black/[0.05] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-[13px] font-semibold text-[#111111]">{aud.name}</h4>
                  <div className="text-[12px] text-[#686868] mt-0.5">
                    {aud.stats?.prospects || 0} prospects • {aud.stats?.sent || 0} sent • {aud.stats?.replies || 0} replies
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[14px] font-semibold text-emerald-700 tnum">
                    {aud.stats?.sent ? (((aud.stats?.replies || 0) / aud.stats.sent) * 100).toFixed(1) + '%' : '0.0%'}
                  </span>
                  <span className="text-[10px] text-[#949494] block uppercase">Reply Rate</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
