import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { AppLogo } from '../components/common/AppLogo';
import { 
  Settings, 
  User, 
  DollarSign, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Key, 
  RefreshCw, 
  Check, 
  Sliders, 
  Bell, 
  Globe, 
  Smartphone,
  Save
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, config, setContractType, setStake, resetDemoBalance, theme, toggleTheme, addToast } = useTrading();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currencyFormat, setCurrencyFormat] = useState<'USD' | 'UGX'>('USD');
  const [fastExecution, setFastExecution] = useState(true);
  const [autoSaveLogs, setAutoSaveLogs] = useState(true);
  const [defaultStakeVal, setDefaultStakeVal] = useState(config.stake || 10);
  const [apiKey, setApiKey] = useState('apextrades_live_tok_991823120x');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setStake(defaultStakeVal);
    addToast('success', 'Settings Saved', 'Your trading terminal and account preferences have been saved successfully.');
  };

  return (
    <div className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#24272A]">
        <div>
          <h1 className="text-xl font-bold text-[#F4F4F5] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#20C77A]" />
            <span>Terminal Settings</span>
          </h1>
          <p className="text-xs text-[#8B8F94]">Customize execution preferences, account currency, and security controls.</p>
        </div>
        <AppLogo size="sm" />
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* 1. Trading Terminal Preferences */}
        <div className="bg-[#151719] border border-[#24272A] rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#20C77A] uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Trading Execution Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default Stake Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8B8F94]">Default Trade Stake ($ USD)</label>
              <div className="flex items-center bg-[#121416] border border-[#24272A] rounded-xl px-3 py-2 font-mono text-xs text-[#F4F4F5]">
                <span className="text-[#8B8F94] mr-1">$</span>
                <input
                  type="number"
                  value={defaultStakeVal}
                  onChange={(e) => setDefaultStakeVal(parseFloat(e.target.value) || 1)}
                  className="bg-transparent w-full focus:outline-none font-bold"
                />
              </div>
            </div>

            {/* Default Contract Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8B8F94]">Preferred Contract Type</label>
              <select
                value={config.contractType}
                onChange={(e) => setContractType(e.target.value as any)}
                className="w-full bg-[#121416] border border-[#24272A] rounded-xl px-3 py-2 text-xs font-semibold text-[#F4F4F5] focus:outline-none"
              >
                <option value="Rise/Fall">Rise / Fall (High Payout)</option>
                <option value="Matches/Differs">Matches / Differs (Digit Prediction)</option>
                <option value="Even/Odd">Even / Odd (Digit Parity)</option>
                <option value="Over/Under">Over / Under (Digit Threshold)</option>
              </select>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="pt-2 border-t border-[#24272A] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#F4F4F5]">Sound Effects & Alerts</div>
                <div className="text-[10px] text-[#8B8F94]">Play audio cues on win, loss, and tick movements</div>
              </div>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border transition ${
                  soundEnabled 
                    ? 'bg-[#20C77A]/10 border-[#20C77A] text-[#20C77A]' 
                    : 'bg-[#121416] border-[#24272A] text-[#8B8F94]'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#F4F4F5]">Ultra-Fast Tick Execution</div>
                <div className="text-[10px] text-[#8B8F94]">Execute orders without double-confirmation dialogs</div>
              </div>
              <button
                type="button"
                onClick={() => setFastExecution(!fastExecution)}
                className={`w-11 h-6 rounded-full transition-colors p-1 ${
                  fastExecution ? 'bg-[#20C77A]' : 'bg-[#24272A]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  fastExecution ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Currency & Regional Display */}
        <div className="bg-[#151719] border border-[#24272A] rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E6C33A] uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            <span>Currency & Regional Localization</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#8B8F94]">Display Currency Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrencyFormat('USD')}
                  className={`p-2.5 rounded-xl border text-xs font-bold font-mono transition ${
                    currencyFormat === 'USD'
                      ? 'bg-[#20C77A]/10 border-[#20C77A] text-[#20C77A]'
                      : 'bg-[#121416] border-[#24272A] text-[#8B8F94]'
                  }`}
                >
                  USD ($ USD)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyFormat('UGX')}
                  className={`p-2.5 rounded-xl border text-xs font-bold font-mono transition ${
                    currencyFormat === 'UGX'
                      ? 'bg-[#20C77A]/10 border-[#20C77A] text-[#20C77A]'
                      : 'bg-[#121416] border-[#24272A] text-[#8B8F94]'
                  }`}
                >
                  UGX (Ugandan Shilling)
                </button>
              </div>
            </div>

            <div className="space-y-1 bg-[#121416] p-2.5 border border-[#24272A] rounded-xl flex flex-col justify-center">
              <span className="text-[10px] text-[#8B8F94]">Conversion Reference Rate</span>
              <span className="text-xs font-mono font-bold text-[#20C77A]">1.00 USD = 3,750 UGX</span>
              <span className="text-[9px] text-[#8B8F94]">Min Deposit: 5,000 UGX (~$1.33 USD)</span>
            </div>
          </div>
        </div>

        {/* 3. Account Security & API Tokens */}
        <div className="bg-[#151719] border border-[#24272A] rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#29D3D8] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Account Security & API Tokens</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#8B8F94]">Synthetic Terminal Bot API Token</label>
            <div className="flex items-center bg-[#121416] border border-[#24272A] rounded-xl p-1 px-3 font-mono text-xs text-[#F4F4F5]">
              <Key className="w-4 h-4 text-[#29D3D8] mr-2 shrink-0" />
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                readOnly
                className="bg-transparent w-full focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[10px] text-[#29D3D8] hover:underline font-bold px-2 py-1"
              >
                {showApiKey ? 'Hide' : 'Reveal'}
              </button>
            </div>
          </div>

          {/* Reset Demo Capital */}
          <div className="pt-2 border-t border-[#24272A] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#F4F4F5]">Reset Demo Capital</div>
              <div className="text-[10px] text-[#8B8F94]">Restore virtual sandbox balance to $10,000.00 USD</div>
            </div>
            <button
              type="button"
              onClick={() => {
                resetDemoBalance();
                addToast('info', 'Demo Reset', 'Demo balance reset to $10,000.00 USD.');
              }}
              className="px-3 py-1.5 rounded-xl bg-[#24272A] hover:bg-[#29D3D8]/20 text-[#29D3D8] text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Balance</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#20C77A]/20"
        >
          <Save className="w-4 h-4" />
          <span>SAVE TERMINAL PREFERENCES</span>
        </button>
      </form>
    </div>
  );
};
