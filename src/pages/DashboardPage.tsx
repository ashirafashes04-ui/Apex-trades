import React from 'react';
import { useTrading } from '../context/TradingContext';
import { 
  TrendingUp, 
  BarChart2, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  Award, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  Bot
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, navigate, closedTrades, openTrades, markets, setIsDepositOpen, setIsAIOpen } = useTrading();

  // Calculate statistics
  const totalTradesCount = closedTrades.length;
  const winsCount = closedTrades.filter((t) => t.result === 'win').length;
  const winRate = totalTradesCount > 0 ? ((winsCount / totalTradesCount) * 100).toFixed(1) : '0.0';

  const totalProfit = closedTrades.reduce((acc, t) => acc + (t.profit || 0), 0);

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-[#151719] via-[#121416] to-[#151719] border border-[#24272A] text-[#F4F4F5] shadow-xl">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#E6C33A] bg-[#E6C33A]/10 border border-[#E6C33A]/20 px-2 py-0.5 rounded-full">
              DEMO SIMULATION MODE
            </span>
            <span className="text-xs text-[#8B8F94] font-mono">ID: {user.id}</span>
          </div>

          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            Welcome back, <span className="text-[#29D3D8]">{user.name}</span> 👋
          </h1>
          <p className="text-xs text-[#8B8F94]">
            Monitor synthetic performance, manage risk, and execute trades instantly.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => navigate('trade')}
              className="px-4 py-2 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs transition shadow active:scale-95 flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Launch Terminal</span>
            </button>

            <button
              onClick={() => navigate('deposit')}
              className="px-4 py-2 rounded-xl bg-[#24272A] hover:bg-[#29D3D8]/20 text-[#29D3D8] font-bold text-xs transition border border-[#24272A] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Top Up Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Balance & Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Balance Card */}
        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-1">
          <span className="text-[10px] uppercase font-semibold text-[#8B8F94]">Demo Balance</span>
          <div className="font-mono font-bold text-sm sm:text-base text-[#F4F4F5]">
            ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] text-[#20C77A] font-mono block">Virtual Capital</span>
        </div>

        {/* Total Profit/Loss Card */}
        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-1">
          <span className="text-[10px] uppercase font-semibold text-[#8B8F94]">Net Demo P/L</span>
          <div className={`font-mono font-bold text-sm sm:text-base ${totalProfit >= 0 ? 'text-[#20C77A]' : 'text-[#FF5964]'}`}>
            {totalProfit >= 0 ? `+$${totalProfit.toFixed(2)}` : `-$${Math.abs(totalProfit).toFixed(2)}`}
          </div>
          <span className="text-[9px] text-[#8B8F94] font-mono block">Historical Total</span>
        </div>

        {/* Win Rate Card */}
        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-1">
          <span className="text-[10px] uppercase font-semibold text-[#8B8F94]">Win Rate</span>
          <div className="font-mono font-bold text-sm sm:text-base text-[#E6C33A]">
            {winRate}%
          </div>
          <span className="text-[9px] text-[#8B8F94] font-mono block">{winsCount} Wins / {totalTradesCount} Trades</span>
        </div>

        {/* Active Open Trades */}
        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-1">
          <span className="text-[10px] uppercase font-semibold text-[#8B8F94]">Open Positions</span>
          <div className="font-mono font-bold text-sm sm:text-base text-[#29D3D8]">
            {openTrades.length} Running
          </div>
          <span className="text-[9px] text-[#29D3D8] font-mono block">Active Ticks</span>
        </div>
      </div>

      {/* Quick Market Overview List */}
      <div className="bg-[#151719] border border-[#24272A] rounded-2xl p-4 text-[#F4F4F5] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#29D3D8]" />
            <h3 className="font-bold text-xs text-[#F4F4F5]">Top Volatility Synthetic Indices</h3>
          </div>
          <button
            onClick={() => navigate('markets')}
            className="text-xs text-[#29D3D8] font-semibold hover:underline flex items-center gap-1"
          >
            <span>All Markets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {markets.slice(0, 4).map((m) => (
            <div
              key={m.id}
              onClick={() => navigate('trade')}
              className="p-3 rounded-xl bg-[#121416] border border-[#24272A] hover:border-[#29D3D8]/40 flex items-center justify-between cursor-pointer transition"
            >
              <div>
                <div className="font-bold text-xs text-[#F4F4F5]">{m.name}</div>
                <div className="text-[10px] text-[#8B8F94] font-mono">{m.symbol}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-xs text-[#F4F4F5]">{m.price.toFixed(2)}</div>
                <div className={`text-[10px] font-bold ${m.change >= 0 ? 'text-[#20C77A]' : 'text-[#FF5964]'}`}>
                  {m.change >= 0 ? `+${m.change}%` : `${m.change}%`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick AI & Help Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 flex items-center justify-between text-[#F4F4F5]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600 text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-[#F4F4F5]">Need Strategy Advice?</h4>
            <p className="text-[10px] text-purple-300">Ask ApexAI about synthetic contracts and digit probabilities.</p>
          </div>
        </div>

        <button
          onClick={() => setIsAIOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shrink-0"
        >
          Ask AI
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8B8F94] text-center pt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#20C77A]" />
        <span>All trading in ApexTrades default mode is simulated using synthetic index algorithms.</span>
      </div>
    </div>
  );
};
