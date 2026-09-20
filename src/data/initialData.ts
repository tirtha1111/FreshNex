import { FoodItem, SensorData, ScanHistoryRecord } from '../types';

export interface CustomFoodItem extends FoodItem {
  isUnconfigured?: boolean;
}

export const DEFAULT_ITEMS: Record<string, CustomFoodItem> = {
  'MILK': {
    id: 'MILK',
    name: 'Milk Package',
    category: 'Dairy Products',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    batchId: 'BATCH-MILK-102',
    tagId: '#YGS-FD-000124',
    description: 'Fresh milk supply chain package monitored in real-time.',
    optimalTemp: '2 - 6°C',
    optimalHumidity: '55 - 75%',
    maxGas: 150,
  },
  'MEAT': {
    id: 'MEAT',
    name: 'Meat Package',
    category: 'Meat Products',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&auto=format&fit=crop&q=80',
    batchId: 'BATCH-MEAT-204',
    tagId: '#MEAT-UNCONFIGURED',
    description: 'Meat supply chain package. Associated IoT node has not been configured yet.',
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
    timestamp: Date.now(),
  }
};

export const DEFAULT_SCAN_HISTORY: ScanHistoryRecord[] = [
  {
    id: 'scan-initial-milk',
    itemId: 'MILK',
    itemName: 'Milk Package',
    tagId: '#YGS-FD-000124',
    itemImage: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
    temperature: 4.2,
    humidity: 62,
    gas: 120,
    freshnessScore: 92,
    status: 'Fresh',
    timestamp: Date.now() - 3600000,
    dateStr: new Date(Date.now() - 3600000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    timeStr: new Date(Date.now() - 3600000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }
];
