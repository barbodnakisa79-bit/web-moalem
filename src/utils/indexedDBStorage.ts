/**
 * Dual Persistence Engine: Synchronizes data across LocalStorage and IndexedDB.
 * Prevents data loss on mobile devices, iOS Safari eviction, and browser restarts.
 */

const DB_NAME = 'AmoozgarPWA_DB';
const STORE_NAME = 'keyValueStore';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save data to both localStorage AND IndexedDB asynchronously.
 */
export async function setPersistentItem(key: string, value: any): Promise<void> {
  // 1. Sync to localStorage
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.warn('LocalStorage save failed (storage quota might be exceeded):', e);
  }

  // 2. Sync to IndexedDB for resilient offline storage
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(value, key);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB save warning:', e);
  }
}

/**
 * Get item from localStorage first. If missing/cleared, attempts recovery from IndexedDB.
 */
export async function getPersistentItem<T>(key: string, defaultValue: T): Promise<T> {
  // 1. Try LocalStorage
  try {
    const localVal = localStorage.getItem(key);
    if (localVal !== null && localVal !== undefined && localVal !== '') {
      try {
        return JSON.parse(localVal) as T;
      } catch {
        return localVal as unknown as T;
      }
    }
  } catch (e) {
    console.warn('LocalStorage read error:', e);
  }

  // 2. Recovery attempt from IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);

    const dbVal = await new Promise<T | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (dbVal !== undefined && dbVal !== null) {
      // Auto-restore to LocalStorage
      try {
        const serialized = typeof dbVal === 'string' ? dbVal : JSON.stringify(dbVal);
        localStorage.setItem(key, serialized);
      } catch {}
      return dbVal;
    }
  } catch (e) {
    console.warn('IndexedDB recovery error:', e);
  }

  return defaultValue;
}

/**
 * Export all app keys for complete offline backup.
 */
export async function exportAllAppData(): Promise<string> {
  const keysToExport = [
    'amoozgar_classrooms',
    'amoozgar_selectedClassId',
    'amoozgar_students',
    'amoozgar_attendance',
    'amoozgar_scores',
    'amoozgar_journals',
    'amoozgar_behavioralPoints',
    'amoozgar_timetable',
    'amoozgar_custom_schools',
    'amoozgar_schools_details',
    'school_name',
    'amoozgar_schools_order',
    'amoozgar_grades_order',
    'amoozgar_classrooms_order',
    'amoozgar_school_level'
  ];

  const backupData: Record<string, any> = {
    _app: 'AmoozgarPWA',
    _exportDate: new Date().toISOString(),
    _version: '1.0.0',
    data: {}
  };

  for (const key of keysToExport) {
    const val = await getPersistentItem(key, null);
    if (val !== null) {
      backupData.data[key] = val;
    }
  }

  return JSON.stringify(backupData, null, 2);
}

/**
 * Import complete offline backup into both LocalStorage and IndexedDB.
 */
export async function importAllAppData(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    const dataObj = parsed.data || parsed;

    if (typeof dataObj !== 'object' || dataObj === null) {
      throw new Error('Invalid backup format');
    }

    for (const [key, val] of Object.entries(dataObj)) {
      if (key.startsWith('amoozgar_') || key === 'school_name') {
        await setPersistentItem(key, val);
      }
    }
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}
