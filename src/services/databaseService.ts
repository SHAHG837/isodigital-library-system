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

// Subscribers for sync status notifications
type SyncStatusCallback = (status: { syncing: boolean; lastSavedAt: string | null; error: string | null }) => void;
const listeners = new Set<SyncStatusCallback>();

let lastSavedTimestamp: string | null = null;
let lastSyncError: string | null = null;

function notifyListeners() {
  const status = {
    syncing: isSyncing,
    lastSavedAt: lastSavedTimestamp,
    error: lastSyncError
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
  callback({
    syncing: isSyncing,
    lastSavedAt: lastSavedTimestamp,
    error: lastSyncError
  });
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Load the complete permanent database from server disk
 */
export async function loadDatabaseFromServer(): Promise<IsoDatabaseSnapshot | null> {
  try {
    const res = await fetch('/api/database', {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.exists && json.data) {
        lastSavedTimestamp = json.data.updatedAt || new Date().toISOString();
        notifyListeners();
        return json.data as IsoDatabaseSnapshot;
      }
    }
    return null;
  } catch (err: any) {
    console.warn('[DATABASE SERVICE] Unable to connect to server database, will use local storage fallback:', err?.message);
    return null;
  }
}

/**
 * Persist database snapshot to server disk immediately
 */
export async function persistDatabaseToServer(snapshot: IsoDatabaseSnapshot): Promise<boolean> {
  isSyncing = true;
  lastSyncError = null;
  notifyListeners();

  try {
    const res = await fetch('/api/database/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot)
    });

    if (res.ok) {
      const data = await res.json();
      lastSavedTimestamp = data.savedAt || new Date().toISOString();
      isSyncing = false;
      notifyListeners();
      return true;
    } else {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Server error saving database');
    }
  } catch (err: any) {
    console.error('[DATABASE SERVICE] Failed to persist database to server:', err?.message);
    lastSyncError = err?.message || 'Connection error while saving to server.';
    isSyncing = false;
    notifyListeners();
    return false;
  }
}

/**
 * Debounced background synchronization for frequent state changes
 */
export function scheduleDatabaseSync(snapshot: IsoDatabaseSnapshot, delayMs: number = 400) {
  pendingSnapshot = snapshot;
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
