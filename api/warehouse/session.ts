import {
  extractWarehouseTokenFromHeaders,
  verifySignedWarehouseToken,
} from './_auth';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end(JSON.stringify({ success: true, ok: true }));
    return;
  }

  try {
    const token = extractWarehouseTokenFromHeaders(req.headers);
    if (!token) {
      res.status(401).end(
        JSON.stringify({
          success: false,
          authenticated: false,
          message: 'No warehouse session found.',
          error: 'No warehouse session found.',
        })
      );
      return;
    }

    const session = verifySignedWarehouseToken(token);
    if (!session) {
      res.status(401).end(
        JSON.stringify({
          success: false,
          authenticated: false,
          message: 'Warehouse session has expired. Please log in again.',
          error: 'Warehouse session has expired. Please log in again.',
        })
      );
      return;
    }

    res.status(200).end(
      JSON.stringify({
        success: true,
        authenticated: true,
        message: 'Warehouse session valid',
        warehouse: {
          warehouseId: session.warehouseId,
          warehouseName: session.warehouseName,
          location: session.location,
          scannerDevice: session.scannerDevice,
          permittedDevices: session.permittedDevices,
        },
        session: {
          token: session.token,
          warehouseId: session.warehouseId,
          warehouseName: session.warehouseName,
          location: session.location,
          scannerDevice: session.scannerDevice,
          permittedDevices: session.permittedDevices,
          authenticatedAt: session.authenticatedAt,
        },
      })
    );
  } catch (err: any) {
    console.error('[Warehouse Session API Error]:', err?.message || err);
    res.status(500).end(
      JSON.stringify({
        success: false,
        authenticated: false,
        message: 'Internal server error',
        error: 'Internal server error',
      })
    );
  }
}
