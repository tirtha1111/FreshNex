import {
  WAREHOUSE_ACCOUNTS,
  verifyWarehousePassword,
  createSignedWarehouseToken,
} from './_auth';

function parseRequestBody(body: any): Record<string, any> {
  if (!body) return {};
  if (typeof body === 'object' && !Buffer.isBuffer(body)) {
    return body;
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end(JSON.stringify({ success: true, ok: true }));
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).end(
      JSON.stringify({
        success: false,
        ok: false,
        message: 'Method not allowed. Use POST.',
        error: 'Method not allowed. Use POST.',
      })
    );
    return;
  }

  try {
    const parsedBody = parseRequestBody(req.body);
    const { warehouseId = '', password = '' } = parsedBody;
    const normId = String(warehouseId).trim().toUpperCase();
    const cleanPass = String(password).trim();

    if (!normId || !cleanPass) {
      res.status(400).end(
        JSON.stringify({
          success: false,
          ok: false,
          message: 'Warehouse ID and password are required',
          error: 'Warehouse ID and password are required',
        })
      );
      return;
    }

    const account = WAREHOUSE_ACCOUNTS[normId];
    if (!account) {
      res.status(401).end(
        JSON.stringify({
          success: false,
          ok: false,
          message: 'Invalid Warehouse ID or password',
          error: 'Invalid Warehouse ID or password',
        })
      );
      return;
    }

    const isPasswordValid = verifyWarehousePassword(account, cleanPass);
    if (!isPasswordValid) {
      res.status(401).end(
        JSON.stringify({
          success: false,
          ok: false,
          message: 'Invalid Warehouse ID or password',
          error: 'Invalid Warehouse ID or password',
        })
      );
      return;
    }

    const sessionRecord = createSignedWarehouseToken(account);

    res.setHeader(
      'Set-Cookie',
      `freshnex_wh_token=${sessionRecord.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${12 * 3600}`
    );

    const sessionPayload = {
      token: sessionRecord.token,
      warehouseId: sessionRecord.warehouseId,
      warehouseName: sessionRecord.warehouseName,
      location: sessionRecord.location,
      scannerDevice: sessionRecord.scannerDevice,
      permittedDevices: sessionRecord.permittedDevices,
      authenticatedAt: sessionRecord.authenticatedAt,
    };

    res.status(200).end(
      JSON.stringify({
        success: true,
        ok: true,
        message: 'Warehouse login successful',
        warehouse: {
          warehouseId: sessionRecord.warehouseId,
          warehouseName: sessionRecord.warehouseName,
          location: sessionRecord.location,
          scannerDevice: sessionRecord.scannerDevice,
          permittedDevices: sessionRecord.permittedDevices,
        },
        session: sessionPayload,
      })
    );
  } catch (err: any) {
    console.error('[Warehouse Login API Error]:', err?.message || err);
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
