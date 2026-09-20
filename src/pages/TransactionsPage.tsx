import React from 'react';
import { useTrading } from '../context/TradingContext';
import { Receipt, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { transactions } = useTrading();

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#F4F4F5] flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#29D3D8]" />
          <span>Account Transactions Audit</span>
        </h1>
        <p className="text-xs text-[#8B8F94]">Detailed ledger of all deposits, trade stakes, payouts, and withdrawals.</p>
      </div>

      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8B8F94] bg-[#151719] rounded-2xl border border-[#24272A]">
            No transaction records found.
          </div>
        ) : (
          transactions.map((txn) => {
            const isPositive = txn.amount > 0;

            return (
              <div
                key={txn.id}
                className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isPositive ? 'bg-[#20C77A]/10 text-[#20C77A]' : 'bg-[#FF5964]/10 text-[#FF5964]'}`}>
                    {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="font-bold text-[#F4F4F5]">{txn.description}</div>
                    <div className="text-[10px] text-[#8B8F94] font-mono">
                      Ref: {txn.reference} | Type: {txn.type.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-mono font-bold text-xs ${isPositive ? 'text-[#20C77A]' : 'text-[#FF5964]'}`}>
                    {isPositive ? `+$${txn.amount.toFixed(2)}` : `-$${Math.abs(txn.amount).toFixed(2)}`}
                  </div>
                  <div className="text-[9px] text-[#8B8F94]">
                    {new Date(txn.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
