import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FoodItem, SensorData, ScanHistoryRecord } from '../types';
import { DEFAULT_ITEMS, DEFAULT_SENSOR_DATA, DEFAULT_SCAN_HISTORY } from '../data/initialData';
import { calculateFreshness, FreshnessReport } from '../utils/freshnessEngine';
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
  deleteAlertFromFirebase 
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
  simulateScan: (itemId?: string) => Promise<FoodItem>;
  clearActiveItem: () => void;
  markNotificationsAsRead: () => void;
  markAlertAsRead: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  deleteHistoryRecord: (id: string) => void;
  clearHistory: () => Promise<void>;
  reloadHistory: () => Promise<void>;
  triggerSimulatedBreach: (type: 'temperature' | 'gas' | 'humidity') => Promise<void>;
}

const FreshnessContext = createContext<FreshnessContextType | undefined>(undefined);

export const FreshnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeItem, setActiveItem] = useState<FoodItem | null>(null);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [freshnessReport, setFreshnessReport] = useState<FreshnessReport | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryRecord[]>(DEFAULT_SCAN_HISTORY);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<SensorAlertEvent[]>([]);

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
    setIsAudioMuted(prev => {
      const next = !prev;
      localStorage.setItem('freshnex_audio_muted', String(next));
      return next;
    });
  };

  const updateThresholds = (newConfig: SensorThresholdConfig) => {
    setThresholds(newConfig);
    try {
      localStorage.setItem('freshnex_sensor_thresholds', JSON.stringify(newConfig));
    } catch (e) {
      console.warn(e);
    }
  };

  // 1. Subscribe to Real-Time Firebase Alerts Collection
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseAlerts((liveAlerts) => {
      setAlerts(liveAlerts);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Load scan history on initial mount or when auth state changes
  useEffect(() => {
    FirebaseService.getScanHistory(currentUser?.uid).then(records => {
      if (records && records.length > 0) {
        setScanHistory(records);
      }
    });
  }, [currentUser?.uid]);

  // 3. Process and evaluate incoming sensor data against thresholds
  const handleSensorTelemetry = useCallback((data: SensorData, currentItem?: FoodItem | null) => {
    setSensorData(data);
    const itemToEval = currentItem || activeItem;
    
    if (itemToEval) {
      const report = calculateFreshness({
        temperature: data.temperature,
        humidity: data.humidity,
        gas: data.gas,
        category: itemToEval.category,
      });
      setFreshnessReport(report);

      // Evaluate sensor readings for threshold breaches
      const triggeredAlerts = evaluateSensorReading(data, itemToEval, thresholds);
      if (triggeredAlerts.length > 0) {
        triggeredAlerts.forEach(alert => {
          // Push to Firebase in real-time
          pushAlertToFirebase(alert, currentUser?.uid);

          // Play audible tone if not muted
          if (!isAudioMuted && thresholds.enableAudio) {
            playAlertChime(alert.severity);
          }
        });
      }
    }
  }, [activeItem, thresholds, isAudioMuted, currentUser?.uid]);

  // 4. Real-time sensor listener whenever activeItem changes
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
  }, [activeItem?.id, handleSensorTelemetry]);

  // Scan product
  const scanItem = async (itemId: string): Promise<FoodItem> => {
    setIsScanning(true);
    try {
      const item = await FirebaseService.getItemById(itemId);
      if (!item) throw new Error('Item tag not found in FreshNex database.');

      setActiveItem(item);

      // Get instantaneous reading
      const initSensor = DEFAULT_SENSOR_DATA[item.id] || {
        temperature: 4.2,
        humidity: 62,
        gas: 120,
        timestamp: Date.now(),
      };
      
      handleSensorTelemetry(initSensor, item);

      const report = calculateFreshness({
        temperature: initSensor.temperature,
        humidity: initSensor.humidity,
        gas: initSensor.gas,
        category: item.category,
      });
      setFreshnessReport(report);

      // Record to history
      const record: ScanHistoryRecord = {
        id: `scan-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        tagId: item.tagId,
        itemImage: item.image,
        temperature: initSensor.temperature,
        humidity: initSensor.humidity,
        gas: initSensor.gas,
        freshnessScore: report.score,
        status: report.status,
        timestamp: Date.now(),
      };

      await FirebaseService.saveScanHistory(record, currentUser?.uid);
      setScanHistory(prev => [record, ...prev.filter(r => r.id !== record.id)]);

      return item;
    } finally {
      setIsScanning(false);
    }
  };

  const simulateScan = async (itemId = 'FRX1004'): Promise<FoodItem> => {
    return scanItem(itemId);
  };

  // Trigger test simulated breach to verify Firebase notification delivery
  const triggerSimulatedBreach = async (type: 'temperature' | 'gas' | 'humidity') => {
    const item = activeItem || DEFAULT_ITEMS.FRX1004;
    const now = Date.now();

    let simulatedAlert: SensorAlertEvent;

    if (type === 'temperature') {
      simulatedAlert = {
        id: `alert-test-temp-${now}`,
        type: 'Temperature Critical',
        title: 'Critical Temperature Spike Exceeded',
        message: `${item.name} #FRX1004 temperature spiked to 32.8°C (Critical Limit: ${thresholds.tempCritical}°C). Immediate cooling required!`,
        severity: 'critical',
        metric: 'temperature',
        currentValue: 32.8,
        thresholdValue: thresholds.tempCritical,
        unit: '°C',
        deviceId: item.tagId,
        itemId: item.id,
        itemName: item.name,
        timestamp: now,
        read: false,
        resolved: false,
      };
    } else if (type === 'gas') {
      simulatedAlert = {
        id: `alert-test-gas-${now}`,
        type: 'Hazardous VOC Spike',
        title: 'Severe Gas / Spoilage Threshold Exceeded',
        message: `${item.name} VOC sensor jumped to 480 ppm (Hazard Threshold: ${thresholds.gasCritical} ppm). Elevated microbial volatile amines detected!`,
        severity: 'critical',
        metric: 'gas',
        currentValue: 480,
        thresholdValue: thresholds.gasCritical,
        unit: 'ppm',
        deviceId: item.tagId,
        itemId: item.id,
        itemName: item.name,
        timestamp: now,
        read: false,
        resolved: false,
      };
    } else {
      simulatedAlert = {
        id: `alert-test-hum-${now}`,
        type: 'High Humidity Anomaly',
        title: 'Excessive Moisture Threshold Exceeded',
        message: `${item.name} humidity reached 92% (Threshold: ${thresholds.humidityMax}%). Severe moisture condensation risk.`,
        severity: 'warning',
        metric: 'humidity',
        currentValue: 92,
        thresholdValue: thresholds.humidityMax,
        unit: '%',
        deviceId: item.tagId,
        itemId: item.id,
        itemName: item.name,
        timestamp: now,
        read: false,
        resolved: false,
      };
    }

    await pushAlertToFirebase(simulatedAlert, currentUser?.uid);
    if (!isAudioMuted && thresholds.enableAudio) {
      playAlertChime(simulatedAlert.severity);
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

  const deleteHistoryRecord = (id: string) => {
    setScanHistory(prev => {
      const updated = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem('freshnex_scan_history', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const clearHistory = async () => {
    await FirebaseService.clearScanHistory(currentUser?.uid);
    setScanHistory([]);
  };

  const reloadHistory = async () => {
    const data = await FirebaseService.getScanHistory(currentUser?.uid);
    setScanHistory(data);
  };

  // Convert alerts to notifications shape for backward-compatibility with UI components
  const notifications: FreshnessNotification[] = alerts.map(a => ({
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

  const unreadCount = alerts.filter(n => !n.read).length;

  return (
    <FreshnessContext.Provider
      value={{
        activeItem,
        sensorData,
        freshnessReport,
        scanHistory,
        notifications,
        alerts,
        unreadCount,
        isScanning,
        thresholds,
        isAudioMuted,
        toggleAudioMute,
        updateThresholds,
        scanItem,
        simulateScan,
        clearActiveItem,
        markNotificationsAsRead,
        markAlertAsRead,
        resolveAlert,
        deleteAlert,
        deleteHistoryRecord,
        clearHistory,
        reloadHistory,
        triggerSimulatedBreach,
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

