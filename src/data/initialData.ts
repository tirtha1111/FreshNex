import { FoodItem, SensorData, ScanHistoryRecord } from '../types';

export interface CustomFoodItem extends FoodItem {
  isUnconfigured?: boolean;
}

export const DEFAULT_ITEMS: Record<string, CustomFoodItem> = {
  'COLD_DRINKS': {
    id: 'COLD_DRINKS',
    name: 'Cold Drinks',
    category: 'Beverages',
    image: '/colddrinks.jpg',
    batchId: 'BATCH-DRINKS-102',
    tagId: '#YGS-FD-000124',
    description: 'Chilled cold drinks supply chain package monitored in real-time.',
    optimalTemp: '1 - 5°C',
    optimalHumidity: '50 - 70%',
    maxGas: 150,
  },
  'MILK': {
    id: 'MILK',
    name: 'Cold Drinks',
    category: 'Beverages',
    image: '/colddrinks.jpg',
    batchId: 'BATCH-DRINKS-102',
    tagId: '#YGS-FD-000124',
    description: 'Chilled cold drinks supply chain package monitored in real-time.',
    optimalTemp: '1 - 5°C',
    optimalHumidity: '50 - 70%',
    maxGas: 150,
  },
  'KETCHUP': {
    id: 'KETCHUP',
    name: 'Cold Drinks',
    category: 'Beverages',
    image: '/colddrinks.jpg',
    batchId: 'BATCH-DRINKS-102',
    tagId: '#YGS-FD-000124',
    description: 'Chilled cold drinks supply chain package monitored in real-time.',
    optimalTemp: '1 - 5°C',
    optimalHumidity: '50 - 70%',
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
  'COLD_DRINKS': {
    temperature: 3.5,
    humidity: 58,
    gas: 110,
    moisture: 4.2,
    dewPoint: -3.0,
    ph: 4.2,
    timestamp: Date.now(),
  },
  'MILK': {
    temperature: 3.5,
    humidity: 58,
    gas: 110,
    moisture: 4.2,
    dewPoint: -3.0,
    ph: 4.2,
    timestamp: Date.now(),
  },
  'KETCHUP': {
    temperature: 3.5,
    humidity: 58,
    gas: 110,
    moisture: 4.2,
    dewPoint: -3.0,
    ph: 4.2,
    timestamp: Date.now(),
  }
};

export const DEFAULT_SCAN_HISTORY: ScanHistoryRecord[] = [];
