import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { AppLogo } from '../components/common/AppLogo';
import { ChevronDown } from 'lucide-react';

interface CountryOption {
  code: string;
  country: string;
  flag: string;
}

const COUNTRIES: CountryOption[] = [
  { code: '+256', country: 'Uganda', flag: '🇺🇬' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
  { code: '+250', country: 'Rwanda', flag: '🇷🇼' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
];

export const AuthPages: React.FC = () => {
  const { currentRoute, loginUser, signupUser, navigate, addToast } = useTrading();
  const isSignUp = currentRoute === 'signup';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+256');
  const [partnerCode, setPartnerCode] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  useEffect(() => {
    const detected = localStorage.getItem('apextrades_detected_ref');
    if (detected) {
      setPartnerCode(detected);
    }
  }, []);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (!name.trim()) {
        addToast('error', 'Display Name Required', 'Please enter your display name.');
        return;
      }
      if (!email.trim()) {
        addToast('error', 'Email Required', 'Please enter a valid email address.');
        return;
      }
      if (!phone.trim()) {
        addToast('error', 'Phone Number Required', 'Please enter your mobile money number.');
        return;
      }
      signupUser(name.trim(), email.trim(), phone.trim(), countryCode, partnerCode.trim() || undefined);
    } else {
      if (!email.trim()) {
        addToast('error', 'Email Required', 'Please enter your account email.');
        return;
      }
      loginUser(email.trim(), name.trim() || email.split('@')[0]);
    }
  };

  const handleDemoLogin = () => {
    loginUser('trader.demo@apextrades.com', 'Alex Morgan');
  };

  const handleForgotPassword = () => {
    if (!email) {
      addToast('info', 'Password Reset', 'Please type your email address to receive reset instructions.');
      return;
    }
    addToast('success', 'Reset Link Sent', `Password reset instructions sent to ${email}`);
  };

  return (
    <div className="min-h-screen bg-[#0D0F10] text-[#F4F4F5] flex flex-col items-center justify-center p-4 py-8">
      {/* Brand Logo Header */}
      <div className="mb-6 cursor-pointer" onClick={() => navigate('trade')}>
        <AppLogo size="md" />
      </div>

      {/* Main Auth Card Container */}
      <div className="w-full max-w-md bg-[#141618] border border-[#24272A] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-xs sm:text-sm text-[#8B8F94] mt-1.5">
            {isSignUp
              ? "Sign up in seconds — we'll verify your mobile number next."
              : 'Log in to keep playing.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up Specific Fields */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#D1D5DB] block">
                Display name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required={isSignUp}
                className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-3 text-sm text-white placeholder-[#5C6166] focus:outline-none focus:border-[#20C77A] transition"
              />
            </div>
          )}

          {/* Email Field (Shared) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#D1D5DB] block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              required
              className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-3 text-sm text-white placeholder-[#5C6166] focus:outline-none focus:border-[#20C77A] transition"
            />
          </div>

          {/* Mobile Money Number Field (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#D1D5DB] block">
                Mobile money number
              </label>
              <div className="flex items-center gap-2 relative">
                {/* Custom Country Selector Light Button */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="h-[46px] bg-[#F4F4F5] hover:bg-white text-[#0D0F10] font-bold px-3 rounded-xl flex items-center gap-1.5 text-sm transition shadow-sm border border-white"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                    <ChevronDown className="w-4 h-4 text-[#0D0F10]" />
                  </button>

                  {/* Country Dropdown Popover */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#1A1D20] border border-[#2D3135] rounded-xl shadow-2xl py-1 z-30">
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setCountryCode(c.code);
                            setIsCountryDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between hover:bg-[#2A2E33] transition ${
                            c.code === countryCode ? 'text-[#20C77A] font-bold bg-[#2A2E33]/50' : 'text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.country}</span>
                          </span>
                          <span className="font-mono text-[11px] text-[#8B8F94]">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone Input */}
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="772123456"
                  required={isSignUp}
                  className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-3 text-sm text-white placeholder-[#5C6166] font-mono focus:outline-none focus:border-[#20C77A] transition"
                />
              </div>
              <p className="text-[11px] text-[#8B8F94] leading-relaxed pt-0.5">
                Pick your country, then enter the number you'll deposit from and withdraw to. Ugandan, Tanzanian and Kenyan numbers are verified by SMS next.
              </p>
            </div>
          )}

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#D1D5DB] block">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-[#8B8F94] hover:text-white transition"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignUp ? 8 : 1}
              className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-[#20C77A] transition"
            />
            {isSignUp && (
              <p className="text-[11px] text-[#8B8F94]">At least 8 characters</p>
            )}
          </div>

          {/* Partner Code Field (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-[#D1D5DB] block">
                Partner code (optional)
              </label>
              <input
                type="text"
                value={partnerCode}
                onChange={(e) => setPartnerCode(e.target.value)}
                placeholder="e.g. TELVO123"
                className="w-full bg-[#1A1D20] border border-[#2D3135] rounded-xl px-3.5 py-3 text-sm text-white placeholder-[#5C6166] font-mono focus:outline-none focus:border-[#20C77A] transition uppercase"
              />
              <p className="text-[11px] text-[#8B8F94]">
                Have a partner or referral code? Enter it to link your account.
              </p>
            </div>
          )}

          {/* Main Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#F4F4F5] hover:bg-white text-[#0D0F10] font-bold text-sm transition active:scale-[0.98] shadow-md mt-6"
          >
            {isSignUp ? 'Create account' : 'Log in'}
          </button>

          {/* Terms Agreement (Sign Up Only) */}
          {isSignUp && (
            <p className="text-center text-xs text-[#8B8F94] pt-2">
              By signing up you agree to our{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()} className="underline text-[#D1D5DB]">
                Terms
              </a>{' '}
              and{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="underline text-[#D1D5DB]">
                Privacy Policy
              </a>
              .
            </p>
          )}
        </form>
      </div>

      {/* Card Footer (Outside Box) */}
      <div className="text-center text-sm text-[#8B8F94] mt-6 space-x-1">
        {isSignUp ? (
          <>
            <span>Already have an account?</span>{' '}
            <button
              onClick={() => navigate('login')}
              className="font-bold text-white hover:underline transition"
            >
              Log in
            </button>
          </>
        ) : (
          <>
            <span>New here?</span>{' '}
            <button
              onClick={() => navigate('signup')}
              className="font-bold text-white hover:underline transition"
            >
              Create an account
            </button>{' '}
            <span>·</span>{' '}
            <button
              onClick={handleDemoLogin}
              className="font-bold text-white hover:underline transition"
            >
              Try demo
            </button>
          </>
        )}
      </div>
    </div>
  );
};
