import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  type UserProfile, 
  registerUser, 
  loginUser, 
  logoutUser, 
  subscribeToAuth, 
  isFirebaseConfigured 
} from '../lib/firebase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  register: (
    email: string, 
    pass: string, 
    details: { firstName: string; lastName: string; phone?: string; country?: string; language?: 'en' | 'de' }
  ) => Promise<UserProfile>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirebaseConfigured: false,
  login: async () => { throw new Error('AuthContext not initialized'); },
  register: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => {},
  isAdmin: false,
  isSuperAdmin: false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, pass: string): Promise<UserProfile> => {
    const profile = await loginUser(email, pass);
    setUser(profile);
    return profile;
  };

  const handleRegister = async (
    email: string, 
    pass: string, 
    details: { firstName: string; lastName: string; phone?: string; country?: string; language?: 'en' | 'de' }
  ): Promise<UserProfile> => {
    const profile = await registerUser(email, pass, details);
    setUser(profile);
    return profile;
  };

  const handleLogout = async (): Promise<void> => {
    await logoutUser();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    isFirebaseConfigured,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isSuperAdmin: user?.role === 'super_admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
