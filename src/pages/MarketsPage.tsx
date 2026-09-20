import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { Search, Star, TrendingUp, TrendingDown, ChevronRight, Activity } from 'lucide-react';
import { MarketCategory } from '../types';

export const MarketsPage: React.FC = () => {
  const { markets, selectMarket, toggleFavoriteMarket, navigate } = useTrading();
  const [activeCategory, setActiveCategory] = useState<MarketCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: (MarketCategory | 'All')[] = ['All', 'Synthetic', 'Forex', 'Crypto', 'Commodities'];

  const filtered = markets.filter((m) => {
    const matchCat = activeCategory === 'All' || m.category === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleTradeAsset = (marketId: string) => {
    selectMarket(marketId);
    navigate('trade');
  };

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#F4F4F5]">Synthetic Markets Directory</h1>
        <p className="text-xs text-[#8B8F94]">Explore continuous volatility indices, forex pairs, and crypto assets.</p>
      </div>

      {/* Search & Categories */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-[#8B8F94] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search market name or symbol..."
            className="w-full pl-9 pr-3 py-2.5 bg-[#151719] border border-[#24272A] rounded-xl text-xs text-[#F4F4F5] placeholder:text-[#8B8F94] focus:outline-none focus:border-[#29D3D8]"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-[#29D3D8] text-[#0D0F10]'
                  : 'bg-[#151719] text-[#8B8F94] hover:text-[#F4F4F5] border border-[#24272A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Market Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((m) => {
          const isUp = m.change >= 0;

          return (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-[#151719] border border-[#24272A] hover:border-[#29D3D8]/40 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => toggleFavoriteMarket(m.id)}
                    className="text-[#8B8F94] hover:text-[#E6C33A]"
                  >
                    <Star className={`w-4 h-4 ${m.isFavorite ? 'fill-[#E6C33A] text-[#E6C33A]' : ''}`} />
                  </button>

                  <div>
                    <h3 className="font-bold text-xs text-[#F4F4F5]">{m.name}</h3>
                    <p className="text-[10px] text-[#8B8F94] font-mono">{m.symbol}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-[#F4F4F5]">{m.price.toFixed(2)}</div>
                  <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                    isUp ? 'text-[#20C77A]' : 'text-[#FF5964]'
                  }`}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{m.change >= 0 ? `+${m.change}%` : `${m.change}%`}</span>
                  </div>
                </div>
              </div>

              {/* Ticks preview */}
              <div className="pt-2 border-t border-[#24272A] flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-[#8B8F94]">
                  <Activity className="w-3 h-3 text-[#29D3D8]" />
                  <span>24/7 Tick Stream</span>
                </div>

                <button
                  onClick={() => handleTradeAsset(m.id)}
                  className="px-3 py-1 rounded-lg bg-[#20C77A] hover:bg-[#1eb871] text-[#0D0F10] font-bold text-xs transition flex items-center gap-1 active:scale-95"
                >
                  <span>Trade</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
