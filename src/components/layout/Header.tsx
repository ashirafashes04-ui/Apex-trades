import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { Menu, Sun, Moon, Plus, Bell, AlertTriangle } from 'lucide-react';
import { AppLogo } from '../common/AppLogo';

export const Header: React.FC = () => {
  const { user, theme, toggleTheme, setIsSideMenuOpen, setIsDepositOpen, navigate, systemSettings } = useTrading();

  const ugxBalance = user.balance * (systemSettings?.ugxExchangeRate || 3750);

  return (
    <div className="sticky top-0 z-30 w-full flex flex-col">
      {/* System Push Broadcast Notification Banner */}
      {systemSettings?.systemNotice && (
        <div className="bg-[#20C77A] text-[#0D0F10] px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 shadow-inner">
          <Bell className="w-3.5 h-3.5 shrink-0 animate-bounce" />
          <span className="truncate">{systemSettings.systemNotice}</span>
        </div>
      )}

      {/* Maintenance Mode Warning Banner */}
      {systemSettings?.maintenanceMode && (
        <div className="bg-red-500 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>System Maintenance Active: New trades and withdrawals are temporarily paused.</span>
        </div>
      )}

      <header className="w-full bg-[#121416]/95 backdrop-blur border-b border-[#24272A] px-3 py-2.5 sm:px-4 flex items-center justify-between">
        {/* Left: Brand Logo & Side Menu Toggle */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsSideMenuOpen(true)}
            className="p-1.5 rounded-lg text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#151719] transition active:scale-95"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => navigate('trade')}
            className="cursor-pointer group"
          >
            <AppLogo size="sm" />
          </div>
        </div>

        {/* Center/Right: Balance Pill & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Balance Display Pill */}
          <div 
            onClick={() => navigate('profile')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#151719] border border-[#24272A] rounded-lg cursor-pointer hover:border-[#29D3D8]/40 transition group"
          >
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E6C33A] bg-[#E6C33A]/10 px-1 py-0.2 rounded border border-[#E6C33A]/20">
                  {user.accountType.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-[#F4F4F5] group-hover:text-[#29D3D8] transition">
                  ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-[9px] text-[#8B8F94] font-mono hidden sm:inline">
                ≈ {ugxBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })} UGX
              </span>
            </div>
          </div>

          {/* Deposit Button */}
          <button
            onClick={() => setIsDepositOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs rounded-lg transition shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Deposit</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#151719] transition hidden sm:flex"
            aria-label="Toggle dark/light theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#E6C33A]" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>
    </div>
  );
};
