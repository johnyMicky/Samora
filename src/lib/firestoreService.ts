// =========================================================================
// BAFIN SOLUTION — CLOUD FIRESTORE SERVICE ENGINE
// Supports real Firestore collections with multi-tenant client data isolation:
// - users
// - cases
// - wallets
// - bankAccounts
// - paymentMethods (Cards — PCI-safe metadata only, NO raw PAN, NO CVV)
// - transactions
// - documents
// - withdrawalRequests
// - activityLogs
// =========================================================================

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  Timestamp,
  type DocumentData 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { 
  FinancialSource, 
  UserRole, 
  CaseStatus, 
  TransactionStatus 
} from './demoData';

// Firestore User Document Structure (Step 3)
export interface FirestoreUserProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'client' | 'super_admin';
  status: 'active' | 'disabled';
  language: 'en' | 'de';
  phone?: string;
  country?: string;
  createdAt: any;
  updatedAt: any;
}

// Load all real user profiles for the Admin > Clients / Users table.
// Firestore Security Rules restrict this collection-wide read to administrators.
export const firestoreGetAllUserProfiles = async (): Promise<FirestoreUserProfile[]> => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({
    ...(d.data() as FirestoreUserProfile),
    uid: (d.data().uid as string | undefined) || d.id
  }));
};

// 1. USER PROFILES
export const firestoreGetUserProfile = async (uid: string): Promise<FirestoreUserProfile | null> => {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as FirestoreUserProfile;
  } catch (err) {
    console.warn('Firestore: Error fetching user profile:', err);
    return null;
  }
};

export const firestoreSetUserProfile = async (uid: string, profile: Partial<FirestoreUserProfile>): Promise<void> => {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, {
    ...profile,
    uid,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

// 2. CRYPTO WALLETS (Step 6)
export interface FirestoreWallet {
  id?: string;
  clientId: string;
  asset: string;
  network: string;
  walletAddress: string;
  label?: string;
  source: FinancialSource;
  status: string;
  balance?: number;
  createdAt: any;
  updatedAt: any;
}

export const firestoreGetWalletsForClient = async (clientId: string): Promise<FirestoreWallet[]> => {
  try {
    const q = query(collection(db, 'wallets'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreWallet));
  } catch (err) {
    console.warn('Firestore: Could not fetch wallets:', err);
    return [];
  }
};

export const firestoreAddWallet = async (wallet: Omit<FirestoreWallet, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'wallets'), {
    ...wallet,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
};

export const firestoreUpdateWallet = async (walletId: string, updates: Partial<FirestoreWallet>): Promise<void> => {
  const ref = doc(db, 'wallets', walletId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const firestoreDeleteWallet = async (walletId: string): Promise<void> => {
  await deleteDoc(doc(db, 'wallets', walletId));
};

// 3. BANK ACCOUNTS (Step 6)
export interface FirestoreBankAccount {
  id?: string;
  clientId: string;
  accountHolder: string;
  bankName: string;
  country: string;
  iban: string;
  swiftBic: string;
  currency?: string;
  label?: string;
  source: FinancialSource;
  status: string;
  createdAt: any;
  updatedAt: any;
}

export const firestoreGetBankAccountsForClient = async (clientId: string): Promise<FirestoreBankAccount[]> => {
  try {
    const q = query(collection(db, 'bankAccounts'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreBankAccount));
  } catch (err) {
    console.warn('Firestore: Could not fetch bank accounts:', err);
    return [];
  }
};

export const firestoreAddBankAccount = async (bank: Omit<FirestoreBankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'bankAccounts'), {
    ...bank,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
};

export const firestoreUpdateBankAccount = async (bankId: string, updates: Partial<FirestoreBankAccount>): Promise<void> => {
  const ref = doc(db, 'bankAccounts', bankId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const firestoreDeleteBankAccount = async (bankId: string): Promise<void> => {
  await deleteDoc(doc(db, 'bankAccounts', bankId));
};

// 4. PAYMENT METHODS / CARDS (Step 7 — STRICT PCI COMPLIANCE)
// CRITICAL SECURITY RULE: NEVER STORE CVV/CVC, RAW PAN, PINs OR SENSITIVE DATA.
export interface FirestorePaymentCard {
  id?: string;
  clientId: string;
  brand: 'Visa' | 'Mastercard';
  last4: string; // ONLY representative last 4 digits
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  billingCountry: string;
  label?: string;
  source: FinancialSource;
  status: 'Active' | 'Verified' | 'Pending';
  createdAt: any;
  updatedAt: any;
}

export const firestoreGetPaymentCardsForClient = async (clientId: string): Promise<FirestorePaymentCard[]> => {
  try {
    const q = query(collection(db, 'paymentMethods'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestorePaymentCard));
  } catch (err) {
    console.warn('Firestore: Could not fetch payment cards:', err);
    return [];
  }
};

export const firestoreAddPaymentCard = async (card: Omit<FirestorePaymentCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // Ensure strict safety: only allow safe metadata properties
  const safeData = {
    clientId: card.clientId,
    brand: card.brand,
    last4: card.last4.slice(-4),
    cardholderName: card.cardholderName.trim(),
    expiryMonth: card.expiryMonth.padStart(2, '0'),
    expiryYear: card.expiryYear.slice(-2),
    billingCountry: card.billingCountry.trim(),
    label: card.label?.trim() || null,
    source: card.source,
    status: card.status || 'Active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'paymentMethods'), safeData);
  return ref.id;
};

export const firestoreDeletePaymentCard = async (cardId: string): Promise<void> => {
  await deleteDoc(doc(db, 'paymentMethods', cardId));
};

// 5. WITHDRAWAL REQUESTS (Step 8)
export interface FirestoreWithdrawalRequest {
  id?: string;
  clientId: string;
  amount: number;
  currency: string;
  destinationType: string;
  destinationId: string;
  destinationDetails?: string;
  note?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  adminComment?: string;
  createdAt: any;
  updatedAt: any;
}

export const firestoreGetWithdrawalRequests = async (clientId?: string): Promise<FirestoreWithdrawalRequest[]> => {
  try {
    const baseColl = collection(db, 'withdrawalRequests');
    const q = clientId 
      ? query(baseColl, where('clientId', '==', clientId))
      : query(baseColl, orderBy('createdAt', 'desc'));
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreWithdrawalRequest));
  } catch (err) {
    console.warn('Firestore: Could not fetch withdrawal requests:', err);
    return [];
  }
};

export const firestoreCreateWithdrawalRequest = async (
  request: Omit<FirestoreWithdrawalRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const ref = await addDoc(collection(db, 'withdrawalRequests'), {
    ...request,
    status: 'pending', // Client submissions are strictly pending by default
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
};

export const firestoreUpdateWithdrawalRequestStatus = async (
  requestId: string,
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed',
  adminComment?: string
): Promise<void> => {
  const ref = doc(db, 'withdrawalRequests', requestId);
  const data: Record<string, any> = {
    status,
    updatedAt: serverTimestamp()
  };
  if (adminComment !== undefined) {
    data.adminComment = adminComment;
  }
  await updateDoc(ref, data);
};

// 6. CASES (Step 4 & 9)
export interface FirestoreCase {
  id?: string;
  clientId: string;
  caseNumber: string;
  title: string;
  status: CaseStatus;
  dateCreated: string;
  lossAmount?: string;
  platform?: string;
  notes?: string;
  createdAt: any;
  updatedAt: any;
}

export const firestoreGetCasesForClient = async (clientId: string): Promise<FirestoreCase[]> => {
  try {
    const q = query(collection(db, 'cases'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreCase));
  } catch (err) {
    console.warn('Firestore: Could not fetch cases:', err);
    return [];
  }
};

export const firestoreGetAllCases = async (): Promise<FirestoreCase[]> => {
  try {
    const snap = await getDocs(collection(db, 'cases'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreCase));
  } catch (err) {
    console.warn('Firestore: Could not fetch all cases:', err);
    return [];
  }
};

// 7. TRANSACTIONS (Step 4)
export interface FirestoreTransaction {
  id?: string;
  clientId: string;
  transactionId: string;
  type: string;
  amount: number;
  currency: string;
  destinationType: string;
  destinationAddress: string;
  status: TransactionStatus;
  date: string;
  adminComment?: string;
  createdAt: any;
  updatedAt: any;
}

export const firestoreGetTransactionsForClient = async (clientId: string): Promise<FirestoreTransaction[]> => {
  try {
    const q = query(collection(db, 'transactions'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreTransaction));
  } catch (err) {
    console.warn('Firestore: Could not fetch transactions:', err);
    return [];
  }
};

// 8. DOCUMENTS (Step 4)
export interface FirestoreDocument {
  id?: string;
  clientId: string;
  caseNumber: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'Under Review' | 'Verified' | 'Rejected';
  category?: string;
  createdAt: any;
  updatedAt: any;
}

export const firestoreGetDocumentsForClient = async (clientId: string): Promise<FirestoreDocument[]> => {
  try {
    const q = query(collection(db, 'documents'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreDocument));
  } catch (err) {
    console.warn('Firestore: Could not fetch documents:', err);
    return [];
  }
};

// 9. ACTIVITY LOGS (Step 4 & 9)
export interface FirestoreActivityLog {
  id?: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  targetId?: string;
  targetType?: string;
  timestamp: any;
  details?: string;
}

export const firestoreLogActivity = async (log: Omit<FirestoreActivityLog, 'id' | 'timestamp'>): Promise<void> => {
  try {
    await addDoc(collection(db, 'activityLogs'), {
      ...log,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.warn('Firestore: Could not log activity:', err);
  }
};
