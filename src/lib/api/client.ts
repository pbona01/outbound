import { ApiClient } from './types';
import { MockApiClient } from './mockApi';

let client: ApiClient;

export function getApiClient(): ApiClient {
  if (!client) {
    client = new MockApiClient();
  }
  return client;
}
