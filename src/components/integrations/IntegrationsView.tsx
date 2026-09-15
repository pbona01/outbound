import { useState } from 'react';
import { Mail, CheckCircle2, Globe, Database, ArrowUpRight, Zap, RefreshCw, ShieldCheck } from 'lucide-react';

import { useToast } from "../../lib/state/ToastContext";


export function IntegrationsView() { const { showToast } = useToast();
  const [integrations, setIntegrations] = useState([
    {
      id: 'google',
      name: 'Google Workspace',
      category: 'Email Provider',
      description: 'Send through authenticated corporate Gmail accounts with custom warm-up ramp.',
      connected: true,
      health: '98% Deliverability',
    },
    {
      id: 'microsoft',
      name: 'Microsoft 365 / Outlook',
      category: 'Email Provider',
      description: 'Connect enterprise Outlook mailboxes with automatic graph API token rotation.',
      connected: false,
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      category: 'CRM',
      description: 'Auto-sync positive replies, create contacts, and advance deal stages upon meeting booking.',
      connected: true,
      account: 'GrowthStudio Portal (ID: 882041)',
    },
    {
      id: 'salesforce',
      name: 'Salesforce Sales Cloud',
      category: 'CRM',
      description: 'Bi-directional lead sync, opportunity stage mapping, and AE assignment rules.',
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack Alerts',
      category: 'Notifications',
      description: 'Stream positive and interested lead replies directly to #sales-pipeline in real time.',
      connected: true,
      account: '#outbound-hot-leads',
    },
    {
      id: 'webhook',
      name: 'Webhooks & Zapier',
      category: 'Automation',
      description: 'Trigger custom workflows whenever a prospect replies, books, or is categorized as high fit.',
      connected: true,
      account: 'Active endpoint: api.growthstudio.co/webhooks/leads',
    },
  ]);

  const handleToggle = (id: string, name: string, currentState: boolean) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !currentState } : item
      )
    );
    showToast(
      currentState ? `${name} Disconnected` : `${name} Connected`,
      currentState ? 'Integration paused.' : 'Authorized and active.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Integrations & Connected Tools</h1>
        <p className="text-[14px] text-[#686868] mt-0.5">
          Connect your sending mailboxes, CRM destinations, and real-time webhook subscribers.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-2xl border border-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#949494]">
                  {item.category}
                </span>
                {item.connected ? (
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[#949494] bg-stone-100 px-2 py-0.5 rounded-md">
                    Not connected
                  </span>
                )}
              </div>

              <h3 className="text-[16px] font-semibold text-[#111111]">{item.name}</h3>
              <p className="text-[13px] text-[#686868] leading-relaxed">{item.description}</p>

              {item.account && (
                <div className="pt-2 text-[12px] text-[#111111] font-mono bg-stone-50 p-2 rounded-lg border border-black/[0.04]">
                  {item.account}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-black/[0.05] flex items-center justify-between">
              {item.health ? (
                <span className="text-[12px] text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {item.health}
                </span>
              ) : (
                <span className="text-[12px] text-[#949494]">OAuth 2.0 / REST</span>
              )}

              <button
                onClick={() => handleToggle(item.id, item.name, item.connected)}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors ${
                  item.connected
                    ? 'border border-black/[0.08] text-[#686868] hover:bg-stone-100'
                    : 'bg-[#111111] text-white hover:bg-black'
                }`}
              >
                {item.connected ? 'Configure' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
