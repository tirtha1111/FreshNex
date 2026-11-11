import { WarehouseSession } from '../context/AuthContext';

export interface WarehouseLoginResponse {
  success: boolean;
  ok?: boolean;
  message: string;
  error?: string;
  warehouse?: {
    warehouseId: string;
    warehouseName?: string;
    location?: string;
    scannerDevice?: string;
    permittedDevices?: string[];
  };
  session?: WarehouseSession;
}

/**
 * Safely extracts a string error message from any unknown error or object,
 * preventing `[object Object]` rendering issues.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const value = error as Record<string, unknown>;

    if (typeof value.message === 'string') {
      return value.message;
    }

    if (typeof value.error === 'string') {
      return value.error;
    }

    try {
      const stringified = JSON.stringify(error);
      if (stringified && stringified !== '{}') {
        return stringified;
      }
    } catch {}
  }

  return 'An unexpected Warehouse login error occurred.';
}

/**
 * Resolves the production or development API endpoint URL.
 * Uses VITE_API_BASE_URL if configured, otherwise defaults to relative same-origin path.
 */
export function resolveWarehouseApiUrl(path: string): string {
  const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${rawBase}${cleanPath}`;
}

/**
 * Safely executes a JSON API call to the Warehouse authentication backend.
 * Validates HTTP status, Content-Type: application/json header, empty responses,
 * and HTML fallback pages before attempting JSON parsing.
 */
async function requestWarehouseJson<T>(
  endpointPath: string,
  options: RequestInit
): Promise<{ status: number; data: T }> {
  const url = resolveWarehouseApiUrl(endpointPath);
  const method = options.method || 'GET';

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
  } catch {
    if (import.meta.env.DEV) {
      console.warn(`[Warehouse Auth] ${method} ${url} -> Network failure`);
    }
    throw new Error(
      'Unable to reach the Warehouse authentication server. Please check your connection or backend deployment.'
    );
  }

  const status = res.status;
  const contentType = (res.headers.get('content-type') || '').toLowerCase();

  // Log only endpoint and HTTP status code in development mode (never passwords or tokens)
  if (import.meta.env.DEV) {
    console.info(`[Warehouse Auth] ${method} ${url} -> HTTP ${status} (${contentType || 'no-content-type'})`);
  }

  const rawBody = await res.text();
  const trimmedBody = rawBody.trim();

  // 1. Check for empty response body
  if (!trimmedBody) {
    throw new Error(
      `Warehouse authentication endpoint (${endpointPath}) returned an empty response (HTTP ${status}).`
    );
  }

  // 2. Check if backend or CDN/SPA router returned HTML instead of JSON
  const looksLikeHtml =
    contentType.includes('text/html') ||
    trimmedBody.startsWith('<!DOCTYPE') ||
    trimmedBody.startsWith('<!doctype') ||
    trimmedBody.startsWith('<html');

  if (looksLikeHtml) {
    throw new Error(
      `Warehouse authentication API (${endpointPath}) returned HTML instead of JSON (HTTP ${status}). Ensure backend API routes (/api/warehouse/*) are deployed and not rewritten to index.html.`
    );
  }

  // 3. Check Content-Type header and parse JSON safely
  let parsed: any;
  try {
    parsed = JSON.parse(trimmedBody);
  } catch {
    throw new Error(
      `Warehouse authentication server returned an invalid non-JSON response (HTTP ${status}, Content-Type: ${contentType || 'unknown'}).`
    );
  }

  if (!contentType.includes('application/json') && typeof parsed !== 'object') {
    throw new Error(
      `Unexpected response format from Warehouse authentication API (HTTP ${status}).`
    );
  }

  return { status, data: parsed as T };
}

/**
 * Authenticates a Warehouse operator using Warehouse ID and Password.
 */
export async function authenticateWarehouseCredentials(
  warehouseId: string,
  password: string
): Promise<WarehouseSession> {
  const cleanId = warehouseId.trim().toUpperCase();
  const cleanPass = password.trim();

  if (!cleanId || !cleanPass) {
    throw new Error('Please enter both your Warehouse ID and Password.');
  }

  const { status, data } = await requestWarehouseJson<WarehouseLoginResponse>(
    '/api/warehouse/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        warehouseId: cleanId,
        password: cleanPass,
      }),
    }
  );

  const isSuccess = status >= 200 && status < 300 && (data.success === true || data.ok === true);

  if (!isSuccess) {
    const serverMessage =
      data.message ||
      data.error ||
      (status === 401
        ? 'Invalid Warehouse ID or password'
        : status >= 500
        ? 'Internal server error'
        : 'Warehouse authentication failed.');
    throw new Error(serverMessage);
  }

  if (data.session && data.session.warehouseId && data.session.token) {
    return data.session;
  }

  if (data.warehouse && data.warehouse.warehouseId) {
    return {
      token: `wh_${Date.now()}`,
      warehouseId: data.warehouse.warehouseId,
      warehouseName: data.warehouse.warehouseName || 'FreshNex Warehouse',
      location: data.warehouse.location || 'Cold-Chain Hub',
      scannerDevice: data.warehouse.scannerDevice || 'FRESHNEX-WH-001',
      permittedDevices: data.warehouse.permittedDevices || ['YGS-FD-124', 'YGS-FD-001'],
      authenticatedAt: Date.now(),
    };
  }

  throw new Error('Warehouse login response was missing session details.');
}

/**
 * Ends the active Warehouse session on the backend.
 */
export async function terminateWarehouseSession(token?: string): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  await requestWarehouseJson<{ success: boolean; message?: string }>('/api/warehouse/logout', {
    method: 'POST',
    headers,
  });
}
