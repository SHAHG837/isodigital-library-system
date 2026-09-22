import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { OfficeBearer, Designation, Member } from '../types';
import { IsoDatabaseSnapshot } from '../services/databaseService';

// Safely initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore using the configured user firestoreDatabaseId
export const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const FIRESTORE_UPGRADE_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data?openUpgradeDialog=true`;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Error Context:', JSON.stringify(errInfo));
  return errInfo;
}

// Track Firestore Quota state with Circuit Breaker pattern
let isQuotaExceeded = false;

// Check localStorage on boot for recorded quota status
try {
  const raw = localStorage.getItem('iso_firestore_quota_exhausted');
  if (raw) {
    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    // Quotas reset daily on GCP/Firebase Spark plans
    if (parsed.date === today && parsed.exceeded) {
      isQuotaExceeded = true;
    }
  }
} catch (e) {
  // Ignore localStorage parsing errors
}

export function isFirestoreWriteQuotaExceeded(): boolean {
  return isQuotaExceeded;
}

export function setFirestoreWriteQuotaExceeded(exceeded: boolean) {
  isQuotaExceeded = exceeded;
  try {
    if (exceeded) {
      localStorage.setItem('iso_firestore_quota_exhausted', JSON.stringify({
        exceeded: true,
        date: new Date().toISOString().slice(0, 10),
        timestamp: Date.now()
      }));
    } else {
      localStorage.removeItem('iso_firestore_quota_exhausted');
    }
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Check if an error is a Firebase resource-exhausted / quota limit error
 */
function isQuotaExhaustedError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const code = (err.code || '').toLowerCase();
  return (
    code.includes('resource-exhausted') ||
    msg.includes('quota limit exceeded') ||
    msg.includes('free daily write units') ||
    msg.includes('resource_exhausted') ||
    msg.includes('quota exceeded')
  );
}

/**
 * Wrap a Firestore write promise with a defensive timeout
 * to prevent hanging or infinite backoff loops when quota is exceeded.
 */
async function withWriteTimeout<T>(operation: () => Promise<T>, timeoutMs = 2500): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Firestore write timeout. Switching to local server disk storage.'));
      }
    }, timeoutMs);

    operation()
      .then((val) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(val);
        }
      })
      .catch((err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(err);
        }
      });
  });
}

/**
 * Safely sanitize any object or array so no undefined properties exist.
 * This is CRITICAL for Firestore SDK, which throws an error if any object property is undefined.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === undefined || data === null) {
    return data;
  }
  return JSON.parse(JSON.stringify(data));
}

/**
 * Fetch master system snapshot from Firestore
 */
export async function fetchMasterDatabaseFromFirestore(): Promise<IsoDatabaseSnapshot | null> {
  try {
    const masterDocRef = doc(firestoreDb, 'system_state', 'master_database');
    const snap = await getDoc(masterDocRef);
    if (snap.exists()) {
      return snap.data() as IsoDatabaseSnapshot;
    }
    return null;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.GET, 'system_state/master_database');
    console.warn('[FIRESTORE] Notice fetching master database snapshot:', err?.message);
    return null;
  }
}

/**
 * Fetch office bearers collection from Firestore
 */
export async function fetchOfficeBearersFromFirestore(): Promise<OfficeBearer[]> {
  try {
    const colRef = collection(firestoreDb, 'office_bearers');
    const snap = await getDocs(colRef);
    const bearers: OfficeBearer[] = [];
    snap.forEach((d) => {
      bearers.push(d.data() as OfficeBearer);
    });
    return bearers;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, 'office_bearers');
    console.warn('[FIRESTORE] Notice fetching office_bearers collection:', err?.message);
    return [];
  }
}

/**
 * Fetch designations collection from Firestore
 */
export async function fetchDesignationsFromFirestore(): Promise<Designation[]> {
  try {
    const colRef = collection(firestoreDb, 'designations');
    const snap = await getDocs(colRef);
    const desg: Designation[] = [];
    snap.forEach((d) => {
      desg.push(d.data() as Designation);
    });
    return desg;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, 'designations');
    console.warn('[FIRESTORE] Notice fetching designations collection:', err?.message);
    return [];
  }
}

/**
 * Save master snapshot to Firestore
 */
export async function saveMasterDatabaseToFirestore(snapshot: IsoDatabaseSnapshot): Promise<boolean> {
  if (isFirestoreWriteQuotaExceeded()) {
    return false;
  }

  try {
    const masterDocRef = doc(firestoreDb, 'system_state', 'master_database');
    const cleaned = cleanForFirestore({
      ...snapshot,
      updatedAt: new Date().toISOString()
    });

    await withWriteTimeout(() => setDoc(masterDocRef, cleaned, { merge: true }), 3000);
    return true;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, 'system_state/master_database');
    if (isQuotaExhaustedError(err)) {
      console.warn('[FIRESTORE QUOTA] Free daily write quota reached. Switched writes safely to Server Disk.');
      setFirestoreWriteQuotaExceeded(true);
    } else {
      console.warn('[FIRESTORE] Master database cloud save notice:', err?.message);
    }
    return false;
  }
}

/**
 * Save single member to Firestore
 */
export async function saveMemberToFirestore(member: Member): Promise<boolean> {
  if (isFirestoreWriteQuotaExceeded()) {
    return false;
  }

  try {
    const docRef = doc(firestoreDb, 'members', member.id);
    const cleaned = cleanForFirestore(member);
    await withWriteTimeout(() => setDoc(docRef, cleaned, { merge: true }), 2500);
    return true;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `members/${member.id}`);
    if (isQuotaExhaustedError(err)) {
      setFirestoreWriteQuotaExceeded(true);
    }
    return false;
  }
}

/**
 * Save single office bearer to Firestore
 */
export async function saveOfficeBearerToFirestore(bearer: OfficeBearer): Promise<boolean> {
  if (isFirestoreWriteQuotaExceeded()) {
    return false;
  }

  try {
    const docRef = doc(firestoreDb, 'office_bearers', bearer.id);
    const cleaned = cleanForFirestore(bearer);
    await withWriteTimeout(() => setDoc(docRef, cleaned, { merge: true }), 2500);
    return true;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `office_bearers/${bearer.id}`);
    if (isQuotaExhaustedError(err)) {
      setFirestoreWriteQuotaExceeded(true);
    }
    return false;
  }
}

/**
 * Delete single office bearer from Firestore
 */
export async function deleteOfficeBearerFromFirestore(id: string): Promise<boolean> {
  if (isFirestoreWriteQuotaExceeded()) {
    return false;
  }

  try {
    const docRef = doc(firestoreDb, 'office_bearers', id);
    await withWriteTimeout(() => deleteDoc(docRef), 2500);
    return true;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.DELETE, `office_bearers/${id}`);
    if (isQuotaExhaustedError(err)) {
      setFirestoreWriteQuotaExceeded(true);
    }
    return false;
  }
}

/**
 * Save single designation to Firestore
 */
export async function saveDesignationToFirestore(designation: Designation): Promise<boolean> {
  if (isFirestoreWriteQuotaExceeded()) {
    return false;
  }

  try {
    const docRef = doc(firestoreDb, 'designations', designation.id);
    const cleaned = cleanForFirestore(designation);
    await withWriteTimeout(() => setDoc(docRef, cleaned, { merge: true }), 2500);
    return true;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `designations/${designation.id}`);
    if (isQuotaExhaustedError(err)) {
      setFirestoreWriteQuotaExceeded(true);
    }
    return false;
  }
}

/**
 * Delete single designation from Firestore
 */
export async function deleteDesignationFromFirestore(id: string): Promise<boolean> {
  if (isFirestoreWriteQuotaExceeded()) {
    return false;
  }

  try {
    const docRef = doc(firestoreDb, 'designations', id);
    await withWriteTimeout(() => deleteDoc(docRef), 2500);
    return true;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.DELETE, `designations/${id}`);
    if (isQuotaExhaustedError(err)) {
      setFirestoreWriteQuotaExceeded(true);
    }
    return false;
  }
}

