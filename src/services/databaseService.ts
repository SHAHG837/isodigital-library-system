import {
  Member,
  OfficeBearer,
  Designation,
  AdminUser,
  AdminCredential,
  AuditLog,
  DocumentRecord,
  EventRecord,
  DonationRecord,
  RegistrationNotification
} from '../types';
import {
  fetchMasterDatabaseFromFirestore,
  fetchOfficeBearersFromFirestore,
  fetchDesignationsFromFirestore,
  saveMasterDatabaseToFirestore,
  isFirestoreWriteQuotaExceeded,
  FIRESTORE_UPGRADE_URL
} from '../lib/firestoreDb';

export { FIRESTORE_UPGRADE_URL, isFirestoreWriteQuotaExceeded };

export interface IsoDatabaseSnapshot {
  members?: Member[];
  officeBearers?: OfficeBearer[];
  designations?: Designation[];
  admins?: AdminUser[];
  adminCredentials?: AdminCredential[];
  auditLogs?: AuditLog[];
  documents?: DocumentRecord[];
  events?: EventRecord[];
  donations?: DonationRecord[];
  registrationNotifications?: RegistrationNotification[];
  superAdminPhoto?: string;
  updatedAt?: string;
}

let syncTimeout: any = null;
let isSyncing = false;
let pendingSnapshot: IsoDatabaseSnapshot | null = null;

export interface DatabaseSyncStatus {
  syncing: boolean;
  lastSavedAt: string | null;
  error: string | null;
  quotaExceeded: boolean;
  storageTarget: 'cloud_and_server' | 'server_disk';
}

// Subscribers for sync status notifications
type SyncStatusCallback = (status: DatabaseSyncStatus) => void;
const listeners = new Set<SyncStatusCallback>();

let lastSavedTimestamp: string | null = null;
let lastSyncError: string | null = null;

function notifyListeners() {
  const quotaExceeded = isFirestoreWriteQuotaExceeded();
  const status: DatabaseSyncStatus = {
    syncing: isSyncing,
    lastSavedAt: lastSavedTimestamp,
    error: lastSyncError,
    quotaExceeded,
    storageTarget: quotaExceeded ? 'server_disk' : 'cloud_and_server'
  };
  listeners.forEach((fn) => {
    try {
      fn(status);
    } catch (e) {
      console.error(e);
    }
  });
}

export function subscribeToDatabaseSync(callback: SyncStatusCallback): () => void {
  listeners.add(callback);
  const quotaExceeded = isFirestoreWriteQuotaExceeded();
  callback({
    syncing: isSyncing,
    lastSavedAt: lastSavedTimestamp,
    error: lastSyncError,
    quotaExceeded,
    storageTarget: quotaExceeded ? 'server_disk' : 'cloud_and_server'
  });
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Load the complete permanent database from Firestore cloud DB and server disk
 */
export async function loadDatabaseFromServer(): Promise<IsoDatabaseSnapshot | null> {
  let cloudSnapshot: IsoDatabaseSnapshot | null = null;
  let serverSnapshot: IsoDatabaseSnapshot | null = null;

  // 1. Fetch from Firestore Cloud Database
  try {
    cloudSnapshot = await fetchMasterDatabaseFromFirestore();
  } catch (e: any) {
    console.warn('[DATABASE SERVICE] Notice reading Firestore snapshot:', e?.message);
  }

  // 2. Fetch from Express Server File
  try {
    const res = await fetch('/api/database', {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.exists && json.data) {
        serverSnapshot = json.data as IsoDatabaseSnapshot;
      }
    }
  } catch (err: any) {
    console.warn('[DATABASE SERVICE] Unable to connect to server database file:', err?.message);
  }

  // Merge datasets, prioritizing the most recently updated snapshot
  if (cloudSnapshot && serverSnapshot) {
    const cloudTime = cloudSnapshot.updatedAt ? new Date(cloudSnapshot.updatedAt).getTime() : 0;
    const serverTime = serverSnapshot.updatedAt ? new Date(serverSnapshot.updatedAt).getTime() : 0;
    
    // Merge both snapshots with newer taking precedence
    const primary = cloudTime >= serverTime ? cloudSnapshot : serverSnapshot;
    const secondary = cloudTime >= serverTime ? serverSnapshot : cloudSnapshot;
    
    const merged: IsoDatabaseSnapshot = {
      ...secondary,
      ...primary,
      // Authoritative array selection: If primary has the array, use it directly (even if emptied or filtered)
      officeBearers: Array.isArray(primary.officeBearers)
        ? primary.officeBearers
        : (Array.isArray(secondary.officeBearers) ? secondary.officeBearers : []),
      designations: Array.isArray(primary.designations)
        ? primary.designations
        : (Array.isArray(secondary.designations) ? secondary.designations : []),
      members: Array.isArray(primary.members)
        ? primary.members
        : (Array.isArray(secondary.members) ? secondary.members : []),
      updatedAt: primary.updatedAt || secondary.updatedAt || new Date().toISOString()
    };

    lastSavedTimestamp = merged.updatedAt || new Date().toISOString();
    notifyListeners();

    // If cloud and server disk differed in freshness, back-sync to keep both in 100% identical alignment
    if (Math.abs(cloudTime - serverTime) > 1000) {
      persistDatabaseToServer(merged).catch((e) => console.warn('[DATABASE SERVICE] Auto-alignment sync notice:', e));
    }

    return merged;
  }

  const result = cloudSnapshot || serverSnapshot;
  if (result) {
    lastSavedTimestamp = result.updatedAt || new Date().toISOString();
    notifyListeners();
    return result;
  }

  return null;
}

/**
 * Persist database snapshot to Firestore Cloud DB and server disk immediately
 */
export async function persistDatabaseToServer(snapshot: IsoDatabaseSnapshot): Promise<boolean> {
  isSyncing = true;
  lastSyncError = null;
  notifyListeners();

  let cloudSuccess = false;
  let serverSuccess = false;

  // 1. Save to Firestore Cloud Database (if free write quota is available)
  try {
    if (!isFirestoreWriteQuotaExceeded()) {
      cloudSuccess = await saveMasterDatabaseToFirestore(snapshot);
    }
  } catch (err: any) {
    console.warn('[DATABASE SERVICE] Firestore cloud persist notice:', err?.message);
  }

  // 2. Save to Express server disk endpoint (authoritative local disk persistence)
  try {
    const res = await fetch('/api/database/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot)
    });

    if (res.ok) {
      serverSuccess = true;
    } else {
      console.warn('[DATABASE SERVICE] Server file save non-200 status');
    }
  } catch (err: any) {
    console.warn('[DATABASE SERVICE] Server file save connection error:', err?.message);
  }

  const success = cloudSuccess || serverSuccess;
  if (success) {
    lastSavedTimestamp = new Date().toISOString();
    isSyncing = false;
    notifyListeners();
    return true;
  } else {
    lastSyncError = 'Could not sync changes to cloud database or server disk.';
    isSyncing = false;
    notifyListeners();
    return false;
  }
}

/**
 * Debounced background synchronization for frequent state changes
 */
export function scheduleDatabaseSync(snapshot: IsoDatabaseSnapshot, delayMs: number = 300) {
  pendingSnapshot = {
    ...(pendingSnapshot || {}),
    ...snapshot
  };

  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    if (pendingSnapshot) {
      const toSend = { ...pendingSnapshot };
      pendingSnapshot = null;
      await persistDatabaseToServer(toSend);
    }
  }, delayMs);
}

/**
 * Immediately flush any pending debounced database sync to disk
 */
export async function flushPendingSync(): Promise<boolean> {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }
  if (pendingSnapshot) {
    const toSend = { ...pendingSnapshot };
    pendingSnapshot = null;
    return await persistDatabaseToServer(toSend);
  }
  return true;
}

/**
 * Safely persist to browser localStorage without crashing on QuotaExceededError
 */
export function safeSetLocalStorage(key: string, value: any): boolean {
  try {
    const stringified = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringified);
    return true;
  } catch (err: any) {
    console.warn(`[STORAGE WARNING] LocalStorage quota exceeded or restricted for key ${key}:`, err?.message);
    return false;
  }
}

/**
 * Safely retrieve parsed item from browser localStorage
 */
export function safeGetLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    return fallback;
  }
}
