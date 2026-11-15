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
    const dbUrl = (cfg.databaseURL || 'https://freshnex-9bf3f-default-rtdb.firebaseio.com').replace(/\/$/, '');
    const authParam = token ? `?auth=${encodeURIComponent(token)}` : '';

    const [warehouseRes, deviceScansRes] = await Promise.all([
      fetch(`${dbUrl}/warehouse_scans.json${authParam}`),
      fetch(`${dbUrl}/devices/YGS-FD-124/rfid_scans.json${authParam}`),
    ]);

    if (!warehouseRes.ok && !deviceScansRes.ok) {
      res.status(warehouseRes.status).end(
        JSON.stringify({
          success: false,
          message: 'Failed to fetch warehouse scans',
          error: 'Failed to fetch warehouse scans',
        })
      );
      return;
    }

    const merged: Record<string, any> = {};

    if (warehouseRes.ok) {
      const warehouseData = await warehouseRes.json();
      if (warehouseData && typeof warehouseData === 'object') {
        for (const [key, val] of Object.entries(warehouseData)) {
          if (val && typeof val === 'object') {
            merged[key] = { ...(val as Record<string, any>), source: 'warehouse_scans', source_key: key };
          }
        }
      }
    }

    if (deviceScansRes.ok) {
      const deviceScansData = await deviceScansRes.json();
      if (deviceScansData && typeof deviceScansData === 'object') {
        for (const [key, val] of Object.entries(deviceScansData)) {
          if (val && typeof val === 'object') {
            merged[`device_rfid_scans_${key}`] = {
              ...(val as Record<string, any>),
              source: 'device_rfid_scans',
              source_key: key,
            };
          }
        }
      }
    }

    res.status(200).end(JSON.stringify(merged));
    return;
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
