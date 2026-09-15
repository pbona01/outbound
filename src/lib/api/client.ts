import { ApiClient } from './types';
import { MockApiClient } from './mockApi';
import { SupabaseApiClient } from './supabaseApi';
import { isSupabaseConfigured } from '../supabase';

let client: ApiClient;

export function getApiClient(): ApiClient {
  const metaEnv = (import.meta as any).env || {};
  const useMock = metaEnv.VITE_USE_MOCK_API === 'true';

  if (!client) {
    if (useMock) {
      client = new MockApiClient();
    } else {
      client = new SupabaseApiClient();
    }
  }
  return client;
}

