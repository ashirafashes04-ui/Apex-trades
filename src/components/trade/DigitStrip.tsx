import React from 'react';
import { MarketItem } from '../../types';
import { useTrading } from '../../context/TradingContext';

interface DigitStripProps {
  market: MarketItem;
}

export const DigitStrip: React.FC<DigitStripProps> = ({ market }) => {
  const { config, setSelectedDigit } = useTrading();
  const digits = market.digitsDistribution || Array(10).fill(10.0);
  const latestDigit = market.recentDigits && market.recentDigits.length > 0 ? market.recentDigits[0] : null;

  return (
    <div className="w-full bg-[#151719] border border-[#24272A] rounded-xl p-2 sm:p-2.5 text-[#F4F4F5] space-y-2">
      <div className="flex items-center justify-between text-[11px] font-semibold text-[#8B8F94]">
        <span>Digit Distribution (0–9)</span>
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span>Active Tick:</span>
          <span className="text-[#29D3D8] font-bold font-mono px-1.5 py-0.2 bg-[#29D3D8]/10 rounded border border-[#29D3D8]/30">
            {latestDigit !== null ? latestDigit : '-'}
          </span>
        </div>
      </div>

      {/* 0-9 Digit Circular Nodes with ONE Moving Active Indicator Dot */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5 pt-1">
        {digits.map((pct, digit) => {
          const isLatest = latestDigit === digit;
          const isSelected = config.selectedDigit === digit;

          return (
            <button
              key={digit}
              type="button"
              onClick={() => setSelectedDigit(digit)}
              className={`relative aspect-square rounded-full flex flex-col items-center justify-center p-0.5 sm:p-1 border transition-all duration-200 active:scale-95 ${
                isLatest
                  ? 'bg-[#29D3D8]/20 border-[#29D3D8] text-[#29D3D8] shadow-lg shadow-[#29D3D8]/30 scale-105 z-10'
                  : isSelected
                  ? 'bg-[#121416] border-[#E6C33A] text-[#E6C33A]'
                  : 'bg-[#121416] border-[#24272A] text-[#F4F4F5] hover:border-[#29D3D8]/40 hover:bg-[#1c1f22]'
              }`}
            >
              {/* Single Moving Active Dot Indicator */}
              {isLatest && (
                <span className="absolute -top-1.5 w-3 h-3 bg-[#29D3D8] rounded-full ring-2 ring-[#151719] animate-pulse shadow-md shadow-[#29D3D8]/60 flex items-center justify-center">
                  <span className="w-1 h-1 bg-[#0D0F10] rounded-full" />
                </span>
              )}

              <span className="text-xs sm:text-sm font-bold font-mono leading-none">{digit}</span>
              <span className="text-[7px] sm:text-[9px] font-mono opacity-80 mt-0.5">{pct}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
