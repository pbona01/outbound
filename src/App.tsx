import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider } from './lib/state/ToastContext';
import { AppStateProvider } from './lib/state/AppStateContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider, useAuth } from './lib/auth/AuthProvider';
import { WorkspaceProvider, useWorkspace } from './lib/workspaces/WorkspaceProvider';
import { supabase } from './lib/supabase';
import { AuthPage } from './components/auth/AuthPage';
import { LandingPage } from './components/marketing/LandingPage';
import { OnboardingFlow, type OnboardingProfile } from './components/onboarding/OnboardingFlow';
import { OverviewView } from './components/dashboard/OverviewView';
import { CampaignListView } from './components/campaigns/CampaignListView';
import { CampaignDetailView } from './components/campaigns/CampaignDetailView';
import { ProspectDiscoveryView } from './components/prospects/ProspectDiscoveryView';
import { InboxView } from './components/inbox/InboxView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { AiResearchLabView } from './components/research/AiResearchLabView';
import { SequencesView } from './components/sequences/SequencesView';
import { IntegrationsView } from './components/integrations/IntegrationsView';
import { SettingsView } from './components/settings/SettingsView';

function AuthLoading() {
  return <main className="min-h-screen bg-[#f5f5f2] flex items-center justify-center text-sm text-[#686868]">Loading your Outbound workspace…</main>;
}

function RootRoute() {
  const { user, loading, configured } = useAuth();
  const location = useLocation();
  if (!configured) return <AppLayout />;
  if (loading) return <AuthLoading />;
  if (!user) return location.pathname === '/' ? <LandingPage /> : <Navigate to="/signin" replace />;
  return <AppLayout />;
}

function OnboardingRoute() {
  const { user, configured } = useAuth();
  const { workspace, workspaces, isLoading: isWorkspaceLoading, createWorkspace, refreshWorkspaces } = useWorkspace();
  const navigate = useNavigate();

  if (!configured) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/signin" replace />;
  
  // Idempotency: If the user already has an active workspace, route directly to the dashboard
  if (!isWorkspaceLoading && (workspace || workspaces.length > 0)) {
    return <Navigate to="/" replace />;
  }

  const complete = async (profile: OnboardingProfile) => {
    if (!supabase) return;

    // Check if user already owns or belongs to a workspace (double-check race conditions)
    const { data: existingMemberships } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1);

    if (existingMemberships && existingMemberships.length > 0) {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        role: profile.role,
        onboarding_completed: true,
      });
      await refreshWorkspaces();
      navigate('/', { replace: true });
      return;
    }

    // Create new workspace and member link
    await createWorkspace({
      name: profile.workspaceName,
      industry: profile.industry,
      geography: profile.geography,
      company_size: profile.companySize,
      offer: profile.offer,
      mailbox_provider: profile.mailboxProvider,
    });

    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      role: profile.role,
      onboarding_completed: true,
    });

    navigate('/', { replace: true });
  };

  return <OnboardingFlow onComplete={complete} />;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <AppStateProvider>
              <Routes>
                <Route path="/signin" element={<AuthPage mode="signin" />} />
                <Route path="/signup" element={<AuthPage mode="signup" />} />
                <Route path="/forgot-password" element={<AuthPage mode="reset" />} />
                <Route path="/onboarding" element={<OnboardingRoute />} />
                <Route path="/" element={<RootRoute />}>
                  <Route index element={<OverviewView />} />
                  <Route path="campaigns" element={<CampaignListView />} />
                  <Route path="campaigns/:id" element={<CampaignDetailView />} />
                  <Route path="prospects" element={<ProspectDiscoveryView />} />
                  <Route path="inbox" element={<InboxView />} />
                  <Route path="sequences" element={<SequencesView />} />
                  <Route path="analytics" element={<AnalyticsView />} />
                  <Route path="research" element={<AiResearchLabView />} />
                  <Route path="integrations" element={<IntegrationsView />} />
                  <Route path="settings" element={<SettingsView />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </AppStateProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}
