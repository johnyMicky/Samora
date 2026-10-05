import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Landmark, 
  ArrowLeftRight, 
  FileText, 
  ScrollText, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Search, 
  Clock, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Lock, 
  Building2, 
  Wallet, 
  CreditCard,
  ChevronRight,
  User as UserIcon,
  RotateCcw,
  Ban,
  UserCheck,
  Shield,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createManagedFirebaseUser } from '../lib/firebase';
import { useLanguage } from '../translations';
import { useDemoData } from '../context/DemoDataContext';
import { 
  type CaseFileStatus, 
  type CaseStatus, 
  type DocumentReviewStatus, 
  type ClientProfile, 
  type ManagedUserItem,
  type CaseItem, 
  type FinanceAsset, 
  type BankAccountItem,
  type PayoutCardItem,
  type TransactionItem,
  type UserRole,
  type UserAccountStatus,
  type FinancialSource
} from '../lib/demoData';
import { LanguageSwitcher } from '../App';
import {
  firestoreGetAllUserProfiles, firestoreGetWalletsForClient, firestoreGetBankAccountsForClient,
  firestoreGetPaymentCardsForClient, firestoreGetCasesForClient, firestoreGetTransactionsForClient,
  firestoreGetDocumentsForClient, firestoreAddWallet, firestoreAddBankAccount, firestoreAddPaymentCard, firestoreAddCase,
  firestoreUpdateCase, firestoreDeleteCase, firestoreUpdateWallet, firestoreDeleteWallet,
  firestoreSubscribeCases, firestoreSubscribeWithdrawalRequests, firestoreUpdateWithdrawalRequestStatus,
  type FirestoreUserProfile, type FirestoreWallet, type FirestoreBankAccount, type FirestorePaymentCard,
  type FirestoreCase, type FirestoreTransaction, type FirestoreDocument, type FirestoreWithdrawalRequest
} from '../lib/firestoreService';

type AdminTab = 'overview' | 'clients' | 'cases' | 'finance' | 'transactions' | 'documents' | 'activity-log';
type UserFilter = 'ALL' | 'CLIENTS' | 'ADMINS' | 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export const AdminPage: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const {
    state,
    clients,
    users,
    cases,
    assets,
    bankAccounts,
    payoutCards,
    transactions,
    documents,
    activityLogs,
    getClientProfile,
    getClientAssets,
    getClientBankAccounts,
    getClientPayoutCards,
    getClientTotalBalance,
    getClientCases,
    getClientTransactions,
    getClientDocuments,
    addWallet,
    updateWallet,
    deleteWallet,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addPayoutCard,
    updatePayoutCard,
    deletePayoutCard,
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
  } = useDemoData();

  // Current Admin Actor Identity & Capabilities
  const isSuperAdmin = user?.role === 'super_admin' || user?.email === 'admin@bafinsolution.com' || user?.email === 'admin@demo.local';
  const currentActorRole: UserRole = isSuperAdmin ? 'super_admin' : 'admin';
  const currentActorName: string = isSuperAdmin ? 'System Admin' : 'Operations Admin';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [firebaseUsers, setFirebaseUsers] = useState<ManagedUserItem[]>([]);
  const [firebaseUsersLoading, setFirebaseUsersLoading] = useState(true);
  const [firebaseUsersError, setFirebaseUsersError] = useState<string | null>(null);
  const [realAllCases, setRealAllCases] = useState<FirestoreCase[]>([]);
  const [realAllWithdrawals, setRealAllWithdrawals] = useState<FirestoreWithdrawalRequest[]>([]);

  const formatFirestoreDate = (value: unknown): string => {
    if (!value) return '—';
    try {
      const maybeTimestamp = value as { toDate?: () => Date };
      const date = typeof maybeTimestamp.toDate === 'function'
        ? maybeTimestamp.toDate()
        : new Date(value as string | number | Date);
      if (Number.isNaN(date.getTime())) return '—';
      return date.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  const mapFirebaseUser = (profile: FirestoreUserProfile): ManagedUserItem => {
    const displayParts = (profile.displayName || '').trim().split(/\s+/).filter(Boolean);
    const firstName = profile.firstName || displayParts[0] || 'User';
    const lastName = profile.lastName || displayParts.slice(1).join(' ') || '';
    const normalizedStatus: UserAccountStatus =
      profile.status === 'active' ? 'Active' : 'Suspended';

    return {
      id: profile.uid,
      email: profile.email || '',
      firstName,
      lastName,
      role: profile.role || 'client',
      status: normalizedStatus,
      phone: profile.phone || '',
      country: profile.country || '',
      createdAt: formatFirestoreDate(profile.createdAt),
      lastActivity: formatFirestoreDate(profile.updatedAt)
    };
  };

  const loadFirebaseUsers = async () => {
    setFirebaseUsersLoading(true);
    setFirebaseUsersError(null);
    try {
      const profiles = await firestoreGetAllUserProfiles();
      setFirebaseUsers(profiles.map(mapFirebaseUser));
    } catch (error) {
      console.error('Failed to load Firebase users:', error);
      setFirebaseUsers([]);
      setFirebaseUsersError('Could not load users from Firebase. Check Firestore access and try again.');
    } finally {
      setFirebaseUsersLoading(false);
    }
  };

  useEffect(() => {
    void loadFirebaseUsers();
  }, []);

  useEffect(() => {
    const unsubCases = firestoreSubscribeCases(undefined, setRealAllCases);
    const unsubWithdrawals = firestoreSubscribeWithdrawalRequests(undefined, setRealAllWithdrawals);
    return () => { unsubCases(); unsubWithdrawals(); };
  }, []);

  // Selected Client for Detailed Dossier Inspection
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientDetailTab, setClientDetailTab] = useState<'overview' | 'cases' | 'finance' | 'transactions' | 'documents'>('overview');
  const [realWallets, setRealWallets] = useState<FirestoreWallet[]>([]);
  const [realBanks, setRealBanks] = useState<FirestoreBankAccount[]>([]);
  const [realCards, setRealCards] = useState<FirestorePaymentCard[]>([]);
  const [realCases, setRealCases] = useState<FirestoreCase[]>([]);
  const [realTransactions, setRealTransactions] = useState<FirestoreTransaction[]>([]);
  const [realDocuments, setRealDocuments] = useState<FirestoreDocument[]>([]);
  const [clientDataLoading, setClientDataLoading] = useState(false);

  const loadRealClientData = async (clientId: string) => {
    setClientDataLoading(true);
    try {
      const [w,b,c,ca,t,d] = await Promise.all([
        firestoreGetWalletsForClient(clientId), firestoreGetBankAccountsForClient(clientId),
        firestoreGetPaymentCardsForClient(clientId), firestoreGetCasesForClient(clientId),
        firestoreGetTransactionsForClient(clientId), firestoreGetDocumentsForClient(clientId)
      ]);
      setRealWallets(w); setRealBanks(b); setRealCards(c); setRealCases(ca); setRealTransactions(t); setRealDocuments(d);
    } finally { setClientDataLoading(false); }
  };

  useEffect(() => { if (selectedClientId) void loadRealClientData(selectedClientId); }, [selectedClientId]);

  // =========================================================================
  // USER MANAGEMENT MODAL STATES
  // =========================================================================
  const [userFilter, setUserFilter] = useState<UserFilter>('ALL');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createUserType, setCreateUserType] = useState<'client' | 'admin'>('client');
  const [userFormFirst, setUserFormFirst] = useState('');
  const [userFormLast, setUserFormLast] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('ClientDemo2026!');
  const [userFormRole, setUserFormRole] = useState<UserRole>('client');
  const [userFormStatus, setUserFormStatus] = useState<UserAccountStatus>('Active');
  const [userFormPhone, setUserFormPhone] = useState('+49 30 12345678');
  const [userFormCountry, setUserFormCountry] = useState('Germany');
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<ManagedUserItem | null>(null);
  const [editUserFirst, setEditUserFirst] = useState('');
  const [editUserLast, setEditUserLast] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserCountry, setEditUserCountry] = useState('');
  const [editUserStatus, setEditUserStatus] = useState<UserAccountStatus>('Active');
  const [editUserRole, setEditUserRole] = useState<UserRole>('client');

  // Case Modal State
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);
  const [caseFormClient, setCaseFormClient] = useState<string>('demo_client_user');
  const [caseFormNumber, setCaseFormNumber] = useState<string>('');
  const [caseFormStatus, setCaseFormStatus] = useState<CaseStatus>('In Process');
  const [caseFormNote, setCaseFormNote] = useState<string>('');

  // Finance Asset Modal State (Admin adding asset)
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<FinanceAsset | null>(null);
  const [assetFormClient, setAssetFormClient] = useState<string>('demo_client_user');
  const [assetFormSymbol, setAssetFormSymbol] = useState<string>('BTC');
  const [assetFormName, setAssetFormName] = useState<string>('Bitcoin');
  const [assetFormNetwork, setAssetFormNetwork] = useState<string>('Bitcoin');
  const [assetFormBalance, setAssetFormBalance] = useState<string>('400.00');
  const [assetFormWallet, setAssetFormWallet] = useState<string>('');
  const [assetFormComment, setAssetFormComment] = useState<string>('');

  // Total Balance Comment Edit Modal
  const [isBalanceCommentOpen, setIsBalanceCommentOpen] = useState(false);
  const [balanceCommentText, setBalanceCommentText] = useState('');

  // Rejection Modal State
  const [rejectingTxId, setRejectingTxId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  // General Filters
  const [txFilterClient, setTxFilterClient] = useState<string>('ALL');
  const [txFilterStatus, setTxFilterStatus] = useState<string>('ALL');
  const [docFilterStatus, setDocFilterStatus] = useState<string>('ALL');

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const navItems: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: t.admin.navOverview, icon: LayoutDashboard },
    { id: 'clients', label: t.admin.navClients, icon: Users },
    { id: 'cases', label: t.admin.navCases, icon: Briefcase },
    { id: 'finance', label: t.admin.navFinance, icon: Landmark },
    { id: 'transactions', label: t.admin.navTransactions, icon: ArrowLeftRight },
    { id: 'documents', label: t.admin.navDocuments, icon: FileText },
    { id: 'activity-log', label: t.admin.navActivityLog, icon: ScrollText },
  ];

  // =========================================================================
  // USER CREATION & MANAGEMENT HANDLERS
  // =========================================================================
  const handleOpenCreateUser = (type: 'client' | 'admin' = 'client') => {
    setCreateUserType(type);
    setUserFormFirst('');
    setUserFormLast('');
    setUserFormEmail('');
    setUserFormPassword(type === 'client' ? 'ClientDemo2026!' : 'AdminDemo2026!');
    setUserFormRole(type === 'client' ? 'client' : 'admin');
    setUserFormStatus('Active');
    setUserFormPhone('+49 30 12345678');
    setUserFormCountry('Germany');
    setCreateUserError(null);
    setIsCreateUserOpen(true);
  };

  const handleSaveCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError(null);

    if (!userFormFirst.trim() || !userFormLast.trim() || !userFormEmail.trim()) {
      setCreateUserError('Please provide name and a valid email address.');
      return;
    }

    try {
      // Create the actual Firebase Authentication account without replacing
      // the current administrator session, then create its Firestore profile.
      if (userFormRole === 'super_admin' && !isSuperAdmin) {
        throw new Error('Unauthorized: Only Super Administrators can create another Super Administrator.');
      }
      await createManagedFirebaseUser({
        firstName: userFormFirst.trim(),
        lastName: userFormLast.trim(),
        email: userFormEmail.trim(),
        password: userFormPassword.trim(),
        role: userFormRole,
        status: userFormStatus === 'Suspended' ? 'disabled' : 'active',
        phone: userFormPhone.trim(),
        country: userFormCountry.trim()
      });
      await loadFirebaseUsers();
      setIsCreateUserOpen(false);
    } catch (err) {
      setCreateUserError(err instanceof Error ? err.message : 'Failed to create user account.');
    }
  };

  const handleOpenEditUser = (u: ManagedUserItem) => {
    // Permission guard: Administrator cannot modify Super Admin
    if (u.role === 'super_admin' && !isSuperAdmin) {
      alert('Unauthorized: Administrators cannot modify Super Admin accounts.');
      return;
    }

    setEditingUser(u);
    setEditUserFirst(u.firstName);
    setEditUserLast(u.lastName);
    setEditUserPhone(u.phone || '');
    setEditUserCountry(u.country || '');
    setEditUserStatus(u.status);
    setEditUserRole(u.role);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    await updateManagedUser(editingUser.id, {
      firstName: editUserFirst.trim(),
      lastName: editUserLast.trim(),
      phone: editUserPhone.trim(),
      country: editUserCountry.trim(),
      status: editUserStatus,
      role: editUserRole
    }, currentActorRole, currentActorName);

    setEditingUser(null);
  };

  const handleToggleUserStatus = async (u: ManagedUserItem) => {
    if (u.role === 'super_admin' && !isSuperAdmin) {
      alert('Unauthorized: Administrators cannot suspend Super Admin accounts.');
      return;
    }

    const nextStatus: UserAccountStatus = u.status === 'Active' ? 'Suspended' : 'Active';
    await updateManagedUserStatus(u.id, nextStatus, currentActorRole, currentActorName);
  };

  // Case Handlers
  const openCreateCaseModal = (preselectedClientId?: string) => {
    setEditingCase(null);
    setCaseFormClient(preselectedClientId || firebaseUsers.find(u => u.role === 'client')?.id || '');
    setCaseFormNumber(`BS-${new Date().getFullYear()}-00${Math.floor(200 + Math.random() * 800)}`);
    setCaseFormStatus('In Process');
    setCaseFormNote('');
    setIsCaseModalOpen(true);
  };

  const openEditCaseModal = (c: CaseItem) => {
    setEditingCase(c);
    setCaseFormClient(c.clientId);
    setCaseFormNumber(c.caseNumber);
    setCaseFormStatus(c.status);
    setCaseFormNote(c.adminNote);
    setIsCaseModalOpen(true);
  };

  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseFormNumber.trim()) return;

    const targetClientId = selectedClientId || caseFormClient;
    if (!targetClientId) return;
    const action = editingCase
      ? firestoreUpdateCase(editingCase.id, { caseNumber: caseFormNumber.trim(), status: caseFormStatus, notes: caseFormNote.trim() })
      : firestoreAddCase({ clientId: targetClientId, caseNumber: caseFormNumber.trim(), title: 'Client Case', status: caseFormStatus, dateCreated: new Date().toISOString(), notes: caseFormNote.trim() });
    void action.then(() => { if (selectedClientId) void loadRealClientData(selectedClientId); });
    setIsCaseModalOpen(false);
  };

  // Asset Handlers
  const openAddAssetModal = (preselectedClientId?: string) => {
    setEditingAsset(null);
    setAssetFormClient(preselectedClientId || 'demo_client_user');
    setAssetFormSymbol('BTC');
    setAssetFormName('Bitcoin');
    setAssetFormNetwork('Bitcoin');
    setAssetFormBalance('100.00');
    setAssetFormWallet('bc1q...');
    setAssetFormComment('');
    setIsAssetModalOpen(true);
  };

  const openEditAssetModal = (a: FinanceAsset) => {
    setEditingAsset(a);
    setAssetFormClient(a.clientId);
    setAssetFormSymbol(a.symbol);
    setAssetFormName(a.name);
    setAssetFormNetwork(a.network);
    setAssetFormBalance(a.balance.toString());
    setAssetFormWallet(a.walletAddress);
    setAssetFormComment(a.comment || '');
    setIsAssetModalOpen(true);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(assetFormBalance) || 0;

    if (selectedClientId && !editingAsset) {
      void firestoreAddWallet({ clientId: selectedClientId, asset: assetFormSymbol, network: assetFormNetwork, walletAddress: assetFormWallet.trim(), label: assetFormName, source: 'admin', status: 'Active', balance: balanceNum }).then(() => loadRealClientData(selectedClientId));
    } else if (editingAsset && selectedClientId) {
      void firestoreUpdateWallet(editingAsset.id, { asset: assetFormSymbol, network: assetFormNetwork, balance: balanceNum, walletAddress: assetFormWallet.trim(), label: assetFormName }).then(() => loadRealClientData(selectedClientId));
    } else if (editingAsset) {
      updateAsset(editingAsset.id, { symbol: assetFormSymbol, name: assetFormName, network: assetFormNetwork, balance: balanceNum, walletAddress: assetFormWallet.trim(), comment: assetFormComment.trim() || undefined }, currentActorName);
    } else { addAsset(assetFormClient, { symbol: assetFormSymbol, name: assetFormName, network: assetFormNetwork, balance: balanceNum, walletAddress: assetFormWallet.trim(), source: 'admin', comment: assetFormComment.trim() || undefined }, currentActorName); }
    setIsAssetModalOpen(false);
  };

  // Admin Bank Account Modal State & Handlers
  const [isAdminBankModalOpen, setIsAdminBankModalOpen] = useState(false);
  const [adminBankTargetClient, setAdminBankTargetClient] = useState<string>('demo_client_user');
  const [adminBankHolder, setAdminBankHolder] = useState('');
  const [adminBankName, setAdminBankName] = useState('');
  const [adminBankCountry, setAdminBankCountry] = useState('Germany');
  const [adminBankIban, setAdminBankIban] = useState('');
  const [adminBankSwift, setAdminBankSwift] = useState('');
  const [adminBankLabel, setAdminBankLabel] = useState('');
  const [adminBankPaymentDue, setAdminBankPaymentDue] = useState('');
  const [adminBankPaymentCurrency, setAdminBankPaymentCurrency] = useState<'USD' | 'EUR'>('EUR');
  const [adminBankPaymentReference, setAdminBankPaymentReference] = useState('');
  const [adminBankError, setAdminBankError] = useState<string | null>(null);

  const openAdminAddBankModal = (targetClientId?: string) => {
    const clientId = targetClientId || selectedClientId || (clients[0] ? clients[0].id : 'demo_client_user');
    const client = clients.find(c => c.id === clientId);
    setAdminBankTargetClient(clientId);
    setAdminBankHolder(client ? `${client.firstName} ${client.lastName}` : '');
    setAdminBankName('');
    setAdminBankCountry(client?.country || 'Germany');
    setAdminBankIban('');
    setAdminBankSwift('');
    setAdminBankLabel('');
    setAdminBankPaymentDue('');
    setAdminBankPaymentCurrency('EUR');
    setAdminBankPaymentReference('');
    setAdminBankError(null);
    setIsAdminBankModalOpen(true);
  };

  const handleSaveAdminBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminBankError(null);
    if (!adminBankHolder.trim() || !adminBankName.trim() || !adminBankIban.trim() || !adminBankSwift.trim() || !adminBankCountry.trim()) {
      setAdminBankError('Account holder, bank name, country, IBAN and SWIFT / BIC are required.');
      return;
    }
    try {
      const targetId = selectedClientId || adminBankTargetClient;
      if (selectedClientId) {
        await firestoreAddBankAccount({
          clientId: targetId, accountHolder: adminBankHolder.trim(), bankName: adminBankName.trim(),
          country: adminBankCountry.trim(), iban: adminBankIban.trim(), swiftBic: adminBankSwift.trim(),
          label: adminBankLabel.trim() || undefined, paymentDueAmount: adminBankPaymentDue ? Number(adminBankPaymentDue) : undefined, paymentDueCurrency: adminBankPaymentDue ? adminBankPaymentCurrency : undefined, paymentReference: adminBankPaymentReference.trim() || undefined, source: 'admin', status: 'Verified'
        });
        await loadRealClientData(targetId);
      } else {
        await addBankAccount(targetId, { accountHolder: adminBankHolder.trim(), bankName: adminBankName.trim(), country: adminBankCountry.trim(), iban: adminBankIban.trim(), swiftBic: adminBankSwift.trim(), label: adminBankLabel.trim() || undefined, paymentDueAmount: adminBankPaymentDue ? Number(adminBankPaymentDue) : undefined, paymentDueCurrency: adminBankPaymentDue ? adminBankPaymentCurrency : undefined, paymentReference: adminBankPaymentReference.trim() || undefined, source: 'admin' }, currentActorRole, currentActorName);
      }
      setIsAdminBankModalOpen(false);
    } catch (err) {
      console.error('Failed to add bank account:', err);
      setAdminBankError('Failed to add bank account. Please retry.');
    }
  };

  // Admin Card Modal State & Handlers
  const [isAdminCardModalOpen, setIsAdminCardModalOpen] = useState(false);
  const [adminCardTargetClient, setAdminCardTargetClient] = useState<string>('demo_client_user');
  const [adminCardHolder, setAdminCardHolder] = useState<string>('Demo Client');
  const [adminCardRawNumber, setAdminCardRawNumber] = useState<string>('4582123456784582');
  const [adminShowCardNumber, setAdminShowCardNumber] = useState<boolean>(false);
  const [adminCardExpMonth, setAdminCardExpMonth] = useState<string>('08');
  const [adminCardExpYear, setAdminCardExpYear] = useState<string>('29');
  const [adminCardCvv, setAdminCardCvv] = useState<string>('882');
  const [adminShowCvv, setAdminShowCvv] = useState<boolean>(false);
  const [adminCardBrand, setAdminCardBrand] = useState<'Visa' | 'Mastercard'>('Visa');
  const [adminCardCountry, setAdminCardCountry] = useState<string>('Germany');
  const [adminCardLabel, setAdminCardLabel] = useState<string>('Admin Assigned Visa');
  const [adminCardError, setAdminCardError] = useState<string | null>(null);

  const formatAdminCardNumberDisplay = (rawDigits: string, isPlainVisible: boolean) => {
    const digits = rawDigits.replace(/\D/g, '').slice(0, 16);
    if (!digits) return '';
    if (isPlainVisible) {
      return digits.match(/.{1,4}/g)?.join(' ') || digits;
    }
    if (digits.length <= 4) {
      return '•'.repeat(digits.length);
    }
    const maskedLen = digits.length - 4;
    const maskedPart = '•'.repeat(maskedLen) + digits.slice(-4);
    return maskedPart.match(/.{1,4}/g)?.join(' ') || maskedPart;
  };

  const openAdminAddCardModal = (targetClientId?: string) => {
    const clientId = targetClientId || selectedClientId || (clients[0] ? clients[0].id : 'demo_client_user');
    const client = clients.find(c => c.id === clientId);
    setAdminCardTargetClient(clientId);
    setAdminCardHolder(client ? `${client.firstName} ${client.lastName}` : 'Demo Client');
    setAdminCardRawNumber('4582123456784582');
    setAdminShowCardNumber(false);
    setAdminCardExpMonth('08');
    setAdminCardExpYear('29');
    setAdminCardCvv('882');
    setAdminShowCvv(false);
    setAdminCardBrand('Visa');
    setAdminCardCountry(client?.country || 'Germany');
    setAdminCardLabel('Admin Assigned Visa');
    setAdminCardError(null);
    setIsAdminCardModalOpen(true);
  };

  const handleSaveAdminCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCardError(null);

    const holder = adminCardHolder.trim();
    if (!holder) {
      setAdminCardError('Cardholder Name is required.');
      return;
    }

    const cleanDigits = adminCardRawNumber.replace(/\D/g, '');
    if (cleanDigits.length < 15 || cleanDigits.length > 19) {
      setAdminCardError('Please enter a valid card number (16 digits).');
      return;
    }

    const monthNum = parseInt(adminCardExpMonth, 10);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      setAdminCardError('Expiry Month must be between 01 and 12.');
      return;
    }

    const yearNum = parseInt(adminCardExpYear, 10);
    if (isNaN(yearNum) || (adminCardExpYear.length === 2 && yearNum < 24) || (adminCardExpYear.length === 4 && yearNum < 2024)) {
      setAdminCardError('Expiry Year must be 2024 or later.');
      return;
    }

    const cleanCvv = adminCardCvv.replace(/\D/g, '');
    if (cleanCvv.length < 3 || cleanCvv.length > 4) {
      setAdminCardError('CVV / CVC must be 3 or 4 digits.');
      return;
    }

    const last4 = cleanDigits.slice(-4);
    const formattedExpMonth = adminCardExpMonth.trim().padStart(2, '0');
    const formattedExpYear = adminCardExpYear.trim().length === 4 ? adminCardExpYear.trim().slice(-2) : adminCardExpYear.trim();

    // CRITICAL SECURITY RULE: IMMEDIATELY DISCARD raw card number and CVV
    // CVV and raw PAN are NEVER persisted or stored in state/storage.
    setAdminCardCvv('');
    setAdminCardRawNumber('');

    if (selectedClientId) {
      await firestoreAddPaymentCard({ clientId: selectedClientId, cardholderName: holder, brand: adminCardBrand, last4, expiryMonth: formattedExpMonth, expiryYear: formattedExpYear, billingCountry: adminCardCountry.trim() || 'Germany', label: adminCardLabel.trim() || undefined, source: 'admin', status: 'Active' });
      await loadRealClientData(selectedClientId);
    } else {
      await addPayoutCard(adminCardTargetClient, { cardholderName: holder, cardBrand: adminCardBrand, last4, expiryMonth: formattedExpMonth, expiryYear: formattedExpYear, billingCountry: adminCardCountry.trim() || 'Germany', label: adminCardLabel.trim() || undefined, source: 'admin' }, currentActorRole, currentActorName);
    }

    setIsAdminCardModalOpen(false);
  };

  // Rejection Submission
  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectionError(t.admin.rejectionReasonRequired);
      return;
    }
    if (rejectingTxId) {
      const isRealWithdrawal = realAllWithdrawals.some(w => w.id === rejectingTxId);
      if (isRealWithdrawal) {
        void firestoreUpdateWithdrawalRequestStatus(rejectingTxId, 'rejected', rejectionReason.trim());
      } else {
        rejectTransaction(rejectingTxId, rejectionReason.trim(), currentActorName);
      }
      setRejectingTxId(null);
      setRejectionReason('');
      setRejectionError(null);
    }
  };

  const getSourceBadge = (source?: FinancialSource) => {
    if (source === 'client') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
          <UserIcon className="w-2.5 h-2.5" />
          <span>SOURCE: CLIENT</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5C400]/10 border border-[#F5C400]/30 text-[#F5C400]">
        <Lock className="w-2.5 h-2.5" />
        <span>SOURCE: ADMIN</span>
      </span>
    );
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <ShieldCheck className="w-3 h-3" />
            <span>Super Admin</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <Shield className="w-3 h-3" />
            <span>Administrator</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/15 border border-zinc-500/30 text-zinc-300">
            <UserIcon className="w-3 h-3" />
            <span>Client</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: UserAccountStatus) => {
    switch (status) {
      case 'Active':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Active</span>;
      case 'Pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">Pending</span>;
      case 'Suspended':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">Suspended</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/15 text-zinc-300">{status}</span>;
    }
  };

  // Filtered Users
  const filteredUsers = firebaseUsers.filter((u) => {
    if (userFilter === 'CLIENTS' && u.role !== 'client') return false;
    if (userFilter === 'ADMINS' && u.role === 'client') return false;
    if (userFilter === 'ACTIVE' && u.status !== 'Active') return false;
    if (userFilter === 'PENDING' && u.status !== 'Pending') return false;
    if (userFilter === 'SUSPENDED' && u.status !== 'Suspended') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = `${u.firstName} ${u.lastName}`.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      return matchName || matchEmail || matchId;
    }
    return true;
  });

  const pendingTxCount = transactions.filter(t => t.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white flex flex-col font-sans selection:bg-[#F5C400] selection:text-[#0B0B0C]">
      {/* Top Header */}
      <header className="h-16 border-b border-[#29292C] bg-[#111112] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-[#A9A9AD] hover:text-white rounded-lg focus:outline-hidden cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-linear-to-br from-red-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-display font-bold text-white tracking-tight leading-none">
                Bafin Solution
              </span>
              <span className="text-[10px] text-red-400 tracking-wider uppercase font-semibold">
                Operations Console
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              if (confirm('Reset demo state to initial demo data?')) {
                resetToInitial();
              }
            }}
            className="text-xs text-[#737378] hover:text-[#F5C400] flex items-center gap-1 transition-colors px-2 py-1 rounded-md border border-[#29292C] hover:border-[#F5C400]/40 cursor-pointer"
            title="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          <LanguageSwitcher />

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#29292C]">
            <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xs">
              {isSuperAdmin ? 'SA' : 'OA'}
            </div>
            <div className="text-left text-xs hidden md:block">
              <div className="font-bold text-white">{currentActorName}</div>
              <div className="text-[10px] text-red-400 font-mono">
                {isSuperAdmin ? 'Super Administrator' : 'Administrator'}
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="text-xs font-semibold text-[#A9A9AD] hover:text-[#F5C400] flex items-center gap-1 transition-colors px-2 py-1 rounded-md"
            title="View public website"
          >
            <span className="hidden sm:inline">Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            fixed md:static inset-y-16 left-0 z-30 w-64 bg-[#111112] border-r border-[#29292C] flex flex-col justify-between transition-transform duration-200 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Nav Items */}
          <div className="p-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#737378]">
              {t.admin.title}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !selectedClientId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedClientId(null);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer
                    ${isActive 
                      ? 'bg-linear-to-r from-red-500/20 to-amber-500/10 text-white border border-red-500/30 font-bold' 
                      : 'text-[#A9A9AD] hover:text-white hover:bg-[#1C1C1E]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F5C400]' : 'text-[#737378]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.id === 'clients' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#1C1C1E] text-[#A9A9AD]">
                      {users.length}
                    </span>
                  )}
                  {item.id === 'cases' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#1C1C1E] text-[#A9A9AD]">
                      {realAllCases.length}
                    </span>
                  )}
                  {item.id === 'transactions' && pendingTxCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 animate-pulse">
                      {pendingTxCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin Notice & Logout */}
          <div className="p-4 border-t border-[#29292C] space-y-3">
            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/20 text-xs">
              <div className="text-[10px] text-red-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>Privilege Enforced</span>
              </div>
              <div className="text-white text-[11px] mt-1 leading-snug">
                {isSuperAdmin ? 'Super Administrator: Full rights across users, cases, and logs.' : 'Administrator: Case and client operations.'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.admin.navLogout}</span>
            </button>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
          />
        )}

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto bg-[#0B0B0C] p-4 sm:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* TAB: OVERVIEW / DASHBOARD */}
            {activeTab === 'overview' && !selectedClientId && (
              <div className="space-y-6">
                <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-red-500/10 to-transparent pointer-events-none" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{t.admin.verifiedAdmin} • {currentActorName}</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                        {t.admin.title}
                      </h1>
                      <p className="text-xs sm:text-sm text-[#A9A9AD] mt-1">
                        {t.admin.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.admin.systemOnline}</span>
                    </div>
                  </div>
                </div>

                {/* 4 Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div 
                    onClick={() => setActiveTab('clients')}
                    className="bg-[#141416] border border-[#29292C] hover:border-[#F5C400]/40 rounded-xl p-5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-xs text-[#737378] font-bold uppercase tracking-wider">
                      <span>{t.admin.totalClients}</span>
                      <Users className="w-4 h-4 text-[#F5C400]" />
                    </div>
                    <div className="mt-3 text-2xl font-bold font-mono text-white">
                      {users.length}
                    </div>
                    <p className="text-[11px] text-[#A9A9AD] mt-1">Clients &amp; Administrators</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('cases')}
                    className="bg-[#141416] border border-[#29292C] hover:border-[#F5C400]/40 rounded-xl p-5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-xs text-[#737378] font-bold uppercase tracking-wider">
                      <span>{t.admin.openCases}</span>
                      <Briefcase className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="mt-3 text-2xl font-bold font-mono text-white">
                      {realAllCases.length}
                    </div>
                    <p className="text-[11px] text-[#A9A9AD] mt-1">Active investigations</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('transactions')}
                    className="bg-[#141416] border border-[#29292C] hover:border-[#F5C400]/40 rounded-xl p-5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-xs text-[#737378] font-bold uppercase tracking-wider">
                      <span>{t.admin.pendingTransactionsCount}</span>
                      <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="mt-3 text-2xl font-bold font-mono text-amber-400">
                      {pendingTxCount}
                    </div>
                    <p className="text-[11px] text-[#A9A9AD] mt-1">Review queue</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('documents')}
                    className="bg-[#141416] border border-[#29292C] hover:border-[#F5C400]/40 rounded-xl p-5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between text-xs text-[#737378] font-bold uppercase tracking-wider">
                      <span>{t.admin.documentsAwaitingReview}</span>
                      <FileText className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="mt-3 text-2xl font-bold font-mono text-white">
                      {documents.filter(d => d.status === 'New').length}
                    </div>
                    <p className="text-[11px] text-[#A9A9AD] mt-1">Unprocessed evidence</p>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Fast Administrative Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <button
                      onClick={() => handleOpenCreateUser('client')}
                      className="p-4 bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400]/50 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#F5C400]/10 flex items-center justify-center text-[#F5C400] group-hover:scale-105 transition-transform">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-[#F5C400]">+ Create Client</div>
                        <div className="text-[10px] text-[#737378]">Onboard new investigation client</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleOpenCreateUser('admin')}
                      className="p-4 bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400]/50 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-blue-400">+ Create Admin</div>
                        <div className="text-[10px] text-[#737378]">Provision staff permissions</div>
                      </div>
                    </button>

                    <button
                      onClick={() => openCreateCaseModal()}
                      className="p-4 bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400]/50 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-purple-400">+ Assign Case</div>
                        <div className="text-[10px] text-[#737378]">Open forensic dossier</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CLIENTS & USERS MANAGEMENT */}
            {activeTab === 'clients' && !selectedClientId && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t.admin.navClients}</h2>
                    <p className="text-xs text-[#A9A9AD] mt-1">
                      Manage client accounts, assign administrator roles, and control account credentials.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenCreateUser('client')}
                      className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.admin.createUser}</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141416] p-3 rounded-xl border border-[#29292C]">
                  {/* Filters */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
                    <button
                      onClick={() => setUserFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${userFilter === 'ALL' ? 'bg-[#F5C400] text-[#0B0B0C] font-bold' : 'text-[#A9A9AD] hover:bg-[#1C1C1E]'}`}
                    >
                      {t.admin.filterAll} ({firebaseUsers.length})
                    </button>
                    <button
                      onClick={() => setUserFilter('CLIENTS')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${userFilter === 'CLIENTS' ? 'bg-[#F5C400] text-[#0B0B0C] font-bold' : 'text-[#A9A9AD] hover:bg-[#1C1C1E]'}`}
                    >
                      {t.admin.filterClients} ({firebaseUsers.filter(u => u.role === 'client').length})
                    </button>
                    <button
                      onClick={() => setUserFilter('ADMINS')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${userFilter === 'ADMINS' ? 'bg-[#F5C400] text-[#0B0B0C] font-bold' : 'text-[#A9A9AD] hover:bg-[#1C1C1E]'}`}
                    >
                      {t.admin.filterAdmins} ({firebaseUsers.filter(u => u.role !== 'client').length})
                    </button>
                    <button
                      onClick={() => setUserFilter('ACTIVE')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${userFilter === 'ACTIVE' ? 'bg-[#F5C400] text-[#0B0B0C] font-bold' : 'text-[#A9A9AD] hover:bg-[#1C1C1E]'}`}
                    >
                      {t.admin.statusActive} ({firebaseUsers.filter(u => u.status === 'Active').length})
                    </button>
                    <button
                      onClick={() => setUserFilter('SUSPENDED')}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${userFilter === 'SUSPENDED' ? 'bg-[#F5C400] text-[#0B0B0C] font-bold' : 'text-[#A9A9AD] hover:bg-[#1C1C1E]'}`}
                    >
                      {t.admin.statusSuspended} ({firebaseUsers.filter(u => u.status === 'Suspended').length})
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#737378] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, email, ID..."
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#737378] focus:outline-hidden focus:border-[#F5C400]"
                    />
                  </div>
                </div>

                {firebaseUsersError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-xs">
                    {firebaseUsersError}
                  </div>
                )}

                {/* Users Table — real Firestore users collection */}
                <div className="bg-[#141416] border border-[#29292C] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#111112] border-b border-[#29292C] text-[#737378] uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">{t.admin.userRoleLabel}</th>
                          <th className="py-3 px-4">{t.admin.userStatusLabel}</th>
                          <th className="py-3 px-4">Registered</th>
                          <th className="py-3 px-4">{t.admin.lastActivity}</th>
                          <th className="py-3 px-4 text-right">{t.admin.actionCol}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#29292C]">
                        {firebaseUsersLoading && (
                          <tr><td colSpan={7} className="py-8 px-4 text-center text-[#737378]">Loading Firebase users…</td></tr>
                        )}
                        {!firebaseUsersLoading && !firebaseUsersError && filteredUsers.length === 0 && (
                          <tr><td colSpan={7} className="py-8 px-4 text-center text-[#737378]">No Firebase users found.</td></tr>
                        )}
                        {!firebaseUsersLoading && filteredUsers.map((u) => {
                          const isSelf = u.email === user?.email;
                          const isTargetSuper = u.role === 'super_admin';
                          const canModifyThisUser = isSuperAdmin || !isTargetSuper;

                          return (
                            <tr key={u.id} className="hover:bg-[#1C1C1E]/50 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center font-bold text-xs text-[#F5C400]">
                                    {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white flex items-center gap-1.5">
                                      <span>{u.firstName} {u.lastName}</span>
                                      {isSelf && <span className="text-[10px] text-[#F5C400] font-normal">(You)</span>}
                                    </div>
                                    <div className="text-[10px] text-[#737378] font-mono">{u.id}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono text-[#A9A9AD]">
                                {u.email}
                              </td>

                              <td className="py-3.5 px-4">
                                {getRoleBadge(u.role)}
                              </td>

                              <td className="py-3.5 px-4">
                                {getStatusBadge(u.status)}
                              </td>

                              <td className="py-3.5 px-4 text-[#737378]">
                                {u.createdAt}
                              </td>

                              <td className="py-3.5 px-4 text-[#737378] font-mono text-[11px]">
                                {u.lastActivity}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {u.role === 'client' && (
                                    <button
                                      onClick={() => {
                                        setSelectedClientId(u.id);
                                        setClientDetailTab('overview');
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400] text-[#F5C400] text-[11px] font-bold transition-all cursor-pointer"
                                    >
                                      Inspect
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    disabled={!canModifyThisUser}
                                    className={`p-1.5 rounded-lg border transition-all ${canModifyThisUser ? 'border-[#29292C] hover:border-white text-[#A9A9AD] hover:text-white cursor-pointer' : 'border-transparent text-[#444] cursor-not-allowed'}`}
                                    title={canModifyThisUser ? 'Edit User' : t.admin.cannotModifySuperAdmin}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => handleToggleUserStatus(u)}
                                    disabled={!canModifyThisUser}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      !canModifyThisUser 
                                        ? 'border-transparent text-[#444] cursor-not-allowed' 
                                        : u.status === 'Active'
                                          ? 'border-red-500/20 hover:border-red-500 text-red-400 hover:bg-red-500/10 cursor-pointer'
                                          : 'border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer'
                                    }`}
                                    title={
                                      !canModifyThisUser 
                                        ? t.admin.cannotModifySuperAdmin 
                                        : u.status === 'Active' ? t.admin.suspendUser : t.admin.activateUser
                                    }
                                  >
                                    {u.status === 'Active' ? <Ban className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CLIENT DOSSIER DETAIL INSPECTION (when client is selected) */}
            {selectedClientId && (() => {
              const realUser = firebaseUsers.find(u => u.id === selectedClientId);
              const client: ClientProfile = realUser ? { id: realUser.id, email: realUser.email, firstName: realUser.firstName, lastName: realUser.lastName, accountStatus: realUser.status === 'Active' ? 'Verified Client Account' : 'Under Review', phone: realUser.phone || '—', country: realUser.country || '—', caseFileStatus: realCases.length ? 'In Process' : 'Opened', createdAt: realUser.createdAt, bankName: realBanks[0]?.bankName || '—', bankAccountHolder: realBanks[0]?.accountHolder || '—', bankIban: realBanks[0]?.iban || '—', bankStatus: realBanks.length ? 'Verified' : 'Pending', totalBalanceComment: '' } : (getClientProfile(selectedClientId) || clients[0]);
              const clientAssetsList: FinanceAsset[] = realWallets.map(w => ({ id: w.id || '', clientId: w.clientId, symbol: w.asset, name: w.label || w.asset, network: w.network, balance: w.balance || 0, walletAddress: w.walletAddress, label: w.label, source: w.source, updatedAt: formatFirestoreDate(w.updatedAt) }));
              const clientBanksList: BankAccountItem[] = realBanks.map(b => ({ id: b.id || '', clientId: b.clientId, accountHolder: b.accountHolder, bankName: b.bankName, country: b.country, iban: b.iban, swiftBic: b.swiftBic, label: b.label, paymentDueAmount: b.paymentDueAmount, paymentDueCurrency: b.paymentDueCurrency, paymentReference: b.paymentReference, status: (b.status as any) || 'Pending', source: b.source, createdAt: formatFirestoreDate(b.createdAt), updatedAt: formatFirestoreDate(b.updatedAt) }));
              const clientCardsList: PayoutCardItem[] = realCards.map(c => ({ id: c.id || '', clientId: c.clientId, cardholderName: c.cardholderName, cardBrand: c.brand, last4: c.last4, expiryMonth: c.expiryMonth, expiryYear: c.expiryYear, billingCountry: c.billingCountry, label: c.label, source: c.source, status: c.status, createdAt: formatFirestoreDate(c.createdAt), updatedAt: formatFirestoreDate(c.updatedAt) }));
              const clientCasesList: CaseItem[] = realCases.map(c => ({ id: c.id || '', clientId: c.clientId, caseNumber: c.caseNumber, status: c.status, createdDate: c.dateCreated || formatFirestoreDate(c.createdAt), lastUpdated: formatFirestoreDate(c.updatedAt), adminNote: c.notes || '' }));
              const clientTxList: TransactionItem[] = [...realTransactions.map(t => ({ id: t.id || t.transactionId, clientId: t.clientId, type: (t.type as any) || 'Withdrawal', asset: t.currency, amount: t.amount, date: t.date || formatFirestoreDate(t.createdAt), status: t.status, adminComment: t.adminComment, destinationAddress: t.destinationAddress } as TransactionItem)), ...realAllWithdrawals.filter(w => w.clientId === selectedClientId).map(w => ({ id: w.id || '', clientId: w.clientId, type: 'Withdrawal' as const, asset: w.currency, amount: Number(w.amount) || 0, date: formatFirestoreDate(w.createdAt), status: (w.status === 'completed' || w.status === 'approved') ? 'Completed' as const : w.status === 'rejected' ? 'Rejected' as const : 'Pending' as const, adminComment: w.adminComment, destinationAddress: w.destinationId, destinationDetails: w.destinationDetails || w.destinationId, destinationType: w.destinationType as any, destinationSource: 'client' as const } as TransactionItem))];
              const clientDocsList = realDocuments.map(d => ({ id: d.id || '', clientId: d.clientId, name: d.fileName, fileType: d.fileName.split('.').pop() || 'file', fileSize: d.fileSize, caseNumber: d.caseNumber, uploadDate: d.uploadDate || formatFirestoreDate(d.createdAt), status: d.status === 'Verified' ? 'Accepted' : d.status === 'Rejected' ? 'Rejected' : 'New' } as any));
              const clientTotal = realWallets.reduce((sum, w) => sum + (Number(w.balance) || 0), 0);

              return (
                <div className="space-y-6">
                  {/* Top Breadcrumb Header */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedClientId(null)}
                      className="text-xs font-semibold text-[#A9A9AD] hover:text-[#F5C400] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Users List</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400">
                        {client.caseFileStatus}
                      </span>
                    </div>
                  </div>

                  {/* Client Header Card */}
                  <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#1C1C1E] border border-[#F5C400]/30 flex items-center justify-center font-bold text-xl text-[#F5C400]">
                          {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl sm:text-2xl font-bold text-white">{client.firstName} {client.lastName}</h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              {client.accountStatus}
                            </span>
                          </div>
                          <div className="text-xs text-[#737378] font-mono mt-0.5">
                            {client.email} • {client.phone} • {client.country}
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-[#29292C] sm:pl-6">
                        <div className="text-[10px] text-[#737378] font-bold uppercase tracking-wider">Total Recorded Balance</div>
                        <div className="text-2xl font-bold font-mono text-[#F5C400]">
                          ${clientTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    {/* Sub Navigation */}
                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#29292C] overflow-x-auto text-xs font-semibold">
                      <button
                        onClick={() => setClientDetailTab('overview')}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${clientDetailTab === 'overview' ? 'bg-[#F5C400] text-[#0B0B0C] font-bold' : 'text-[#A9A9AD] hover:bg-[#1C1C1E]'}`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setClientDetailTab('finance')}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${clientDetailTab === 'finance' ? 'bg-[#F5C400] text-[#0B0B0C] font-bold' : 'text-[#A9A9AD] hover:bg-[#1C1C1E]'}`}
                      >
                        Finance &amp; Accounts ({clientAssetsList.length + clientBanksList.length + clientCardsList.length})
                      </button>
                      <button
                        onClick={() => setClientDetailTab('cases')}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${clientDetailTab === 'cases' ? 'bg-[#F5C400] text-[#0B0B0C] font-bold' : 'text-[#A9A9AD] hover:bg-[#1C1C1E]'}`}
                      >
                        Cases ({clientCasesList.length})
                      </button>
                      <button
                        onClick={() => setClientDetailTab('transactions')}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${clientDetailTab === 'transactions' ? 'bg-[#F5C400] text-[#0B0B0C] font-bold' : 'text-[#A9A9AD] hover:bg-[#1C1C1E]'}`}
                      >
                        Transactions ({clientTxList.length})
                      </button>
                      <button
                        onClick={() => setClientDetailTab('documents')}
                        className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${clientDetailTab === 'documents' ? 'bg-[#F5C400] text-[#0B0B0C] font-bold' : 'text-[#A9A9AD] hover:bg-[#1C1C1E]'}`}
                      >
                        Documents ({clientDocsList.length})
                      </button>
                    </div>
                  </div>

                  {/* 1. CLIENT DETAIL SUB-TAB: FINANCE (Admin sees EVERYTHING with SOURCE badges) */}
                  {clientDetailTab === 'finance' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">Client Financial Accounts</h3>
                          <p className="text-xs text-[#A9A9AD]">
                            All recorded crypto wallets, bank accounts, and payout destinations with explicit administrative or client ownership.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAddAssetModal(client.id)}
                            className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Asset / Wallet</span>
                          </button>
                        </div>
                      </div>

                      {/* Total Balance Commentary */}
                      <div className="p-4 bg-[#141416] border border-[#29292C] rounded-xl flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] text-[#737378] uppercase font-bold tracking-wider block">Total Balance Commentary</span>
                          <span className="text-xs text-white italic mt-0.5 block">&ldquo;{client.totalBalanceComment || 'No commentary set.'}&rdquo;</span>
                        </div>
                        <button
                          onClick={() => {
                            setBalanceCommentText(client.totalBalanceComment || '');
                            setIsBalanceCommentOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg border border-[#29292C] hover:border-[#F5C400] text-xs font-semibold text-[#A9A9AD] hover:text-[#F5C400] transition-colors cursor-pointer shrink-0"
                        >
                          Edit Note
                        </button>
                      </div>

                      {/* Wallets */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-[#F5C400]" />
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Crypto Wallets</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {clientAssetsList.map((asset) => (
                            <div key={asset.id} className="p-4 bg-[#141416] border border-[#29292C] rounded-xl space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white font-mono text-sm">{asset.symbol} • {asset.network}</span>
                                {getSourceBadge(asset.source)}
                              </div>
                              <div className="text-xs text-[#A9A9AD]">
                                <span className="text-white font-bold">{asset.label || asset.name}</span>
                                <div className="font-mono text-[11px] truncate mt-0.5">{asset.walletAddress}</div>
                              </div>
                              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#29292C]">
                                <span className="font-mono font-bold text-[#F5C400]">${asset.balance.toFixed(2)}</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openEditAssetModal(asset)}
                                    className="text-[#737378] hover:text-white transition-colors cursor-pointer text-[11px]"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-[#29292C]">•</span>
                                  <button
                                    onClick={() => { if (selectedClientId) { void firestoreDeleteWallet(asset.id).then(() => loadRealClientData(selectedClientId)); } else { deleteAsset(asset.id, currentActorName); } }}
                                    className="text-red-400 hover:text-red-300 transition-colors cursor-pointer text-[11px]"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bank Accounts */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bank Accounts</h4>
                          </div>
                          <button
                            onClick={() => openAdminAddBankModal(client.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400]/50 text-[11px] font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer hover:text-[#F5C400]"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Bank Account</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {clientBanksList.map((bank) => (
                            <div key={bank.id} className="p-4 bg-[#141416] border border-[#29292C] rounded-xl space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-sm">{bank.bankName}</span>
                                {getSourceBadge(bank.source)}
                              </div>
                              <div className="text-xs text-[#A9A9AD] space-y-0.5">
                                <div><strong className="text-white">Holder:</strong> {bank.accountHolder}</div>
                                <div className="font-mono text-[11px] text-[#F5C400]">{bank.iban}</div>
                                <div className="text-[11px] text-[#737378]">SWIFT: {bank.swiftBic} • {bank.country}</div>
                                {bank.paymentDueAmount != null && bank.paymentDueAmount > 0 && (
                                  <div className="mt-2 p-2 rounded-lg border border-[#F5C400]/25 bg-[#F5C400]/[0.05]">
                                    <div className="text-[10px] uppercase tracking-wider text-[#737378] font-bold">Client Payment Due</div>
                                    <div className="text-[#F5C400] font-mono font-bold text-sm mt-0.5">{bank.paymentDueCurrency === 'USD' ? '$' : '€'}{Number(bank.paymentDueAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    {bank.paymentReference && <div className="text-[10px] text-[#A9A9AD] mt-1">Reference: {bank.paymentReference}</div>}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#29292C]">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">{bank.status}</span>
                                <button
                                  onClick={() => deleteBankAccount(bank.id, currentActorRole, currentActorName)}
                                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer text-[11px]"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cards / Payout Methods */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cards / Payout Methods</h4>
                          </div>
                          <button
                            onClick={() => openAdminAddCardModal(client.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400]/50 text-[11px] font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer hover:text-[#F5C400]"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Assign Payout Card</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {clientCardsList.map((card) => (
                            <div key={card.id} className="p-4 bg-[#141416] border border-[#29292C] rounded-xl space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white font-mono text-sm">{card.cardBrand.toUpperCase()} •••• {card.last4}</span>
                                {getSourceBadge(card.source)}
                              </div>
                              <div className="text-xs text-[#A9A9AD] space-y-0.5">
                                <div className="text-white font-semibold">{card.cardholderName}</div>
                                <div className="font-mono text-[11px] text-[#A9A9AD]">•••• •••• •••• {card.last4}</div>
                                <div className="text-[11px] text-[#737378]">Expires {card.expiryMonth}/{card.expiryYear} • {card.billingCountry}</div>
                                {card.label && (
                                  <div className="text-[11px] text-[#F5C400]/80 italic mt-0.5">{card.label}</div>
                                )}
                              </div>
                              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#29292C]">
                                <span className="text-[10px] text-emerald-400 font-bold">{card.status}</span>
                                <button
                                  onClick={() => deletePayoutCard(card.id, currentActorRole, currentActorName)}
                                  className="text-red-400 hover:text-red-300 transition-colors cursor-pointer text-[11px]"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. CASES */}
                  {clientDetailTab === 'cases' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white">Assigned Investigation Cases</h3>
                        <button
                          onClick={() => openCreateCaseModal(client.id)}
                          className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.admin.createCase}</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {clientCasesList.map((c) => (
                          <div key={c.id} className="p-5 bg-[#141416] border border-[#29292C] rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono text-white text-base">{c.caseNumber}</span>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400">
                                  {c.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 italic mt-1">&ldquo;{c.adminNote}&rdquo;</p>
                              <div className="text-[10px] text-[#737378] mt-1">Created: {c.createdDate} • Updated: {c.lastUpdated}</div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => openEditCaseModal(c)}
                                className="px-3 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#29292C] hover:border-white text-xs font-semibold text-white transition-colors cursor-pointer"
                              >
                                Edit Case
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. TRANSACTIONS */}
                  {clientDetailTab === 'transactions' && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-white">Client Transaction Ledger</h3>
                      <div className="space-y-3">
                        {clientTxList.map((tx) => (
                          <div key={tx.id} className="p-4 bg-[#141416] border border-[#29292C] rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white">{tx.id}</span>
                                <span className="text-xs text-[#737378]">• {tx.type}</span>
                                {getSourceBadge(tx.destinationSource)}
                              </div>
                              <div className="text-xs text-[#A9A9AD] mt-1">
                                {tx.destinationDetails || tx.destinationAddress}
                              </div>
                              {tx.adminComment && (
                                <div className="text-[11px] text-red-400 mt-1">
                                  <strong>Admin Note:</strong> {tx.adminComment}
                                </div>
                              )}
                            </div>

                            <div className="text-right shrink-0 space-y-2">
                              <div className="font-mono font-bold text-white text-base">${tx.amount.toFixed(2)} {tx.asset}</div>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400' : (tx.status === 'Pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400')}`}>
                                {tx.status}
                              </span>
                              {tx.status === 'Pending' && realAllWithdrawals.some(w => w.id === tx.id) && (
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => void firestoreUpdateWithdrawalRequestStatus(tx.id, 'completed')} className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">Approve</button>
                                  <button onClick={() => { setRejectingTxId(tx.id); setRejectionReason(''); setRejectionError(null); }} className="px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold">Reject</button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. DOCUMENTS */}
                  {clientDetailTab === 'documents' && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-white">Uploaded Dossier Evidence</h3>
                      <div className="space-y-3">
                        {clientDocsList.map((d) => (
                          <div key={d.id} className="p-4 bg-[#141416] border border-[#29292C] rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <div className="font-bold text-white">{d.name}</div>
                              <div className="text-xs text-[#737378]">{d.fileType} • {d.fileSize} • Case {d.caseNumber}</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              {d.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. OVERVIEW SUMMARY */}
                  {clientDetailTab === 'overview' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-[#141416] border border-[#29292C] rounded-xl space-y-2">
                        <span className="text-[#737378] font-bold uppercase tracking-wider block">Case File Workflow Status</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={client.caseFileStatus}
                            onChange={(e) => updateClientCaseFileStatus(client.id, e.target.value as CaseFileStatus, currentActorName)}
                            className="bg-[#1C1C1E] border border-[#29292C] rounded-lg px-3 py-2 text-white font-semibold focus:outline-hidden focus:border-[#F5C400]"
                          >
                            <option value="Opened">Opened</option>
                            <option value="Confirming">Confirming</option>
                            <option value="Documents Required">Documents Required</option>
                            <option value="Under Review">Under Review</option>
                            <option value="In Process">In Process</option>
                            <option value="Completed">Completed</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>

                      <div className="p-4 bg-[#141416] border border-[#29292C] rounded-xl space-y-2">
                        <span className="text-[#737378] font-bold uppercase tracking-wider block">Primary Bank Verification</span>
                        <div className="text-white font-mono">{client.bankName} — {client.bankIban}</div>
                        <div className="text-emerald-400 font-semibold">{client.bankStatus}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB: CASES */}
            {activeTab === 'cases' && !selectedClientId && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t.admin.navCases}</h2>
                    <p className="text-xs text-[#A9A9AD] mt-1">
                      Central registry of active and historical investigation files.
                    </p>
                  </div>
                  <button
                    onClick={() => openCreateCaseModal()}
                    className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.admin.createCase}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {realAllCases.map((fc) => {
                        const c: CaseItem = { id: fc.id || '', clientId: fc.clientId, caseNumber: fc.caseNumber, status: fc.status, createdDate: fc.dateCreated || formatFirestoreDate(fc.createdAt), lastUpdated: formatFirestoreDate(fc.updatedAt), adminNote: fc.notes || '' };
                    const client = firebaseUsers.find(cl => cl.id === c.clientId);
                    return (
                      <div key={c.id} className="p-5 bg-[#141416] border border-[#29292C] hover:border-[#F5C400]/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold font-mono text-white text-base">{c.caseNumber}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400">
                              {c.status}
                            </span>
                          </div>
                          <div className="text-xs text-[#A9A9AD] mt-1">
                            Client: <strong className="text-white">{client ? `${client.firstName} ${client.lastName}` : c.clientId}</strong> • Created: {c.createdDate}
                          </div>
                          <p className="text-xs text-slate-300 italic mt-1">&ldquo;{c.adminNote}&rdquo;</p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            onClick={() => openEditCaseModal(c)}
                            className="px-3 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#29292C] hover:border-white text-xs font-semibold text-white transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteCase(c.id, currentActorName)}
                            className="p-1.5 rounded-lg border border-red-500/20 hover:border-red-500 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Case"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: FINANCE */}
            {activeTab === 'finance' && !selectedClientId && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t.admin.navFinance}</h2>
                    <p className="text-xs text-[#A9A9AD] mt-1">
                      Comprehensive master ledger of recorded crypto holdings, bank links, and payout destinations across all clients.
                    </p>
                  </div>
                  <button
                    onClick={() => openAddAssetModal()}
                    className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Asset</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assets.map((asset) => {
                    const client = clients.find(c => c.id === asset.clientId);
                    return (
                      <div key={asset.id} className="p-5 bg-[#141416] border border-[#29292C] rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white font-mono text-base">{asset.symbol} • {asset.network}</span>
                            <div className="text-xs text-[#737378]">Client: <strong className="text-white">{client ? `${client.firstName} ${client.lastName}` : asset.clientId}</strong></div>
                          </div>
                          {getSourceBadge(asset.source)}
                        </div>

                        <div className="p-3 bg-[#1C1C1E] rounded-lg border border-[#29292C] text-xs font-mono space-y-1">
                          <div className="text-[#A9A9AD] truncate">{asset.walletAddress}</div>
                          {asset.label && <div className="text-[11px] text-[#F5C400]">{asset.label}</div>}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#29292C]">
                          <span className="text-base font-bold font-mono text-[#F5C400]">${asset.balance.toFixed(2)}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditAssetModal(asset)}
                              className="text-[#737378] hover:text-white transition-colors cursor-pointer text-xs"
                            >
                              Edit
                            </button>
                            <span className="text-[#29292C]">•</span>
                            <button
                              onClick={() => { if (selectedClientId) { void firestoreDeleteWallet(asset.id).then(() => loadRealClientData(selectedClientId)); } else { deleteAsset(asset.id, currentActorName); } }}
                              className="text-red-400 hover:text-red-300 transition-colors cursor-pointer text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: TRANSACTIONS (Admin Review with Approve / Reject) */}
            {activeTab === 'transactions' && !selectedClientId && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t.admin.navTransactions}</h2>
                    <p className="text-xs text-[#A9A9AD] mt-1">
                      Review withdrawal requests, confirm outbound disbursements, and provide administrative rejection comments.
                    </p>
                  </div>
                </div>

                <div className="bg-[#141416] border border-[#29292C] rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#111112] border-b border-[#29292C] text-[#737378] uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Transaction</th>
                          <th className="py-3 px-4">Client</th>
                          <th className="py-3 px-4">Amount / Asset</th>
                          <th className="py-3 px-4">Destination</th>
                          <th className="py-3 px-4">Source</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#29292C]">
                        {realAllWithdrawals.map((w) => {
                          const tx = {
                            id: w.id || '', clientId: w.clientId, amount: Number(w.amount) || 0, asset: w.currency,
                            date: formatFirestoreDate(w.createdAt), destinationDetails: w.destinationDetails || w.destinationId,
                            destinationAddress: w.destinationId, destinationType: w.destinationType, destinationSource: 'client' as FinancialSource,
                            status: (w.status === 'completed' || w.status === 'approved') ? 'Completed' : w.status === 'rejected' ? 'Rejected' : 'Pending',
                            adminComment: w.adminComment
                          };
                          const client = firebaseUsers.find(c => c.id === tx.clientId);
                          return (
                            <tr key={tx.id} className="hover:bg-[#1C1C1E]/50 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-mono font-bold text-white">{tx.id}</div>
                                <div className="text-[10px] text-[#737378]">{tx.date}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-white">{client ? `${client.firstName} ${client.lastName}` : tx.clientId}</div>
                                <div className="text-[10px] text-[#737378]">{client?.email}</div>
                              </td>

                              <td className="py-3.5 px-4 font-mono font-bold text-white">
                                ${tx.amount.toFixed(2)} <span className="text-[#F5C400] text-xs">{tx.asset}</span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-[11px] text-white font-medium truncate max-w-[200px]" title={tx.destinationDetails || tx.destinationAddress}>
                                  {tx.destinationDetails || tx.destinationAddress}
                                </div>
                                <div className="text-[10px] text-[#737378]">{tx.destinationType}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                {getSourceBadge(tx.destinationSource)}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  tx.status === 'Completed' 
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                    : (tx.status === 'Pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse' : 'bg-red-500/15 text-red-400 border border-red-500/30')
                                }`}>
                                  {tx.status}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                {tx.status === 'Pending' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => void firestoreUpdateWithdrawalRequestStatus(tx.id, 'completed')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 text-[11px] font-bold transition-all cursor-pointer"
                                    >
                                      Mark Completed
                                    </button>
                                    <button
                                      onClick={() => {
                                        setRejectingTxId(tx.id);
                                        setRejectionReason('Destination account requires additional verification.');
                                        setRejectionError(null);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-400 text-[11px] font-bold transition-all cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-[#737378] italic">
                                    {tx.adminComment ? `Note: ${tx.adminComment.substring(0, 25)}...` : 'Processed'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DOCUMENTS */}
            {activeTab === 'documents' && !selectedClientId && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t.admin.navDocuments}</h2>
                    <p className="text-xs text-[#A9A9AD] mt-1">
                      Evidence review queue, bank receipts, and trade authentication exports.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {documents.map((d) => (
                    <div key={d.id} className="p-4 bg-[#141416] border border-[#29292C] rounded-xl flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] flex items-center justify-center text-[#F5C400]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{d.name}</div>
                          <div className="text-xs text-[#737378]">Case {d.caseNumber} • {d.fileType} ({d.fileSize}) • {d.uploadDate}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={d.status}
                          onChange={(e) => updateDocumentStatus(d.id, e.target.value as DocumentReviewStatus, undefined, currentActorName)}
                          className="bg-[#1C1C1E] border border-[#29292C] rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:outline-hidden focus:border-[#F5C400]"
                        >
                          <option value="New">New</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ACTIVITY LOG */}
            {activeTab === 'activity-log' && !selectedClientId && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.admin.navActivityLog}</h2>
                  <p className="text-xs text-[#A9A9AD] mt-1">
                    Immutable security audit trail documenting all user additions, wallet links, withdrawal reviews, and administrative status adjustments.
                  </p>
                </div>

                <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7 space-y-4">
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="p-4 bg-[#1C1C1E] border border-[#29292C] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#F5C400] shrink-0" />
                            <span className="font-semibold text-white">{log.action}</span>
                          </div>
                          <div className="text-[11px] text-[#737378] pl-4">
                            Actor: <strong className="text-slate-300">{log.actor || 'System'}</strong> • Subject: <strong className="text-slate-300">{log.clientName}</strong>
                          </div>
                          {log.newValue && (
                            <div className="text-[11px] text-slate-300 pl-4 font-mono">
                              Detail: {log.newValue}
                            </div>
                          )}
                        </div>

                        <span className="text-[11px] text-[#737378] font-mono shrink-0 pl-4 sm:pl-0">
                          {log.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* CREATE USER MODAL (CLIENT OR ADMIN) */}
      {/* ========================================================================= */}
      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsCreateUserOpen(false)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#F5C400]" />
                <span>{t.admin.createUser}</span>
              </h3>
              <p className="text-xs text-[#A9A9AD] mt-1">
                Provision a new Client dossier account or Administrator access credential.
              </p>
            </div>

            {createUserError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createUserError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCreateUser} className="space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  {t.admin.userType}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateUserType('client');
                      setUserFormRole('client');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 ${createUserType === 'client' ? 'border-[#F5C400] bg-[#F5C400]/10 text-white' : 'border-[#29292C] bg-[#1C1C1E] text-[#A9A9AD]'}`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{t.admin.clientUser}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCreateUserType('admin');
                      setUserFormRole('admin');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 ${createUserType === 'admin' ? 'border-blue-400 bg-blue-500/10 text-white' : 'border-[#29292C] bg-[#1C1C1E] text-[#A9A9AD]'}`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{t.admin.administratorUser}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.auth.firstNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormFirst}
                    onChange={(e) => setUserFormFirst(e.target.value)}
                    placeholder="First name"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.auth.lastNameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormLast}
                    onChange={(e) => setUserFormLast(e.target.value)}
                    placeholder="Last name"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  {t.auth.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={userFormEmail}
                  onChange={(e) => setUserFormEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.admin.tempPassword}
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormPassword}
                    onChange={(e) => setUserFormPassword(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {createUserType === 'client' ? t.admin.userStatusLabel : t.admin.userRoleLabel}
                  </label>
                  {createUserType === 'client' ? (
                    <select
                      value={userFormStatus}
                      onChange={(e) => setUserFormStatus(e.target.value as UserAccountStatus)}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  ) : (
                    <select
                      value={userFormRole}
                      onChange={(e) => setUserFormRole(e.target.value as UserRole)}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                    >
                      <option value="admin">Administrator</option>
                      {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                    </select>
                  )}
                </div>
              </div>

              {createUserType === 'client' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                      {t.auth.phoneLabel}
                    </label>
                    <input
                      type="text"
                      value={userFormPhone}
                      onChange={(e) => setUserFormPhone(e.target.value)}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                      {t.auth.countryLabel}
                    </label>
                    <input
                      type="text"
                      value={userFormCountry}
                      onChange={(e) => setUserFormCountry(e.target.value)}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT USER MODAL */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#F5C400]" />
                <span>Edit User Profile</span>
              </h3>
              <p className="text-xs text-[#A9A9AD] mt-1">
                Update account parameters for {editingUser.email}
              </p>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserFirst}
                    onChange={(e) => setEditUserFirst(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserLast}
                    onChange={(e) => setEditUserLast(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    Account Status
                  </label>
                  <select
                    value={editUserStatus}
                    onChange={(e) => setEditUserStatus(e.target.value as UserAccountStatus)}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    Role
                  </label>
                  <select
                    value={editUserRole}
                    disabled={!isSuperAdmin && editingUser.role === 'super_admin'}
                    onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  >
                    <option value="client">Client</option>
                    <option value="admin">Administrator</option>
                    {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REJECTION REASON MODAL (Admin Transactions) */}
      {/* ========================================================================= */}
      {rejectingTxId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setRejectingTxId(null);
                setRejectionError(null);
              }}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span>{t.admin.rejectionReasonPrompt}</span>
              </h3>
              <p className="text-xs text-[#A9A9AD] mt-1">
                Please provide an official administrative justification. The client will immediately see this rejection explanation.
              </p>
            </div>

            {rejectionError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                {rejectionError}
              </div>
            )}

            <form onSubmit={handleConfirmRejection} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  Rejection Reason / Admin Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Destination account requires additional verification."
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl p-3 text-white focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingTxId(null);
                    setRejectionError(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOTAL BALANCE COMMENT EDIT MODAL */}
      {/* ========================================================================= */}
      {isBalanceCommentOpen && selectedClientId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsBalanceCommentOpen(false)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white">Edit Total Balance Commentary</h3>
              <p className="text-xs text-[#A9A9AD] mt-1">This comment is visible to the client under their Total Balance.</p>
            </div>

            <div className="space-y-4 text-xs">
              <textarea
                rows={3}
                value={balanceCommentText}
                onChange={(e) => setBalanceCommentText(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl p-3 text-white focus:outline-hidden focus:border-[#F5C400]"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsBalanceCommentOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateTotalBalanceComment(selectedClientId, balanceCommentText.trim(), currentActorName);
                    setIsBalanceCommentOpen(false);
                  }}
                  className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CASE CREATION & EDIT MODAL */}
      {/* ========================================================================= */}
      {isCaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsCaseModalOpen(false)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#F5C400]" />
                <span>{editingCase ? t.admin.editCase : t.admin.createCase}</span>
              </h3>
            </div>

            <form onSubmit={handleSaveCase} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Target Client</label>
                <select
                  value={caseFormClient}
                  disabled={Boolean(editingCase)}
                  onChange={(e) => setCaseFormClient(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                >
                  {firebaseUsers.filter(u => u.role === 'client').map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.firstName} {cl.lastName} ({cl.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">{t.dashboard.caseNumber}</label>
                <input
                  type="text"
                  required
                  value={caseFormNumber}
                  onChange={(e) => setCaseFormNumber(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">{t.dashboard.status}</label>
                <select
                  value={caseFormStatus}
                  onChange={(e) => setCaseFormStatus(e.target.value as CaseStatus)}
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                >
                  <option value="Waiting for Documents">Waiting for Documents</option>
                  <option value="In Process">In Process</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">{t.admin.internalNote}</label>
                <textarea
                  rows={3}
                  value={caseFormNote}
                  onChange={(e) => setCaseFormNote(e.target.value)}
                  placeholder="Official status note visible to client..."
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl p-3 text-white focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer"
                >
                  Save Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ASSET CREATION & EDIT MODAL (Admin Finance) */}
      {/* ========================================================================= */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAssetModalOpen(false)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#F5C400]" />
                <span>{editingAsset ? t.admin.editAsset : t.admin.addAsset}</span>
              </h3>
            </div>

            <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Client</label>
                <select
                  value={assetFormClient}
                  disabled={Boolean(editingAsset)}
                  onChange={(e) => setAssetFormClient(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                >
                  {firebaseUsers.filter(u => u.role === 'client').map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.firstName} {cl.lastName} ({cl.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">{t.dashboard.asset}</label>
                  <input
                    type="text"
                    required
                    value={assetFormSymbol}
                    onChange={(e) => setAssetFormSymbol(e.target.value.toUpperCase())}
                    placeholder="BTC, USDT, ETH..."
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">{t.dashboard.network}</label>
                  <input
                    type="text"
                    required
                    value={assetFormNetwork}
                    onChange={(e) => setAssetFormNetwork(e.target.value)}
                    placeholder="Bitcoin, ERC20..."
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={assetFormName}
                    onChange={(e) => setAssetFormName(e.target.value)}
                    placeholder="Bitcoin, Tether USD..."
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Recorded Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={assetFormBalance}
                    onChange={(e) => setAssetFormBalance(e.target.value)}
                    placeholder="400.00"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Assigned Wallet Address</label>
                <input
                  type="text"
                  required
                  value={assetFormWallet}
                  onChange={(e) => setAssetFormWallet(e.target.value)}
                  placeholder="bc1q... or 0x..."
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Administrative Comment</label>
                <input
                  type="text"
                  value={assetFormComment}
                  onChange={(e) => setAssetFormComment(e.target.value)}
                  placeholder="e.g. BTC balance recorded across assigned wallet"
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADMIN ASSIGN CARD / PAYOUT METHOD MODAL */}
      {/* ========================================================================= */}
      {isAdminBankModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsAdminBankModalOpen(false); }}>
          <div className="w-full max-w-lg bg-[#141416] border border-[#343438] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-white">Add Bank Account</h3>
                <p className="text-xs text-[#8B8B90] mt-1">Assign a verified bank account to this client.</p>
              </div>
              <button onClick={() => setIsAdminBankModalOpen(false)} className="text-[#8B8B90] hover:text-white text-2xl cursor-pointer">×</button>
            </div>
            <form onSubmit={handleSaveAdminBank} className="space-y-4">
              {adminBankError && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{adminBankError}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="text-xs text-[#A9A9AD]">Account Holder<input value={adminBankHolder} onChange={e=>setAdminBankHolder(e.target.value)} className="mt-1 w-full bg-[#0F0F10] border border-[#303034] rounded-lg px-3 py-2.5 text-white outline-none focus:border-[#F5C400]" /></label>
                <label className="text-xs text-[#A9A9AD]">Bank Name<input value={adminBankName} onChange={e=>setAdminBankName(e.target.value)} className="mt-1 w-full bg-[#0F0F10] border border-[#303034] rounded-lg px-3 py-2.5 text-white outline-none focus:border-[#F5C400]" /></label>
                <label className="text-xs text-[#A9A9AD]">Country<input value={adminBankCountry} onChange={e=>setAdminBankCountry(e.target.value)} className="mt-1 w-full bg-[#0F0F10] border border-[#303034] rounded-lg px-3 py-2.5 text-white outline-none focus:border-[#F5C400]" /></label>
                <label className="text-xs text-[#A9A9AD]">Label (optional)<input value={adminBankLabel} onChange={e=>setAdminBankLabel(e.target.value)} placeholder="Primary payout account" className="mt-1 w-full bg-[#0F0F10] border border-[#303034] rounded-lg px-3 py-2.5 text-white outline-none focus:border-[#F5C400]" /></label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
                <label className="text-xs text-[#A9A9AD]">Payment Due (optional)
                  <input type="number" min="0" step="0.01" value={adminBankPaymentDue} onChange={e=>setAdminBankPaymentDue(e.target.value)} placeholder="e.g. 150.00" className="mt-1 w-full bg-[#0F0F10] border border-[#303034] rounded-lg px-3 py-2.5 text-white outline-none focus:border-[#F5C400]" />
                </label>
                <label className="text-xs text-[#A9A9AD]">Currency
                  <select value={adminBankPaymentCurrency} onChange={e=>setAdminBankPaymentCurrency(e.target.value as 'USD' | 'EUR')} className="mt-1 w-full bg-[#0F0F10] border border-[#303034] rounded-lg px-3 py-2.5 text-white outline-none focus:border-[#F5C400]">
                    <option value="EUR">€ EUR</option><option value="USD">$ USD</option>
                  </select>
                </label>
              </div>
              <label className="block text-xs text-[#A9A9AD]">Payment Reference / Purpose (optional)<input value={adminBankPaymentReference} onChange={e=>setAdminBankPaymentReference(e.target.value)} placeholder="e.g. Case processing payment" className="mt-1 w-full bg-[#0F0F10] border border-[#303034] rounded-lg px-3 py-2.5 text-white outline-none focus:border-[#F5C400]" /></label>
              <label className="block text-xs text-[#A9A9AD]">IBAN<input value={adminBankIban} onChange={e=>setAdminBankIban(e.target.value)} className="mt-1 w-full bg-[#0F0F10] border border-[#303034] rounded-lg px-3 py-2.5 text-white font-mono outline-none focus:border-[#F5C400]" /></label>
              <label className="block text-xs text-[#A9A9AD]">SWIFT / BIC<input value={adminBankSwift} onChange={e=>setAdminBankSwift(e.target.value)} className="mt-1 w-full bg-[#0F0F10] border border-[#303034] rounded-lg px-3 py-2.5 text-white font-mono outline-none focus:border-[#F5C400]" /></label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsAdminBankModalOpen(false)} className="px-4 py-2.5 rounded-lg border border-[#303034] text-[#C8C8CC] hover:text-white cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#F5C400] text-black font-bold hover:bg-[#FFD51A] cursor-pointer">Save Bank Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdminCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAdminCardModalOpen(false)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Assign Client Payout Card</span>
              </h3>
              <p className="text-xs text-[#A9A9AD] mt-1">
                Assign a Visa or Mastercard payout destination to a client account.
              </p>
            </div>

            {/* PCI-Safe notice */}
            <div className="p-3 bg-[rgba(245,196,0,0.05)] border border-[#F5C400]/25 rounded-xl text-[11px] text-[#A9A9AD] flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#F5C400] shrink-0 mt-0.5" />
              <span>
                <strong>PCI-Safe Security:</strong> CVV/CVC and raw card numbers are never stored in databases or logs. Only safe masked tokens are retained.
              </span>
            </div>

            {adminCardError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{adminCardError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdminCard} className="space-y-4 text-xs">
              {/* Target Client */}
              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Target Client</label>
                <select
                  value={adminCardTargetClient}
                  onChange={(e) => {
                    setAdminCardTargetClient(e.target.value);
                    const cl = clients.find(c => c.id === e.target.value);
                    if (cl) setAdminCardHolder(`${cl.firstName} ${cl.lastName}`);
                  }}
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                >
                  {firebaseUsers.filter(u => u.role === 'client').map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.firstName} {cl.lastName} ({cl.email})</option>
                  ))}
                </select>
              </div>

              {/* 1. CARDHOLDER NAME */}
              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={adminCardHolder}
                  onChange={(e) => setAdminCardHolder(e.target.value)}
                  placeholder="Demo Client"
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              {/* 2. CARD NUMBER with EYE TOGGLE */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#A9A9AD] font-bold uppercase">Card Number</label>
                  <span className="text-[10px] text-[#737378] font-mono">
                    {adminShowCardNumber ? 'Visible' : 'Masked (Default)'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formatAdminCardNumberDisplay(adminCardRawNumber, adminShowCardNumber)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setAdminCardRawNumber('');
                        return;
                      }
                      if (!val.includes('•')) {
                        const digits = val.replace(/\D/g, '').slice(0, 16);
                        setAdminCardRawNumber(digits);
                        if (digits.startsWith('4')) setAdminCardBrand('Visa');
                        else if (digits.startsWith('5')) setAdminCardBrand('Mastercard');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!adminShowCardNumber) {
                        if (e.key >= '0' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                          e.preventDefault();
                          setAdminCardRawNumber(prev => {
                            const next = (prev + e.key).slice(0, 16);
                            if (next.startsWith('4')) setAdminCardBrand('Visa');
                            else if (next.startsWith('5')) setAdminCardBrand('Mastercard');
                            return next;
                          });
                        } else if (e.key === 'Backspace') {
                          e.preventDefault();
                          setAdminCardRawNumber(prev => prev.slice(0, -1));
                        } else if (e.key === 'Delete') {
                          e.preventDefault();
                          setAdminCardRawNumber('');
                        }
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 16);
                      if (pasted) {
                        setAdminCardRawNumber(pasted);
                        if (pasted.startsWith('4')) setAdminCardBrand('Visa');
                        else if (pasted.startsWith('5')) setAdminCardBrand('Mastercard');
                      }
                    }}
                    placeholder="•••• •••• •••• 4582"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-3 pr-10 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                  <button
                    type="button"
                    onClick={() => setAdminShowCardNumber(!adminShowCardNumber)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737378] hover:text-[#F5C400] transition-colors cursor-pointer p-1"
                    title={adminShowCardNumber ? "Mask Card Number" : "Show Card Number"}
                  >
                    {adminShowCardNumber ? (
                      <Eye className="w-4 h-4 text-[#F5C400]" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 3, 4, 5. EXPIRY MONTH, EXPIRY YEAR, CVV / CVC */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Expiry Month</label>
                  <input
                    type="text"
                    maxLength={2}
                    required
                    value={adminCardExpMonth}
                    onChange={(e) => setAdminCardExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="08"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Expiry Year</label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={adminCardExpYear}
                    onChange={(e) => setAdminCardExpYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="29"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">CVV / CVC</label>
                  <div className="relative">
                    <input
                      type={adminShowCvv ? "text" : "password"}
                      maxLength={4}
                      required
                      value={adminCardCvv}
                      onChange={(e) => setAdminCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder={adminShowCvv ? "123" : "•••"}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-3 pr-8 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                    />
                    <button
                      type="button"
                      onClick={() => setAdminShowCvv(!adminShowCvv)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737378] hover:text-[#F5C400] transition-colors cursor-pointer p-1"
                      title={adminShowCvv ? "Hide CVV" : "Show CVV"}
                    >
                      {adminShowCvv ? (
                        <Eye className="w-3.5 h-3.5 text-[#F5C400]" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* 6 & 7. CARD BRAND & BILLING COUNTRY */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Card Brand</label>
                  <select
                    value={adminCardBrand}
                    onChange={(e) => setAdminCardBrand(e.target.value as 'Visa' | 'Mastercard')}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Billing Country</label>
                  <input
                    type="text"
                    required
                    value={adminCardCountry}
                    onChange={(e) => setAdminCardCountry(e.target.value)}
                    placeholder="Germany"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>
              </div>

              {/* 8. OPTIONAL LABEL */}
              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">Optional Label</label>
                <input
                  type="text"
                  value={adminCardLabel}
                  onChange={(e) => setAdminCardLabel(e.target.value)}
                  placeholder="e.g. Admin Assigned Visa"
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdminCardModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer"
                >
                  Assign Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
