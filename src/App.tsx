import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastProvider } from './lib/state/ToastContext';
import { AuthProvider } from './lib/auth/AuthProvider';
import { WorkspaceProvider } from './lib/workspaces/WorkspaceProvider';
import { AppStateProvider } from './lib/state/AppStateContext';
import { ProtectedRoute } from './lib/auth/ProtectedRoute';

import { AppLayout } from './components/layout/AppLayout';
import { LoginView } from './components/auth/LoginView';
import { SignUpView } from './components/auth/SignUpView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

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

function OnboardingRouteWrapper() {
  const navigate = useNavigate();
  return <OnboardingFlow onComplete={() => navigate('/', { replace: true })} />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <AppStateProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<LoginView />} />
                <Route path="/signup" element={<SignUpView />} />
                <Route path="/forgot-password" element={<ForgotPasswordView />} />
                
                {/* Onboarding Flow Route */}
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute>
                      <OnboardingRouteWrapper />
                    </ProtectedRoute>
                  }
                />

                {/* Main Protected Application Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
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
            </BrowserRouter>
          </AppStateProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
