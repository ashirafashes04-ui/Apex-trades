import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { db, safeSetDoc, markQuotaExhausted } from '../lib/firebase';
import { doc, getDoc, onSnapshot, collection, query, where, limit } from 'firebase/firestore';
import {
  UserProfile,
  ReferredFriend,
  MarketItem,
  TradeRecord,
  TransactionRecord,
  TradingMode,
  ContractType,
  TradeDirection,
  AppRoute,
  ToastMessage,
  TradeContractConfig,
  SystemSettings,
  TradeResultPopup,
} from '../types';
import { INITIAL_USER, INITIAL_MARKETS, INITIAL_CLOSED_TRADES, INITIAL_TRANSACTIONS } from '../data/initialData';

interface TradingContextType {
  // Navigation & Theme
  currentRoute: AppRoute;
  navigate: (route: AppRoute) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // User & Balance
  user: UserProfile;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
  signupUser: (name: string, email: string, phone: string, countryCode: string, partnerCode?: string) => void;
  processDeposit: (amount: number, method: string, phone?: string) => boolean;
  processWithdrawal: (amount: number, method: string, destination?: string) => boolean;
  resetDemoBalance: () => void;

  // Referrals
  referrals: ReferredFriend[];
  addReferral: (friendEmail: string) => void;
  claimReferralRewards: () => void;

  // Markets
  markets: MarketItem[];
  selectedMarket: MarketItem;
  selectMarket: (marketId: string) => void;
  toggleFavoriteMarket: (marketId: string) => void;

  // Trade Form State
  config: TradeContractConfig;
  setMode: (mode: TradingMode) => void;
  setContractType: (type: ContractType) => void;
  setStake: (stake: number) => void;
  setDuration: (duration: string) => void;
  setSelectedDigit: (digit: number) => void;
  setBulkConfig: (ticks: number, stake: number, count: number) => void;

  // Trading Actions
  placeTrade: (direction: TradeDirection, customStake?: number, customDigit?: number) => boolean;
  placeBatchTrades: (direction: TradeDirection) => void;

  // Trade Records
  openTrades: TradeRecord[];
  closedTrades: TradeRecord[];
  transactions: TransactionRecord[];

  // UI Modals & Drawers
  isSideMenuOpen: boolean;
  setIsSideMenuOpen: (open: boolean) => void;
  isMarketSelectorOpen: boolean;
  setIsMarketSelectorOpen: (open: boolean) => void;
  isDepositOpen: boolean;
  setIsDepositOpen: (open: boolean) => void;
  isAIOpen: boolean;
  setIsAIOpen: (open: boolean) => void;
  isQuickActionOpen: boolean;
  setIsQuickActionOpen: (open: boolean) => void;

  // System & Admin Settings
  systemSettings: SystemSettings;
  updateSystemSettings: (newSettings: Partial<SystemSettings>) => void;
  approveWithdrawal: (txnId: string) => void;
  rejectWithdrawal: (txnId: string) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Trade Result Banner Popups
  tradeResultPopups: TradeResultPopup[];
  triggerTradeResultPopup: (popup: Omit<TradeResultPopup, 'id' | 'timestamp'>) => void;
  dismissTradeResultPopup: (id: string) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

// Storage Keys
const STORAGE_KEY_USER = 'apextrades_user_v1';
const STORAGE_KEY_MARKETS = 'apextrades_markets_v1';
const STORAGE_KEY_OPEN_TRADES = 'apextrades_open_v1';
const STORAGE_KEY_CLOSED_TRADES = 'apextrades_closed_v1';
const STORAGE_KEY_TRANSACTIONS = 'apextrades_txns_v1';
const STORAGE_KEY_THEME = 'apextrades_theme_v1';

// Unique ID Generator
let globalSequence = 0;
const generateId = (prefix: string) => {
  globalSequence = (globalSequence + 1) % 1000000;
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${Date.now()}_${globalSequence}_${randomPart}`;
};

// Deduplicate helper to guarantee unique IDs across sessions
const deduplicateRecords = <T extends { id: string }>(records: T[], prefix: string): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of records) {
    let cleanId = item.id;
    if (!cleanId || seen.has(cleanId)) {
      cleanId = generateId(prefix);
    }
    seen.add(cleanId);
    result.push({ ...item, id: cleanId });
  }
  return result;
};

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  ugxExchangeRate: 3880,
  maintenanceMode: false,
  minDepositUSD: 1.0,
  minWithdrawUSD: 10.0,
  systemNotice: '',
  payoutPercentages: {
    rise: 95,
    fall: 95,
    matches: 890,
    differs: 10,
    over: 147,
    under: 147,
    even: 95,
    odd: 95,
    riseFall: 95,
    overUnder: 147,
    evenOdd: 95,
  },
};

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 0. System Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('apextrades_system_settings_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  useEffect(() => {
    // Realtime sync from Firestore system/settings
    const unsub = onSnapshot(doc(db, 'system', 'settings'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as SystemSettings;
        setSystemSettings(data);
        localStorage.setItem('apextrades_system_settings_v1', JSON.stringify(data));
      }
    }, (err: any) => {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
        markQuotaExhausted();
      }
    });
    return () => unsub();
  }, []);

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
    setSystemSettings((prev) => {
      const updated: SystemSettings = {
        ...prev,
        ...newSettings,
        payoutPercentages: {
          ...prev.payoutPercentages,
          ...(newSettings.payoutPercentages || {}),
        },
      };
      localStorage.setItem('apextrades_system_settings_v1', JSON.stringify(updated));
      safeSetDoc(doc(db, 'system', 'settings'), updated, { merge: true });
      return updated;
    });
  };

  // 1. Navigation State
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('trade');

  // 2. Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY_THEME, next);
      return next;
    });
  };

  // 3. User Profile State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isLoggedIn) {
          parsed.accountType = 'real';
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return INITIAL_USER;
  });

  const lastSyncedUserRef = useRef<string>('');
  const isUpdatingFromSnapshotRef = useRef<boolean>(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    if (isUpdatingFromSnapshotRef.current) {
      isUpdatingFromSnapshotRef.current = false;
      return;
    }

    // Async sync user profile to Firestore only if meaningful data changed
    if (user?.id) {
      const userPayload = {
        id: user.id,
        email: user.email,
        name: user.name || '',
        phone: user.phone || '',
        countryCode: user.countryCode || '+256',
        demoBalance: user.balance,
        accountType: user.accountType || 'demo',
        isLoggedIn: !!user.isLoggedIn,
        partnerCode: user.partnerCode || '',
      };
      const userStr = JSON.stringify(userPayload);
      if (userStr === lastSyncedUserRef.current) {
        return;
      }
      lastSyncedUserRef.current = userStr;

      const userRef = doc(db, 'users', user.id);
      safeSetDoc(userRef, {
        ...userPayload,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  }, [user]);

  // Real-time Firestore sync listener for user profile
  useEffect(() => {
    if (!user?.id) return;
    const userRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.demoBalance !== undefined && data.demoBalance !== user.balance) {
          isUpdatingFromSnapshotRef.current = true;
          setUser((prev) => ({
            ...prev,
            balance: data.demoBalance,
          }));
        }
      }
    }, (err: any) => {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
        markQuotaExhausted();
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  // 3.5 Referrals State & URL Auto-detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref') || params.get('partner') || params.get('code');
      if (refParam) {
        const cleanRef = refParam.trim().toUpperCase();
        localStorage.setItem('apextrades_detected_ref', cleanRef);
      } else {
        const match = window.location.pathname.match(/\/ref\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          const cleanRef = match[1].trim().toUpperCase();
          localStorage.setItem('apextrades_detected_ref', cleanRef);
        }
      }
    }
  }, []);

  const [referrals, setReferrals] = useState<ReferredFriend[]>(() => {
    const saved = localStorage.getItem('apextrades_referrals_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('apextrades_referrals_v1', JSON.stringify(referrals));
  }, [referrals]);

  // Firestore listener for referrals
  useEffect(() => {
    if (!user?.partnerCode && !user?.id) return;
    const myCode = user.partnerCode || `UG-${user.id.substring(4, 10).toUpperCase()}`;
    const q = query(collection(db, 'referrals'), where('referrerCode', '==', myCode));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ReferredFriend[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as ReferredFriend);
      });
      if (list.length > 0) {
        setReferrals(list);
      }
    }, (err: any) => {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
        markQuotaExhausted();
      }
    });
    return () => unsubscribe();
  }, [user?.partnerCode, user?.id]);

  // 4. Markets State
  const [markets, setMarkets] = useState<MarketItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MARKETS);
    if (saved) {
      try {
        const parsed: MarketItem[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse markets', e);
      }
    }
    return INITIAL_MARKETS;
  });

  const [selectedMarketId, setSelectedMarketId] = useState<string>('vol_10_1s');

  const selectedMarket = markets.find((m) => m.id === selectedMarketId) || markets[0];

  const selectMarket = (marketId: string) => {
    setSelectedMarketId(marketId);
    setIsMarketSelectorOpen(false);
  };

  const toggleFavoriteMarket = (marketId: string) => {
    setMarkets((prev) =>
      prev.map((m) => (m.id === marketId ? { ...m, isFavorite: !m.isFavorite } : m))
    );
  };

  // 5. Trade Form State
  const [config, setConfig] = useState<TradeContractConfig>({
    mode: 'manual',
    contractType: 'Rise/Fall',
    marketId: 'vol_10_1s',
    stake: 10,
    duration: '5t',
    selectedDigit: 5,
    isAuto: false,
    numberOfTicks: 120,
    bulkStake: 0.5,
    bulkCount: 5,
  });

  const setMode = (mode: TradingMode) => setConfig((prev) => ({ ...prev, mode }));
  const setContractType = (contractType: ContractType) => setConfig((prev) => ({ ...prev, contractType }));
  const setStake = (stake: number) => setConfig((prev) => ({ ...prev, stake: Math.max(0, stake) }));
  const setDuration = (duration: string) => setConfig((prev) => ({ ...prev, duration }));
  const setSelectedDigit = (digit: number) => setConfig((prev) => ({ ...prev, selectedDigit: digit }));
  const setBulkConfig = (numberOfTicks: number, bulkStake: number, bulkCount: number) =>
    setConfig((prev) => ({ ...prev, numberOfTicks, bulkStake, bulkCount }));

  // 6. Open / Closed Trades and Transactions
  const [openTrades, setOpenTrades] = useState<TradeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_OPEN_TRADES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateRecords(parsed, 'trd');
      } catch (e) {}
    }
    return [];
  });

  const [closedTrades, setClosedTrades] = useState<TradeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLOSED_TRADES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateRecords(parsed, 'trd');
      } catch (e) {}
    }
    return deduplicateRecords(INITIAL_CLOSED_TRADES, 'trd');
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return deduplicateRecords(parsed, 'txn');
      } catch (e) {}
    }
    return deduplicateRecords(INITIAL_TRANSACTIONS, 'txn');
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OPEN_TRADES, JSON.stringify(openTrades));
  }, [openTrades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLOSED_TRADES, JSON.stringify(closedTrades));
  }, [closedTrades]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // 7. Modals State
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isMarketSelectorOpen, setIsMarketSelectorOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpenState] = useState(false);
  const setIsDepositOpen = (open: boolean) => {
    if (open) {
      if (!user.isLoggedIn) {
        setIsDepositOpenState(false);
        addToast('info', 'Account Required', 'Please sign in or create an account to deposit funds.');
        setCurrentRoute('signup');
      } else {
        setIsDepositOpenState(true);
        setCurrentRoute('deposit');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsDepositOpenState(false);
    }
  };
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // 8. Toast Notifications & Trade Result Popups
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [tradeResultPopups, setTradeResultPopups] = useState<TradeResultPopup[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const triggerTradeResultPopup = useCallback((popupData: Omit<TradeResultPopup, 'id' | 'timestamp'>) => {
    const id = 'tr_pop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newPopup: TradeResultPopup = {
      ...popupData,
      id,
      timestamp: Date.now(),
    };
    setTradeResultPopups((prev) => [...prev.slice(-2), newPopup]);
    setTimeout(() => {
      setTradeResultPopups((prev) => prev.filter((p) => p.id !== id));
    }, 3200);
  }, []);

  const dismissTradeResultPopup = useCallback((id: string) => {
    setTradeResultPopups((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // 9. Live Tick Simulation & Trade Settlement Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Step A: Update Market Prices smoothly
      setMarkets((prevMarkets) => {
        return prevMarkets.map((m) => {
          const lastPrice = m.price;
          // Volatility fluctuation formula
          const volMultiplier = m.name.includes('100') ? 2.5 : m.name.includes('75') ? 1.8 : m.name.includes('50') ? 1.2 : 0.8;
          const delta = (Math.random() - 0.495) * (lastPrice * 0.0006 * volMultiplier);
          const newPrice = parseFloat((lastPrice + delta).toFixed(2));
          const priceChange = parseFloat((((newPrice - lastPrice) / lastPrice) * 100).toFixed(2));

          // Calculate last digit for digit contracts
          const priceStr = newPrice.toFixed(2);
          const lastDigitChar = priceStr.charAt(priceStr.length - 1);
          const newLastDigit = parseInt(lastDigitChar, 10) || 0;

          // Update recent digits
          const updatedDigits = [newLastDigit, ...m.recentDigits.slice(0, 11)];

          // Update digits distribution
          const counts = Array(10).fill(0);
          updatedDigits.forEach((d) => counts[d]++);
          const total = updatedDigits.length;
          const newDistribution = counts.map((c) => parseFloat(((c / total) * 100).toFixed(1)));

          // Ticks history
          const updatedTicks = [...m.ticksHistory.slice(1), newPrice];

          // Digits ticks (O / U / E / O)
          const tag = newLastDigit >= 5 ? 'O' : 'U';
          const updatedDigitsTicks = [tag, ...(m.digitsTicks || []).slice(0, 7)];

          return {
            ...m,
            price: newPrice,
            change: priceChange,
            recentDigits: updatedDigits,
            digitsDistribution: newDistribution,
            ticksHistory: updatedTicks,
            digitsTicks: updatedDigitsTicks,
          };
        });
      });

      // Step B: Settle Open Trades
      setOpenTrades((prevOpen) => {
        if (prevOpen.length === 0) return prevOpen;

        const stillOpen: TradeRecord[] = [];
        const nowCompleted: TradeRecord[] = [];

        prevOpen.forEach((trade) => {
          const currentRem = trade.remainingSeconds - 1;
          const ticksPassed = (trade.ticksPassed || 0) + 1;

          // Find current market price
          const marketObj = markets.find((m) => m.id === trade.marketId);
          const currentMarketPrice = marketObj ? marketObj.price : trade.currentPrice;

          if (currentRem <= 0) {
            // TRADE EXPIRES NOW! Evaluate outcome
            const exitPrice = currentMarketPrice;
            const exitPriceStr = exitPrice.toFixed(2);
            const exitDigit = parseInt(exitPriceStr.charAt(exitPriceStr.length - 1), 10) || 0;

            let isWin = false;

            switch (trade.contractType) {
              case 'Rise/Fall':
                if (trade.direction === 'rise') isWin = exitPrice > trade.entryPrice;
                if (trade.direction === 'fall') isWin = exitPrice < trade.entryPrice;
                break;
              case 'Even/Odd':
                if (trade.direction === 'even') isWin = exitDigit % 2 === 0;
                if (trade.direction === 'odd') isWin = exitDigit % 2 !== 0;
                break;
              case 'Matches/Differs':
                if (trade.direction === 'match') isWin = exitDigit === (trade.selectedDigit ?? 5);
                if (trade.direction === 'differ') isWin = exitDigit !== (trade.selectedDigit ?? 5);
                break;
              case 'Over/Under':
                if (trade.direction === 'over') isWin = exitDigit > (trade.selectedDigit ?? 5);
                if (trade.direction === 'under') isWin = exitDigit < (trade.selectedDigit ?? 5);
                break;
            }

            const payoutAmount = isWin ? trade.stake + trade.stake * trade.payoutRate : 0;
            const profit = isWin ? trade.stake * trade.payoutRate : -trade.stake;

            const completedTrade: TradeRecord = {
              ...trade,
              remainingSeconds: 0,
              currentPrice: exitPrice,
              exitPrice,
              status: 'closed',
              result: isWin ? 'win' : 'loss',
              potentialPayout: parseFloat(payoutAmount.toFixed(2)),
              profit: parseFloat(profit.toFixed(2)),
              closedAt: new Date().toISOString(),
            };

            nowCompleted.push(completedTrade);

            // Format label e.g., "Over 1", "Matches 7", "Rise", "Fall"
            let tradeLabel = trade.direction.toUpperCase();
            if (trade.contractType === 'Over/Under') {
              tradeLabel = `Over ${trade.selectedDigit ?? 5}`;
              if (trade.direction === 'under') tradeLabel = `Under ${trade.selectedDigit ?? 5}`;
            } else if (trade.contractType === 'Matches/Differs') {
              tradeLabel = `Matches ${trade.selectedDigit ?? 5}`;
              if (trade.direction === 'differ') tradeLabel = `Differs ${trade.selectedDigit ?? 5}`;
            } else if (trade.contractType === 'Even/Odd') {
              tradeLabel = trade.direction === 'even' ? 'Even' : 'Odd';
            } else if (trade.contractType === 'Rise/Fall') {
              tradeLabel = trade.direction === 'rise' ? 'Rise' : 'Fall';
            }

            triggerTradeResultPopup({
              result: isWin ? 'win' : 'loss',
              label: tradeLabel,
              profit: isWin ? profit : -trade.stake,
              marketName: trade.marketName,
            });

            // Update user balance & transactions
            if (isWin) {
              const winAmount = parseFloat(payoutAmount.toFixed(2));
              setUser((u) => ({
                ...u,
                balance: parseFloat((u.balance + winAmount).toFixed(2)),
              }));

              const winTxn: TransactionRecord = {
                id: generateId('txn'),
                userId: trade.userId,
                type: 'win',
                amount: winAmount,
                status: 'completed',
                reference: `WIN-${trade.id.toUpperCase().slice(-6)}`,
                createdAt: new Date().toISOString(),
                description: `Trade Win Payout: ${trade.marketName} (${trade.contractType})`,
              };
              setTransactions((txs) => [winTxn, ...txs]);
            } else {
              const lossTxn: TransactionRecord = {
                id: generateId('txn'),
                userId: trade.userId,
                type: 'loss',
                amount: -trade.stake,
                status: 'completed',
                reference: `LOSS-${trade.id.toUpperCase().slice(-6)}`,
                createdAt: new Date().toISOString(),
                description: `Trade Result Loss: ${trade.marketName} (${trade.contractType})`,
              };
              setTransactions((txs) => [lossTxn, ...txs]);
            }
          } else {
            stillOpen.push({
              ...trade,
              remainingSeconds: currentRem,
              currentPrice: currentMarketPrice,
              ticksPassed,
            });
          }
        });

        if (nowCompleted.length > 0) {
          nowCompleted.forEach((ct) => {
            safeSetDoc(doc(db, 'trades', ct.id), ct, { merge: true });
          });

          setClosedTrades((closed) => {
            const existingIds = new Set(closed.map((c) => c.id));
            const uniqueNew = nowCompleted.filter((c) => !existingIds.has(c.id));
            return [...uniqueNew, ...closed];
          });
        }

        return stillOpen;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [markets, addToast]);

  // Helper for Duration parsing
  const parseDurationSeconds = (dur: string): number => {
    if (dur.endsWith('t')) {
      return parseInt(dur.replace('t', ''), 10) || 5;
    }
    if (dur.endsWith('m')) {
      return (parseInt(dur.replace('m', ''), 10) || 1) * 60;
    }
    return 5;
  };

  // 10. Place Single Trade
  const placeTrade = (direction: TradeDirection, customStake?: number, customDigit?: number): boolean => {
    if (systemSettings.maintenanceMode && user.role !== 'admin') {
      addToast('error', 'Maintenance Mode', 'System is undergoing scheduled maintenance. Trading is temporarily paused.');
      return false;
    }

    const stakeAmount = customStake ?? config.stake;
    const digitValue = customDigit ?? config.selectedDigit;

    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      addToast('error', 'Invalid Stake', 'Please enter a valid stake amount greater than $0.');
      return false;
    }

    if (stakeAmount > user.balance) {
      addToast('error', 'Insufficient Balance', `Your current balance is $${user.balance.toFixed(2)}. Top up or reduce stake.`);
      return false;
    }

    // Determine exact per-button payout rate from System Settings
    const p = systemSettings.payoutPercentages;
    let payoutRate = 0.95;

    if (config.contractType === 'Rise/Fall') {
      payoutRate = direction === 'rise'
        ? (p?.rise ?? p?.riseFall ?? 95) / 100
        : (p?.fall ?? p?.riseFall ?? 95) / 100;
    } else if (config.contractType === 'Matches/Differs') {
      payoutRate = direction === 'match'
        ? (p?.matches ?? 890) / 100
        : (p?.differs ?? 10) / 100;
    } else if (config.contractType === 'Over/Under') {
      payoutRate = direction === 'over'
        ? (p?.over ?? p?.overUnder ?? 147) / 100
        : (p?.under ?? p?.overUnder ?? 147) / 100;
    } else if (config.contractType === 'Even/Odd') {
      payoutRate = direction === 'even'
        ? (p?.even ?? p?.evenOdd ?? 95) / 100
        : (p?.odd ?? p?.evenOdd ?? 95) / 100;
    }

    const durationSeconds = parseDurationSeconds(config.duration);
    const entryPrice = selectedMarket.price;
    const potentialPayout = parseFloat((stakeAmount + stakeAmount * payoutRate).toFixed(2));

    const newTrade: TradeRecord = {
      id: generateId('trd'),
      userId: user.id,
      marketId: selectedMarket.id,
      marketName: selectedMarket.name,
      contractType: config.contractType,
      direction,
      selectedDigit: digitValue,
      stake: stakeAmount,
      entryPrice,
      currentPrice: entryPrice,
      durationSeconds,
      remainingSeconds: durationSeconds,
      status: 'open',
      payoutRate,
      potentialPayout,
      createdAt: new Date().toISOString(),
      ticksPassed: 0,
    };

    // Deduct stake from user balance
    setUser((u) => ({
      ...u,
      balance: parseFloat((u.balance - stakeAmount).toFixed(2)),
    }));

    // Record stake transaction
    const stakeTxn: TransactionRecord = {
      id: generateId('txn'),
      userId: user.id,
      type: 'stake',
      amount: -stakeAmount,
      status: 'completed',
      reference: `STK-${newTrade.id.toUpperCase().slice(-6)}`,
      createdAt: new Date().toISOString(),
      description: `Opened ${config.contractType} (${direction.toUpperCase()}) on ${selectedMarket.name}`,
    };

    setTransactions((txs) => [stakeTxn, ...txs]);
    setOpenTrades((prev) => [newTrade, ...prev]);

    // Firestore async sync
    safeSetDoc(doc(db, 'trades', newTrade.id), newTrade, { merge: true });
    safeSetDoc(doc(db, 'transactions', stakeTxn.id), stakeTxn, { merge: true });

    // Format start label e.g., "Over 1", "Rise", "Matches 7"
    let startLabel = direction.toUpperCase();
    if (config.contractType === 'Over/Under') {
      startLabel = `${direction === 'over' ? 'Over' : 'Under'} ${digitValue}`;
    } else if (config.contractType === 'Matches/Differs') {
      startLabel = `${direction === 'match' ? 'Matches' : 'Differs'} ${digitValue}`;
    } else if (config.contractType === 'Even/Odd') {
      startLabel = direction === 'even' ? 'Even' : 'Odd';
    } else if (config.contractType === 'Rise/Fall') {
      startLabel = direction === 'rise' ? 'Rise' : 'Fall';
    }

    triggerTradeResultPopup({
      result: 'start',
      label: startLabel,
      profit: stakeAmount,
      marketName: selectedMarket.name,
    });

    return true;
  };

  // 11. Place Bulk Batch Trades
  const placeBatchTrades = (direction: TradeDirection) => {
    const count = config.bulkCount || 5;
    const individualStake = config.bulkStake || 0.5;
    const totalRisk = count * individualStake;

    if (totalRisk > user.balance) {
      addToast('error', 'Insufficient Balance', `Batch total ($${totalRisk.toFixed(2)}) exceeds balance ($${user.balance.toFixed(2)}).`);
      return;
    }

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        placeTrade(direction, individualStake);
      }, i * 300);
    }
    addToast('success', '🔥 Bulk Batch Fired', `Executing ${count} sequential trades ($${totalRisk.toFixed(2)} at risk).`);
  };

  // 12. Deposit & Balance Actions
  const processDeposit = (amount: number, method: string, phone?: string): boolean => {
    if (isNaN(amount) || amount < systemSettings.minDepositUSD) {
      addToast(
        'error',
        'Minimum Deposit',
        `Minimum deposit amount is $${systemSettings.minDepositUSD.toFixed(2)} USD (${(systemSettings.minDepositUSD * systemSettings.ugxExchangeRate).toLocaleString()} UGX).`
      );
      return false;
    }

    const isFirstDeposit = !user.hasDeposited;

    setUser((u) => ({
      ...u,
      balance: parseFloat((u.balance + amount).toFixed(2)),
      hasDeposited: true,
    }));

    const depTxn: TransactionRecord = {
      id: generateId('txn'),
      userId: user.id,
      type: 'deposit',
      amount,
      status: 'completed',
      reference: `DEP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      description: `Deposit via ${method} ${phone ? `(${phone})` : ''}`,
    };

    setTransactions((txs) => [depTxn, ...txs]);
    safeSetDoc(doc(db, 'transactions', depTxn.id), depTxn, { merge: true });

    // First Deposit Referral Reward ($1.25 USD)
    if (isFirstDeposit && user.referredByCode) {
      const refDocId = `ref_${user.id}`;
      const rewardAmount = 1.25;

      const refUpdate = {
        status: 'active',
        earnedUSD: rewardAmount,
        hasDeposited: true,
      };

      safeSetDoc(doc(db, 'referrals', refDocId), refUpdate, { merge: true });

      setReferrals((prev) =>
        prev.map((r) =>
          r.referredUserId === user.id || r.id === refDocId
            ? { ...r, status: 'active', earnedUSD: rewardAmount, hasDeposited: true }
            : r
        )
      );

      addToast(
        'success',
        '🎉 Referral Reward Active!',
        `Your first deposit credited $1.25 USD reward to your referrer (${user.referredByCode}).`
      );
    }

    setIsDepositOpen(false);
    addToast('success', '💰 Funds Credited', `+$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} credited to your balance.`);
    return true;
  };

  const processWithdrawal = (amount: number, method: string, destination?: string): boolean => {
    if (isNaN(amount) || amount < systemSettings.minWithdrawUSD) {
      addToast(
        'error',
        'Minimum Withdrawal',
        `Minimum withdrawal amount is $${systemSettings.minWithdrawUSD.toFixed(2)} USD (${(systemSettings.minWithdrawUSD * systemSettings.ugxExchangeRate).toLocaleString()} UGX).`
      );
      return false;
    }

    if (amount > user.balance) {
      addToast('error', 'Insufficient Funds', 'Requested withdrawal exceeds available balance.');
      return false;
    }

    setUser((u) => ({
      ...u,
      balance: parseFloat((u.balance - amount).toFixed(2)),
    }));

    const wthTxn: TransactionRecord = {
      id: generateId('txn'),
      userId: user.id,
      type: 'withdrawal',
      amount: -amount,
      status: 'pending',
      reference: `WTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      description: `Payout via ${method} ${destination ? `(${destination})` : ''}`,
    };

    setTransactions((txs) => [wthTxn, ...txs]);
    safeSetDoc(doc(db, 'transactions', wthTxn.id), wthTxn, { merge: true });
    addToast('info', 'Withdrawal Submitted', 'Withdrawal request submitted. Pending Admin approval.');
    return true;
  };

  const approveWithdrawal = (txnId: string) => {
    setTransactions((txs) =>
      txs.map((t) => (t.id === txnId ? { ...t, status: 'completed' as const } : t))
    );
    safeSetDoc(doc(db, 'transactions', txnId), { status: 'completed' }, { merge: true });
    addToast('success', 'Withdrawal Approved', `Transaction ${txnId} approved and marked completed.`);
  };

  const rejectWithdrawal = (txnId: string) => {
    const target = transactions.find((t) => t.id === txnId);
    if (target) {
      const refund = Math.abs(target.amount);
      setUser((u) => ({ ...u, balance: parseFloat((u.balance + refund).toFixed(2)) }));
    }
    setTransactions((txs) =>
      txs.map((t) => (t.id === txnId ? { ...t, status: 'failed' as const } : t))
    );
    safeSetDoc(doc(db, 'transactions', txnId), { status: 'failed' }, { merge: true });
    addToast('error', 'Withdrawal Rejected', `Transaction ${txnId} rejected and balance refunded.`);
  };

  const resetDemoBalance = () => {
    setUser((u) => ({ ...u, balance: 10000.00 }));
    addToast('info', '🔄 Balance Reset', 'Demo account balance reset to $10,000.00.');
  };

  // Referral Actions
  const addReferral = (friendEmail: string) => {
    if (!friendEmail.trim()) return;
    const friendName = friendEmail.split('@')[0];
    const myCode = user.partnerCode || `UG-${user.id.substring(4, 10).toUpperCase()}`;

    const newRef: ReferredFriend = {
      id: `ref_inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      referrerCode: myCode,
      referredUserId: `usr_friend_${Date.now()}`,
      name: friendName,
      email: friendEmail,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'pending', // Pending status initially!
      earnedUSD: 0,
      hasDeposited: false,
    };

    setReferrals((prev) => [newRef, ...prev]);
    safeSetDoc(doc(db, 'referrals', newRef.id), newRef, { merge: true });
    addToast('success', 'Invite Sent!', `Invite dispatched to ${friendEmail}. Appears as Pending Deposit.`);
  };

  const claimReferralRewards = () => {
    const activeRewards = referrals
      .filter((r) => r.status === 'active')
      .reduce((acc, r) => acc + r.earnedUSD, 0);

    if (activeRewards <= 0) {
      addToast('info', 'No Unclaimed Rewards', 'There are no active referral rewards to claim yet.');
      return;
    }

    setUser((u) => ({
      ...u,
      balance: parseFloat((u.balance + activeRewards).toFixed(2)),
    }));

    const claimTxn: TransactionRecord = {
      id: generateId('txn'),
      userId: user.id,
      type: 'deposit',
      amount: activeRewards,
      status: 'completed',
      reference: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      description: `Referral Rewards Claim ($1.25 per active referral)`,
    };

    setTransactions((txs) => [claimTxn, ...txs]);
    safeSetDoc(doc(db, 'transactions', claimTxn.id), claimTxn, { merge: true });

    // Clear claimed rewards
    setReferrals((prev) =>
      prev.map((r) => (r.status === 'active' ? { ...r, earnedUSD: 0 } : r))
    );

    addToast('success', 'Rewards Claimed!', `+$${activeRewards.toFixed(2)} USD transferred to your balance.`);
  };

  // 13. Auth Handlers
  const loginUser = (email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'ashirafashes04@gmail.com';

    if (isAdmin) {
      setUser((u) => ({
        ...u,
        email: 'ashirafashes04@gmail.com',
        name: 'Apex Admin',
        role: 'admin',
        isLoggedIn: true,
        accountType: 'real',
        balance: 15420.50,
      }));
      addToast('success', 'Admin Authenticated', 'Welcome to Apex Trades Control Terminal.');
      setCurrentRoute('admin');
      return;
    }

    let savedPhone = '';
    let savedCountryCode = '+256';
    try {
      const stored = localStorage.getItem('apextrades_registered_users_v1');
      if (stored) {
        const map = JSON.parse(stored);
        if (map[cleanEmail]) {
          savedPhone = map[cleanEmail].phone || '';
          savedCountryCode = map[cleanEmail].countryCode || '+256';
        }
      }
    } catch (e) {}

    setUser((u) => ({
      ...u,
      email,
      name: name || email.split('@')[0],
      phone: savedPhone || u.phone || '',
      countryCode: savedCountryCode || u.countryCode || '+256',
      role: 'user',
      accountType: 'real',
      isLoggedIn: true,
    }));
    addToast('success', 'Welcome Back', `Logged in as ${email}`);
    setCurrentRoute('trade');
  };

  const signupUser = (name: string, email: string, phone: string, countryCode: string, partnerCodeInput?: string) => {
    const detectedRef = localStorage.getItem('apextrades_detected_ref') || '';
    const finalPartnerCode = partnerCodeInput?.trim().toUpperCase() || detectedRef;
    const userOwnPartnerCode = `UG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      phone,
      countryCode,
      balance: 10000.00,
      accountType: 'real',
      isLoggedIn: true,
      partnerCode: userOwnPartnerCode,
      referredByCode: finalPartnerCode || undefined,
      hasDeposited: false,
    };

    try {
      const stored = localStorage.getItem('apextrades_registered_users_v1');
      const map = stored ? JSON.parse(stored) : {};
      map[email.trim().toLowerCase()] = {
        name,
        email: email.trim().toLowerCase(),
        phone,
        countryCode,
      };
      localStorage.setItem('apextrades_registered_users_v1', JSON.stringify(map));
    } catch (e) {}

    setUser(newUser);

    if (finalPartnerCode) {
      const newRef: ReferredFriend = {
        id: `ref_${newUser.id}`,
        referrerCode: finalPartnerCode,
        referredUserId: newUser.id,
        name,
        email,
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'pending', // Pending status!
        earnedUSD: 0,
        hasDeposited: false,
      };

      safeSetDoc(doc(db, 'referrals', newRef.id), newRef, { merge: true });
      setReferrals((prev) => [newRef, ...prev]);
      localStorage.removeItem('apextrades_detected_ref');
      addToast('info', 'Referral Code Applied', `Invited by code ${finalPartnerCode}. Reward pending deposit.`);
    }

    addToast('success', 'Account Created', 'Welcome to ApexTrades Terminal!');
    setCurrentRoute('trade');
  };

  const logoutUser = () => {
    setUser((u) => ({ ...u, isLoggedIn: false }));
    addToast('info', 'Logged Out', 'You have been logged out of your session.');
    setCurrentRoute('login');
  };

  const navigate = (route: AppRoute) => {
    if ((route === 'deposit' || route === 'withdraw') && !user.isLoggedIn) {
      addToast('info', 'Account Required', `Please sign in or create an account to access ${route}.`);
      setCurrentRoute('signup');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TradingContext.Provider
      value={{
        currentRoute,
        navigate,
        theme,
        toggleTheme,

        user,
        loginUser,
        logoutUser,
        signupUser,
        processDeposit,
        processWithdrawal,
        resetDemoBalance,

        referrals,
        addReferral,
        claimReferralRewards,

        markets,
        selectedMarket,
        selectMarket,
        toggleFavoriteMarket,

        config,
        setMode,
        setContractType,
        setStake,
        setDuration,
        setSelectedDigit,
        setBulkConfig,

        placeTrade,
        placeBatchTrades,

        openTrades,
        closedTrades,
        transactions,

        isSideMenuOpen,
        setIsSideMenuOpen,
        isMarketSelectorOpen,
        setIsMarketSelectorOpen,
        isDepositOpen,
        setIsDepositOpen,
        isAIOpen,
        setIsAIOpen,
        isQuickActionOpen,
        setIsQuickActionOpen,

        systemSettings,
        updateSystemSettings,
        approveWithdrawal,
        rejectWithdrawal,

        toasts,
        addToast,
        removeToast,

        tradeResultPopups,
        triggerTradeResultPopup,
        dismissTradeResultPopup,
      }}
    >
      <div className={theme === 'light' ? 'light-mode-theme' : 'dark-mode-theme'}>
        {children}
      </div>
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
