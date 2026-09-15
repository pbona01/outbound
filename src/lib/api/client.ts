import { ApiClient } from './types';
import { MockApiClient } from './mockApi';
import { SupabaseApiClient } from './supabaseApi';

let client: ApiClient;

export function getApiClient(): ApiClient {
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
