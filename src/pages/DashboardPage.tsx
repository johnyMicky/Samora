import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Briefcase, 
  Landmark, 
  ArrowLeftRight, 
  FileText, 
  LifeBuoy, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Phone, 
  Mail, 
  Upload, 
  ArrowUpRight, 
  FileUp, 
  Building2, 
  Wallet, 
  Copy, 
  Check, 
  Plus, 
  Info,
  Calendar,
  Lock,
  CreditCard,
  Trash2,
  Edit3,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../translations';
import { useDemoData } from '../context/DemoDataContext';
import { 
  type FinanceAsset, 
  type BankAccountItem, 
  type PayoutCardItem,
  type FinancialSource
} from '../lib/demoData';
import { LanguageSwitcher } from '../App';
import {
  firestoreGetWalletsForClient,
  firestoreGetBankAccountsForClient,
  firestoreGetPaymentCardsForClient,
  firestoreSubscribeWalletsForClient,
  firestoreSubscribeBankAccountsForClient,
  firestoreSubscribePaymentCardsForClient,
  firestoreAddWallet,
  firestoreUpdateWallet,
  firestoreDeleteWallet,
  firestoreAddBankAccount,
  firestoreUpdateBankAccount,
  firestoreDeleteBankAccount,
  firestoreAddPaymentCard,
  firestoreUpdatePaymentCard,
  firestoreDeletePaymentCard,
  type FirestoreWallet,
  type FirestoreBankAccount,
  type FirestorePaymentCard,
  firestoreSubscribeCases,
  firestoreSubscribeWithdrawalRequests,
  firestoreCreateWithdrawalRequest,
  type FirestoreCase,
  type FirestoreWithdrawalRequest
} from '../lib/firestoreService';
import { fetchCryptoMarketQuotes, type CryptoMarketQuote } from '../lib/cryptoMarket';

type DashboardTab = 'overview' | 'my-case' | 'my-finance' | 'transactions' | 'documents' | 'support' | 'profile';

export const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
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
    uploadDocument
  } = useDemoData();

  // Resolve active client ID (defaults to demo_client_user ONLY if user is explicitly a demo account)
  const isDemoUser = Boolean(user && (user.id === 'demo_client_user' || user.email === 'demo@bafinsolution.com' || user.email === 'client@demo.local'));
  const activeClientId = isDemoUser ? 'demo_client_user' : (user?.id || '');

  const clientProfile = getClientProfile(activeClientId);

  // Real Firebase finance state. Admin and client now read/write the SAME Firestore collections.
  const [realWallets, setRealWallets] = useState<FirestoreWallet[]>([]);
  const [realBanks, setRealBanks] = useState<FirestoreBankAccount[]>([]);
  const [realCards, setRealCards] = useState<FirestorePaymentCard[]>([]);

  const loadRealFinance = useCallback(async () => {
    if (!activeClientId) return;
    try {
      const [wallets, banks, cards] = await Promise.all([
        firestoreGetWalletsForClient(activeClientId),
        firestoreGetBankAccountsForClient(activeClientId),
        firestoreGetPaymentCardsForClient(activeClientId)
      ]);
      setRealWallets(wallets);
      setRealBanks(banks);
      setRealCards(cards);
    } finally {
      // Keep the last successfully loaded state if a transient request fails.
    }
  }, [activeClientId]);

  useEffect(() => {
    if (!activeClientId) return;
    void loadRealFinance();
    const unsubWallets = firestoreSubscribeWalletsForClient(activeClientId, setRealWallets);
    const unsubBanks = firestoreSubscribeBankAccountsForClient(activeClientId, setRealBanks);
    const unsubCards = firestoreSubscribePaymentCardsForClient(activeClientId, setRealCards);
    return () => { unsubWallets(); unsubBanks(); unsubCards(); };
  }, [activeClientId, loadRealFinance]);

  const clientAssets: FinanceAsset[] = realWallets.map(w => ({
    id: w.id || '', clientId: w.clientId, symbol: w.asset, name: w.label || w.asset,
    network: w.network, balance: Number(w.balance) || 0, walletAddress: w.walletAddress,
    label: w.label, source: w.source, createdAt: '', updatedAt: ''
  }));
  const clientBankAccounts: BankAccountItem[] = realBanks.map(b => ({
    id: b.id || '', clientId: b.clientId, accountHolder: b.accountHolder, bankName: b.bankName,
    country: b.country, iban: b.iban, swiftBic: b.swiftBic, label: b.label,
    status: b.status as BankAccountItem['status'], source: b.source, createdAt: '', updatedAt: ''
  }));
  const clientPayoutCards: PayoutCardItem[] = realCards.map(c => ({
    id: c.id || '', clientId: c.clientId, cardholderName: c.cardholderName, cardBrand: c.brand,
    last4: c.last4, expiryMonth: c.expiryMonth, expiryYear: c.expiryYear,
    billingCountry: c.billingCountry, label: c.label, source: c.source,
    status: c.status, createdAt: '', updatedAt: ''
  }));
  const totalBalance = clientAssets.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  // Live market quotes are display-only. Recorded balances remain the admin-assigned USD values.
  const [marketQuotes, setMarketQuotes] = useState<Record<string, CryptoMarketQuote>>({});
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState(false);

  useEffect(() => {
    const symbols = [...new Set(clientAssets.map(a => a.symbol?.toUpperCase()).filter(Boolean))];
    if (!symbols.length) { setMarketQuotes({}); return; }
    let cancelled = false;
    const load = async () => {
      setMarketLoading(true);
      try {
        const quotes = await fetchCryptoMarketQuotes(symbols);
        if (!cancelled) { setMarketQuotes(quotes); setMarketError(false); }
      } catch {
        if (!cancelled) setMarketError(true);
      } finally {
        if (!cancelled) setMarketLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(load, 60_000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [clientAssets.map(a => a.symbol?.toUpperCase()).sort().join('|')]);

  const renderSparkline = (values: number[]) => {
    if (values.length < 2) return null;
    const sample = values.filter((_, i) => i % Math.max(1, Math.floor(values.length / 48)) === 0).slice(-48);
    const min = Math.min(...sample), max = Math.max(...sample), range = max - min || 1;
    const points = sample.map((v, i) => `${(i / Math.max(1, sample.length - 1)) * 100},${30 - ((v - min) / range) * 28}`).join(' ');
    return <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-12" aria-label="7 day market price chart"><polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.8" vectorEffect="non-scaling-stroke" /></svg>;
  };
  const [realCases, setRealCases] = useState<FirestoreCase[]>([]);
  const [realWithdrawals, setRealWithdrawals] = useState<FirestoreWithdrawalRequest[]>([]);

  useEffect(() => {
    if (!activeClientId) return;
    const unsubCases = firestoreSubscribeCases(activeClientId, setRealCases);
    const unsubWithdrawals = firestoreSubscribeWithdrawalRequests(activeClientId, setRealWithdrawals);
    return () => { unsubCases(); unsubWithdrawals(); };
  }, [activeClientId]);

  const clientCases = realCases.map(c => ({
    id: c.id || '', clientId: c.clientId, caseNumber: c.caseNumber, status: c.status,
    createdDate: c.dateCreated || '', lastUpdated: '', adminNote: c.notes || ''
  }));
  const clientTransactions = realWithdrawals.map(w => ({
    id: w.id || '', clientId: w.clientId, type: 'Withdrawal' as const, asset: w.currency,
    network: '', amount: Number(w.amount) || 0, date: w.createdAt?.toDate?.()?.toLocaleDateString?.('en-US') || '',
    status: (w.status === 'completed' || w.status === 'approved') ? 'Completed' as const : w.status === 'rejected' ? 'Rejected' as const : 'Pending' as const,
    destinationType: w.destinationType as any, destinationAddress: w.destinationId,
    destinationDetails: w.destinationDetails || w.destinationId, destinationSource: 'client' as const,
    adminComment: w.adminComment
  }));
  const clientDocuments = getClientDocuments(activeClientId);
  const clientActivity = getClientActivityLogs(activeClientId);

  // Authenticated user identity resolution — strictly user-specific, never fall back to "Demo Client" for real users
  const clientFirstName = user?.firstName || clientProfile?.firstName || user?.displayName?.split(' ')[0] || '';
  const clientLastName = user?.lastName || clientProfile?.lastName || user?.displayName?.split(' ').slice(1).join(' ') || '';
  const clientFullName = (user?.displayName || `${clientFirstName} ${clientLastName}`.trim()) || (clientProfile ? `${clientProfile.firstName} ${clientProfile.lastName}` : (user?.email ? user.email.split('@')[0] : 'Client'));
  const clientEmail = user?.email || clientProfile?.email || '';
  const clientCountry = user?.country || clientProfile?.country || 'Germany';
  const clientRegisteredDate = user?.createdAt 
    ? (user.createdAt.includes('T') ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : user.createdAt)
    : (clientProfile?.createdAt || 'Recently registered');
  const clientAccountStatus = user ? (user.status === 'active' ? 'Active Client Account' : user.status) : (clientProfile?.accountStatus || 'Verified Client Account');

  // Case File Status: NEVER display "IN PROCESS" unless authenticated client has real case data!
  const hasActiveCase = clientCases.length > 0 || Boolean(clientProfile?.caseFileStatus);
  const activeCaseStatus = clientCases.length > 0 
    ? clientCases[0].status 
    : (clientProfile?.caseFileStatus || null);

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // =========================================================================
  // FINANCIAL ACCOUNT MODALS STATE
  // =========================================================================
  // Add Wallet Modal
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [walletFormAsset, setWalletFormAsset] = useState('USDT');
  const [walletFormNetwork, setWalletFormNetwork] = useState('TRC20');
  const [walletFormAddress, setWalletFormAddress] = useState('');
  const [walletFormLabel, setWalletFormLabel] = useState('My Personal Wallet');

  // Add Bank Account Modal
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [bankFormHolder, setBankFormHolder] = useState(clientFullName);
  const [bankFormName, setBankFormName] = useState('');
  const [bankFormCountry, setBankFormCountry] = useState(clientCountry);
  const [bankFormIban, setBankFormIban] = useState('');
  const [bankFormSwift, setBankFormSwift] = useState('');
  const [bankFormLabel, setBankFormLabel] = useState('');

  // Add Card Modal (Safe Demo Presentation with normal input experience)
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardFormHolder, setCardFormHolder] = useState(clientFullName);
  const [cardFormRawNumber, setCardFormRawNumber] = useState('');
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [cardFormExpMonth, setCardFormExpMonth] = useState('08');
  const [cardFormExpYear, setCardFormExpYear] = useState('29');
  const [cardFormCvv, setCardFormCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [cardFormBrand, setCardFormBrand] = useState<'Visa' | 'Mastercard'>('Visa');
  const [cardFormCountry, setCardFormCountry] = useState(clientCountry);
  const [cardFormLabel, setCardFormLabel] = useState('');
  const [cardFormError, setCardFormError] = useState<string | null>(null);

  // Helper to format card number with visual spaces and mask bullets
  const formatCardNumberDisplay = (rawDigits: string, isPlainVisible: boolean) => {
    const digits = rawDigits.replace(/\D/g, '').slice(0, 16);
    if (!digits) return '';
    if (isPlainVisible) {
      return digits.match(/.{1,4}/g)?.join(' ') || digits;
    }
    // Eye closed: mask all digits except last 4: •••• •••• •••• 4582
    if (digits.length <= 4) {
      return '•'.repeat(digits.length);
    }
    const maskedLen = digits.length - 4;
    const maskedPart = '•'.repeat(maskedLen) + digits.slice(-4);
    return maskedPart.match(/.{1,4}/g)?.join(' ') || maskedPart;
  };

  // Edit / Delete Modal State for Client-Created items
  const [editingItem, setEditingItem] = useState<{ type: 'wallet' | 'bank' | 'card'; item: FinanceAsset | BankAccountItem | PayoutCardItem } | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editAddressOrIban, setEditAddressOrIban] = useState('');

  const [deletingItem, setDeletingItem] = useState<{ type: 'wallet' | 'bank' | 'card'; id: string; name: string } | null>(null);

  // =========================================================================
  // WITHDRAWAL REQUEST MODAL STATE (2 Steps)
  // =========================================================================
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState<'form' | 'confirm'>('form');
  const [selectedDestinationKey, setSelectedDestinationKey] = useState<string>('');
  const [withdrawAsset, setWithdrawAsset] = useState<string>(clientAssets[0]?.symbol || 'USDT');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawNote, setWithdrawNote] = useState<string>('');
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Document Upload State
  const [selectedCaseForDoc, setSelectedCaseForDoc] = useState<string>(
    clientCases.length > 0 ? clientCases[0].caseNumber : ''
  );
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const navItems: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: t.dashboard.navOverview, icon: LayoutDashboard },
    { id: 'my-case', label: t.dashboard.navMyCase, icon: Briefcase },
    { id: 'my-finance', label: t.dashboard.navFinance, icon: Landmark },
    { id: 'transactions', label: t.dashboard.navTransactions, icon: ArrowLeftRight },
    { id: 'documents', label: t.dashboard.navDocuments, icon: FileText },
    { id: 'support', label: t.dashboard.navSupport, icon: LifeBuoy },
    { id: 'profile', label: t.dashboard.navProfile, icon: UserIcon },
  ];

  // Helper to compile all selectable withdrawal destinations
  const allDestinations = [
    ...clientAssets.map(a => ({
      id: a.id,
      key: `wallet_${a.id}`,
      type: 'Crypto Wallet' as const,
      title: `${a.symbol} ${a.network} Wallet`,
      details: a.walletAddress,
      label: a.label || a.name,
      source: a.source,
      asset: a.symbol,
      network: a.network
    })),
    ...clientBankAccounts.map(b => ({
      id: b.id,
      key: `bank_${b.id}`,
      type: 'Bank Account' as const,
      title: `${b.bankName} (${b.country})`,
      details: b.iban,
      label: b.label || b.accountHolder,
      source: b.source,
      asset: 'EUR / USD',
      network: 'SEPA / Wire'
    })),
    ...clientPayoutCards.map(c => ({
      id: c.id,
      key: `card_${c.id}`,
      type: 'Card / Payout Method' as const,
      title: `${c.cardBrand} •••• ${c.last4}`,
      details: `${c.cardholderName} • Expires ${c.expiryMonth}/${c.expiryYear}`,
      label: c.label || `${c.cardBrand} Payout Card`,
      source: c.source,
      asset: 'USD / EUR',
      network: 'Card Payout'
    }))
  ];

  // =========================================================================
  // HANDLERS FOR FINANCIAL DESTINATIONS
  // =========================================================================
  const handleAddWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletFormAddress.trim()) return;

    await firestoreAddWallet({
      clientId: activeClientId, asset: walletFormAsset.toUpperCase(), network: walletFormNetwork,
      walletAddress: walletFormAddress.trim(), label: walletFormLabel.trim() || undefined,
      source: 'client', status: 'Active', balance: 0
    });
    await loadRealFinance();

    setWalletFormAddress('');
    setIsAddWalletOpen(false);
  };

  const handleAddBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankFormIban.trim() || !bankFormName.trim()) return;

    await firestoreAddBankAccount({
      clientId: activeClientId, accountHolder: bankFormHolder.trim(), bankName: bankFormName.trim(),
      country: bankFormCountry.trim(), iban: bankFormIban.trim(), swiftBic: bankFormSwift.trim(),
      label: bankFormLabel.trim() || undefined, source: 'client', status: 'Verified'
    });
    await loadRealFinance();

    setIsAddBankOpen(false);
  };

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardFormError(null);

    const holder = cardFormHolder.trim();
    if (!holder) {
      setCardFormError('Cardholder Name is required.');
      return;
    }

    const cleanDigits = cardFormRawNumber.replace(/\D/g, '');
    if (cleanDigits.length < 15 || cleanDigits.length > 19) {
      setCardFormError('Please enter a valid card number (16 digits).');
      return;
    }

    const monthNum = parseInt(cardFormExpMonth, 10);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      setCardFormError('Expiry Month must be between 01 and 12.');
      return;
    }

    const yearNum = parseInt(cardFormExpYear, 10);
    if (isNaN(yearNum) || (cardFormExpYear.length === 2 && yearNum < 24) || (cardFormExpYear.length === 4 && yearNum < 2024)) {
      setCardFormError('Expiry Year must be 2024 or later.');
      return;
    }

    const cleanCvv = cardFormCvv.replace(/\D/g, '');
    if (cleanCvv.length < 3 || cleanCvv.length > 4) {
      setCardFormError('CVV / CVC must be 3 or 4 digits.');
      return;
    }

    // Extract safe representative last 4 digits
    const last4 = cleanDigits.slice(-4);
    const formattedExpMonth = cardFormExpMonth.trim().padStart(2, '0');
    const formattedExpYear = cardFormExpYear.trim().length === 4 ? cardFormExpYear.trim().slice(-2) : cardFormExpYear.trim();

    // CRITICAL SECURITY RULE: IMMEDIATELY DISCARD raw card number and CVV
    // CVV and raw PAN are NEVER persisted or stored in state/storage.
    setCardFormCvv('');
    setCardFormRawNumber('');

    await firestoreAddPaymentCard({
      clientId: activeClientId, cardholderName: holder, brand: cardFormBrand, last4,
      expiryMonth: formattedExpMonth, expiryYear: formattedExpYear,
      billingCountry: cardFormCountry.trim() || 'Germany', label: cardFormLabel.trim() || undefined,
      source: 'client', status: 'Active'
    });
    await loadRealFinance();

    setIsAddCardOpen(false);
  };

  const handleOpenEdit = (type: 'wallet' | 'bank' | 'card', item: FinanceAsset | BankAccountItem | PayoutCardItem) => {
    // Security check: Only client-created accounts can be edited by client
    if (item.source === 'admin') return;

    setEditingItem({ type, item });
    if (type === 'wallet') {
      const w = item as FinanceAsset;
      setEditLabel(w.label || '');
      setEditAddressOrIban(w.walletAddress);
    } else if (type === 'bank') {
      const b = item as BankAccountItem;
      setEditLabel(b.label || '');
      setEditAddressOrIban(b.iban);
    } else if (type === 'card') {
      const c = item as PayoutCardItem;
      setEditLabel(c.label || '');
      setEditAddressOrIban(c.cardholderName);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const actorName = clientFullName;

    if (editingItem.type === 'wallet') {
      await firestoreUpdateWallet(editingItem.item.id, { label: editLabel.trim() || undefined, walletAddress: editAddressOrIban.trim() });
    } else if (editingItem.type === 'bank') {
      await firestoreUpdateBankAccount(editingItem.item.id, { label: editLabel.trim() || undefined, iban: editAddressOrIban.trim() });
    } else if (editingItem.type === 'card') {
      await firestoreUpdatePaymentCard(editingItem.item.id, { label: editLabel.trim() || undefined, cardholderName: editAddressOrIban.trim() });
    }
    await loadRealFinance();
    setEditingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const actorName = clientFullName;

    if (deletingItem.type === 'wallet') {
      await firestoreDeleteWallet(deletingItem.id);
    } else if (deletingItem.type === 'bank') {
      await firestoreDeleteBankAccount(deletingItem.id);
    } else if (deletingItem.type === 'card') {
      await firestoreDeletePaymentCard(deletingItem.id);
    }
    await loadRealFinance();
    setDeletingItem(null);
  };

  // =========================================================================
  // WITHDRAWAL FLOW
  // =========================================================================
  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);

    if (allDestinations.length === 0) {
      setWithdrawError('Please add a payout destination (wallet, bank account, or card) in the Finance tab first.');
      return;
    }

    const numAmount = parseFloat(withdrawAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }

    setWithdrawStep('confirm');
  };

  const handleConfirmWithdrawal = async () => {
    setWithdrawError(null);
    const numAmount = parseFloat(withdrawAmount);

    const targetDest = allDestinations.find(d => d.key === selectedDestinationKey) || allDestinations[0];
    if (!targetDest) {
      setWithdrawError('Please select a valid payout destination.');
      return;
    }

    try {
      await firestoreCreateWithdrawalRequest({
        clientId: activeClientId,
        amount: numAmount,
        currency: withdrawAsset,
        destinationType: targetDest.type,
        destinationId: targetDest.id,
        destinationDetails: `${targetDest.title} (${targetDest.details})`,
        note: withdrawNote.trim(),
        status: 'pending'
      });

      setWithdrawSuccessMsg(t.dashboard.withdrawalSubmitted);
      setTimeout(() => {
        setWithdrawSuccessMsg(null);
        setIsWithdrawModalOpen(false);
        setWithdrawStep('form');
        setWithdrawAmount('');
        setWithdrawNote('');
      }, 1600);
    } catch (err: any) {
      console.error('Withdrawal request failed:', err);
      const code = err?.code ? String(err.code).replace('firestore/', '') : '';
      const message = err?.message ? String(err.message) : '';
      if (code === 'permission-denied' || message.includes('permission')) {
        setWithdrawError('Withdrawal could not be submitted because Firestore denied the request. Please contact support.');
      } else if (code === 'invalid-argument' || message.includes('Unsupported field value')) {
        setWithdrawError('Withdrawal contains an invalid value. Please review the fields and retry.');
      } else {
        setWithdrawError(`Failed to submit withdrawal request${code ? ` (${code})` : ''}. Please retry.`);
      }
    }
  };

  // Document Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInKb = (file.size / 1024).toFixed(0);
    const sizeStr = Number(sizeInKb) > 1024 
      ? `${(Number(sizeInKb) / 1024).toFixed(1)} MB` 
      : `${sizeInKb} KB`;

    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

    await uploadDocument(
      activeClientId,
      file.name,
      ext,
      sizeStr,
      selectedCaseForDoc || 'General',
      clientFullName
    );

    setUploadSuccessMsg(t.dashboard.documentUploadedSuccess);
    setTimeout(() => setUploadSuccessMsg(null), 3000);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSourceBadge = (source: FinancialSource) => {
    if (source === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5C400]/10 border border-[#F5C400]/30 text-[#F5C400]">
          <Lock className="w-2.5 h-2.5" />
          <span>{t.dashboard.addedByAdmin}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
        <UserIcon className="w-2.5 h-2.5" />
        <span>{t.dashboard.addedByClient}</span>
      </span>
    );
  };

  const getCaseBadge = (status: string) => {
    switch (status) {
      case 'In Process':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400">{t.dashboard.statusInProcess}</span>;
      case 'Waiting for Documents':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400">{t.dashboard.statusWaitingDocs}</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 border border-red-500/30 text-red-400">{t.dashboard.statusRejected}</span>;
      case 'Done':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">{t.dashboard.statusDone}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-500/15 border border-zinc-500/30 text-zinc-300">{status}</span>;
    }
  };

  const getTxBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">Completed</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 animate-pulse">Pending</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 border border-red-500/30 text-red-400">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-500/15 border border-zinc-500/30 text-zinc-300">{status}</span>;
    }
  };

  const getDocBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Accepted</span>;
      case 'Reviewed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">Reviewed</span>;
      case 'New':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">New</span>;
      case 'Rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-500/15 text-zinc-300 border border-zinc-500/30">{status}</span>;
    }
  };

  const pendingTxCount = clientTransactions.filter(t => t.status === 'Pending').length;

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
            <div className="w-8 h-8 bg-linear-to-br from-[#F5C400] to-[#B89100] rounded-lg flex items-center justify-center shadow-md shadow-[#F5C400]/20 group-hover:scale-105 transition-transform">
              <Shield className="text-[#0B0B0C] w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-display font-bold text-white tracking-tight leading-none">
                Bafin Solution
              </span>
              <span className="text-[10px] text-[#A9A9AD] tracking-wider uppercase font-semibold">
                Client Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher />

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#29292C]">
            <div className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-[#F5C400]/30 flex items-center justify-center text-[#F5C400] font-bold text-xs">
              {(clientFirstName || clientFullName || 'C').charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-xs hidden md:block">
              <div className="font-bold text-white truncate max-w-[130px]">
                {clientFullName}
              </div>
              <div className="text-[10px] text-[#F5C400] font-mono">
                {clientAccountStatus}
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="text-xs font-semibold text-[#A9A9AD] hover:text-[#F5C400] flex items-center gap-1 transition-colors px-2 py-1 rounded-md"
            title="Return to public landing page"
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
          {/* Navigation Links */}
          <div className="p-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#737378]">
              {t.dashboard.title}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer
                    ${isActive 
                      ? 'bg-[#F5C400] text-[#0B0B0C] shadow-md shadow-[#F5C400]/20 font-bold' 
                      : 'text-[#A9A9AD] hover:text-white hover:bg-[#1C1C1E]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0B0B0C]' : 'text-[#737378]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.id === 'my-case' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#0B0B0C] text-[#F5C400]' : 'bg-[#1C1C1E] text-[#A9A9AD]'}`}>
                      {clientCases.length}
                    </span>
                  )}
                  {item.id === 'transactions' && pendingTxCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#0B0B0C] text-[#F5C400]' : 'bg-amber-500/20 text-amber-400'}`}>
                      {pendingTxCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer with Case File Status */}
          <div className="p-4 border-t border-[#29292C] space-y-3">
            <div className="p-3 bg-[#161617] rounded-xl border border-[#29292C] text-xs">
              <div className="text-[10px] text-[#737378] uppercase font-bold tracking-wider">
                {t.dashboard.caseStatusLabel}
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                {hasActiveCase && activeCaseStatus ? (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider bg-blue-500/10 border-blue-500/30 text-blue-400">
                    {activeCaseStatus}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium border uppercase tracking-wider bg-[#1C1C1E] border-[#29292C] text-[#737378]">
                    No active case
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#737378] mt-1.5">
                {hasActiveCase ? 'Admin-controlled verification file' : 'Awaiting administrative assignment'}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.nav.logout}</span>
            </button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
          />
        )}

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto bg-[#0B0B0C] p-4 sm:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#F5C400]/10 to-transparent pointer-events-none" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[rgba(245,196,0,0.1)] border border-[rgba(245,196,0,0.2)] text-[#F5C400] text-[10px] font-bold uppercase tracking-wider mb-2">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{clientAccountStatus}</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                        {t.dashboard.welcomeBack}, {clientFullName}
                      </h1>
                      <p className="text-xs sm:text-sm text-[#A9A9AD] mt-1">
                        {t.dashboard.subtitle}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('my-finance')}
                      className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-center"
                    >
                      <Landmark className="w-4 h-4" />
                      <span>{t.dashboard.navFinance}</span>
                    </button>
                  </div>
                </div>

                {/* 4 Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#141416] border border-[#29292C] rounded-xl p-5 hover:border-[#F5C400]/30 transition-all">
                    <div className="flex items-center justify-between text-xs text-[#737378] font-bold uppercase tracking-wider">
                      <span>{t.dashboard.totalBalance}</span>
                      <Landmark className="w-4 h-4 text-[#F5C400]" />
                    </div>
                    <div className="mt-3 text-2xl font-bold font-mono text-[#F5C400]">
                      ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-[11px] text-[#A9A9AD] mt-1">Recorded assets across wallets</p>
                  </div>

                  <div className="bg-[#141416] border border-[#29292C] rounded-xl p-5 hover:border-[#F5C400]/30 transition-all">
                    <div className="flex items-center justify-between text-xs text-[#737378] font-bold uppercase tracking-wider">
                      <span>{t.dashboard.activeCases}</span>
                      <Briefcase className="w-4 h-4 text-[#F5C400]" />
                    </div>
                    <div className="mt-3 text-2xl font-bold text-white">
                      {clientCases.length}
                    </div>
                    <p className="text-[11px] text-[#A9A9AD] mt-1">Assigned by administration</p>
                  </div>

                  <div className="bg-[#141416] border border-[#29292C] rounded-xl p-5 hover:border-[#F5C400]/30 transition-all">
                    <div className="flex items-center justify-between text-xs text-[#737378] font-bold uppercase tracking-wider">
                      <span>{t.dashboard.documentsCount}</span>
                      <FileText className="w-4 h-4 text-[#F5C400]" />
                    </div>
                    <div className="mt-3 text-2xl font-bold text-white">
                      {clientDocuments.length}
                    </div>
                    <p className="text-[11px] text-[#A9A9AD] mt-1">Uploaded evidence files</p>
                  </div>

                  <div className="bg-[#141416] border border-[#29292C] rounded-xl p-5 hover:border-[#F5C400]/30 transition-all">
                    <div className="flex items-center justify-between text-xs text-[#737378] font-bold uppercase tracking-wider">
                      <span>{t.dashboard.pendingTransactions}</span>
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="mt-3 text-2xl font-bold text-amber-400">
                      {pendingTxCount}
                    </div>
                    <p className="text-[11px] text-[#A9A9AD] mt-1">In administrative queue</p>
                  </div>
                </div>

                {/* Recent Activity List */}
                <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#F5C400]" />
                      <span>{t.dashboard.recentActivity}</span>
                    </h3>
                  </div>

                  {clientActivity.length === 0 ? (
                    <div className="p-8 bg-[#1C1C1E]/50 border border-[#29292C] rounded-xl text-center">
                      <Clock className="w-6 h-6 text-[#737378] mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-[#A9A9AD]">No recent activity yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientActivity.map((act) => (
                        <div key={act.id} className="p-3.5 bg-[#1C1C1E] border border-[#29292C] rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-[#F5C400] shrink-0" />
                            <span className="text-white font-medium">
                              {act.action} {act.details && <span className="text-[#A9A9AD]">({act.details})</span>}
                            </span>
                          </div>
                          <span className="text-[#737378] font-mono text-[11px]">{act.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: MY CASE */}
            {activeTab === 'my-case' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.dashboard.navMyCase}</h2>
                  <p className="text-xs text-[#A9A9AD] mt-1">
                    Assigned forensic investigation cases and administrative status updates.
                  </p>
                </div>

                {clientCases.length === 0 ? (
                  <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-10 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center mx-auto mb-4 text-[#737378]">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">No Active Case</h3>
                    <p className="text-xs text-[#737378] max-w-sm mx-auto">
                      You currently do not have an active investigation case assigned. Once our forensic team opens your case file, status updates and administrative notes will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clientCases.map((c) => (
                      <div 
                        key={c.id}
                        className="bg-[#141416] border border-[#29292C] hover:border-[#F5C400]/40 rounded-2xl p-6 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#29292C] pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F5C400]/10 border border-[#F5C400]/25 flex items-center justify-center text-[#F5C400]">
                              <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-[10px] text-[#737378] uppercase font-bold tracking-wider">{t.dashboard.caseNumber}</div>
                              <div className="text-lg font-bold font-mono text-white">{c.caseNumber}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {getCaseBadge(c.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-3 bg-[#1C1C1E] rounded-xl border border-[#29292C]">
                            <div className="text-[#737378] font-medium flex items-center gap-1.5 mb-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{t.dashboard.createdDate}</span>
                            </div>
                            <div className="text-white font-semibold">{c.createdDate}</div>
                          </div>

                          <div className="p-3 bg-[#1C1C1E] rounded-xl border border-[#29292C]">
                            <div className="text-[#737378] font-medium flex items-center gap-1.5 mb-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{t.dashboard.lastUpdated}</span>
                            </div>
                            <div className="text-white font-semibold">{c.lastUpdated}</div>
                          </div>
                        </div>

                        {c.adminNote && (
                          <div className="p-4 bg-[rgba(245,196,0,0.04)] border border-[#F5C400]/25 rounded-xl">
                            <div className="text-[#F5C400] text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5" />
                              <span>{t.dashboard.adminNote}</span>
                            </div>
                            <p className="text-xs text-slate-300 italic leading-relaxed">
                              &ldquo;{c.adminNote}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MY FINANCE (Unified Financial Accounts) */}
            {activeTab === 'my-finance' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t.dashboard.navFinance}</h2>
                    <p className="text-xs text-[#A9A9AD] mt-1">
                      Unified financial overview of recorded assets, client-added wallets, bank accounts, and payout methods.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setWithdrawStep('form');
                      setIsWithdrawModalOpen(true);
                    }}
                    className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 flex items-center gap-2 cursor-pointer self-start sm:self-center"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{t.dashboard.requestWithdrawal}</span>
                  </button>
                </div>

                {/* Prominent Total Balance Card */}
                <div className="bg-[#141416] border border-[#F5C400]/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#F5C400]/15 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#A9A9AD] uppercase tracking-widest block">
                        {t.dashboard.totalBalance}
                      </span>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#F5C400] mt-1">
                        ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#F5C400]/10 border border-[#F5C400]/30 flex items-center justify-center text-[#F5C400]">
                      <Landmark className="w-7 h-7" />
                    </div>
                  </div>

                  {clientProfile?.totalBalanceComment && (
                    <div className="mt-4 pt-4 border-t border-[#29292C] text-xs text-[#A9A9AD] flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#F5C400] shrink-0 mt-0.5" />
                      <span>{clientProfile.totalBalanceComment}</span>
                    </div>
                  )}

                  <div className="mt-4 text-[11px] text-[#737378] font-mono">
                    Total recorded balance: {clientAssets.filter(a => a.balance > 0).map(a => `${a.symbol} ($${a.balance.toFixed(2)})`).join(' + ') || '$0.00'} = ${totalBalance.toFixed(2)}
                  </div>
                </div>

                {/* 1. CRYPTO WALLETS SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-[#F5C400]" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        {t.dashboard.cryptoWalletsTitle}
                      </h3>
                      <span className="text-xs text-[#737378]">({clientAssets.length})</span>
                    </div>

                    <button
                      onClick={() => setIsAddWalletOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400]/50 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer hover:text-[#F5C400]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.dashboard.addWallet}</span>
                    </button>
                  </div>

                  {clientAssets.length === 0 ? (
                    <div className="bg-[#141416] border border-[#29292C] rounded-xl p-8 text-center">
                      <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center mx-auto mb-3 text-[#737378]">
                        <Wallet className="w-5 h-5 text-[#F5C400]" />
                      </div>
                      <div className="text-xs font-semibold text-white">No crypto wallets connected yet</div>
                      <div className="text-[11px] text-[#737378] mt-1">Click &ldquo;+ Add Wallet&rdquo; above to link your external cryptocurrency payout address.</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {clientAssets.map((asset) => (
                        <div 
                          key={asset.id}
                          className="bg-[#141416] border border-[#29292C] hover:border-[#F5C400]/40 rounded-xl p-5 transition-all flex flex-col justify-between space-y-4"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-[#1C1C1E] border border-[#29292C] text-xs font-bold text-white font-mono">
                                  {asset.symbol}
                                </span>
                                <span className="text-[10px] text-[#737378] font-bold uppercase tracking-wider">
                                  {asset.network}
                                </span>
                              </div>
                              {getSourceBadge(asset.source)}
                            </div>

                            <div className="mt-3">
                              <div className="text-xl font-bold font-mono text-white">
                                {asset.balance > 0 
                                  ? `$${asset.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                  : <span className="text-xs text-[#737378] font-sans font-normal">Payout Destination</span>
                                }
                              </div>
                              <div className="text-xs text-[#A9A9AD] mt-0.5 font-medium">
                                {asset.label || asset.name}
                              </div>
                            </div>

                            {(() => {
                              const quote = marketQuotes[asset.symbol?.toUpperCase()];
                              const tokenAmount = quote && asset.balance > 0 ? asset.balance / quote.priceUsd : null;
                              return (
                                <div className="mt-4 rounded-lg border border-[#29292C] bg-[#101012] p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="text-[9px] uppercase tracking-widest text-[#737378] font-bold">Live market price</div>
                                      <div className="text-sm font-mono font-bold text-white mt-1">
                                        {quote ? `$${quote.priceUsd.toLocaleString('en-US', { maximumFractionDigits: quote.priceUsd < 1 ? 6 : 2 })}` : marketLoading ? 'Loading…' : 'Unavailable'}
                                      </div>
                                    </div>
                                    {quote?.change24h != null && (
                                      <div className={`text-[10px] font-bold ${quote.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {quote.change24h >= 0 ? '+' : ''}{quote.change24h.toFixed(2)}% 24h
                                      </div>
                                    )}
                                  </div>
                                  {quote?.sparkline?.length > 1 && <div className="mt-2 text-[#F5C400]/80">{renderSparkline(quote.sparkline)}</div>}
                                  <div className="mt-2 pt-2 border-t border-[#29292C] flex items-end justify-between gap-3">
                                    <span className="text-[9px] uppercase tracking-widest text-[#737378] font-bold">Your estimated holding</span>
                                    <span className="text-xs font-mono font-bold text-[#F5C400] text-right">
                                      {tokenAmount != null ? `${tokenAmount.toLocaleString('en-US', { maximumFractionDigits: 8 })} ${asset.symbol}` : asset.balance > 0 ? 'Price unavailable' : `0 ${asset.symbol}`}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-[9px] text-[#5f5f64]">7-day market trend • refreshes every 60s</div>
                                </div>
                              );
                            })()}

                            {/* Wallet address with copy */}
                            <div className="mt-4 p-2.5 bg-[#1C1C1E] rounded-lg border border-[#29292C] text-xs font-mono">
                              <div className="text-[10px] text-[#737378] uppercase font-bold tracking-wider mb-1">
                                {t.dashboard.walletAddress}
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[#A9A9AD] truncate text-[11px]" title={asset.walletAddress}>
                                  {asset.walletAddress}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(asset.walletAddress)}
                                  className="text-[#737378] hover:text-[#F5C400] transition-colors p-1 cursor-pointer shrink-0"
                                  title="Copy address"
                                >
                                  {copiedText === asset.walletAddress ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#29292C] flex items-center justify-between text-xs">
                            {asset.source === 'client' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEdit('wallet', asset)}
                                  className="text-[#737378] hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{t.dashboard.editAccount}</span>
                                </button>
                                <span className="text-[#29292C]">•</span>
                                <button
                                  onClick={() => setDeletingItem({ type: 'wallet', id: asset.id, name: `${asset.symbol} (${asset.network})` })}
                                  className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{t.dashboard.deleteAccount}</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#737378] italic">
                                Verified account balance
                              </span>
                            )}

                            {asset.comment && (
                              <span className="text-[10px] text-[#737378] truncate max-w-[130px]" title={asset.comment}>
                                {asset.comment}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. BANK ACCOUNTS SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        {t.dashboard.bankAccountsTitle}
                      </h3>
                      <span className="text-xs text-[#737378]">({clientBankAccounts.length})</span>
                    </div>

                    <button
                      onClick={() => {
                        setBankFormHolder(clientFullName);
                        setBankFormCountry(clientCountry);
                        setIsAddBankOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400]/50 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer hover:text-[#F5C400]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.dashboard.addBankAccount}</span>
                    </button>
                  </div>

                  {clientBankAccounts.length === 0 ? (
                    <div className="bg-[#141416] border border-[#29292C] rounded-xl p-8 text-center">
                      <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center mx-auto mb-3 text-[#737378]">
                        <Building2 className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-xs font-semibold text-white">No bank accounts added yet</div>
                      <div className="text-[11px] text-[#737378] mt-1">Add your SEPA or wire transfer details to receive direct fiat disbursements.</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {clientBankAccounts.map((bank) => (
                        <div 
                          key={bank.id}
                          className="bg-[#141416] border border-[#29292C] hover:border-[#F5C400]/40 rounded-xl p-5 transition-all space-y-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white">{bank.bankName}</div>
                                <div className="text-[10px] text-[#737378] uppercase font-semibold">{bank.country} • {bank.label || 'Direct Account'}</div>
                              </div>
                            </div>
                            {getSourceBadge(bank.source)}
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs bg-[#1C1C1E] p-3 rounded-lg border border-[#29292C]">
                            <div>
                              <span className="text-[10px] text-[#737378] uppercase font-bold tracking-wider block">{t.dashboard.accountHolder}</span>
                              <span className="text-white font-medium truncate block mt-0.5">{bank.accountHolder}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#737378] uppercase font-bold tracking-wider block">{t.dashboard.swiftBic}</span>
                              <span className="text-slate-300 font-mono block mt-0.5">{bank.swiftBic}</span>
                            </div>
                            <div className="col-span-2 pt-1 border-t border-[#29292C] flex items-center justify-between">
                              <span className="text-[#F5C400] font-mono text-xs font-semibold">{bank.iban}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(bank.iban)}
                                className="text-[#737378] hover:text-[#F5C400] transition-colors p-1 cursor-pointer"
                                title="Copy IBAN"
                              >
                                {copiedText === bank.iban ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#29292C] flex items-center justify-between text-xs">
                            {bank.source === 'client' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEdit('bank', bank)}
                                  className="text-[#737378] hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{t.dashboard.editAccount}</span>
                                </button>
                                <span className="text-[#29292C]">•</span>
                                <button
                                  onClick={() => setDeletingItem({ type: 'bank', id: bank.id, name: `${bank.bankName} (${bank.iban.substring(0, 8)}...)` })}
                                  className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{t.dashboard.deleteAccount}</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#737378] italic">
                                Admin-verified primary bank account
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              {bank.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. CARDS / PAYOUT METHODS SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                        {t.dashboard.cardsTitle}
                      </h3>
                      <span className="text-xs text-[#737378]">({clientPayoutCards.length})</span>
                    </div>

                    <button
                      onClick={() => {
                        setCardFormHolder(clientFullName);
                        setCardFormRawNumber('4582123456784582');
                        setShowCardNumber(false);
                        setCardFormExpMonth('08');
                        setCardFormExpYear('29');
                        setCardFormCvv('882');
                        setShowCvv(false);
                        setCardFormBrand('Visa');
                        setCardFormCountry(clientCountry);
                        setCardFormLabel('Personal Visa');
                        setCardFormError(null);
                        setIsAddCardOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400]/50 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer hover:text-[#F5C400]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.dashboard.addCard}</span>
                    </button>
                  </div>

                  {clientPayoutCards.length === 0 ? (
                    <div className="bg-[#141416] border border-[#29292C] rounded-xl p-8 text-center">
                      <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center mx-auto mb-3 text-[#737378]">
                        <CreditCard className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-xs font-semibold text-white">No payout cards added yet</div>
                      <div className="text-[11px] text-[#737378] mt-1">Add a verified Visa or Mastercard debit/credit method for rapid disbursements.</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {clientPayoutCards.map((card) => (
                        <div 
                          key={card.id}
                          className="bg-[#141416] border border-[#29292C] hover:border-[#F5C400]/40 rounded-xl p-5 transition-all space-y-4"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <CreditCard className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-white font-mono">{card.cardBrand.toUpperCase()}</div>
                                <div className="text-[10px] text-[#737378] uppercase">{card.label || 'Debit / Payout Method'}</div>
                              </div>
                            </div>
                            {getSourceBadge(card.source)}
                          </div>

                          <div className="p-3 bg-[#1C1C1E] rounded-lg border border-[#29292C] space-y-1.5">
                            <div className="text-base font-mono font-bold tracking-widest text-white">
                              •••• •••• •••• {card.last4}
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#A9A9AD]">
                              <span>{card.cardholderName}</span>
                              <span className="font-mono">Expires {card.expiryMonth}/{card.expiryYear}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#29292C] flex items-center justify-between text-xs">
                            {card.source === 'client' ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEdit('card', card)}
                                  className="text-[#737378] hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>{t.dashboard.editAccount}</span>
                                </button>
                                <span className="text-[#29292C]">•</span>
                                <button
                                  onClick={() => setDeletingItem({ type: 'card', id: card.id, name: `${card.cardBrand} •••• ${card.last4}` })}
                                  className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>{t.dashboard.deleteAccount}</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#737378] italic">
                                Admin-assigned corporate disbursement card
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                              {card.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.dashboard.navTransactions}</h2>
                  <p className="text-xs text-[#A9A9AD] mt-1">
                    Complete ledger of allocations, adjustments, and review requests.
                  </p>
                </div>

                {clientTransactions.length === 0 ? (
                  <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-10 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center mx-auto mb-4 text-[#737378]">
                      <ArrowLeftRight className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">No Transactions Recorded</h3>
                    <p className="text-xs text-[#737378] max-w-sm mx-auto">
                      No financial allocations, recoveries, or withdrawal requests have been logged for this account yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clientTransactions.map((tx) => (
                      <div 
                        key={tx.id}
                        className="bg-[#141416] border border-[#29292C] hover:border-[#2f2f33] rounded-xl p-4 sm:p-5 transition-all space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center text-[#F5C400] font-mono text-xs font-bold shrink-0">
                              {tx.asset}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold font-mono text-white">{tx.id}</span>
                                <span className="text-xs text-[#737378]">• {tx.type}</span>
                              </div>
                              <div className="text-[11px] text-[#A9A9AD]">
                                {tx.date} {tx.network ? `• ${tx.network}` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-base font-bold font-mono text-white">
                                ${tx.amount.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-[#737378] font-mono">{tx.asset}</div>
                            </div>
                            {getTxBadge(tx.status)}
                          </div>
                        </div>

                        {/* Details & Destination Info */}
                        {(tx.destinationDetails || tx.destinationAddress || tx.note) && (
                          <div className="text-xs text-[#A9A9AD] p-3 bg-[#1C1C1E] rounded-lg border border-[#29292C] space-y-1">
                            {(tx.destinationDetails || tx.destinationAddress) && (
                              <div className="truncate">
                                <strong className="text-white">Destination ({tx.destinationType || 'Wallet'}):</strong> <span className="font-mono text-[11px]">{tx.destinationDetails || tx.destinationAddress}</span>
                              </div>
                            )}
                            {tx.note && (
                              <div>
                                <strong className="text-white">Note:</strong> {tx.note}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Admin Comment (Rejection reason, etc.) */}
                        {tx.adminComment && (
                          <div className={`p-3 rounded-lg border text-xs leading-relaxed ${tx.status === 'Rejected' ? 'bg-red-500/10 border-red-500/25 text-red-300' : 'bg-[#1C1C1E] border-[#29292C] text-[#A9A9AD]'}`}>
                            <strong className={tx.status === 'Rejected' ? 'text-red-400' : 'text-[#F5C400]'}>
                              {tx.status === 'Rejected' ? t.dashboard.rejectionReason : t.dashboard.adminNote}:
                            </strong>{' '}
                            {tx.adminComment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.dashboard.navDocuments}</h2>
                  <p className="text-xs text-[#A9A9AD] mt-1">
                    Upload and manage case documentation, bank receipts, and trade proof.
                  </p>
                </div>

                <div className="bg-[#141416] border border-dashed border-[#F5C400]/40 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5C400]/10 flex items-center justify-center mx-auto text-[#F5C400]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {t.dashboard.selectFilePrompt}
                    </h3>
                    <p className="text-xs text-[#A9A9AD] mt-1">
                      Supported: PDF, JPG, JPEG, PNG, DOC, DOCX, XLS, XLSX
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                    <div className="w-full text-left">
                      <label className="block text-[11px] text-[#A9A9AD] font-bold uppercase mb-1">
                        {t.dashboard.associateCaseNumber}
                      </label>
                      <select
                        value={selectedCaseForDoc}
                        onChange={(e) => setSelectedCaseForDoc(e.target.value)}
                        className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#F5C400]"
                      >
                        {clientCases.length > 0 ? (
                          clientCases.map(c => (
                            <option key={c.id} value={c.caseNumber}>
                              {c.caseNumber} ({c.status})
                            </option>
                          ))
                        ) : (
                          <option value="GENERAL">General Dossier</option>
                        )}
                      </select>
                    </div>

                    <div className="w-full sm:w-auto self-end">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        id="document-upload-input"
                      />
                      <label
                        htmlFor="document-upload-input"
                        className="inline-flex items-center justify-center gap-2 bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer w-full"
                      >
                        <FileUp className="w-4 h-4" />
                        <span>Select File</span>
                      </label>
                    </div>
                  </div>

                  {uploadSuccessMsg && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{uploadSuccessMsg}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#A9A9AD]">
                    Dossier Documents ({clientDocuments.length})
                  </h3>

                  {clientDocuments.length === 0 ? (
                    <div className="bg-[#141416] border border-[#29292C] rounded-xl p-8 text-center">
                      <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center mx-auto mb-3 text-[#737378]">
                        <FileText className="w-5 h-5 text-[#F5C400]" />
                      </div>
                      <div className="text-xs font-semibold text-white">No documents uploaded yet</div>
                      <div className="text-[11px] text-[#737378] mt-1">Upload evidence, bank receipts, or transaction slips above to add to your dossier.</div>
                    </div>
                  ) : (
                    clientDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="bg-[#141416] border border-[#29292C] hover:border-[#2f2f33] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1C1C1E] border border-[#29292C] flex items-center justify-center text-[#F5C400] shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{doc.name}</div>
                            <div className="text-xs text-[#737378] flex items-center gap-2 mt-0.5">
                              <span>Case: <strong className="text-slate-300 font-mono">{doc.caseNumber}</strong></span>
                              <span>•</span>
                              <span>{doc.fileType}</span>
                              <span>•</span>
                              <span>{doc.fileSize}</span>
                              <span>•</span>
                              <span>{doc.uploadDate}</span>
                            </div>
                            {doc.adminNote && (
                              <div className="text-[11px] text-slate-300 italic mt-1">
                                Note: &ldquo;{doc.adminNote}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {getDocBadge(doc.status)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: SUPPORT */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.dashboard.navSupport}</h2>
                  <p className="text-xs text-[#A9A9AD] mt-1">Direct contact channels for confidential assistance.</p>
                </div>
                <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-white mb-2">{t.dashboard.supportTitle}</h3>
                  <p className="text-xs sm:text-sm text-[#A9A9AD] leading-relaxed mb-6">
                    {t.dashboard.supportDesc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      href="tel:+493012345678"
                      className="p-5 bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400]/50 rounded-xl flex items-center gap-4 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F5C400]/10 flex items-center justify-center text-[#F5C400]">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-[#737378] font-bold uppercase tracking-wider">Direct Hotline</div>
                        <div className="text-sm font-bold text-white group-hover:text-[#F5C400] font-mono">
                          +49 30 12345678
                        </div>
                      </div>
                    </a>

                    <a
                      href="mailto:support@bafinsolution.com"
                      className="p-5 bg-[#1C1C1E] border border-[#29292C] hover:border-[#F5C400]/50 rounded-xl flex items-center gap-4 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#F5C400]/10 flex items-center justify-center text-[#F5C400]">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-[#737378] font-bold uppercase tracking-wider">Email Inquiry</div>
                        <div className="text-sm font-bold text-white group-hover:text-[#F5C400] font-mono">
                          support@bafinsolution.com
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{t.dashboard.navProfile}</h2>
                  <p className="text-xs text-[#A9A9AD] mt-1">Verified registration records &amp; access parameters.</p>
                </div>
                <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-8 space-y-6">
                  <h3 className="text-base font-bold text-white border-b border-[#29292C] pb-3">
                    {t.dashboard.profileInfoTitle}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-[#1C1C1E] rounded-xl border border-[#29292C]">
                      <div className="text-[#737378] uppercase font-bold tracking-wider">{t.auth.firstNameLabel} &amp; {t.auth.lastNameLabel}</div>
                      <div className="text-sm font-semibold text-white mt-1">{clientFullName}</div>
                    </div>

                    <div className="p-4 bg-[#1C1C1E] rounded-xl border border-[#29292C]">
                      <div className="text-[#737378] uppercase font-bold tracking-wider">{t.auth.emailLabel}</div>
                      <div className="text-sm font-semibold text-white font-mono mt-1">{clientEmail || 'No email specified'}</div>
                    </div>

                    <div className="p-4 bg-[#1C1C1E] rounded-xl border border-[#29292C]">
                      <div className="text-[#737378] uppercase font-bold tracking-wider">{t.dashboard.accountId}</div>
                      <div className="text-sm font-mono text-[#F5C400] mt-1 truncate">{user?.id || clientProfile?.id || activeClientId || 'Pending'}</div>
                    </div>

                    <div className="p-4 bg-[#1C1C1E] rounded-xl border border-[#29292C]">
                      <div className="text-[#737378] uppercase font-bold tracking-wider">{t.auth.countryLabel}</div>
                      <div className="text-sm font-semibold text-white mt-1">{clientCountry}</div>
                    </div>

                    <div className="p-4 bg-[#1C1C1E] rounded-xl border border-[#29292C]">
                      <div className="text-[#737378] uppercase font-bold tracking-wider">{t.dashboard.securityLevel}</div>
                      <div className="text-sm font-semibold text-emerald-400 mt-1">{t.dashboard.securityLevelValue}</div>
                    </div>

                    <div className="p-4 bg-[#1C1C1E] rounded-xl border border-[#29292C]">
                      <div className="text-[#737378] uppercase font-bold tracking-wider">{t.dashboard.registeredOn}</div>
                      <div className="text-sm font-semibold text-white mt-1">
                        {clientRegisteredDate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* ADD CRYPTO WALLET MODAL */}
      {/* ========================================================================= */}
      {isAddWalletOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAddWalletOpen(false)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#F5C400]" />
                <span>{t.dashboard.addWallet}</span>
              </h3>
              <p className="text-xs text-[#A9A9AD] mt-1">
                Add an external cryptocurrency wallet destination to your financial portfolio.
              </p>
            </div>

            <form onSubmit={handleAddWalletSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.asset}
                  </label>
                  <select
                    value={walletFormAsset}
                    onChange={(e) => setWalletFormAsset(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  >
                    <option value="USDT">USDT (Tether)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="USDC">USDC (USD Coin)</option>
                    <option value="SOL">SOL (Solana)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.network}
                  </label>
                  <input
                    type="text"
                    required
                    value={walletFormNetwork}
                    onChange={(e) => setWalletFormNetwork(e.target.value)}
                    placeholder="TRC20, ERC20, Bitcoin..."
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  {t.dashboard.walletAddress}
                </label>
                <input
                  type="text"
                  required
                  value={walletFormAddress}
                  onChange={(e) => setWalletFormAddress(e.target.value)}
                  placeholder="e.g. TXYZ9876... or 0x7A25..."
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  {t.dashboard.optionalLabel}
                </label>
                <input
                  type="text"
                  value={walletFormLabel}
                  onChange={(e) => setWalletFormLabel(e.target.value)}
                  placeholder="e.g. My Personal Wallet"
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddWalletOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer"
                >
                  {t.dashboard.addWallet}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD BANK ACCOUNT MODAL */}
      {/* ========================================================================= */}
      {isAddBankOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAddBankOpen(false)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>{t.dashboard.addBankAccount}</span>
              </h3>
              <p className="text-xs text-[#A9A9AD] mt-1">
                Link a verified personal bank account for fiat disbursements.
              </p>
            </div>

            <form onSubmit={handleAddBankSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.accountHolder}
                  </label>
                  <input
                    type="text"
                    required
                    value={bankFormHolder}
                    onChange={(e) => setBankFormHolder(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.bankName}
                  </label>
                  <input
                    type="text"
                    required
                    value={bankFormName}
                    onChange={(e) => setBankFormName(e.target.value)}
                    placeholder="e.g. Commerzbank"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.auth.countryLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={bankFormCountry}
                    onChange={(e) => setBankFormCountry(e.target.value)}
                    placeholder="Germany"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.swiftBic}
                  </label>
                  <input
                    type="text"
                    required
                    value={bankFormSwift}
                    onChange={(e) => setBankFormSwift(e.target.value)}
                    placeholder="COBADEFFXXX"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  {t.dashboard.iban}
                </label>
                <input
                  type="text"
                  required
                  value={bankFormIban}
                  onChange={(e) => setBankFormIban(e.target.value)}
                  placeholder="DE44 **** **** **** 8877"
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  {t.dashboard.optionalLabel}
                </label>
                <input
                  type="text"
                  value={bankFormLabel}
                  onChange={(e) => setBankFormLabel(e.target.value)}
                  placeholder="e.g. Personal EUR Account"
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddBankOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer"
                >
                  {t.dashboard.addBankAccount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD CARD / PAYOUT METHOD MODAL (Safe Demo Mode) */}
      {/* ========================================================================= */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsAddCardOpen(false)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>{t.dashboard.addCard}</span>
              </h3>
              <p className="text-xs text-[#A9A9AD] mt-1">
                Enter your card details to link a Visa or Mastercard payout destination.
              </p>
            </div>

            {/* Security notice */}
            <div className="p-3 bg-[rgba(245,196,0,0.05)] border border-[#F5C400]/25 rounded-xl text-[11px] text-[#A9A9AD] flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#F5C400] shrink-0 mt-0.5" />
              <span>
                <strong>PCI-Safe Security:</strong> CVV/CVC and raw card numbers are never persisted or stored. Only safe masked tokens are retained.
              </span>
            </div>

            {cardFormError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cardFormError}</span>
              </div>
            )}

            <form onSubmit={handleAddCardSubmit} className="space-y-4 text-xs">
              {/* 1. CARDHOLDER NAME */}
              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  {t.dashboard.cardholderName}
                </label>
                <input
                  type="text"
                  required
                  value={cardFormHolder}
                  onChange={(e) => setCardFormHolder(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              {/* 2. CARD NUMBER with EYE TOGGLE */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#A9A9AD] font-bold uppercase">
                    {t.dashboard.cardNumber}
                  </label>
                  <span className="text-[10px] text-[#737378] font-mono">
                    {showCardNumber ? 'Visible' : 'Masked (Default)'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formatCardNumberDisplay(cardFormRawNumber, showCardNumber)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setCardFormRawNumber('');
                        return;
                      }
                      if (!val.includes('•')) {
                        const digits = val.replace(/\D/g, '').slice(0, 16);
                        setCardFormRawNumber(digits);
                        if (digits.startsWith('4')) setCardFormBrand('Visa');
                        else if (digits.startsWith('5')) setCardFormBrand('Mastercard');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!showCardNumber) {
                        if (e.key >= '0' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                          e.preventDefault();
                          setCardFormRawNumber(prev => {
                            const next = (prev + e.key).slice(0, 16);
                            if (next.startsWith('4')) setCardFormBrand('Visa');
                            else if (next.startsWith('5')) setCardFormBrand('Mastercard');
                            return next;
                          });
                        } else if (e.key === 'Backspace') {
                          e.preventDefault();
                          setCardFormRawNumber(prev => prev.slice(0, -1));
                        } else if (e.key === 'Delete') {
                          e.preventDefault();
                          setCardFormRawNumber('');
                        }
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 16);
                      if (pasted) {
                        setCardFormRawNumber(pasted);
                        if (pasted.startsWith('4')) setCardFormBrand('Visa');
                        else if (pasted.startsWith('5')) setCardFormBrand('Mastercard');
                      }
                    }}
                    placeholder="•••• •••• •••• 4582"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-3 pr-10 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737378] hover:text-[#F5C400] transition-colors cursor-pointer p-1"
                    title={showCardNumber ? "Mask Card Number" : "Show Card Number"}
                  >
                    {showCardNumber ? (
                      <Eye className="w-4 h-4 text-[#F5C400]" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 3, 4, 5. EXPIRY MONTH, EXPIRY YEAR, CVV / CVC */}
              <div className="grid grid-cols-3 gap-3">
                {/* 3. EXPIRY MONTH */}
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.expiryMonth}
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    required
                    value={cardFormExpMonth}
                    onChange={(e) => setCardFormExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="08"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                {/* 4. EXPIRY YEAR */}
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.expiryYear}
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={cardFormExpYear}
                    onChange={(e) => setCardFormExpYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="29"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                {/* 5. CVV / CVC with EYE TOGGLE */}
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.cvvCvc}
                  </label>
                  <div className="relative">
                    <input
                      type={showCvv ? "text" : "password"}
                      maxLength={4}
                      required
                      value={cardFormCvv}
                      onChange={(e) => setCardFormCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder={showCvv ? "123" : "•••"}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl pl-3 pr-8 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvv(!showCvv)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737378] hover:text-[#F5C400] transition-colors cursor-pointer p-1"
                      title={showCvv ? "Hide CVV" : "Show CVV"}
                    >
                      {showCvv ? (
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
                {/* 6. CARD BRAND */}
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.cardBrand}
                  </label>
                  <select
                    value={cardFormBrand}
                    onChange={(e) => setCardFormBrand(e.target.value as 'Visa' | 'Mastercard')}
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                  </select>
                </div>

                {/* 7. BILLING COUNTRY */}
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.billingCountry}
                  </label>
                  <input
                    type="text"
                    required
                    value={cardFormCountry}
                    onChange={(e) => setCardFormCountry(e.target.value)}
                    placeholder="Germany"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>
              </div>

              {/* 8. OPTIONAL LABEL */}
              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  {t.dashboard.optionalLabel}
                </label>
                <input
                  type="text"
                  value={cardFormLabel}
                  onChange={(e) => setCardFormLabel(e.target.value)}
                  placeholder="e.g. Personal Visa"
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                >
                  {t.dashboard.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer"
                >
                  {t.dashboard.addCard}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT MODAL FOR CLIENT-CREATED ACCOUNTS */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#F5C400]" />
                <span>{t.dashboard.editAccount}</span>
              </h3>
              <p className="text-xs text-[#A9A9AD] mt-1">
                Update account details for your personal destination.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  {t.dashboard.optionalLabel}
                </label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div>
                <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                  {editingItem.type === 'wallet' ? t.dashboard.walletAddress : (editingItem.type === 'bank' ? t.dashboard.iban : t.dashboard.cardholderName)}
                </label>
                <input
                  type="text"
                  required
                  value={editAddressOrIban}
                  onChange={(e) => setEditAddressOrIban(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">
                {t.dashboard.deleteAccount}
              </h3>
              <p className="text-xs text-[#A9A9AD] mt-1.5 leading-relaxed">
                {t.dashboard.confirmDeleteAccount}
              </p>
              <div className="mt-2 p-2 bg-[#1C1C1E] rounded-lg border border-[#29292C] text-xs font-mono text-white">
                {deletingItem.name}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
              >
                {t.dashboard.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {t.dashboard.deleteAccount}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WITHDRAWAL MODAL (2-STEP FLOW WITH CONFIRMATION SCREEN) */}
      {/* ========================================================================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-[#29292C] rounded-2xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute top-5 right-5 text-[#737378] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#F5C400]" />
                <span>
                  {withdrawStep === 'form' ? t.dashboard.newWithdrawalTitle : t.dashboard.reviewAndConfirm}
                </span>
              </h3>
              <p className="text-xs text-[#A9A9AD] mt-1">
                {withdrawStep === 'form' 
                  ? 'Select an existing saved payout destination or verified financial endpoint.' 
                  : 'Please review all parameters carefully before sending this request to operations.'}
              </p>
            </div>

            {withdrawError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{withdrawSuccessMsg}</span>
              </div>
            )}

            {/* STEP 1: FORM SELECTION */}
            {withdrawStep === 'form' && (
              <form onSubmit={handleProceedToConfirm} className="space-y-4 text-xs">
                {/* Destination Selector */}
                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-2">
                    {t.dashboard.selectDestination}
                  </label>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {allDestinations.map((dest) => {
                      const isSelected = selectedDestinationKey === dest.key;
                      return (
                        <div
                          key={dest.key}
                          onClick={() => setSelectedDestinationKey(dest.key)}
                          className={`
                            p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3
                            ${isSelected 
                              ? 'border-[#F5C400] bg-[#F5C400]/10 text-white' 
                              : 'border-[#29292C] bg-[#1C1C1E] text-[#A9A9AD] hover:border-[#F5C400]/40'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <input
                              type="radio"
                              name="destinationSelection"
                              checked={isSelected}
                              onChange={() => setSelectedDestinationKey(dest.key)}
                              className="accent-[#F5C400] cursor-pointer"
                            />
                            <div className="truncate">
                              <div className="font-bold text-white truncate flex items-center gap-2">
                                <span>{dest.title}</span>
                                <span className="text-[10px] text-[#737378] font-normal">• {dest.label}</span>
                              </div>
                              <div className="text-[11px] font-mono text-[#A9A9AD] truncate">
                                {dest.details}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {getSourceBadge(dest.source)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                      {t.dashboard.asset}
                    </label>
                    <select
                      value={withdrawAsset}
                      onChange={(e) => setWithdrawAsset(e.target.value)}
                      className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-[#F5C400]"
                    >
                      <option value="USDT">USDT (Tether USD)</option>
                      <option value="BTC">BTC (Bitcoin)</option>
                      <option value="ETH">ETH (Ethereum)</option>
                      <option value="EUR">EUR (SEPA Wire)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                      {t.dashboard.amount}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="100.00"
                        className="min-w-0 flex-1 bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2.5 text-white font-mono focus:outline-hidden focus:border-[#F5C400]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const matching = clientAssets.find(a => a.symbol.toUpperCase() === withdrawAsset.toUpperCase());
                          setWithdrawAmount(String(Math.max(0, Number(matching?.balance) || 0)));
                        }}
                        className="px-3 rounded-xl border border-[#F5C400]/40 bg-[#F5C400]/10 text-[#F5C400] font-bold hover:bg-[#F5C400]/20"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#A9A9AD] font-bold uppercase mb-1">
                    {t.dashboard.optionalNote}
                  </label>
                  <input
                    type="text"
                    value={withdrawNote}
                    onChange={(e) => setWithdrawNote(e.target.value)}
                    placeholder="e.g. Allocation transfer to personal hardware wallet"
                    className="w-full bg-[#1C1C1E] border border-[#29292C] rounded-xl px-3 py-2.5 text-white focus:outline-hidden focus:border-[#F5C400]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    {t.dashboard.cancel}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer"
                  >
                    Review Withdrawal →
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: CONFIRMATION REVIEW SCREEN */}
            {withdrawStep === 'confirm' && (
              <div className="space-y-4 text-xs">
                {(() => {
                  const targetDest = allDestinations.find(d => d.key === selectedDestinationKey) || allDestinations[0];
                  return (
                    <div className="space-y-4">
                      <div className="p-4 bg-[#1C1C1E] rounded-xl border border-[#29292C] space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-[#29292C]">
                          <span className="text-[#737378] font-bold uppercase">{t.dashboard.amount}</span>
                          <span className="text-xl font-bold font-mono text-[#F5C400]">
                            ${parseFloat(withdrawAmount).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#737378] font-bold uppercase">{t.dashboard.asset}</span>
                          <span className="text-white font-mono font-bold">{withdrawAsset}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#737378] font-bold uppercase">{t.dashboard.destinationType}</span>
                          <span className="text-white font-medium">{targetDest?.type}</span>
                        </div>

                        <div>
                          <span className="text-[#737378] font-bold uppercase block mb-1">Target Account / Address</span>
                          <div className="p-2.5 bg-[#141416] rounded-lg border border-[#29292C] flex items-center justify-between gap-2">
                            <span className="text-white font-mono text-xs truncate">
                              {targetDest?.details}
                            </span>
                            {targetDest && getSourceBadge(targetDest.source)}
                          </div>
                        </div>

                        {withdrawNote && (
                          <div className="pt-2 border-t border-[#29292C]">
                            <span className="text-[#737378] font-bold uppercase block mb-0.5">{t.dashboard.optionalNote}</span>
                            <span className="text-slate-300 italic">{withdrawNote}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-[rgba(245,196,0,0.05)] border border-[#F5C400]/25 rounded-xl text-[11px] text-[#A9A9AD]">
                        <strong>Review Note:</strong> Once submitted, the withdrawal status will immediately be set to <strong>PENDING</strong> for administrator approval.
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setWithdrawStep('form')}
                          className="px-4 py-2.5 rounded-xl border border-[#29292C] text-[#A9A9AD] hover:text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>{t.dashboard.backToEdit}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleConfirmWithdrawal}
                          className="bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#F5C400]/20 cursor-pointer"
                        >
                          {t.dashboard.confirmWithdrawal}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
