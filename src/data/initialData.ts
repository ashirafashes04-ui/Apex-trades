import { MarketItem, TradeRecord, TransactionRecord, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_guest',
  name: '',
  email: '',
  phone: '',
  countryCode: '+256',
  balance: 10000.00,
  accountType: 'demo',
  isLoggedIn: false,
  partnerCode: 'TELVO123',
};

// Generate realistic ticks sequence for chart initial states
const generateTicks = (basePrice: number, count = 40): number[] => {
  const ticks: number[] = [];
  let current = basePrice;
  for (let i = 0; i < count; i++) {
    const delta = (Math.random() - 0.505) * (basePrice * 0.0012);
    current = parseFloat((current + delta).toFixed(2));
    ticks.push(current);
  }
  return ticks;
};

export const INITIAL_MARKETS: MarketItem[] = [
  {
    id: 'vol_10_1s',
    name: 'Volatility 10 (1s)',
    symbol: 'V10_1S',
    price: 9181.19,
    change: -0.18,
    category: 'Synthetic',
    isFavorite: true,
    status: 'open',
    digitsDistribution: [15.0, 10.0, 10.0, 10.0, 10.0, 6.7, 20.0, 8.3, 6.7, 3.3],
    recentDigits: [7, 6, 0, 1, 9, 2, 4, 6, 8, 3, 0, 5],
    ticksHistory: generateTicks(9181.19),
    digitsTicks: ['U', 'O', 'U', 'U', 'O', 'N', 'O'],
  },
  {
    id: 'vol_25_1s',
    name: 'Volatility 25 (1s)',
    symbol: 'V25_1S',
    price: 2745.63,
    change: 0.42,
    category: 'Synthetic',
    isFavorite: true,
    status: 'open',
    digitsDistribution: [8.3, 12.5, 10.0, 15.0, 6.7, 11.7, 10.0, 7.5, 8.3, 10.0],
    recentDigits: [3, 1, 5, 8, 9, 0, 2, 4, 7, 3],
    ticksHistory: generateTicks(2745.63),
    digitsTicks: ['O', 'O', 'U', 'O', 'U', 'U'],
  },
  {
    id: 'vol_50_1s',
    name: 'Volatility 50 (1s)',
    symbol: 'V50_1S',
    price: 3812.45,
    change: -0.65,
    category: 'Synthetic',
    isFavorite: false,
    status: 'open',
    digitsDistribution: [10.0, 11.1, 9.1, 8.0, 12.0, 11.7, 10.0, 9.5, 9.0, 9.6],
    recentDigits: [4, 9, 2, 6, 1, 8, 5, 0, 3, 7],
    ticksHistory: generateTicks(3812.45),
    digitsTicks: ['U', 'U', 'O', 'U', 'O', 'U'],
  },
  {
    id: 'vol_75_1s',
    name: 'Volatility 75 (1s)',
    symbol: 'V75_1S',
    price: 5420.10,
    change: 1.12,
    category: 'Synthetic',
    isFavorite: true,
    status: 'open',
    digitsDistribution: [9.0, 10.4, 9.0, 12.0, 8.0, 11.0, 10.0, 10.6, 11.0, 9.0],
    recentDigits: [1, 7, 3, 5, 8, 2, 6, 9, 0, 4],
    ticksHistory: generateTicks(5420.10),
    digitsTicks: ['O', 'O', 'O', 'U', 'O', 'U'],
  },
  {
    id: 'vol_100_1s',
    name: 'Volatility 100 (1s)',
    symbol: 'V100_1S',
    price: 12650.80,
    change: -0.32,
    category: 'Synthetic',
    isFavorite: false,
    status: 'open',
    digitsDistribution: [11.0, 9.0, 10.0, 10.0, 10.0, 10.0, 9.0, 11.0, 10.0, 10.0],
    recentDigits: [8, 3, 2, 0, 7, 4, 1, 9, 5, 6],
    ticksHistory: generateTicks(12650.80),
    digitsTicks: ['U', 'O', 'U', 'O', 'U', 'O'],
  },
  {
    id: 'forex_eurusd',
    name: 'EUR / USD',
    symbol: 'EURUSD',
    price: 1.0845,
    change: 0.15,
    category: 'Forex',
    isFavorite: true,
    status: 'open',
    digitsDistribution: [10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0],
    recentDigits: [5, 4, 5, 2, 1, 8, 9, 3, 0, 7],
    ticksHistory: generateTicks(1.0845),
  },
  {
    id: 'crypto_btcusd',
    name: 'BTC / USD',
    symbol: 'BTCUSD',
    price: 64250.00,
    change: 2.85,
    category: 'Crypto',
    isFavorite: true,
    status: 'open',
    digitsDistribution: [12.0, 8.0, 11.0, 9.0, 10.0, 10.0, 10.0, 10.0, 11.0, 9.0],
    recentDigits: [0, 0, 5, 3, 8, 1, 7, 2, 4, 9],
    ticksHistory: generateTicks(64250.00),
  },
  {
    id: 'comm_gold',
    name: 'Gold (XAU/USD)',
    symbol: 'XAUUSD',
    price: 2680.50,
    change: 0.78,
    category: 'Commodities',
    isFavorite: false,
    status: 'open',
    digitsDistribution: [10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0, 10.0],
    recentDigits: [0, 5, 8, 2, 1, 9, 4, 3, 7, 6],
    ticksHistory: generateTicks(2680.50),
  }
];

export const INITIAL_CLOSED_TRADES: TradeRecord[] = [];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [];
