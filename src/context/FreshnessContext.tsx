import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FoodItem, SensorData, ScanHistoryRecord } from '../types';
import { DEFAULT_ITEMS, DEFAULT_SENSOR_DATA, DEFAULT_SCAN_HISTORY } from '../data/initialData';
import { calculateFreshness, FreshnessReport } from '../utils/freshnessEngine';
import { calculateMoisture } from '../utils/moistureCalculator';
import { calculatePH } from '../utils/phCalculator';
import { FirebaseService } from '../services/firebaseService';
import {
  SensorThresholdConfig,
  DEFAULT_THRESHOLDS,
  SensorAlertEvent,
  evaluateSensorReading,
  pushAlertToFirebase,
  subscribeToFirebaseAlerts,
  updateAlertReadState,
  markAllAlertsReadFirebase,
  resolveAlertInFirebase,
  deleteAlertFromFirebase,
  clearAllAlertsFromFirebase,
  saveGlobalThresholdsToFirebase,
  subscribeToGlobalThresholds,
  subscribeToProductThreshold,
  saveProductThresholdToFirebase,
} from '../services/alertThresholdService';
import { playAlertChime } from '../services/alertSound';
import { useAuth } from './AuthContext';

export interface FreshnessNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  timestamp: number;
  read: boolean;
  metric?: string;
  currentValue?: number;
  thresholdValue?: number;
  unit?: string;
  itemId?: string;
  deviceId?: string;
  resolved?: boolean;
}

interface FreshnessContextType {
  activeItem: FoodItem | null;
  sensorData: SensorData | null;
  freshnessReport: FreshnessReport | null;
  scanHistory: ScanHistoryRecord[];
  notifications: FreshnessNotification[];
  alerts: SensorAlertEvent[];
  unreadCount: number;
  isScanning: boolean;
  thresholds: SensorThresholdConfig;
  isAudioMuted: boolean;
  toggleAudioMute: () => void;
  updateThresholds: (newConfig: SensorThresholdConfig) => void;
  scanItem: (itemId: string) => Promise<FoodItem>;
  clearActiveItem: () => void;
  markNotificationsAsRead: () => void;
  markAlertAsRead: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  deleteHistoryRecord: (id: string) => void;
  clearHistory: () => Promise<void>;
  reloadHistory: () => Promise<void>;
}

const FreshnessContext = createContext<FreshnessContextType | undefined>(undefined);

export const FreshnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [activeItem, setActiveItem] = useState<FoodItem | null>(null);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [freshnessReport, setFreshnessReport] = useState<FreshnessReport | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryRecord[]>(DEFAULT_SCAN_HISTORY);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<SensorAlertEvent[]>([]);
  const [configVersion, setConfigVersion] = useState<number>(0);

  const assignedName = userProfile?.assignedProductName || '';
  const assignedTag = userProfile?.assignedProductId || '';
  const isAdmin = userProfile?.role === 'admin';

  // Re-bind subscriptions whenever Firebase credentials are updated in the Settings panel
  useEffect(() => {
    const handleConfigChange = () => {
      setConfigVersion((v) => v + 1);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('freshnex_firebase_config_updated', handleConfigChange);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('freshnex_firebase_config_updated', handleConfigChange);
      }
    };
  }, []);

  // Filter scan history and alerts for product users so they only see their assigned product
  const filteredScanHistory = React.useMemo(() => {
    let list = scanHistory;
    if (!isAdmin && (assignedName || assignedTag)) {
      list = scanHistory.filter(
        (s) =>
          s.itemName.toLowerCase().includes(assignedName.toLowerCase()) ||
          s.tagId.toLowerCase().includes(assignedTag.toLowerCase()) ||
          s.itemId.toLowerCase().includes(assignedTag.toLowerCase())
      );
    }
    const seen = new Set<string>();
    return list.filter((item) => {
      const uniqueKey = item.id || `${item.itemId}-${item.timestamp}`;
      if (seen.has(uniqueKey)) return false;
      seen.add(uniqueKey);
      return true;
    });
  }, [scanHistory, isAdmin, assignedName, assignedTag]);

  const filteredAlerts = React.useMemo(() => {
    if (isAdmin) return alerts;
    if (assignedName || assignedTag) {
      return alerts.filter(
        (a) =>
          (a.itemName && a.itemName.toLowerCase().includes(assignedName.toLowerCase())) ||
          (a.deviceId && a.deviceId.toLowerCase().includes(assignedTag.toLowerCase())) ||
          (a.title && a.title.toLowerCase().includes(assignedName.toLowerCase()))
      );
    }
    return alerts;
  }, [alerts, isAdmin, assignedName, assignedTag]);

  // Thresholds configuration stored locally and synced with Firebase
  const [thresholds, setThresholds] = useState<SensorThresholdConfig>(() => {
    try {
      const stored = localStorage.getItem('freshnex_sensor_thresholds');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_THRESHOLDS;
  });

  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('freshnex_audio_muted');
      return stored === 'true';
    } catch {}
    return false;
  });

  const toggleAudioMute = () => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      localStorage.setItem('freshnex_audio_muted', String(next));
      return next;
    });
  };

  const updateThresholds = (newConfig: SensorThresholdConfig) => {
    setThresholds(newConfig);
    saveGlobalThresholdsToFirebase(newConfig);

    const targetProductKey =
      assignedTag || assignedName || activeItem?.id || activeItem?.name || 'COLD_DRINKS';
    saveProductThresholdToFirebase(
      targetProductKey,
      {
        tempMin: newConfig.tempMin,
        tempMax: newConfig.tempMax,
        tempCritical: newConfig.tempCritical,
        humMin: newConfig.humidityMin,
        humMax: newConfig.humidityMax,
        gasWarning: newConfig.gasWarning,
        gasCritical: newConfig.gasCritical,
        productName: activeItem?.name || assignedName || 'Cold Drinks',
      },
      userProfile?.name || 'Admin'
    ).catch((e) => console.warn(e));

    if (activeItem && sensorData) {
      const report = calculateFreshness({
        temperature: sensorData.temperature,
        humidity: sensorData.humidity,
        gas: sensorData.gas,
        category: activeItem.category,
        activeThresholdRules: newConfig,
      });
      setFreshnessReport(report);
    }
  };

  // 0. Subscribe to Real-Time Product Thresholds from active Firebase credentials
  useEffect(() => {
    const targetProductKey =
      assignedTag || assignedName || activeItem?.id || activeItem?.name || 'COLD_DRINKS';
    const unsubProduct = subscribeToProductThreshold(targetProductKey, (productConfig) => {
      setThresholds(productConfig);

      if (sensorData) {
        const itemToEval =
          activeItem || DEFAULT_ITEMS[targetProductKey] || DEFAULT_ITEMS['COLD_DRINKS'];
        const report = calculateFreshness({
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          gas: sensorData.gas,
          category: itemToEval?.category || 'Beverages',
          activeThresholdRules: productConfig,
        });
        setFreshnessReport(report);
      }
    });

    const unsubGlobal = subscribeToGlobalThresholds((globalConfig) => {
      setThresholds((prev) => ({ ...prev, ...globalConfig }));
    });

    return () => {
      unsubProduct();
      unsubGlobal();
    };
  }, [
    assignedTag,
    assignedName,
    activeItem?.id,
    activeItem?.name,
    sensorData?.temperature,
    sensorData?.humidity,
    sensorData?.gas,
    configVersion,
  ]);

  // 1. Subscribe to Real-Time Firebase Alerts Collection
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseAlerts((liveAlerts) => {
      setAlerts(liveAlerts);
    });

    return () => {
      unsubscribe();
    };
  }, [configVersion]);

  // 2. Load scan history on initial mount, auth state change, or Firebase credential update
  useEffect(() => {
    FirebaseService.getScanHistory(currentUser?.uid || userProfile?.uid).then((records) => {
      if (records && records.length > 0) {
        setScanHistory(records);
      }
    });
  }, [currentUser?.uid, userProfile?.uid, configVersion]);

  // 3. Process and evaluate incoming sensor data (all 9 parameters) against thresholds
  const handleSensorTelemetry = useCallback(
    (data: SensorData & { isReal?: boolean }, currentItem?: FoodItem | null) => {
      const moistureInfo = calculateMoisture(data.temperature, data.humidity);
      const itemToEval = currentItem || activeItem;
      const phInfo = calculatePH(
        data.temperature,
        data.humidity,
        moistureInfo.absoluteMoisture,
        {
          category: itemToEval?.category,
          gas: data.gas,
        }
      );

      const enrichedData: SensorData & { isReal?: boolean } = {
        ...data,
        moisture: data.moisture !== undefined ? data.moisture : moistureInfo.absoluteMoisture,
        dewPoint: data.dewPoint !== undefined ? data.dewPoint : moistureInfo.dewPoint,
        ph: data.ph !== undefined ? data.ph : phInfo.ph,
        impact: data.impact !== undefined ? data.impact : 0.12,
        light: data.light !== undefined ? data.light : 18,
        gpsLat: data.gpsLat !== undefined ? data.gpsLat : 22.5726,
        gpsLng: data.gpsLng !== undefined ? data.gpsLng : 88.3639,
        gpsSats: data.gpsSats !== undefined ? data.gpsSats : 8,
      };

      setSensorData(enrichedData);

      if (itemToEval) {
        const report = calculateFreshness({
          temperature: enrichedData.temperature,
          humidity: enrichedData.humidity,
          gas: enrichedData.gas,
          category: itemToEval.category,
          activeThresholdRules: thresholds,
        });
        setFreshnessReport(report);

        if (enrichedData.isReal) {
          const triggeredAlerts = evaluateSensorReading(enrichedData, itemToEval, thresholds);
          if (triggeredAlerts.length > 0) {
            triggeredAlerts.forEach((alert) => {
              pushAlertToFirebase(alert, currentUser?.uid || userProfile?.uid);

              if (!isAudioMuted && thresholds.enableAudio) {
                playAlertChime(alert.severity);
              }
            });
          }
        }
      }
    },
    [activeItem, thresholds, isAudioMuted, currentUser?.uid, userProfile?.uid]
  );

  // Seed default scan history and active item for assigned product user if logged in with unique code
  useEffect(() => {
    if (!isAdmin && (assignedName || assignedTag)) {
      const prodName = assignedName || 'Cold Drinks';
      const tagId = assignedTag || 'COLD_DRINKS';
      const hasItem = scanHistory.some(
        (s) =>
          s.itemName.toLowerCase().includes(prodName.toLowerCase()) ||
          s.tagId.toLowerCase().includes(tagId.toLowerCase())
      );
      if (!hasItem) {
        const defaultRecord: ScanHistoryRecord = {
          id: `scan-default-${tagId}-${Math.random().toString(36).substring(2, 8)}`,
          itemId: tagId,
          itemName: prodName,
          tagId: tagId.startsWith('#') ? tagId : `#${tagId}`,
          itemImage: '/colddrinks.jpg',
          temperature: 3.5,
          humidity: 58.2,
          moisture: 4.2,
          ph: 4.2,
          gas: 110,
          impact: 0.12,
          light: 18,
          gpsLat: 22.5726,
          gpsLng: 88.3639,
          gpsSats: 8,
          freshnessScore: 98,
          status: 'Fresh',
          timestamp: Date.now(),
        };
        setScanHistory((prev) => [defaultRecord, ...prev]);
      }

      if (!activeItem) {
        const itemObj = DEFAULT_ITEMS[tagId] || DEFAULT_ITEMS['COLD_DRINKS'] || {
          id: tagId,
          name: prodName,
          category: 'Beverages',
          image: '/colddrinks.jpg',
          batchId: 'BATCH-102',
          tagId: tagId.startsWith('#') ? tagId : `#${tagId}`,
          description: `${prodName} package monitored in real-time.`,
          optimalTemp: '1 - 5°C',
          optimalHumidity: '50 - 70%',
          maxGas: 150,
        };
        setActiveItem(itemObj as any);
        const initSensor = DEFAULT_SENSOR_DATA[tagId] || DEFAULT_SENSOR_DATA['COLD_DRINKS'] || {
          temperature: 3.5,
          humidity: 58,
          gas: 110,
          impact: 0.12,
          light: 18,
          gpsLat: 22.5726,
          gpsLng: 88.3639,
          gpsSats: 8,
          timestamp: Date.now(),
        };
        handleSensorTelemetry(initSensor, itemObj as any);
      }
    }
  }, [isAdmin, assignedName, assignedTag, scanHistory, activeItem, handleSensorTelemetry]);

  // 4. Real-time sensor listener whenever activeItem or Firebase credentials change
  useEffect(() => {
    if (!activeItem) {
      setSensorData(null);
      setFreshnessReport(null);
      return;
    }

    const unsubscribe = FirebaseService.subscribeToSensorData(activeItem.id, (data) => {
      handleSensorTelemetry(data, activeItem);
    });

    return () => {
      unsubscribe();
    };
  }, [activeItem?.id, handleSensorTelemetry, configVersion]);

  // Scan product
  const scanItem = async (itemId: string): Promise<FoodItem> => {
    setIsScanning(true);
    try {
      const item = await FirebaseService.getItemById(itemId);
      if (!item) throw new Error('Item tag not found in FreshNex database.');

      setActiveItem(item);

      const initSensor = DEFAULT_SENSOR_DATA[item.id] || {
        temperature: 4.2,
        humidity: 62,
        gas: 120,
        impact: 0.12,
        light: 18,
        gpsLat: 22.5726,
        gpsLng: 88.3639,
        gpsSats: 8,
        timestamp: Date.now(),
      };

      handleSensorTelemetry(initSensor, item);

      const report = calculateFreshness({
        temperature: initSensor.temperature,
        humidity: initSensor.humidity,
        gas: initSensor.gas,
        category: item.category,
        activeThresholdRules: thresholds,
      });
      setFreshnessReport(report);

      const initMoisture = calculateMoisture(initSensor.temperature, initSensor.humidity);
      const initPH = calculatePH(
        initSensor.temperature,
        initSensor.humidity,
        initMoisture.absoluteMoisture,
        {
          category: item.category,
          gas: initSensor.gas,
        }
      );

      const record: ScanHistoryRecord = {
        id: `scan-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        tagId: item.tagId,
        itemImage: item.image,
        temperature: initSensor.temperature,
        humidity: initSensor.humidity,
        gas: initSensor.gas,
        moisture: initSensor.moisture ?? initMoisture.absoluteMoisture,
        ph: initSensor.ph ?? initPH.ph,
        impact: initSensor.impact ?? 0.12,
        light: initSensor.light ?? 18,
        gpsLat: initSensor.gpsLat ?? 22.5726,
        gpsLng: initSensor.gpsLng ?? 88.3639,
        gpsSats: initSensor.gpsSats ?? 8,
        freshnessScore: report.score,
        status: report.status,
        timestamp: Date.now(),
      };

      await FirebaseService.saveScanHistory(record, currentUser?.uid || userProfile?.uid);
      setScanHistory((prev) => [record, ...prev.filter((r) => r.id !== record.id)]);

      return item;
    } finally {
      setIsScanning(false);
    }
  };

  const clearActiveItem = () => {
    setActiveItem(null);
    setSensorData(null);
    setFreshnessReport(null);
  };

  const markNotificationsAsRead = async () => {
    await markAllAlertsReadFirebase(alerts);
  };

  const markAlertAsRead = async (alertId: string) => {
    await updateAlertReadState(alertId, true);
  };

  const resolveAlert = async (alertId: string) => {
    await resolveAlertInFirebase(alertId);
  };

  const deleteAlert = async (alertId: string) => {
    await deleteAlertFromFirebase(alertId);
  };

  const clearAllAlerts = async () => {
    setAlerts([]);
    await clearAllAlertsFromFirebase();
  };

  const deleteHistoryRecord = (id: string) => {
    setScanHistory((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('freshnex_scan_history', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const clearHistory = async () => {
    await FirebaseService.clearScanHistory(currentUser?.uid || userProfile?.uid);
    setScanHistory([]);
  };

  const reloadHistory = async () => {
    const data = await FirebaseService.getScanHistory(currentUser?.uid || userProfile?.uid);
    setScanHistory(data);
  };

  const notifications: FreshnessNotification[] = filteredAlerts.map((a) => ({
    id: a.id,
    title: a.title,
    message: a.message,
    type: a.severity,
    timestamp: a.timestamp,
    read: a.read,
    metric: a.metric,
    currentValue: a.currentValue,
    thresholdValue: a.thresholdValue,
    unit: a.unit,
    itemId: a.itemId,
    deviceId: a.deviceId,
    resolved: a.resolved,
  }));

  const unreadCount = filteredAlerts.filter((n) => !n.read).length;

  return (
    <FreshnessContext.Provider
      value={{
        activeItem,
        sensorData,
        freshnessReport,
        scanHistory: filteredScanHistory,
        notifications,
        alerts: filteredAlerts,
        unreadCount,
        isScanning,
        thresholds,
        isAudioMuted,
        toggleAudioMute,
        updateThresholds,
        scanItem,
        clearActiveItem,
        markNotificationsAsRead,
        markAlertAsRead,
        resolveAlert,
        deleteAlert,
        clearAllAlerts,
        deleteHistoryRecord,
        clearHistory,
        reloadHistory,
      }}
    >
      {children}
    </FreshnessContext.Provider>
  );
};

export const useFreshness = () => {
  const context = useContext(FreshnessContext);
  if (!context) {
    throw new Error('useFreshness must be used within a FreshnessProvider');
  }
  return context;
};
