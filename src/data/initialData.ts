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
DEFAULT_ITEMS['6D66F406'] = DEFAULT_ITEMS['APPLE'];
DEFAULT_ITEMS['124'] = DEFAULT_ITEMS['MILK'];
DEFAULT_ITEMS['YGS-FD-124'] = DEFAULT_ITEMS['MILK'];
DEFAULT_ITEMS['61896F06'] = DEFAULT_ITEMS['MILK'];

export function resolveFactualProduct(tagOrName?: string | null, currentImage?: string | null): CustomFoodItem {
  const raw = (tagOrName || '').trim().toUpperCase().replace(/^#/, '');

  if (
    raw === 'MILK' ||
    raw === '124' ||
    raw === 'YGS-FD-124' ||
    raw === '61896F06' ||
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
    raw === '6D66F406' ||
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
    temperature: 31.6,
    humidity: 71.2,
    gas: 79,
    moisture: 23.5,
    dewPoint: 25.8,
    ph: 3.7,
    impact: 0.147,
    light: 12.5,
    gpsLat: 31.2536,
    gpsLng: 75.7037,
    gpsSats: 0,
    timestamp: Date.now(),
  },
  'MILK': {
    temperature: 30.6,
    humidity: 72.2,
    gas: 47,
    moisture: 22.6,
    dewPoint: 25.1,
    ph: 6.3,
    impact: 0,
    light: 33.3,
    gpsLat: 0,
    gpsLng: 0,
    gpsSats: 0,
    timestamp: Date.now(),
  }
};

DEFAULT_SENSOR_DATA['001'] = DEFAULT_SENSOR_DATA['APPLE'];
DEFAULT_SENSOR_DATA['YGS-FD-001'] = DEFAULT_SENSOR_DATA['APPLE'];
DEFAULT_SENSOR_DATA['6D66F406'] = DEFAULT_SENSOR_DATA['APPLE'];
DEFAULT_SENSOR_DATA['124'] = DEFAULT_SENSOR_DATA['MILK'];
DEFAULT_SENSOR_DATA['YGS-FD-124'] = DEFAULT_SENSOR_DATA['MILK'];
DEFAULT_SENSOR_DATA['61896F06'] = DEFAULT_SENSOR_DATA['MILK'];

export const DEFAULT_SCAN_HISTORY: ScanHistoryRecord[] = [];
