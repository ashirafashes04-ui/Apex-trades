import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { X, TrendingUp, PlusCircle, BarChart2, ArrowDownCircle, RefreshCw } from 'lucide-react';

export const QuickActionModal: React.FC = () => {
  const { 
    isQuickActionOpen, 
    setIsQuickActionOpen, 
    setIsDepositOpen, 
    setIsMarketSelectorOpen, 
    navigate, 
    resetDemoBalance 
  } = useTrading();

  if (!isQuickActionOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={() => setIsQuickActionOpen(false)} 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
      />

      {/* Sheet Content */}
      <div className="relative w-full sm:max-w-md bg-[#151719] border-t sm:border border-[#24272A] rounded-t-2xl sm:rounded-2xl p-5 text-[#F4F4F5] z-10 shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between pb-3 border-b border-[#24272A] mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#29D3D8]/10 text-[#29D3D8]">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F4F4F5]">Quick Terminal Actions</h3>
              <p className="text-[10px] text-[#8B8F94]">Fast shortcuts for market execution</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickActionOpen(false)}
            className="p-1.5 rounded-lg text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#24272A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setIsQuickActionOpen(false); navigate('trade'); }}
            className="flex flex-col items-start p-3 rounded-xl bg-[#121416] border border-[#24272A] hover:border-[#29D3D8]/50 transition text-left group"
          >
            <TrendingUp className="w-5 h-5 text-[#29D3D8] mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-xs text-[#F4F4F5]">New Trade Execution</span>
            <span className="text-[10px] text-[#8B8F94]">Launch trading terminal</span>
          </button>

          <button
            onClick={() => { setIsQuickActionOpen(false); setIsMarketSelectorOpen(true); }}
            className="flex flex-col items-start p-3 rounded-xl bg-[#121416] border border-[#24272A] hover:border-[#E6C33A]/50 transition text-left group"
          >
            <BarChart2 className="w-5 h-5 text-[#E6C33A] mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-xs text-[#F4F4F5]">Select Market</span>
            <span className="text-[10px] text-[#8B8F94]">Browse Synthetic Indices</span>
          </button>

          <button
            onClick={() => { setIsQuickActionOpen(false); setIsDepositOpen(true); }}
            className="flex flex-col items-start p-3 rounded-xl bg-[#121416] border border-[#24272A] hover:border-[#20C77A]/50 transition text-left group"
          >
            <ArrowDownCircle className="w-5 h-5 text-[#20C77A] mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-xs text-[#F4F4F5]">Top Up Demo Funds</span>
            <span className="text-[10px] text-[#8B8F94]">Deposit simulated balance</span>
          </button>

          <button
            onClick={() => { setIsQuickActionOpen(false); resetDemoBalance(); }}
            className="flex flex-col items-start p-3 rounded-xl bg-[#121416] border border-[#24272A] hover:border-purple-500/50 transition text-left group"
          >
            <RefreshCw className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition" />
            <span className="font-semibold text-xs text-[#F4F4F5]">Reset Balance</span>
            <span className="text-[10px] text-[#8B8F94]">Restore $10,000.00 initial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
