import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
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
  ChevronDown,
  Menu,
  X,
  Search,
  Plus,
  Bell,
} from 'lucide-react';
import { useAppState } from '../../lib/state/AppStateContext';
import { useToast } from '../../lib/state/ToastContext';
import { useAuth } from '../../lib/auth/AuthProvider';
import { useWorkspace } from '../../lib/workspaces/WorkspaceProvider';
import { CommandPalette } from '../common/CommandPalette';
import { CampaignWizard } from '../campaigns/CampaignWizard';
import { ProspectDrawer } from '../prospects/ProspectDrawer';

export function AppLayout() {
  const location = useLocation();
  const { campaigns, prospects, inboxThreads, updateProspectStatus, addProspectsToCampaign, addCampaign } = useAppState();
  const { user, configured, signOut } = useAuth();
  const { workspace, workspaces, switchWorkspace } = useWorkspace();
  const { showToast } = useToast();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Your workspace';
  const displayEmail = user?.email || 'Connect Supabase to enable your account';
  const workspaceName = workspace?.name || user?.user_metadata?.workspace_name || (configured ? 'Your workspace' : 'GrowthStudio');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCampaignWizardOpen, setIsCampaignWizardOpen] = useState(false);
  
  // Example for drawer
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const selectedProspect = prospects.find(p => p.id === selectedProspectId) || null;

  const interestedInboxCount = inboxThreads.filter((t) => t.classification === 'interested').length;

  const navItems = [
    { id: '', label: 'Overview', icon: LayoutDashboard },
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
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
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
                  <span className="text-[11px] text-[#686868] truncate block">{workspaceName}</span>
              </div>
            </div>

            <button
              onClick={() => showToast('Workspace Switcher', `Currently on ${workspaceName}.`)}
              className="p-1 rounded-md text-[#949494] hover:text-[#111111] hover:bg-stone-100 transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const toPath = `/${item.id}`;
              const isActive = location.pathname === toPath || (item.id !== '' && location.pathname.startsWith(`/${item.id}`));
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={toPath}
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
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Stat / Deliverability Pill */}
          <div className="p-3 mx-3 mb-3 rounded-xl bg-[#F7F7F5] border border-black/[0.05] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#686868] font-medium">{configured ? 'Mailbox setup' : 'Mailbox Warmup'}</span>
              <span className={configured ? 'text-[#686868] font-semibold' : 'text-emerald-700 font-semibold'}>{configured ? 'Not connected' : '98% Health'}</span>
            </div>
            <div className="h-1 w-full bg-stone-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${configured ? 'bg-stone-300' : 'bg-emerald-500'}`} style={{ width: configured ? '12%' : '98%' }} />
            </div>
          </div>

          {/* User Profile Bar */}
          <div className="p-3 border-t border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-700 shrink-0">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-[13px] text-[#111111] truncate block leading-tight">
                  {displayName}
                </span>
                <span className="text-[11px] text-[#949494] truncate block font-mono">
                  {displayEmail}
                </span>
              </div>
            </div>
            {configured && <button onClick={() => signOut().catch(() => showToast('Sign out failed', 'Please try again.', 'error'))} className="text-[11px] text-[#686868] hover:text-[#111111]">Sign out</button>}
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
                  const toPath = `/${item.id}`;
                  const isActive = location.pathname === toPath || (item.id !== '' && location.pathname.startsWith(`/${item.id}`));
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={toPath}
                      onClick={() => setIsMobileSidebarOpen(false)}
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
                    </NavLink>
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
            </div>

            {/* Right: Search, Quick Action, Alerts */}
            <div className="flex items-center gap-2 sm:gap-3">
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

          <main className="flex-1 overflow-y-auto p-4 sm:p-7 max-w-7xl w-full mx-auto">
            <Outlet context={{ setSelectedProspectId, setIsCampaignWizardOpen }} />
          </main>
        </div>
      </div>

      <ProspectDrawer
        prospect={selectedProspect}
        onClose={() => setSelectedProspectId(null)}
        onUpdateProspectStatus={updateProspectStatus}
        onAddToCampaign={async (pId, cId) => {
          await addProspectsToCampaign([pId], cId);
        }}
        onShowToast={showToast}
      />

      <CampaignWizard
        isOpen={isCampaignWizardOpen}
        onClose={() => setIsCampaignWizardOpen(false)}
        onLaunchCampaign={addCampaign}
        onShowToast={showToast}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        prospects={prospects}
        campaigns={campaigns}
        onSelectProspect={(p) => setSelectedProspectId(p.id)}
        onSelectCampaign={() => {}}
        onNavigate={() => {}}
        onCreateCampaign={() => setIsCampaignWizardOpen(true)}
        onOpenResearch={() => {}}
      />
    </div>
  );
}
