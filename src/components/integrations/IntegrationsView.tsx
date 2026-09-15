import { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useToast } from "../../lib/state/ToastContext";
import { useWorkspace } from '../../lib/workspaces/WorkspaceProvider';

export function IntegrationsView() {
  const { showToast } = useToast();
  const { workspace } = useWorkspace();

  const [integrations, setIntegrations] = useState([
    {
      id: 'google',
      name: 'Google Workspace / Gmail',
      category: 'Mailbox Provider',
      description: 'Connect sending Gmail mailboxes via Google Workspace OAuth for sequence dispatch.',
      connected: workspace?.mailbox_provider === 'gmail',
      account: workspace?.mailbox_provider === 'gmail' ? 'Connected via Workspace' : undefined,
    },
    {
      id: 'microsoft',
      name: 'Microsoft 365 / Outlook',
      category: 'Mailbox Provider',
      description: 'Connect enterprise Outlook mailboxes with automatic graph API token rotation.',
      connected: false,
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      category: 'CRM Integration',
      description: 'Auto-sync positive replies, create contacts, and advance deal stages upon meeting booking.',
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack Alerts',
      category: 'Notifications',
      description: 'Stream positive lead replies directly to your team Slack channel in real time.',
      connected: false,
    },
    {
      id: 'webhook',
      name: 'Webhooks & Zapier',
      category: 'Custom Automation',
      description: 'Trigger custom API actions whenever a prospect replies or is categorized as interested.',
      connected: false,
    },
  ]);

  const handleToggle = (id: string, name: string, currentState: boolean) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !currentState } : item
      )
    );
    showToast(
      currentState ? `${name} Disconnected` : `${name} Connection Requested`,
      currentState ? 'Provider disconnected.' : 'Follow setup dialog to connect provider keys.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-semibold text-[#111111] tracking-tight">Integrations & Mailboxes</h1>
        <p className="text-[14px] text-[#686868] mt-0.5">
          Connect sending mailboxes, CRM targets, and custom notification webhooks.
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
              <span className="text-[12px] text-[#949494]">OAuth 2.0 / REST API</span>

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
