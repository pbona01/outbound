import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider } from './lib/state/ToastContext';
import { AppStateProvider } from './lib/state/AppStateContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthProvider, useAuth } from './lib/auth/AuthProvider';
import { WorkspaceProvider } from './lib/workspaces/WorkspaceProvider';
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
  const navigate = useNavigate();
  if (!configured) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/signin" replace />;

  const complete = async (profile: OnboardingProfile) => {
    if (!supabase) return;
    const slug = profile.workspaceName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || `workspace-${Date.now()}`;
    const { data: workspace, error: workspaceError } = await supabase.from('workspaces').insert({ name: profile.workspaceName, slug, owner_id: user.id, industry: profile.industry, geography: profile.geography, company_size: profile.companySize, offer: profile.offer }).select().single();
    if (workspaceError) throw workspaceError;
    const { error: memberError } = await supabase.from('workspace_members').insert({ workspace_id: workspace.id, user_id: user.id, role: 'owner' });
    if (memberError) throw memberError;
    const { error: profileError } = await supabase.from('profiles').upsert({ id: user.id, email: user.email, full_name: user.user_metadata?.full_name || '', role: profile.role, onboarding_completed: true });
    if (profileError) throw profileError;
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
