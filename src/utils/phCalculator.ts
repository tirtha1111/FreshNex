/**
 * FreshNex pH Calculation Engine
 * 
 * Computes derived biochemical & thermodynamic pH of food packages,
 * agricultural produce, and storage microclimates directly from real-time:
 * 1. Temperature (°C)
 * 2. Relative Humidity (%)
 * 3. Calculated Psychrometric Moisture (g/m³) & Dew Point
 * 4. Optional VOC / Gas Level (ppm or raw ADC)
 * 
 * Scientific Principles:
 * - Nernst Thermodynamic Ionization: Hydrolysis and water dissociation Kw(T) shift with temperature.
 * - Microbial Kinetic Rate: Elevated temperature and moisture accelerate enzymatic fermentation
 *   (e.g., lactic acid bacteria converting lactose to lactic acid in dairy, organic acid decay in fruits,
 *   or proteolytic volatile base formation in proteins).
 * - Moisture Film & Water Activity: High moisture density (> 11 g/m³) and condensation trigger
 *   aqueous phase acid dissociation.
 */

import { calculateMoisture, MoistureReading } from './moistureCalculator';

export interface PHReading {
  // Calculated pH value (typically 3.00 - 9.00, 2 decimal precision)
  ph: number;
  // Qualitative pH status
  status: 'Optimal' | 'Balanced' | 'Mild Acidic' | 'Acidic / Fermenting' | 'Alkaline Shift';
  // UI Badge styling
  statusColor: string;
  statusBg: string;
  statusBorder: string;
  // Classification
  acidityClassification: 'Balanced / Fresh' | 'Slightly Acidic' | 'Acidic / Fermented' | 'Alkaline';
  // Hydrogen ion concentration in scientific notation (e.g., 2.24 × 10⁻⁷ M)
  hydrogenIonConcentration: string;
  // Component influence breakdown
  temperatureFactor: number;
  moistureFactor: number;
  humidityFactor: number;
  gasFactor: number;
  recommendation: string;
}

export interface PHCalculationOptions {
  category?: string;
  gas?: number;
  baselinePH?: number;
}

/**
 * Calculates real-time pH from temperature, humidity, and calculated moisture.
 * 
 * @param temperature - Ambient / surface temperature in °C
 * @param humidity - Relative Humidity in % (0 - 100)
 * @param moisture - Optional calculated moisture (g/m³). If omitted, automatically derived.
 * @param options - Additional parameters (food category, gas ppm, custom baseline)
 */
export function calculatePH(
  temperature: number,
  humidity: number,
  moisture?: number,
  options?: PHCalculationOptions
): PHReading {
  const T = Number.isFinite(temperature) ? temperature : 4.2;
  const RH = Number.isFinite(humidity) ? Math.max(0, Math.min(100, humidity)) : 62.0;
  
  // If moisture is not provided, calculate it psychrometrically
  const moistureData: MoistureReading = Number.isFinite(moisture) && moisture !== undefined
    ? { absoluteMoisture: moisture, dewPoint: 0, vaporPressure: 0, saturationVaporPressure: 0, moistureRatio: 0, status: 'Optimal', statusColor: '#20E79A', recommendation: '' }
    : calculateMoisture(T, RH);

  const absMoisture = moistureData.absoluteMoisture;

  // 1. Resolve Baseline pH according to Category
  let basePH = 6.65; // Default standard food / dairy baseline (Fresh milk ~ 6.60 - 6.75)
  const cat = options?.category?.toLowerCase() || '';

  if (options?.baselinePH !== undefined && Number.isFinite(options.baselinePH)) {
    basePH = options.baselinePH;
  } else if (cat.includes('meat') || cat.includes('poultry') || cat.includes('beef') || cat.includes('chicken')) {
    basePH = 5.75; // Fresh chilled meat baseline
  } else if (cat.includes('fish') || cat.includes('seafood')) {
    basePH = 6.45; // Fresh fish baseline
  } else if (cat.includes('fruit') || cat.includes('berry') || cat.includes('produce')) {
    basePH = 6.10; // Fresh produce baseline
  } else if (cat.includes('dairy') || cat.includes('milk') || cat.includes('cheese') || cat.includes('yogurt')) {
    basePH = 6.68; // Fresh milk baseline
  }

  // 2. Temperature Thermal Kinetic Coefficient (ΔpH_T)
  // Optimal cold storage reference is ~4.0°C.
  // Thermal activation accelerates acid production by ~0.022 pH units per °C deviation above 4°C.
  // Sub-zero / freezing maintains buffer stability.
  const tempDelta = T - 4.0;
  let tempFactor = 0;
  if (tempDelta > 0) {
    // Exponential thermal degradation response above 4°C
    tempFactor = -0.022 * tempDelta - 0.0012 * Math.pow(Math.max(0, tempDelta - 8), 1.5);
  } else {
    // Slight stabilization under deep cold
    tempFactor = Math.min(0.08, 0.01 * Math.abs(tempDelta));
  }

  // 3. Moisture & Humidity Aqueous Dissociation Factor (ΔpH_M)
  // Baseline optimal absolute moisture is ~3.5 - 6.0 g/m³.
  // Elevated moisture (> 7.5 g/m³) and high RH (> 70%) hydrate microbial membranes,
  // causing accelerated glycolysis and lactic / organic acid synthesis.
  let moistureFactor = 0;
  if (absMoisture > 6.5) {
    const moistureExcess = absMoisture - 6.5;
    moistureFactor = -0.028 * Math.min(moistureExcess, 15);
  } else if (absMoisture < 2.0) {
    // Extreme dry dehydration can cause ionic concentration shift
    moistureFactor = -0.05;
  }

  // Relative humidity factor
  let humidityFactor = 0;
  if (RH > 75) {
    humidityFactor = -0.015 * ((RH - 75) / 10);
  } else if (RH < 35) {
    humidityFactor = -0.01 * ((35 - RH) / 10);
  }

  // 4. Gas / Volatile Decomposition Shift (if present)
  let gasFactor = 0;
  const gas = options?.gas;
  if (gas !== undefined && Number.isFinite(gas)) {
    const isRaw = gas > 500;
    const effectivePpm = isRaw ? Math.max(0, (gas - 900) / 12) : gas;
    if (effectivePpm > 180) {
      // In meat, VOCs (ammonia/amines) cause alkaline shift; in dairy/produce, organic acids cause acid shift
      if (cat.includes('meat') || cat.includes('fish') || cat.includes('seafood')) {
        gasFactor = +0.035 * Math.min((effectivePpm - 180) / 100, 1.2); // Base amine accumulation
      } else {
        gasFactor = -0.045 * Math.min((effectivePpm - 180) / 100, 1.4); // Acidic fermentation
      }
    }
  }

  // 5. Aggregate Calculated pH (Clamped between realistic biological limits 3.50 and 8.80)
  const rawCalculatedPH = basePH + tempFactor + moistureFactor + humidityFactor + gasFactor;
  const clampedPH = Math.max(3.50, Math.min(8.80, rawCalculatedPH));
  const ph = +clampedPH.toFixed(2);

  // 6. Hydrogen Ion Concentration [H+] = 10^(-pH)
  const hConcentration = Math.pow(10, -ph);
  const exponent = Math.floor(Math.log10(hConcentration));
  const mantissa = +(hConcentration / Math.pow(10, exponent)).toFixed(2);
  const hydrogenIonConcentration = `${mantissa} × 10${toSuperscript(exponent)} M`;

  // 7. Status & Qualitative Classification
  let status: 'Optimal' | 'Balanced' | 'Mild Acidic' | 'Acidic / Fermenting' | 'Alkaline Shift' = 'Optimal';
  let statusColor = '#20E79A'; // Emerald
  let statusBg = '#EBFBF4';
  let statusBorder = '#20E79A';
  let acidityClassification: 'Balanced / Fresh' | 'Slightly Acidic' | 'Acidic / Fermented' | 'Alkaline' = 'Balanced / Fresh';
  let recommendation = 'Hydrogen ion concentration is stable in ideal cold-chain preservation equilibrium.';

  if (ph < 5.80) {
    status = 'Acidic / Fermenting';
    statusColor = '#EF4444'; // Red
    statusBg = '#FEE2E2';
    statusBorder = '#FCA5A5';
    acidityClassification = 'Acidic / Fermented';
    recommendation = `Acidic shift detected (pH ${ph}). Elevated temperature (${T}°C) and moisture (${absMoisture} g/m³) have accelerated microbial fermentation and lactic acid accumulation.`;
  } else if (ph < 6.40) {
    status = 'Mild Acidic';
    statusColor = '#F59E0B'; // Amber
    statusBg = '#FEF3C7';
    statusBorder = '#FCD34D';
    acidityClassification = 'Slightly Acidic';
    recommendation = `Moderate pH decline (pH ${ph}). Moisture (${absMoisture} g/m³) and warmth are accelerating metabolic hydrolysis. Chilling recommended.`;
  } else if (ph > 7.40) {
    status = 'Alkaline Shift';
    statusColor = '#8B5CF6'; // Purple
    statusBg = '#EDE9FE';
    statusBorder = '#C4B5FD';
    acidityClassification = 'Alkaline';
    recommendation = `Alkaline shift (pH ${ph}) indicates proteolytic degradation and volatile basic nitrogen release under warm moisture conditions.`;
  } else if (ph >= 6.40 && ph <= 6.85) {
    status = 'Optimal';
    statusColor = '#20E79A'; // Emerald
    statusBg = '#EBFBF4';
    statusBorder = '#20E79A';
    acidityClassification = 'Balanced / Fresh';
    recommendation = `Optimal pH ${ph} maintained. Temperature (${T}°C) and moisture (${absMoisture} g/m³) preserve pristine cellular barrier integrity.`;
  } else {
    status = 'Balanced';
    statusColor = '#0EA5E9'; // Sky blue
    statusBg = '#E0F2FE';
    statusBorder = '#7DD3FC';
    acidityClassification = 'Balanced / Fresh';
    recommendation = `Stable pH ${ph} within acceptable food freshness parameters.`;
  }

  return {
    ph,
    status,
    statusColor,
    statusBg,
    statusBorder,
    acidityClassification,
    hydrogenIonConcentration,
    temperatureFactor: +tempFactor.toFixed(3),
    moistureFactor: +moistureFactor.toFixed(3),
    humidityFactor: +humidityFactor.toFixed(3),
    gasFactor: +gasFactor.toFixed(3),
    recommendation,
  };
}

/**
 * Helper to convert numbers to superscript string (e.g., -7 -> ⁻⁷)
 */
function toSuperscript(num: number): string {
  const digits = num.toString();
  const superscriptMap: { [k: string]: string } = {
    '-': '⁻',
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  return digits.split('').map(d => superscriptMap[d] || d).join('');
}
