import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// =========================================================================
// BAFIN SOLUTION — OFFICIAL FIREBASE WEB CONFIGURATION
// Project: samora-d031e
// Region: europe-west10 (Berlin)
// =========================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyDdtYCncqx0UuueBmPX0Mxg0GhEWWQL4XQ",
  authDomain: "samora-d031e.firebaseapp.com",
  projectId: "samora-d031e",
  storageBucket: "samora-d031e.firebasestorage.app",
  messagingSenderId: "307877932974",
  appId: "1:307877932974:web:7de69a53aa09037b4da23f"
};

// Singleton initialization — ensures Firebase is initialized only once
export const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export default app;
