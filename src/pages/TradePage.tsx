import React from 'react';
import { useTrading } from '../context/TradingContext';
import { LiveTickChart } from '../components/trade/LiveTickChart';
import { DigitStrip } from '../components/trade/DigitStrip';
import { TradeControls } from '../components/trade/TradeControls';
import { BulkTraderView } from '../components/trade/BulkTraderView';
import { AutoTraderView } from '../components/trade/AutoTraderView';
import { TradeWorkspaceTabs } from '../components/trade/TradeWorkspaceTabs';
import { Zap, Flame, Cpu } from 'lucide-react';
import { AppLogo } from '../components/common/AppLogo';
import { ContractType } from '../types';

export const TradePage: React.FC = () => {
  const { 
    selectedMarket, 
    config, 
    setContractType, 
    setMode 
  } = useTrading();

  const contractTypes: ContractType[] = ['Rise/Fall', 'Matches/Differs', 'Even/Odd', 'Over/Under'];

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 space-y-2 sm:space-y-2.5">
      
      {/* 1. TRADING MODE NAVIGATION HEADER (Manual, Bulk, Auto) */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#151719] border border-[#24272A] rounded-xl">
        <button
          onClick={() => setMode('manual')}
          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            config.mode === 'manual'
              ? 'bg-[#29D3D8] text-[#0D0F10] shadow-sm'
              : 'text-[#8B8F94] hover:text-[#F4F4F5]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="truncate">Manual</span>
        </button>

        <button
          onClick={() => setMode('bulk')}
          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            config.mode === 'bulk'
              ? 'bg-[#E6C33A] text-[#0D0F10] shadow-sm'
              : 'text-[#8B8F94] hover:text-[#F4F4F5]'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="truncate">Bulk</span>
        </button>

        <button
          onClick={() => setMode('auto')}
          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            config.mode === 'auto'
              ? 'bg-[#20C77A] text-[#0D0F10] shadow-sm'
              : 'text-[#8B8F94] hover:text-[#F4F4F5]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="truncate">Auto</span>
        </button>
      </div>

      {/* 2. CONTRACT TYPE SEGMENTED NAVIGATION */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none p-1 bg-[#121416] border border-[#24272A] rounded-xl">
        {contractTypes.map((type) => (
          <button
            key={type}
            onClick={() => setContractType(type)}
            className={`flex-1 min-w-[80px] py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              config.contractType === type
                ? 'bg-[#151719] border border-[#29D3D8]/40 text-[#29D3D8] shadow-sm'
                : 'text-[#8B8F94] hover:text-[#F4F4F5]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* 3. LIVE TICK CHART (With market selector dropdown integrated into chart header) */}
      <LiveTickChart market={selectedMarket} />

      {/* 4. DIGIT STRIP (Single row 0-9 frequency distribution) */}
      <DigitStrip market={selectedMarket} />

      {/* 5. MODE VIEW (Manual Controls, Bulk Trader, or Auto Trader) */}
      {config.mode === 'manual' && <TradeControls />}
      {config.mode === 'bulk' && <BulkTraderView />}
      {config.mode === 'auto' && <AutoTraderView />}

      {/* 6. BOTTOM WORKSPACE TABS */}
      <TradeWorkspaceTabs />

    </div>
  );
};

