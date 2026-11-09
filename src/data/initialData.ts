import { FoodItem, SensorData, ScanHistoryRecord } from '../types';
import appleProductImg from '../assets/images/fresh_red_apples_product_1794239934714.jpg';
import milkProductImg from '../assets/images/fresh_dairy_milk_product_1794239934344.jpg';
import tomatoCardImg from '../assets/images/freshnex_tomato_card_1789921202123.jpg';
import heroCrateImg from '../assets/images/freshnex_hero_crate_1789921168287.jpg';

export interface CustomFoodItem extends FoodItem {
  isUnconfigured?: boolean;
}

export const FACTUAL_PRODUCT_IMAGES: Record<string, string> = {
  APPLE: appleProductImg,
  MILK: milkProductImg,
  TOMATO: tomatoCardImg,
  MEAT: heroCrateImg,
  BANANA: heroCrateImg,
  SPINACH: heroCrateImg,
  STRAWBERRY: appleProductImg,
  COLD_DRINKS: '/colddrinks.jpg',
  KETCHUP: '/ketchup.jpg',
};

export const DEFAULT_ITEMS: Record<string, CustomFoodItem> = {
  'APPLE': {
    id: 'YGS-FD-001',
    name: 'Apple',
    category: 'Fruits & Orchard Produce',
    image: FACTUAL_PRODUCT_IMAGES.APPLE,
    batchId: 'BATCH-APL-001',
    tagId: 'YGS-FD-001',
    description: 'Crisp organic apples monitored via real-time bio-telemetry for optimal crunch, moisture, and ethylene preservation.',
    optimalTemp: '0 - 4°C',
    optimalHumidity: '85 - 95%',
    maxGas: 100,
  },
  'MILK': {
    id: 'YGS-FD-124',
    name: 'Milk',
    category: 'Farm Fresh Dairy',
    image: FACTUAL_PRODUCT_IMAGES.MILK,
    batchId: 'BATCH-MLK-124',
    tagId: 'YGS-FD-124',
    description: 'Pasteurized farm-fresh dairy milk monitored continuously for cold-chain integrity, lactic pH stability, and freshness.',
    optimalTemp: '1 - 4°C',
    optimalHumidity: '65 - 75%',
    maxGas: 120,
  }
};

// Aliases for direct lookup
DEFAULT_ITEMS['001'] = DEFAULT_ITEMS['APPLE'];
DEFAULT_ITEMS['YGS-FD-001'] = DEFAULT_ITEMS['APPLE'];
DEFAULT_ITEMS['124'] = DEFAULT_ITEMS['MILK'];
DEFAULT_ITEMS['YGS-FD-124'] = DEFAULT_ITEMS['MILK'];

export function resolveFactualProduct(tagOrName?: string | null, currentImage?: string | null): CustomFoodItem {
  const raw = (tagOrName || '').trim().toUpperCase().replace(/^#/, '');

  if (
    raw === 'MILK' ||
    raw === '124' ||
    raw === 'YGS-FD-124' ||
    raw.includes('MILK') ||
    raw.includes('DAIRY') ||
    raw.includes('124')
  ) {
    return DEFAULT_ITEMS['MILK'];
  }
  if (
    raw === 'APPLE' ||
    raw === '001' ||
    raw === 'YGS-FD-001' ||
    raw.includes('APPLE') ||
    raw.includes('FRESORA') ||
    raw.includes('001') ||
    raw.includes('FRUIT')
  ) {
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

  if (raw) {
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

DEFAULT_SENSOR_DATA['001'] = DEFAULT_SENSOR_DATA['APPLE'];
DEFAULT_SENSOR_DATA['YGS-FD-001'] = DEFAULT_SENSOR_DATA['APPLE'];
DEFAULT_SENSOR_DATA['124'] = DEFAULT_SENSOR_DATA['MILK'];
DEFAULT_SENSOR_DATA['YGS-FD-124'] = DEFAULT_SENSOR_DATA['MILK'];

export const DEFAULT_SCAN_HISTORY: ScanHistoryRecord[] = [];
