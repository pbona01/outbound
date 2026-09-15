import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
  Building2,
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
  const navigate = useNavigate();
  const { campaigns, prospects, inboxThreads, updateProspectStatus, addCampaign } = useAppState();
  const { showToast } = useToast();
  const { profile, user, signOut } = useAuth();
  const { workspace, workspaces, switchWorkspace } = useWorkspace();

  const handleSignOut = async () => {
    await signOut();
    showToast('Signed Out', 'You have been signed out.');
    navigate('/login', { replace: true });
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCampaignWizardOpen, setIsCampaignWizardOpen] = useState(false);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const selectedProspect = prospects.find(p => p.id === selectedProspectId) || null;

  const interestedInboxCount = inboxThreads.filter((t) => t.classification === 'interested').length;

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const workspaceName = workspace?.name || 'My Workspace';

  const getNavPath = (id: string) => {
    const isAppPrefix = location.pathname.startsWith('/app');
    const base = isAppPrefix ? '/app' : '';
    if (!id) return base || '/';
    return `${base}/${id}`;
  };

  const isNavActive = (id: string) => {
    const current = location.pathname;
    if (!id) {
      return current === '/' || current === '/app' || current === '/overview' || current === '/app/overview';
    }
    return current.startsWith(`/app/${id}`) || current.startsWith(`/${id}`);
  };

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
          <div className="p-4 border-b border-black/[0.06] relative">
            <div className="flex items-center justify-between">
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
                onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                className="p-1 rounded-md text-[#949494] hover:text-[#111111] hover:bg-stone-100 transition-colors"
                title="Switch Workspace"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Workspace Switcher Popover */}
            {isWorkspaceMenuOpen && (
              <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-black/10 rounded-2xl shadow-xl p-2 z-50">
                <p className="text-[10px] font-semibold text-[#888] uppercase px-2 py-1 tracking-wider">Workspaces</p>
                {workspaces.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      switchWorkspace(w.id);
                      setIsWorkspaceMenuOpen(false);
                      showToast('Workspace Switched', `Active workspace is now ${w.name}`);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                      w.id === workspace?.id ? 'bg-blue-50 text-[#3157FF] font-semibold' : 'hover:bg-stone-100 text-[#333]'
                    }`}
                  >
                    <span className="truncate">{w.name}</span>
                    <Building2 className="w-3.5 h-3.5 text-stone-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const toPath = getNavPath(item.id);
              const isActive = isNavActive(item.id);
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

          {/* Mailbox Status Card */}
          <div className="p-3 mx-3 mb-3 rounded-xl bg-[#F7F7F5] border border-black/[0.05] space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#686868] font-medium">Mailbox</span>
              <span className={`font-semibold ${workspace?.mailbox_provider && workspace.mailbox_provider !== 'Set up later' ? 'text-blue-700' : 'text-stone-500'}`}>
                {workspace?.mailbox_provider && workspace.mailbox_provider !== 'Set up later' ? workspace.mailbox_provider : 'Not connected'}
              </span>
            </div>
            <p className="text-[10px] text-[#888] leading-tight">
              {workspace?.mailbox_provider && workspace.mailbox_provider !== 'Set up later'
                ? 'Provider configured'
                : 'Connect a mailbox to enable sending'}
            </p>
          </div>

          {/* User Profile Bar */}
          <div className="p-3 border-t border-black/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-700 shrink-0 uppercase">
                {displayName.slice(0, 2)}
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

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-100 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
                  const toPath = getNavPath(item.id);
                  const isActive = isNavActive(item.id);
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

              {/* Mobile User Profile Bar */}
              <div className="p-3 border-t border-black/[0.06] flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-700 shrink-0 uppercase">
                    {displayName.slice(0, 2)}
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

                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    handleSignOut();
                  }}
                  className="p-2 rounded-lg text-stone-500 hover:text-red-600 hover:bg-stone-200 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
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
