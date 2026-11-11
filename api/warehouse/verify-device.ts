import {
  WAREHOUSE_ACCOUNTS,
  extractWarehouseTokenFromHeaders,
  verifySignedWarehouseToken,
} from './_auth';

function parseRequestBody(body: any): Record<string, any> {
  if (!body) return {};
  if (typeof body === 'object' && !Buffer.isBuffer(body)) return body;
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
        allowed: false,
        message: 'Method not allowed. Use POST.',
        error: 'Method not allowed. Use POST.',
      })
    );
    return;
  }

  try {
    const token = extractWarehouseTokenFromHeaders(req.headers);
    const parsedBody = parseRequestBody(req.body);
    const { deviceId = '', warehouseId = '' } = parsedBody;
    const targetDeviceId = String(deviceId).trim();
    let targetWarehouseId = String(warehouseId).trim().toUpperCase();

    if (token) {
      const session = verifySignedWarehouseToken(token);
      if (session) {
        targetWarehouseId = session.warehouseId;
      }
    }

    if (!targetWarehouseId || !targetDeviceId) {
      res.status(400).end(
        JSON.stringify({
          success: false,
          allowed: false,
          message: 'Warehouse ID and Device ID are required.',
          error: 'Warehouse ID and Device ID are required.',
        })
      );
      return;
    }

    const account = WAREHOUSE_ACCOUNTS[targetWarehouseId];
    if (!account) {
      res.status(403).end(
        JSON.stringify({
          success: false,
          allowed: false,
          message: 'Access denied. Unknown warehouse account.',
          error: 'Access denied. Unknown warehouse account.',
        })
      );
      return;
    }

    const isPermitted = account.permittedDevices.some(
      (d) => d.toUpperCase() === targetDeviceId.toUpperCase()
    );

    if (!isPermitted) {
      res.status(403).end(
        JSON.stringify({
          success: false,
          allowed: false,
          warehouseId: targetWarehouseId,
          deviceId: targetDeviceId,
          message: 'Access denied. This product is not assigned to your warehouse.',
          error: 'Access denied. This product is not assigned to your warehouse.',
        })
      );
      return;
    }

    res.status(200).end(
      JSON.stringify({
        success: true,
        allowed: true,
        warehouseId: targetWarehouseId,
        deviceId: targetDeviceId,
        scannerDevice: account.scannerDevice,
      })
    );
  } catch (err: any) {
    console.error('[Warehouse Verify-Device API Error]:', err?.message || err);
    res.status(500).end(
      JSON.stringify({
        success: false,
        allowed: false,
        message: 'Internal server error',
        error: 'Internal server error',
      })
    );
  }
}
