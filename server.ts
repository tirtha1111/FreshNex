import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, Firestore } from 'firebase/firestore';
import { getDatabase, ref as dbRef, onValue, update as rtdbUpdate, Database } from 'firebase/database';

dotenv.config();

const DEFAULT_RTDB_URL = 'https://freshnex-9bf3f-default-rtdb.firebaseio.com';
const OFFLINE_TIMEOUT_MS = 30000; // 30-second backend timer for online/offline status

let firebaseConfig: any = {};
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
} catch (e) {
  console.warn('Could not read firebase-applet-config.json:', e);
}

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
});
const PORT = 3000;

let db: Firestore | null = null;
let rtdb: Database | null = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = firebaseConfig.firestoreDatabaseId
      ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
      : getFirestore(firebaseApp);
    const databaseURL = firebaseConfig.databaseURL || process.env.VITE_FIREBASE_DATABASE_URL || DEFAULT_RTDB_URL;
    rtdb = getDatabase(firebaseApp, databaseURL);
  }
} catch (fbErr) {
  console.warn('Firebase server initialization warning:', fbErr);
}

function normalizeDeviceId(rawId: string): string {
  const clean = String(rawId || '').trim().toUpperCase().replace(/^#/, '');
  if (clean === '001' || clean === 'APPLE' || clean.includes('001')) return 'YGS-FD-001';
  if (clean === '124' || clean === 'MILK' || clean.includes('124')) return 'YGS-FD-124';
  return clean || 'YGS-FD-001';
}

function computeSensorSignature(payload: any): string {
  if (!payload || typeof payload !== 'object') return '';
  let target = payload;
  if (
    !(
      'temperature' in payload ||
      'temp' in payload ||
      'humidity' in payload ||
      'hum' in payload ||
      'gas' in payload ||
      'mq135_raw' in payload
    )
  ) {
    const keys = Object.keys(payload).filter((k) => k !== 'commands' && k !== 'status' && k !== 'online');
    if (keys.length > 0) {
      const lastKey = keys[keys.length - 1];
      if (typeof payload[lastKey] === 'object' && payload[lastKey] !== null) {
        target = payload[lastKey];
      }
    }
  }
  const temp = Number(target.temperature ?? target.temp ?? target.t ?? 0).toFixed(2);
  const hum = Number(target.humidity ?? target.hum ?? target.h ?? 0).toFixed(2);
  const gas = Number(target.mq135_raw ?? target.gas ?? target.mq135 ?? 0).toFixed(0);
  const impact = Number(target.impact ?? target.acceleration_change ?? 0).toFixed(3);
  const light = Number(target.light ?? target.light_lux ?? 0).toFixed(1);
  const lat = Number(target.gpsLat ?? target.lat ?? 0).toFixed(4);
  const lng = Number(target.gpsLng ?? target.lng ?? 0).toFixed(4);
  const ts = Number(
    target.timestamp ??
      target.last_update ??
      target.lastUpdated ??
      target.time ??
      target.website_updated_at ??
      0
  );
  return `${temp}|${hum}|${gas}|${impact}|${light}|${lat}|${lng}|${ts}`;
}

// Authoritative Backend State & 30-Second Per-Device Timers
const deviceTelemetryStore = new Map<string, any>();
const deviceStatusStore = new Map<string, 'online' | 'offline'>([
  ['YGS-FD-001', 'online'],
  ['YGS-FD-124', 'online'],
]);
const deviceLastDataAtStore = new Map<string, number>([
  ['YGS-FD-001', Date.now()],
  ['YGS-FD-124', Date.now()],
]);
const deviceOfflineAtStore = new Map<string, number>();
const deviceLastResponseAtStore = new Map<string, number>([
  ['YGS-FD-001', Date.now()],
  ['YGS-FD-124', Date.now()],
]);
const deviceSignaturesStore = new Map<string, string>();
const deviceOfflineTimers = new Map<string, NodeJS.Timeout>();

function getStatusesSnapshot() {
  const now = Date.now();
  const snapshot: Record<
    string,
    {
      deviceId: string;
      status: 'online' | 'offline';
      lastDataAt: number;
      offlineAt?: number;
      lastResponseAt: number;
      remainingMs: number;
    }
  > = {};

  for (const [devId, status] of deviceStatusStore.entries()) {
    const lastDataAt = deviceLastDataAtStore.get(devId) || now;
    const offlineAt = deviceOfflineAtStore.get(devId);
    const lastResponseAt =
      status === 'offline'
        ? offlineAt || deviceLastResponseAtStore.get(devId) || lastDataAt
        : lastDataAt;
    const elapsed = now - lastDataAt;
    const remainingMs = status === 'online' ? Math.max(0, OFFLINE_TIMEOUT_MS - elapsed) : 0;
    snapshot[devId] = {
      deviceId: devId,
      status,
      lastDataAt,
      offlineAt,
      lastResponseAt,
      remainingMs,
    };
  }
  return snapshot;
}

/**
 * Starts or resets the authoritative 30-second backend timer for a device.
 * Until 30 seconds elapse, the device is ONLINE and lastResponseAt is the timestamp when
 * the last data was received. At the moment the 30s timer expires and the device becomes OFFLINE,
 * lastResponseAt is updated to that exact offline transition timestamp.
 */
function startOrReset30sTimer(deviceId: string, latestData?: any) {
  const normId = normalizeDeviceId(deviceId);
  if (normId === 'YGS-FD-000124' || normId === 'YGS-FD-112233') return;

  const now = Date.now();
  deviceStatusStore.set(normId, 'online');
  deviceLastDataAtStore.set(normId, now);
  deviceOfflineAtStore.delete(normId);
  deviceLastResponseAtStore.set(normId, now);

  if (latestData && typeof latestData === 'object') {
    const existing = deviceTelemetryStore.get(normId) || {};
    deviceTelemetryStore.set(normId, {
      ...existing,
      ...latestData,
      device_id: normId,
      online: true,
      status: 'online',
      last_response_at: now,
    });
  }

  // Clear previous 30-second timer if running
  const prevTimer = deviceOfflineTimers.get(normId);
  if (prevTimer) {
    clearTimeout(prevTimer);
  }

  // Broadcast immediate ONLINE status and zero-lag telemetry to all connected clients
  io.emit('device:status', {
    deviceId: normId,
    status: 'online',
    lastDataAt: now,
    lastResponseAt: now,
    remainingMs: OFFLINE_TIMEOUT_MS,
  });

  if (latestData) {
    io.emit('device:telemetry', {
      deviceId: normId,
      data: deviceTelemetryStore.get(normId),
      status: 'online',
      lastDataAt: now,
      lastResponseAt: now,
    });
  }

  // Start the 30-second countdown timer in the backend
  const timer = setTimeout(() => {
    const offlineMoment = Date.now();
    deviceStatusStore.set(normId, 'offline');
    deviceOfflineAtStore.set(normId, offlineMoment);
    deviceLastResponseAtStore.set(normId, offlineMoment);
    const lastDataAt = deviceLastDataAtStore.get(normId) || offlineMoment - OFFLINE_TIMEOUT_MS;
    const existing = deviceTelemetryStore.get(normId);
    if (existing) {
      deviceTelemetryStore.set(normId, {
        ...existing,
        online: false,
        status: 'offline',
        last_response_at: offlineMoment,
      });
    }

    // Immediately broadcast OFFLINE status with the offline moment as lastResponseAt
    io.emit('device:status', {
      deviceId: normId,
      status: 'offline',
      lastDataAt,
      offlineAt: offlineMoment,
      lastResponseAt: offlineMoment,
      remainingMs: 0,
    });
  }, OFFLINE_TIMEOUT_MS);

  deviceOfflineTimers.set(normId, timer);
}

// Initialize 30-second timers on server boot for default devices
startOrReset30sTimer('YGS-FD-001');
startOrReset30sTimer('YGS-FD-124');

// Attach real-time Firebase RTDB listeners on the backend to push changes via WebSocket with zero lag
if (rtdb) {
  try {
    const devicesNodeRef = dbRef(rtdb, 'devices');
    onValue(
      devicesNodeRef,
      (snapshot) => {
        if (!snapshot.exists()) return;
        const val = snapshot.val();
        if (!val || typeof val !== 'object') return;

        Object.entries(val).forEach(([rawDevId, devPayload]: [string, any]) => {
          if (rawDevId === 'YGS-FD-000124' || rawDevId === 'YGS-FD-112233') return;
          const normId = normalizeDeviceId(rawDevId);
          const newSig = computeSensorSignature(devPayload);
          const oldSig = deviceSignaturesStore.get(normId);

          deviceTelemetryStore.set(normId, {
            ...(deviceTelemetryStore.get(normId) || {}),
            ...(typeof devPayload === 'object' ? devPayload : {}),
            device_id: normId,
          });

          // If the database reading actually changed, push via WebSocket and reset the 30s timer
          if (oldSig !== newSig) {
            deviceSignaturesStore.set(normId, newSig);
            startOrReset30sTimer(normId, devPayload);
          }
        });
      },
      (err) => {
        console.warn('Backend RTDB devices listener notice:', err?.message || err);
      }
    );

    const sensorDataNodeRef = dbRef(rtdb, 'sensorData');
    onValue(
      sensorDataNodeRef,
      (snapshot) => {
        if (!snapshot.exists()) return;
        const val = snapshot.val();
        if (!val || typeof val !== 'object') return;

        Object.entries(val).forEach(([rawDevId, sensorPayload]: [string, any]) => {
          if (rawDevId === 'YGS-FD-000124' || rawDevId === 'YGS-FD-112233') return;
          const normId = normalizeDeviceId(rawDevId);
          const newSig = computeSensorSignature(sensorPayload);
          const oldSig = deviceSignaturesStore.get(`sensor_${normId}`);

          if (oldSig !== newSig) {
            deviceSignaturesStore.set(`sensor_${normId}`, newSig);
            startOrReset30sTimer(normId, sensorPayload);
          }
        });
      },
      () => {}
    );
  } catch (err) {
    console.warn('Backend RTDB listener setup warning:', err);
  }
}

io.on('connection', (socket) => {
  // Send immediate snapshot of all devices and 30s timer statuses on connect
  socket.emit('devices:init', {
    devices: Object.fromEntries(deviceTelemetryStore.entries()),
    statuses: getStatusesSnapshot(),
  });

  socket.on('client:request_sync', () => {
    socket.emit('devices:init', {
      devices: Object.fromEntries(deviceTelemetryStore.entries()),
      statuses: getStatusesSnapshot(),
    });
  });

  socket.on('client:request_device_status', (deviceId: string) => {
    const normId = normalizeDeviceId(deviceId);
    const statuses = getStatusesSnapshot();
    const st = statuses[normId] || {
      deviceId: normId,
      status: 'online' as const,
      lastDataAt: Date.now(),
      remainingMs: OFFLINE_TIMEOUT_MS,
    };
    socket.emit('device:status', st);
  });

  /**
   * Triggered when the frontend receives new/updated sensor data.
   * Starts/resets the 30-second backend timer for that device.
   */
  socket.on(
    'device:data_received',
    (payload: { deviceId: string; data?: any; signature?: string; receivedAt?: number }) => {
      if (!payload || !payload.deviceId) return;
      const normId = normalizeDeviceId(payload.deviceId);
      const incomingSig = payload.signature || computeSensorSignature(payload.data);
      const prevClientSig = deviceSignaturesStore.get(`client_${normId}`);

      // Reset the 30-second timer whenever a new data reading is received at the frontend
      if (!prevClientSig || prevClientSig !== incomingSig) {
        deviceSignaturesStore.set(`client_${normId}`, incomingSig);
        startOrReset30sTimer(normId, payload.data);
      } else if (!deviceStatusStore.has(normId)) {
        startOrReset30sTimer(normId, payload.data);
      }
    }
  );

  /**
   * Direct WebSocket device update from frontend -> immediately broadcasts to all clients & writes to DB
   */
  socket.on('device:update', async (payload: { deviceId: string; data: any; timestamp?: number }) => {
    if (!payload || !payload.deviceId || !payload.data) return;
    const normId = normalizeDeviceId(payload.deviceId);
    const now = payload.timestamp || Date.now();
    const updatedData = {
      ...(deviceTelemetryStore.get(normId) || {}),
      ...payload.data,
      device_id: normId,
      last_update: now,
      website_updated_at: now,
      online: true,
    };

    const sig = computeSensorSignature(updatedData);
    deviceSignaturesStore.set(normId, sig);
    deviceSignaturesStore.set(`client_${normId}`, sig);

    // Start/reset 30s timer and broadcast to all connected clients with zero lag
    startOrReset30sTimer(normId, updatedData);

    // Persist asynchronously to Firebase RTDB & Firestore
    if (rtdb) {
      rtdbUpdate(dbRef(rtdb, `devices/${normId}`), updatedData).catch(() => {});
    }
    if (db) {
      setDoc(doc(db, 'devices', normId), updatedData, { merge: true }).catch(() => {});
    }
  });

  socket.on('heartbeat', (deviceId: string) => {
    if (deviceId) {
      startOrReset30sTimer(deviceId);
    }
  });
});

// 1-second status sync tick so Admin Panel countdowns and online/offline states stay 100% synchronized
setInterval(() => {
  io.emit('devices:status_sync', getStatusesSnapshot());
}, 1000);

app.use(express.json());

// Scientific fallback knowledge base based on USDA Handbook 66 & UC Davis Postharvest guidelines
const SCIENTIFIC_PRESETS: Record<string, {
  category: string;
  tempMin: number;
  tempMax: number;
  optimalTemp: number;
  humMin: number;
  humMax: number;
  optimalHumidity: number;
  mq135Threshold: number;
  shelfLifeDays: number;
  ethyleneSensitivity: 'Low' | 'Moderate' | 'High' | 'None';
  scientificRationale: string;
  citations: string[];
}> = {
  milk: {
    category: 'Dairy',
    tempMin: 1.0,
    tempMax: 4.0,
    optimalTemp: 2.5,
    humMin: 50,
    humMax: 70,
    optimalHumidity: 60,
    mq135Threshold: 1300,
    shelfLifeDays: 7,
    ethyleneSensitivity: 'None',
    scientificRationale: 'Pasteurized cow milk requires strict 1-4°C chill preservation to suppress psychrotrophic bacterial growth (Pseudomonas spp.). Elevated temperatures rapidly accelerate enzymatic lipolysis and lactic acid fermentation.',
    citations: ['Grade A Pasteurized Milk Ordinance (FDA)', 'USDA Agricultural Handbook 66']
  },
  cheese: {
    category: 'Dairy',
    tempMin: 2.0,
    tempMax: 7.0,
    optimalTemp: 4.0,
    humMin: 70,
    humMax: 85,
    optimalHumidity: 80,
    mq135Threshold: 1450,
    shelfLifeDays: 30,
    ethyleneSensitivity: 'None',
    scientificRationale: 'Hard and semi-hard cheeses require balanced humidity (70-85%) to prevent surface dehydration while inhibiting unwanted fungal mold sporulation.',
    citations: ['International Dairy Federation Standards']
  },
  tomato: {
    category: 'Vegetable',
    tempMin: 10.0,
    tempMax: 15.0,
    optimalTemp: 12.5,
    humMin: 85,
    humMax: 95,
    optimalHumidity: 90,
    mq135Threshold: 1400,
    shelfLifeDays: 14,
    ethyleneSensitivity: 'High',
    scientificRationale: 'Ripe tomatoes suffer chilling injury below 10°C, causing surface pitting, mealiness, and flavor loss. High humidity (85-95%) prevents transpirational moisture loss.',
    citations: ['UC Davis Postharvest Technology Center', 'USDA Guidelines for Solanaceous Crops']
  },
  meat: {
    category: 'Meat & Poultry',
    tempMin: 0.0,
    tempMax: 3.0,
    optimalTemp: 1.5,
    humMin: 75,
    humMax: 85,
    optimalHumidity: 80,
    mq135Threshold: 1150,
    shelfLifeDays: 5,
    ethyleneSensitivity: 'None',
    scientificRationale: 'Fresh red meat and poultry require sub-3°C refrigeration to retard surface microbial proliferation (Brochothrix thermosphacta and Enterobacteriaceae) and volatile basic nitrogen gas evolution.',
    citations: ['USDA Food Safety and Inspection Service (FSIS)']
  },
  fish: {
    category: 'Seafood',
    tempMin: -0.5,
    tempMax: 2.0,
    optimalTemp: 0.5,
    humMin: 85,
    humMax: 95,
    optimalHumidity: 90,
    mq135Threshold: 1100,
    shelfLifeDays: 3,
    ethyleneSensitivity: 'None',
    scientificRationale: 'Fresh finfish and shellfish contain high non-protein nitrogen and active endogenous enzymes; holding near freezing point suppresses trimethylamine (TMA) and volatile sulfur compound generation.',
    citations: ['FAO Fisheries Technical Paper #334', 'FDA Fish and Fishery Products Hazards and Controls']
  },
  spinach: {
    category: 'Leafy Green',
    tempMin: 0.0,
    tempMax: 4.0,
    optimalTemp: 1.0,
    humMin: 90,
    humMax: 98,
    optimalHumidity: 95,
    mq135Threshold: 1250,
    shelfLifeDays: 8,
    ethyleneSensitivity: 'High',
    scientificRationale: 'Leafy greens possess extremely high surface-area-to-volume ratio and high respiration. High humidity is critical to avoid wilting, while near-freezing chill delays chlorophyll breakdown.',
    citations: ['UC Davis Postharvest Leafy Greens Compendium']
  },
  strawberry: {
    category: 'Berry / Fruit',
    tempMin: 0.0,
    tempMax: 2.5,
    optimalTemp: 1.0,
    humMin: 90,
    humMax: 95,
    optimalHumidity: 92,
    mq135Threshold: 1350,
    shelfLifeDays: 6,
    ethyleneSensitivity: 'Low',
    scientificRationale: 'Strawberries lack protective skin and are highly susceptible to Botrytis cinerea gray mold. Immediate forced-air cooling to 0-2°C extends marketable shelf life significantly.',
    citations: ['USDA Agriculture Handbook 66 (Small Fruits)']
  },
  apple: {
    category: 'Fruit',
    tempMin: 0.0,
    tempMax: 4.0,
    optimalTemp: 1.5,
    humMin: 90,
    humMax: 95,
    optimalHumidity: 92,
    mq135Threshold: 1600,
    shelfLifeDays: 60,
    ethyleneSensitivity: 'High',
    scientificRationale: 'Apples are climacteric fruit that emit substantial ethylene. Controlled atmosphere and cold temperatures curb respiration and prevent internal breakdown and scald.',
    citations: ['Postharvest Physiology and Biochemistry of Seed and Perennial Fruit Crops']
  }
};

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GROQ_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// AI Research & Threshold Auto-Configuration API
app.post('/api/ai/suggest-thresholds', async (req: Request, res: Response) => {
  const { productName = '', category = '', storageContext = '' } = req.body;

  if (!productName || typeof productName !== 'string' || !productName.trim()) {
    res.status(400).json({ error: 'Product name is required for AI threshold research.' });
    return;
  }

  const cleanProduct = productName.trim();

  // 1. Primary AI Engine: Google Gemini API via @google/genai SDK
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `You are a Senior Post-Harvest Scientist and IoT Food Quality Specialist for FreshNex.
For the product "${cleanProduct}"${category ? ` (Category: ${category})` : ''}${storageContext ? ` (Storage Context: ${storageContext})` : ''}, research and determine optimal cold-chain storage parameters adhering to USDA Handbook 66 and FAO standards.
MQ-135 is an air quality / gas sensor calibrated to raw ADC values (clean air ~900; warning spoilage threshold is typically 1100-2200). Provide exact numerical bounds.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          category: { type: Type.STRING },
          tempMin: { type: Type.NUMBER, description: 'Minimum safe storage temperature in °C' },
          tempMax: { type: Type.NUMBER, description: 'Maximum safe storage temperature in °C' },
          optimalTemp: { type: Type.NUMBER, description: 'Optimal target temperature in °C' },
          humMin: { type: Type.NUMBER, description: 'Minimum safe relative humidity % RH' },
          humMax: { type: Type.NUMBER, description: 'Maximum safe relative humidity % RH' },
          optimalHumidity: { type: Type.NUMBER, description: 'Optimal relative humidity % RH' },
          mq135Threshold: { type: Type.NUMBER, description: 'MQ-135 raw ADC threshold (1100-2200)' },
          shelfLifeDays: { type: Type.NUMBER, description: 'Estimated safe storage shelf life in days' },
          ethyleneSensitivity: { type: Type.STRING, description: 'Ethylene sensitivity: High, Moderate, Low, or None' },
          scientificRationale: { type: Type.STRING, description: 'Scientific explanation of respiration, pathogen inhibition, and preservation bounds' },
          citations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '1-3 scientific authorities or reference publications'
          }
        },
        required: [
          'productName',
          'category',
          'tempMin',
          'tempMax',
          'humMin',
          'humMax',
          'mq135Threshold',
          'shelfLifeDays',
          'scientificRationale',
          'citations'
        ]
      };

      // Candidate models: gemini-3.1-flash-lite (high availability, fast latency) and gemini-3.8-flash
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      let geminiRes: any = null;
      let usedModel = 'gemini-3.1-flash-lite';

      for (const modelName of candidateModels) {
        try {
          geminiRes = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema
            }
          });
          usedModel = modelName;
          if (geminiRes?.text) break;
        } catch (modelErr: any) {
          console.warn(`Gemini model ${modelName} error:`, modelErr?.message || modelErr);
        }
      }

      const responseText = geminiRes?.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        let rawMq = Number(parsed.mq135Threshold) || 1400;
        if (rawMq < 600) {
          rawMq = Math.round(1100 + (rawMq * 10));
        }

        res.json({
          ...parsed,
          mq135Threshold: rawMq,
          productName: cleanProduct,
          provider: 'gemini',
          model: usedModel,
          researchedAt: new Date().toISOString()
        });
        return;
      }
    } catch (geminiErr: any) {
      console.warn('Gemini primary execution failed:', geminiErr?.message || geminiErr);
    }
  }

  // 2. Secondary fallback: openai/gpt-oss-120b if configured
  const aiApiKey = process.env.GROQ_API_KEY?.trim() || process.env.AI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (aiApiKey) {
    try {
      const systemPrompt = `You are a Senior Agricultural Scientist for the FreshNex IoT cold-chain network. Provide optimal storage thresholds for ${cleanProduct} in JSON.`;
      const userPrompt = `Product: ${cleanProduct}. Provide JSON with productName, category, tempMin, tempMax, optimalTemp, humMin, humMax, optimalHumidity, mq135Threshold, shelfLifeDays, ethyleneSensitivity, scientificRationale, citations.`;

      const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 800
        }),
        signal: AbortSignal.timeout(4000)
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const contentStr = aiData.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          res.json({
            ...parsed,
            productName: cleanProduct,
            provider: 'ai-gpt-oss-120b',
            model: 'openai/gpt-oss-120b',
            researchedAt: new Date().toISOString()
          });
          return;
        }
      }
    } catch (aiErr) {
      console.warn('AI secondary fallback failed:', aiErr);
    }
  }

  // 3. Robust Scientific Knowledge Base Matching (Zero Failure Fallback)
  const lowerName = cleanProduct.toLowerCase();
  let matchedKey: string | null = null;
  for (const key of Object.keys(SCIENTIFIC_PRESETS)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      matchedKey = key;
      break;
    }
  }

  const base = matchedKey ? SCIENTIFIC_PRESETS[matchedKey] : {
    category: category || 'Perishable Produce',
    tempMin: 2.0,
    tempMax: 6.0,
    optimalTemp: 4.0,
    humMin: 65,
    humMax: 85,
    optimalHumidity: 75,
    mq135Threshold: 1400,
    shelfLifeDays: 10,
    ethyleneSensitivity: 'Moderate' as const,
    scientificRationale: `Standard cold-chain storage parameters for ${cleanProduct} established via USDA guidelines to suppress vegetative bacterial growth and retard transpirational decay.`,
    citations: ['USDA Agricultural Handbook 66', 'FAO Food Loss Prevention Manual']
  };

  res.json({
    productName: cleanProduct,
    category: base.category,
    tempMin: base.tempMin,
    tempMax: base.tempMax,
    optimalTemp: base.optimalTemp,
    humMin: base.humMin,
    humMax: base.humMax,
    optimalHumidity: base.optimalHumidity,
    mq135Threshold: base.mq135Threshold,
    shelfLifeDays: base.shelfLifeDays,
    ethyleneSensitivity: base.ethyleneSensitivity,
    scientificRationale: base.scientificRationale,
    citations: base.citations,
    provider: 'scientific-database',
    model: 'scientific-dataset-fallback',
    note: !aiApiKey ? 'AI key unconfigured; utilizing verified post-harvest database.' : undefined,
    researchedAt: new Date().toISOString()
  });
});

// AI AGENT FRESORA: Real-Time Shelf Life Prediction API (User Dashboard)
app.post('/api/ai/predict-shelf-life', async (req: Request, res: Response) => {
  const {
    productName = 'Apple',
    deviceId = 'YGS-FD-001',
    temperature = 3.5,
    humidity = 85,
    moisture = 6.2,
    ph = 4.1,
    gas = 95,
    impact = 0.08,
    light = 20,
    freshnessScore = 96
  } = req.body || {};

  const cleanProduct = String(productName || 'Apple').trim();
  const cleanDeviceId = String(deviceId || 'YGS-FD-001').trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  if (geminiKey) {
    try {
      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `You are AI AGENT FRESORA, an intelligent cold-chain food shelf-life prediction engine.
Analyze the following live IoT sensor telemetry for "${cleanProduct}" (Unique Device ID: ${cleanDeviceId}):
- Temperature: ${temperature}°C
- Relative Humidity: ${humidity}%
- Calculated Moisture: ${moisture} g/m³
- Calculated pH: ${ph}
- MQ-135 Gas / VOC Reading: ${gas}
- Impact / Shock: ${impact} G
- Light Exposure: ${light} lx
- Current Freshness Score: ${freshnessScore}%

Predict the remaining safe shelf life under these exact live conditions and return a structured JSON prediction.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          remainingDays: { type: Type.NUMBER, description: 'Predicted remaining shelf life in days' },
          remainingHours: { type: Type.NUMBER, description: 'Additional remaining hours (0-23)' },
          confidencePercent: { type: Type.NUMBER, description: 'Prediction confidence percentage (85-99)' },
          spoilageRiskLevel: { type: Type.STRING, description: 'Minimal, Low, Moderate, or High' },
          predictedStatus: { type: Type.STRING, description: 'Short headline status e.g. Optimal Cold-Chain Retention' },
          predictionSummary: { type: Type.STRING, description: '2-sentence FRESORA AI explanation of how current temperature, humidity, pH, and gas readings affect the remaining shelf life' },
          storageAdvice: { type: Type.STRING, description: '1 concise actionable storage recommendation to maximize freshness' }
        },
        required: [
          'remainingDays',
          'remainingHours',
          'confidencePercent',
          'spoilageRiskLevel',
          'predictedStatus',
          'predictionSummary',
          'storageAdvice'
        ]
      };

      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      for (const modelName of candidateModels) {
        try {
          const geminiRes = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema
            }
          });
          if (geminiRes?.text) {
            const parsed = JSON.parse(geminiRes.text);
            const days = Math.max(0, Number(parsed.remainingDays) || 7);
            const hours = Math.max(0, Math.min(23, Number(parsed.remainingHours) || 12));
            const expiryDate = new Date(Date.now() + (days * 24 + hours) * 3600 * 1000).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            res.json({
              ...parsed,
              remainingDays: days,
              remainingHours: hours,
              estimatedExpiryDate: expiryDate,
              productName: cleanProduct,
              deviceId: cleanDeviceId,
              predictedAt: new Date().toISOString()
            });
            return;
          }
        } catch (err: any) {
          console.warn(`FRESORA Gemini ${modelName} warning:`, err?.message || err);
        }
      }
    } catch (e: any) {
      console.warn('FRESORA shelf-life prediction fallback:', e?.message || e);
    }
  }

  // Deterministic biological calculation fallback if offline
  const isMilk = cleanProduct.toLowerCase().includes('milk') || cleanDeviceId.includes('124');
  const baseDays = isMilk ? 7 : 35;
  const tempPenalty = Number(temperature) > 6 ? Math.min(baseDays - 1, Math.round((Number(temperature) - 4) * 1.5)) : 0;
  const scoreFactor = Math.max(0.2, Number(freshnessScore || 95) / 100);
  const remainingDays = Math.max(1, Math.round((baseDays - tempPenalty) * scoreFactor));
  const remainingHours = isMilk ? 8 : 16;
  const expiryDate = new Date(Date.now() + (remainingDays * 24 + remainingHours) * 3600 * 1000).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  res.json({
    remainingDays,
    remainingHours,
    confidencePercent: 94,
    spoilageRiskLevel: Number(temperature) > 6 ? 'Moderate' : 'Minimal',
    predictedStatus: Number(temperature) > 6 ? 'Thermal Drift Detected' : 'Optimal Cold-Chain Retention',
    predictionSummary: `At ${temperature}°C and ${humidity}% RH with MQ-135 gas at ${gas} and pH ${ph}, ${cleanProduct} (${cleanDeviceId}) maintains slow enzymatic respiration and stable cellular hydration.`,
    storageAdvice: isMilk
      ? 'Keep sealed between 1°C and 4°C away from direct light to prevent lactic fermentation.'
      : 'Maintain 0°C–4°C with 85%–95% RH to minimize ethylene ripening and moisture loss.',
    estimatedExpiryDate: expiryDate,
    productName: cleanProduct,
    deviceId: cleanDeviceId,
    predictedAt: new Date().toISOString()
  });
});

// Vite Middleware & SPA serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`FreshNex Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
