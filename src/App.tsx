import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Layers,
  Users,
  Mail,
  GitFork,
  BarChart3,
  Sparkles,
  Plug,
  Settings,
  Search,
  Plus,
  Bell,
  Menu,
  X,
  ChevronDown,
  Building2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { mockCampaigns, mockProspects, mockInboxThreads, mockNeedsAttention, mockUser } from './data/mockData';
import { Campaign, Prospect, InboxThread, NeedsAttentionItem } from './types';
import { ToastContainer } from './components/common/Toast';
import { CommandPalette } from './components/common/CommandPalette';
import { OverviewView } from './components/dashboard/OverviewView';
import { ProspectDiscoveryView } from './components/prospects/ProspectDiscoveryView';
import { ProspectDrawer } from './components/prospects/ProspectDrawer';
import { CampaignWizard } from './components/campaigns/CampaignWizard';
import { CampaignListView } from './components/campaigns/CampaignListView';
import { CampaignDetailView } from './components/campaigns/CampaignDetailView';
import { InboxView } from './components/inbox/InboxView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AiResearchLabView } from './components/research/AiResearchLabView';
import { SequencesView } from './components/sequences/SequencesView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Data State
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [prospects, setProspects] = useState<Prospect[]>(mockProspects);
  const [inboxThreads, setInboxThreads] = useState<InboxThread[]>(mockInboxThreads);
  const [needsAttention, setNeedsAttention] = useState<NeedsAttentionItem[]>(mockNeedsAttention);

  // Modals & Panels State
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isCampaignWizardOpen, setIsCampaignWizardOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Toast System State
  const [toasts, setToasts] = useState<Array<{ id: string; title: string; description?: string; type?: 'success' | 'info' | 'error' }>>([]);

  const showToast = (title: string, description?: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLaunchCampaign = (newCamp: Partial<Campaign>) => {
    const id = `camp-${Date.now()}`;
    const fullCampaign: Campaign = {
      id,
      name: newCamp.name || 'Custom Outbound Campaign',
      status: 'active',
      audienceQuery: newCamp.audienceQuery || 'Custom search audience',
      targetIndustry: newCamp.targetIndustry || 'General B2B',
      targetGeography: newCamp.targetGeography || 'United States',
      stats: newCamp.stats || {
        prospects: 250,
        contacted: 0,
        sent: 0,
        replies: 0,
        positiveReplies: 0,
        meetings: 0,
      },
      createdAt: 'Just now',
      mailboxEmail: newCamp.mailboxEmail || 'alex@growthstudio.co',
      dailyLimit: newCamp.dailyLimit || 35,
      sequenceStepsCount: 4,
    };

    setCampaigns((prev) => [fullCampaign, ...prev]);
    setSelectedCampaign(fullCampaign);
    setActiveTab('campaigns');
  };

  const handleToggleCampaignStatus = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? { ...c, status: c.status === 'active' ? 'paused' : 'active' }
          : c
      )
    );
    if (selectedCampaign && selectedCampaign.id === campaignId) {
      setSelectedCampaign((prev) =>
        prev ? { ...prev, status: prev.status === 'active' ? 'paused' : 'active' } : null
      );
    }
  };

  const handleUpdateProspectStatus = (prospectId: string, newStatus: Prospect['status']) => {
    setProspects((prev) =>
      prev.map((p) => (p.id === prospectId ? { ...p, status: newStatus } : p))
    );
    if (selectedProspect && selectedProspect.id === prospectId) {
      setSelectedProspect((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const interestedInboxCount = inboxThreads.filter((t) => t.classification === 'interested').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Layers, badge: campaigns.length },
    { id: 'prospects', label: 'Prospects', icon: Users, badge: prospects.length },
    { id: 'inbox', label: 'Inbox', icon: Mail, badge: interestedInboxCount, badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'sequences', label: 'Sequences', icon: GitFork },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'research', label: 'AI Research', icon: Sparkles },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#111111] font-sans antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* App Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (Apple + Linear + Attio aesthetic) */}
        <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-black/[0.07] shrink-0 select-none z-20">
          {/* Logo & Workspace */}
          <div className="p-4 border-b border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
                O
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-[15px] tracking-tight block text-[#111111] leading-tight">
                  OutboundOS
                </span>
                <span className="text-[11px] text-[#686868] truncate block">GrowthStudio</span>
              </div>
            </div>

            <button
              onClick={() => showToast('Workspace Switcher', 'Currently on GrowthStudio (Owner).')}
              className="p-1 rounded-md text-[#949494] hover:text-[#111111] hover:bg-stone-100 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'campaigns') setSelectedCampaign(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-stone-100 text-[#111111] font-semibold'
                      : 'text-[#686868] hover:text-[#111111] hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#3157FF]' : 'text-[#686868]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-stone-200/70 text-stone-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Stat / Deliverability Pill */}
          <div className="p-3 mx-3 mb-3 rounded-xl bg-[#F7F7F5] border border-black/[0.05] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#686868] font-medium">Mailbox Warmup</span>
              <span className="text-emerald-700 font-semibold">98% Health</span>
            </div>
            <div className="h-1 w-full bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
            </div>
          </div>

          {/* User Profile Bar */}
          <div className="p-3 border-t border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-700 shrink-0">
                {mockUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-[13px] text-[#111111] truncate block leading-tight">
                  {mockUser.name}
                </span>
                <span className="text-[11px] text-[#949494] truncate block font-mono">
                  {mockUser.email}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-out Drawer */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-72 bg-white h-full flex flex-col shadow-2xl z-10 border-r border-black/[0.08]">
              <div className="p-4 border-b border-black/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                    O
                  </div>
                  <span className="font-semibold text-[15px]">OutboundOS</span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 text-[#949494] hover:text-[#111111]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (item.id === 'campaigns') setSelectedCampaign(null);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium ${
                        isActive ? 'bg-stone-100 text-[#111111]' : 'text-[#686868]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-200">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Context Bar */}
          <header className="h-14 border-b border-black/[0.06] bg-white/80 backdrop-blur-[8px] px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
            {/* Left: Mobile Toggle & Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-1 text-[#686868] hover:text-[#111111]"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 text-[13px] text-[#686868]">
                <span className="font-medium text-[#111111] hover:underline cursor-pointer" onClick={() => setActiveTab('overview')}>
                  OutboundOS
                </span>
                <span>/</span>
                <span className="capitalize font-medium text-[#111111]">{activeTab}</span>
                {activeTab === 'campaigns' && selectedCampaign && (
                  <>
                    <span>/</span>
                    <span className="text-[#686868] truncate max-w-[150px] sm:max-w-xs font-normal">
                      {selectedCampaign.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right: Search, Quick Action, Alerts */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cmd+K Search trigger */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/[0.07] bg-[#F7F7F5]/80 hover:bg-stone-100 text-[12px] text-[#686868] transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-[#949494]" />
                <span>Search accounts, campaigns...</span>
                <kbd className="text-[10px] bg-white border border-black/[0.08] px-1.5 py-0.5 rounded font-mono text-[#949494]">
                  ⌘K
                </kbd>
              </button>

              <button
                onClick={() => setIsCampaignWizardOpen(true)}
                className="px-3 py-1.5 rounded-xl text-[12px] font-medium text-white bg-[#3157FF] hover:bg-[#2545D9] transition-all flex items-center gap-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Campaign</span>
              </button>

              <button
                onClick={() => showToast('Notifications', 'All sending systems normal. 0 deliverability blocks.')}
                className="p-2 rounded-xl text-[#686868] hover:text-[#111111] hover:bg-stone-100 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#3157FF] absolute top-2 right-2" />
              </button>
            </div>
          </header>

          {/* Page Viewport Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-7 max-w-7xl w-full mx-auto">
            {activeTab === 'overview' && (
              <OverviewView
                campaigns={campaigns}
                needsAttention={needsAttention}
                onCreateCampaign={() => setIsCampaignWizardOpen(true)}
                onSelectCampaign={(c) => {
                  setSelectedCampaign(c);
                  setActiveTab('campaigns');
                }}
                onNavigateTab={(t) => setActiveTab(t)}
              />
            )}

            {activeTab === 'campaigns' &&
              (selectedCampaign ? (
                <CampaignDetailView
                  campaign={selectedCampaign}
                  prospects={prospects}
                  onBack={() => setSelectedCampaign(null)}
                  onSelectProspect={(p) => setSelectedProspect(p)}
                  onToggleStatus={handleToggleCampaignStatus}
                  onShowToast={showToast}
                />
              ) : (
                <CampaignListView
                  campaigns={campaigns}
                  onSelectCampaign={(c) => setSelectedCampaign(c)}
                  onCreateCampaign={() => setIsCampaignWizardOpen(true)}
                  onToggleStatus={handleToggleCampaignStatus}
                  onShowToast={showToast}
                />
              ))}

            {activeTab === 'prospects' && (
              <ProspectDiscoveryView
                prospects={prospects}
                onSelectProspect={(p) => setSelectedProspect(p)}
                onOpenCampaignWizard={() => setIsCampaignWizardOpen(true)}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'inbox' && (
              <InboxView threads={inboxThreads} onShowToast={showToast} />
            )}

            {activeTab === 'sequences' && (
              <SequencesView onShowToast={showToast} />
            )}

            {activeTab === 'analytics' && <AnalyticsView />}

            {activeTab === 'research' && (
              <AiResearchLabView onShowToast={showToast} />
            )}

            {activeTab === 'integrations' && (
              <IntegrationsView onShowToast={showToast} />
            )}

            {activeTab === 'settings' && (
              <SettingsView onShowToast={showToast} />
            )}
          </main>
        </div>
      </div>

      {/* Slide-out Prospect Research & Email Drawer */}
      <ProspectDrawer
        prospect={selectedProspect}
        onClose={() => setSelectedProspect(null)}
        onUpdateProspectStatus={handleUpdateProspectStatus}
        onShowToast={showToast}
      />

      {/* Guided Campaign Creation Experience (4-Stage Pipeline) */}
      <CampaignWizard
        isOpen={isCampaignWizardOpen}
        onClose={() => setIsCampaignWizardOpen(false)}
        onLaunchCampaign={handleLaunchCampaign}
        onShowToast={showToast}
      />

      {/* Global Cmd+K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        prospects={prospects}
        campaigns={campaigns}
        onSelectProspect={(p) => {
          setSelectedProspect(p);
          setIsCommandPaletteOpen(false);
        }}
        onSelectCampaign={(c) => {
          setSelectedCampaign(c);
          setActiveTab('campaigns');
          setIsCommandPaletteOpen(false);
        }}
        onNavigate={(tab) => {
          setActiveTab(tab);
          if (tab === 'campaigns') setSelectedCampaign(null);
          setIsCommandPaletteOpen(false);
        }}
        onCreateCampaign={() => {
          setIsCommandPaletteOpen(false);
          setIsCampaignWizardOpen(true);
        }}
        onOpenResearch={() => {
          setIsCommandPaletteOpen(false);
          setActiveTab('research');
        }}
      />

      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
