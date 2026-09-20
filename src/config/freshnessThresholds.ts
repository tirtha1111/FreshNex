export interface FreshnessCategoryThresholds {
  tempOptimalMin: number;
  tempOptimalMax: number;
  tempWarningMax: number;
  humidityOptimalMin: number;
  humidityOptimalMax: number;
  gasOptimalMax: number;
  gasWarningMax: number;
}

export const DEFAULT_THRESHOLDS: FreshnessCategoryThresholds = {
  tempOptimalMin: 2.0,
  tempOptimalMax: 6.0,
  tempWarningMax: 10.0,
  humidityOptimalMin: 50.0,
  humidityOptimalMax: 75.0,
  gasOptimalMax: 150.0,
  gasWarningMax: 250.0,
};

export const CATEGORY_THRESHOLDS: Record<string, FreshnessCategoryThresholds> = {
  Vegetable: {
    tempOptimalMin: 2.0,
    tempOptimalMax: 7.0,
    tempWarningMax: 12.0,
    humidityOptimalMin: 55.0,
    humidityOptimalMax: 80.0,
    gasOptimalMax: 140.0,
    gasWarningMax: 220.0,
  },
  Fruit: {
    tempOptimalMin: 3.0,
    tempOptimalMax: 8.0,
    tempWarningMax: 14.0,
    humidityOptimalMin: 50.0,
    humidityOptimalMax: 70.0,
    gasOptimalMax: 160.0,
    gasWarningMax: 260.0,
  },
  Dairy: {
    tempOptimalMin: 1.0,
    tempOptimalMax: 4.0,
    tempWarningMax: 8.0,
    humidityOptimalMin: 40.0,
    humidityOptimalMax: 65.0,
    gasOptimalMax: 120.0,
    gasWarningMax: 200.0,
  },
  Meat: {
    tempOptimalMin: 0.0,
    tempOptimalMax: 4.0,
    tempWarningMax: 7.0,
    humidityOptimalMin: 60.0,
    humidityOptimalMax: 75.0,
    gasOptimalMax: 180.0,
    gasWarningMax: 300.0,
  },
  Poultry: {
    tempOptimalMin: 0.0,
    tempOptimalMax: 4.0,
    tempWarningMax: 7.0,
    humidityOptimalMin: 60.0,
    humidityOptimalMax: 75.0,
    gasOptimalMax: 180.0,
    gasWarningMax: 300.0,
  },
  Seafood: {
    tempOptimalMin: 0.0,
    tempOptimalMax: 3.0,
    tempWarningMax: 5.0,
    humidityOptimalMin: 55.0,
    humidityOptimalMax: 70.0,
    gasOptimalMax: 150.0,
    gasWarningMax: 250.0,
  },
};
