import { FreshnessStatus } from '../utils/freshnessEngine';

export type Role = 'user' | 'admin';

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  image: string;
  batchId: string;
  tagId: string;
  description?: string;
  optimalTemp?: string;
  optimalHumidity?: string;
  maxGas?: number;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  gas: number;
  moisture?: number; // Absolute moisture content in air (g/m³), repeatedly calculated from temp & humidity
  dewPoint?: number; // Dew point condensation temperature (°C)
  ph?: number; // Calculated thermodynamic pH derived from temperature, humidity, and moisture
  timestamp: number;
}

export interface HistoricalReadingPoint {
  time: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  gas: number;
  moisture?: number; // Calculated moisture (g/m³)
  dewPoint?: number;
  ph?: number; // Calculated pH
}

export interface ScanHistoryRecord {
  id: string;
  itemId: string;
  itemName: string;
  tagId: string;
  itemImage?: string;
  temperature: number;
  humidity: number;
  gas: number;
  moisture?: number; // Calculated moisture (g/m³)
  ph?: number; // Calculated pH
  freshnessScore: number;
  status: FreshnessStatus;
  timestamp: number;
  dateStr?: string;
  timeStr?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  assignedProductId?: string;
  assignedProductName?: string;
  avatar?: string;
  memberSince?: string;
  organization?: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  scanAlerts: boolean;
  systemUpdates: boolean;
  theme: 'Dark' | 'Light';
  language: 'English' | 'Spanish' | 'French' | 'German';
}

export interface AnalyticsSummary {
  totalScans: number;
  totalScansChange: number;
  freshItems: number;
  freshItemsChange: number;
  atRisk: number;
  atRiskChange: number;
  expired: number;
  expiredChange: number;
}

// Backward compatibility types for legacy components
export interface DeviceData {
  id?: string;
  device_id?: string;
  name?: string;
  product?: string;
  temperature?: number;
  humidity?: number;
  gasLevel?: number;
  mq135_raw?: number;
  moisture?: number;
  ph?: number;
  lastUpdated?: number;
  last_update?: number;
  timestamp?: number;
  lastResponse?: number | string;
  status?: string;
  online?: boolean;
  assignedProduct?: string;
}

export interface UserRecord {
  uid: string;
  email: string;
  name: string;
  role: Role;
  createdAt: number;
  lastLogin?: number;
  isActive?: boolean;
}

export interface UserScanItem {
  id?: string;
  scanId?: string;
  productId?: string;
  product?: string;
  device_id?: string;
  name?: string;
  scannedAt?: number;
  scanned_at?: number;
  status?: string;
  temperature?: number;
  humidity?: number;
  gasLevel?: number;
  moisture?: number;
  ph?: number;
}

export interface SensorHistoryEntry {
  id?: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  gasLevel?: number;
  mq135_raw?: number;
  moisture?: number;
  ph?: number;
}

export interface ProductProfile {
  id: string;
  name: string;
  category?: string;
  temperature_min?: number;
  temperature_max?: number;
  humidity_min?: number;
  humidity_max?: number;
  mq135_threshold?: number;
  tempMin?: number;
  tempMax?: number;
  humMin?: number;
  humMax?: number;
  gasMax?: number;
  expiryDate?: string;
}

export interface SensorAlert {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
  read: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  tempMin: number;
  tempMax: number;
  humMin: number;
  humMax: number;
  gasMax: number;
  expiryDate: string;
}

export interface LiveReading {
  temperature: number;
  humidity: number;
  gasLevel: number;
  moisture?: number;
  ph?: number;
  timestamp: number;
}
