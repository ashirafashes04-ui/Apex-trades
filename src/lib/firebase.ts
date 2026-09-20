import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, setDoc, DocumentReference, SetOptions, disableNetwork, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfigData from '../../firebase-applet-config.json';

// Silence Firestore internal loggers so quota retries do not spam the console
try {
  setLogLevel('silent');
} catch (e) {}

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId || undefined,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with databaseId if specified
export const db = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

const getTodayKey = () => new Date().toISOString().slice(0, 10);

// Check if quota was previously marked as exhausted today
let isQuotaExhausted = false;
if (typeof window !== 'undefined') {
  try {
    const savedQuotaDate = localStorage.getItem('firestore_quota_date');
    if (savedQuotaDate === getTodayKey() || localStorage.getItem('firestore_quota_exhausted') === 'true') {
      isQuotaExhausted = true;
      disableNetwork(db).catch(() => {});
    }
  } catch (e) {}
}

export function isFirestoreQuotaExhausted(): boolean {
  return isQuotaExhausted;
}

export function markQuotaExhausted(): void {
  if (isQuotaExhausted) return;
  isQuotaExhausted = true;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('firestore_quota_date', getTodayKey());
      localStorage.setItem('firestore_quota_exhausted', 'true');
      sessionStorage.setItem('firestore_quota_exhausted', 'true');
    } catch (e) {}
  }
  disableNetwork(db).catch(() => {});
}

// Global filter to catch any rogue background Firestore quota errors from console and unhandled rejections
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const fullText = args.map(a => String(a?.message || a || '')).join(' ');
    if (
      fullText.includes('resource-exhausted') ||
      fullText.includes('Quota limit exceeded') ||
      fullText.includes('maximum backoff delay')
    ) {
      markQuotaExhausted();
      return;
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = String(reason?.message || reason || '');
    if (msg.includes('resource-exhausted') || msg.includes('Quota limit exceeded')) {
      event.preventDefault();
      markQuotaExhausted();
    }
  });
}

/**
 * Safe wrapper around setDoc that catches quota-exhausted errors and prevents
 * spamming the Firestore backend with failing retry requests.
 */
export async function safeSetDoc(
  docRef: DocumentReference,
  data: any,
  options?: SetOptions
): Promise<void> {
  if (isQuotaExhausted) {
    return;
  }

  try {
    if (options) {
      await setDoc(docRef, data, options);
    } else {
      await setDoc(docRef, data);
    }
  } catch (err: any) {
    const errorStr = (err?.message || err?.code || String(err)).toLowerCase();
    if (errorStr.includes('quota') || errorStr.includes('resource-exhausted') || err?.code === 'resource-exhausted') {
      markQuotaExhausted();
      return;
    }
  }
}

export default app;

