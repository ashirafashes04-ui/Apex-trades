export type AccountType = 'demo' | 'real';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  balance: number;
  accountType: AccountType;
  isLoggedIn: boolean;
  avatarUrl?: string;
  partnerCode?: string;
  referredByCode?: string;
  hasDeposited?: boolean;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended';
}

export interface ReferredFriend {
  id: string;
  referrerCode: string;
  referredUserId: string;
  name: string;
  email: string;
  joinedDate: string;
  status: 'pending' | 'active';
  earnedUSD: number;
  hasDeposited: boolean;
}

export type MarketCategory = 'Popular' | 'Synthetic' | 'Forex' | 'Crypto' | 'Indices' | 'Commodities';

export interface MarketItem {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number; // percentage change e.g. -0.18
  category: MarketCategory;
  isFavorite?: boolean;
  status: 'open' | 'closed';
  digitsDistribution: number[]; // Array of 10 percentage values for 0..9
  recentDigits: number[]; // Last 10-15 digits
  ticksHistory: number[]; // Recent prices for live chart
  digitsTicks?: string[]; // E.g. ['U', 'O', 'O', 'U', 'U', 'O'] for Over/Under
}

export type TradingMode = 'manual' | 'bulk' | 'auto';
export type ContractType = 'Rise/Fall' | 'Matches/Differs' | 'Even/Odd' | 'Over/Under';
export type TradeDirection = 'rise' | 'fall' | 'match' | 'differ' | 'even' | 'odd' | 'over' | 'under';

export interface TradeContractConfig {
  mode: TradingMode;
  contractType: ContractType;
  marketId: string;
  stake: number;
  duration: string; // e.g., '5t', '15t', '30t', '1m', '2m', '5m'
  selectedDigit: number; // 0..9 for Matches/Differs or Over/Under threshold
  isAuto: boolean;
  // Bulk trade config
  numberOfTicks?: number;
  bulkStake?: number;
  bulkCount?: number;
}

export interface TradeRecord {
  id: string;
  userId: string;
  marketId: string;
  marketName: string;
  contractType: ContractType;
  direction: TradeDirection;
  selectedDigit?: number;
  stake: number;
  entryPrice: number;
  currentPrice: number;
  exitPrice?: number;
  durationSeconds: number;
  remainingSeconds: number;
  durationTicks?: number;
  ticksPassed?: number;
  status: 'open' | 'closed';
  result?: 'win' | 'loss';
  payoutRate: number; // e.g., 0.98 = 98% profit, 8.9 = 890% profit
  potentialPayout: number;
  profit?: number;
  createdAt: string;
  closedAt?: string;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  type: 'deposit' | 'stake' | 'win' | 'loss' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  createdAt: string;
  description: string;
}

export type AppRoute = 
  | 'trade' 
  | 'dashboard' 
  | 'markets' 
  | 'history' 
  | 'transactions' 
  | 'deposit' 
  | 'withdraw' 
  | 'profile' 
  | 'referrals'
  | 'settings' 
  | 'help' 
  | 'login' 
  | 'signup'
  | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export interface TradeResultPopup {
  id: string;
  result: 'win' | 'loss' | 'start' | 'info';
  label: string;
  profit: number;
  marketName?: string;
  timestamp: number;
}

export interface SystemSettings {
  ugxExchangeRate: number; // e.g. 3880 UGX per 1 USD
  maintenanceMode: boolean;
  minDepositUSD: number;
  minWithdrawUSD: number;
  systemNotice: string;
  payoutPercentages: {
    rise: number;    // Rise button %
    fall: number;    // Fall button %
    matches: number; // Matches button %
    differs: number; // Differs button %
    over: number;    // Over button %
    under: number;   // Under button %
    even: number;    // Even button %
    odd: number;     // Odd button %
    riseFall?: number;
    overUnder?: number;
    evenOdd?: number;
  };
}
