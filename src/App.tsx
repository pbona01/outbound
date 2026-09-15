import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './lib/state/ToastContext';
import { AuthProvider } from './lib/auth/AuthProvider';
import { WorkspaceProvider } from './lib/workspaces/WorkspaceProvider';
import { AppStateProvider } from './lib/state/AppStateContext';

// Auth Route Guards
import {
  ProtectedRoute,
  PublicRoute,
  OnboardingRoute,
  RootRoute,
} from './lib/auth/RouteGuards';

// Public & Auth Pages
import { LandingPage } from './components/marketing/LandingPage';
import { SigninPage } from './components/auth/SigninPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

// Authenticated Dashboard Layout & Views
import { AppLayout } from './components/layout/AppLayout';
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

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <AppStateProvider>
            <BrowserRouter>
              <Routes>
                {/* Root Route:
                    - Unauthenticated -> Public Outbound landing page
                    - Authenticated + Incomplete Onboarding -> /onboarding
                    - Authenticated + Complete Onboarding -> /app (Dashboard)
                */}
                <Route path="/" element={<RootRoute />} />

                {/* Public Authentication Routes */}
                <Route
                  path="/signin"
                  element={
                    <PublicRoute>
                      <SigninPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <SigninPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <SignupPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPasswordPage />
                    </PublicRoute>
                  }
                />

                {/* Onboarding Flow Route */}
                <Route
                  path="/onboarding"
                  element={
                    <OnboardingRoute>
                      <OnboardingFlow />
                    </OnboardingRoute>
                  }
                />

                {/* Authenticated Dashboard Core (/app/*) */}
                <Route
                  path="/app"
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
                </Route>

                {/* Direct Dashboard Aliases / Redirects to /app/* */}
                <Route path="/overview" element={<Navigate to="/app" replace />} />
                <Route path="/campaigns" element={<Navigate to="/app/campaigns" replace />} />
                <Route path="/campaigns/:id" element={<Navigate to="/app/campaigns/:id" replace />} />
                <Route path="/prospects" element={<Navigate to="/app/prospects" replace />} />
                <Route path="/inbox" element={<Navigate to="/app/inbox" replace />} />
                <Route path="/sequences" element={<Navigate to="/app/sequences" replace />} />
                <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
                <Route path="/research" element={<Navigate to="/app/research" replace />} />
                <Route path="/integrations" element={<Navigate to="/app/integrations" replace />} />
                <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

                {/* Catch-all Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AppStateProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
