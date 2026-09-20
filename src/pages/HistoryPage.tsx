import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { History, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { closedTrades } = useTrading();
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all');
  const [search, setSearch] = useState('');

  const filtered = closedTrades.filter((t) => {
    const matchFilter = filter === 'all' || (filter === 'wins' && t.result === 'win') || (filter === 'losses' && t.result === 'loss');
    const matchSearch = t.marketName.toLowerCase().includes(search.toLowerCase()) || t.contractType.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalClosed = closedTrades.length;
  const totalWins = closedTrades.filter((t) => t.result === 'win').length;
  const totalLosses = closedTrades.filter((t) => t.result === 'loss').length;
  const totalProfit = closedTrades.reduce((acc, t) => acc + (t.profit || 0), 0);

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#F4F4F5] flex items-center gap-2">
          <History className="w-5 h-5 text-[#29D3D8]" />
          <span>Trade History Audit</span>
        </h1>
        <p className="text-xs text-[#8B8F94]">Comprehensive history of all settled derivative contracts.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-[#151719] border border-[#24272A] text-center">
          <span className="text-[10px] text-[#8B8F94] uppercase font-bold block">Total Settled</span>
          <span className="font-mono font-bold text-xs text-[#F4F4F5]">{totalClosed} Trades</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#151719] border border-[#24272A] text-center">
          <span className="text-[10px] text-[#20C77A] uppercase font-bold block">Wins / Losses</span>
          <span className="font-mono font-bold text-xs text-[#F4F4F5]">
            <span className="text-[#20C77A]">{totalWins}W</span> / <span className="text-[#FF5964]">{totalLosses}L</span>
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#151719] border border-[#24272A] text-center">
          <span className="text-[10px] text-[#8B8F94] uppercase font-bold block">Net P/L</span>
          <span className={`font-mono font-bold text-xs ${totalProfit >= 0 ? 'text-[#20C77A]' : 'text-[#FF5964]'}`}>
            {totalProfit >= 0 ? `+$${totalProfit.toFixed(2)}` : `-$${Math.abs(totalProfit).toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8B8F94] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search asset or contract..."
            className="w-full pl-9 pr-3 py-2 bg-[#151719] border border-[#24272A] rounded-xl text-xs text-[#F4F4F5] placeholder:text-[#8B8F94] focus:outline-none focus:border-[#29D3D8]"
          />
        </div>

        <div className="flex p-1 bg-[#151719] border border-[#24272A] rounded-xl text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${filter === 'all' ? 'bg-[#29D3D8] text-[#0D0F10]' : 'text-[#8B8F94]'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('wins')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${filter === 'wins' ? 'bg-[#20C77A] text-[#0D0F10]' : 'text-[#8B8F94]'}`}
          >
            Wins
          </button>
          <button
            onClick={() => setFilter('losses')}
            className={`px-2.5 py-1 rounded-lg font-bold transition ${filter === 'losses' ? 'bg-[#FF5964] text-white' : 'text-[#8B8F94]'}`}
          >
            Losses
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8B8F94] bg-[#151719] rounded-2xl border border-[#24272A]">
            No trade history records match your search.
          </div>
        ) : (
          filtered.map((t, idx) => {
            const isWin = t.result === 'win';

            return (
              <div
                key={`hist_${t.id}_${idx}`}
                className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isWin ? 'bg-[#20C77A]/10 text-[#20C77A]' : 'bg-[#FF5964]/10 text-[#FF5964]'}`}>
                    {isWin ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="font-bold text-[#F4F4F5] flex items-center gap-1.5">
                      <span>{t.marketName}</span>
                      <span className="text-[9px] bg-[#24272A] text-[#29D3D8] px-1.5 py-0.2 rounded font-mono uppercase">
                        {t.contractType} ({t.direction.toUpperCase()})
                      </span>
                    </div>
                    <div className="text-[10px] text-[#8B8F94] font-mono mt-0.5">
                      Entry: ${t.entryPrice.toFixed(2)} → Exit: ${t.exitPrice?.toFixed(2) || 'N/A'} | Stake: ${t.stake.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold text-xs ${isWin ? 'text-[#20C77A]' : 'text-[#FF5964]'}`}>
                    {isWin ? `+$${t.profit?.toFixed(2)}` : `-$${t.stake.toFixed(2)}`}
                  </div>
                  <div className="text-[9px] text-[#8B8F94]">
                    {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
