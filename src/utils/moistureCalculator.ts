/**
 * FreshNex Psychrometric Moisture Engine
 * Repeatedly calculates absolute moisture (g/m³), vapor pressure (hPa),
 * dew point temperature (°C), and equilibrium moisture metrics directly
 * derived from real-time Temperature (°C) and Relative Humidity (%)
 * received from the IoT sensor nodes and realtime server.
 */

export interface MoistureReading {
  // Absolute moisture in air (g/m³) - grams of water vapor per cubic meter of air
  absoluteMoisture: number;
  // Partial vapor pressure in hPa
  vaporPressure: number;
  // Saturation vapor pressure at current temperature in hPa
  saturationVaporPressure: number;
  // Dew point temperature in °C
  dewPoint: number;
  // Moisture saturation ratio (0 - 100%)
  moistureRatio: number;
  // Qualitative moisture condition assessment
  status: 'Optimal' | 'Low/Dry' | 'Elevated' | 'Condensation Hazard';
  statusColor: string;
  recommendation: string;
}

/**
 * Calculates psychrometric moisture metrics using the Magnus-Tetens / Buck
 * thermodynamic formulation.
 *
 * @param temperature - Ambient air temperature in °C
 * @param humidity - Relative Humidity % (0 - 100)
 */
export function calculateMoisture(temperature: number, humidity: number): MoistureReading {
  const T = Number.isFinite(temperature) ? temperature : 4.0;
  const RH = Number.isFinite(humidity) ? Math.max(0, Math.min(100, humidity)) : 60.0;

  // 1. Saturation Vapor Pressure Psat (hPa) using Magnus-Tetens equation
  // Formula: Psat = 6.112 * exp((17.67 * T) / (T + 243.5))
  const a = 17.67;
  const b = 243.5;
  const psat = 6.112 * Math.exp((a * T) / (T + b));

  // 2. Actual Partial Vapor Pressure Pv (hPa)
  const pv = (RH / 100.0) * psat;

  // 3. Absolute Moisture Content / Vapor Density (g/m³)
  // Formula derived from Ideal Gas Law for water vapor:
  // Dv = (216.7 * Pv) / (T + 273.15)
  const absMoisture = (216.7 * pv) / (T + 273.15);
  const formattedAbsMoisture = +absMoisture.toFixed(2);

  // 4. Dew Point Temperature (°C)
  // Magnus equation for dew point calculation:
  // alpha = (17.27 * T) / (237.7 + T) + ln(RH / 100)
  // Tdp = (237.7 * alpha) / (17.27 - alpha)
  const safeRH = Math.max(0.1, Math.min(100, RH));
  const alpha = ((17.27 * T) / (237.7 + T)) + Math.log(safeRH / 100.0);
  const dewPoint = (237.7 * alpha) / (17.27 - alpha);
  const formattedDewPoint = +dewPoint.toFixed(1);

  // 5. Moisture Ratio (%)
  const maxAbsMoistureAtTemp = (216.7 * psat) / (T + 273.15);
  const moistureRatio = Math.round((absMoisture / Math.max(0.1, maxAbsMoistureAtTemp)) * 100);

  // 6. Cold-Chain Risk Assessment
  let status: 'Optimal' | 'Low/Dry' | 'Elevated' | 'Condensation Hazard' = 'Optimal';
  let statusColor = '#20E79A'; // Emerald
  let recommendation = 'Moisture density maintains cellular freshness and prevents weight loss.';

  // If ambient temperature is within 1.5°C of dew point, water will condense on food surfaces
  if (T - formattedDewPoint <= 1.5) {
    status = 'Condensation Hazard';
    statusColor = '#EF4444'; // Red
    recommendation = `Surface sweating risk! Ambient temp (${T}°C) is close to dew point (${formattedDewPoint}°C). High microbial decay potential.`;
  } else if (formattedAbsMoisture > 11.0) {
    status = 'Elevated';
    statusColor = '#F59E0B'; // Amber
    recommendation = 'High absolute moisture volume. Check ventilation to prevent fungal mold sporulation.';
  } else if (formattedAbsMoisture < 2.5) {
    status = 'Low/Dry';
    statusColor = '#0EA5E9'; // Sky blue
    recommendation = 'Dry atmosphere causes transpirational shrinkage and food tissue dehydration.';
  }

  return {
    absoluteMoisture: formattedAbsMoisture,
    vaporPressure: +pv.toFixed(2),
    saturationVaporPressure: +psat.toFixed(2),
    dewPoint: formattedDewPoint,
    moistureRatio,
    status,
    statusColor,
    recommendation,
  };
}
