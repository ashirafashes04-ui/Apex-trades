import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { TradeDirection } from '../../types';
import { Plus, Minus, ShieldCheck } from 'lucide-react';

export const TradeControls: React.FC = () => {
  const { 
    config, 
    setStake, 
    setSelectedDigit,
    placeTrade, 
    user,
    systemSettings
  } = useTrading();

  const quickStakes = [1, 5, 10, 25, 50, 100];

  const currentStake = config.stake;

  // Calculate potential payouts based on per-button settings
  const getPayoutFor = (direction: TradeDirection) => {
    const p = systemSettings.payoutPercentages;
    let rate = 0.95;

    if (config.contractType === 'Rise/Fall') {
      rate = (direction === 'rise' ? (p?.rise ?? p?.riseFall ?? 95) : (p?.fall ?? p?.riseFall ?? 95)) / 100;
    } else if (config.contractType === 'Matches/Differs') {
      rate = (direction === 'match' ? (p?.matches ?? 890) : (p?.differs ?? 10)) / 100;
    } else if (config.contractType === 'Over/Under') {
      rate = (direction === 'over' ? (p?.over ?? p?.overUnder ?? 147) : (p?.under ?? p?.overUnder ?? 147)) / 100;
    } else if (config.contractType === 'Even/Odd') {
      rate = (direction === 'even' ? (p?.even ?? p?.evenOdd ?? 95) : (p?.odd ?? p?.evenOdd ?? 95)) / 100;
    }

    const profit = currentStake * rate;
    const total = currentStake + profit;
    return { rate: (rate * 100).toFixed(0), total: total.toFixed(2), profit: profit.toFixed(2) };
  };

  const handleStakeChange = (delta: number) => {
    setStake(Math.max(1, currentStake + delta));
  };

  return (
    <div className="w-full bg-[#151719] border border-[#24272A] rounded-xl p-2.5 sm:p-3 text-[#F4F4F5] space-y-2.5">
      {/* 1. Stake Amount Control */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#8B8F94]">
          <span>Trade Amount ($ USD)</span>
          <span className="text-[10px] text-[#20C77A] font-mono">
            Avail: ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Amount Input with +/- Buttons */}
        <div className="flex items-center bg-[#121416] border border-[#24272A] rounded-lg p-1">
          <button
            onClick={() => handleStakeChange(-5)}
            className="w-8 h-8 rounded bg-[#151719] hover:bg-[#24272A] flex items-center justify-center text-[#F4F4F5] transition active:scale-95"
            aria-label="Decrease stake"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 text-center font-mono font-bold text-sm text-[#29D3D8]">
            <span className="text-xs text-[#8B8F94] mr-0.5">$</span>
            <input
              type="number"
              value={currentStake}
              onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
              className="bg-transparent text-center w-20 focus:outline-none font-bold font-mono text-[#F4F4F5]"
            />
          </div>

          <button
            onClick={() => handleStakeChange(5)}
            className="w-8 h-8 rounded bg-[#151719] hover:bg-[#24272A] flex items-center justify-center text-[#F4F4F5] transition active:scale-95"
            aria-label="Increase stake"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Amount Cards */}
        <div className="grid grid-cols-6 gap-1 pt-0.5">
          {quickStakes.map((amt) => (
            <button
              key={amt}
              onClick={() => setStake(amt)}
              className={`py-1.5 px-1 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 border ${
                currentStake === amt
                  ? 'bg-[#29D3D8] text-[#0D0F10] border-[#29D3D8] shadow-sm'
                  : 'bg-[#121416] border-[#24272A] text-[#8B8F94] hover:text-[#F4F4F5]'
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Target Prediction Digit (For Matches/Differs and Over/Under) */}
      {(config.contractType === 'Matches/Differs' || config.contractType === 'Over/Under') && (
        <div className="space-y-1 bg-[#121416] p-2 border border-[#24272A] rounded-xl">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#8B8F94]">
            <span>Select Prediction Digit (0–9)</span>
            <span className="text-[10px] text-[#29D3D8] font-mono font-bold">Target: {config.selectedDigit}</span>
          </div>

          <div className="grid grid-cols-10 gap-1">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => setSelectedDigit(digit)}
                className={`py-1 rounded text-xs font-mono font-bold transition active:scale-95 ${
                  config.selectedDigit === digit
                    ? 'bg-[#29D3D8] text-[#0D0F10] shadow font-black ring-1 ring-[#29D3D8]'
                    : 'bg-[#151719] border border-[#24272A] text-[#8B8F94] hover:text-[#F4F4F5] hover:border-[#29D3D8]/40'
                }`}
              >
                {digit}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Dynamic Trade Action Buttons */}
      <div>
        {config.contractType === 'Rise/Fall' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => placeTrade('rise')}
              className="py-2.5 px-3 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs shadow-md shadow-[#20C77A]/20 transition active:scale-95 flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-1 font-black">
                <span className="text-sm">▲</span>
                <span>RISE</span>
              </div>
              <span className="text-[9px] font-mono opacity-90">
                Payout: ${getPayoutFor('rise').total} (+{getPayoutFor('rise').rate}%)
              </span>
            </button>

            <button
              onClick={() => placeTrade('fall')}
              className="py-2.5 px-3 rounded-xl bg-[#FF5964] hover:bg-[#f04f5a] text-white font-bold text-xs shadow-md shadow-[#FF5964]/20 transition active:scale-95 flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-1 font-black">
                <span className="text-sm">▼</span>
                <span>FALL</span>
              </div>
              <span className="text-[9px] font-mono opacity-90">
                Payout: ${getPayoutFor('fall').total} (+{getPayoutFor('fall').rate}%)
              </span>
            </button>
          </div>
        )}

        {config.contractType === 'Even/Odd' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => placeTrade('even')}
              className="py-2.5 px-3 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs shadow-md shadow-[#20C77A]/20 transition active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="font-black">EVEN (0,2,4,6,8)</span>
              <span className="text-[9px] font-mono opacity-90">
                Payout: ${getPayoutFor('even').total} (+{getPayoutFor('even').rate}%)
              </span>
            </button>

            <button
              onClick={() => placeTrade('odd')}
              className="py-2.5 px-3 rounded-xl bg-[#FF5964] hover:bg-[#f04f5a] text-white font-bold text-xs shadow-md shadow-[#FF5964]/20 transition active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="font-black">ODD (1,3,5,7,9)</span>
              <span className="text-[9px] font-mono opacity-90">
                Payout: ${getPayoutFor('odd').total} (+{getPayoutFor('odd').rate}%)
              </span>
            </button>
          </div>
        )}

        {config.contractType === 'Matches/Differs' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => placeTrade('match')}
              className="py-2.5 px-3 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs shadow-md shadow-[#20C77A]/20 transition active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="font-black">MATCHES ({config.selectedDigit})</span>
              <span className="text-[9px] font-mono opacity-90">
                Payout: ${getPayoutFor('match').total} (+{getPayoutFor('match').rate}%)
              </span>
            </button>

            <button
              onClick={() => placeTrade('differ')}
              className="py-2.5 px-3 rounded-xl bg-[#FF5964] hover:bg-[#f04f5a] text-white font-bold text-xs shadow-md shadow-[#FF5964]/20 transition active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="font-black">DIFFERS (≠ {config.selectedDigit})</span>
              <span className="text-[9px] font-mono opacity-90">
                Payout: ${getPayoutFor('differ').total} (+{getPayoutFor('differ').rate}%)
              </span>
            </button>
          </div>
        )}

        {config.contractType === 'Over/Under' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => placeTrade('over')}
              className="py-2.5 px-3 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs shadow-md shadow-[#20C77A]/20 transition active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="font-black">OVER ({config.selectedDigit})</span>
              <span className="text-[9px] font-mono opacity-90">
                Payout: ${getPayoutFor('over').total} (+{getPayoutFor('over').rate}%)
              </span>
            </button>

            <button
              onClick={() => placeTrade('under')}
              className="py-2.5 px-3 rounded-xl bg-[#FF5964] hover:bg-[#f04f5a] text-white font-bold text-xs shadow-md shadow-[#FF5964]/20 transition active:scale-95 flex flex-col items-center justify-center"
            >
              <span className="font-black">UNDER ({config.selectedDigit})</span>
              <span className="text-[9px] font-mono opacity-90">
                Payout: ${getPayoutFor('under').total} (+{getPayoutFor('under').rate}%)
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Instant Settlement Badge */}
      <div className="flex items-center justify-center gap-1 text-[10px] text-[#8B8F94] pt-0.5">
        <ShieldCheck className="w-3 h-3 text-[#20C77A]" />
        <span>Instant Execution & Settlement</span>
      </div>
    </div>
  );
};

