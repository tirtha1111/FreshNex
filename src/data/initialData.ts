import { FoodItem, SensorData, ScanHistoryRecord } from '../types';

export interface CustomFoodItem extends FoodItem {
  isUnconfigured?: boolean;
}

export const DEFAULT_ITEMS: Record<string, CustomFoodItem> = {
  'MILK': {
    id: 'MILK',
    name: 'Ketchup Bottle',
    category: 'Condiments & Sauces',
    image: '/ketchup.jpg',
    batchId: 'BATCH-KETCHUP-102',
    tagId: '#YGS-FD-000124',
    description: 'Fresh tomato ketchup supply chain package monitored in real-time.',
    optimalTemp: '2 - 8°C',
    optimalHumidity: '45 - 65%',
    maxGas: 150,
  },
  'KETCHUP': {
    id: 'KETCHUP',
    name: 'Ketchup Bottle',
    category: 'Condiments & Sauces',
    image: '/ketchup.jpg',
    batchId: 'BATCH-KETCHUP-102',
    tagId: '#YGS-FD-000124',
    description: 'Fresh tomato ketchup supply chain package monitored in real-time.',
    optimalTemp: '2 - 8°C',
    optimalHumidity: '45 - 65%',
    maxGas: 150,
  },
  'MEAT': {
    id: 'MEAT',
    name: 'Meat Package',
    category: 'Meat Products',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
    batchId: 'BATCH-MEAT-204',
    tagId: '#YGS-FD-112233',
    description: 'Meat supply chain package monitored in real-time.',
    optimalTemp: '-2 - 4°C',
    optimalHumidity: '60 - 80%',
    maxGas: 120,
    isUnconfigured: true,
  }
};

export const DEFAULT_SENSOR_DATA: Record<string, SensorData> = {
  'MILK': {
    temperature: 4.2,
    humidity: 62,
    gas: 120,
    moisture: 4.0,
    dewPoint: -2.3,
    ph: 3.85,
    timestamp: Date.now(),
  },
  'KETCHUP': {
    temperature: 4.2,
    humidity: 62,
    gas: 120,
    moisture: 4.0,
    dewPoint: -2.3,
    ph: 3.85,
    timestamp: Date.now(),
  }
};

export const DEFAULT_SCAN_HISTORY: ScanHistoryRecord[] = [];
