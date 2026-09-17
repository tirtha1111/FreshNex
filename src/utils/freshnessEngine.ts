import { Product, LiveReading } from '../types';

export interface FreshnessResult {
  status: 'Fresh' | 'Warning' | 'Unsafe' | 'Unknown';
  riskLevel: 'low' | 'medium' | 'high' | 'unknown';
  message: string;
  failedParameters: string[];
}

/**
 * Calculates sensor-based freshness status.
 * This is a quality monitoring index and does not represent an absolute guarantee of biological safety,
 * but evaluates environmental storage conditions to help track degradation.
 */
export function calculateFreshness(product: Product | null, reading: LiveReading | null): FreshnessResult {
  if (!product || !reading) {
    return {
      status: 'Unknown',
      riskLevel: 'unknown',
      message: 'Insufficient sensor telemetry or missing product criteria to evaluate freshness.',
      failedParameters: []
    };
  }

  const failedParameters: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  // 1. Expiration check
  const expiry = new Date(product.expiryDate);
  const now = new Date();
  if (expiry < now) {
    failedParameters.push('Expiry Date');
    errors.push('Product has exceeded its expiration date.');
  }

  // 2. Temperature evaluation
  if (reading.temperature < product.tempMin) {
    failedParameters.push('Temperature');
    warnings.push(`Under-cooling: ${reading.temperature}°C is below optimal ${product.tempMin}°C.`);
  } else if (reading.temperature > product.tempMax) {
    failedParameters.push('Temperature');
    if (reading.temperature > product.tempMax + 5) {
      errors.push(`Critical warming: ${reading.temperature}°C heavily exceeds safe storage threshold of ${product.tempMax}°C.`);
    } else {
      warnings.push(`Slight temperature rise: ${reading.temperature}°C exceeds optimal ${product.tempMax}°C.`);
    }
  }

  // 3. Humidity evaluation
  if (reading.humidity < product.humMin) {
    failedParameters.push('Humidity');
    warnings.push(`Low moisture: ${reading.humidity}% is below optimal ${product.humMin}%.`);
  } else if (reading.humidity > product.humMax) {
    failedParameters.push('Humidity');
    if (reading.humidity > product.humMax + 15) {
      errors.push(`Critical humidity levels: ${reading.humidity}% may stimulate rapid spore and mold growth.`);
    } else {
      warnings.push(`Elevated moisture: ${reading.humidity}% exceeds optimal ${product.humMax}%.`);
    }
  }

  // 4. Air Quality and Organic Gas evaluation (e.g. MQ sensor ppm)
  if (reading.gasLevel > product.gasMax) {
    failedParameters.push('Gas Level');
    if (reading.gasLevel > product.gasMax * 1.5) {
      errors.push(`Dangerous Organic Gases: ${reading.gasLevel} ppm indicates high food outgassing (deterioration/fermentation).`);
    } else {
      warnings.push(`Elevated volatile organics: ${reading.gasLevel} ppm detected, suggesting minor spoilage or stale air.`);
    }
  }

  // Aggregate results
  if (errors.length > 0) {
    return {
      status: 'Unsafe',
      riskLevel: 'high',
      message: errors.join(' '),
      failedParameters
    };
  }

  if (warnings.length > 0) {
    return {
      status: 'Warning',
      riskLevel: 'medium',
      message: warnings.join(' '),
      failedParameters
    };
  }

  return {
    status: 'Fresh',
    riskLevel: 'low',
    message: 'All tracked telemetry parameters are within their optimal safe storage brackets.',
    failedParameters: []
  };
}
