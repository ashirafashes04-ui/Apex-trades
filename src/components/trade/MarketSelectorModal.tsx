import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { X, Search, Star, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { MarketCategory } from '../../types';

export const MarketSelectorModal: React.FC = () => {
  const { 
    isMarketSelectorOpen, 
    setIsMarketSelectorOpen, 
    markets, 
    selectedMarket, 
    selectMarket, 
    toggleFavoriteMarket 
  } = useTrading();

  const [activeCategory, setActiveCategory] = useState<MarketCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isMarketSelectorOpen) return null;

  const categories: (MarketCategory | 'All')[] = ['All', 'Synthetic', 'Forex', 'Crypto', 'Commodities'];

  const filteredMarkets = markets.filter((m) => {
    const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={() => setIsMarketSelectorOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Sheet / Dialog */}
      <div className="relative w-full sm:max-w-md bg-[#121416] border-t sm:border border-[#24272A] rounded-t-2xl sm:rounded-2xl p-4 text-[#F4F4F5] z-10 shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#24272A]">
          <div>
            <h3 className="font-bold text-sm text-[#F4F4F5]">Select Trading Asset</h3>
            <p className="text-[10px] text-[#8B8F94]">Synthetic Volatility Indices & Markets</p>
          </div>
          <button
            onClick={() => setIsMarketSelectorOpen(false)}
            className="p-1.5 rounded-lg text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#24272A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="my-3 relative">
          <Search className="w-4 h-4 text-[#8B8F94] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assets (e.g. Volatility 10, BTC, EUR)..."
            className="w-full pl-9 pr-3 py-2 bg-[#151719] border border-[#24272A] rounded-xl text-xs text-[#F4F4F5] placeholder:text-[#8B8F94] focus:outline-none focus:border-[#29D3D8] transition"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2 border-b border-[#24272A]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-[#29D3D8] text-[#0D0F10]'
                  : 'bg-[#151719] text-[#8B8F94] hover:text-[#F4F4F5] hover:bg-[#24272A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Markets List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredMarkets.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B8F94]">No markets found matching query.</div>
          ) : (
            filteredMarkets.map((m) => {
              const isSelected = selectedMarket.id === m.id;
              const isUp = m.change >= 0;

              return (
                <div
                  key={m.id}
                  onClick={() => selectMarket(m.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#29D3D8]/10 border-[#29D3D8]'
                      : 'bg-[#151719] border-[#24272A] hover:bg-[#1c1f22]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMarket(m.id);
                      }}
                      className="text-[#8B8F94] hover:text-[#E6C33A]"
                    >
                      <Star className={`w-4 h-4 ${m.isFavorite ? 'fill-[#E6C33A] text-[#E6C33A]' : ''}`} />
                    </button>

                    <div>
                      <div className="font-bold text-xs text-[#F4F4F5] flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {m.category === 'Synthetic' && (
                          <span className="text-[9px] bg-[#29D3D8]/10 text-[#29D3D8] px-1 rounded font-mono">1s</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8B8F94] font-mono">{m.symbol}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-xs font-mono text-[#F4F4F5]">{m.price.toFixed(2)}</div>
                      <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                        isUp ? 'text-[#20C77A]' : 'text-[#FF5964]'
                      }`}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{m.change >= 0 ? `+${m.change}%` : `${m.change}%`}</span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[#8B8F94]" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
