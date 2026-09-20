import React, { useState, useEffect, useRef } from 'react';
import { useTrading } from '../context/TradingContext';
import { ArrowDownCircle, Smartphone, CreditCard, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle, Globe, ChevronDown, XCircle, Loader2, Clock } from 'lucide-react';

interface CountryOption {
  code: string;
  name: string;
  currency: string;
  flag: string;
  phonePrefix: string;
  minAmount: number;
  exchangeRateToUSD: number; // local per 1 USD
  methods: string[];
}

const SUPPORTED_COUNTRIES: CountryOption[] = [
  {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    flag: '🇺🇬',
    phonePrefix: '+256',
    minAmount: 10000,
    exchangeRateToUSD: 3880,
    methods: ['MTN Mobile Money', 'Airtel Money', 'Bank Card']
  },
  {
    code: 'RW',
    name: 'Rwanda',
    currency: 'RWF',
    flag: '🇷🇼',
    phonePrefix: '+250',
    minAmount: 3500,
    exchangeRateToUSD: 1350,
    methods: ['MTN Mobile Money Rwanda', 'Airtel Rwanda', 'Bank Card']
  },
  {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    flag: '🇰🇪',
    phonePrefix: '+254',
    minAmount: 350,
    exchangeRateToUSD: 130,
    methods: ['M-Pesa Kenya', 'Bank Card']
  },
  {
    code: 'CM',
    name: 'Cameroon',
    currency: 'XAF',
    flag: '🇨🇲',
    phonePrefix: '+237',
    minAmount: 1600,
    exchangeRateToUSD: 600,
    methods: ['MTN Mobile Money Cameroon', 'Orange Money Cameroon', 'Bank Card']
  },
  {
    code: 'CD',
    name: 'DR Congo',
    currency: 'CDF',
    flag: '🇨🇩',
    phonePrefix: '+243',
    minAmount: 7000,
    exchangeRateToUSD: 2800,
    methods: ['Vodacom M-Pesa', 'Airtel Money DRC', 'Orange Money DRC']
  },
  {
    code: 'CG',
    name: 'Republic of Congo',
    currency: 'XAF',
    flag: '🇨🇬',
    phonePrefix: '+242',
    minAmount: 1600,
    exchangeRateToUSD: 600,
    methods: ['MTN Mobile Money Congo', 'Airtel Congo', 'Bank Card']
  },
  {
    code: 'ZM',
    name: 'Zambia',
    currency: 'ZMW',
    flag: '🇿🇲',
    phonePrefix: '+260',
    minAmount: 60,
    exchangeRateToUSD: 26.5,
    methods: ['MTN Mobile Money Zambia', 'Airtel Zambia', 'Zamtel']
  },
  {
    code: 'SZ',
    name: 'Eswatini',
    currency: 'SZL',
    flag: '🇸🇿',
    phonePrefix: '+268',
    minAmount: 50,
    exchangeRateToUSD: 18.5,
    methods: ['MTN Mobile Money Eswatini', 'Bank Card']
  }
];

export const DepositPage: React.FC = () => {
  const { processDeposit, user, addToast, navigate } = useTrading();

  useEffect(() => {
    if (!user.isLoggedIn) {
      addToast('info', 'Sign In Required', 'Please sign in or create an account to deposit funds.');
      navigate('signup');
    }
  }, [user.isLoggedIn, navigate, addToast]);

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('UG');
  const selectedCountry = SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountryCode) || SUPPORTED_COUNTRIES[0];

  const [method, setMethod] = useState<string>(selectedCountry.methods[0]);
  const [phone, setPhone] = useState(user.phone || '772123456');
  const [localAmount, setLocalAmount] = useState<number>(selectedCountry.minAmount);
  const [loading, setLoading] = useState(false);

  const MARZPAY_GAS_URL = 'https://hidden-mud-6c41.devtech603.workers.dev';

  interface AuthModalState {
    open: boolean;
    status: 'awaiting_pin' | 'success' | 'failed';
    uuid?: string;
    phone: string;
    amount: number;
    currency: string;
    usd: number;
    method: string;
    errorMessage?: string;
    elapsedSeconds: number;
  }

  const [authModal, setAuthModal] = useState<AuthModalState>({
    open: false,
    status: 'awaiting_pin',
    phone: '',
    amount: 0,
    currency: 'UGX',
    usd: 0,
    method: '',
    elapsedSeconds: 0
  });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Poll transaction status while awaiting PIN authorization
  useEffect(() => {
    if (!authModal.open || authModal.status !== 'awaiting_pin' || !authModal.uuid) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    const checkInterval = setInterval(async () => {
      setAuthModal((prev) => {
        const nextSeconds = prev.elapsedSeconds + 3;
        if (nextSeconds >= 90) {
          clearInterval(checkInterval);
          addToast('error', 'Payment Timed Out', 'No PIN authorization received within 90 seconds. Transaction cancelled.');
          return {
            ...prev,
            status: 'failed',
            elapsedSeconds: nextSeconds,
            errorMessage: 'Authorization timed out. The prompt was not completed on your phone.'
          };
        }
        return { ...prev, elapsedSeconds: nextSeconds };
      });

      try {
        const res = await fetch(MARZPAY_GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'check-status',
            uuid: authModal.uuid
          })
        });
        const data = await res.json().catch(() => null);
        const txStatus = data?.txStatus?.toLowerCase();

        if (txStatus === 'successful' || txStatus === 'completed' || txStatus === 'success') {
          clearInterval(checkInterval);
          processDeposit(authModal.usd, `${authModal.method} (${authModal.currency})`, authModal.phone);
          setAuthModal((prev) => ({ ...prev, status: 'success' }));
          addToast('success', 'Deposit Confirmed!', `+$${authModal.usd.toFixed(2)} USD added to your trading balance.`);
        } else if (txStatus === 'failed' || txStatus === 'cancelled' || txStatus === 'declined' || txStatus === 'rejected') {
          clearInterval(checkInterval);
          const reason = data?.details?.data?.collection?.description || 'The payment was cancelled or declined on your phone.';
          setAuthModal((prev) => ({
            ...prev,
            status: 'failed',
            errorMessage: reason
          }));
          addToast('error', 'Payment Cancelled', 'No funds were credited. You cancelled or declined the prompt.');
        }
      } catch (pollErr) {
        console.warn('Status poll check note:', pollErr);
      }
    }, 3000);

    pollingRef.current = checkInterval;

    return () => clearInterval(checkInterval);
  }, [authModal.open, authModal.status, authModal.uuid]);

  // Update defaults when country changes
  useEffect(() => {
    setMethod(selectedCountry.methods[0]);
    setLocalAmount(selectedCountry.minAmount);
  }, [selectedCountryCode]);

  const exchangeRate = selectedCountry.exchangeRateToUSD || 3880;
  const calculatedUsdCredit = localAmount > 0 ? parseFloat((localAmount / exchangeRate).toFixed(2)) : 0;
  const isValidAmount = localAmount >= selectedCountry.minAmount;

  const presets = selectedCountry.currency === 'UGX'
    ? [10000, 25000, 50000, 100000, 500000]
    : selectedCountry.currency === 'KES'
    ? [350, 500, 1000, 2500, 5000]
    : selectedCountry.currency === 'RWF'
    ? [3500, 5000, 10000, 25000, 50000]
    : selectedCountry.currency === 'XAF'
    ? [1600, 3000, 5000, 10000, 25000]
    : [50, 100, 250, 500, 1000];

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAmount) {
      addToast(
        'error',
        'Minimum Deposit Error',
        `Minimum deposit for ${selectedCountry.name} is ${selectedCountry.minAmount.toLocaleString()} ${selectedCountry.currency}.`
      );
      return;
    }

    setLoading(true);
    const fullPhone = `${selectedCountry.phonePrefix}${phone}`;
    const creditedUsd = parseFloat(calculatedUsdCredit.toFixed(2));

    try {
      // Send payment initiate trigger to deployed Cloudflare Gateway
      const res = await fetch(MARZPAY_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate',
          amount: localAmount,
          currency: selectedCountry.currency,
          country: selectedCountry.code,
          phone: fullPhone,
          email: user.email || 'trader@apextrades.com',
          userId: user.id || 'GUEST',
          method: method
        })
      });

      const data = await res.json().catch(() => null);

      if (data && data.status === 'error') {
        addToast('error', 'Payment Gateway Notice', data.message || 'Payment initiation failed');
        setLoading(false);
        return;
      }

      const txUuid = data?.data?.transaction?.uuid;

      // Open Real-Time Mobile Money Authorization Dialog
      setAuthModal({
        open: true,
        status: 'awaiting_pin',
        uuid: txUuid,
        phone: fullPhone,
        amount: localAmount,
        currency: selectedCountry.currency,
        usd: creditedUsd,
        method: method,
        elapsedSeconds: 0
      });

      addToast(
        'info', 
        'Mobile Money Prompt Sent', 
        `Check your phone ${fullPhone} now to enter your PIN and authorize.`
      );
    } catch (err: any) {
      console.warn('Payment request error:', err);
      addToast('error', 'Network Error', 'Could not reach the payment gateway. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg sm:max-w-xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#F4F4F5] flex items-center gap-2">
          <ArrowDownCircle className="w-5 h-5 text-[#20C77A]" />
          <span>Deposit Funds</span>
        </h1>
        <p className="text-xs text-[#8B8F94]">Select your country and deposit in local currency with instant USD balance conversion.</p>
      </div>

      <form onSubmit={handleDepositSubmit} className="space-y-4 bg-[#151719] border border-[#24272A] rounded-2xl p-4">
        {/* Country Selector Dropdown Bar */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8B8F94] flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#20C77A]" />
            <span>Select Country</span>
          </label>
          <div className="relative">
            <select
              value={selectedCountryCode}
              onChange={(e) => setSelectedCountryCode(e.target.value)}
              className="w-full bg-[#121416] border border-[#24272A] rounded-xl px-3.5 py-3 text-xs sm:text-sm text-[#F4F4F5] font-medium appearance-none focus:outline-none focus:border-[#20C77A] cursor-pointer transition pr-10"
            >
              {SUPPORTED_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code} className="bg-[#151719] text-[#F4F4F5]">
                  {country.flag} {country.name} ({country.currency})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#8B8F94] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#8B8F94]">Payment Method</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedCountry.methods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                  method === m
                    ? 'bg-[#20C77A]/10 border-[#20C77A] text-[#20C77A]'
                    : 'bg-[#121416] border-[#24272A] text-[#8B8F94] hover:text-[#F4F4F5]'
                }`}
              >
                {m.toLowerCase().includes('card') ? (
                  <CreditCard className="w-4 h-4 shrink-0 text-[#20C77A]" />
                ) : (
                  <Smartphone className="w-4 h-4 shrink-0 text-[#20C77A]" />
                )}
                <span className="font-bold text-xs truncate">{m}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Money Phone Input */}
        {!method.toLowerCase().includes('card') && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#8B8F94]">Mobile Money Phone Number</label>
            <div className="flex items-center bg-[#121416] border border-[#24272A] rounded-xl overflow-hidden focus-within:border-[#20C77A]">
              <span className="bg-[#151719] text-xs font-mono font-bold text-[#20C77A] px-3 py-2.5 border-r border-[#24272A]">
                {selectedCountry.phonePrefix}
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="772123456"
                className="w-full bg-transparent px-3 py-2.5 text-xs font-mono text-[#F4F4F5] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Amount Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#8B8F94]">
              Deposit Amount ({selectedCountry.currency})
            </label>
            <span className="text-[10px] text-[#20C77A] font-mono font-medium">
              Min: {selectedCountry.minAmount.toLocaleString()} {selectedCountry.currency}
            </span>
          </div>

          <div className="flex items-center bg-[#121416] border border-[#24272A] rounded-xl px-3 py-2.5 font-mono text-sm">
            <span className="text-[#8B8F94] mr-2 font-bold">{selectedCountry.currency}</span>
            <input
              type="number"
              value={localAmount}
              onChange={(e) => setLocalAmount(parseFloat(e.target.value) || 0)}
              className="bg-transparent w-full font-bold focus:outline-none text-[#F4F4F5]"
            />
          </div>

          {/* Amount Presets */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setLocalAmount(p)}
                className={`py-1.5 rounded-lg text-[10px] font-mono font-bold transition ${
                  localAmount === p
                    ? 'bg-[#20C77A] text-[#0D0F10]'
                    : 'bg-[#121416] border border-[#24272A] text-[#8B8F94] hover:text-[#F4F4F5]'
                }`}
              >
                {p >= 1000 ? `${p / 1000}k` : p}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Validation & Live Conversion Card */}
        {!isValidAmount ? (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Minimum deposit for {selectedCountry.name} is {selectedCountry.minAmount.toLocaleString()} {selectedCountry.currency}.
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#0D0F10] border border-[#20C77A]/30 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-[#8B8F94] block font-bold uppercase">USD Account Credit</span>
              <span className="font-mono font-bold text-sm text-[#20C77A]">
                +${calculatedUsdCredit.toFixed(2)} USD
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8B8F94] block font-bold uppercase">Exchange Rate</span>
              <span className="font-mono font-semibold text-xs text-[#E6C33A]">
                1 USD = {exchangeRate.toLocaleString()} {selectedCountry.currency}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isValidAmount}
          className="w-full py-3.5 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>
                CONFIRM DEPOSIT OF {localAmount.toLocaleString()} {selectedCountry.currency} (+${calculatedUsdCredit.toFixed(2)} USD)
              </span>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8B8F94]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#20C77A]" />
        <span>Secured 256-bit encrypted payment transaction.</span>
      </div>

      {/* REAL-TIME MOBILE MONEY PIN AUTHORIZATION MODAL */}
      {authModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151719] border border-[#24272A] rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            
            {/* 1. AWAITING PIN STATE */}
            {authModal.status === 'awaiting_pin' && (
              <>
                <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping" />
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg">
                    <Smartphone className="w-7 h-7 animate-bounce" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#F4F4F5]">Enter Your PIN on Your Phone</h3>
                  <p className="text-xs text-[#8B8F94]">
                    A payment prompt has been sent to <span className="text-[#F4F4F5] font-semibold">{authModal.phone}</span>
                  </p>
                </div>

                <div className="bg-[#121416] border border-[#24272A] rounded-xl p-3 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[#8B8F94]">
                    <span>Amount to authorize:</span>
                    <span className="font-bold text-[#F4F4F5]">{authModal.amount.toLocaleString()} {authModal.currency}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#8B8F94]">
                    <span>USD to be credited:</span>
                    <span className="font-bold text-[#20C77A]">+${authModal.usd.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-[11px] text-amber-400/90 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Waiting for PIN authorization ({90 - authModal.elapsedSeconds}s)</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAuthModal(prev => ({
                      ...prev,
                      status: 'failed',
                      errorMessage: 'You cancelled the payment request.'
                    }));
                    addToast('error', 'Deposit Cancelled', 'You cancelled the authorization request.');
                  }}
                  className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition"
                >
                  Cancel Payment
                </button>
              </>
            )}

            {/* 2. PAYMENT FAILED / CANCELLED STATE */}
            {authModal.status === 'failed' && (
              <>
                <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400">
                  <XCircle className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-red-400">Deposit Failed / Cancelled</h3>
                  <p className="text-xs text-[#8B8F94]">
                    {authModal.errorMessage || 'The payment prompt was cancelled or declined on your phone.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
                  No funds were deducted, and your trading balance was NOT credited.
                </div>

                <button
                  type="button"
                  onClick={() => setAuthModal(prev => ({ ...prev, open: false }))}
                  className="w-full py-2.5 rounded-xl bg-[#24272A] hover:bg-[#2e3236] text-[#F4F4F5] text-xs font-bold transition"
                >
                  Close & Try Again
                </button>
              </>
            )}

            {/* 3. PAYMENT SUCCESS STATE */}
            {authModal.status === 'success' && (
              <>
                <div className="mx-auto w-14 h-14 rounded-full bg-[#20C77A]/10 border border-[#20C77A]/40 flex items-center justify-center text-[#20C77A]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#20C77A]">Deposit Approved & Credited!</h3>
                  <p className="text-xs text-[#8B8F94]">
                    Payment of {authModal.amount.toLocaleString()} {authModal.currency} verified successfully.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#20C77A]/10 border border-[#20C77A]/30 text-xs font-bold text-[#20C77A]">
                  +${authModal.usd.toFixed(2)} USD Added to Balance
                </div>

                <button
                  type="button"
                  onClick={() => setAuthModal(prev => ({ ...prev, open: false }))}
                  className="w-full py-2.5 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] text-xs font-bold transition"
                >
                  Done
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
