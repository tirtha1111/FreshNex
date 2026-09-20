// Re-export and mirror functions from firebaseService.ts
export {
  REALTIME_DATABASE_URL,
  getDirectDatabase,
  getItemById,
  subscribeToSensorData,
  saveScanHistory,
  getScanHistory,
  FirebaseService
} from './firebaseService.ts';
