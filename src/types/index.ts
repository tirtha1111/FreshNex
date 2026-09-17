export type Role = 'user' | 'admin';

export interface DeviceData {
  device_id: string;
  product: string;
  temperature: number;
  humidity: number;
  mq135_raw: number;
  online: boolean;
  last_update?: number;
}

export interface UserRecord {
  uid: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: number;
}

export interface UserScanItem {
  id: string;
  device_id: string;
  product: string;
  scanned_at: number;
}

export interface SensorHistoryEntry {
  id: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  mq135_raw: number;
}

export interface ProductProfile {
  id: string;
  name: string;
  category?: string;
  temperature_min: number | null;
  temperature_max: number | null;
  humidity_min: number | null;
  humidity_max: number | null;
  mq135_threshold: number | null;
}

export interface SensorAlert {
  id: string;
  device_id: string;
  product_name?: string;
  type: 'Temperature' | 'Humidity' | 'Air Sensor' | 'Device Offline';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  timestamp: number;
  resolved: boolean;
}

// Backwards compatibility legacy aliases
export interface Product {
  id: string;
  name: string;
  category: string;
  batchId: string;
  rfidTag: string;
  qrCode: string;
  deviceId: string;
  createdAt: string;
  expiryDate: string;
  tempMin: number;
  tempMax: number;
  humMin: number;
  humMax: number;
  gasMax: number;
  imageUrl?: string;
}

export interface LiveReading {
  productId: string;
  temperature: number;
  humidity: number;
  gasLevel: number;
  airQuality: number;
  timestamp: number;
}

export interface Device {
  id: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE';
  lastSeen: number;
  location: string;
  sensorStatus: {
    tempHum: 'OK' | 'ERROR' | 'OFFLINE';
    gasAir: 'OK' | 'ERROR' | 'OFFLINE';
    rfid: 'OK' | 'ERROR' | 'OFFLINE';
  };
}

export interface Alert {
  id: string;
  productId: string;
  productName?: string;
  type: 'High Temperature' | 'Low Temperature' | 'High Humidity' | 'Low Humidity' | 'High Gas Level' | 'Sensor Offline' | 'Device Offline';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  timestamp: number;
  resolved: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  organization: string;
  role: Role;
  profileImage?: string;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  tempUnit: 'C' | 'F';
  alertSoundEnabled: boolean;
}
