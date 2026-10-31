import { FoodItem, SensorData, ScanHistoryRecord } from '../types';

export interface CustomFoodItem extends FoodItem {
  isUnconfigured?: boolean;
}

export const DEFAULT_ITEMS: Record<string, CustomFoodItem> = {
  'APPLE': {
    id: 'APPLE',
    name: 'Fresh Apples',
    category: 'Fruits',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80',
    batchId: 'BATCH-APPLE-101',
    tagId: '#YGS-FD-000125',
    description: 'Fresh apple orchard harvest package monitored in real-time.',
    optimalTemp: '2 - 6°C',
    optimalHumidity: '85 - 95%',
    maxGas: 100,
  },
  'MILK': {
    id: 'MILK',
    name: 'Fresh Milk',
    category: 'Dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    batchId: 'BATCH-MILK-202',
    tagId: '#YGS-FD-000126',
    description: 'Chilled dairy milk supply chain package monitored in real-time.',
    optimalTemp: '1 - 4°C',
    optimalHumidity: '65 - 75%',
    maxGas: 120,
  }
};

export const DEFAULT_SENSOR_DATA: Record<string, SensorData> = {
  'APPLE': {
    temperature: 4.0,
    humidity: 88,
    gas: 45,
    moisture: 6.5,
    dewPoint: 2.1,
    ph: 4.1,
    impact: 0.08,
    light: 25,
    gpsLat: 22.5726,
    gpsLng: 88.3639,
    gpsSats: 9,
    timestamp: Date.now(),
  },
  'MILK': {
    temperature: 2.5,
    humidity: 70,
    gas: 85,
    moisture: 5.1,
    dewPoint: -1.2,
    ph: 6.6,
    impact: 0.10,
    light: 15,
    gpsLat: 22.5726,
    gpsLng: 88.3639,
    gpsSats: 8,
    timestamp: Date.now(),
  }
};

export const DEFAULT_SCAN_HISTORY: ScanHistoryRecord[] = [];
