import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Plus,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Send,
  Users,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Target,
  Check,
  Search,
  Mail,
} from 'lucide-react';
import { Campaign, NeedsAttentionItem } from '../../types';
import { formatNumber } from '../../lib/utils';
import { useAppState } from '../../lib/state/AppStateContext';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useWorkspace } from '../../lib/workspaces/WorkspaceProvider';

export function OverviewView() {
  const navigate = useNavigate();
  const { campaigns, needsAttention, prospects, inboxThreads } = useAppState();
  const { profile, user } = useAuth();
  const { workspace } = useWorkspace();
  const { setIsCampaignWizardOpen } = useOutletContext<{ setIsCampaignWizardOpen: (v: boolean) => void }>();

  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Operator';
  const workspaceName = workspace?.name || 'GrowthStudio';

  const onCreateCampaign = () => setIsCampaignWizardOpen(true);
  const onSelectCampaign = (campaign: Campaign) => navigate(`/campaigns`);
  const onNavigateTab = (tab: string) => navigate(`/${tab}`);

  const [activeMetric, setActiveMetric] = useState<'sent' | 'replies' | 'positive' | 'meetings'>('replies');
  const [dateRange, setDateRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Real aggregations calculated directly from AppState
  const totalSent = campaigns.reduce((acc, c) => acc + (c.stats.sent || 0), 0);
  const totalReplies = campaigns.reduce((acc, c) => acc + (c.stats.replies || 0), 0);
  const totalPositive = campaigns.reduce((acc, c) => acc + (c.stats.positiveReplies || 0), 0);
  const totalResearched = prospects.length;

  const chartPoints = [
    { label: 'Day 1', sent: Math.round(totalSent * 0.1), replies: 0, positive: 0, meetings: 0 },
    { label: 'Day 3', sent: Math.round(totalSent * 0.3), replies: Math.round(totalReplies * 0.2), positive: 0, meetings: 0 },
    { label: 'Day 5', sent: Math.round(totalSent * 0.5), replies: Math.round(totalReplies * 0.4), positive: Math.round(totalPositive * 0.3), meetings: 0 },
    { label: 'Day 7', sent: Math.round(totalSent * 0.75), replies: Math.round(totalReplies * 0.7), positive: Math.round(totalPositive * 0.6), meetings: 1 },
    { label: 'Today', sent: totalSent, replies: totalReplies, positive: totalPositive, meetings: 1 },
  ];

  const currentValues = chartPoints.map((p) => p[activeMetric]);
  const maxValue = Math.max(...currentValues, 1);
  const minValue = 0;

  // SVG Chart path calculation
  const width = 800;
  const height = 180;
  const paddingX = 20;
  const paddingY = 25;

  const getCoordinates = (val: number, idx: number) => {
    const x = paddingX + (idx / (chartPoints.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((val - minValue) / (maxValue - minValue || 1)) * (height - paddingY * 2);
    return { x, y };
  };

  const pathD = chartPoints.reduce((acc, point, idx) => {
    const { x, y } = getCoordinates(point[activeMetric], idx);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const areaD = `${pathD} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

  return (
    <div className="space-y-7">
      {/* Top Banner: Greeting & Create Campaign CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-[#111111] tracking-tight">Good day, {userName}</h1>
          <p className="text-[14px] text-[#686868] mt-0.5">Overview for {workspaceName}. Review audience discovery, AI research, and mailbox status.</p>
        </div>
        <button
          onClick={onCreateCampaign}
          className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create campaign
        </button>
      </div>

      {/* Quick-Start Checklist for New Workspace */}
      {campaigns.length === 0 && (
        <div className="p-6 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3157FF] text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#111]">Welcome to your new workspace</h2>
              <p className="text-xs text-[#555]">Follow these 3 steps to set up your outbound pipeline:</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => navigate('/prospects')}
              className="p-3.5 bg-white rounded-xl border border-blue-100 text-left hover:border-blue-300 transition"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3157FF]"><Search className="w-4 h-4" /> 1. Discover Accounts</div>
              <p className="text-[11px] text-[#666] mt-1">Search or import CSV target accounts matching your ICP.</p>
            </button>

            <button
              onClick={() => setIsCampaignWizardOpen(true)}
              className="p-3.5 bg-white rounded-xl border border-blue-100 text-left hover:border-blue-300 transition"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3157FF]"><Target className="w-4 h-4" /> 2. Launch Campaign</div>
              <p className="text-[11px] text-[#666] mt-1">Define message sequences and daily send limits.</p>
            </button>

            <button
              onClick={() => navigate('/integrations')}
              className="p-3.5 bg-white rounded-xl border border-blue-100 text-left hover:border-blue-300 transition"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3157FF]"><Mail className="w-4 h-4" /> 3. Connect Mailbox</div>
              <p className="text-[11px] text-[#666] mt-1">Authenticate Gmail OAuth to enable sending approval.</p>
            </button>
          </div>
        </div>
      )}

      {/* 4 Clean Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            title: 'Prospects researched',
            value: totalResearched,
            change: totalResearched > 0 ? `+${totalResearched}` : '0',
            icon: Target,
          },
          {
            title: 'Emails sent',
            value: totalSent,
            change: totalSent > 0 ? `+${totalSent}` : '0',
            icon: Send,
          },
          {
            title: 'Replies',
            value: totalReplies,
            change: totalReplies > 0 ? `+${totalReplies}` : '0',
            icon: MessageSquare,
          },
          {
            title: 'Interested',
            value: totalPositive,
            change: totalPositive > 0 ? `+${totalPositive}` : '0',
            icon: CheckCircle2,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-black/[0.12]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#686868]">{item.title}</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md tnum">
                {item.change}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-[28px] font-semibold text-[#111111] tracking-tight tnum">
                {formatNumber(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Performance Chart Card */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {(
              [
                { id: 'sent', label: 'Sent' },
                { id: 'replies', label: 'Replies' },
                { id: 'positive', label: 'Positive replies' },
                { id: 'meetings', label: 'Meetings' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id)}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-all ${
                  activeMetric === m.id
                    ? 'bg-white text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                    : 'text-[#686868] hover:text-[#111111]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1">
            {(['7D', '30D', '90D'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  dateRange === r ? 'bg-stone-200 text-[#111111]' : 'text-[#949494] hover:text-[#111111]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Line Chart Canvas */}
        <div className="relative w-full h-[180px] select-none pt-2">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            {/* Subtle Horizontal gridlines */}
            <line
              x1={paddingX}
              y1={paddingY}
              x2={width - paddingX}
              y2={paddingY}
              stroke="rgba(0,0,0,0.05)"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={height / 2}
              x2={width - paddingX}
              y2={height / 2}
              stroke="rgba(0,0,0,0.05)"
              strokeDasharray="4 4"
            />
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="rgba(0,0,0,0.08)"
            />

            {/* Subtle Gradient Area fill */}
            <defs>
              <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3157FF" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#3157FF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#metricGradient)" />

            {/* Main Thin Cobalt Line */}
            <path d={pathD} fill="none" stroke="#3157FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {chartPoints.map((point, idx) => {
              const { x, y } = getCoordinates(point[activeMetric], idx);
              const isHovered = hoveredPointIndex === idx;

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 5 : 3}
                    fill="#FFFFFF"
                    stroke="#3157FF"
                    strokeWidth={isHovered ? 2.5 : 2}
                    className="transition-all"
                  />
                  {/* Invisible hover trigger zone */}
                  <circle cx={x} cy={y} r={16} fill="transparent" />
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Callout */}
          {hoveredPointIndex !== null && (
            <div
              className="absolute top-2 bg-[#111111] text-white text-[11px] px-2.5 py-1 rounded-md shadow-lg pointer-events-none transform -translate-x-1/2"
              style={{
                left: `${(hoveredPointIndex / (chartPoints.length - 1)) * 100}%`,
              }}
            >
              <div className="font-semibold">
                {chartPoints[hoveredPointIndex][activeMetric]}{' '}
                {activeMetric === 'positive' ? 'positive replies' : activeMetric}
              </div>
              <div className="text-[10px] text-stone-400">{chartPoints[hoveredPointIndex].label}</div>
            </div>
          )}
        </div>

        {/* Date Labels below chart */}
        <div className="flex justify-between text-[11px] text-[#949494] px-4 pt-1 font-mono">
          {chartPoints.map((p, idx) => (
            <span key={idx} className={idx % 2 === 0 ? 'inline' : 'hidden sm:inline'}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Two Column Section: Active Campaigns & Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Campaigns Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[#111111]">Active campaigns</h2>
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="text-[12px] font-medium text-[#3157FF] hover:underline flex items-center gap-1"
            >
              View all ({campaigns.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-black/[0.06] text-[11px] font-semibold text-[#686868] uppercase tracking-wider">
                  <th className="pb-2.5">Campaign</th>
                  <th className="pb-2.5">Audience</th>
                  <th className="pb-2.5 text-center">Prospects</th>
                  <th className="pb-2.5 text-center">Sent</th>
                  <th className="pb-2.5 text-center">Replies</th>
                  <th className="pb-2.5 text-center">Positive</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {campaigns.map((camp) => (
                  <tr
                    key={camp.id}
                    onClick={() => onSelectCampaign(camp)}
                    className="hover:bg-stone-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-medium text-[#111111]">{camp.name}</td>
                    <td className="py-3 text-[#686868]">{camp.targetIndustry}</td>
                    <td className="py-3 text-center tnum">{camp.stats.prospects}</td>
                    <td className="py-3 text-center tnum">{camp.stats.sent}</td>
                    <td className="py-3 text-center tnum font-medium text-[#111111]">{camp.stats.replies}</td>
                    <td className="py-3 text-center tnum font-semibold text-emerald-700">
                      {camp.stats.positiveReplies}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                          camp.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        {camp.status === 'active' ? 'Active' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Needs Attention */}
        <div className="bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-semibold text-[#111111]">Needs attention</h2>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md tnum">
              {needsAttention.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {needsAttention.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-black/[0.06] bg-[#F7F7F5]/50 space-y-2 hover:border-black/[0.12] transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {item.type === 'approval' && <Target className="w-4 h-4 text-[#3157FF]" />}
                    {item.type === 'reply' && <MessageSquare className="w-4 h-4 text-emerald-600" />}
                    {item.type === 'limit' && <Clock className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#111111] leading-snug">{item.title}</h3>
                    <p className="text-[12px] text-[#686868] mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onNavigateTab(item.targetTab)}
                    className="text-[12px] font-medium text-[#3157FF] hover:underline flex items-center gap-1"
                  >
                    <span>{item.actionText}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
