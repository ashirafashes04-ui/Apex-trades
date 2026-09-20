import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { AppLogo } from '../common/AppLogo';
import { 
  X, 
  TrendingUp, 
  LayoutDashboard, 
  BarChart2, 
  History, 
  Receipt, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  User, 
  Users,
  Settings, 
  HelpCircle, 
  LogOut,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  MessageCircle,
  Send
} from 'lucide-react';
import { AppRoute } from '../../types';

export const SideMenu: React.FC = () => {
  const { 
    isSideMenuOpen, 
    setIsSideMenuOpen, 
    currentRoute, 
    navigate, 
    user, 
    logoutUser, 
    resetDemoBalance,
    setIsDepositOpen,
    setIsAIOpen 
  } = useTrading();

  if (!isSideMenuOpen) return null;

  const navItems: { label: string; route: AppRoute; icon: React.ReactNode; badge?: string }[] = [
    ...(user.role === 'admin' ? [{ label: 'Admin Control Panel', route: 'admin' as AppRoute, icon: <ShieldAlert className="w-4 h-4 text-purple-400" /> }] : []),
    { label: 'Trade Terminal', route: 'trade', icon: <TrendingUp className="w-4 h-4 text-[#29D3D8]" /> },
    { label: 'Dashboard', route: 'dashboard', icon: <LayoutDashboard className="w-4 h-4 text-[#20C77A]" /> },
    { label: 'Synthetic Markets', route: 'markets', icon: <BarChart2 className="w-4 h-4 text-[#E6C33A]" /> },
    { label: 'Trade History', route: 'history', icon: <History className="w-4 h-4 text-[#8B8F94]" /> },
    { label: 'Transactions Audit', route: 'transactions', icon: <Receipt className="w-4 h-4 text-[#8B8F94]" /> },
    { label: 'Deposit Funds', route: 'deposit', icon: <ArrowDownCircle className="w-4 h-4 text-[#20C77A]" /> },
    { label: 'Withdrawal', route: 'withdraw', icon: <ArrowUpCircle className="w-4 h-4 text-[#FF5964]" /> },
    { label: 'Profile & Account', route: 'profile', icon: <User className="w-4 h-4 text-[#8B8F94]" /> },
    { label: 'Referrals & Friends', route: 'referrals', icon: <Users className="w-4 h-4 text-[#20C77A]" /> },
    { label: 'Help & Knowledge', route: 'help', icon: <HelpCircle className="w-4 h-4 text-[#8B8F94]" /> },
  ];

  const handleNav = (route: AppRoute) => {
    setIsSideMenuOpen(false);
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={() => setIsSideMenuOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-[#121416] border-r border-[#24272A] text-[#F4F4F5] h-full flex flex-col z-10 shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#24272A] flex items-center justify-between bg-[#151719]">
          <AppLogo size="sm" />
          <button 
            onClick={() => setIsSideMenuOpen(false)}
            className="p-1.5 rounded-lg text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#24272A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Mini Banner */}
        <div className="p-4 border-b border-[#24272A] bg-[#0D0F10]/50">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
              alt={user.name} 
              className="w-10 h-10 rounded-full border border-[#29D3D8]/40 object-cover"
            />
            <div className="overflow-hidden">
              <div className="font-semibold text-xs text-[#F4F4F5] truncate">{user.name}</div>
              <div className="text-[11px] text-[#8B8F94] truncate">{user.email}</div>
            </div>
          </div>

          {/* Demo Balance & Top Up Box */}
          <div className="bg-[#151719] border border-[#24272A] rounded-lg p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#E6C33A] tracking-wider">Demo Balance</div>
              <div className="text-sm font-bold text-[#F4F4F5]">
                ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <button
              onClick={resetDemoBalance}
              className="p-1.5 rounded bg-[#24272A] hover:bg-[#29D3D8]/20 text-[#29D3D8] transition"
              title="Reset Demo Balance to $10,000"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-2 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => handleNav(item.route)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#29D3D8]/10 text-[#29D3D8] border border-[#29D3D8]/30 font-semibold'
                    : 'text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#151719]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}

          <div className="pt-2 border-t border-[#24272A] mt-2">
            <button
              onClick={() => { setIsSideMenuOpen(false); setIsAIOpen(true); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#29D3D8] bg-[#29D3D8]/10 hover:bg-[#29D3D8]/20 border border-[#29D3D8]/30 transition"
            >
              <AppLogo size="sm" />
              <span>Apex Terminal Assistant</span>
            </button>
          </div>
        </div>

        {/* Community, Disclaimer & Logout Footer */}
        <div className="p-4 border-t border-[#24272A] bg-[#151719] space-y-3 shrink-0">
          {/* WhatsApp & Telegram Community Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#8B8F94] uppercase tracking-wider block">Join Official Channels</span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://api.whatsapp.com/send?phone=256700000000&text=Hello%20ApexTrades%20Terminal%20Support"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#25D366]/20 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href="https://t.me/apextrades_community"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-2.5 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#0088cc]/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2 bg-[#E6C33A]/10 border border-[#E6C33A]/20 rounded-lg p-2 text-[10px] text-[#E6C33A]">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Simulated trading mode. Price movements are computer-generated synthetic index algorithms.</span>
          </div>

          <button
            onClick={() => { setIsSideMenuOpen(false); logoutUser(); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#24272A] hover:bg-[#FF5964]/20 hover:text-[#FF5964] text-[#8B8F94] text-xs font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
