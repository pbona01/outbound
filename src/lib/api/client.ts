import { ApiClient } from './types';
import { MockApiClient } from './mockApi';
import { SupabaseApiClient } from './supabaseApi';

let client: ApiClient | null = null;

export function getApiClient(): ApiClient {
  // Mock data is opt-in for local demos only. A missing Supabase config must
  // never silently turn the production UI into a fake workspace.
  const useMock = import.meta.env.VITE_USE_MOCK_API === 'true';

  if (!client) {
    if (useMock) {
      client = new MockApiClient();
    } else {
      client = new SupabaseApiClient();
    }
  }
  return client;
}

