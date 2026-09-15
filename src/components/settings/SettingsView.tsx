import { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Building,
  Mail,
  Zap,
  Plus,
  ArrowUpRight,
  Server,
} from 'lucide-react';

interface SettingsViewProps {
  onShowToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
}

export function SettingsView({ onShowToast }: SettingsViewProps) {
  const [workspaceName, setWorkspaceName] = useState('GrowthStudio');
  const [timezone, setTimezone] = useState('America/Chicago (Central Time)');
  const [dailyCap, setDailyCap] = useState(35);

  const teamMembers = [
    { name: 'Alex Vance', email: 'alex@growthstudio.co', role: 'Owner / Admin', status: 'Active' },
    { name: 'Elena Rostova', email: 'elena@growthstudio.co', role: 'Growth Specialist', status: 'Active' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Settings & Workspace</h1>
        <p className="text-[14px] text-[#686868] mt-0.5">
          Manage sending mailbox health, deliverability guards, team access, and resource usage.
        </p>
      </div>

      {/* Usage Quotas Card */}
      <div className="p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-semibold text-[#111111]">Plan & Monthly Quotas</h3>
            <p className="text-[12px] text-[#686868]">Growth Plan • Renews in 18 days</p>
          </div>
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-[#111111]">
            Standard Tier
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.05] space-y-1.5">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#686868]">Prospects Researched</span>
              <span className="font-semibold text-[#111111] tnum">1,284 / 5,000</span>
            </div>
            <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#3157FF] rounded-full" style={{ width: '25.6%' }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.05] space-y-1.5">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#686868]">Outbound Sends</span>
              <span className="font-semibold text-[#111111] tnum">862 / 3,000</span>
            </div>
            <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '28.7%' }} />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-black/[0.05] space-y-1.5">
            <div className="flex justify-between text-[12px]">
              <span className="text-[#686868]">Connected Mailboxes</span>
              <span className="font-semibold text-[#111111] tnum">2 / 5</span>
            </div>
            <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Sending Mailbox Deliverability Health */}
      <div className="p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-[16px] font-semibold text-[#111111]">Connected Mailboxes & DNS Guard</h3>
          </div>
          <button
            onClick={() => onShowToast('DNS Status', 'All SPF, DKIM, and DMARC records verified valid.')}
            className="text-[12px] text-[#3157FF] hover:underline font-medium"
          >
            Recheck DNS Handshake
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-black/[0.06] bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] font-semibold text-[#111111]">alex@growthstudio.co</span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  98% Deliverability
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#686868]">
                <span>SPF: Passed</span>
                <span>•</span>
                <span>DKIM: Passed (2048-bit)</span>
                <span>•</span>
                <span>DMARC: Strict</span>
                <span>•</span>
                <span>Warmup: Active (100% warmed)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-[12px]">
              <span className="text-[#686868]">Daily limit: 35/day</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-black/[0.06] bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[13px] font-semibold text-[#111111]">elena@growthstudio.co</span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  96% Deliverability
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#686868]">
                <span>SPF: Passed</span>
                <span>•</span>
                <span>DKIM: Passed</span>
                <span>•</span>
                <span>DMARC: Strict</span>
                <span>•</span>
                <span>Warmup: Active (92% warmed)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-[12px]">
              <span className="text-[#686868]">Daily limit: 25/day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="p-6 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#111111]">Team Members</h3>
          <button
            onClick={() => onShowToast('Invite link generated', 'Copied teammate invitation link.')}
            className="px-3 py-1.5 rounded-xl text-[12px] font-medium border border-black/[0.08] hover:bg-stone-50 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Invite Member
          </button>
        </div>

        <div className="divide-y divide-black/[0.05]">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-[13px]">
              <div>
                <span className="font-medium text-[#111111]">{member.name}</span>
                <span className="text-[12px] text-[#686868] ml-2 font-mono">{member.email}</span>
              </div>
              <span className="text-[12px] font-medium text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-md">
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => onShowToast('Settings Saved', 'Workspace configuration updated successfully.')}
          className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-white bg-[#111111] hover:bg-black transition-colors"
        >
          Save Workspace Preferences
        </button>
      </div>
    </div>
  );
}
