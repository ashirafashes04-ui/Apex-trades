import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { AppLogo } from '../components/common/AppLogo';
import { db, safeSetDoc, markQuotaExhausted } from '../lib/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import {
  ShieldAlert,
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle,
  Search,
  Sliders,
  Power,
  RefreshCw,
  LogOut,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Award,
  Bell,
  Percent,
  Banknote
} from 'lucide-react';
import { TransactionRecord, UserProfile, ReferredFriend } from '../types';

export const AdminPage: React.FC = () => {
  const {
    user,
    transactions,
    referrals,
    systemSettings,
    updateSystemSettings,
    approveWithdrawal,
    rejectWithdrawal,
    addToast,
    logoutUser,
    navigate
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'withdrawals' | 'exchange' | 'multipliers' | 'broadcast'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [wthFilter, setWthFilter] = useState<'pending' | 'completed' | 'failed' | 'all'>('pending');

  // Local Form state for Settings Editing
  const [exchangeRateInput, setExchangeRateInput] = useState(systemSettings.ugxExchangeRate || 3880);
  const [minDepInput, setMinDepInput] = useState(systemSettings.minDepositUSD || 1);
  const [minWthInput, setMinWthInput] = useState(systemSettings.minWithdrawUSD || 10);
  const [noticeInput, setNoticeInput] = useState(systemSettings.systemNotice || '');

  // Payout Percentage Form Inputs (Per-Button)
  const [payouts, setPayouts] = useState(systemSettings.payoutPercentages || {
    rise: 95,
    fall: 95,
    matches: 890,
    differs: 10,
    over: 147,
    under: 147,
    even: 95,
    odd: 95,
  });

  // User Accounts list state
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => [
    {
      id: user.id || 'usr_ashiraf_admin',
      name: user.name || 'Ashiraf Admin',
      email: user.email || 'ashirafashes04@gmail.com',
      phone: user.phone || '0772000000',
      countryCode: '+256',
      balance: user.balance || 0,
      accountType: user.accountType || 'real',
      isLoggedIn: true,
      partnerCode: 'APEX-ADMIN',
      role: 'admin',
      status: 'active'
    }
  ]);

  // Real-time Firestore sync listener for all registered users
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          name: data.name || data.email?.split('@')[0] || 'Registered User',
          email: data.email || '',
          phone: data.phone || '',
          countryCode: data.countryCode || '+256',
          balance: data.demoBalance !== undefined ? data.demoBalance : (data.balance || 0),
          accountType: data.accountType || 'demo',
          isLoggedIn: !!data.isLoggedIn,
          partnerCode: data.partnerCode || '',
          role: data.role || 'user',
          status: data.status || 'active',
          hasDeposited: !!data.hasDeposited,
        });
      });
      if (list.length > 0) {
        setAllUsers(list);
      }
    }, (err: any) => {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota')) {
        markQuotaExhausted();
      }
    });
    return () => unsub();
  }, []);

  // Combined real transactions list
  const allTxns = transactions;

  // Overview Calculations in Ugandan Shillings (UGX)
  const rate = systemSettings.ugxExchangeRate || 3750;
  const totalUsersCount = allUsers.length;

  const totalDepositedUSD = allTxns
    .filter((t) => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalDepositedUGX = totalDepositedUSD * rate;

  const realUsersBalanceSumUSD = allUsers
    .filter((u) => u.accountType === 'real')
    .reduce((sum, u) => sum + u.balance, 0);

  const pendingWithdrawalsSumUSD = allTxns
    .filter((t) => t.type === 'withdrawal' && t.status === 'pending')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalDemandedUSD = realUsersBalanceSumUSD + pendingWithdrawalsSumUSD;
  const totalDemandedUGX = totalDemandedUSD * rate;

  const appNetProfitUSD = totalDepositedUSD - totalDemandedUSD;
  const appNetProfitUGX = appNetProfitUSD * rate;

  // Filter Withdrawals only for approval tab
  const withdrawalTxns = allTxns.filter((t) => t.type === 'withdrawal');
  const filteredWithdrawals = withdrawalTxns.filter((t) => {
    if (wthFilter === 'all') return true;
    return t.status === wthFilter;
  });

  const pendingWithdrawalsCount = withdrawalTxns.filter((t) => t.status === 'pending').length;

  // Actions
  const handleUpdateBalance = (userId: string, currentBal: number) => {
    const input = prompt(`Enter new balance for user (${userId}):`, currentBal.toString());
    if (input === null) return;
    const newBal = parseFloat(input);
    if (isNaN(newBal)) {
      addToast('error', 'Invalid Balance', 'Please enter a valid numeric value.');
      return;
    }
    setAllUsers((users) =>
      users.map((u) => (u.id === userId ? { ...u, balance: newBal } : u))
    );
    safeSetDoc(doc(db, 'users', userId), { demoBalance: newBal, balance: newBal, updatedAt: new Date().toISOString() }, { merge: true });
    addToast('success', 'User Balance Updated', `User ${userId} balance set to $${newBal.toFixed(2)} USD.`);
  };

  const handleToggleStatus = (userId: string) => {
    setAllUsers((users) =>
      users.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' }
          : u
      )
    );
    addToast('info', 'Status Modified', `User account status updated.`);
  };

  const handleSaveExchangeAndLimits = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      ugxExchangeRate: exchangeRateInput,
      minDepositUSD: minDepInput,
      minWithdrawUSD: minWthInput
    });
    addToast('success', 'Rate & Limits Saved', `Dollar rate set to 1 USD = ${exchangeRateInput.toLocaleString()} UGX.`);
  };

  const handleSaveMultipliers = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      payoutPercentages: payouts
    });
    addToast('success', 'Winning Percentages Saved', 'Trade payout multipliers updated across application.');
  };

  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      systemNotice: noticeInput
    });
    addToast('success', 'Notification Published', 'Broadcast message sent to all active users.');
  };

  const handleToggleMaintenance = () => {
    const nextState = !systemSettings.maintenanceMode;
    updateSystemSettings({ maintenanceMode: nextState });
    addToast('info', 'System Mode Changed', `Maintenance mode is now ${nextState ? 'ENABLED' : 'DISABLED'}.`);
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Admin Banner */}
      <div className="p-5 rounded-2xl bg-[#151719] border border-[#20C77A]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#20C77A]/10 text-[#20C77A]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Apex Trades Master Admin Terminal</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#20C77A]/20 text-[#20C77A] border border-[#20C77A]/40">
                SUPERADMIN
              </span>
            </div>
            <p className="text-xs text-[#8B8F94]">
              Authorized Session: <span className="text-white font-medium">ashirafashes04@gmail.com</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleToggleMaintenance}
            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              systemSettings.maintenanceMode
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-[#20C77A]/10 border-[#20C77A]/30 text-[#20C77A]'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{systemSettings.maintenanceMode ? 'Maintenance ON' : 'System Live'}</span>
          </button>

          <button
            onClick={() => navigate('trade')}
            className="px-3 py-2 rounded-xl bg-[#1A1D20] border border-[#2D3135] hover:bg-[#24272A] text-xs font-semibold text-white transition"
          >
            Terminal
          </button>

          <button
            onClick={logoutUser}
            className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW CARDS (Financial Breakdown) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#151719] border border-[#24272A]">
          <span className="text-[10px] text-[#8B8F94] uppercase font-bold block">Total Accounts</span>
          <span className="font-mono font-bold text-2xl text-white mt-1 block">{totalUsersCount}</span>
          <span className="text-[10px] text-[#20C77A] font-medium">Registered User Profiles</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151719] border border-[#24272A]">
          <span className="text-[10px] text-[#8B8F94] uppercase font-bold block">Cash Deposited</span>
          <span className="font-mono font-bold text-xl sm:text-2xl text-[#20C77A] mt-1 block">
            UGX {Math.round(totalDepositedUGX).toLocaleString()}
          </span>
          <span className="text-[10px] text-[#8B8F94] font-mono">
            ≈ ${totalDepositedUSD.toFixed(2)} USD
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151719] border border-[#24272A]">
          <span className="text-[10px] text-[#8B8F94] uppercase font-bold block">User Demands (Liabilities)</span>
          <span className="font-mono font-bold text-xl sm:text-2xl text-[#E6C33A] mt-1 block">
            UGX {Math.round(totalDemandedUGX).toLocaleString()}
          </span>
          <span className="text-[10px] text-[#8B8F94] font-mono">
            ≈ ${totalDemandedUSD.toFixed(2)} USD
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#151719] border border-[#24272A]">
          <span className="text-[10px] text-[#8B8F94] uppercase font-bold block">App Net Profit</span>
          <span className={`font-mono font-bold text-xl sm:text-2xl mt-1 block ${appNetProfitUGX >= 0 ? 'text-[#20C77A]' : 'text-red-400'}`}>
            UGX {Math.round(appNetProfitUGX).toLocaleString()}
          </span>
          <span className="text-[10px] text-[#8B8F94] font-mono">
            Rate: 1 USD = {systemSettings.ugxExchangeRate.toLocaleString()} UGX
          </span>
        </div>
      </div>

      {/* ADMIN CONTROL TABS */}
      <div className="flex border-b border-[#24272A] overflow-x-auto no-scrollbar gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'overview'
              ? 'border-[#20C77A] text-[#20C77A]'
              : 'border-transparent text-[#8B8F94] hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>System Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'users'
              ? 'border-[#20C77A] text-[#20C77A]'
              : 'border-transparent text-[#8B8F94] hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 relative ${
            activeTab === 'withdrawals'
              ? 'border-[#20C77A] text-[#20C77A]'
              : 'border-transparent text-[#8B8F94] hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Withdrawals Approval</span>
          {pendingWithdrawalsCount > 0 && (
            <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-[#E6C33A] text-[#0D0F10] font-mono font-bold">
              {pendingWithdrawalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('exchange')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'exchange'
              ? 'border-[#20C77A] text-[#20C77A]'
              : 'border-transparent text-[#8B8F94] hover:text-white'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Dollar Rate & Limits</span>
        </button>

        <button
          onClick={() => setActiveTab('multipliers')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'multipliers'
              ? 'border-[#20C77A] text-[#20C77A]'
              : 'border-transparent text-[#8B8F94] hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>Winning Percentages</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
            activeTab === 'broadcast'
              ? 'border-[#20C77A] text-[#20C77A]'
              : 'border-transparent text-[#8B8F94] hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Push Notifications</span>
        </button>
      </div>

      {/* TAB: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#20C77A]" />
              <span>Platform Currency Configuration</span>
            </h3>
            <div className="space-y-2 text-xs text-[#8B8F94]">
              <div className="flex justify-between py-1.5 border-b border-[#24272A]">
                <span>Dollar Exchange Rate:</span>
                <span className="font-mono font-bold text-white">1 USD = {systemSettings.ugxExchangeRate.toLocaleString()} UGX</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#24272A]">
                <span>Minimum Deposit Limit:</span>
                <span className="font-mono font-bold text-[#20C77A]">
                  ${systemSettings.minDepositUSD.toFixed(2)} USD ({(systemSettings.minDepositUSD * systemSettings.ugxExchangeRate).toLocaleString()} UGX)
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span>Minimum Withdrawal Limit:</span>
                <span className="font-mono font-bold text-[#E6C33A]">
                  ${systemSettings.minWithdrawUSD.toFixed(2)} USD ({(systemSettings.minWithdrawUSD * systemSettings.ugxExchangeRate).toLocaleString()} UGX)
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#20C77A]" />
              <span>Active Per-Button Winning Percentages</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#8B8F94] pt-1">
              <div className="flex justify-between p-2 rounded-xl bg-[#121416] border border-[#24272A]">
                <span>Rise:</span>
                <span className="font-mono font-bold text-[#20C77A]">+{systemSettings.payoutPercentages?.rise ?? systemSettings.payoutPercentages?.riseFall ?? 95}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#121416] border border-[#24272A]">
                <span>Fall:</span>
                <span className="font-mono font-bold text-[#FF5964]">+{systemSettings.payoutPercentages?.fall ?? systemSettings.payoutPercentages?.riseFall ?? 95}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#121416] border border-[#24272A]">
                <span>Matches:</span>
                <span className="font-mono font-bold text-[#20C77A]">+{systemSettings.payoutPercentages?.matches ?? 890}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#121416] border border-[#24272A]">
                <span>Differs:</span>
                <span className="font-mono font-bold text-white">+{systemSettings.payoutPercentages?.differs ?? 10}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#121416] border border-[#24272A]">
                <span>Over:</span>
                <span className="font-mono font-bold text-[#20C77A]">+{systemSettings.payoutPercentages?.over ?? systemSettings.payoutPercentages?.overUnder ?? 147}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#121416] border border-[#24272A]">
                <span>Under:</span>
                <span className="font-mono font-bold text-[#FF5964]">+{systemSettings.payoutPercentages?.under ?? systemSettings.payoutPercentages?.overUnder ?? 147}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#121416] border border-[#24272A]">
                <span>Even:</span>
                <span className="font-mono font-bold text-[#20C77A]">+{systemSettings.payoutPercentages?.even ?? systemSettings.payoutPercentages?.evenOdd ?? 95}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#121416] border border-[#24272A]">
                <span>Odd:</span>
                <span className="font-mono font-bold text-[#FF5964]">+{systemSettings.payoutPercentages?.odd ?? systemSettings.payoutPercentages?.evenOdd ?? 95}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8B8F94] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user by name, email or phone..."
                className="w-full bg-[#151719] border border-[#24272A] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#5C6166] focus:outline-none focus:border-[#20C77A]"
              />
            </div>
            <span className="text-xs text-[#8B8F94] font-mono">Showing {filteredUsers.length} users</span>
          </div>

          <div className="bg-[#151719] border border-[#24272A] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121416] text-[#8B8F94] border-b border-[#24272A] font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Mobile Phone</th>
                    <th className="p-3.5">Account Type</th>
                    <th className="p-3.5">Balance (USD / UGX)</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24272A] text-white">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#1A1D20]/50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-[#8B8F94]">{u.email}</div>
                      </td>
                      <td className="p-3.5 font-mono text-[#20C77A]">
                        {u.countryCode} {u.phone}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            u.accountType === 'real'
                              ? 'bg-[#20C77A]/10 text-[#20C77A] border border-[#20C77A]/30'
                              : 'bg-[#E6C33A]/10 text-[#E6C33A] border border-[#E6C33A]/30'
                          }`}
                        >
                          {u.accountType}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-white">
                          ${u.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-[#8B8F94] font-mono">
                          ≈ {(u.balance * systemSettings.ugxExchangeRate).toLocaleString()} UGX
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : 'bg-[#24272A] text-[#8B8F94]'
                          }`}
                        >
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'suspended'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-[#20C77A]/10 text-[#20C77A] border border-[#20C77A]/30'
                          }`}
                        >
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleUpdateBalance(u.id, u.balance)}
                          className="px-2.5 py-1 rounded-lg bg-[#20C77A]/10 text-[#20C77A] border border-[#20C77A]/30 hover:bg-[#20C77A]/20 font-bold transition text-[10px]"
                        >
                          Set Balance
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#24272A] hover:bg-[#2D3135] text-[#8B8F94] hover:text-white font-semibold transition text-[10px]"
                        >
                          {u.status === 'suspended' ? 'Unfreeze' : 'Freeze'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: WITHDRAWALS APPROVAL */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWthFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  wthFilter === 'pending'
                    ? 'bg-[#E6C33A] text-[#0D0F10]'
                    : 'bg-[#151719] border border-[#24272A] text-[#8B8F94]'
                }`}
              >
                <span>Pending Approvals</span>
                {pendingWithdrawalsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#0D0F10] text-[#E6C33A] font-mono text-[9px]">
                    {pendingWithdrawalsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setWthFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  wthFilter === 'completed'
                    ? 'bg-[#20C77A] text-[#0D0F10]'
                    : 'bg-[#151719] border border-[#24272A] text-[#8B8F94]'
                }`}
              >
                Completed Withdrawals
              </button>

              <button
                onClick={() => setWthFilter('failed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  wthFilter === 'failed'
                    ? 'bg-red-500 text-white'
                    : 'bg-[#151719] border border-[#24272A] text-[#8B8F94]'
                }`}
              >
                Rejected
              </button>

              <button
                onClick={() => setWthFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  wthFilter === 'all'
                    ? 'bg-[#29D3D8] text-[#0D0F10]'
                    : 'bg-[#151719] border border-[#24272A] text-[#8B8F94]'
                }`}
              >
                All Records
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredWithdrawals.length === 0 ? (
              <div className="p-8 bg-[#151719] border border-[#24272A] rounded-2xl text-center text-xs text-[#8B8F94]">
                No withdrawal requests found for selected filter status.
              </div>
            ) : (
              filteredWithdrawals.map((t) => {
                const amountUSD = Math.abs(t.amount);
                const amountUGX = amountUSD * systemSettings.ugxExchangeRate;

                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-[#151719] border border-[#24272A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white uppercase">WITHDRAWAL REQUEST</span>
                          <span className="font-mono text-[10px] text-[#8B8F94]">{t.reference}</span>
                        </div>
                        <p className="text-xs text-[#D1D5DB] font-medium mt-0.5">{t.description}</p>
                        <p className="text-[10px] text-[#8B8F94] mt-1">
                          User ID: <span className="font-mono text-white">{t.userId}</span> · Requested: {new Date(t.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                      <div className="text-left sm:text-right">
                        <div className="font-mono font-bold text-sm text-white">
                          ${amountUSD.toFixed(2)} USD
                        </div>
                        <div className="text-[10px] text-[#20C77A] font-mono">
                          ≈ {amountUGX.toLocaleString()} UGX
                        </div>
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border mt-0.5 inline-block ${
                            t.status === 'completed'
                              ? 'bg-[#20C77A]/10 text-[#20C77A] border-[#20C77A]/30'
                              : t.status === 'pending'
                              ? 'bg-[#E6C33A]/10 text-[#E6C33A] border-[#E6C33A]/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      {t.status === 'pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => approveWithdrawal(t.id)}
                            className="px-3.5 py-2 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold transition flex items-center gap-1 text-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Payout</span>
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(t.id)}
                            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold transition flex items-center gap-1 text-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject & Refund</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB: DOLLAR RATE & LIMITS */}
      {activeTab === 'exchange' && (
        <div className="max-w-xl bg-[#151719] border border-[#24272A] rounded-2xl p-6 space-y-5">
          <div className="border-b border-[#24272A] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Banknote className="w-4 h-4 text-[#20C77A]" />
              <span>Configure Exchange Rate & Limits</span>
            </h3>
            <p className="text-xs text-[#8B8F94] mt-1">
              Set the UGX price per 1 USD used across the entire application for Mobile Money conversions.
            </p>
          </div>

          <form onSubmit={handleSaveExchangeAndLimits} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-white block">Dollar Price (1 USD in UGX)</label>
              <div className="relative">
                <input
                  type="number"
                  value={exchangeRateInput}
                  onChange={(e) => setExchangeRateInput(Number(e.target.value))}
                  className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#20C77A]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#8B8F94] font-mono">
                  UGX / $1.00 USD
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-white block">Min Deposit ($ USD)</label>
                <input
                  type="number"
                  value={minDepInput}
                  onChange={(e) => setMinDepInput(Number(e.target.value))}
                  className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
                <span className="text-[10px] text-[#8B8F94] font-mono block">
                  ≈ {(minDepInput * exchangeRateInput).toLocaleString()} UGX
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-white block">Min Withdrawal ($ USD)</label>
                <input
                  type="number"
                  value={minWthInput}
                  onChange={(e) => setMinWthInput(Number(e.target.value))}
                  className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
                <span className="text-[10px] text-[#8B8F94] font-mono block">
                  ≈ {(minWthInput * exchangeRateInput).toLocaleString()} UGX
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs transition"
            >
              Save Exchange Rate & Limits
            </button>
          </form>
        </div>
      )}

      {/* TAB: WINNING MULTIPLIERS */}
      {activeTab === 'multipliers' && (
        <div className="max-w-2xl bg-[#151719] border border-[#24272A] rounded-2xl p-6 space-y-5">
          <div className="border-b border-[#24272A] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#20C77A]" />
              <span>Configure Per-Button Winning Percentages</span>
            </h3>
            <p className="text-xs text-[#8B8F94] mt-1">
              Set individual payout percentages rewarded to users for each execution button.
            </p>
          </div>

          <form onSubmit={handleSaveMultipliers} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Rise / Fall */}
              <div className="p-3.5 bg-[#121416] border border-[#24272A] rounded-xl space-y-3">
                <span className="font-bold text-[#20C77A] text-xs uppercase block tracking-wider">Rise / Fall Buttons</span>
                <div className="space-y-1.5">
                  <label className="font-semibold text-white block">▲ Rise Winning Payout (%)</label>
                  <input
                    type="number"
                    value={payouts.rise ?? payouts.riseFall ?? 95}
                    onChange={(e) => setPayouts({ ...payouts, rise: Number(e.target.value) })}
                    className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-white block">▼ Fall Winning Payout (%)</label>
                  <input
                    type="number"
                    value={payouts.fall ?? payouts.riseFall ?? 95}
                    onChange={(e) => setPayouts({ ...payouts, fall: Number(e.target.value) })}
                    className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Matches / Differs */}
              <div className="p-3.5 bg-[#121416] border border-[#24272A] rounded-xl space-y-3">
                <span className="font-bold text-[#20C77A] text-xs uppercase block tracking-wider">Matches / Differs Buttons</span>
                <div className="space-y-1.5">
                  <label className="font-semibold text-white block">Matches Winning Payout (%)</label>
                  <input
                    type="number"
                    value={payouts.matches ?? 890}
                    onChange={(e) => setPayouts({ ...payouts, matches: Number(e.target.value) })}
                    className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                  <span className="text-[10px] text-[#20C77A] font-mono block">
                    {((payouts.matches ?? 890) / 100).toFixed(1)}x Multiplier
                  </span>
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-white block">Differs Winning Payout (%)</label>
                  <input
                    type="number"
                    value={payouts.differs ?? 10}
                    onChange={(e) => setPayouts({ ...payouts, differs: Number(e.target.value) })}
                    className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Over / Under */}
              <div className="p-3.5 bg-[#121416] border border-[#24272A] rounded-xl space-y-3">
                <span className="font-bold text-[#20C77A] text-xs uppercase block tracking-wider">Over / Under Buttons</span>
                <div className="space-y-1.5">
                  <label className="font-semibold text-white block">Over Winning Payout (%)</label>
                  <input
                    type="number"
                    value={payouts.over ?? payouts.overUnder ?? 147}
                    onChange={(e) => setPayouts({ ...payouts, over: Number(e.target.value) })}
                    className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-white block">Under Winning Payout (%)</label>
                  <input
                    type="number"
                    value={payouts.under ?? payouts.overUnder ?? 147}
                    onChange={(e) => setPayouts({ ...payouts, under: Number(e.target.value) })}
                    className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Even / Odd */}
              <div className="p-3.5 bg-[#121416] border border-[#24272A] rounded-xl space-y-3">
                <span className="font-bold text-[#20C77A] text-xs uppercase block tracking-wider">Even / Odd Buttons</span>
                <div className="space-y-1.5">
                  <label className="font-semibold text-white block">Even Winning Payout (%)</label>
                  <input
                    type="number"
                    value={payouts.even ?? payouts.evenOdd ?? 95}
                    onChange={(e) => setPayouts({ ...payouts, even: Number(e.target.value) })}
                    className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-white block">Odd Winning Payout (%)</label>
                  <input
                    type="number"
                    value={payouts.odd ?? payouts.evenOdd ?? 95}
                    onChange={(e) => setPayouts({ ...payouts, odd: Number(e.target.value) })}
                    className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs transition mt-2"
            >
              Save Per-Button Winning Percentages
            </button>
          </form>
        </div>
      )}

      {/* TAB: PUSH BROADCAST NOTIFICATIONS */}
      {activeTab === 'broadcast' && (
        <div className="max-w-xl bg-[#151719] border border-[#24272A] rounded-2xl p-6 space-y-5">
          <div className="border-b border-[#24272A] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#20C77A]" />
              <span>Broadcast System Push Notification</span>
            </h3>
            <p className="text-xs text-[#8B8F94] mt-1">
              Publish a live announcement banner visible to all active platform users in real-time.
            </p>
          </div>

          <form onSubmit={handleBroadcastNotice} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-white block">Notification Text</label>
              <textarea
                rows={3}
                value={noticeInput}
                onChange={(e) => setNoticeInput(e.target.value)}
                placeholder="Type push announcement message here..."
                className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl p-3 text-white focus:outline-none focus:border-[#20C77A]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Publish Live Broadcast</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
