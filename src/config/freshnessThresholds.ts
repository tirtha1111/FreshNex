/**
 * FreshNex Scientific Freshness Thresholds & Cold-Chain Safety Standards
 * Grounded in USDA Agriculture Handbook 66, FDA Food Safety Standards (§3-501.16),
 * and Postharvest Technology Center guidelines (UC Davis).
 */

export interface FreshnessWeights {
  temp: number;      // Weight contribution of temperature (0 - 1)
  humidity: number;  // Weight contribution of relative humidity (0 - 1)
  gas: number;       // Weight contribution of volatile/VOC gases (0 - 1)
}

export interface FreshnessCategoryThresholds {
  categoryName: string;
  // Temperature standards in °C
  tempOptimalMin: number;   // Lower limit of optimal chilling (e.g. 1.0°C)
  tempOptimalMax: number;   // Upper limit of optimal chilling (e.g. 4.0°C)
  tempWarningMax: number;   // Cold-chain elevation warning (e.g. 7.0°C)
  tempCriticalMax: number;  // Severe thermal abuse / Danger Zone (e.g. 12.0°C)
  tempFreezeRisk: number;   // Freezing / chill damage boundary (e.g. 0.0°C)

  // Relative Humidity standards in %
  humidityOptimalMin: number;  // Lower limit to prevent dehydration/wilting (e.g. 50%)
  humidityOptimalMax: number;  // Upper limit to prevent surface condensation/mold (e.g. 75%)
  humidityWarningMin: number;  // Desiccation alert (e.g. 35%)
  humidityWarningMax: number;  // Condensation alert (e.g. 85%)

  // Gas / VOC standards (calibrated PPM)
  gasOptimalMax: number;   // Clean baseline atmosphere (e.g. 140 ppm)
  gasWarningMax: number;   // Early ripening / microbial off-gassing (e.g. 230 ppm)
  gasCriticalMax: number;  // Severe decomposition / volatile amines (e.g. 360 ppm)

  // MQ-135 Raw ADC Standards (0 - 4095 range from ESP32 analog pins)
  gasAdcBaseline: number;  // Clean air raw ADC threshold (e.g. 1100)
  gasAdcWarning: number;   // Elevated raw ADC threshold (e.g. 1400)
  gasAdcCritical: number;  // Critical decomposition raw ADC (e.g. 1800)

  // Multi-Component Quality Index (MCQI) Weights (sum to 1.0)
  weights: FreshnessWeights;

  // Scientific metadata
  scientificReference: string;
  rationale: string;
}

export const CATEGORY_THRESHOLDS: Record<string, FreshnessCategoryThresholds> = {
  Dairy: {
    categoryName: 'Dairy Products',
    tempOptimalMin: 1.0,
    tempOptimalMax: 4.5,
    tempWarningMax: 7.5,
    tempCriticalMax: 12.0,
    tempFreezeRisk: 0.0,
    humidityOptimalMin: 50.0,
    humidityOptimalMax: 75.0,
    humidityWarningMin: 35.0,
    humidityWarningMax: 85.0,
    gasOptimalMax: 140.0,
    gasWarningMax: 220.0,
    gasCriticalMax: 350.0,
    gasAdcBaseline: 1150,
    gasAdcWarning: 1400,
    gasAdcCritical: 1800,
    weights: { temp: 0.45, humidity: 0.20, gas: 0.35 },
    scientificReference: 'FDA Food Code §3-501.16 / USDA Pasteurization Ordinance',
    rationale: 'Strict chilling prevents psychrotrophic bacterial proliferation. Moderate humidity preserves packaging integrity without container moisture.'
  },
  Meat: {
    categoryName: 'Meat Products',
    tempOptimalMin: 0.0,
    tempOptimalMax: 4.0,
    tempWarningMax: 7.0,
    tempCriticalMax: 11.0,
    tempFreezeRisk: -1.5,
    humidityOptimalMin: 60.0,
    humidityOptimalMax: 80.0,
    humidityWarningMin: 45.0,
    humidityWarningMax: 90.0,
    gasOptimalMax: 150.0,
    gasWarningMax: 240.0,
    gasCriticalMax: 380.0,
    gasAdcBaseline: 1150,
    gasAdcWarning: 1400,
    gasAdcCritical: 1850,
    weights: { temp: 0.40, humidity: 0.15, gas: 0.45 },
    scientificReference: 'USDA FSIS Directive 7111.1 / EFSA Microbiological Criteria',
    rationale: 'Total volatile basic nitrogen (TVB-N) and sulfur off-gassing from proteolytic bacterial decay correlate strongly with temperature excursions.'
  },
  Poultry: {
    categoryName: 'Poultry Products',
    tempOptimalMin: 0.0,
    tempOptimalMax: 3.5,
    tempWarningMax: 6.5,
    tempCriticalMax: 10.0,
    tempFreezeRisk: -1.5,
    humidityOptimalMin: 60.0,
    humidityOptimalMax: 80.0,
    humidityWarningMin: 45.0,
    humidityWarningMax: 90.0,
    gasOptimalMax: 140.0,
    gasWarningMax: 220.0,
    gasCriticalMax: 360.0,
    gasAdcBaseline: 1120,
    gasAdcWarning: 1380,
    gasAdcCritical: 1800,
    weights: { temp: 0.40, humidity: 0.15, gas: 0.45 },
    scientificReference: 'USDA Food Safety and Inspection Service Guidelines',
    rationale: 'Highly susceptible to Salmonella and Campylobacter; gas emissions track rapid amino-acid degradation.'
  },
  Seafood: {
    categoryName: 'Seafood & Fish',
    tempOptimalMin: -0.5,
    tempOptimalMax: 2.5,
    tempWarningMax: 5.5,
    tempCriticalMax: 9.0,
    tempFreezeRisk: -2.0,
    humidityOptimalMin: 65.0,
    humidityOptimalMax: 85.0,
    humidityWarningMin: 50.0,
    humidityWarningMax: 95.0,
    gasOptimalMax: 120.0,
    gasWarningMax: 190.0,
    gasCriticalMax: 300.0,
    gasAdcBaseline: 1100,
    gasAdcWarning: 1350,
    gasAdcCritical: 1750,
    weights: { temp: 0.40, humidity: 0.10, gas: 0.50 },
    scientificReference: 'FAO Fisheries Technical Paper 409 / Codex Alimentarius',
    rationale: 'Trimethylamine (TMA) and dimethylamine production occurs rapidly above 3°C due to endogenous enzymes and psychrotolerant bacteria.'
  },
  Vegetable: {
    categoryName: 'Fresh Vegetables & Produce',
    tempOptimalMin: 2.0,
    tempOptimalMax: 7.0,
    tempWarningMax: 12.0,
    tempCriticalMax: 18.0,
    tempFreezeRisk: 0.5,
    humidityOptimalMin: 80.0,
    humidityOptimalMax: 95.0,
    humidityWarningMin: 60.0,
    humidityWarningMax: 98.0,
    gasOptimalMax: 150.0,
    gasWarningMax: 240.0,
    gasCriticalMax: 360.0,
    gasAdcBaseline: 1200,
    gasAdcWarning: 1450,
    gasAdcCritical: 1900,
    weights: { temp: 0.35, humidity: 0.35, gas: 0.30 },
    scientificReference: 'UC Davis Postharvest Technology Center / USDA Handbook 66',
    rationale: 'High relative humidity maintains cellular turgor and prevents transpiration; ethylene gas accelerates chlorophyll catabolism.'
  },
  Fruit: {
    categoryName: 'Fresh Fruits',
    tempOptimalMin: 3.0,
    tempOptimalMax: 8.0,
    tempWarningMax: 14.0,
    tempCriticalMax: 20.0,
    tempFreezeRisk: 1.0,
    humidityOptimalMin: 75.0,
    humidityOptimalMax: 90.0,
    humidityWarningMin: 55.0,
    humidityWarningMax: 98.0,
    gasOptimalMax: 160.0,
    gasWarningMax: 260.0,
    gasCriticalMax: 390.0,
    gasAdcBaseline: 1250,
    gasAdcWarning: 1500,
    gasAdcCritical: 1950,
    weights: { temp: 0.35, humidity: 0.35, gas: 0.30 },
    scientificReference: 'USDA Agriculture Handbook 66: Commercial Storage of Fruits & Veg',
    rationale: 'Ethylene gas monitoring signals climacteric ripening cascades and senescence.'
  },
};

export const DEFAULT_THRESHOLDS: FreshnessCategoryThresholds = {
  categoryName: 'Standard Perishable Goods',
  tempOptimalMin: 0.0,
  tempOptimalMax: 8.0,
  tempWarningMax: 8.0,
  tempCriticalMax: 15.0,
  tempFreezeRisk: -1.0,
  humidityOptimalMin: 40.0,
  humidityOptimalMax: 85.0,
  humidityWarningMin: 30.0,
  humidityWarningMax: 90.0,
  gasOptimalMax: 250.0,
  gasWarningMax: 250.0,
  gasCriticalMax: 400.0,
  gasAdcBaseline: 1150,
  gasAdcWarning: 1400,
  gasAdcCritical: 1800,
  weights: { temp: 0.40, humidity: 0.25, gas: 0.35 },
  scientificReference: 'FreshNex Cold-Chain Quality Threshold Standards',
  rationale: 'Calibrated directly to active threshold safety rules (Safe ≤ 8°C, RH 40–85%, Gas ≤ 250 ppm).'
};

/**
 * Resolves appropriate category threshold standards using robust string matching
 */
export function resolveThresholdsForCategory(category?: string): FreshnessCategoryThresholds {
  if (!category) return DEFAULT_THRESHOLDS;
  const c = category.toLowerCase().trim();

  if (c.includes('dairy') || c.includes('milk') || c.includes('cheese') || c.includes('yogurt') || c.includes('butter')) {
    return CATEGORY_THRESHOLDS.Dairy;
  }
  if (c.includes('poultry') || c.includes('chicken') || c.includes('turkey') || c.includes('duck')) {
    return CATEGORY_THRESHOLDS.Poultry;
  }
  if (c.includes('meat') || c.includes('beef') || c.includes('pork') || c.includes('lamb') || c.includes('steak')) {
    return CATEGORY_THRESHOLDS.Meat;
  }
  if (c.includes('seafood') || c.includes('fish') || c.includes('salmon') || c.includes('shrimp') || c.includes('tuna')) {
    return CATEGORY_THRESHOLDS.Seafood;
  }
  if (c.includes('veg') || c.includes('produce') || c.includes('salad') || c.includes('spinach') || c.includes('tomato')) {
    return CATEGORY_THRESHOLDS.Vegetable;
  }
  if (c.includes('fruit') || c.includes('apple') || c.includes('berry') || c.includes('orange') || c.includes('banana')) {
    return CATEGORY_THRESHOLDS.Fruit;
  }

  return DEFAULT_THRESHOLDS;
}
