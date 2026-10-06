import { initializeApp, deleteApp } from 'firebase/app';
import { firebaseConfig } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  getAuth,
  type Auth,
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  type Firestore 
} from 'firebase/firestore';
import { app, auth, db } from '../firebase';

export type UserRole = 'client' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  role: UserRole;
  status: 'active' | 'disabled' | 'suspended';
  language: 'en' | 'de';
  createdAt: string;
}

// Firebase Web SDK integration is active
export const isFirebaseConfigured = true;

export { app, auth, db };

// =========================================================================
// FIREBASE ERROR FORMATTER (Step: Clean Error Handling)
// Normalizes raw Firebase SDK error codes into friendly user messages
// =========================================================================
export const formatFirebaseError = (err: any): string => {
  if (!err) return 'An unexpected error occurred. Please try again.';

  if (typeof err.message === 'string') {
    if (
      err.message.includes('User profile does not exist') ||
      err.message.includes('deactivated') ||
      err.message.includes('inactive') ||
      err.message.includes('administrator')
    ) {
      return err.message;
    }
  }

  const code = err.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please provide a valid email address.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to many failed login attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact an administrator.';
    case 'permission-denied':
      return 'Access denied. You do not have permission to access this data.';
    case 'unavailable':
      return 'Authentication service is temporarily unavailable. Please try again shortly.';
    default:
      if (err.message && !err.message.includes('Firebase:')) {
        return err.message;
      }
      return 'Authentication failed. Please verify your credentials and try again.';
  }
};

// =========================================================================
// USER REGISTRATION
// Creates account with Firebase Authentication and stores user document in Firestore.
// STRICT SECURITY REQUIREMENT:
// Public registration MUST NEVER be able to choose or create role: "admin" or "super_admin".
// Role is permanently hardcoded as "client" and status is "active".
// =========================================================================
export const registerUser = async (
  email: string,
  pass: string,
  details: {
    firstName: string;
    lastName: string;
    phone?: string;
    country?: string;
    language?: 'en' | 'de';
  }
): Promise<UserProfile> => {
  const normalizedEmail = email.trim().toLowerCase();
  const firstName = details.firstName.trim();
  const lastName = details.lastName.trim();
  const displayName = `${firstName} ${lastName}`.trim() || 'Client';
  const language = details.language === 'de' ? 'de' : 'en';

  try {
    // 1. Create account with Firebase Authentication
    const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
    const user = credential.user;

    // 2. Create users/{uid} document in Cloud Firestore
    const userDocData = {
      uid: user.uid,
      email: user.email || normalizedEmail,
      displayName,
      firstName,
      lastName,
      phone: details.phone?.trim() || '',
      country: details.country?.trim() || '',
      role: 'client' as const, // STRICT SECURITY: Always "client"
      status: 'active' as const,
      language,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', user.uid), userDocData);

    const profile: UserProfile = {
      id: user.uid,
      email: user.email || normalizedEmail,
      displayName,
      firstName,
      lastName,
      phone: details.phone?.trim() || '',
      country: details.country?.trim() || '',
      role: 'client',
      status: 'active',
      language,
      createdAt: new Date().toISOString()
    };

    authSubscribers.forEach(cb => cb(profile));
    return profile;
  } catch (err: any) {
    throw new Error(formatFirebaseError(err));
  }
};



// =========================================================================
// ADMIN-PROVISIONED ACCOUNT CREATION
// Uses an isolated secondary Firebase Auth instance so creating a new account
// does NOT replace/log out the currently signed-in administrator.
// Firestore rules remain the authority for which roles the current admin may create.
// =========================================================================
export const createManagedFirebaseUser = async (details: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'admin' | 'super_admin';
  status: 'active' | 'disabled';
  phone?: string;
  country?: string;
}): Promise<string> => {
  const secondaryApp = initializeApp(firebaseConfig, `admin-provision-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      details.email.trim().toLowerCase(),
      details.password
    );
    const uid = credential.user.uid;
    const firstName = details.firstName.trim();
    const lastName = details.lastName.trim();
    await setDoc(doc(db, 'users', uid), {
      uid,
      email: details.email.trim().toLowerCase(),
      displayName: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      role: details.role,
      status: details.status,
      language: 'en',
      phone: details.phone?.trim() || '',
      country: details.country?.trim() || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    await signOut(secondaryAuth);
    return uid;
  } catch (err: any) {
    throw new Error(formatFirebaseError(err));
  } finally {
    await deleteApp(secondaryApp).catch(() => undefined);
  }
};

// =========================================================================
// USER LOGIN
// Authenticates with Firebase Authentication via signInWithEmailAndPassword().
// Reads users/{uid} from Cloud Firestore to obtain role and status.
// Enforces status == "active" and trusted role routing.
// =========================================================================
export const loginUser = async (email: string, pass: string): Promise<UserProfile> => {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 1. Authenticate with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
    const user = userCredential.user;

    // 2. Read users/{firebaseAuthUser.uid} from Cloud Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    // 3. Deny portal access if Firestore user document does not exist
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error('User profile does not exist in the database. Please contact an administrator.');
    }

    const data = userDoc.data();

    // 4. Check user status — status must be "active"
    if (data.status !== 'active') {
      await signOut(auth);
      throw new Error(
        data.status === 'disabled'
          ? 'Your account has been deactivated. Please contact an administrator.'
          : 'Your account is currently inactive. Please contact an administrator.'
      );
    }

    // 5. Determine role strictly from trusted Firestore document (never from email address)
    const role: UserRole = (data.role === 'admin' || data.role === 'super_admin') ? data.role : 'client';
    const displayName = data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || user.email?.split('@')[0] || 'User';

    const profile: UserProfile = {
      id: user.uid,
      email: user.email || normalizedEmail,
      displayName,
      firstName: data.firstName || displayName.split(' ')[0] || 'User',
      lastName: data.lastName || displayName.split(' ').slice(1).join(' ') || '',
      phone: data.phone || '',
      country: data.country || '',
      role,
      status: 'active',
      language: data.language === 'de' ? 'de' : 'en',
      createdAt: data.createdAt 
        ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : String(data.createdAt))
        : new Date().toISOString()
    };

    authSubscribers.forEach(cb => cb(profile));
    return profile;
  } catch (err: any) {
    throw new Error(formatFirebaseError(err));
  }
};

// =========================================================================
// USER LOGOUT
// Connects to Firebase signOut() and clears local state
// =========================================================================
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signout notice:', err);
  }
  authSubscribers.forEach(cb => cb(null));
};

// =========================================================================
// AUTH STATE LISTENER (onAuthStateChanged)
// Survives page refresh and verifies Firestore profile before granting access.
// While Firebase is verifying credentials, AuthContext exposes loading = true
// so an appropriate loading screen is rendered instead of flashing the wrong portal.
// =========================================================================
type AuthCallback = (user: UserProfile | null) => void;
const authSubscribers: AuthCallback[] = [];

export const subscribeToAuth = (callback: AuthCallback): (() => void) => {
  authSubscribers.push(callback);

  const unsubscribeFirebase = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      // Live Support intentionally uses Firebase Anonymous Auth for public visitors.
      // Anonymous visitors do not have a users/{uid} portal profile and MUST NOT be
      // signed out here, otherwise the live-chat Firestore write loses authentication
      // while it is being created and the UI can remain stuck on "Starting…".
      if (fbUser.isAnonymous) {
        callback(null);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await signOut(auth);
          callback(null);
          return;
        }

        const data = userDoc.data();
        if (data.status !== 'active') {
          await signOut(auth);
          callback(null);
          return;
        }

        const role: UserRole = (data.role === 'admin' || data.role === 'super_admin') ? data.role : 'client';
        const displayName = data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || fbUser.email?.split('@')[0] || 'User';

        const prof: UserProfile = {
          id: fbUser.uid,
          email: fbUser.email || data.email || '',
          displayName,
          firstName: data.firstName || displayName.split(' ')[0] || 'User',
          lastName: data.lastName || displayName.split(' ').slice(1).join(' ') || '',
          phone: data.phone || '',
          country: data.country || '',
          role,
          status: 'active',
          language: data.language === 'de' ? 'de' : 'en',
          createdAt: data.createdAt 
            ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : String(data.createdAt))
            : new Date().toISOString()
        };

        callback(prof);
      } catch (err) {
        console.warn('Firestore user fetch on auth change notice:', err);
        callback(null);
      }
    } else {
      callback(null);
    }
  });

  return () => {
    unsubscribeFirebase();
    const idx = authSubscribers.indexOf(callback);
    if (idx !== -1) authSubscribers.splice(idx, 1);
  };
};
