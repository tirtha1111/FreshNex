import crypto from 'crypto';

export interface WarehouseAccount {
  warehouseId: string;
  warehouseName: string;
  location: string;
  scannerDevice: string;
  permittedDevices: string[];
  salt: string;
  passwordHash: string; // PBKDF2 SHA-512
  altPasswordHash?: string;
}

export interface WarehouseSessionPayload {
  token: string;
  warehouseId: string;
  warehouseName: string;
  location: string;
  scannerDevice: string;
  permittedDevices: string[];
  authenticatedAt: number;
  expiresAt: number;
}

export function computePbkdf2Hash(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

const WH001_SALT = 'freshnex_wh001_secure_salt_7f9b8c2d1e';
const WH002_SALT = 'freshnex_wh002_secure_salt_4a3e2b1c0f';

const WH001_HASH_1 = computePbkdf2Hash('warehouse123', WH001_SALT);
const WH001_HASH_2 = computePbkdf2Hash('FreshNex@WH001', WH001_SALT);
const WH002_HASH = computePbkdf2Hash('warehouse123', WH002_SALT);

export const WAREHOUSE_ACCOUNTS: Record<string, WarehouseAccount> = {
  'WH-001': {
    warehouseId: 'WH-001',
    warehouseName: 'Central FreshNex Hub',
    location: 'Zone A - Cold Storage & Quality Control Facility',
    scannerDevice: 'FRESHNEX-WH-001',
    permittedDevices: ['YGS-FD-124', 'YGS-FD-001'],
    salt: WH001_SALT,
    passwordHash: WH001_HASH_1,
    altPasswordHash: WH001_HASH_2,
  },
  'WH-002': {
    warehouseId: 'WH-002',
    warehouseName: 'North Distribution Facility',
    location: 'Zone B - Dry Transit Logistics Depot',
    scannerDevice: 'FRESHNEX-WH-002',
    permittedDevices: ['YGS-FD-200', 'YGS-FD-201'],
    salt: WH002_SALT,
    passwordHash: WH002_HASH,
  },
};

const SESSION_SECRET =
  process.env.WAREHOUSE_SESSION_SECRET ||
  process.env.FIREBASE_API_KEY ||
  'freshnex_wh_hmac_signing_secret_9a8b7c6d5e4f';

export const activeWarehouseSessions = new Map<string, WarehouseSessionPayload>();
const revokedTokens = new Set<string>();

/**
 * Creates a stateless HMAC-SHA256 signed token so sessions remain valid
 * across serverless cold starts (e.g. Vercel functions) as well as stateful Express.
 */
export function createSignedWarehouseToken(account: WarehouseAccount): WarehouseSessionPayload {
  const now = Date.now();
  const expiresAt = now + 12 * 60 * 60 * 1000; // 12 hours
  const nonce = crypto.randomBytes(12).toString('hex');

  const payloadObj = {
    warehouseId: account.warehouseId,
    warehouseName: account.warehouseName,
    location: account.location,
    scannerDevice: account.scannerDevice,
    permittedDevices: account.permittedDevices,
    authenticatedAt: now,
    expiresAt,
    nonce,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payloadObj), 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  const token = `${payloadB64}.${signature}`;

  const record: WarehouseSessionPayload = {
    token,
    warehouseId: account.warehouseId,
    warehouseName: account.warehouseName,
    location: account.location,
    scannerDevice: account.scannerDevice,
    permittedDevices: account.permittedDevices,
    authenticatedAt: now,
    expiresAt,
  };

  activeWarehouseSessions.set(token, record);
  return record;
}

export function verifySignedWarehouseToken(token: string | null | undefined): WarehouseSessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const clean = token.trim();
  if (!clean || revokedTokens.has(clean)) return null;

  // Check in-memory cache first
  if (activeWarehouseSessions.has(clean)) {
    const cached = activeWarehouseSessions.get(clean)!;
    if (Date.now() <= cached.expiresAt) {
      return cached;
    }
    activeWarehouseSessions.delete(clean);
    return null;
  }

  // Verify stateless HMAC-SHA256 signed token
  const parts = clean.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, providedSig] = parts;

  try {
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');

    const sigBuf = Buffer.from(providedSig, 'utf-8');
    const expBuf = Buffer.from(expectedSig, 'utf-8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (!decoded || !decoded.warehouseId || !decoded.expiresAt) return null;
    if (Date.now() > Number(decoded.expiresAt)) return null;

    const account = WAREHOUSE_ACCOUNTS[decoded.warehouseId];
    if (!account) return null;

    const sessionRecord: WarehouseSessionPayload = {
      token: clean,
      warehouseId: account.warehouseId,
      warehouseName: account.warehouseName,
      location: account.location,
      scannerDevice: account.scannerDevice,
      permittedDevices: account.permittedDevices,
      authenticatedAt: Number(decoded.authenticatedAt) || Date.now(),
      expiresAt: Number(decoded.expiresAt),
    };

    activeWarehouseSessions.set(clean, sessionRecord);
    return sessionRecord;
  } catch {
    return null;
  }
}

export function revokeWarehouseToken(token: string | null | undefined): void {
  if (!token) return;
  const clean = token.trim();
  revokedTokens.add(clean);
  activeWarehouseSessions.delete(clean);
}

export function extractWarehouseTokenFromHeaders(headers: Record<string, any> | undefined): string | null {
  if (!headers) return null;
  const authHeader = headers.authorization || headers.Authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = headers['x-warehouse-session'] || headers['X-Warehouse-Session'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }
  const cookieHeader = headers.cookie || headers.Cookie;
  if (typeof cookieHeader === 'string') {
    const match = cookieHeader.match(/freshnex_wh_token=([^;]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

export function verifyWarehousePassword(account: WarehouseAccount, cleanPass: string): boolean {
  const computedHash = computePbkdf2Hash(cleanPass, account.salt);
  let isPasswordValid = false;
  try {
    const hashBuf = Buffer.from(computedHash, 'hex');
    const expectedBuf1 = Buffer.from(account.passwordHash, 'hex');
    if (hashBuf.length === expectedBuf1.length && crypto.timingSafeEqual(hashBuf, expectedBuf1)) {
      isPasswordValid = true;
    } else if (account.altPasswordHash) {
      const expectedBuf2 = Buffer.from(account.altPasswordHash, 'hex');
      if (hashBuf.length === expectedBuf2.length && crypto.timingSafeEqual(hashBuf, expectedBuf2)) {
        isPasswordValid = true;
      }
    }
  } catch {
    isPasswordValid = false;
  }

  if (
    !isPasswordValid &&
    process.env.WAREHOUSE_PASSWORD &&
    cleanPass === process.env.WAREHOUSE_PASSWORD
  ) {
    isPasswordValid = true;
  }

  return isPasswordValid;
}
