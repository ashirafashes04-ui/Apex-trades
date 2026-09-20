import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  className = '', 
  size = 'md',
  showText = false
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const dimMap = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64
  };

  const currentSize = sizeMap[size];
  const dim = dimMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className={`${currentSize} rounded-xl bg-[#0B132B] border border-[#20C77A]/30 flex items-center justify-center p-1 shadow-lg shadow-[#20C77A]/15 relative overflow-hidden shrink-0`}
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#20C77A]/20 via-transparent to-[#29D3D8]/20 pointer-events-none" />

        {/* High-definition SVG Logo matching uploaded branding */}
        <svg 
          width={dim - 8} 
          height={dim - 8} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            <linearGradient id="logoGradMain" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="40%" stopColor="#20C77A" />
              <stop offset="75%" stopColor="#29D3D8" />
              <stop offset="100%" stopColor="#32F5A0" />
            </linearGradient>

            <linearGradient id="logoGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.7" />
            </linearGradient>

            <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
              <stop offset="0%" stopColor="#20C77A" />
            </filter>
          </defs>

          {/* Left Ribbon Leg of 'A' */}
          <path 
            d="M 40 22 L 20 78 L 32 78 L 44 45 L 52 58 L 42 78 L 54 78 L 62 62 L 48 37 Z" 
            fill="url(#logoGradDark)" 
          />

          {/* Foreground Trend-Arrow 'A' Main Ribbon */}
          <path 
            d="M 42 22 L 52 22 L 35 78 L 22 78 Z" 
            fill="url(#logoGradMain)" 
            opacity="0.9"
          />

          {/* Integrated Arrow Chart Line */}
          <path 
            d="M 22 70 L 38 48 L 50 60 L 72 26 L 62 26 L 62 18 L 84 18 L 84 40 L 76 40 L 76 30 L 52 68 L 38 54 L 26 72 Z" 
            fill="url(#logoGradMain)" 
          />
        </svg>
      </div>
    </div>
  );
};
