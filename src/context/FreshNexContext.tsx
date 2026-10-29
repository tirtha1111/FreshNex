import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  DataOperationMode,
  ConditionSeverity,
  ProductCategoryThreshold,
  TelemetryReading,
  TrendPoint,
  ParcelRecord,
  IoTDeviceRecord,
  ProductCatalogItem,
  AlertItem,
  ActivityEvent,
  UserAccount,
} from '../types/freshnex';
import { ASSETS } from '../assets/images';
import { subscribeToSensorData, subscribeToDeviceStatus } from '../services/firebaseService';

const INITIAL_THRESHOLDS: ProductCategoryThreshold[] = [
  {
    id: 'CAT-VEG',
    categoryName: 'Mixed Vegetables',
    description: 'Fresh leafy greens, tomatoes, bell peppers, and cruciferous produce in cold-chain transit.',
    temperature: { min: 2.0, max: 8.0, warningMargin: 1.0, unit: '°C' },
    humidity: { min: 60, max: 75, warningMargin: 5, unit: '%RH' },
    mq135Raw: { normalMax: 300, warningMax: 420, unit: 'raw ADC' },
    lightLux: { min: 100, max: 1000, warningMax: 1200, unit: 'lux' },
    phRange: { min: 6.0, max: 7.5 },
    maxImpactG: 1.8,
    maxTiltDeg: 25,
  },
  {
    id: 'CAT-DRINKS',
    categoryName: 'Cold Drinks',
    description: 'Chilled bottled and canned beverages requiring stable refrigeration and low light exposure.',
    temperature: { min: 1.0, max: 6.0, warningMargin: 1.0, unit: '°C' },
    humidity: { min: 50, max: 70, warningMargin: 5, unit: '%RH' },
    mq135Raw: { normalMax: 250, warningMax: 350, unit: 'raw ADC' },
    lightLux: { min: 50, max: 800, warningMax: 1000, unit: 'lux' },
    phRange: { min: 3.2, max: 5.5 },
    maxImpactG: 2.0,
    maxTiltDeg: 20,
  },
  {
    id: 'CAT-DAIRY',
    categoryName: 'Dairy & Milk Products',
    description: 'Pasteurized milk, cheese, and cultured dairy products sensitive to thermal excursions.',
    temperature: { min: 1.0, max: 4.5, warningMargin: 0.8, unit: '°C' },
    humidity: { min: 55, max: 72, warningMargin: 4, unit: '%RH' },
    mq135Raw: { normalMax: 220, warningMax: 320, unit: 'raw ADC' },
    lightLux: { min: 50, max: 500, warningMax: 700, unit: 'lux' },
    phRange: { min: 6.4, max: 6.8 },
    maxImpactG: 1.5,
    maxTiltDeg: 15,
  },
  {
    id: 'CAT-MEAT',
    categoryName: 'Meat & Poultry',
    description: 'Chilled protein cuts requiring strict cold-chain compliance and enclosure seal monitoring.',
    temperature: { min: 0.0, max: 4.0, warningMargin: 0.5, unit: '°C' },
    humidity: { min: 65, max: 80, warningMargin: 5, unit: '%RH' },
    mq135Raw: { normalMax: 280, warningMax: 380, unit: 'raw ADC' },
    lightLux: { min: 50, max: 600, warningMax: 800, unit: 'lux' },
    phRange: { min: 5.5, max: 6.5 },
    maxImpactG: 1.6,
    maxTiltDeg: 20,
  },
];

const INITIAL_PARCELS: ParcelRecord[] = [
  {
    id: 'FNX-00124',
    productId: 'PROD-01',
    productName: 'Mixed Vegetables',
    category: 'Mixed Vegetables',
    productImage: ASSETS.tomatoProduct,
    deviceId: 'ESP32-FNX-01',
    origin: 'Delhi Cold Hub (Sector 18)',
    destination: 'Noida Distribution Center (Sector 62)',
    plannedRouteProgress: 65,
    waypoints: [
      { name: 'Delhi', lat: 28.7041, lng: 77.1025, passed: true, timestamp: '10:15 AM' },
      { name: 'Meerut Bypass', lat: 28.6692, lng: 77.1580, passed: true, timestamp: '12:40 PM' },
      { name: 'Ghaziabad Transit', lat: 28.6139, lng: 77.2090, passed: true, timestamp: '02:58 PM' },
      { name: 'Noida', lat: 28.5355, lng: 77.3910, passed: false, timestamp: 'ETA 04:15 PM' },
    ],
    status: 'SAFE',
    dispatchedAt: Date.now() - 4.5 * 3600 * 1000,
    eta: 'Today, 04:15 PM',
    batchCode: 'BATCH-VEG-2025-09',
    weightKg: 18.4,
    carrierName: 'FreshFleet Express #FF-204',
  },
  {
    id: 'FNX-00128',
    productId: 'PROD-02',
    productName: 'Cold Drinks',
    category: 'Cold Drinks',
    productImage: ASSETS.colddrinks,
    deviceId: 'ESP32-FNX-02',
    origin: 'Gurugram Bottling Plant',
    destination: 'South Delhi Retail Hub',
    plannedRouteProgress: 82,
    waypoints: [
      { name: 'Gurugram', lat: 28.4595, lng: 77.0266, passed: true, timestamp: '11:00 AM' },
      { name: 'Mahipalpur', lat: 28.5450, lng: 77.1200, passed: true, timestamp: '01:20 PM' },
      { name: 'Saket Hub', lat: 28.5245, lng: 77.2066, passed: false, timestamp: 'ETA 03:45 PM' },
    ],
    status: 'SAFE',
    dispatchedAt: Date.now() - 3.2 * 3600 * 1000,
    eta: 'Today, 03:45 PM',
    batchCode: 'BATCH-CD-2025-44',
    weightKg: 24.0,
    carrierName: 'GreenLine Cold Logistics #GL-112',
  },
  {
    id: 'FNX-00131',
    productId: 'PROD-03',
    productName: 'Organic Leafy Greens',
    category: 'Mixed Vegetables',
    productImage: ASSETS.heroCrate,
    deviceId: 'ESP32-FNX-03',
    origin: 'Sonipat Hydroponic Farm',
    destination: 'New Delhi Central Market',
    plannedRouteProgress: 40,
    waypoints: [
      { name: 'Sonipat', lat: 28.9931, lng: 77.0151, passed: true, timestamp: '01:00 PM' },
      { name: 'Alipur Checkpost', lat: 28.7980, lng: 77.1330, passed: true, timestamp: '02:30 PM' },
      { name: 'Central Market', lat: 28.6304, lng: 77.2177, passed: false, timestamp: 'ETA 05:10 PM' },
    ],
    status: 'WARNING',
    dispatchedAt: Date.now() - 2 * 3600 * 1000,
    eta: 'Today, 05:10 PM',
    batchCode: 'BATCH-GRN-2025-18',
    weightKg: 12.5,
    carrierName: 'FreshFleet Express #FF-109',
  },
  {
    id: 'FNX-00135',
    productId: 'PROD-04',
    productName: 'Chilled Poultry Cuts',
    category: 'Meat & Poultry',
    productImage: ASSETS.crateSquare,
    deviceId: 'ESP32-FNX-04',
    origin: 'Faridabad Cold Storage',
    destination: 'Noida Hospitality Hub',
    plannedRouteProgress: null,
    waypoints: [],
    status: 'UNKNOWN',
    dispatchedAt: Date.now() - 6 * 3600 * 1000,
    eta: 'Awaiting GPS Sync',
    batchCode: 'BATCH-MP-2025-03',
    weightKg: 30.0,
    carrierName: 'ColdChain Direct #CC-88',
  },
];

const INITIAL_DEVICES: IoTDeviceRecord[] = [
  {
    id: 'ESP32-FNX-01',
    name: 'FreshNex Smart Container Node #01',
    mcuModel: 'ESP32-WROOM-32D (Dual-Core)',
    assignedParcelId: 'FNX-00124',
    online: true,
    batteryPercent: 78,
    enclosureTempC: 32,
    firmwareVersion: 'v2.4.1-rtdb',
    lastCommunication: Date.now() - 2 * 60 * 1000,
    sensors: {
      sht31TempHumidity: true,
      mq135Gas: true,
      bh1750Light: true,
      mpu6050Motion: true,
      neo6mGps: true,
      phProbe: false,
    },
  },
  {
    id: 'ESP32-FNX-02',
    name: 'FreshNex Smart Container Node #02',
    mcuModel: 'ESP32-WROOM-32D (Dual-Core)',
    assignedParcelId: 'FNX-00128',
    online: true,
    batteryPercent: 91,
    enclosureTempC: 29,
    firmwareVersion: 'v2.4.1-rtdb',
    lastCommunication: Date.now() - 4 * 60 * 1000,
    sensors: {
      sht31TempHumidity: true,
      mq135Gas: true,
      bh1750Light: true,
      mpu6050Motion: true,
      neo6mGps: true,
      phProbe: true,
    },
  },
  {
    id: 'ESP32-FNX-03',
    name: 'FreshNex Smart Container Node #03',
    mcuModel: 'ESP32-S3 Telemetry Unit',
    assignedParcelId: 'FNX-00131',
    online: true,
    batteryPercent: 64,
    enclosureTempC: 34,
    firmwareVersion: 'v2.4.0-rtdb',
    lastCommunication: Date.now() - 8 * 60 * 1000,
    sensors: {
      sht31TempHumidity: true,
      mq135Gas: true,
      bh1750Light: true,
      mpu6050Motion: true,
      neo6mGps: true,
      phProbe: false,
    },
  },
  {
    id: 'ESP32-FNX-04',
    name: 'FreshNex Smart Container Node #04',
    mcuModel: 'ESP32-WROOM-32D',
    assignedParcelId: 'FNX-00135',
    online: false,
    batteryPercent: null,
    enclosureTempC: null,
    firmwareVersion: 'v2.3.8-rtdb',
    lastCommunication: Date.now() - 52 * 60 * 1000,
    sensors: {
      sht31TempHumidity: true,
      mq135Gas: true,
      bh1750Light: false,
      mpu6050Motion: true,
      neo6mGps: false,
      phProbe: false,
    },
  },
];

const INITIAL_PRODUCTS: ProductCatalogItem[] = [
  {
    id: 'PROD-01',
    name: 'Mixed Vegetables',
    sku: 'FNX-SKU-VEG01',
    category: 'Mixed Vegetables',
    image: ASSETS.tomatoProduct,
    activeParcelsCount: 2,
    thresholdCategoryId: 'CAT-VEG',
    storageNotes: 'Maintain 2°C – 8°C and 60% – 75% RH. Avoid direct sunlight exposure (>1000 lux).',
    packagingType: 'Polycarbonate ventilated smart crate (20L)',
  },
  {
    id: 'PROD-02',
    name: 'Cold Drinks',
    sku: 'FNX-SKU-CD02',
    category: 'Cold Drinks',
    image: ASSETS.colddrinks,
    activeParcelsCount: 1,
    thresholdCategoryId: 'CAT-DRINKS',
    storageNotes: 'Keep chilled between 1°C – 6°C. Monitor impact (<2.0g) to prevent container seal compromise.',
    packagingType: 'Insulated beverage carrier with ESP32 lid unit',
  },
  {
    id: 'PROD-03',
    name: 'Organic Leafy Greens',
    sku: 'FNX-SKU-GRN03',
    category: 'Mixed Vegetables',
    image: ASSETS.heroCrate,
    activeParcelsCount: 1,
    thresholdCategoryId: 'CAT-VEG',
    storageNotes: 'High humidity sensitivity. Maintain 60% – 75% RH to prevent wilting or condensation.',
    packagingType: 'Transparent smart container with SHT31 probe',
  },
  {
    id: 'PROD-04',
    name: 'Chilled Poultry Cuts',
    sku: 'FNX-SKU-MP04',
    category: 'Meat & Poultry',
    image: ASSETS.crateSquare,
    activeParcelsCount: 1,
    thresholdCategoryId: 'CAT-MEAT',
    storageNotes: 'Strict 0°C – 4°C cold-chain window. Continuous MQ135 broad-response VOC tracking.',
    packagingType: 'Hermetic thermal box with external GPS antenna',
  },
];

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-101',
    title: 'Light Exposure Detected',
    description: 'Parcel exposed to elevated ambient light levels during transit inspection.',
    severity: 'YELLOW',
    timestamp: Date.now() - 2 * 3600 * 1000,
    relativeTime: '2h ago',
    parcelId: 'FNX-00124',
    deviceId: 'ESP32-FNX-01',
    sensorType: 'light',
    acknowledged: false,
    isDemonstration: true,
    measuredValue: '1,080 lux',
    thresholdInfo: 'Configured limit: 1,000 lux',
  },
  {
    id: 'ALT-102',
    title: 'Temperature Threshold Exceeded',
    description: 'Temp reached 8.5°C (threshold 8.0°C) briefly during loading bay transfer.',
    severity: 'RED',
    timestamp: Date.now() - 4 * 3600 * 1000,
    relativeTime: '4h ago',
    parcelId: 'FNX-00124',
    deviceId: 'ESP32-FNX-01',
    sensorType: 'temperature',
    acknowledged: false,
    isDemonstration: true,
    measuredValue: '8.5°C',
    thresholdInfo: 'Acceptable range: 2.0°C – 8.0°C',
  },
  {
    id: 'ALT-103',
    title: 'Unusual Movement Detected',
    description: 'Parcel was tilted (27° inclination) during highway lane transition.',
    severity: 'YELLOW',
    timestamp: Date.now() - 6 * 3600 * 1000,
    relativeTime: '6h ago',
    parcelId: 'FNX-00124',
    deviceId: 'ESP32-FNX-01',
    sensorType: 'movement',
    acknowledged: false,
    isDemonstration: true,
    measuredValue: '27° tilt / 1.4g',
    thresholdInfo: 'Max tilt threshold: 25°',
  },
  {
    id: 'ALT-104',
    title: 'Gas Sensor Reading Normal',
    description: 'All MQ135 broad-response readings returned within baseline operating range.',
    severity: 'GREEN',
    timestamp: Date.now() - 8 * 3600 * 1000,
    relativeTime: '8h ago',
    parcelId: 'FNX-00124',
    deviceId: 'ESP32-FNX-01',
    sensorType: 'gas',
    acknowledged: true,
    isDemonstration: true,
    measuredValue: '120 raw ADC',
    thresholdInfo: 'Baseline ceiling: 300 raw ADC',
  },
];

const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'ACT-01',
    title: 'Sensor data received',
    detail: 'Packet #4821 from ESP32-FNX-01 (4.2°C, 68% RH, 320 lux)',
    timestamp: Date.now() - 2 * 60 * 1000,
    relativeTime: '2 min ago',
    type: 'sensor',
    statusColor: 'green',
    parcelId: 'FNX-00124',
    deviceId: 'ESP32-FNX-01',
    isDemonstration: true,
  },
  {
    id: 'ACT-02',
    title: 'GPS location updated',
    detail: 'NEO-6M lock at 28.6139° N, 77.2090° E (Speed: 62 km/h)',
    timestamp: Date.now() - 5 * 60 * 1000,
    relativeTime: '5 min ago',
    type: 'gps',
    statusColor: 'green',
    parcelId: 'FNX-00124',
    deviceId: 'ESP32-FNX-01',
    isDemonstration: true,
  },
  {
    id: 'ACT-03',
    title: 'Device connected',
    detail: 'ESP32-FNX-01 authenticated with Firebase RTDB gateway',
    timestamp: Date.now() - 12 * 60 * 1000,
    relativeTime: '12 min ago',
    type: 'device',
    statusColor: 'green',
    parcelId: 'FNX-00124',
    deviceId: 'ESP32-FNX-01',
    isDemonstration: true,
  },
  {
    id: 'ACT-04',
    title: 'Threshold configuration verified',
    detail: 'Mixed Vegetables profile (2°C – 8°C, 60% – 75% RH) active',
    timestamp: Date.now() - 60 * 60 * 1000,
    relativeTime: '1 hr ago',
    type: 'threshold',
    statusColor: 'blue',
    parcelId: 'FNX-00124',
    isDemonstration: true,
  },
  {
    id: 'ACT-05',
    title: 'Alert acknowledged',
    detail: 'Tirtharaj Biswas reviewed MQ135 baseline check on FNX-00124',
    timestamp: Date.now() - 2.5 * 3600 * 1000,
    relativeTime: '2 hrs ago',
    type: 'alert',
    statusColor: 'green',
    parcelId: 'FNX-00124',
    isDemonstration: true,
  },
  {
    id: 'ACT-06',
    title: 'Parcel registered',
    detail: 'Parcel FNX-00124 (Mixed Vegetables) assigned to ESP32-FNX-01',
    timestamp: Date.now() - 4.5 * 3600 * 1000,
    relativeTime: '4 hrs ago',
    type: 'parcel',
    statusColor: 'blue',
    parcelId: 'FNX-00124',
    deviceId: 'ESP32-FNX-01',
    isDemonstration: true,
  },
];

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-01',
    name: 'Tirtharaj Biswas',
    email: 'tirtharaj.biswas@freshnex.io',
    role: 'Administrator',
    department: 'Platform Architecture & IoT Systems',
    status: 'Active',
    lastActive: 'Online now',
    avatarInitials: 'T',
  },
  {
    id: 'USR-02',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@freshnex.io',
    role: 'Quality Inspector',
    department: 'Cold-Chain Quality Assurance',
    status: 'Active',
    lastActive: '18 mins ago',
    avatarInitials: 'AS',
  },
  {
    id: 'USR-03',
    name: 'Rohan Verma',
    email: 'rohan.verma@freshnex.io',
    role: 'Operations Manager',
    department: 'NCR Fleet & Parcel Operations',
    status: 'Active',
    lastActive: '1 hour ago',
    avatarInitials: 'RV',
  },
  {
    id: 'USR-04',
    name: 'Priya Nair',
    email: 'priya.nair@freshnex.io',
    role: 'Logistics Operator',
    department: 'Noida Distribution Hub',
    status: 'Active',
    lastActive: '3 hours ago',
    avatarInitials: 'PN',
  },
];

function generateTrendSeries(range: '1H' | '6H' | '12H' | '24H', connectPhInDemo: boolean): TrendPoint[] {
  const pointsCount = range === '1H' ? 12 : range === '6H' ? 12 : range === '12H' ? 12 : 12;
  const stepMinutes = range === '1H' ? 5 : range === '6H' ? 30 : range === '12H' ? 60 : 120;
  const now = new Date();
  const baseTemp = [4.0, 4.3, 4.1, 4.5, 4.2, 4.4, 4.1, 4.6, 4.3, 4.5, 4.1, 4.2];
  const baseHum = [72, 75, 73, 71, 69, 72, 70, 71, 67, 70, 69, 68];
  const baseGasRaw = [110, 118, 115, 125, 119, 132, 122, 128, 116, 124, 118, 120];
  const baseLightLux = [280, 310, 295, 340, 315, 330, 305, 350, 310, 325, 315, 320];
  const basePh = [6.7, 6.8, 6.7, 6.8, 6.8, 6.9, 6.8, 6.7, 6.8, 6.8, 6.8, 6.8];

  return Array.from({ length: pointsCount }, (_, idx) => {
    const ptTime = new Date(now.getTime() - (pointsCount - 1 - idx) * stepMinutes * 60 * 1000);
    const hours = ptTime.getHours().toString().padStart(2, '0');
    const mins = ptTime.getMinutes().toString().padStart(2, '0');
    const rawGas = baseGasRaw[idx % baseGasRaw.length];
    const lux = baseLightLux[idx % baseLightLux.length];
    return {
      time: `${hours}:${mins}`,
      timestamp: ptTime.getTime(),
      temperature: baseTemp[idx % baseTemp.length],
      humidity: baseHum[idx % baseHum.length],
      mq135Raw: rawGas,
      mq135Scaled: Math.round((rawGas / 300) * 60 + 20), // Clean visual scaling for unified chart
      lightLux: lux,
      lightScaled: Math.round((lux / 1000) * 50 + 30),
      phValue: connectPhInDemo ? basePh[idx % basePh.length] : null,
    };
  });
}

interface FreshNexContextType {
  dataMode: DataOperationMode;
  setDataMode: (mode: DataOperationMode) => void;
  selectedParcelId: string;
  setSelectedParcelId: (id: string) => void;
  selectedParcel: ParcelRecord;
  selectedDevice: IoTDeviceRecord;
  selectedThreshold: ProductCategoryThreshold;
  currentTelemetry: TelemetryReading;
  overallParcelStatus: ConditionSeverity;
  demoPhProbeConnected: boolean;
  setDemoPhProbeConnected: (v: boolean) => void;
  temperatureUnit: 'C' | 'F';
  setTemperatureUnit: (u: 'C' | 'F') => void;
  formatTemperature: (tempC: number | null) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  parcels: ParcelRecord[];
  devices: IoTDeviceRecord[];
  products: ProductCatalogItem[];
  thresholds: ProductCategoryThreshold[];
  alerts: AlertItem[];
  unreadAlertsCount: number;
  activities: ActivityEvent[];
  users: UserAccount[];
  trendTimeRange: '1H' | '6H' | '12H' | '24H';
  setTrendTimeRange: (r: '1H' | '6H' | '12H' | '24H') => void;
  trendData: TrendPoint[];
  acknowledgeAlert: (alertId: string) => void;
  acknowledgeAllAlerts: () => void;
  updateCategoryThreshold: (updated: ProductCategoryThreshold) => void;
  registerNewParcel: (parcel: Omit<ParcelRecord, 'status' | 'dispatchedAt' | 'waypoints'>) => void;
  registerNewDevice: (device: Omit<IoTDeviceRecord, 'lastCommunication'>) => void;
  simulateThresholdExcursion: (type: 'temp' | 'light' | 'gas' | 'reset') => void;
  firebaseConnected: boolean;
}

const FreshNexContext = createContext<FreshNexContextType | undefined>(undefined);

export const FreshNexProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dataMode, setDataMode] = useState<DataOperationMode>('demo');
  const [selectedParcelId, setSelectedParcelId] = useState<string>('FNX-00124');
  const [demoPhProbeConnected, setDemoPhProbeConnected] = useState<boolean>(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [trendTimeRange, setTrendTimeRange] = useState<'1H' | '6H' | '12H' | '24H'>('6H');

  const [parcels, setParcels] = useState<ParcelRecord[]>(INITIAL_PARCELS);
  const [devices, setDevices] = useState<IoTDeviceRecord[]>(INITIAL_DEVICES);
  const [products] = useState<ProductCatalogItem[]>(INITIAL_PRODUCTS);
  const [thresholds, setThresholds] = useState<ProductCategoryThreshold[]>(INITIAL_THRESHOLDS);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [activities, setActivities] = useState<ActivityEvent[]>(INITIAL_ACTIVITIES);
  const [users] = useState<UserAccount[]>(INITIAL_USERS);

  // Live Firebase hardware telemetry state
  const [liveFirebaseData, setLiveFirebaseData] = useState<{
    temperature: number | null;
    humidity: number | null;
    mq135Raw: number | null;
    timestamp: number | null;
    online: boolean;
  }>({
    temperature: null,
    humidity: null,
    mq135Raw: null,
    timestamp: null,
    online: false,
  });

  // Optional demo override for testing threshold excursion alerts interactively
  const [demoOverride, setDemoOverride] = useState<{
    temp?: number;
    light?: number;
    gas?: number;
  } | null>(null);

  // Subscribe to Firebase Realtime Database for live ESP32 node updates
  useEffect(() => {
    const unsubSensor = subscribeToSensorData('YGS-FD-000124', (data) => {
      if (data && (data as any).isReal) {
        setLiveFirebaseData((prev) => ({
          ...prev,
          temperature: typeof data.temperature === 'number' ? data.temperature : prev.temperature,
          humidity: typeof data.humidity === 'number' ? data.humidity : prev.humidity,
          mq135Raw: typeof data.gas === 'number' ? data.gas : prev.mq135Raw,
          timestamp: data.timestamp || Date.now(),
        }));
      }
    });

    const unsubStatus = subscribeToDeviceStatus('YGS-FD-000124', (status) => {
      setLiveFirebaseData((prev) => ({
        ...prev,
        online: status === 'online',
      }));
    });

    return () => {
      unsubSensor();
      unsubStatus();
    };
  }, []);

  const selectedParcel = useMemo(
    () => parcels.find((p) => p.id === selectedParcelId) || parcels[0],
    [parcels, selectedParcelId]
  );

  const selectedDevice = useMemo(
    () => devices.find((d) => d.id === selectedParcel.deviceId) || devices[0],
    [devices, selectedParcel]
  );

  const selectedThreshold = useMemo(
    () =>
      thresholds.find((t) => t.categoryName === selectedParcel.category) ||
      thresholds[0],
    [thresholds, selectedParcel]
  );

  const currentTelemetry: TelemetryReading = useMemo(() => {
    if (dataMode === 'stale' || selectedParcel.id === 'FNX-00135') {
      return {
        parcelId: selectedParcel.id,
        deviceId: selectedDevice.id,
        timestamp: Date.now() - 52 * 60 * 1000,
        isDemonstration: false,
        isStale: true,
        temperatureC: 4.4,
        humidityRH: 69,
        mq135Raw: 124,
        mq135CalibratedNote: 'Last recorded raw ADC prior to telemetry timeout',
        phConnected: false,
        phValue: null,
        lightLux: null,
        impactG: 1.0,
        tiltDegrees: 2,
        movementState: 'No Data',
        gpsFixAvailable: false,
        latitude: null,
        longitude: null,
        speedKmh: null,
        altitudeM: null,
        locationLabel: null,
        lastLocationUpdate: Date.now() - 52 * 60 * 1000,
        deviceEnclosureTempC: null,
        batteryPercent: null,
        rssiDbm: null,
      };
    }

    if (dataMode === 'live') {
      const hasLive = liveFirebaseData.timestamp !== null;
      return {
        parcelId: selectedParcel.id,
        deviceId: selectedDevice.id,
        timestamp: liveFirebaseData.timestamp || Date.now(),
        isDemonstration: false,
        isStale: !liveFirebaseData.online && !hasLive,
        temperatureC: liveFirebaseData.temperature,
        humidityRH: liveFirebaseData.humidity,
        mq135Raw: liveFirebaseData.mq135Raw,
        mq135CalibratedNote: 'Broad-response raw sensor signal (uncalibrated)',
        phConnected: false, // Hardware pH probe not physically connected on ESP32 node
        phValue: null,
        lightLux: null, // Only populated if BH1750 payload present in RTDB
        impactG: null,
        tiltDegrees: null,
        movementState: 'No Data',
        gpsFixAvailable: false, // NEO-6M GPS fix not active in RTDB payload
        latitude: null,
        longitude: null,
        speedKmh: null,
        altitudeM: null,
        locationLabel: null,
        lastLocationUpdate: null,
        deviceEnclosureTempC: null,
        batteryPercent: null,
        rssiDbm: liveFirebaseData.online ? -64 : null,
      };
    }

    // Demonstration mode: matches reference image values while honoring scientific rules
    const isLeafyWarningParcel = selectedParcel.id === 'FNX-00131';
    const isColdDrinksParcel = selectedParcel.id === 'FNX-00128';

    const defaultTemp = isLeafyWarningParcel ? 7.6 : isColdDrinksParcel ? 3.8 : 4.2;
    const defaultHum = isLeafyWarningParcel ? 74 : isColdDrinksParcel ? 62 : 68;
    const defaultGas = isLeafyWarningParcel ? 210 : isColdDrinksParcel ? 95 : 120;
    const defaultLux = isLeafyWarningParcel ? 890 : isColdDrinksParcel ? 180 : 320;

    return {
      parcelId: selectedParcel.id,
      deviceId: selectedDevice.id,
      timestamp: Date.now() - 2 * 60 * 1000,
      isDemonstration: true,
      isStale: false,
      temperatureC: demoOverride?.temp ?? defaultTemp,
      humidityRH: defaultHum,
      mq135Raw: demoOverride?.gas ?? defaultGas,
      mq135CalibratedNote: 'Broad-response raw ADC reading (0–300 baseline)',
      phConnected: demoPhProbeConnected || isColdDrinksParcel,
      phValue: demoPhProbeConnected ? 6.8 : isColdDrinksParcel ? 4.2 : null,
      lightLux: demoOverride?.light ?? defaultLux,
      impactG: 1.05,
      tiltDegrees: 3.2,
      movementState: 'Stable',
      gpsFixAvailable: true,
      latitude: 28.6139,
      longitude: 77.2090,
      speedKmh: 62,
      altitudeM: 212,
      locationLabel: '28.6139° N, 77.2090° E',
      lastLocationUpdate: Date.now() - 2 * 60 * 1000,
      deviceEnclosureTempC: selectedDevice.enclosureTempC ?? 32,
      batteryPercent: selectedDevice.batteryPercent ?? 78,
      rssiDbm: -61,
    };
  }, [
    dataMode,
    selectedParcel,
    selectedDevice,
    liveFirebaseData,
    demoPhProbeConnected,
    demoOverride,
  ]);

  // Evaluate overall condition dynamically based on currentTelemetry and selectedThreshold
  const overallParcelStatus: ConditionSeverity = useMemo(() => {
    if (currentTelemetry.isStale || currentTelemetry.temperatureC === null) {
      return 'UNKNOWN';
    }
    const t = currentTelemetry.temperatureC;
    const h = currentTelemetry.humidityRH ?? 68;
    const g = currentTelemetry.mq135Raw ?? 120;
    const l = currentTelemetry.lightLux ?? 320;

    // Critical check
    if (
      t > selectedThreshold.temperature.max ||
      t < selectedThreshold.temperature.min ||
      h > selectedThreshold.humidity.max + selectedThreshold.humidity.warningMargin ||
      h < selectedThreshold.humidity.min - selectedThreshold.humidity.warningMargin ||
      g > selectedThreshold.mq135Raw.warningMax ||
      l > selectedThreshold.lightLux.warningMax
    ) {
      return 'CRITICAL';
    }

    // Warning check
    if (
      t > selectedThreshold.temperature.max - selectedThreshold.temperature.warningMargin ||
      t < selectedThreshold.temperature.min + selectedThreshold.temperature.warningMargin ||
      h > selectedThreshold.humidity.max ||
      h < selectedThreshold.humidity.min ||
      g > selectedThreshold.mq135Raw.normalMax ||
      l > selectedThreshold.lightLux.max
    ) {
      return 'WARNING';
    }

    return 'SAFE';
  }, [currentTelemetry, selectedThreshold]);

  const formatTemperature = useCallback(
    (tempC: number | null): string => {
      if (tempC === null || isNaN(tempC)) return 'No Data';
      if (temperatureUnit === 'F') {
        return `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
      }
      return `${tempC.toFixed(1)}°C`;
    },
    [temperatureUnit]
  );

  const trendData = useMemo(
    () => generateTrendSeries(trendTimeRange, demoPhProbeConnected),
    [trendTimeRange, demoPhProbeConnected]
  );

  const unreadAlertsCount = useMemo(
    () => alerts.filter((a) => !a.acknowledged).length,
    [alerts]
  );

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    setActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        title: 'Alert acknowledged',
        detail: `Administrator acknowledged alert ${alertId}`,
        timestamp: Date.now(),
        relativeTime: 'Just now',
        type: 'alert',
        statusColor: 'green',
        parcelId: selectedParcelId,
        isDemonstration: dataMode === 'demo',
      },
      ...prev,
    ]);
  }, [selectedParcelId, dataMode]);

  const acknowledgeAllAlerts = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    setActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        title: 'All alerts acknowledged',
        detail: 'Administrator cleared unread alert notifications',
        timestamp: Date.now(),
        relativeTime: 'Just now',
        type: 'alert',
        statusColor: 'green',
        isDemonstration: dataMode === 'demo',
      },
      ...prev,
    ]);
  }, [dataMode]);

  const updateCategoryThreshold = useCallback((updated: ProductCategoryThreshold) => {
    setThresholds((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setActivities((prev) => [
      {
        id: `ACT-${Date.now()}`,
        title: 'Threshold configuration changed',
        detail: `Updated ${updated.categoryName} range (${updated.temperature.min}°C – ${updated.temperature.max}°C)`,
        timestamp: Date.now(),
        relativeTime: 'Just now',
        type: 'threshold',
        statusColor: 'blue',
        isDemonstration: dataMode === 'demo',
      },
      ...prev,
    ]);
  }, [dataMode]);

  const registerNewParcel = useCallback(
    (newParcel: Omit<ParcelRecord, 'status' | 'dispatchedAt' | 'waypoints'>) => {
      const created: ParcelRecord = {
        ...newParcel,
        status: 'SAFE',
        dispatchedAt: Date.now(),
        waypoints: [
          { name: newParcel.origin, lat: 28.7041, lng: 77.1025, passed: true, timestamp: 'Just now' },
          { name: newParcel.destination, lat: 28.5355, lng: 77.3910, passed: false, timestamp: newParcel.eta },
        ],
      };
      setParcels((prev) => [created, ...prev]);
      setActivities((prev) => [
        {
          id: `ACT-${Date.now()}`,
          title: 'Parcel registered',
          detail: `Parcel ${created.id} (${created.productName}) assigned to ${created.deviceId}`,
          timestamp: Date.now(),
          relativeTime: 'Just now',
          type: 'parcel',
          statusColor: 'green',
          parcelId: created.id,
          deviceId: created.deviceId,
          isDemonstration: dataMode === 'demo',
        },
        ...prev,
      ]);
    },
    [dataMode]
  );

  const registerNewDevice = useCallback(
    (newDev: Omit<IoTDeviceRecord, 'lastCommunication'>) => {
      const created: IoTDeviceRecord = {
        ...newDev,
        lastCommunication: Date.now(),
      };
      setDevices((prev) => [created, ...prev]);
      setActivities((prev) => [
        {
          id: `ACT-${Date.now()}`,
          title: 'Device connected',
          detail: `Registered IoT hardware node ${created.id} (${created.mcuModel})`,
          timestamp: Date.now(),
          relativeTime: 'Just now',
          type: 'device',
          statusColor: 'green',
          deviceId: created.id,
          isDemonstration: dataMode === 'demo',
        },
        ...prev,
      ]);
    },
    [dataMode]
  );

  const simulateThresholdExcursion = useCallback(
    (type: 'temp' | 'light' | 'gas' | 'reset') => {
      if (type === 'reset') {
        setDemoOverride(null);
        return;
      }
      if (type === 'temp') {
        setDemoOverride({ temp: 8.9 });
        setAlerts((prev) => [
          {
            id: `ALT-${Date.now()}`,
            title: 'Temperature Threshold Exceeded',
            description: `Parcel ${selectedParcel.id} recorded 8.9°C (exceeds ${selectedThreshold.temperature.max}°C upper limit).`,
            severity: 'RED',
            timestamp: Date.now(),
            relativeTime: 'Just now',
            parcelId: selectedParcel.id,
            deviceId: selectedDevice.id,
            sensorType: 'temperature',
            acknowledged: false,
            isDemonstration: true,
            measuredValue: '8.9°C',
            thresholdInfo: `Configured max: ${selectedThreshold.temperature.max}°C`,
          },
          ...prev,
        ]);
      } else if (type === 'light') {
        setDemoOverride({ light: 1180 });
        setAlerts((prev) => [
          {
            id: `ALT-${Date.now()}`,
            title: 'Light Exposure Detected',
            description: `Container lid light intensity reached 1,180 lux (limit ${selectedThreshold.lightLux.max} lux).`,
            severity: 'YELLOW',
            timestamp: Date.now(),
            relativeTime: 'Just now',
            parcelId: selectedParcel.id,
            deviceId: selectedDevice.id,
            sensorType: 'light',
            acknowledged: false,
            isDemonstration: true,
            measuredValue: '1,180 lux',
            thresholdInfo: `Configured max: ${selectedThreshold.lightLux.max} lux`,
          },
          ...prev,
        ]);
      } else if (type === 'gas') {
        setDemoOverride({ gas: 365 });
        setAlerts((prev) => [
          {
            id: `ALT-${Date.now()}`,
            title: 'Gas Sensor Reading Elevated',
            description: `MQ135 broad-response reading elevated to 365 raw ADC. Inspect parcel ventilation (does not independently confirm spoilage).`,
            severity: 'YELLOW',
            timestamp: Date.now(),
            relativeTime: 'Just now',
            parcelId: selectedParcel.id,
            deviceId: selectedDevice.id,
            sensorType: 'gas',
            acknowledged: false,
            isDemonstration: true,
            measuredValue: '365 raw ADC',
            thresholdInfo: `Normal baseline ceiling: ${selectedThreshold.mq135Raw.normalMax} raw ADC`,
          },
          ...prev,
        ]);
      }
    },
    [selectedParcel, selectedDevice, selectedThreshold]
  );

  return (
    <FreshNexContext.Provider
      value={{
        dataMode,
        setDataMode,
        selectedParcelId,
        setSelectedParcelId,
        selectedParcel,
        selectedDevice,
        selectedThreshold,
        currentTelemetry,
        overallParcelStatus,
        demoPhProbeConnected,
        setDemoPhProbeConnected,
        temperatureUnit,
        setTemperatureUnit,
        formatTemperature,
        searchQuery,
        setSearchQuery,
        parcels,
        devices,
        products,
        thresholds,
        alerts,
        unreadAlertsCount,
        activities,
        users,
        trendTimeRange,
        setTrendTimeRange,
        trendData,
        acknowledgeAlert,
        acknowledgeAllAlerts,
        updateCategoryThreshold,
        registerNewParcel,
        registerNewDevice,
        simulateThresholdExcursion,
        firebaseConnected: liveFirebaseData.online,
      }}
    >
      {children}
    </FreshNexContext.Provider>
  );
};

export const useFreshNex = () => {
  const ctx = useContext(FreshNexContext);
  if (!ctx) {
    throw new Error('useFreshNex must be used within a FreshNexProvider');
  }
  return ctx;
};
