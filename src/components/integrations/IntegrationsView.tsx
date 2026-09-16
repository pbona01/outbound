import { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from "../../lib/state/ToastContext";
import { useWorkspace } from '../../lib/workspaces/WorkspaceProvider';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface DbMailbox {
  id: string;
  email: string;
  status: string;
  provider: string;
}

export function IntegrationsView() {
  const { showToast } = useToast();
  const { workspace } = useWorkspace();
  const [mailboxes, setMailboxes] = useState<DbMailbox[]>([]);
  const [isLoadingMailboxes, setIsLoadingMailboxes] = useState(false);

  useEffect(() => {
    async function loadMailboxes() {
      if (!isSupabaseConfigured || !workspace?.id) return;
      setIsLoadingMailboxes(true);
      try {
        const { data, error } = await supabase
          .from('mailboxes')
          .select('id, email, status, provider')
          .eq('workspace_id', workspace.id);
        
        if (!error && data) {
          setMailboxes(data);
        }
      } catch (err) {
        console.error('Error loading mailboxes:', err);
      } finally {
        setIsLoadingMailboxes(false);
      }
    }
    loadMailboxes();
  }, [workspace?.id]);

  const connectedGmailMailbox = mailboxes.find(
    (mb) => mb.provider === 'google' && mb.status === 'connected'
  );

  const integrations = [
    {
      id: 'google',
      name: 'Google Workspace / Gmail',
      category: 'Mailbox Provider',
      description: 'Connect sending Gmail mailboxes via Google Workspace OAuth for sequence dispatch.',
      connected: !!connectedGmailMailbox,
      account: connectedGmailMailbox ? `Connected: ${connectedGmailMailbox.email}` : undefined,
      isPlanned: false,
    },
    {
      id: 'microsoft',
      name: 'Microsoft 365 / Outlook',
      category: 'Mailbox Provider',
      description: 'Connect enterprise Outlook mailboxes with automatic graph API token rotation.',
      connected: false,
      isPlanned: true,
    },
    {
      id: 'hubspot',
      name: 'HubSpot CRM',
      category: 'CRM Integration',
      description: 'Auto-sync positive replies, create contacts, and advance deal stages upon meeting booking.',
      connected: false,
      isPlanned: true,
    },
    {
      id: 'slack',
      name: 'Slack Alerts',
      category: 'Notifications',
      description: 'Stream positive lead replies directly to your team Slack channel in real time.',
      connected: false,
      isPlanned: true,
    },
    {
      id: 'webhook',
      name: 'Webhooks & Zapier',
      category: 'Custom Automation',
      description: 'Trigger custom API actions whenever a prospect replies or is categorized as interested.',
      connected: false,
      isPlanned: true,
    },
  ];

  const handleGmailConnectClick = () => {
    if (connectedGmailMailbox) return;
    // OAuth must begin on the server so client code never receives provider secrets.
    window.location.assign('/api/auth/google/start');
  };

  const handlePlannedConnectClick = (name: string) => {
    showToast(
      'Integration Unavailable',
      `Connecting to ${name} is planned for a future release.`,
      'info'
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
                ) : item.isPlanned ? (
                  <span className="text-[11px] font-medium text-[#949494] bg-stone-100 px-2 py-0.5 rounded-md">
                    Planned
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
              <span className="text-[12px] text-[#949494]">
                {item.isPlanned ? 'Planned' : 'OAuth 2.0 / REST API'}
              </span>

              {item.id === 'google' ? (
                <button
                  onClick={handleGmailConnectClick}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors ${
                    item.connected
                      ? 'border border-black/[0.08] text-[#686868] bg-stone-50 hover:bg-stone-100'
                      : 'bg-[#3157FF] text-white hover:bg-[#2545D9]'
                  }`}
                >
                  {item.connected ? 'Connected' : 'Connect'}
                </button>
              ) : (
                <button
                  onClick={() => handlePlannedConnectClick(item.name)}
                  className="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors border border-dashed border-black/[0.08] text-stone-400 cursor-not-allowed"
                  disabled
                >
                  Unavailable
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
