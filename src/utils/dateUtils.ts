/**
 * FreshNex Timestamp & Date Utilities
 * 
 * Safely parses timestamps from ESP32 micro-nodes, Firebase Realtime Database,
 * and Firestore payloads across all formats:
 * - Epoch in seconds (10-digit UNIX e.g., 1758784800 -> 1758784800000)
 * - Epoch in milliseconds (13-digit e.g., 1758784800000)
 * - ISO-8601 strings (e.g., "2026-09-25T07:15:00.000Z")
 * - Firestore Timestamp objects ({ seconds, nanoseconds } or { _seconds, _nanoseconds })
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

  // 3. Firestore / Firebase Timestamp object
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
  }

  return Date.now();
}

/**
 * Formats a timestamp into human-readable Date and Time strings
 */
export function formatRealtimeDateTime(timestampInput: any): {
  dateStr: string;
  timeStr: string;
  fullStr: string;
  timestamp: number;
} {
  const ts = parseTimestamp(timestampInput);
  const d = new Date(ts);

  const dateStr = d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return {
    dateStr,
    timeStr,
    fullStr: `${dateStr}, ${timeStr}`,
    timestamp: ts
  };
}
