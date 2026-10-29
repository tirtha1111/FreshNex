export type DataOperationMode = 'demo' | 'live' | 'stale';

export type ConditionSeverity = 'SAFE' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';

export type SensorStatusLabel = 'Normal' | 'Warning' | 'Critical' | 'Not Connected' | 'No Data' | 'Stale';

export interface ThresholdRange {
  min: number;
  max: number;
  warningMargin: number;
  unit: string;
}

export interface ProductCategoryThreshold {
  id: string;
  categoryName: string;
  description: string;
  temperature: ThresholdRange;
  humidity: ThresholdRange;
  mq135Raw: {
    normalMax: number;
    warningMax: number;
    unit: string;
  };
  lightLux: {
    min: number;
    max: number;
    warningMax: number;
    unit: string;
  };
  phRange: {
    min: number;
    max: number;
  };
  maxImpactG: number;
  maxTiltDeg: number;
}

export interface TelemetryReading {
  parcelId: string;
  deviceId: string;
  timestamp: number;
  isDemonstration: boolean;
  isStale?: boolean;
  // SHT31 / Temperature & Humidity
  temperatureC: number | null;
  humidityRH: number | null;
  // MQ135 Broad-Response Gas Sensor
  mq135Raw: number | null;
  mq135CalibratedNote: string;
  // Optional pH probe
  phConnected: boolean;
  phValue: number | null;
  // BH1750 / LDR Light Sensor
  lightLux: number | null;
  // MPU6050 Accelerometer / Gyroscope
  impactG: number | null;
  tiltDegrees: number | null;
  movementState: 'Stable' | 'Vibrating' | 'Tilted' | 'Impact Detected' | 'No Data';
  // NEO-6M GPS Module
  gpsFixAvailable: boolean;
  latitude: number | null;
  longitude: number | null;
  speedKmh: number | null;
  altitudeM: number | null;
  locationLabel: string | null;
  lastLocationUpdate: number | null;
  // Hardware enclosure diagnostics
  deviceEnclosureTempC: number | null;
  batteryPercent: number | null;
  rssiDbm: number | null;
}

export interface TrendPoint {
  time: string;
  timestamp: number;
  temperature: number;
  humidity: number;
  mq135Scaled: number; // Scaled 0-100 for unified view, raw shown in tooltip
  mq135Raw: number;
  lightScaled: number; // Scaled 0-100 for unified view, lux shown in tooltip
  lightLux: number;
  phValue: number | null;
}

export interface RouteWaypoint {
  name: string;
  lat: number;
  lng: number;
  passed: boolean;
  timestamp?: string;
}

export interface ParcelRecord {
  id: string; // e.g., FNX-00124
  productId: string;
  productName: string;
  category: string;
  productImage: string;
  deviceId: string;
  origin: string;
  destination: string;
  plannedRouteProgress: number | null; // null if no planned route
  waypoints: RouteWaypoint[];
  status: ConditionSeverity;
  dispatchedAt: number;
  eta: string;
  batchCode: string;
  weightKg: number;
  carrierName: string;
}

export interface IoTDeviceRecord {
  id: string; // e.g., ESP32-FNX-01 / YGS-FD-000124
  name: string;
  mcuModel: string;
  assignedParcelId: string | null;
  online: boolean;
  batteryPercent: number | null;
  enclosureTempC: number | null;
  firmwareVersion: string;
  lastCommunication: number;
  sensors: {
    sht31TempHumidity: boolean;
    mq135Gas: boolean;
    bh1750Light: boolean;
    mpu6050Motion: boolean;
    neo6mGps: boolean;
    phProbe: boolean;
  };
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  image: string;
  activeParcelsCount: number;
  thresholdCategoryId: string;
  storageNotes: string;
  packagingType: string;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'GREEN' | 'YELLOW' | 'RED';
  timestamp: number;
  relativeTime: string;
  parcelId: string;
  deviceId: string;
  sensorType: 'light' | 'temperature' | 'movement' | 'gas' | 'humidity' | 'system';
  acknowledged: boolean;
  isDemonstration: boolean;
  measuredValue?: string;
  thresholdInfo?: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  detail: string;
  timestamp: number;
  relativeTime: string;
  type: 'sensor' | 'device' | 'gps' | 'threshold' | 'alert' | 'parcel';
  statusColor: 'green' | 'blue' | 'amber' | 'red';
  parcelId?: string;
  deviceId?: string;
  isDemonstration: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Operations Manager' | 'Quality Inspector' | 'Logistics Operator';
  department: string;
  status: 'Active' | 'Invited' | 'Suspended';
  lastActive: string;
  avatarInitials: string;
}
