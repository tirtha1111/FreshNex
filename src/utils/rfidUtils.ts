export interface RFIDRegistryRecord {
  device_id?: string;
  product?: string;
  active?: boolean;
}

const FIREBASE_PUSH_CHARS =
  '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

/**
 * Normalizes an RFID card UID consistently (trims whitespace, converts to uppercase).
 */
export function normalizeRfidUid(rawUid: unknown): string {
  if (rawUid === null || rawUid === undefined) return '';
  return String(rawUid).trim().toUpperCase();
}

/**
 * Decodes the creation timestamp (in Unix milliseconds) encoded in the first 8 characters
 * of a standard Firebase Realtime Database push ID.
 * Returns null if the key is not a valid Firebase push ID or falls outside a sane calendar window.
 */
export function decodeFirebasePushIdTimestamp(pushKey: string): number | null {
  if (!pushKey || typeof pushKey !== 'string' || pushKey.length < 8 || pushKey[0] !== '-') {
    return null;
  }

  let timestamp = 0;
  for (let i = 0; i < 8; i++) {
    const idx = FIREBASE_PUSH_CHARS.indexOf(pushKey[i]);
    if (idx === -1) return null;
    timestamp = timestamp * 64 + idx;
  }

  // Sanity range: 2020-01-01T00:00:00Z to 2040-01-01T00:00:00Z
  if (timestamp >= 1577836800000 && timestamp <= 2208988800000) {
    return timestamp;
  }
  return null;
}

/**
 * Resolves a reliable real-world Unix millisecond timestamp for an RFID scan record.
 * Note: ESP32 `detected_at_ms` (from local `millis()`) is an uptime counter, NOT a Unix epoch,
 * so values below 1,600,000,000 (Sep 2020) are never treated as calendar timestamps.
 */
export function resolveRfidScanTimestamp(
  scanKey: string,
  record: Record<string, any> | null | undefined,
  fallbackReceivedAt?: number
): number {
  const epochCandidates = [
    record?.timestamp_ms,
    record?.received_at_ms,
    record?.server_timestamp_ms,
    record?.timestamp,
  ];

  for (const candidate of epochCandidates) {
    if (candidate === undefined || candidate === null || candidate === '') continue;
    const num = Number(candidate);
    if (!Number.isFinite(num) || num <= 0) continue;

    // Unix seconds (10-digit, >= Sep 2020)
    if (num >= 1600000000 && num < 10000000000) {
      return num * 1000;
    }
    // Unix milliseconds (13-digit, >= Sep 2020)
    if (num >= 1600000000000 && num <= 2500000000000) {
      return num;
    }
  }

  const pushKeyTs = decodeFirebasePushIdTimestamp(scanKey);
  if (pushKeyTs !== null) {
    return pushKeyTs;
  }

  return fallbackReceivedAt ?? Date.now();
}

/**
 * Looks up an RFID registry entry case-insensitively by normalized UID.
 */
export function findRegistryEntryByUid<T extends RFIDRegistryRecord>(
  registryMap: Record<string, T> | null | undefined,
  normalizedUid: string
): T | undefined {
  if (!registryMap || !normalizedUid) return undefined;
  if (registryMap[normalizedUid] && typeof registryMap[normalizedUid] === 'object') {
    return registryMap[normalizedUid];
  }
  for (const [k, v] of Object.entries(registryMap)) {
    if (normalizeRfidUid(k) === normalizedUid && v && typeof v === 'object') {
      return v;
    }
  }
  return undefined;
}
