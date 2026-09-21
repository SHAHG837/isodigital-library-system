import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { OfficeBearer, Designation, Member } from '../types';
import { IsoDatabaseSnapshot } from '../services/databaseService';

// Safely initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore using the configured user firestoreDatabaseId
export const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
    console.warn('[FIRESTORE] Warning fetching master database snapshot:', err?.message);
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
    console.warn('[FIRESTORE] Warning fetching office_bearers collection:', err?.message);
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
    console.warn('[FIRESTORE] Warning fetching designations collection:', err?.message);
    return [];
  }
}

/**
 * Save master snapshot to Firestore
 */
export async function saveMasterDatabaseToFirestore(snapshot: IsoDatabaseSnapshot): Promise<boolean> {
  try {
    const masterDocRef = doc(firestoreDb, 'system_state', 'master_database');
    const cleaned = cleanForFirestore({
      ...snapshot,
      updatedAt: new Date().toISOString()
    });
    await setDoc(masterDocRef, cleaned, { merge: true });
    return true;
  } catch (err: any) {
    console.error('[FIRESTORE] Failed to save master database snapshot to Firestore:', err?.message);
    return false;
  }
}

/**
 * Save single member to Firestore
 */
export async function saveMemberToFirestore(member: Member): Promise<boolean> {
  try {
    const docRef = doc(firestoreDb, 'members', member.id);
    const cleaned = cleanForFirestore(member);
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (err: any) {
    console.error(`[FIRESTORE] Failed to save member ${member.id} to Firestore:`, err?.message);
    return false;
  }
}

/**
 * Save single office bearer to Firestore
 */
export async function saveOfficeBearerToFirestore(bearer: OfficeBearer): Promise<boolean> {
  try {
    const docRef = doc(firestoreDb, 'office_bearers', bearer.id);
    const cleaned = cleanForFirestore(bearer);
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (err: any) {
    console.error(`[FIRESTORE] Failed to save office bearer ${bearer.id} to Firestore:`, err?.message);
    return false;
  }
}

/**
 * Delete single office bearer from Firestore
 */
export async function deleteOfficeBearerFromFirestore(id: string): Promise<boolean> {
  try {
    const docRef = doc(firestoreDb, 'office_bearers', id);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    console.error(`[FIRESTORE] Failed to delete office bearer ${id} from Firestore:`, err?.message);
    return false;
  }
}

/**
 * Save single designation to Firestore
 */
export async function saveDesignationToFirestore(designation: Designation): Promise<boolean> {
  try {
    const docRef = doc(firestoreDb, 'designations', designation.id);
    const cleaned = cleanForFirestore(designation);
    await setDoc(docRef, cleaned, { merge: true });
    return true;
  } catch (err: any) {
    console.error(`[FIRESTORE] Failed to save designation ${designation.id} to Firestore:`, err?.message);
    return false;
  }
}

/**
 * Delete single designation from Firestore
 */
export async function deleteDesignationFromFirestore(id: string): Promise<boolean> {
  try {
    const docRef = doc(firestoreDb, 'designations', id);
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    console.error(`[FIRESTORE] Failed to delete designation ${id} from Firestore:`, err?.message);
    return false;
  }
}

