import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  ChevronRight
} from 'lucide-react';

export const TradeWorkspaceTabs: React.FC = () => {
  const { 
    openTrades, 
    closedTrades, 
    transactions, 
    setIsQuickActionOpen, 
    navigate 
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'open' | 'closed' | 'transactions'>('open');

  return (
    <div className="w-full bg-[#151719] border border-[#24272A] rounded-2xl p-3 sm:p-4 text-[#F4F4F5] space-y-3">
      {/* Tab Navigation Header with Circular (+) Button */}
      <div className="flex items-center justify-between border-b border-[#24272A] pb-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'open'
                ? 'bg-[#29D3D8] text-[#0D0F10]'
                : 'text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#121416]'
            }`}
          >
            <span>Open</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'open' ? 'bg-[#0D0F10]/20 text-[#0D0F10]' : 'bg-[#24272A] text-[#8B8F94]'
            }`}>
              {openTrades.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('closed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'closed'
                ? 'bg-[#29D3D8] text-[#0D0F10]'
                : 'text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#121416]'
            }`}
          >
            <span>Closed</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'closed' ? 'bg-[#0D0F10]/20 text-[#0D0F10]' : 'bg-[#24272A] text-[#8B8F94]'
            }`}>
              {closedTrades.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'bg-[#29D3D8] text-[#0D0F10]'
                : 'text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#121416]'
            }`}
          >
            <span>Transactions</span>
          </button>
        </div>

        {/* Circular Quick Action Button (+) */}
        <button
          onClick={() => setIsQuickActionOpen(true)}
          className="p-1.5 rounded-full bg-[#29D3D8]/10 text-[#29D3D8] hover:bg-[#29D3D8] hover:text-[#0D0F10] transition shadow active:scale-95 flex items-center justify-center"
          title="Quick Actions (+)"
          aria-label="Quick Actions"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Content 1: Open Trades */}
      {activeTab === 'open' && (
        <div className="space-y-2.5">
          {openTrades.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B8F94] space-y-2">
              <Clock className="w-8 h-8 text-[#24272A] mx-auto" />
              <p>No active running trades in execution.</p>
              <p className="text-[10px] text-[#29D3D8]">Place a trade above to view real-time countdown settlement.</p>
            </div>
          ) : (
            openTrades.map((trade, idx) => {
              const progressPct = Math.max(0, Math.min(100, ((trade.durationSeconds - trade.remainingSeconds) / trade.durationSeconds) * 100));

              return (
                <div
                  key={`op_${trade.id}_${idx}`}
                  className="p-3 rounded-xl bg-[#121416] border border-[#24272A] space-y-2 relative overflow-hidden"
                >
                  {/* Progress Bar Top Accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#24272A]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#29D3D8] to-[#20C77A] transition-all duration-1000"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-bold text-xs text-[#F4F4F5] flex items-center gap-1.5">
                        <span>{trade.marketName}</span>
                        <span className="text-[9px] bg-[#29D3D8]/10 text-[#29D3D8] px-1.5 py-0.2 rounded font-mono uppercase font-bold">
                          {trade.contractType} ({trade.direction.toUpperCase()})
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8B8F94] font-mono mt-0.5">
                        Entry: ${trade.entryPrice.toFixed(2)} | Current: ${trade.currentPrice.toFixed(2)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 font-mono text-xs font-bold text-[#E6C33A]">
                        <Clock className="w-3.5 h-3.5 animate-spin text-[#E6C33A]" />
                        <span>{trade.remainingSeconds}s</span>
                      </div>
                      <div className="text-[10px] text-[#20C77A] font-mono font-bold">
                        Payout: ${trade.potentialPayout.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content 2: Closed Trades */}
      {activeTab === 'closed' && (
        <div className="space-y-2">
          {closedTrades.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B8F94]">No historical closed trades recorded.</div>
          ) : (
            closedTrades.slice(0, 15).map((trade, idx) => {
              const isWin = trade.result === 'win';

              return (
                <div
                  key={`cl_${trade.id}_${idx}`}
                  className="p-3 rounded-xl bg-[#121416] border border-[#24272A] flex items-center justify-between text-xs hover:border-[#24272A]/80 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isWin ? 'bg-[#20C77A]/10 text-[#20C77A]' : 'bg-[#FF5964]/10 text-[#FF5964]'}`}>
                      {isWin ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="font-bold text-[#F4F4F5] flex items-center gap-1">
                        <span>{trade.marketName}</span>
                        <span className="text-[9px] text-[#8B8F94] font-mono">({trade.direction.toUpperCase()})</span>
                      </div>
                      <div className="text-[10px] text-[#8B8F94] font-mono">
                        Stake: ${trade.stake.toFixed(2)} | Exit: ${trade.exitPrice?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-xs ${isWin ? 'text-[#20C77A]' : 'text-[#FF5964]'}`}>
                      {isWin ? `+$${trade.profit?.toFixed(2)}` : `-$${trade.stake.toFixed(2)}`}
                    </div>
                    <div className="text-[9px] text-[#8B8F94]">
                      {new Date(trade.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {closedTrades.length > 15 && (
            <button
              onClick={() => navigate('history')}
              className="w-full py-2 text-center text-xs text-[#29D3D8] hover:underline font-semibold flex items-center justify-center gap-1"
            >
              <span>View Full History ({closedTrades.length} records)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Tab Content 3: Transactions */}
      {activeTab === 'transactions' && (
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B8F94]">No transaction audit records found.</div>
          ) : (
            transactions.slice(0, 12).map((txn, idx) => {
              const isPositive = txn.amount > 0;

              return (
                <div
                  key={`tx_${txn.id}_${idx}`}
                  className="p-3 rounded-xl bg-[#121416] border border-[#24272A] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isPositive ? 'bg-[#20C77A]/10 text-[#20C77A]' : 'bg-[#FF5964]/10 text-[#FF5964]'}`}>
                      {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="font-bold text-[#F4F4F5]">{txn.description}</div>
                      <div className="text-[10px] text-[#8B8F94] font-mono">Ref: {txn.reference}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-bold text-xs ${isPositive ? 'text-[#20C77A]' : 'text-[#FF5964]'}`}>
                      {isPositive ? `+$${txn.amount.toFixed(2)}` : `-$${Math.abs(txn.amount).toFixed(2)}`}
                    </div>
                    <div className="text-[9px] text-[#8B8F94]">
                      {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
