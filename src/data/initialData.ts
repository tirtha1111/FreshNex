import { FoodItem, SensorData, ScanHistoryRecord } from '../types';

export interface CustomFoodItem extends FoodItem {
  isUnconfigured?: boolean;
}

export const FACTUAL_PRODUCT_IMAGES: Record<string, string> = {
  APPLE: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=640&auto=format&fit=crop&q=85',
  MILK: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=640&auto=format&fit=crop&q=85',
  TOMATO: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=640&auto=format&fit=crop&q=85',
  MEAT: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=640&auto=format&fit=crop&q=85',
  BANANA: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=640&auto=format&fit=crop&q=85',
  SPINACH: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=640&auto=format&fit=crop&q=85',
  STRAWBERRY: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=640&auto=format&fit=crop&q=85',
  COLD_DRINKS: '/colddrinks.jpg',
  KETCHUP: '/ketchup.jpg',
};

export const DEFAULT_ITEMS: Record<string, CustomFoodItem> = {
  'APPLE': {
    id: 'APPLE',
    name: 'Fresh Apples',
    category: 'Fruits & Orchard Produce',
    image: FACTUAL_PRODUCT_IMAGES.APPLE,
    batchId: 'BATCH-APPLE-101',
    tagId: '#APPLE',
    description: 'Crisp organic orchard apples monitored via real-time bio-telemetry for optimal crunch, moisture, and ethylene preservation.',
    optimalTemp: '2 - 6°C',
    optimalHumidity: '85 - 95%',
    maxGas: 100,
  },
  'MILK': {
    id: 'MILK',
    name: 'Fresh Milk',
    category: 'Farm Fresh Dairy',
    image: FACTUAL_PRODUCT_IMAGES.MILK,
    batchId: 'BATCH-MILK-202',
    tagId: '#MILK',
    description: 'Pasteurized farm-fresh dairy milk monitored continuously for cold-chain integrity, lactic pH stability, and head-space purity.',
    optimalTemp: '1 - 4°C',
    optimalHumidity: '65 - 75%',
    maxGas: 120,
  }
};

export function resolveFactualProduct(tagOrName?: string | null, currentImage?: string | null): CustomFoodItem {
  const raw = (tagOrName || '').trim().toUpperCase().replace(/^#/, '');

  if (raw === 'MILK' || raw.includes('MILK') || raw.includes('DAIRY') || raw.includes('000126') || raw.includes('126')) {
    return DEFAULT_ITEMS['MILK'];
  }
  if (raw === 'APPLE' || raw.includes('APPLE') || raw.includes('FRUIT') || raw.includes('000125') || raw.includes('125')) {
    return DEFAULT_ITEMS['APPLE'];
  }
  if (raw.includes('TOMATO')) {
    return {
      id: 'TOMATO',
      name: 'Fresh Organic Tomatoes',
      category: 'Fresh Vegetables',
      image: FACTUAL_PRODUCT_IMAGES.TOMATO,
      batchId: 'BATCH-TOM-301',
      tagId: '#TOMATO',
      description: 'Vine-ripened organic tomatoes tracked for firmness, humidity, and ethylene gas emissions.',
      optimalTemp: '4 - 8°C',
      optimalHumidity: '85 - 90%',
      maxGas: 110,
    };
  }
  if (raw.includes('MEAT')) {
    return {
      id: 'MEAT',
      name: 'Fresh Chilled Meat',
      category: 'Chilled Poultry & Meat',
      image: FACTUAL_PRODUCT_IMAGES.MEAT,
      batchId: 'BATCH-MEAT-401',
      tagId: '#MEAT',
      description: 'Cold-chain protein pack monitored for strict thermal bounds and volatile amine compounds.',
      optimalTemp: '0 - 4°C',
      optimalHumidity: '75 - 85%',
      maxGas: 95,
    };
  }
  if (raw.includes('BANANA')) {
    return {
      id: 'BANANA',
      name: 'Fresh Bananas',
      category: 'Tropical Fruits',
      image: FACTUAL_PRODUCT_IMAGES.BANANA,
      batchId: 'BATCH-BAN-501',
      tagId: '#BANANA',
      description: 'Fresh harvest bananas monitored for ripening gas and humidity balance.',
      optimalTemp: '12 - 15°C',
      optimalHumidity: '85 - 95%',
      maxGas: 115,
    };
  }
  if (raw.includes('SPINACH') || raw.includes('LEAF') || raw.includes('GREENS')) {
    return {
      id: 'SPINACH',
      name: 'Fresh Organic Spinach',
      category: 'Leafy Greens',
      image: FACTUAL_PRODUCT_IMAGES.SPINACH,
      batchId: 'BATCH-SPN-601',
      tagId: '#SPINACH',
      description: 'Field-fresh leafy greens monitored for crispness and moisture retention.',
      optimalTemp: '1 - 4°C',
      optimalHumidity: '90 - 95%',
      maxGas: 90,
    };
  }
  if (raw.includes('KETCHUP')) {
    return {
      id: 'KETCHUP',
      name: 'Organic Tomato Ketchup',
      category: 'Condiments',
      image: FACTUAL_PRODUCT_IMAGES.KETCHUP,
      batchId: 'BATCH-KET-701',
      tagId: '#KETCHUP',
      description: 'Sealed condiment batch monitored for ambient thermal and fermentation stability.',
      optimalTemp: '2 - 8°C',
      optimalHumidity: '60 - 75%',
      maxGas: 120,
    };
  }
  if (raw.includes('COLD_DRINKS') || raw.includes('DRINK')) {
    return DEFAULT_ITEMS['APPLE'];
  }

  if (raw && raw !== 'YGS-FD-000124') {
    const validCustomImg =
      currentImage && currentImage !== '/colddrinks.jpg' ? currentImage : FACTUAL_PRODUCT_IMAGES.APPLE;
    return {
      id: raw,
      name: raw.charAt(0) + raw.slice(1).toLowerCase(),
      category: 'Fresh Monitored Produce',
      image: validCustomImg,
      batchId: `BATCH-${raw}-101`,
      tagId: `#${raw}`,
      description: `Live IoT freshness telemetry active for ${raw}.`,
      optimalTemp: '2 - 6°C',
      optimalHumidity: '75 - 90%',
      maxGas: 110,
    };
  }

  return DEFAULT_ITEMS['APPLE'];
}

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
