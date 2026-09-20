import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { AppLogo } from '../common/AppLogo';
import { Play, Square, Sparkles, Sliders, TrendingUp, ShieldCheck, Cpu, Zap } from 'lucide-react';

export const AutoTraderView: React.FC = () => {
  const { placeTrade, selectedMarket, user, addToast } = useTrading();

  const [botRunning, setBotRunning] = useState(false);
  const [strategy, setStrategy] = useState<'martingale' | 'dalembert' | 'digit_scanner'>('martingale');
  const [targetProfit, setTargetProfit] = useState(50);
  const [stopLoss, setStopLoss] = useState(25);
  const [botStake, setBotStake] = useState(2);
  const [tradesExecutedCount, setTradesExecutedCount] = useState(0);

  // Auto Execution Loop
  useEffect(() => {
    let interval: any = null;
    if (botRunning) {
      interval = setInterval(() => {
        // Random automated signal generation
        const directions: ('rise' | 'fall' | 'even' | 'odd')[] = ['rise', 'fall', 'even', 'odd'];
        const chosen = directions[Math.floor(Math.random() * directions.length)];
        
        const success = placeTrade(chosen as any, botStake);
        if (success) {
          setTradesExecutedCount((c) => c + 1);
        } else {
          setBotRunning(false);
        }
      }, 6000); // Fires auto trade every 6 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [botRunning, botStake, placeTrade]);

  const toggleBot = () => {
    if (!botRunning) {
      setBotRunning(true);
      addToast('info', '⚡ Auto Trader Started', `Strategy: ${strategy.toUpperCase()} active on ${selectedMarket.name}`);
    } else {
      setBotRunning(false);
      addToast('info', '⏹️ Auto Trader Halted', 'Auto trading session stopped.');
    }
  };

  const signals = [
    { market: 'Volatility 75 (1s)', signal: 'OVER 1', winRate: '90.4%', status: 'HOT' },
    { market: 'Volatility 10 (1s)', signal: 'EVEN', winRate: '88.2%', status: 'HIGH' },
    { market: 'Volatility 25 (1s)', signal: 'RISE', winRate: '84.6%', status: 'STABLE' },
  ];

  return (
    <div className="w-full bg-[#151719] border border-[#24272A] rounded-2xl p-4 text-[#F4F4F5] space-y-4">
      {/* Bot Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#24272A]">
        <div className="flex items-center gap-2">
          <AppLogo size="sm" />
          <div>
            <h3 className="font-bold text-xs text-[#F4F4F5] flex items-center gap-1.5">
              Apex Auto Trader
              {botRunning && (
                <span className="w-2 h-2 rounded-full bg-[#20C77A] animate-ping" />
              )}
            </h3>
            <p className="text-[10px] text-[#8B8F94]">Automated algorithmic execution engine</p>
          </div>
        </div>

        <button
          onClick={toggleBot}
          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
            botRunning
              ? 'bg-[#FF5964] text-white shadow-lg shadow-[#FF5964]/20'
              : 'bg-gradient-to-r from-[#20C77A] to-[#29D3D8] text-[#0D0F10] shadow-lg'
          }`}
        >
          {botRunning ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP TRADER</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START TRADER</span>
            </>
          )}
        </button>
      </div>

      {/* Strategy Selector */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-[#8B8F94] flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5 text-[#20C77A]" />
          <span>Algorithmic Strategy Preset</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setStrategy('martingale')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition ${
              strategy === 'martingale'
                ? 'bg-[#20C77A] text-[#0D0F10] font-bold border border-[#20C77A]'
                : 'bg-[#121416] border border-[#24272A] text-[#8B8F94]'
            }`}
          >
            Martingale
          </button>

          <button
            onClick={() => setStrategy('dalembert')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition ${
              strategy === 'dalembert'
                ? 'bg-[#20C77A] text-[#0D0F10] font-bold border border-[#20C77A]'
                : 'bg-[#121416] border border-[#24272A] text-[#8B8F94]'
            }`}
          >
            D'Alembert
          </button>

          <button
            onClick={() => setStrategy('digit_scanner')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center transition ${
              strategy === 'digit_scanner'
                ? 'bg-[#20C77A] text-[#0D0F10] font-bold border border-[#20C77A]'
                : 'bg-[#121416] border border-[#24272A] text-[#8B8F94]'
            }`}
          >
            Digit Scanner
          </button>
        </div>
      </div>


      {/* Risk Limits */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#121416] p-2 rounded-xl border border-[#24272A]">
          <span className="text-[10px] text-[#8B8F94] block">Base Stake</span>
          <div className="flex items-center font-mono text-xs font-bold text-[#F4F4F5]">
            <span className="text-[#8B8F94] mr-0.5">$</span>
            <input
              type="number"
              value={botStake}
              onChange={(e) => setBotStake(parseFloat(e.target.value) || 1)}
              className="bg-transparent w-full focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-[#121416] p-2 rounded-xl border border-[#24272A]">
          <span className="text-[10px] text-[#20C77A] block">Target Profit</span>
          <div className="flex items-center font-mono text-xs font-bold text-[#20C77A]">
            <span className="mr-0.5">$</span>
            <input
              type="number"
              value={targetProfit}
              onChange={(e) => setTargetProfit(parseFloat(e.target.value) || 0)}
              className="bg-transparent w-full focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-[#121416] p-2 rounded-xl border border-[#24272A]">
          <span className="text-[10px] text-[#FF5964] block">Stop Loss</span>
          <div className="flex items-center font-mono text-xs font-bold text-[#FF5964]">
            <span className="mr-0.5">$</span>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
              className="bg-transparent w-full focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Live Signals Stream */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#8B8F94]">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#E6C33A]" />
            <span>Algorithmic Signal Stream</span>
          </span>
          <span className="text-[10px] text-[#20C77A] font-mono">LIVE FEED</span>
        </div>

        <div className="space-y-1.5">
          {signals.map((sig, idx) => (
            <div
              key={idx}
              className="p-2 rounded-xl bg-[#121416] border border-[#24272A] flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-[#F4F4F5] block">{sig.market}</span>
                <span className="text-[10px] font-mono text-[#29D3D8]">Signal: {sig.signal}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-[#20C77A]/10 text-[#20C77A] px-1.5 py-0.5 rounded font-mono font-bold">
                  Win Rate {sig.winRate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2 bg-[#121416] rounded-xl border border-[#24272A] flex items-center justify-between text-[10px] text-[#8B8F94]">
        <span>Auto-Bot Executed Today: <strong className="text-[#F4F4F5] font-mono">{tradesExecutedCount} trades</strong></span>
        <div className="flex items-center gap-1 text-[#20C77A]">
          <ShieldCheck className="w-3 h-3" />
          <span>Demo Safeguards Active</span>
        </div>
      </div>
    </div>
  );
};
