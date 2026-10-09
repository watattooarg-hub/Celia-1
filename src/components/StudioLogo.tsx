import React, { useState } from 'react';
import { SALON_INFO } from '../data/services';

interface StudioLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const StudioLogo: React.FC<StudioLogoProps> = ({
  className = '',
  size = 180,
  showText = true,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const numericSize = typeof size === 'number' ? size : 180;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {!imageFailed ? (
        <div 
          className="relative flex items-center justify-center rounded-full transition-transform duration-500 hover:scale-[1.02]"
          style={{ width: numericSize, height: numericSize }}
        >
          <img
            src={SALON_INFO.logoUrl}
            alt="Studio Celia Figueredo"
            width={numericSize}
            height={numericSize}
            loading="eager"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-contain drop-shadow-[0_4px_25px_rgba(212,175,55,0.35)]"
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 500 550"
          width={size}
          height={typeof size === 'number' ? size * 1.1 : 'auto'}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_4px_20px_rgba(212,175,55,0.2)] transition-transform duration-500 hover:scale-[1.02]"
        >
          <defs>
            <linearGradient id="goldLinear" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdf3cd" />
              <stop offset="25%" stopColor="#E2C158" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="75%" stopColor="#9C7721" />
              <stop offset="100%" stopColor="#ECC456" />
            </linearGradient>
            <linearGradient id="lotusRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF1E27" />
              <stop offset="60%" stopColor="#D6001C" />
              <stop offset="100%" stopColor="#8C0012" />
            </linearGradient>
            <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#D4AF37" floodOpacity="0.4" />
            </filter>
          </defs>

          <path
            d="M 235 440 A 215 215 0 1 1 265 440"
            stroke="url(#goldLinear)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="250" cy="442" r="3.5" fill="url(#goldLinear)" />
          <path
            d="M 215 456 L 150 456 M 285 456 L 350 456"
            stroke="url(#goldLinear)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 250 456 C 246 470 240 482 250 492 C 260 482 254 470 250 456 Z"
            stroke="url(#goldLinear)"
            strokeWidth="2"
            fill="none"
          />

          <g id="LotusFlower">
            <path
              d="M 390 120 C 420 80 435 90 440 115 C 445 135 425 155 390 155 Z"
              fill="url(#lotusRed)"
              stroke="url(#goldLinear)"
              strokeWidth="2"
            />
            <path
              d="M 380 90 C 410 50 430 60 435 85 C 440 105 410 125 375 125 Z"
              fill="url(#lotusRed)"
              stroke="url(#goldLinear)"
              strokeWidth="2"
            />
            <path
              d="M 395 105 C 425 45 405 35 390 40 C 375 45 365 75 370 110 Z"
              fill="url(#lotusRed)"
              stroke="url(#goldLinear)"
              strokeWidth="2.5"
            />
          </g>

          <g id="LogoTypography">
            <text
              x="245"
              y="350"
              textAnchor="middle"
              fill="url(#goldLinear)"
              fontFamily="'Alex Brush', cursive"
              fontSize="58"
              letterSpacing="2"
              filter="url(#goldGlow)"
            >
              Studio
            </text>
            <text
              x="245"
              y="410"
              textAnchor="middle"
              fill="url(#goldLinear)"
              fontFamily="'Alex Brush', cursive"
              fontSize="62"
              letterSpacing="1"
              filter="url(#goldGlow)"
            >
              Celia Figueredo
            </text>
          </g>
        </svg>
      )}

      {showText && (
        <div className="text-center mt-2">
          <span className="block text-[10px] md:text-xs tracking-[0.35em] text-[#D4AF37] uppercase font-light">
            Atelier de Haute Esthétique
          </span>
        </div>
      )}
    </div>
  );
};
