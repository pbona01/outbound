import { ApiClient } from './types';
import { MockApiClient } from './mockApi';
import { SupabaseApiClient } from './supabaseApi';
import { isSupabaseConfigured } from '../supabase';

let client: ApiClient | null = null;

export function getApiClient(): ApiClient {
  const useMock = import.meta.env.VITE_USE_MOCK_API === 'true' || !isSupabaseConfigured;

  if (!client) {
    if (useMock) {
      client = new MockApiClient();
    } else {
      client = new SupabaseApiClient();
    }
  }
  return client;
}

