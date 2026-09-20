import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { ArrowUpCircle, Smartphone, CreditCard, CheckCircle2, ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';

export const WithdrawPage: React.FC = () => {
  const { user, processWithdrawal, addToast, navigate } = useTrading();

  useEffect(() => {
    if (!user.isLoggedIn) {
      addToast('info', 'Sign In Required', 'Please sign in or create an account to request a withdrawal.');
      navigate('signup');
    }
  }, [user.isLoggedIn, navigate, addToast]);

  const MIN_WITHDRAWAL_USD = 100;
  const RATE_UGX_PER_USD = 3750;

  const [amount, setAmount] = useState<number>(100);
  const [method, setMethod] = useState<'mtn_ug' | 'airtel_ug' | 'bank' | 'crypto'>('mtn_ug');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const registeredPhone = user.phone || '';
  const registeredCountryCode = user.countryCode || '+256';

  const ugxPayoutEquivalent = amount * RATE_UGX_PER_USD;
  const isMinimumMet = amount >= MIN_WITHDRAWAL_USD;
  const hasSufficientBalance = user.balance >= amount;
  const isValidWithdrawal = isMinimumMet && hasSufficientBalance;

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isMinimumMet) {
      addToast(
        'error', 
        'Minimum Withdrawal Limit', 
        `Minimum withdrawal amount is $100.00 USD (${(MIN_WITHDRAWAL_USD * RATE_UGX_PER_USD).toLocaleString()} UGX).`
      );
      return;
    }

    if (!hasSufficientBalance) {
      addToast(
        'error', 
        'Insufficient Balance', 
        `Your available trading balance is $${user.balance.toFixed(2)} USD.`
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const methodLabel = method === 'mtn_ug' 
        ? 'MTN Mobile Money UG' 
        : method === 'airtel_ug' 
        ? 'Airtel Money UG' 
        : method === 'bank' 
        ? 'Bank Account' 
        : 'USDT Crypto Wallet';

      const destinationDetails = (method === 'mtn_ug' || method === 'airtel_ug') 
        ? `${registeredCountryCode}${registeredPhone}` 
        : accountNumber || 'Account Specified';

      processWithdrawal(amount, methodLabel, destinationDetails);

      addToast(
        'success', 
        'Withdrawal Request Sent', 
        `Payout of $${amount.toFixed(2)} USD (${ugxPayoutEquivalent.toLocaleString()} UGX) requested via ${methodLabel}.`
      );

      setLoading(false);
      navigate('transactions');
    }, 1200);
  };

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#F4F4F5] flex items-center gap-2">
          <ArrowUpCircle className="w-5 h-5 text-[#FF5964]" />
          <span>Capital Withdrawal</span>
        </h1>
        <p className="text-xs text-[#8B8F94]">Withdraw your trading earnings to Mobile Money or Bank Account ($100 USD min).</p>
      </div>

      {/* Available Balance Banner */}
      <div className="p-4 rounded-2xl bg-[#151719] border border-[#24272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-[#8B8F94] uppercase font-bold block">Available Trading Capital</span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-bold text-xl text-[#20C77A]">
              ${user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </span>
            <span className="text-xs text-[#8B8F94] font-mono">
              (≈ {(user.balance * RATE_UGX_PER_USD).toLocaleString()} UGX)
            </span>
          </div>
        </div>

        <div className="bg-[#0D0F10] px-3 py-1.5 rounded-xl border border-[#FF5964]/30 text-right">
          <span className="text-[9px] text-[#8B8F94] uppercase block font-bold">Minimum Withdrawal</span>
          <span className="text-xs font-mono font-bold text-[#FF5964]">$100.00 USD</span>
        </div>
      </div>

      <form onSubmit={handleWithdrawSubmit} className="space-y-4 bg-[#151719] border border-[#24272A] rounded-2xl p-4">
        {/* Payout Channel Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8B8F94]">Payout Channel</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod('mtn_ug')}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                method === 'mtn_ug'
                  ? 'bg-[#E6C33A]/10 border-[#E6C33A] text-[#E6C33A]'
                  : 'bg-[#121416] border-[#24272A] text-[#8B8F94]'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0 text-[#E6C33A]" />
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-[#F4F4F5] truncate">MTN MoMo</div>
                <div className="text-[9px] opacity-75">Uganda (+256)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod('airtel_ug')}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                method === 'airtel_ug'
                  ? 'bg-red-500/10 border-red-500 text-red-400'
                  : 'bg-[#121416] border-[#24272A] text-[#8B8F94]'
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0 text-red-400" />
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-[#F4F4F5] truncate">Airtel Money</div>
                <div className="text-[9px] opacity-75">Uganda (+256)</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod('bank')}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                method === 'bank'
                  ? 'bg-[#29D3D8]/10 border-[#29D3D8] text-[#29D3D8]'
                  : 'bg-[#121416] border-[#24272A] text-[#8B8F94]'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0 text-[#29D3D8]" />
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-[#F4F4F5] truncate">Bank Transfer</div>
                <div className="text-[9px] opacity-75">Commercial Bank</div>
              </div>
            </button>
          </div>
        </div>

        {/* Channel Details */}
        {method === 'mtn_ug' || method === 'airtel_ug' ? (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#8B8F94]">Destination Mobile Money Number</label>
            <div className="flex items-center bg-[#121416]/70 border border-[#24272A] rounded-xl overflow-hidden cursor-not-allowed">
              <span className="bg-[#151719] text-xs font-mono font-bold text-[#20C77A] px-3 py-2.5 border-r border-[#24272A] select-none">
                {registeredCountryCode}
              </span>
              <input
                type="text"
                value={registeredPhone}
                readOnly
                disabled
                className="w-full bg-transparent px-3 py-2.5 text-xs font-mono text-[#F4F4F5] cursor-not-allowed select-none opacity-90 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#8B8F94]">Bank Account / IBAN / Wallet Address</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. Stanbic Bank UG - 9030001234567"
              className="w-full bg-[#121416] border border-[#24272A] rounded-xl px-3 py-2.5 text-xs font-mono text-[#F4F4F5] focus:outline-none focus:border-[#20C77A]"
            />
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#8B8F94]">Withdrawal Amount ($ USD)</label>
            <span className="text-[10px] text-[#FF5964] font-mono font-bold">
              Min: $100.00 USD
            </span>
          </div>

          <div className="flex items-center bg-[#121416] border border-[#24272A] rounded-xl px-3 py-2.5 font-mono text-sm">
            <span className="text-[#20C77A] mr-2 font-bold">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="bg-transparent w-full font-bold focus:outline-none text-[#F4F4F5]"
            />
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[100, 250, 500, 1000].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p)}
                className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition ${
                  amount === p
                    ? 'bg-[#FF5964] text-white'
                    : 'bg-[#121416] border border-[#24272A] text-[#8B8F94] hover:text-[#F4F4F5]'
                }`}
              >
                ${p}
              </button>
            ))}
          </div>
        </div>

        {/* Validation Errors & Live Payout Summary */}
        {!isMinimumMet ? (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Minimum withdrawal amount is $100.00 USD (≈ 375,000 UGX). Please enter $100 or more.</span>
          </div>
        ) : !hasSufficientBalance ? (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Requested amount (${amount.toFixed(2)}) exceeds available balance (${user.balance.toFixed(2)}).</span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#0D0F10] border border-[#FF5964]/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-[#8B8F94] block font-bold uppercase">Requested USD Payout</span>
              <span className="font-mono font-bold text-sm text-[#FF5964]">
                -${amount.toFixed(2)} USD
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8B8F94] block font-bold uppercase">Ugandan Shilling Payout</span>
              <span className="font-mono font-semibold text-xs text-[#E6C33A]">
                ≈ {ugxPayoutEquivalent.toLocaleString()} UGX
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isValidWithdrawal}
          className="w-full py-3.5 rounded-xl bg-[#FF5964] hover:bg-[#f04f5a] text-white font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-[#FF5964]/20"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>
                SUBMIT WITHDRAWAL REQUEST (${amount.toFixed(2)} USD)
              </span>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8B8F94]">
        <ShieldAlert className="w-3.5 h-3.5 text-[#E6C33A]" />
        <span>Demonstration sandbox mode. Virtual payouts processed instantaneously to transaction log.</span>
      </div>
    </div>
  );
};
