// =========================================================================
// BAFIN SOLUTION — DEMO DATA ENGINE & STORAGE
// Prepares mock structures for future Firebase Auth / Firestore / Storage.
// Persists in localStorage for live two-way Demo Mode interaction.
// =========================================================================

export type CaseFileStatus = 
  | 'Opened' 
  | 'Confirming' 
  | 'Documents Required' 
  | 'Under Review' 
  | 'In Process' 
  | 'Completed' 
  | 'Closed';

export type CaseStatus = 
  | 'Waiting for Documents' 
  | 'In Process' 
  | 'Rejected' 
  | 'Done';

export type TransactionStatus = 'Pending' | 'Completed' | 'Rejected';
export type TransactionType = 'Withdrawal' | 'Balance Adjustment' | 'Deposit Record';

export type DocumentReviewStatus = 'New' | 'Reviewed' | 'Accepted' | 'Rejected';

export type FinancialSource = 'admin' | 'client';
export type UserRole = 'super_admin' | 'admin' | 'client';
export type UserAccountStatus = 'Active' | 'Pending' | 'Suspended';

export interface ClientProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountStatus: 'Verified Client Account' | 'Pending Verification' | 'Under Review';
  phone: string;
  country: string;
  caseFileStatus: CaseFileStatus;
  createdAt: string;
  // Bank Account
  bankName: string;
  bankAccountHolder: string;
  bankIban: string;
  bankStatus: 'Verified' | 'Pending' | 'Rejected';
  bankComment?: string;
  totalBalanceComment?: string;
}

export interface FinanceAsset {
  id: string;
  clientId: string;
  symbol: string; // BTC, USDT, ETH, etc.
  name: string;
  network: string; // Bitcoin, ERC20, Ethereum, TRC20, etc.
  balance: number;
  walletAddress: string;
  label?: string; // e.g. "My Personal Wallet"
  source: FinancialSource; // 'admin' | 'client'
  createdBy?: string;
  createdByRole?: UserRole;
  comment?: string;
  createdAt?: string;
  updatedAt: string;
}

export interface BankAccountItem {
  id: string;
  clientId: string;
  accountHolder: string;
  bankName: string;
  country: string;
  iban: string;
  swiftBic: string;
  label?: string; // e.g. "Personal EUR Account"
  status: 'Verified' | 'Pending' | 'Rejected';
  source: FinancialSource; // 'admin' | 'client'
  createdBy?: string;
  createdByRole?: UserRole;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutCardItem {
  id: string;
  clientId: string;
  cardholderName: string;
  cardBrand: 'Visa' | 'Mastercard';
  last4: string; // e.g. "4582"
  expiryMonth: string; // e.g. "08"
  expiryYear: string; // e.g. "29"
  billingCountry: string;
  label?: string; // e.g. "Personal Visa"
  source: FinancialSource; // 'admin' | 'client'
  createdBy?: string;
  createdByRole?: UserRole;
  status: 'Active' | 'Verified' | 'Pending';
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedUserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole; // 'super_admin' | 'admin' | 'client'
  status: UserAccountStatus; // 'Active' | 'Pending' | 'Suspended'
  phone?: string;
  country?: string;
  createdAt: string;
  lastActivity: string;
  temporaryPassword?: string;
}

export interface CaseItem {
  id: string;
  clientId: string;
  caseNumber: string; // e.g. BS-2026-00184
  status: CaseStatus;
  createdDate: string;
  lastUpdated: string;
  adminNote: string;
}

export interface TransactionItem {
  id: string; // e.g. TX-2026-1041
  clientId: string;
  type: TransactionType;
  asset: string;
  network?: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  adminComment?: string;
  destinationType?: 'Crypto Wallet' | 'Bank Account' | 'Card / Payout Method';
  destinationAddress?: string;
  destinationDetails?: string;
  destinationSource?: FinancialSource;
  note?: string;
}

export interface DocumentItem {
  id: string;
  clientId: string;
  name: string;
  fileType: string;
  fileSize: string;
  caseNumber: string;
  uploadDate: string;
  status: DocumentReviewStatus;
  adminNote?: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  clientName: string;
  clientId: string;
  timestamp: string;
  actor?: string;
  previousValue?: string;
  newValue?: string;
}

export interface DemoDatabaseState {
  clients: ClientProfile[];
  users: ManagedUserItem[];
  assets: FinanceAsset[];
  bankAccounts: BankAccountItem[];
  payoutCards: PayoutCardItem[];
  cases: CaseItem[];
  transactions: TransactionItem[];
  documents: DocumentItem[];
  activityLogs: ActivityLogItem[];
}

const STORAGE_KEY = 'bafin_demo_data_v3';

export const INITIAL_DEMO_DATA: DemoDatabaseState = {
  users: [
    {
      id: 'admin_master_001',
      email: 'admin@bafinsolution.com',
      firstName: 'System',
      lastName: 'Admin',
      role: 'super_admin',
      status: 'Active',
      phone: '+49 30 12345678',
      country: 'Germany',
      createdAt: 'September 1, 2026',
      lastActivity: 'October 4, 2026, 14:45'
    },
    {
      id: 'admin_ops_002',
      email: 'operations@bafinsolution.com',
      firstName: 'Operations',
      lastName: 'Admin',
      role: 'admin',
      status: 'Active',
      phone: '+49 30 87654321',
      country: 'Germany',
      createdAt: 'September 15, 2026',
      lastActivity: 'October 4, 2026, 12:20'
    },
    {
      id: 'demo_client_user',
      email: 'demo@bafinsolution.com',
      firstName: 'Demo',
      lastName: 'Client',
      role: 'client',
      status: 'Active',
      phone: '+49 30 12345678',
      country: 'Germany',
      createdAt: 'October 1, 2026',
      lastActivity: 'October 4, 2026, 14:40'
    },
    {
      id: 'client_anna_keller',
      email: 'anna.demo@example.com',
      firstName: 'Anna',
      lastName: 'Keller',
      role: 'client',
      status: 'Active',
      phone: '+49 171 9876543',
      country: 'Germany',
      createdAt: 'September 24, 2026',
      lastActivity: 'October 3, 2026, 17:10'
    },
    {
      id: 'client_michael_weber',
      email: 'michael.demo@example.com',
      firstName: 'Michael',
      lastName: 'Weber',
      role: 'client',
      status: 'Pending',
      phone: '+49 160 4567890',
      country: 'Germany',
      createdAt: 'September 28, 2026',
      lastActivity: 'October 2, 2026, 11:05'
    },
    {
      id: 'client_stefan_meyer',
      email: 'stefan.demo@example.com',
      firstName: 'Stefan',
      lastName: 'Meyer',
      role: 'client',
      status: 'Active',
      phone: '+49 152 2345678',
      country: 'Germany',
      createdAt: 'October 3, 2026',
      lastActivity: 'October 4, 2026, 09:15'
    }
  ],
  clients: [
    {
      id: 'demo_client_user',
      email: 'demo@bafinsolution.com',
      firstName: 'Demo',
      lastName: 'Client',
      accountStatus: 'Verified Client Account',
      phone: '+49 30 12345678',
      country: 'Germany',
      caseFileStatus: 'Under Review',
      createdAt: 'October 1, 2026',
      bankName: 'Deutsche Bank',
      bankAccountHolder: 'Demo Client',
      bankIban: 'DE89 **** **** **** 1234',
      bankStatus: 'Verified',
      bankComment: 'Direct SEPA escrow bank account linked and verified.',
      totalBalanceComment: 'Balance reflects currently recorded assets associated with this client account.'
    },
    {
      id: 'client_anna_keller',
      email: 'anna.demo@example.com',
      firstName: 'Anna',
      lastName: 'Keller',
      accountStatus: 'Verified Client Account',
      phone: '+49 171 9876543',
      country: 'Germany',
      caseFileStatus: 'In Process',
      createdAt: 'September 24, 2026',
      bankName: 'Commerzbank',
      bankAccountHolder: 'Anna Keller',
      bankIban: 'DE44 **** **** **** 5678',
      bankStatus: 'Verified',
      bankComment: 'Direct wire escrow confirmed.',
      totalBalanceComment: 'Includes recovered exchange token balance.'
    },
    {
      id: 'client_michael_weber',
      email: 'michael.demo@example.com',
      firstName: 'Michael',
      lastName: 'Weber',
      accountStatus: 'Pending Verification',
      phone: '+49 160 4567890',
      country: 'Germany',
      caseFileStatus: 'Documents Required',
      createdAt: 'September 28, 2026',
      bankName: 'Sparkasse Berlin',
      bankAccountHolder: 'Michael Weber',
      bankIban: 'DE12 **** **** **** 9012',
      bankStatus: 'Pending',
      bankComment: 'Awaiting certified identity verification.',
      totalBalanceComment: 'Intermediary forensic escrow.'
    },
    {
      id: 'client_stefan_meyer',
      email: 'stefan.demo@example.com',
      firstName: 'Stefan',
      lastName: 'Meyer',
      accountStatus: 'Verified Client Account',
      phone: '+49 152 2345678',
      country: 'Germany',
      caseFileStatus: 'Opened',
      createdAt: 'October 3, 2026',
      bankName: 'N26 Bank',
      bankAccountHolder: 'Stefan Meyer',
      bankIban: 'DE09 **** **** **** 3456',
      bankStatus: 'Verified',
      bankComment: 'Primary account linked.',
      totalBalanceComment: 'No active assets currently deposited.'
    }
  ],
  assets: [
    {
      id: 'asset-btc-demo',
      clientId: 'demo_client_user',
      symbol: 'BTC',
      name: 'Bitcoin',
      network: 'Bitcoin',
      balance: 400.00,
      walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      label: 'Allocated BTC Wallet',
      source: 'admin',
      createdBy: 'admin_master_001',
      createdByRole: 'super_admin',
      comment: 'BTC balance recorded across the assigned wallet.',
      createdAt: 'October 2, 2026',
      updatedAt: 'October 4, 2026'
    },
    {
      id: 'asset-usdt-demo',
      clientId: 'demo_client_user',
      symbol: 'USDT',
      name: 'Tether USD',
      network: 'ERC20',
      balance: 300.00,
      walletAddress: '0x7A250d5630B4cF539739dF2C5dAcb4c659F2488D',
      label: 'Main Escrow Wallet',
      source: 'admin',
      createdBy: 'admin_master_001',
      createdByRole: 'super_admin',
      comment: 'USDT balance validated via smart contract interaction.',
      createdAt: 'October 2, 2026',
      updatedAt: 'October 4, 2026'
    },
    {
      id: 'asset-eth-demo',
      clientId: 'demo_client_user',
      symbol: 'ETH',
      name: 'Ethereum',
      network: 'Ethereum',
      balance: 100.00,
      walletAddress: '0x9BcaF08d328fD8699B5a7A85d263914a8C3AcE89',
      label: 'Fee & Gas Escrow',
      source: 'admin',
      createdBy: 'admin_master_001',
      createdByRole: 'super_admin',
      comment: 'ETH reserve allocated for gas fees & tracking.',
      createdAt: 'October 2, 2026',
      updatedAt: 'October 4, 2026'
    },
    {
      id: 'asset-usdt-client-demo',
      clientId: 'demo_client_user',
      symbol: 'USDT',
      name: 'Tether USD',
      network: 'TRC20',
      balance: 0.00,
      walletAddress: 'TXYZ9876aBcdEfGhIjKlMnOpQrStUv291A',
      label: 'My Personal Wallet',
      source: 'client',
      createdBy: 'demo_client_user',
      createdByRole: 'client',
      comment: 'Personal external TRC20 payout destination.',
      createdAt: 'October 4, 2026',
      updatedAt: 'October 4, 2026'
    },
    {
      id: 'asset-btc-anna',
      clientId: 'client_anna_keller',
      symbol: 'BTC',
      name: 'Bitcoin',
      network: 'Bitcoin',
      balance: 2450.00,
      walletAddress: 'bc1q9v8t6s5r4q3p2o1n0m9l8k7j6h5g4f3e2d1c',
      label: 'Recovered Vault',
      source: 'admin',
      createdBy: 'admin_master_001',
      createdByRole: 'super_admin',
      comment: 'Forensically traced UTXO bundle.',
      createdAt: 'September 25, 2026',
      updatedAt: 'October 3, 2026'
    },
    {
      id: 'asset-usdt-michael',
      clientId: 'client_michael_weber',
      symbol: 'USDT',
      name: 'Tether USD',
      network: 'ERC20',
      balance: 1250.00,
      walletAddress: '0x3F5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
      label: 'Intermediary Hold',
      source: 'admin',
      createdBy: 'admin_ops_002',
      createdByRole: 'admin',
      comment: 'Exchange freeze escrow.',
      createdAt: 'September 29, 2026',
      updatedAt: 'October 2, 2026'
    }
  ],
  bankAccounts: [
    {
      id: 'bank-001',
      clientId: 'demo_client_user',
      accountHolder: 'Demo Client',
      bankName: 'Deutsche Bank',
      country: 'Germany',
      iban: 'DE89 **** **** **** 1234',
      swiftBic: 'DEUTDEDDFXX',
      label: 'Primary Escrow Account',
      status: 'Verified',
      source: 'admin',
      createdBy: 'admin_master_001',
      createdByRole: 'super_admin',
      comment: 'Direct SEPA escrow bank account linked and verified.',
      createdAt: 'October 1, 2026',
      updatedAt: 'October 4, 2026'
    },
    {
      id: 'bank-002',
      clientId: 'demo_client_user',
      accountHolder: 'Demo Client',
      bankName: 'Commerzbank',
      country: 'Germany',
      iban: 'DE44 **** **** **** 8877',
      swiftBic: 'COBADEFFXXX',
      label: 'Personal EUR Account',
      status: 'Verified',
      source: 'client',
      createdBy: 'demo_client_user',
      createdByRole: 'client',
      comment: 'Personal checking account for SEPA withdrawals.',
      createdAt: 'October 4, 2026',
      updatedAt: 'October 4, 2026'
    },
    {
      id: 'bank-003',
      clientId: 'client_anna_keller',
      accountHolder: 'Anna Keller',
      bankName: 'Commerzbank',
      country: 'Germany',
      iban: 'DE44 **** **** **** 5678',
      swiftBic: 'COBADEFFXXX',
      label: 'Personal Account',
      status: 'Verified',
      source: 'admin',
      createdBy: 'admin_master_001',
      createdByRole: 'super_admin',
      comment: 'Direct wire escrow confirmed.',
      createdAt: 'September 24, 2026',
      updatedAt: 'October 3, 2026'
    },
    {
      id: 'bank-004',
      clientId: 'client_michael_weber',
      accountHolder: 'Michael Weber',
      bankName: 'Sparkasse Berlin',
      country: 'Germany',
      iban: 'DE12 **** **** **** 9012',
      swiftBic: 'BELADEBEBER',
      label: 'Girokonto',
      status: 'Pending',
      source: 'admin',
      createdBy: 'admin_ops_002',
      createdByRole: 'admin',
      comment: 'Awaiting certified identity verification.',
      createdAt: 'September 28, 2026',
      updatedAt: 'October 2, 2026'
    }
  ],
  payoutCards: [
    {
      id: 'card-001',
      clientId: 'demo_client_user',
      cardholderName: 'John Demo',
      cardBrand: 'Visa',
      last4: '4582',
      expiryMonth: '08',
      expiryYear: '29',
      billingCountry: 'Germany',
      label: 'Personal Visa',
      source: 'client',
      createdBy: 'demo_client_user',
      createdByRole: 'client',
      status: 'Active',
      comment: 'Client-added Visa debit payout method.',
      createdAt: 'October 4, 2026',
      updatedAt: 'October 4, 2026'
    },
    {
      id: 'card-002',
      clientId: 'demo_client_user',
      cardholderName: 'Demo Client',
      cardBrand: 'Mastercard',
      last4: '7821',
      expiryMonth: '11',
      expiryYear: '28',
      billingCountry: 'Germany',
      label: 'Corporate Debit',
      source: 'admin',
      createdBy: 'admin_master_001',
      createdByRole: 'super_admin',
      status: 'Active',
      comment: 'Assigned corporate forensic disbursement card.',
      createdAt: 'October 3, 2026',
      updatedAt: 'October 4, 2026'
    }
  ],
  cases: [
    {
      id: 'case-001',
      clientId: 'demo_client_user',
      caseNumber: 'BS-2026-00184',
      status: 'In Process',
      createdDate: 'October 2, 2026',
      lastUpdated: 'October 4, 2026',
      adminNote: 'Transaction records are currently being reviewed.'
    },
    {
      id: 'case-002',
      clientId: 'demo_client_user',
      caseNumber: 'BS-2026-00201',
      status: 'Waiting for Documents',
      createdDate: 'October 4, 2026',
      lastUpdated: 'October 4, 2026',
      adminNote: 'Please upload the requested payment documentation.'
    },
    {
      id: 'case-003',
      clientId: 'client_anna_keller',
      caseNumber: 'BS-2026-00155',
      status: 'In Process',
      createdDate: 'September 24, 2026',
      lastUpdated: 'October 3, 2026',
      adminNote: 'Cross-border court liaison active.'
    },
    {
      id: 'case-004',
      clientId: 'client_michael_weber',
      caseNumber: 'BS-2026-00170',
      status: 'Waiting for Documents',
      createdDate: 'September 28, 2026',
      lastUpdated: 'October 1, 2026',
      adminNote: 'Waiting for bank swift confirmation.'
    },
    {
      id: 'case-005',
      clientId: 'client_michael_weber',
      caseNumber: 'BS-2026-00192',
      status: 'In Process',
      createdDate: 'October 1, 2026',
      lastUpdated: 'October 4, 2026',
      adminNote: 'Investigating fraudulent broker endpoint.'
    }
  ],
  transactions: [
    {
      id: 'TX-2026-1041',
      clientId: 'demo_client_user',
      type: 'Withdrawal',
      asset: 'BTC',
      network: 'Bitcoin',
      amount: 150.00,
      date: 'October 4, 2026',
      status: 'Pending',
      destinationType: 'Crypto Wallet',
      destinationAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
      destinationDetails: 'BTC Wallet ••••5mdq (bc1qar0s...)',
      destinationSource: 'client',
      note: 'Partial withdrawal request to cold storage.'
    },
    {
      id: 'TX-2026-1032',
      clientId: 'demo_client_user',
      type: 'Balance Adjustment',
      asset: 'USDT',
      network: 'ERC20',
      amount: 300.00,
      date: 'October 3, 2026',
      status: 'Completed',
      adminComment: 'Initial forensic asset allocation.'
    },
    {
      id: 'TX-2026-1028',
      clientId: 'demo_client_user',
      type: 'Withdrawal',
      asset: 'ETH',
      network: 'Ethereum',
      amount: 75.00,
      date: 'October 1, 2026',
      status: 'Rejected',
      adminComment: 'Destination account requires additional verification.',
      destinationType: 'Crypto Wallet',
      destinationAddress: '0x123...invalidAddress',
      destinationDetails: 'ETH Wallet ••••ddress',
      destinationSource: 'client'
    },
    {
      id: 'TX-2026-1019',
      clientId: 'client_anna_keller',
      type: 'Withdrawal',
      asset: 'BTC',
      network: 'Bitcoin',
      amount: 500.00,
      date: 'October 2, 2026',
      status: 'Pending',
      destinationType: 'Bank Account',
      destinationAddress: 'DE44 **** **** **** 5678',
      destinationDetails: 'Commerzbank IBAN ••••5678',
      destinationSource: 'admin',
      note: 'Direct SEPA conversion.'
    },
    {
      id: 'TX-2026-1012',
      clientId: 'client_michael_weber',
      type: 'Withdrawal',
      asset: 'USDT',
      network: 'ERC20',
      amount: 250.00,
      date: 'October 3, 2026',
      status: 'Pending',
      destinationType: 'Crypto Wallet',
      destinationAddress: '0x71C...3f92',
      destinationDetails: 'USDT ERC20 ••••3f92',
      destinationSource: 'client',
      note: 'Staging escrow release.'
    }
  ],
  documents: [
    {
      id: 'doc-001',
      clientId: 'demo_client_user',
      name: 'Payment Receipt.pdf',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      caseNumber: 'BS-2026-00184',
      uploadDate: 'October 3, 2026',
      status: 'Reviewed',
      adminNote: 'Wire proof verified with bank counterpart.'
    },
    {
      id: 'doc-002',
      clientId: 'demo_client_user',
      name: 'Exchange Statement.xlsx',
      fileType: 'Excel',
      fileSize: '420 KB',
      caseNumber: 'BS-2026-00184',
      uploadDate: 'October 3, 2026',
      status: 'Accepted',
      adminNote: 'Ledger entries matched to reported trade IDs.'
    },
    {
      id: 'doc-003',
      clientId: 'demo_client_user',
      name: 'Wallet Screenshot.png',
      fileType: 'Image',
      fileSize: '3.2 MB',
      caseNumber: 'BS-2026-00201',
      uploadDate: 'October 4, 2026',
      status: 'New',
      adminNote: 'Awaiting visual review.'
    },
    {
      id: 'doc-004',
      clientId: 'demo_client_user',
      name: 'Bank Transfer Confirmation.docx',
      fileType: 'Word',
      fileSize: '512 KB',
      caseNumber: 'BS-2026-00201',
      uploadDate: 'October 4, 2026',
      status: 'New',
      adminNote: 'Cross-checking swift routing numbers.'
    },
    {
      id: 'doc-005',
      clientId: 'client_anna_keller',
      name: 'Broker Chat Export.pdf',
      fileType: 'PDF',
      fileSize: '2.4 MB',
      caseNumber: 'BS-2026-00155',
      uploadDate: 'September 25, 2026',
      status: 'Accepted',
      adminNote: 'Admitted as primary evidentiary communication record.'
    },
    {
      id: 'doc-006',
      clientId: 'client_michael_weber',
      name: 'Platform Deposit Slips.pdf',
      fileType: 'PDF',
      fileSize: '950 KB',
      caseNumber: 'BS-2026-00170',
      uploadDate: 'September 29, 2026',
      status: 'New',
      adminNote: 'Pending receipt authentication.'
    }
  ],
  activityLogs: [
    {
      id: 'act-001',
      action: 'Demo Client added Visa ending in 4582.',
      clientName: 'Demo Client',
      clientId: 'demo_client_user',
      actor: 'Demo Client',
      timestamp: 'October 4, 2026, 14:35',
      newValue: 'Visa •••• 4582 (Personal Visa)'
    },
    {
      id: 'act-002',
      action: 'Demo Client added Commerzbank account.',
      clientName: 'Demo Client',
      clientId: 'demo_client_user',
      actor: 'Demo Client',
      timestamp: 'October 4, 2026, 14:20',
      newValue: 'DE44 **** **** **** 8877 (Personal EUR Account)'
    },
    {
      id: 'act-003',
      action: 'Demo Client added USDT TRC20 wallet.',
      clientName: 'Demo Client',
      clientId: 'demo_client_user',
      actor: 'Demo Client',
      timestamp: 'October 4, 2026, 14:15',
      newValue: 'TXYZ9876aBcdEfGhIjKlMnOpQrStUv291A (My Personal Wallet)'
    },
    {
      id: 'act-004',
      action: 'Demo Client submitted withdrawal TX-2026-1041.',
      clientName: 'Demo Client',
      clientId: 'demo_client_user',
      actor: 'Demo Client',
      timestamp: 'October 4, 2026, 13:50',
      newValue: '$150.00 BTC to bc1qar0s...'
    },
    {
      id: 'act-005',
      action: 'System Admin created client Anna Keller.',
      clientName: 'Anna Keller',
      clientId: 'client_anna_keller',
      actor: 'System Admin',
      timestamp: 'September 24, 2026, 09:30',
      newValue: 'anna.demo@example.com (Client)'
    },
    {
      id: 'act-006',
      action: 'System Admin created Administrator Operations Admin.',
      clientName: 'Operations Admin',
      clientId: 'admin_ops_002',
      actor: 'System Admin',
      timestamp: 'September 15, 2026, 10:15',
      newValue: 'operations@bafinsolution.com (Administrator)'
    },
    {
      id: 'act-007',
      action: 'Operations Admin changed Case BS-2026-00184 status.',
      clientName: 'Demo Client',
      clientId: 'demo_client_user',
      actor: 'Operations Admin',
      timestamp: 'October 4, 2026, 09:45',
      previousValue: 'Waiting for Documents',
      newValue: 'In Process'
    },
    {
      id: 'act-008',
      action: 'System Admin rejected withdrawal TX-2026-1028.',
      clientName: 'Demo Client',
      clientId: 'demo_client_user',
      actor: 'System Admin',
      timestamp: 'October 1, 2026, 16:30',
      previousValue: 'Pending',
      newValue: 'Rejected: Destination account requires additional verification.'
    }
  ]
};

// Safe storage access with recovery and auto-migration
export const loadDemoState = (): DemoDatabaseState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed.clients && 
        parsed.assets && 
        parsed.cases && 
        parsed.transactions && 
        parsed.documents &&
        parsed.bankAccounts &&
        parsed.payoutCards &&
        parsed.users
      ) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse stored demo state, resetting to initial', err);
  }
  saveDemoState(INITIAL_DEMO_DATA);
  return INITIAL_DEMO_DATA;
};

export const saveDemoState = (state: DemoDatabaseState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Dispatch custom event so all active components immediately re-render
    window.dispatchEvent(new Event('bafin_demo_state_change'));
  } catch (err) {
    console.error('Failed to save demo state', err);
  }
};
