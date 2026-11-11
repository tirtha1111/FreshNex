import fs from 'fs';
import path from 'path';

function getFirebaseConfig(): { apiKey?: string; databaseURL?: string } {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch {
    // fallback to env vars
  }
  return {
    apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
    databaseURL:
      process.env.VITE_FIREBASE_DATABASE_URL ||
      'https://freshnex-9bf3f-default-rtdb.firebaseio.com',
  };
}

let cachedIdToken: string | null = null;
let cachedIdTokenExpiry = 0;

async function getServerIdToken(apiKey?: string): Promise<string | null> {
  const now = Date.now();
  if (cachedIdToken && now < cachedIdTokenExpiry) {
    return cachedIdToken;
  }
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnSecureToken: true }),
      }
    );
    if (res.ok) {
      const data: any = await res.json();
      if (data?.idToken) {
        cachedIdToken = data.idToken;
        cachedIdTokenExpiry = now + 50 * 60 * 1000;
        return cachedIdToken;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end(JSON.stringify({}));
    return;
  }

  try {
    const cfg = getFirebaseConfig();
    const token = await getServerIdToken(cfg.apiKey);
    const dbUrl = cfg.databaseURL || 'https://freshnex-9bf3f-default-rtdb.firebaseio.com';
    const authParam = token ? `?auth=${encodeURIComponent(token)}` : '';
    const rtdbRes = await fetch(`${dbUrl.replace(/\/$/, '')}/rfid_registry.json${authParam}`);
    if (rtdbRes.ok) {
      const data = await rtdbRes.json();
      res.status(200).end(JSON.stringify(data || {}));
      return;
    }
    res.status(rtdbRes.status).end(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch rfid registry',
        error: 'Failed to fetch rfid registry',
      })
    );
  } catch (err: any) {
    res.status(500).end(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: err?.message || 'Internal server error',
      })
    );
  }
}
