import { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { formatNumber } from '../../lib/utils';

export function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const topAudiences = [
    { name: 'Texas Kitchen Remodelers', sent: 319, replies: 24, positive: 8, rate: '7.5%' },
    { name: 'Florida Interior Designers', sent: 208, replies: 17, positive: 6, rate: '8.1%' },
    { name: 'California Solar Installers', sent: 195, replies: 12, positive: 4, rate: '6.1%' },
    { name: 'Colorado Custom Builders', sent: 140, replies: 10, positive: 3, rate: '7.1%' },
  ];

  const sequenceStepPerformance = [
    { step: 'Step 1: Custom Mobile Friction Angle', sent: 862, replies: 31, share: '66% of all replies' },
    { step: 'Step 2: Interactive Figma Prototype Offer', sent: 540, replies: 11, share: '23% of all replies' },
    { step: 'Step 3: Austin Builder Conversion Case Study', sent: 220, replies: 4, share: '9% of all replies' },
    { step: 'Step 4: Graceful Permission Breakup', sent: 110, replies: 1, share: '2% of all replies' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Outreach Analytics</h1>
          <p className="text-[14px] text-[#686868] mt-0.5">
            Deliverability, positive engagement, and pipeline generation benchmarks.
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
          <div className="text-[26px] font-semibold text-[#111111] tnum">862</div>
          <span className="text-[11px] text-[#949494]">Over last 30 business days</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[12px] font-medium text-[#686868]">Reply Rate</span>
          <div className="text-[26px] font-semibold text-emerald-700 tnum">5.45%</div>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
            +1.8% vs B2B Industry avg
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[12px] font-medium text-[#686868]">Interested Leads</span>
          <div className="text-[26px] font-semibold text-[#111111] tnum">18</div>
          <span className="text-[11px] text-[#686868]">38.2% of all replies have positive intent</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <span className="text-[12px] font-medium text-[#686868]">Bounce Rate</span>
          <div className="text-[26px] font-semibold text-stone-700 tnum">0.6%</div>
          <span className="text-[11px] text-emerald-700 font-medium">Well below 2.0% safe threshold</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Breakdown */}
        <div className="p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-[#111111]">Best Performing Audiences</h3>
            <span className="text-[11px] text-[#949494]">Ranked by response</span>
          </div>

          <div className="space-y-3">
            {topAudiences.map((aud, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-stone-50/70 border border-black/[0.05] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-[13px] font-semibold text-[#111111]">{aud.name}</h4>
                  <div className="text-[12px] text-[#686868] mt-0.5">
                    {aud.sent} sent • {aud.replies} replies ({aud.positive} interested)
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[14px] font-semibold text-emerald-700 tnum">{aud.rate}</span>
                  <span className="text-[10px] text-[#949494] block uppercase">Reply Rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Performance */}
        <div className="p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-[#111111]">Sequence Step Efficiency</h3>
            <span className="text-[11px] text-[#949494]">Attribution breakdown</span>
          </div>

          <div className="space-y-3">
            {sequenceStepPerformance.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-black/[0.06] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-[13px] font-medium text-[#111111]">{step.step}</h4>
                  <div className="text-[12px] text-[#686868] mt-0.5">
                    {step.sent} sent • {step.replies} direct replies
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-[#3157FF] bg-blue-50 px-2.5 py-1 rounded-lg">
                  {step.share}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
