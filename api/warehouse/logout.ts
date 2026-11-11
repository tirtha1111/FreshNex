import {
  extractWarehouseTokenFromHeaders,
  revokeWarehouseToken,
} from './_auth.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end(JSON.stringify({ success: true, ok: true }));
    return;
  }

  try {
    const token = extractWarehouseTokenFromHeaders(req.headers);
    if (token) {
      revokeWarehouseToken(token);
    }

    res.setHeader(
      'Set-Cookie',
      'freshnex_wh_token=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    );

    res.status(200).end(
      JSON.stringify({
        success: true,
        ok: true,
        message: 'Warehouse session logged out',
      })
    );
  } catch (err: any) {
    console.error('[Warehouse Logout API Error]:', err?.message || err);
    res.status(500).end(
      JSON.stringify({
        success: false,
        ok: false,
        message: 'Internal server error',
        error: 'Internal server error',
      })
    );
  }
}
