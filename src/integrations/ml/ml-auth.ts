import { db } from '../../database/db.js';

const ML_TOKEN_URL = 'https://api.mercadolibre.com/oauth/token';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getRefreshToken(): Promise<string> {
  const result = await db.query<{ value: string }>(
    `SELECT value FROM integration_config WHERE key = 'ml_refresh_token'`
  );

  if (result.rows.length > 0) {
    return result.rows[0].value;
  }

  // Bootstrap: na primeira execução lê do .env e salva no banco
  const envToken = process.env.ML_REFRESH_TOKEN;
  if (!envToken) {
    throw new Error('ml_refresh_token não encontrado no banco nem em ML_REFRESH_TOKEN no .env');
  }

  await db.query(
    `INSERT INTO integration_config (key, value) VALUES ('ml_refresh_token', $1)`,
    [envToken]
  );

  return envToken;
}

export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const refreshToken = await getRefreshToken();

  const response = await fetch(ML_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID!,
      client_secret: process.env.SECRET_KEY!,
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha na autenticação ML (${response.status}): ${body}`);
  }

  const data = await response.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  // Salva o novo refresh_token (rotativo — o anterior expira imediatamente)
  await db.query(
    `INSERT INTO integration_config (key, value)
     VALUES ('ml_refresh_token', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
    [data.refresh_token]
  );

  // Cache em memória com margem de 5 minutos
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

  return data.access_token;
}
