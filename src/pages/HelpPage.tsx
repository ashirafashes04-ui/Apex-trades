import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Zap, Bot, BookOpen } from 'lucide-react';

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What are Synthetic Indices?',
      a: 'Synthetic Indices simulate real-world financial market volatility using cryptographically audited random number algorithms. They are available 24/7 and are unaffected by conventional stock market opening hours.',
    },
    {
      q: 'How does Rise / Fall Trading work?',
      a: 'In Rise/Fall, you predict whether the exit price at expiry will be strictly HIGHER (Rise ▲) or strictly LOWER (Fall ▼) than your entry price. Successful predictions pay out 98% net profit.',
    },
    {
      q: 'How does Matches / Differs Trading work?',
      a: 'Matches/Differs trades look at the last digit of the exit tick price. If you predict "Matches 5", you win if the last digit is exactly 5 (paying 890% payout). If you select "Differs 5", you win if the digit is anything except 5 (paying 10% payout).',
    },
    {
      q: 'What is Even / Odd Trading?',
      a: 'Even wins if the last digit of the exit tick price is 0, 2, 4, 6, or 8. Odd wins if the last digit is 1, 3, 5, 7, or 9. Payout is 98%.',
    },
    {
      q: 'Is this real money or demo simulation?',
      a: 'ApexTrades default mode is 100% DEMO SIMULATION. You trade with $10,000.00 virtual capital to test strategies safely without financial risk.',
    },
  ];

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[#F4F4F5] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#29D3D8]" />
          <span>Knowledge & Education Center</span>
        </h1>
        <p className="text-xs text-[#8B8F94]">Learn synthetic contract mechanics, risk management, and trading guides.</p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-1">
          <Zap className="w-5 h-5 text-[#29D3D8]" />
          <h3 className="font-bold text-xs text-[#F4F4F5]">High Speed Ticks</h3>
          <p className="text-[10px] text-[#8B8F94]">Tick contracts settle in as fast as 5 ticks (5 seconds).</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-1">
          <Bot className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-xs text-[#F4F4F5]">ApexAI Guidance</h3>
          <p className="text-[10px] text-[#8B8F94]">Use the floating AI button anytime for strategy analysis.</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#151719] border border-[#24272A] space-y-1">
          <ShieldCheck className="w-5 h-5 text-[#20C77A]" />
          <h3 className="font-bold text-xs text-[#F4F4F5]">Demo Risk Free</h3>
          <p className="text-[10px] text-[#8B8F94]">Practice endlessly with refillable demo balance.</p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-[#151719] border border-[#24272A] rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-xs text-[#F4F4F5]">Frequently Asked Questions</h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <div
                key={idx}
                className="rounded-xl bg-[#121416] border border-[#24272A] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-3 text-left font-bold text-xs text-[#F4F4F5] flex items-center justify-between"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#29D3D8]" /> : <ChevronDown className="w-4 h-4 text-[#8B8F94]" />}
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 text-xs text-[#8B8F94] leading-relaxed border-t border-[#24272A] pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
