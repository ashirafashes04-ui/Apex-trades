import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { CheckCircle, XCircle, Zap, Info } from 'lucide-react';

export const TradeResultBanner: React.FC = () => {
  const { tradeResultPopups } = useTrading();

  if (!tradeResultPopups || tradeResultPopups.length === 0) return null;

  // Show the most recent trade result popup
  const latestPopup = tradeResultPopups[tradeResultPopups.length - 1];
  const res = latestPopup.result;

  const isWin = res === 'win';
  const isLoss = res === 'loss';
  const isStart = res === 'start';

  return (
    <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-40 w-auto min-w-[240px] sm:min-w-[280px] max-w-[90%] px-2 pointer-events-none transition-all duration-300 animate-pop-in">
      <div
        className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl border-2 backdrop-blur-md shadow-2xl flex items-center justify-between gap-3 sm:gap-4 text-xs font-bold ${
          isWin
            ? 'bg-[#0D0F10]/95 border-[#20C77A] text-white shadow-[0_0_20px_rgba(32,199,122,0.45)]'
            : isLoss
            ? 'bg-[#0D0F10]/95 border-[#FF5964] text-white shadow-[0_0_20px_rgba(255,89,100,0.45)]'
            : 'bg-[#0D0F10]/95 border-[#29D3D8] text-white shadow-[0_0_20px_rgba(41,211,216,0.45)]'
        }`}
      >
        {/* Left Side Badge */}
        <div
          className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
            isWin
              ? 'bg-[#20C77A]/20 text-[#20C77A] border border-[#20C77A]/40'
              : isLoss
              ? 'bg-[#FF5964]/20 text-[#FF5964] border border-[#FF5964]/40'
              : 'bg-[#29D3D8]/20 text-[#29D3D8] border border-[#29D3D8]/40'
          }`}
        >
          {isWin ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-[#20C77A]" />
              <span>WON</span>
            </>
          ) : isLoss ? (
            <>
              <XCircle className="w-3.5 h-3.5 text-[#FF5964]" />
              <span>LOST</span>
            </>
          ) : isStart ? (
            <>
              <Zap className="w-3.5 h-3.5 text-[#29D3D8] animate-pulse" />
              <span>STARTED</span>
            </>
          ) : (
            <>
              <Info className="w-3.5 h-3.5 text-[#29D3D8]" />
              <span>INFO</span>
            </>
          )}
        </div>

        {/* Middle Trade Prediction Label */}
        <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap tracking-wide">
          {latestPopup.label}
        </span>

        {/* Right Side Profit / Loss Amount */}
        <span
          className={`font-mono font-extrabold text-xs sm:text-sm whitespace-nowrap shrink-0 ${
            isWin ? 'text-[#20C77A]' : isLoss ? 'text-[#FF5964]' : 'text-[#29D3D8]'
          }`}
        >
          {isWin
            ? `+$${Math.abs(latestPopup.profit).toFixed(2)}`
            : isLoss
            ? `-$${Math.abs(latestPopup.profit).toFixed(2)}`
            : `$${Math.abs(latestPopup.profit).toFixed(2)}`}
        </span>
      </div>
    </div>
  );
};
