/**
 * FreshNex Timestamp & Date Utilities
 * 
 * Safely parses and normalizes timestamps from ESP32 micro-nodes, Firebase Realtime Database,
 * and Firestore payloads across all formats:
 * - Epoch in seconds (10-digit UNIX e.g., 1758784800 -> 1758784800000)
 * - Epoch in milliseconds (13-digit e.g., 1758784800000)
 * - ISO-8601 strings (e.g., "2026-09-25T07:15:00.000Z")
 * - Firestore Timestamp objects ({ seconds, nanoseconds } or { _seconds, _nanoseconds })
 * - Object payloads with multiple timestamp fields (last_seen, last_update, timestamp, etc.)
 * - Date objects
 */

export function parseTimestamp(val: any): number {
  if (val === null || val === undefined || val === '') {
    return Date.now();
  }

  // 1. Direct number check
  if (typeof val === 'number') {
    if (isNaN(val) || val <= 0) return Date.now();
    // 10-digit seconds timestamp (e.g. 1758784800) -> convert to milliseconds
    if (val < 10000000000) {
      return val * 1000;
    }
    return val;
  }

  // 2. String representation
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return Date.now();

    // Numeric string check
    const num = Number(trimmed);
    if (!isNaN(num) && num > 0) {
      if (num < 10000000000) {
        return num * 1000;
      }
      return num;
    }

    // ISO string or formatted date string
    const parsed = Date.parse(trimmed);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  // 3. Firestore / Firebase Timestamp object or custom object
  if (typeof val === 'object') {
    if (val instanceof Date) {
      return val.getTime();
    }
    if (typeof val.toMillis === 'function') {
      return val.toMillis();
    }
    if (typeof val.toDate === 'function') {
      return val.toDate().getTime();
    }
    if (val.seconds !== undefined && Number.isFinite(val.seconds)) {
      return val.seconds * 1000 + (val.nanoseconds ? Math.floor(val.nanoseconds / 1000000) : 0);
    }
    if (val._seconds !== undefined && Number.isFinite(val._seconds)) {
      return val._seconds * 1000 + (val._nanoseconds ? Math.floor(val._nanoseconds / 1000000) : 0);
    }

    // If it's a telemetry payload object containing timestamp properties, extract the latest one
    return extractLatestTimestamp(val);
  }

  return Date.now();
}

/**
 * Extracts the latest valid timestamp from any telemetry / device payload or timestamp input.
 * Inspects all possible timestamp fields (last_seen, last_update, timestamp, time, updated_at, etc.)
 * and returns the most recent timestamp.
 */
export function extractLatestTimestamp(payload: any, fallback?: number): number {
  if (payload === null || payload === undefined) {
    return fallback ?? Date.now();
  }

  if (typeof payload === 'number') {
    return parseTimestamp(payload);
  }

  if (typeof payload === 'string') {
    return parseTimestamp(payload);
  }

  if (typeof payload === 'object') {
    // If it's a Date or Firestore Timestamp
    if (payload instanceof Date || typeof payload.toMillis === 'function' || typeof payload.toDate === 'function') {
      return parseTimestamp(payload);
    }

    // Collect all candidate timestamps from common hardware / cloud keys
    const candidates: number[] = [];

    const keysToCheck = [
      'last_seen',
      'lastSeen',
      'last_response',
      'lastResponse',
      'timestamp',
      'time',
      'last_update',
      'lastUpdated',
      'last_updated',
      'updated_at',
      'updatedAt',
      'dateTime',
      'datetime',
      'date'
    ];

    for (const k of keysToCheck) {
      if (payload[k] !== undefined && payload[k] !== null && payload[k] !== '') {
        const parsed = parseTimestamp(payload[k]);
        if (parsed > 0) {
          candidates.push(parsed);
        }
      }
    }

    // Also check if payload has a nested child object (e.g. payload[lastKey] when RTDB stores nested push keys)
    const childKeys = Object.keys(payload);
    if (childKeys.length > 0) {
      const lastKey = childKeys[childKeys.length - 1];
      if (typeof payload[lastKey] === 'object' && payload[lastKey] !== null) {
        for (const k of keysToCheck) {
          if (payload[lastKey][k] !== undefined && payload[lastKey][k] !== null && payload[lastKey][k] !== '') {
            const parsed = parseTimestamp(payload[lastKey][k]);
            if (parsed > 0) {
              candidates.push(parsed);
            }
          }
        }
      }
    }

    if (candidates.length > 0) {
      // Pick the most recent timestamp among all candidates
      const maxTs = Math.max(...candidates);
      // Cap slightly in the future if clock drift > 2 minutes
      const now = Date.now();
      if (maxTs > now + 120000) {
        return now;
      }
      return maxTs;
    }
  }

  return fallback ?? Date.now();
}

/**
 * Formats a timestamp into human-readable Date and Time strings
 */
export function formatRealtimeDateTime(timestampInput: any): {
  dateStr: string;
  timeStr: string;
  fullStr: string;
  relativeStr: string;
  timestamp: number;
} {
  const ts = typeof timestampInput === 'object' && timestampInput !== null && !(timestampInput instanceof Date)
    ? extractLatestTimestamp(timestampInput)
    : parseTimestamp(timestampInput);

  const d = new Date(ts);

  // Formatted date string, e.g. "30 Oct 2026"
  const dateStr = d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Formatted 12-hour time string with AM/PM, e.g. "06:58:32 AM"
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Calculate relative time string (e.g. "Just now", "2m ago")
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  let relativeStr = 'Just now';
  if (diffSec > 0) {
    if (diffSec < 60) {
      relativeStr = `${diffSec}s ago`;
    } else if (diffSec < 3600) {
      relativeStr = `${Math.floor(diffSec / 60)}m ago`;
    } else if (diffSec < 86400) {
      relativeStr = `${Math.floor(diffSec / 3600)}h ago`;
    } else {
      relativeStr = `${Math.floor(diffSec / 86400)}d ago`;
    }
  }

  return {
    dateStr,
    timeStr,
    fullStr: `${dateStr}, ${timeStr}`,
    relativeStr,
    timestamp: ts
  };
}
