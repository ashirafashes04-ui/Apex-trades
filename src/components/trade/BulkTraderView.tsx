import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Zap, Flame, ShieldAlert, BarChart3 } from 'lucide-react';

export const BulkTraderView: React.FC = () => {
  const { placeBatchTrades, user, selectedMarket } = useTrading();

  const [bulkCount, setBulkCount] = useState(5);
  const [individualStake, setIndividualStake] = useState(1.0);
  const [prediction, setPrediction] = useState<'rise' | 'fall' | 'even' | 'odd'>('rise');

  const totalRisk = bulkCount * individualStake;

  const handleFire = () => {
    placeBatchTrades(prediction as any);
  };

  return (
    <div className="w-full bg-[#151719] border border-[#24272A] rounded-2xl p-4 text-[#F4F4F5] space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-[#24272A]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E6C33A]/10 text-[#E6C33A]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-[#F4F4F5]">Bulk Batch Trader</h3>
            <p className="text-[10px] text-[#8B8F94]">Fire multiple rapid trades on {selectedMarket.name}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase text-[#8B8F94]">Total Risk</span>
          <div className="font-mono font-bold text-xs text-[#E6C33A]">${totalRisk.toFixed(2)}</div>
        </div>
      </div>

      {/* Batch Configuration Form */}
      <div className="grid grid-cols-2 gap-3">
        {/* Number of Trades in Batch */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#8B8F94]">Batch Count</label>
          <div className="flex items-center gap-1">
            {[3, 5, 10, 20].map((num) => (
              <button
                key={num}
                onClick={() => setBulkCount(num)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                  bulkCount === num
                    ? 'bg-[#E6C33A] text-[#0D0F10]'
                    : 'bg-[#121416] border border-[#24272A] text-[#8B8F94]'
                }`}
              >
                {num}x
              </button>
            ))}
          </div>
        </div>

        {/* Stake Per Trade */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-[#8B8F94]">Stake / Trade</label>
          <div className="flex items-center bg-[#121416] border border-[#24272A] rounded-lg px-2 py-1 font-mono">
            <span className="text-xs text-[#8B8F94] mr-1">$</span>
            <input
              type="number"
              value={individualStake}
              onChange={(e) => setIndividualStake(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
              className="bg-transparent w-full text-xs font-bold text-[#F4F4F5] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Direction Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#8B8F94]">Select Batch Contract Direction</label>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            onClick={() => setPrediction('rise')}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              prediction === 'rise' ? 'bg-[#20C77A] text-[#0D0F10]' : 'bg-[#121416] text-[#8B8F94]'
            }`}
          >
            RISE ▲
          </button>

          <button
            onClick={() => setPrediction('fall')}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              prediction === 'fall' ? 'bg-[#FF5964] text-white' : 'bg-[#121416] text-[#8B8F94]'
            }`}
          >
            FALL ▼
          </button>

          <button
            onClick={() => setPrediction('even')}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              prediction === 'even' ? 'bg-[#29D3D8] text-[#0D0F10]' : 'bg-[#121416] text-[#8B8F94]'
            }`}
          >
            EVEN
          </button>

          <button
            onClick={() => setPrediction('odd')}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              prediction === 'odd' ? 'bg-[#E6C33A] text-[#0D0F10]' : 'bg-[#121416] text-[#8B8F94]'
            }`}
          >
            ODD
          </button>
        </div>
      </div>

      {/* Live Market Scan Stats */}
      <div className="p-2.5 rounded-xl bg-[#121416] border border-[#24272A] flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1.5 text-[#8B8F94]">
          <BarChart3 className="w-3.5 h-3.5 text-[#29D3D8]" />
          <span>High-Frequency Density Scan:</span>
        </div>
        <span className="font-mono font-bold text-[#20C77A]">OPTIMAL SIGNAL</span>
      </div>

      {/* Main Fire Action */}
      <button
        onClick={handleFire}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E6C33A] to-[#20C77A] hover:opacity-90 text-[#0D0F10] font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>FIRE {bulkCount} SEQUENTIAL TRADES (${totalRisk.toFixed(2)})</span>
      </button>

      <div className="flex items-center justify-center gap-1 text-[10px] text-[#8B8F94]">
        <ShieldAlert className="w-3 h-3 text-[#E6C33A]" />
        <span>Bulk trades execute rapid sequential entry orders into demo balance.</span>
      </div>
    </div>
  );
};
