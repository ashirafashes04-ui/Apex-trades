import React, { useEffect, useRef } from 'react';
import { MarketItem } from '../../types';
import { useTrading } from '../../context/TradingContext';
import { Activity, ChevronDown } from 'lucide-react';
import { TradeResultBanner } from './TradeResultBanner';

interface LiveTickChartProps {
  market: MarketItem;
}

export const LiveTickChart: React.FC<LiveTickChartProps> = ({ market }) => {
  const { setIsMarketSelectorOpen } = useTrading();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ticks = market.ticksHistory || [];
  const currentPrice = market.price;
  const isUp = market.change >= 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    if (ticks.length < 2) return;

    // Calculate Y min and Y max with padding
    let min = Math.min(...ticks);
    let max = Math.max(...ticks);
    if (min === max) {
      min *= 0.999;
      max *= 1.001;
    }
    const range = max - min;
    const paddingY = 16;

    const getY = (val: number) => {
      return height - paddingY - ((val - min) / range) * (height - 2 * paddingY);
    };

    const getX = (index: number) => {
      return (index / (ticks.length - 1)) * (width - 65); // leave 65px on right for price tag
    };

    // Draw horizontal grid lines
    ctx.strokeStyle = '#24272A';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const gridSteps = 2;
    for (let i = 0; i <= gridSteps; i++) {
      const y = paddingY + (i / gridSteps) * (height - 2 * paddingY);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width - 65, y);
      ctx.stroke();

      // Price labels on right grid
      const priceVal = max - (i / gridSteps) * range;
      ctx.fillStyle = '#8B8F94';
      ctx.font = '9px monospace';
      ctx.fillText(priceVal.toFixed(2), width - 60, y + 3);
    }
    ctx.setLineDash([]);

    // Line Path
    ctx.beginPath();
    ticks.forEach((tick, idx) => {
      const x = getX(idx);
      const y = getY(tick);
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        // Smooth cubic bezier curves
        const prevX = getX(idx - 1);
        const prevY = getY(ticks[idx - 1]);
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });

    const lineColor = isUp ? '#20C77A' : '#FF5964';
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Area fill gradient
    const lastX = getX(ticks.length - 1);
    ctx.lineTo(lastX, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, isUp ? 'rgba(32, 199, 122, 0.2)' : 'rgba(255, 89, 100, 0.2)');
    gradient.addColorStop(1, 'rgba(13, 15, 16, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Latest price dot & pulse
    const latestX = getX(ticks.length - 1);
    const latestY = getY(currentPrice);

    ctx.beginPath();
    ctx.arc(latestX, latestY, 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(latestX, latestY, 7, 0, Math.PI * 2);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right Price Tag Pill
    const tagHeight = 20;
    const tagWidth = 58;
    const tagX = width - 60;
    const tagY = Math.max(2, Math.min(height - tagHeight - 2, latestY - tagHeight / 2));

    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 4);
    ctx.fill();

    ctx.fillStyle = '#0D0F10';
    ctx.font = 'bold 9.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(currentPrice.toFixed(2), tagX + tagWidth / 2, tagY + 13.5);
    ctx.textAlign = 'left';

  }, [ticks, currentPrice, isUp]);

  return (
    <div className="relative w-full bg-[#151719] border border-[#24272A] rounded-xl p-2 sm:p-3 overflow-hidden">
      {/* Floating Trade Result Pop-up Banner */}
      <TradeResultBanner />

      {/* Chart Top Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMarketSelectorOpen(true)}
            className="flex items-center gap-1.5 bg-[#121416] hover:bg-[#1a1d20] px-2 py-1 rounded-lg border border-[#24272A] hover:border-[#29D3D8]/50 transition group"
            title="Switch Volatility Market"
          >
            <Activity className="w-3.5 h-3.5 text-[#29D3D8] animate-pulse" />
            <span className="text-xs font-bold text-[#F4F4F5] group-hover:text-[#29D3D8]">{market.name}</span>
            <ChevronDown className="w-3 h-3 text-[#8B8F94] group-hover:text-[#29D3D8]" />
          </button>

          <div className={`text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
            isUp ? 'bg-[#20C77A]/10 text-[#20C77A]' : 'bg-[#FF5964]/10 text-[#FF5964]'
          }`}>
            <span>{isUp ? '▲' : '▼'}</span>
            <span>{market.change >= 0 ? `+${market.change}%` : `${market.change}%`}</span>
          </div>
        </div>

        <div className="text-[11px] font-mono font-bold text-[#29D3D8]">
          ${market.price.toFixed(2)}
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full h-28 sm:h-36">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Ticks Ticker Feed */}
      <div className="mt-1.5 pt-1.5 border-t border-[#24272A] flex items-center justify-between text-[10px] text-[#8B8F94]">
        <span>Price: <strong className="font-mono text-[#F4F4F5]">{market.price.toFixed(2)}</strong></span>
        <div className="flex items-center gap-1 font-mono">
          <span>Ticks:</span>
          {market.recentDigits.slice(0, 8).map((digit, i) => (
            <span 
              key={i} 
              className={`px-1 py-0.2 rounded font-bold text-[9px] ${
                digit >= 5 ? 'bg-[#20C77A]/15 text-[#20C77A]' : 'bg-[#29D3D8]/15 text-[#29D3D8]'
              }`}
            >
              {digit}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

