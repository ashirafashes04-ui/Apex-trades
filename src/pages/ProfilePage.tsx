import React from 'react';
import { useTrading } from '../context/TradingContext';
import { User, ShieldCheck, RefreshCw, Key, LogOut, Sun, Moon, Award } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, resetDemoBalance, logoutUser, theme, toggleTheme } = useTrading();

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Profile Header */}
      <div className="p-5 rounded-2xl bg-[#151719] border border-[#24272A] flex items-center gap-4">
        <img
          src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
          alt={user.name}
          className="w-16 h-16 rounded-2xl border-2 border-[#29D3D8] object-cover shadow-lg"
        />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-base text-[#F4F4F5]">{user.name}</h2>
            <span className="text-[10px] bg-[#20C77A]/10 text-[#20C77A] border border-[#20C77A]/30 px-1.5 py-0.2 rounded font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> VERIFIED
            </span>
          </div>
          <p className="text-xs text-[#8B8F94] font-mono">{user.email}</p>
          <p className="text-xs text-[#8B8F94] font-mono">{user.countryCode} {user.phone}</p>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-[#151719] border border-[#24272A] rounded-2xl p-4 text-xs space-y-3">
        <h3 className="font-bold text-xs text-[#F4F4F5] border-b border-[#24272A] pb-2">Account Overview</h3>

        <div className="flex justify-between py-1 border-b border-[#24272A]/50">
          <span className="text-[#8B8F94]">Account Tier</span>
          <span className={`font-mono font-bold ${user.accountType === 'real' ? 'text-[#20C77A]' : 'text-[#E6C33A]'}`}>
            {user.accountType === 'real' ? 'REAL LIVE' : 'DEMO SIMULATED'}
          </span>
        </div>

        <div className="flex justify-between py-1 border-b border-[#24272A]/50">
          <span className="text-[#8B8F94]">Partner / Affiliate Code</span>
          <span className="font-mono font-bold text-[#29D3D8]">{user.partnerCode || 'TELVO123'}</span>
        </div>

        <div className="flex justify-between py-1">
          <span className="text-[#8B8F94]">Current Capital</span>
          <span className="font-mono font-bold text-[#20C77A]">${user.balance.toFixed(2)}</span>
        </div>
      </div>

      {/* Preferences & Reset */}
      <div className="bg-[#151719] border border-[#24272A] rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-xs text-[#F4F4F5] border-b border-[#24272A] pb-2">Terminal Preferences</h3>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-xs text-[#F4F4F5]">Theme Mode</div>
            <div className="text-[10px] text-[#8B8F94]">Toggle dark/light contrast</div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-[#121416] border border-[#24272A] text-[#8B8F94] hover:text-[#F4F4F5]"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#E6C33A]" /> : <Moon className="w-4 h-4 text-[#29D3D8]" />}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#24272A]">
          <div>
            <div className="font-semibold text-xs text-[#F4F4F5]">Reset Demo Balance</div>
            <div className="text-[10px] text-[#8B8F94]">Restore account to $10,000 initial virtual funds</div>
          </div>
          <button
            onClick={resetDemoBalance}
            className="px-3 py-1.5 rounded-xl bg-[#24272A] hover:bg-[#29D3D8]/20 text-[#29D3D8] font-bold text-xs transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={logoutUser}
        className="w-full py-3 rounded-2xl bg-[#151719] border border-[#FF5964]/40 hover:bg-[#FF5964]/10 text-[#FF5964] font-bold text-xs transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>SIGN OUT TERMINAL SESSION</span>
      </button>
    </div>
  );
};
