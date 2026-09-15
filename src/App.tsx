import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './lib/state/ToastContext';
import { AppStateProvider } from './lib/state/AppStateContext';
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
      <AppStateProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
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
    </ToastProvider>
  );
}
