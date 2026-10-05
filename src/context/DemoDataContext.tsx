import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  type DemoDatabaseState,
  type ClientProfile,
  type ManagedUserItem,
  type FinanceAsset,
  type BankAccountItem,
  type PayoutCardItem,
  type CaseItem,
  type TransactionItem,
  type DocumentItem,
  type ActivityLogItem,
  type CaseFileStatus,
  type CaseStatus,
  type TransactionStatus,
  type DocumentReviewStatus,
  type FinancialSource,
  type UserRole,
  type UserAccountStatus,
  loadDemoState,
  saveDemoState,
  INITIAL_DEMO_DATA
} from '../lib/demoData';
import {
  firestoreAddWallet,
  firestoreAddBankAccount,
  firestoreAddPaymentCard,
  firestoreCreateWithdrawalRequest,
  firestoreUpdateWithdrawalRequestStatus,
  firestoreLogActivity
} from '../lib/firestoreService';

interface DemoDataContextType {
  state: DemoDatabaseState;
  clients: ClientProfile[];
  users: ManagedUserItem[];
  cases: CaseItem[];
  assets: FinanceAsset[];
  bankAccounts: BankAccountItem[];
  payoutCards: PayoutCardItem[];
  transactions: TransactionItem[];
  documents: DocumentItem[];
  activityLogs: ActivityLogItem[];

  // Selectors
  getClientProfile: (clientId: string) => ClientProfile | undefined;
  getClientAssets: (clientId: string) => FinanceAsset[];
  getClientBankAccounts: (clientId: string) => BankAccountItem[];
  getClientPayoutCards: (clientId: string) => PayoutCardItem[];
  getClientTotalBalance: (clientId: string) => number;
  getClientCases: (clientId: string) => CaseItem[];
  getClientTransactions: (clientId: string) => TransactionItem[];
  getClientDocuments: (clientId: string) => DocumentItem[];
  getClientActivityLogs: (clientId: string) => ActivityLogItem[];

  // Client & Admin Wallet Actions
  addWallet: (
    clientId: string, 
    data: { symbol: string; network: string; walletAddress: string; label?: string; source: FinancialSource },
    actorRole?: UserRole,
    actorName?: string
  ) => Promise<FinanceAsset>;
  updateWallet: (
    walletId: string, 
    updates: Partial<FinanceAsset>, 
    actorRole?: UserRole, 
    actorId?: string,
    actorName?: string
  ) => Promise<void>;
  deleteWallet: (
    walletId: string, 
    actorRole?: UserRole, 
    actorId?: string,
    actorName?: string
  ) => Promise<void>;

  // Bank Account Actions
  addBankAccount: (
    clientId: string,
    data: { accountHolder: string; bankName: string; country: string; iban: string; swiftBic: string; label?: string; paymentDueAmount?: number; paymentDueCurrency?: 'USD' | 'EUR'; paymentReference?: string; source: FinancialSource },
    actorRole?: UserRole,
    actorName?: string
  ) => Promise<BankAccountItem>;
  updateBankAccount: (
    bankId: string,
    updates: Partial<BankAccountItem>,
    actorRole?: UserRole,
    actorId?: string,
    actorName?: string
  ) => Promise<void>;
  deleteBankAccount: (
    bankId: string,
    actorRole?: UserRole,
    actorId?: string,
    actorName?: string
  ) => Promise<void>;

  // Card / Payout Method Actions (Safe Demo Representation)
  addPayoutCard: (
    clientId: string,
    data: { cardholderName: string; cardBrand: 'Visa' | 'Mastercard'; last4: string; expiryMonth: string; expiryYear: string; billingCountry: string; label?: string; source: FinancialSource },
    actorRole?: UserRole,
    actorName?: string
  ) => Promise<PayoutCardItem>;
  updatePayoutCard: (
    cardId: string,
    updates: Partial<PayoutCardItem>,
    actorRole?: UserRole,
    actorId?: string,
    actorName?: string
  ) => Promise<void>;
  deletePayoutCard: (
    cardId: string,
    actorRole?: UserRole,
    actorId?: string,
    actorName?: string
  ) => Promise<void>;

  // Withdrawal Request
  requestWithdrawal: (
    clientId: string, 
    assetSymbol: string, 
    network: string,
    amount: number, 
    destinationType: 'Crypto Wallet' | 'Bank Account' | 'Card / Payout Method', 
    destinationAddress: string, 
    destinationDetails?: string,
    destinationSource?: FinancialSource,
    note?: string,
    actorName?: string
  ) => Promise<TransactionItem>;

  // Document Upload
  uploadDocument: (
    clientId: string,
    name: string,
    fileType: string,
    fileSize: string,
    caseNumber: string,
    actorName?: string
  ) => Promise<DocumentItem>;

  // User Management (Admin Console)
  createManagedUser: (
    userData: { firstName: string; lastName: string; email: string; role: UserRole; status: UserAccountStatus; phone?: string; country?: string; temporaryPassword?: string },
    actorRole: UserRole,
    actorName: string
  ) => Promise<ManagedUserItem>;
  updateManagedUserStatus: (
    userId: string,
    status: UserAccountStatus,
    actorRole: UserRole,
    actorName: string
  ) => Promise<void>;
  updateManagedUser: (
    userId: string,
    updates: Partial<ManagedUserItem>,
    actorRole: UserRole,
    actorName: string
  ) => Promise<void>;

  // Case & Legacy Asset Management (Admin Console)
  updateClientCaseFileStatus: (clientId: string, status: CaseFileStatus, actorName?: string) => void;
  updateTotalBalanceComment: (clientId: string, comment: string, actorName?: string) => void;
  updateClientBank: (
    clientId: string, 
    data: { bankName: string; bankAccountHolder: string; bankIban: string; bankStatus: 'Verified' | 'Pending' | 'Rejected'; bankComment?: string },
    actorName?: string
  ) => void;
  addAsset: (clientId: string, asset: Omit<FinanceAsset, 'id' | 'clientId' | 'updatedAt'>, actorName?: string) => void;
  updateAsset: (assetId: string, updates: Partial<FinanceAsset>, actorName?: string) => void;
  deleteAsset: (assetId: string, actorName?: string) => void;
  createCase: (clientId: string, caseNumber: string, status: CaseStatus, adminNote: string, actorName?: string) => void;
  updateCase: (caseId: string, updates: Partial<CaseItem>, actorName?: string) => void;
  deleteCase: (caseId: string, actorName?: string) => void;
  approveTransaction: (transactionId: string, actorName?: string) => void;
  rejectTransaction: (transactionId: string, reason: string, actorName?: string) => void;
  updateDocumentStatus: (documentId: string, status: DocumentReviewStatus, adminNote?: string, actorName?: string) => void;
  resetToInitial: () => void;
}

const DemoDataContext = createContext<DemoDataContextType | null>(null);

export const DemoDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DemoDatabaseState>(() => loadDemoState());

  useEffect(() => {
    const handleStorage = () => {
      setState(loadDemoState());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('bafin_demo_state_change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('bafin_demo_state_change', handleStorage);
    };
  }, []);

  const updateState = (updater: (prev: DemoDatabaseState) => DemoDatabaseState) => {
    setState((prev) => {
      const next = updater(prev);
      saveDemoState(next);
      return next;
    });
  };

  const getClientProfile = (clientId: string) => {
    return state.clients.find(c => c.id === clientId || c.email === clientId);
  };

  const getClientAssets = (clientId: string) => {
    return state.assets.filter(a => a.clientId === clientId);
  };

  const getClientBankAccounts = (clientId: string) => {
    return state.bankAccounts.filter(b => b.clientId === clientId);
  };

  const getClientPayoutCards = (clientId: string) => {
    return state.payoutCards.filter(c => c.clientId === clientId);
  };

  const getClientTotalBalance = (clientId: string) => {
    const clientAssets = state.assets.filter(a => a.clientId === clientId);
    return clientAssets.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  };

  const getClientCases = (clientId: string) => {
    return state.cases.filter(c => c.clientId === clientId);
  };

  const getClientTransactions = (clientId: string) => {
    return state.transactions.filter(t => t.clientId === clientId);
  };

  const getClientDocuments = (clientId: string) => {
    return state.documents.filter(d => d.clientId === clientId);
  };

  const getClientActivityLogs = (clientId: string) => {
    return state.activityLogs.filter(l => l.clientId === clientId);
  };

  const createActivityLog = (
    action: string, 
    clientName: string, 
    clientId: string, 
    actor?: string, 
    previousValue?: string, 
    newValue?: string
  ): ActivityLogItem => ({
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    clientName,
    clientId,
    actor: actor || 'System',
    timestamp: new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    previousValue,
    newValue
  });

  // =========================================================================
  // WALLET ACTIONS (Unified Client & Admin)
  // =========================================================================
  const addWallet = async (
    clientId: string,
    data: { symbol: string; network: string; walletAddress: string; label?: string; source: FinancialSource },
    actorRole: UserRole = 'client',
    actorName: string = 'Demo Client'
  ): Promise<FinanceAsset> => {
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const targetClient = state.clients.find(c => c.id === clientId);
    const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

    const newAsset: FinanceAsset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientId,
      symbol: data.symbol.toUpperCase().trim(),
      name: data.symbol.toUpperCase().trim() === 'USDT' ? 'Tether USD' : (data.symbol.toUpperCase().trim() === 'BTC' ? 'Bitcoin' : data.symbol.toUpperCase().trim()),
      network: data.network.trim(),
      balance: 0.00, // Newly added payout wallet does not alter current recorded asset balance
      walletAddress: data.walletAddress.trim(),
      label: data.label?.trim() || undefined,
      source: data.source,
      createdBy: actorName,
      createdByRole: actorRole,
      comment: data.source === 'client' ? 'Client-added external payout wallet.' : 'Admin-assigned wallet endpoint.',
      createdAt: nowStr,
      updatedAt: nowStr
    };

    updateState((prev) => {
      const log = createActivityLog(
        `${actorName} added ${newAsset.symbol} ${newAsset.network} wallet.`,
        clientName,
        clientId,
        actorName,
        undefined,
        `${newAsset.walletAddress} (${newAsset.label || 'No label'})`
      );
      return {
        ...prev,
        assets: [newAsset, ...prev.assets],
        activityLogs: [log, ...prev.activityLogs]
      };
    });

    return newAsset;
  };

  const updateWallet = async (
    walletId: string,
    updates: Partial<FinanceAsset>,
    actorRole: UserRole = 'client',
    actorId?: string,
    actorName: string = 'User'
  ): Promise<void> => {
    updateState((prev) => {
      const existing = prev.assets.find(a => a.id === walletId);
      if (!existing) return prev;

      // Security check: Client can only modify accounts they personally created
      if (actorRole === 'client' && existing.source === 'admin') {
        throw new Error('Unauthorized: Client cannot modify Admin-assigned accounts.');
      }

      const updatedAssets = prev.assets.map(a => 
        a.id === walletId ? { 
          ...a, 
          ...updates, 
          updatedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
        } : a
      );

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} updated ${existing.symbol} wallet.`,
        clientName,
        existing.clientId,
        actorName,
        existing.walletAddress,
        updates.walletAddress || existing.walletAddress
      );

      return {
        ...prev,
        assets: updatedAssets,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const deleteWallet = async (
    walletId: string,
    actorRole: UserRole = 'client',
    actorId?: string,
    actorName: string = 'User'
  ): Promise<void> => {
    updateState((prev) => {
      const existing = prev.assets.find(a => a.id === walletId);
      if (!existing) return prev;

      // Security check: Client can only delete accounts they personally created
      if (actorRole === 'client' && existing.source === 'admin') {
        throw new Error('Unauthorized: Client cannot delete Admin-assigned accounts.');
      }

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} removed ${existing.symbol} wallet (${existing.walletAddress.substring(0, 10)}...).`,
        clientName,
        existing.clientId,
        actorName
      );

      return {
        ...prev,
        assets: prev.assets.filter(a => a.id !== walletId),
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  // =========================================================================
  // BANK ACCOUNT ACTIONS (Unified Client & Admin)
  // =========================================================================
  const addBankAccount = async (
    clientId: string,
    data: { accountHolder: string; bankName: string; country: string; iban: string; swiftBic: string; label?: string; paymentDueAmount?: number; paymentDueCurrency?: 'USD' | 'EUR'; paymentReference?: string; source: FinancialSource },
    actorRole: UserRole = 'client',
    actorName: string = 'Demo Client'
  ): Promise<BankAccountItem> => {
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const targetClient = state.clients.find(c => c.id === clientId);
    const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

    const newBank: BankAccountItem = {
      id: `bank-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientId,
      accountHolder: data.accountHolder.trim(),
      bankName: data.bankName.trim(),
      country: data.country.trim(),
      iban: data.iban.trim(),
      swiftBic: data.swiftBic.trim(),
      label: data.label?.trim() || undefined,
      paymentDueAmount: data.paymentDueAmount,
      paymentDueCurrency: data.paymentDueCurrency,
      paymentReference: data.paymentReference?.trim() || undefined,
      status: 'Verified',
      source: data.source,
      createdBy: actorName,
      createdByRole: actorRole,
      comment: data.source === 'client' ? 'Client-added personal bank account.' : 'Admin-verified payout bank account.',
      createdAt: nowStr,
      updatedAt: nowStr
    };

    updateState((prev) => {
      const log = createActivityLog(
        `${actorName} added ${newBank.bankName} account.`,
        clientName,
        clientId,
        actorName,
        undefined,
        `${newBank.iban} (${newBank.label || 'Personal Account'})`
      );
      return {
        ...prev,
        bankAccounts: [newBank, ...prev.bankAccounts],
        activityLogs: [log, ...prev.activityLogs]
      };
    });

    return newBank;
  };

  const updateBankAccount = async (
    bankId: string,
    updates: Partial<BankAccountItem>,
    actorRole: UserRole = 'client',
    actorId?: string,
    actorName: string = 'User'
  ): Promise<void> => {
    updateState((prev) => {
      const existing = prev.bankAccounts.find(b => b.id === bankId);
      if (!existing) return prev;

      if (actorRole === 'client' && existing.source === 'admin') {
        throw new Error('Unauthorized: Client cannot modify Admin-assigned bank accounts.');
      }

      const updatedBanks = prev.bankAccounts.map(b => 
        b.id === bankId ? { 
          ...b, 
          ...updates, 
          updatedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
        } : b
      );

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} updated bank account ${existing.bankName}.`,
        clientName,
        existing.clientId,
        actorName
      );

      return {
        ...prev,
        bankAccounts: updatedBanks,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const deleteBankAccount = async (
    bankId: string,
    actorRole: UserRole = 'client',
    actorId?: string,
    actorName: string = 'User'
  ): Promise<void> => {
    updateState((prev) => {
      const existing = prev.bankAccounts.find(b => b.id === bankId);
      if (!existing) return prev;

      if (actorRole === 'client' && existing.source === 'admin') {
        throw new Error('Unauthorized: Client cannot delete Admin-assigned bank accounts.');
      }

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} removed ${existing.bankName} account (${existing.iban.substring(0, 8)}...).`,
        clientName,
        existing.clientId,
        actorName
      );

      return {
        ...prev,
        bankAccounts: prev.bankAccounts.filter(b => b.id !== bankId),
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  // =========================================================================
  // CARD / PAYOUT METHOD ACTIONS (Safe Demo Representation)
  // =========================================================================
  const addPayoutCard = async (
    clientId: string,
    data: { cardholderName: string; cardBrand: 'Visa' | 'Mastercard'; last4: string; expiryMonth: string; expiryYear: string; billingCountry: string; label?: string; source: FinancialSource },
    actorRole: UserRole = 'client',
    actorName: string = 'Demo Client'
  ): Promise<PayoutCardItem> => {
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const targetClient = state.clients.find(c => c.id === clientId);
    const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

    const cleanLast4 = data.last4.replace(/\D/g, '').slice(-4).padStart(4, '0');

    const newCard: PayoutCardItem = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientId,
      cardholderName: data.cardholderName.trim(),
      cardBrand: data.cardBrand,
      last4: cleanLast4,
      expiryMonth: data.expiryMonth.padStart(2, '0'),
      expiryYear: data.expiryYear.slice(-2),
      billingCountry: data.billingCountry.trim(),
      label: data.label?.trim() || undefined,
      source: data.source,
      createdBy: actorName,
      createdByRole: actorRole,
      status: 'Active',
      comment: data.source === 'client' ? 'Client-added personal payout card.' : 'Admin-assigned payout card.',
      createdAt: nowStr,
      updatedAt: nowStr
    };

    updateState((prev) => {
      const log = createActivityLog(
        `${actorName} added ${newCard.cardBrand} ending in ${cleanLast4}.`,
        clientName,
        clientId,
        actorName,
        undefined,
        `${newCard.cardBrand} •••• ${cleanLast4} (${newCard.label || 'Card'})`
      );
      return {
        ...prev,
        payoutCards: [newCard, ...prev.payoutCards],
        activityLogs: [log, ...prev.activityLogs]
      };
    });

    return newCard;
  };

  const updatePayoutCard = async (
    cardId: string,
    updates: Partial<PayoutCardItem>,
    actorRole: UserRole = 'client',
    actorId?: string,
    actorName: string = 'User'
  ): Promise<void> => {
    updateState((prev) => {
      const existing = prev.payoutCards.find(c => c.id === cardId);
      if (!existing) return prev;

      if (actorRole === 'client' && existing.source === 'admin') {
        throw new Error('Unauthorized: Client cannot modify Admin-assigned payout methods.');
      }

      const updatedCards = prev.payoutCards.map(c => 
        c.id === cardId ? { 
          ...c, 
          ...updates, 
          updatedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
        } : c
      );

      const targetClient = prev.clients.find(cl => cl.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} updated card ending in ${existing.last4}.`,
        clientName,
        existing.clientId,
        actorName
      );

      return {
        ...prev,
        payoutCards: updatedCards,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const deletePayoutCard = async (
    cardId: string,
    actorRole: UserRole = 'client',
    actorId?: string,
    actorName: string = 'User'
  ): Promise<void> => {
    updateState((prev) => {
      const existing = prev.payoutCards.find(c => c.id === cardId);
      if (!existing) return prev;

      if (actorRole === 'client' && existing.source === 'admin') {
        throw new Error('Unauthorized: Client cannot delete Admin-assigned payout methods.');
      }

      const targetClient = prev.clients.find(cl => cl.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} removed ${existing.cardBrand} ending in ${existing.last4}.`,
        clientName,
        existing.clientId,
        actorName
      );

      return {
        ...prev,
        payoutCards: prev.payoutCards.filter(c => c.id !== cardId),
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  // =========================================================================
  // WITHDRAWAL REQUEST (Interactive Flow with Destination Selection)
  // =========================================================================
  const requestWithdrawal = async (
    clientId: string,
    assetSymbol: string,
    network: string,
    amount: number,
    destinationType: 'Crypto Wallet' | 'Bank Account' | 'Card / Payout Method',
    destinationAddress: string,
    destinationDetails?: string,
    destinationSource?: FinancialSource,
    note?: string,
    actorName: string = 'Demo Client'
  ): Promise<TransactionItem> => {
    const txId = `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const newTx: TransactionItem = {
      id: txId,
      clientId,
      type: 'Withdrawal',
      asset: assetSymbol.toUpperCase(),
      network,
      amount,
      date: nowStr,
      status: 'Pending',
      destinationType,
      destinationAddress,
      destinationDetails: destinationDetails || destinationAddress,
      destinationSource: destinationSource || 'client',
      note: note || undefined
    };

    const targetClient = state.clients.find(c => c.id === clientId);
    const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

    updateState((prev) => {
      const log = createActivityLog(
        `${actorName} submitted withdrawal ${txId}.`,
        clientName,
        clientId,
        actorName,
        undefined,
        `$${amount.toFixed(2)} ${assetSymbol} to ${destinationDetails || destinationAddress}`
      );

      return {
        ...prev,
        transactions: [newTx, ...prev.transactions],
        activityLogs: [log, ...prev.activityLogs]
      };
    });

    return newTx;
  };

  // =========================================================================
  // USER MANAGEMENT (Admin Console)
  // =========================================================================
  const createManagedUser = async (
    userData: { firstName: string; lastName: string; email: string; role: UserRole; status: UserAccountStatus; phone?: string; country?: string; temporaryPassword?: string },
    actorRole: UserRole,
    actorName: string
  ): Promise<ManagedUserItem> => {
    // Administrators may create Client or Administrator accounts.
    // Only an existing Super Administrator may create another Super Administrator.
    if (userData.role === 'super_admin' && actorRole !== 'super_admin') {
      throw new Error('Unauthorized: Only Super Administrators can create another Super Administrator.');
    }

    const normalizedEmail = userData.email.trim().toLowerCase();
    const existing = state.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const userId = userData.role === 'client' 
      ? `client_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      : `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const nowStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const newUser: ManagedUserItem = {
      id: userId,
      email: normalizedEmail,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      role: userData.role,
      status: userData.status,
      phone: userData.phone?.trim() || '+49 30 00000000',
      country: userData.country?.trim() || 'Germany',
      createdAt: nowStr,
      lastActivity: 'Never',
      temporaryPassword: userData.temporaryPassword?.trim() || undefined
    };

    updateState((prev) => {
      let updatedClients = prev.clients;

      // If creating a client user, register an associated ClientProfile
      if (newUser.role === 'client') {
        const newClientProfile: ClientProfile = {
          id: userId,
          email: normalizedEmail,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          accountStatus: newUser.status === 'Active' ? 'Verified Client Account' : 'Pending Verification',
          phone: newUser.phone || '',
          country: newUser.country || 'Germany',
          caseFileStatus: 'Opened',
          createdAt: nowStr,
          bankName: 'Pending Setup',
          bankAccountHolder: `${newUser.firstName} ${newUser.lastName}`,
          bankIban: 'DE00 **** **** **** 0000',
          bankStatus: 'Pending',
          totalBalanceComment: 'New client account initialized.'
        };
        updatedClients = [newClientProfile, ...prev.clients];
      }

      const roleLabel = newUser.role === 'super_admin' ? 'Super Administrator' : (newUser.role === 'admin' ? 'Administrator' : 'Client');
      const log = createActivityLog(
        `${actorName} created ${roleLabel} ${newUser.firstName} ${newUser.lastName}.`,
        `${newUser.firstName} ${newUser.lastName}`,
        userId,
        actorName,
        undefined,
        `${newUser.email} (${roleLabel})`
      );

      return {
        ...prev,
        users: [newUser, ...prev.users],
        clients: updatedClients,
        activityLogs: [log, ...prev.activityLogs]
      };
    });

    return newUser;
  };

  const updateManagedUserStatus = async (
    userId: string,
    status: UserAccountStatus,
    actorRole: UserRole,
    actorName: string
  ): Promise<void> => {
    updateState((prev) => {
      const targetUser = prev.users.find(u => u.id === userId);
      if (!targetUser) return prev;

      // Guard: Administrator cannot suspend or modify Super Admin accounts
      if (targetUser.role === 'super_admin' && actorRole !== 'super_admin') {
        throw new Error('Unauthorized: Administrator cannot modify a Super Administrator account.');
      }

      const updatedUsers = prev.users.map(u => u.id === userId ? { ...u, status } : u);

      const log = createActivityLog(
        `${actorName} changed ${targetUser.firstName} ${targetUser.lastName} status to ${status}.`,
        `${targetUser.firstName} ${targetUser.lastName}`,
        userId,
        actorName,
        targetUser.status,
        status
      );

      return {
        ...prev,
        users: updatedUsers,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const updateManagedUser = async (
    userId: string,
    updates: Partial<ManagedUserItem>,
    actorRole: UserRole,
    actorName: string
  ): Promise<void> => {
    updateState((prev) => {
      const targetUser = prev.users.find(u => u.id === userId);
      if (!targetUser) return prev;

      if (targetUser.role === 'super_admin' && actorRole !== 'super_admin') {
        throw new Error('Unauthorized: Administrator cannot modify a Super Administrator.');
      }

      const updatedUsers = prev.users.map(u => u.id === userId ? { ...u, ...updates } : u);

      const log = createActivityLog(
        `${actorName} updated user profile for ${targetUser.firstName} ${targetUser.lastName}.`,
        `${targetUser.firstName} ${targetUser.lastName}`,
        userId,
        actorName
      );

      return {
        ...prev,
        users: updatedUsers,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  // =========================================================================
  // DOCUMENT ACTIONS
  // =========================================================================
  const uploadDocument = async (
    clientId: string,
    name: string,
    fileType: string,
    fileSize: string,
    caseNumber: string,
    actorName: string = 'Client'
  ): Promise<DocumentItem> => {
    const docId = `doc-${Date.now()}`;
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const newDoc: DocumentItem = {
      id: docId,
      clientId,
      name,
      fileType,
      fileSize,
      caseNumber,
      uploadDate: nowStr,
      status: 'New',
      adminNote: 'Awaiting administrative verification.'
    };

    const targetClient = state.clients.find(c => c.id === clientId);
    const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

    updateState((prev) => {
      const log = createActivityLog(
        `${actorName} uploaded document "${name}".`,
        clientName,
        clientId,
        actorName,
        undefined,
        `Case ${caseNumber} • ${fileType} (${fileSize})`
      );

      return {
        ...prev,
        documents: [newDoc, ...prev.documents],
        activityLogs: [log, ...prev.activityLogs]
      };
    });

    return newDoc;
  };

  // =========================================================================
  // TRANSACTION APPROVAL & REJECTION (Admin Console)
  // =========================================================================
  const approveTransaction = (transactionId: string, actorName: string = 'System Admin') => {
    updateState((prev) => {
      const existing = prev.transactions.find(t => t.id === transactionId);
      if (!existing) return prev;

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const updatedTransactions = prev.transactions.map(t => 
        t.id === transactionId ? { 
          ...t, 
          status: 'Completed' as TransactionStatus, 
          adminComment: 'Withdrawal approved & processed.' 
        } : t
      );

      const log = createActivityLog(
        `${actorName} approved transaction ${existing.id} for $${existing.amount.toFixed(2)} (${existing.asset}).`,
        clientName,
        existing.clientId,
        actorName,
        'Pending',
        'Completed'
      );

      return {
        ...prev,
        transactions: updatedTransactions,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const rejectTransaction = (transactionId: string, reason: string, actorName: string = 'System Admin') => {
    updateState((prev) => {
      const existing = prev.transactions.find(t => t.id === transactionId);
      if (!existing) return prev;

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const updatedTransactions = prev.transactions.map(t => 
        t.id === transactionId ? { 
          ...t, 
          status: 'Rejected' as TransactionStatus, 
          adminComment: reason.trim() 
        } : t
      );

      const log = createActivityLog(
        `${actorName} rejected withdrawal ${existing.id}.`,
        clientName,
        existing.clientId,
        actorName,
        'Pending',
        `Rejected: ${reason.trim()}`
      );

      return {
        ...prev,
        transactions: updatedTransactions,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  // =========================================================================
  // CASE ACTIONS (Admin Console)
  // =========================================================================
  const createCase = (clientId: string, caseNumber: string, status: CaseStatus, adminNote: string, actorName: string = 'System Admin') => {
    const caseId = `case-${Date.now()}`;
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const newCase: CaseItem = {
      id: caseId,
      clientId,
      caseNumber,
      status,
      createdDate: nowStr,
      lastUpdated: nowStr,
      adminNote
    };

    updateState((prev) => {
      const targetClient = prev.clients.find(c => c.id === clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} assigned new Case ${caseNumber} (${status}).`,
        clientName,
        clientId,
        actorName,
        undefined,
        caseNumber
      );

      return {
        ...prev,
        cases: [newCase, ...prev.cases],
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const updateCase = (caseId: string, updates: Partial<CaseItem>, actorName: string = 'System Admin') => {
    updateState((prev) => {
      const existing = prev.cases.find(c => c.id === caseId);
      if (!existing) return prev;

      const updatedCases = prev.cases.map(c => 
        c.id === caseId ? { 
          ...c, 
          ...updates, 
          lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
        } : c
      );

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} changed Case ${existing.caseNumber} status.`,
        clientName,
        existing.clientId,
        actorName,
        existing.status,
        updates.status || existing.status
      );

      return {
        ...prev,
        cases: updatedCases,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const deleteCase = (caseId: string, actorName: string = 'System Admin') => {
    updateState((prev) => {
      const existing = prev.cases.find(c => c.id === caseId);
      if (!existing) return prev;

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} removed Case ${existing.caseNumber}.`,
        clientName,
        existing.clientId,
        actorName
      );

      return {
        ...prev,
        cases: prev.cases.filter(c => c.id !== caseId),
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  // =========================================================================
  // OTHER ADMIN ACTIONS
  // =========================================================================
  const updateClientCaseFileStatus = (clientId: string, status: CaseFileStatus, actorName: string = 'System Admin') => {
    updateState((prev) => {
      const targetClient = prev.clients.find(c => c.id === clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';
      const prevStatus = targetClient ? targetClient.caseFileStatus : 'Unknown';

      const updatedClients = prev.clients.map(c => 
        c.id === clientId ? { ...c, caseFileStatus: status } : c
      );

      const log = createActivityLog(
        `${actorName} updated Case File Status to ${status}.`,
        clientName,
        clientId,
        actorName,
        prevStatus,
        status
      );

      return {
        ...prev,
        clients: updatedClients,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const updateTotalBalanceComment = (clientId: string, comment: string, actorName: string = 'System Admin') => {
    updateState((prev) => {
      const targetClient = prev.clients.find(c => c.id === clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const updatedClients = prev.clients.map(c => 
        c.id === clientId ? { ...c, totalBalanceComment: comment } : c
      );

      const log = createActivityLog(
        `${actorName} updated Total Balance commentary.`,
        clientName,
        clientId,
        actorName
      );

      return {
        ...prev,
        clients: updatedClients,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const updateClientBank = (
    clientId: string, 
    data: { bankName: string; bankAccountHolder: string; bankIban: string; bankStatus: 'Verified' | 'Pending' | 'Rejected'; bankComment?: string },
    actorName: string = 'System Admin'
  ) => {
    updateState((prev) => {
      const targetClient = prev.clients.find(c => c.id === clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const updatedClients = prev.clients.map(c => 
        c.id === clientId ? { 
          ...c, 
          bankName: data.bankName,
          bankAccountHolder: data.bankAccountHolder,
          bankIban: data.bankIban,
          bankStatus: data.bankStatus,
          bankComment: data.bankComment
        } : c
      );

      const log = createActivityLog(
        `${actorName} updated primary bank information for ${clientName}.`,
        clientName,
        clientId,
        actorName
      );

      return {
        ...prev,
        clients: updatedClients,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const addAsset = (clientId: string, asset: Omit<FinanceAsset, 'id' | 'clientId' | 'updatedAt'>, actorName: string = 'System Admin') => {
    const assetId = `asset-${Date.now()}`;
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const newAsset: FinanceAsset = {
      ...asset,
      id: assetId,
      clientId,
      source: asset.source || 'admin',
      updatedAt: nowStr
    };

    updateState((prev) => {
      const targetClient = prev.clients.find(c => c.id === clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} assigned ${asset.symbol} asset to ${clientName}.`,
        clientName,
        clientId,
        actorName,
        undefined,
        `$${asset.balance.toFixed(2)} (${asset.walletAddress.substring(0, 10)}...)`
      );

      return {
        ...prev,
        assets: [newAsset, ...prev.assets],
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const updateAsset = (assetId: string, updates: Partial<FinanceAsset>, actorName: string = 'System Admin') => {
    updateState((prev) => {
      const existing = prev.assets.find(a => a.id === assetId);
      if (!existing) return prev;

      const updatedAssets = prev.assets.map(a => 
        a.id === assetId ? { 
          ...a, 
          ...updates, 
          updatedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
        } : a
      );

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} updated asset ${existing.symbol} for ${clientName}.`,
        clientName,
        existing.clientId,
        actorName,
        `$${existing.balance.toFixed(2)}`,
        updates.balance !== undefined ? `$${updates.balance.toFixed(2)}` : undefined
      );

      return {
        ...prev,
        assets: updatedAssets,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const deleteAsset = (assetId: string, actorName: string = 'System Admin') => {
    updateState((prev) => {
      const existing = prev.assets.find(a => a.id === assetId);
      if (!existing) return prev;

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} removed asset ${existing.symbol} from ${clientName}.`,
        clientName,
        existing.clientId,
        actorName
      );

      return {
        ...prev,
        assets: prev.assets.filter(a => a.id !== assetId),
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const updateDocumentStatus = (documentId: string, status: DocumentReviewStatus, adminNote?: string, actorName: string = 'System Admin') => {
    updateState((prev) => {
      const existing = prev.documents.find(d => d.id === documentId);
      if (!existing) return prev;

      const updatedDocs = prev.documents.map(d => 
        d.id === documentId ? { 
          ...d, 
          status, 
          adminNote: adminNote !== undefined ? adminNote : d.adminNote 
        } : d
      );

      const targetClient = prev.clients.find(c => c.id === existing.clientId);
      const clientName = targetClient ? `${targetClient.firstName} ${targetClient.lastName}` : 'Client';

      const log = createActivityLog(
        `${actorName} set status of "${existing.name}" to ${status}.`,
        clientName,
        existing.clientId,
        actorName,
        existing.status,
        status
      );

      return {
        ...prev,
        documents: updatedDocs,
        activityLogs: [log, ...prev.activityLogs]
      };
    });
  };

  const resetToInitial = () => {
    saveDemoState(INITIAL_DEMO_DATA);
    setState(INITIAL_DEMO_DATA);
  };

  const value: DemoDataContextType = {
    state,
    clients: state.clients,
    users: state.users,
    cases: state.cases,
    assets: state.assets,
    bankAccounts: state.bankAccounts,
    payoutCards: state.payoutCards,
    transactions: state.transactions,
    documents: state.documents,
    activityLogs: state.activityLogs,
    getClientProfile,
    getClientAssets,
    getClientBankAccounts,
    getClientPayoutCards,
    getClientTotalBalance,
    getClientCases,
    getClientTransactions,
    getClientDocuments,
    getClientActivityLogs,
    addWallet,
    updateWallet,
    deleteWallet,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addPayoutCard,
    updatePayoutCard,
    deletePayoutCard,
    requestWithdrawal,
    uploadDocument,
    createManagedUser,
    updateManagedUserStatus,
    updateManagedUser,
    updateClientCaseFileStatus,
    updateTotalBalanceComment,
    updateClientBank,
    addAsset,
    updateAsset,
    deleteAsset,
    createCase,
    updateCase,
    deleteCase,
    approveTransaction,
    rejectTransaction,
    updateDocumentStatus,
    resetToInitial
  };

  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
};

export const useDemoData = (): DemoDataContextType => {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  return context;
};
