import { 
  CATEGORY_THRESHOLDS, 
  DEFAULT_THRESHOLDS, 
  FreshnessCategoryThresholds, 
  resolveThresholdsForCategory 
} from '../config/freshnessThresholds';
import { 
  SensorThresholdConfig, 
  DEFAULT_THRESHOLDS as DEFAULT_ALERT_THRESHOLDS 
} from '../services/alertThresholdService';

export type FreshnessStatus = 'Fresh' | 'Good' | 'Warning' | 'At Risk' | 'Expired';

export interface FreshnessCalculationInput {
  temperature: number;
  humidity: number;
  gas: number;
  category?: string;
  expiryDate?: string | number | null;
  isUnconfigured?: boolean;
  activeThresholdRules?: Partial<SensorThresholdConfig>;
}

export interface MetricAnalysis {
  value: number;
  unit: string;
  subScore: number;
  status: 'Normal' | 'Warning' | 'Critical';
  targetRange: string;
  remark: string;
  weight: number;
}

export interface WorkingPrincipleBreakdown {
  modelName: string;
  standardReference: string;
  formulaDescription: string;
  allSensorsNormal: boolean;
  synergyMultiplier: number;
  weights: { temp: number; humidity: number; gas: number };
  subScores: { temp: number; humidity: number; gas: number };
  temperatureAnalysis: MetricAnalysis;
  humidityAnalysis: MetricAnalysis;
  gasAnalysis: MetricAnalysis;
  activeThresholdRules?: SensorThresholdConfig;
}

export interface FreshnessReport {
  score: number;
  status: FreshnessStatus;
  qualityLabel: string;
  message: string;
  scientificRemark: string;
  actionableRecommendation: string;
  statusColor: string;
  statusBg: string;
  statusBorder: string;
  tempStatus: 'Normal' | 'Warning' | 'Critical';
  humidityStatus: 'Normal' | 'Warning' | 'Critical';
  gasStatus: 'Normal' | 'Warning' | 'Critical';
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  failedParameters: string[];
  allSensorsNormal: boolean;
  workingPrinciple: WorkingPrincipleBreakdown;
  activeThresholdRules?: SensorThresholdConfig;
  // Sub-scores for detailed UI inspection
  tempScore: number;
  humidityScore: number;
  gasScore: number;
  thresholdsUsed: FreshnessCategoryThresholds;
}

export interface FreshnessResult {
  status: 'Fresh' | 'Warning' | 'Unsafe' | 'Good' | 'At Risk' | 'Expired' | 'Unknown';
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  message: string;
  failedParameters: string[];
  score?: number;
}

/**
 * Normalizes gas input:
 * Detects whether incoming reading is in Calibrated PPM (~20 to 500 ppm)
 * or Raw ADC counts from MQ-135 analog sensor (~600 to 4095).
 */
export function normalizeGasReading(
  rawGas: number, 
  thresholds: FreshnessCategoryThresholds
): {
  isRawAdc: boolean;
  effectiveValue: number;
  unit: string;
  optimalMax: number;
  warningMax: number;
  criticalMax: number;
} {
  const isRawAdc = rawGas > 500;
  if (isRawAdc) {
    return {
      isRawAdc: true,
      effectiveValue: rawGas,
      unit: 'ADC',
      optimalMax: thresholds.gasAdcBaseline,
      warningMax: thresholds.gasAdcWarning,
      criticalMax: thresholds.gasAdcCritical,
    };
  }

  return {
    isRawAdc: false,
    effectiveValue: rawGas,
    unit: 'ppm',
    optimalMax: thresholds.gasOptimalMax,
    warningMax: thresholds.gasWarningMax,
    criticalMax: thresholds.gasCriticalMax,
  };
}

/**
 * Calculates scientifically grounded freshness score, status, and remarks
 * using the Multi-Component Quality Index (MCQI) model.
 */
export function calculateFreshness(
  inputOrProduct: FreshnessCalculationInput | any,
  reading?: any
): FreshnessReport & FreshnessResult {
  let temperature = 4.2;
  let humidity = 62;
  let gas = 120;
  let category: string | undefined = undefined;
  let expiryDate: string | number | null = null;
  let isUnconfigured = false;

  // Polymorphic signature handling
  if (reading !== undefined) {
    const product = inputOrProduct;
    if (!product || !reading) {
      const defaultThresh = DEFAULT_THRESHOLDS;
      return {
        score: 50,
        status: 'Fresh',
        qualityLabel: 'Awaiting Telemetry',
        riskLevel: 'unknown',
        message: 'Awaiting sensor telemetry data from IoT nodes.',
        scientificRemark: 'Hardware node has not completed initial sensor handshake.',
        actionableRecommendation: 'Connect sensor probe or scan RFID/QR tag.',
        statusColor: '#17435A',
        statusBg: 'rgba(23, 67, 90, 0.15)',
        statusBorder: 'rgba(23, 67, 90, 0.4)',
        tempStatus: 'Normal',
        humidityStatus: 'Normal',
        gasStatus: 'Normal',
        tempScore: 50,
        humidityScore: 50,
        gasScore: 50,
        failedParameters: [],
        allSensorsNormal: true,
        thresholdsUsed: defaultThresh,
        workingPrinciple: {
          modelName: 'Multi-Component Quality Index (MCQI)',
          standardReference: defaultThresh.scientificReference,
          formulaDescription: 'Score = 100 - (Σ Wi · Δi) × C_synergy',
          allSensorsNormal: true,
          synergyMultiplier: 1.0,
          weights: defaultThresh.weights,
          subScores: { temp: 50, humidity: 50, gas: 50 },
          temperatureAnalysis: { value: 0, unit: '°C', subScore: 50, status: 'Normal', targetRange: '2.0 - 6.0°C', remark: 'No data', weight: 0.4 },
          humidityAnalysis: { value: 0, unit: '%', subScore: 50, status: 'Normal', targetRange: '55 - 78%', remark: 'No data', weight: 0.25 },
          gasAnalysis: { value: 0, unit: 'ppm', subScore: 50, status: 'Normal', targetRange: '< 150 ppm', remark: 'No data', weight: 0.35 },
        }
      };
    }
    temperature = Number(reading.temperature ?? 4.2);
    humidity = Number(reading.humidity ?? 62);
    gas = Number(reading.gasLevel ?? reading.gas ?? reading.mq135_raw ?? 120);
    category = product.category;
    expiryDate = product.expiryDate;
    isUnconfigured = !!product.isUnconfigured;
  } else if (inputOrProduct) {
    temperature = Number(inputOrProduct.temperature ?? 4.2);
    humidity = Number(inputOrProduct.humidity ?? 62);
    gas = Number(inputOrProduct.gas ?? 120);
    category = inputOrProduct.category;
    expiryDate = inputOrProduct.expiryDate;
    isUnconfigured = !!inputOrProduct.isUnconfigured;
  }

  // Handle unconfigured IoT hardware
  if (isUnconfigured || (category?.includes('Meat') && temperature === 0 && humidity === 0 && gas === 0)) {
    const defaultThresh = resolveThresholdsForCategory(category);
    return {
      score: 0,
      status: 'Warning',
      qualityLabel: 'Unconfigured Node',
      riskLevel: 'unknown',
      message: 'IoT sensor micro-node is not configured or bound yet in Settings.',
      scientificRemark: 'Hardware node has not transmitted its first calibration payload.',
      actionableRecommendation: 'Configure micro-node Wi-Fi or Bluetooth pairing in Device Settings.',
      statusColor: '#FFAA00',
      statusBg: 'rgba(255, 170, 0, 0.15)',
      statusBorder: 'rgba(255, 170, 0, 0.4)',
      tempStatus: 'Warning',
      humidityStatus: 'Warning',
      gasStatus: 'Warning',
      tempScore: 0,
      humidityScore: 0,
      gasScore: 0,
      failedParameters: ['Hardware Node Unbound'],
      allSensorsNormal: false,
      thresholdsUsed: defaultThresh,
      workingPrinciple: {
        modelName: 'Multi-Component Quality Index (MCQI)',
        standardReference: defaultThresh.scientificReference,
        formulaDescription: 'Awaiting live sensor telemetry transmission.',
        allSensorsNormal: false,
        synergyMultiplier: 1.0,
        weights: defaultThresh.weights,
        subScores: { temp: 0, humidity: 0, gas: 0 },
        temperatureAnalysis: { value: 0, unit: '°C', subScore: 0, status: 'Warning', targetRange: `${defaultThresh.tempOptimalMin} - ${defaultThresh.tempOptimalMax}°C`, remark: 'Awaiting sensor sync', weight: defaultThresh.weights.temp },
        humidityAnalysis: { value: 0, unit: '%', subScore: 0, status: 'Warning', targetRange: `${defaultThresh.humidityOptimalMin} - ${defaultThresh.humidityOptimalMax}%`, remark: 'Awaiting sensor sync', weight: defaultThresh.weights.humidity },
        gasAnalysis: { value: 0, unit: 'ppm', subScore: 0, status: 'Warning', targetRange: `< ${defaultThresh.gasOptimalMax} ppm`, remark: 'Awaiting sensor sync', weight: defaultThresh.weights.gas },
      }
    };
  }

  // Reconcile active threshold rules (from system threshold settings)
  const activeRules: SensorThresholdConfig = {
    ...DEFAULT_ALERT_THRESHOLDS,
    ...(inputOrProduct?.activeThresholdRules || inputOrProduct?.thresholds || reading?.thresholds || {})
  };

  // Reconcile category weights with exact active threshold rules so target standards match 100%
  const baseCategory = resolveThresholdsForCategory(category);
  const thresholds: FreshnessCategoryThresholds = {
    categoryName: baseCategory.categoryName,
    tempOptimalMin: Number(activeRules.tempMin ?? 0.0),
    tempOptimalMax: Number(activeRules.tempMax ?? 8.0),
    tempWarningMax: Number(activeRules.tempMax ?? 8.0),
    tempCriticalMax: Number(activeRules.tempCritical ?? 15.0),
    tempFreezeRisk: Number((activeRules.tempMin ?? 0.0) - 1.5),
    humidityOptimalMin: Number(activeRules.humidityMin ?? 40.0),
    humidityOptimalMax: Number(activeRules.humidityMax ?? 85.0),
    humidityWarningMin: Number((activeRules.humidityMin ?? 40.0) - 10.0),
    humidityWarningMax: Number((activeRules.humidityMax ?? 85.0) + 5.0),
    gasOptimalMax: Number(activeRules.gasWarning ?? 250.0),
    gasWarningMax: Number(activeRules.gasWarning ?? 250.0) + 40,
    gasCriticalMax: Number(activeRules.gasCritical ?? 400.0),
    gasAdcBaseline: 1400,
    gasAdcWarning: 1600,
    gasAdcCritical: 1900,
    weights: baseCategory.weights,
    scientificReference: `Threshold Rules Standard (Safe: ${activeRules.tempMin.toFixed(1)}-${activeRules.tempMax.toFixed(1)}°C, RH: ${activeRules.humidityMin}-${activeRules.humidityMax}%, Gas: <${activeRules.gasWarning} ppm)`,
    rationale: `Target standards calibrated directly to system threshold rules.`,
  };

  const weights = thresholds.weights;
  const gasNorm = normalizeGasReading(gas, thresholds);
  const failedParameters: string[] = [];

  // Expiration check
  let isExpired = false;
  if (expiryDate) {
    const expTime = typeof expiryDate === 'string' ? new Date(expiryDate).getTime() : Number(expiryDate);
    if (!isNaN(expTime) && expTime < Date.now()) {
      isExpired = true;
      failedParameters.push('Expired Shelf-Life Date');
    }
  }

  // Tolerances for minor sensor jitter
  const tempTolerance = 0.5; // ±0.5°C tolerance buffer
  const humTolerance = 4.0;  // ±4% RH tolerance buffer
  const gasTolerance = gasNorm.isRawAdc ? 40 : 15; // Tolerance for gas

  // 1. TEMPERATURE SUB-INDEX (0 - 100)
  let tempScore = 100;
  let tempStatus: 'Normal' | 'Warning' | 'Critical' = 'Normal';
  let tempRemark = '';

  const optTempMin = thresholds.tempOptimalMin - tempTolerance;
  const optTempMax = thresholds.tempOptimalMax + tempTolerance;

  if (temperature >= optTempMin && temperature <= optTempMax) {
    // Within ideal chilling sweet spot
    tempScore = 100;
    tempStatus = 'Normal';
    tempRemark = `${temperature.toFixed(1)}°C is within optimal cold-chain range (${thresholds.tempOptimalMin.toFixed(1)}°C - ${thresholds.tempOptimalMax.toFixed(1)}°C).`;
  } else if (temperature > optTempMax) {
    // Thermal abuse (elevation above safe chilling limit)
    const excess = temperature - optTempMax;
    const warningSpan = Math.max(1, thresholds.tempWarningMax - thresholds.tempOptimalMax);
    const criticalSpan = Math.max(1, thresholds.tempCriticalMax - thresholds.tempWarningMax);

    if (temperature <= thresholds.tempWarningMax) {
      // Mild to moderate warming: penalty 0 to 30 points
      const ratio = excess / warningSpan;
      tempScore = Math.max(70, Math.round(100 - (ratio * 30)));
      tempStatus = 'Warning';
      tempRemark = `Elevated temperature (${temperature.toFixed(1)}°C). Exceeds optimal cold-chain bounds. Cold retention required.`;
      failedParameters.push('Elevated Temperature');
    } else {
      // Severe thermal abuse entering the biological danger zone: penalty 30 to 85 points
      const critExcess = temperature - thresholds.tempWarningMax;
      const ratio = Math.min(2.0, critExcess / criticalSpan);
      tempScore = Math.max(15, Math.round(70 - (ratio * 35)));
      tempStatus = 'Critical';
      tempRemark = `Critical temperature spike (${temperature.toFixed(1)}°C). Food enters rapid bacterial replication danger zone.`;
      failedParameters.push('Critical Thermal Abuse');
    }
  } else {
    // Sub-cooling / freezing risk
    const freezeDiff = optTempMin - temperature;
    if (temperature < thresholds.tempFreezeRisk) {
      tempScore = Math.max(30, Math.round(75 - (freezeDiff * 15)));
      tempStatus = 'Critical';
      tempRemark = `Severe freezing hazard (${temperature.toFixed(1)}°C). Crystal rupture damages cellular structure.`;
      failedParameters.push('Freezing Damage Risk');
    } else {
      tempScore = Math.max(78, Math.round(100 - (freezeDiff * 10)));
      tempStatus = 'Warning';
      tempRemark = `Sub-optimal chilling (${temperature.toFixed(1)}°C). Risk of chill injury or frost deposition.`;
      failedParameters.push('Chill Injury Hazard');
    }
  }

  // 2. RELATIVE HUMIDITY SUB-INDEX (0 - 100)
  let humidityScore = 100;
  let humidityStatus: 'Normal' | 'Warning' | 'Critical' = 'Normal';
  let humRemark = '';

  const optHumMin = thresholds.humidityOptimalMin - humTolerance;
  const optHumMax = thresholds.humidityOptimalMax + humTolerance;

  if (humidity >= optHumMin && humidity <= optHumMax) {
    humidityScore = 100;
    humidityStatus = 'Normal';
    humRemark = `${Math.round(humidity)}% RH maintains balanced moisture without condensation or surface drying.`;
  } else if (humidity > optHumMax) {
    const excessHum = humidity - optHumMax;
    if (humidity > thresholds.humidityWarningMax) {
      humidityScore = Math.max(35, Math.round(70 - (excessHum * 2.5)));
      humidityStatus = 'Critical';
      humRemark = `Excessive relative humidity (${Math.round(humidity)}%). Heavy condensation accelerates fungal and bacterial slime growth.`;
      failedParameters.push('Condensation / Mold Hazard');
    } else {
      humidityScore = Math.max(72, Math.round(100 - (excessHum * 1.8)));
      humidityStatus = 'Warning';
      humRemark = `Elevated relative humidity (${Math.round(humidity)}%). Moisture accumulation above recommended storage bounds.`;
      failedParameters.push('Elevated Moisture');
    }
  } else {
    const deficitHum = optHumMin - humidity;
    if (humidity < thresholds.humidityWarningMin) {
      humidityScore = Math.max(45, Math.round(75 - (deficitHum * 2.0)));
      humidityStatus = 'Critical';
      humRemark = `Severe dry atmosphere (${Math.round(humidity)}%). Accelerated desiccation and cellular moisture loss.`;
      failedParameters.push('Severe Desiccation');
    } else {
      humidityScore = Math.max(76, Math.round(100 - (deficitHum * 1.4)));
      humidityStatus = 'Warning';
      humRemark = `Low relative humidity (${Math.round(humidity)}%). Risk of superficial transpiration and weight shrinkage.`;
      failedParameters.push('Low Humidity Deficit');
    }
  }

  // 3. GAS / VOLATILE OUTGASSING SUB-INDEX (0 - 100)
  let gasScore = 100;
  let gasStatus: 'Normal' | 'Warning' | 'Critical' = 'Normal';
  let gasRemark = '';

  const optGasMax = gasNorm.optimalMax + gasTolerance;

  if (gasNorm.effectiveValue <= optGasMax) {
    gasScore = 100;
    gasStatus = 'Normal';
    gasRemark = `${Math.round(gasNorm.effectiveValue)} ${gasNorm.unit} indicates pristine atmosphere with no volatile decomposition gases.`;
  } else {
    const excessGas = gasNorm.effectiveValue - optGasMax;
    const warningSpan = Math.max(10, gasNorm.warningMax - gasNorm.optimalMax);
    const criticalSpan = Math.max(10, gasNorm.criticalMax - gasNorm.warningMax);

    if (gasNorm.effectiveValue <= gasNorm.warningMax) {
      const ratio = excessGas / warningSpan;
      gasScore = Math.max(65, Math.round(100 - (ratio * 35)));
      gasStatus = 'Warning';
      gasRemark = `Mild volatile buildup (${Math.round(gasNorm.effectiveValue)} ${gasNorm.unit}). Early ripening gas or microbial off-gassing observed.`;
      failedParameters.push('Volatile Gas Buildup');
    } else {
      const critExcess = gasNorm.effectiveValue - gasNorm.warningMax;
      const ratio = Math.min(2.5, critExcess / criticalSpan);
      gasScore = Math.max(10, Math.round(65 - (ratio * 40)));
      gasStatus = 'Critical';
      gasRemark = `Severe VOC spike (${Math.round(gasNorm.effectiveValue)} ${gasNorm.unit}). Volatile basic nitrogen, sulfides, or microbial amines detected.`;
      failedParameters.push('Hazardous Bio-Gas Emissions');
    }
  }

  // 4. CROSS-FACTOR SYNERGY MULTIPLIER (Bio-Chemical Coupling)
  // When temperature is elevated AND volatile gas is elevated, bacterial enzyme kinetics
  // multiply exponentially (Arrhenius / Q10 acceleration).
  let synergyMultiplier = 1.0;
  const tempDeviation = Math.max(0, temperature - thresholds.tempOptimalMax);
  const gasDeviation = Math.max(0, gasNorm.effectiveValue - gasNorm.optimalMax);

  if (tempDeviation > 0 && gasDeviation > 0) {
    const tempRatio = tempDeviation / Math.max(1, thresholds.tempWarningMax - thresholds.tempOptimalMax);
    const gasRatio = gasDeviation / Math.max(1, gasNorm.warningMax - gasNorm.optimalMax);
    synergyMultiplier = Number((1.0 + Math.min(1.2, tempRatio * gasRatio * 0.8)).toFixed(2));
  }

  // Check if every sensor is in normal condition
  const allSensorsNormal = tempStatus === 'Normal' && humidityStatus === 'Normal' && gasStatus === 'Normal';

  // 5. COMPOSITE FRESHNESS SCORE
  // Weighted baseline score from individual sub-indices
  const weightedSubScore = (tempScore * weights.temp) + (humidityScore * weights.humidity) + (gasScore * weights.gas);
  
  let rawScore: number;
  if (allSensorsNormal) {
    // When every sensor is normal, score is in peak pristine condition (98 - 100%)
    rawScore = 100;
  } else {
    // Apply cross-synergy penalty
    const penalty = (100 - weightedSubScore) * synergyMultiplier;
    rawScore = Math.max(8, Math.min(100, Math.round(100 - penalty)));
  }

  // Override if expired
  if (isExpired) {
    rawScore = Math.min(rawScore, 18);
  }

  // 6. QUALITY TIERS & SCIENTIFIC REMARK GENERATION
  let status: FreshnessStatus = 'Fresh';
  let qualityLabel = 'Peak Freshness';
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let statusColor = '#20E79A';
  let statusBg = 'rgba(32, 231, 154, 0.15)';
  let statusBorder = 'rgba(32, 231, 154, 0.35)';

  let message = '';
  let scientificRemark = '';
  let actionableRecommendation = '';

  if (isExpired) {
    status = 'Expired';
    qualityLabel = 'Expired / Past Shelf-Life';
    riskLevel = 'high';
    statusColor = '#FF5A67';
    statusBg = 'rgba(255, 90, 103, 0.15)';
    statusBorder = 'rgba(255, 90, 103, 0.4)';
    message = 'Product has reached or exceeded its shelf-life expiration limit.';
    scientificRemark = `Biological expiration date has lapsed. Bacterial load and hydrolytic enzymes compromise wholesomeness regardless of instantaneous sensor values.`;
    actionableRecommendation = 'Discard or quarantine batch immediately. Do not release for human consumption.';
  } else if (rawScore >= 90) {
    status = 'Fresh';
    qualityLabel = 'Peak Freshness (Optimal)';
    riskLevel = 'low';
    statusColor = '#20E79A';
    statusBg = 'rgba(32, 231, 154, 0.15)';
    statusBorder = 'rgba(32, 231, 154, 0.35)';
    message = 'All monitored sensors within optimal limits. Telemetry indicates peak preservation state.';
    scientificRemark = `Ambient temperature (${temperature.toFixed(1)}°C), relative humidity (${Math.round(humidity)}%), and gas emissions (${Math.round(gasNorm.effectiveValue)} ${gasNorm.unit}) conform strictly to ${thresholds.scientificReference}. Microbial multiplication kinetics and enzymatic autolysis remain fully inhibited.`;
    actionableRecommendation = 'Maintain existing refrigeration and atmospheric parameters. Prime quality suitable for immediate distribution.';
  } else if (rawScore >= 75) {
    status = 'Good';
    qualityLabel = 'Good Quality (Stable)';
    riskLevel = 'low';
    statusColor = '#15D8F4';
    statusBg = 'rgba(21, 216, 244, 0.15)';
    statusBorder = 'rgba(21, 216, 244, 0.35)';
    message = 'Stable freshness conditions. Mild environmental variance noticed within safe cold-chain tolerances.';
    scientificRemark = `Sensor telemetry shows minor deviation from optimal target (${failedParameters.join(', ')}), but biological values remain safely below critical spoilage inflection points. Shelf-life stability remains high.`;
    actionableRecommendation = 'Continue regular monitoring. Inspect packaging seal and cold airflow circulation.';
  } else if (rawScore >= 55) {
    status = 'Warning';
    qualityLabel = 'Fair / Caution Required';
    riskLevel = 'medium';
    statusColor = '#FFAA00';
    statusBg = 'rgba(255, 170, 0, 0.15)';
    statusBorder = 'rgba(255, 170, 0, 0.35)';
    message = 'Sensor alert: Environmental telemetry deviating from recommended preservation thresholds.';
    scientificRemark = `Detected breach in target preservation envelope: ${failedParameters.join(' & ')}. Accelerated cellular respiration or early-stage microbial proliferation detected. Synergy factor: ${synergyMultiplier}x.`;
    actionableRecommendation = 'Adjust cold-chain unit cooling immediately. Conduct physical sensory inspection (texture, odor, appearance).';
  } else if (rawScore >= 35) {
    status = 'At Risk';
    qualityLabel = 'At Risk (Degrading)';
    riskLevel = 'high';
    statusColor = '#FF8A3D';
    statusBg = 'rgba(255, 138, 61, 0.15)';
    statusBorder = 'rgba(255, 138, 61, 0.35)';
    message = 'High degradation risk. Elevated bio-gas emissions and thermal variance indicate rapid spoilage.';
    scientificRemark = `Concurrent environmental stress (${failedParameters.join(' + ')}) has driven product into active degradation. Volatile amines, organic acids, or moisture condensates indicate loss of biological barrier. Synergy factor: ${synergyMultiplier}x.`;
    actionableRecommendation = 'Quarantine item immediately. Accelerate sale with deep markdown or dispatch for immediate food safety inspection.';
  } else {
    status = 'Expired';
    qualityLabel = 'Critical / Decomposed';
    riskLevel = 'high';
    statusColor = '#FF5A67';
    statusBg = 'rgba(255, 90, 103, 0.15)';
    statusBorder = 'rgba(255, 90, 103, 0.4)';
    message = 'Critical bio-decomposition. Hazardous VOCs or severe temperature abuse detected.';
    scientificRemark = `Critical threshold failure (${failedParameters.join(', ')}). Gas sensor confirms extensive metabolic off-gassing from proteolytic or fermentative microflora. Product is physiologically unwholesome.`;
    actionableRecommendation = 'Condemn and discard immediately under hazardous biological waste protocols. Do not consume.';
  }

  const workingPrinciple: WorkingPrincipleBreakdown = {
    modelName: 'Multi-Component Quality Index (MCQI)',
    standardReference: thresholds.scientificReference,
    formulaDescription: `Score = 100 - [(${weights.temp}·ΔT + ${weights.humidity}·ΔH + ${weights.gas}·ΔG) × C_synergy]`,
    allSensorsNormal,
    synergyMultiplier,
    weights,
    subScores: {
      temp: tempScore,
      humidity: humidityScore,
      gas: gasScore,
    },
    temperatureAnalysis: {
      value: +temperature.toFixed(1),
      unit: '°C',
      subScore: tempScore,
      status: tempStatus,
      targetRange: `${thresholds.tempOptimalMin.toFixed(1)} - ${thresholds.tempOptimalMax.toFixed(1)}°C`,
      remark: tempRemark,
      weight: weights.temp,
    },
    humidityAnalysis: {
      value: Math.round(humidity),
      unit: '%',
      subScore: humidityScore,
      status: humidityStatus,
      targetRange: `${Math.round(thresholds.humidityOptimalMin)} - ${Math.round(thresholds.humidityOptimalMax)}%`,
      remark: humRemark,
      weight: weights.humidity,
    },
    gasAnalysis: {
      value: Math.round(gasNorm.effectiveValue),
      unit: gasNorm.unit,
      subScore: gasScore,
      status: gasStatus,
      targetRange: `< ${Math.round(gasNorm.optimalMax)} ${gasNorm.unit}`,
      remark: gasRemark,
      weight: weights.gas,
    },
    activeThresholdRules: activeRules,
  };

  return {
    score: rawScore,
    status,
    qualityLabel,
    riskLevel,
    message,
    scientificRemark,
    actionableRecommendation,
    statusColor,
    statusBg,
    statusBorder,
    tempStatus,
    humidityStatus,
    gasStatus,
    failedParameters,
    allSensorsNormal,
    workingPrinciple,
    activeThresholdRules: activeRules,
    tempScore,
    humidityScore,
    gasScore,
    thresholdsUsed: thresholds,
  };
}
