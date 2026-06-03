import { getAccessToken } from './ml-auth.js';
import type { MlOrdersSearchResult } from './ml.types.js';

const BASE_URL = 'https://api.mercadolibre.com';

async function mlGet<T>(path: string): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ML API error (${response.status}) ${path}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchPaidOrdersSince(sellerId: number, since: Date): Promise<MlOrdersSearchResult> {
  const from = encodeURIComponent(since.toISOString());
  const path = `/orders/search?seller=${sellerId}&order.status=paid&sort=date_asc&date_created.from=${from}&limit=50`;
  return mlGet<MlOrdersSearchResult>(path);
}
