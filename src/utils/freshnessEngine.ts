import { CATEGORY_THRESHOLDS, DEFAULT_THRESHOLDS } from '../config/freshnessThresholds';

export type FreshnessStatus = 'Fresh' | 'Good' | 'Warning' | 'At Risk' | 'Expired';

export interface FreshnessCalculationInput {
  temperature: number;
  humidity: number;
  gas: number;
  category?: string;
  expiryDate?: string | number | null;
}

export interface FreshnessReport {
  score: number;
  status: FreshnessStatus;
  qualityLabel: string;
  message: string;
  statusColor: string;
  statusBg: string;
  statusBorder: string;
  tempStatus: 'Normal' | 'Warning' | 'Critical';
  humidityStatus: 'Normal' | 'Warning' | 'Critical';
  gasStatus: 'Normal' | 'Warning' | 'Critical';
  riskLevel?: 'low' | 'medium' | 'high' | 'unknown';
  failedParameters?: string[];
}

export interface FreshnessResult {
  status: 'Fresh' | 'Warning' | 'Unsafe' | 'Good' | 'At Risk' | 'Expired' | 'Unknown';
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  message: string;
  failedParameters: string[];
  score?: number;
}

export function calculateFreshness(
  inputOrProduct: FreshnessCalculationInput | any,
  reading?: any
): FreshnessReport & FreshnessResult {
  // Support legacy signature (product, reading)
  let temperature = 4.2;
  let humidity = 62;
  let gas = 120;
  let category: string | undefined = undefined;
  let expiryDate: string | number | null = null;
  let isUnconfigured = false;

  if (reading !== undefined) {
    const product = inputOrProduct;
    if (!product || !reading) {
      return {
        score: 50,
        status: 'Fresh',
        qualityLabel: 'Unknown',
        riskLevel: 'unknown',
        message: 'Awaiting sensor telemetry data.',
        statusColor: '#17435A',
        statusBg: 'rgba(23, 67, 90, 0.15)',
        statusBorder: 'rgba(23, 67, 90, 0.4)',
        tempStatus: 'Normal',
        humidityStatus: 'Normal',
        gasStatus: 'Normal',
        failedParameters: [],
      };
    }
    temperature = reading.temperature ?? 4.2;
    humidity = reading.humidity ?? 62;
    gas = reading.gasLevel ?? reading.gas ?? 120;
    category = product.category;
    expiryDate = product.expiryDate;
    isUnconfigured = !!product.isUnconfigured;
  } else if (inputOrProduct) {
    temperature = inputOrProduct.temperature ?? 4.2;
    humidity = inputOrProduct.humidity ?? 62;
    gas = inputOrProduct.gas ?? 120;
    category = inputOrProduct.category;
    expiryDate = inputOrProduct.expiryDate;
    isUnconfigured = !!inputOrProduct.isUnconfigured;
  }

  // Handle unconfigured IoT device
  if (isUnconfigured || (category === 'Meat Products' && temperature === 0 && humidity === 0 && gas === 0)) {
    return {
      score: 0,
      status: 'Warning',
      qualityLabel: 'Unconfigured',
      riskLevel: 'unknown',
      message: 'IoT sensor micro-node is not configured yet.',
      statusColor: '#FFAA00',
      statusBg: 'rgba(255, 170, 0, 0.15)',
      statusBorder: 'rgba(255, 170, 0, 0.4)',
      tempStatus: 'Warning',
      humidityStatus: 'Warning',
      gasStatus: 'Warning',
      failedParameters: [],
    };
  }

  const thresholds = (category && CATEGORY_THRESHOLDS[category]) || DEFAULT_THRESHOLDS;
  const failedParameters: string[] = [];

  // Check if expired
  if (expiryDate) {
    const expTime = typeof expiryDate === 'string' ? new Date(expiryDate).getTime() : expiryDate;
    if (!isNaN(expTime) && expTime < Date.now()) {
      return {
        score: 18,
        status: 'Expired',
        qualityLabel: 'Expired',
        riskLevel: 'high',
        message: 'Product has passed its biological expiration date.',
        statusColor: '#FF5A67',
        statusBg: 'rgba(255, 90, 103, 0.15)',
        statusBorder: 'rgba(255, 90, 103, 0.4)',
        tempStatus: 'Critical',
        humidityStatus: 'Critical',
        gasStatus: 'Critical',
        failedParameters: ['Expiry Date'],
      };
    }
  }

  // Calculate deviations
  let tempPenalty = 0;
  let tempStatus: 'Normal' | 'Warning' | 'Critical' = 'Normal';
  if (temperature < thresholds.tempOptimalMin) {
    tempPenalty = Math.min(15, (thresholds.tempOptimalMin - temperature) * 4);
    tempStatus = tempPenalty > 8 ? 'Warning' : 'Normal';
    if (tempStatus === 'Warning') failedParameters.push('Temperature Under-cooling');
  } else if (temperature > thresholds.tempOptimalMax) {
    const over = temperature - thresholds.tempOptimalMax;
    tempPenalty = Math.min(40, over * 6);
    tempStatus = temperature > thresholds.tempWarningMax ? 'Critical' : 'Warning';
    failedParameters.push('Temperature High');
  }

  let humPenalty = 0;
  let humidityStatus: 'Normal' | 'Warning' | 'Critical' = 'Normal';
  if (humidity < thresholds.humidityOptimalMin) {
    humPenalty = Math.min(15, (thresholds.humidityOptimalMin - humidity) * 1.5);
    humidityStatus = humPenalty > 8 ? 'Warning' : 'Normal';
    if (humidityStatus === 'Warning') failedParameters.push('Low Moisture');
  } else if (humidity > thresholds.humidityOptimalMax) {
    const over = humidity - thresholds.humidityOptimalMax;
    humPenalty = Math.min(25, over * 2);
    humidityStatus = over > 15 ? 'Critical' : 'Warning';
    failedParameters.push('High Moisture');
  }

  let gasPenalty = 0;
  let gasStatus: 'Normal' | 'Warning' | 'Critical' = 'Normal';
  if (gas > thresholds.gasOptimalMax) {
    const gasOver = gas - thresholds.gasOptimalMax;
    gasPenalty = Math.min(45, (gasOver / 4));
    gasStatus = gas > thresholds.gasWarningMax ? 'Critical' : 'Warning';
    failedParameters.push('Elevated VOC Gas');
  }

  const rawScore = Math.max(10, Math.min(100, Math.round(100 - (tempPenalty + humPenalty + gasPenalty))));

  let status: FreshnessStatus = 'Fresh';
  let qualityLabel = 'Excellent';
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let statusColor = '#20E79A';
  let statusBg = 'rgba(32, 231, 154, 0.15)';
  let statusBorder = 'rgba(32, 231, 154, 0.35)';
  let message = 'Optimal storage parameters detected. Food preservation integrity is high.';

  if (rawScore >= 90) {
    status = 'Fresh';
    qualityLabel = 'Excellent';
    riskLevel = 'low';
    statusColor = '#20E79A';
    statusBg = 'rgba(32, 231, 154, 0.15)';
    statusBorder = 'rgba(32, 231, 154, 0.35)';
    message = 'Optimal storage parameters. Telemetry indicates peak freshness.';
  } else if (rawScore >= 75) {
    status = 'Good';
    qualityLabel = 'Good';
    riskLevel = 'low';
    statusColor = '#15D8F4';
    statusBg = 'rgba(21, 216, 244, 0.15)';
    statusBorder = 'rgba(21, 216, 244, 0.35)';
    message = 'Stable freshness conditions. Mild environmental variance noticed.';
  } else if (rawScore >= 55) {
    status = 'Warning';
    qualityLabel = 'Fair';
    riskLevel = 'medium';
    statusColor = '#F5B942';
    statusBg = 'rgba(245, 185, 66, 0.15)';
    statusBorder = 'rgba(245, 185, 66, 0.35)';
    message = 'Sensor alerts triggered: gas or temperature levels exceeding recommended safe thresholds.';
  } else if (rawScore >= 35) {
    status = 'At Risk';
    qualityLabel = 'At Risk';
    riskLevel = 'high';
    statusColor = '#FF8A3D';
    statusBg = 'rgba(255, 138, 61, 0.15)';
    statusBorder = 'rgba(255, 138, 61, 0.35)';
    message = 'High microbial or outgassing risk. Accelerated spoilage likely.';
  } else {
    status = 'Expired';
    qualityLabel = 'Critical';
    riskLevel = 'high';
    statusColor = '#FF5A67';
    statusBg = 'rgba(255, 90, 103, 0.15)';
    statusBorder = 'rgba(255, 90, 103, 0.35)';
    message = 'Food is severely degraded or unwholesome. Do not consume.';
  }

  return {
    score: rawScore,
    status,
    qualityLabel,
    riskLevel,
    message,
    statusColor,
    statusBg,
    statusBorder,
    tempStatus,
    humidityStatus,
    gasStatus,
    failedParameters,
  };
}
