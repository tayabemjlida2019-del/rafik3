import React from 'react';

/**
 * Bilingual Brand Logo — الرفيق / RAFIIK
 * Premium gold design matching the platform's Booking.com-inspired identity.
 * 
 * Variants:
 * - full: Icon + Arabic + English (default)
 * - compact: Icon + Arabic only
 * - icon: Icon only
 */
export function BrandLogoLockup({
  className,
  variant = 'full',
  size = 'default',
}: {
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
  size?: 'small' | 'default' | 'large' | 'hero';
}) {
  const sizeConfig = {
    small: { icon: 28, textAr: 18, textEn: 7, gap: 6, tagline: 6 },
    default: { icon: 36, textAr: 24, textEn: 9, gap: 8, tagline: 7 },
    large: { icon: 48, textAr: 34, textEn: 12, gap: 10, tagline: 9 },
    hero: { icon: 64, textAr: 48, textEn: 16, gap: 14, tagline: 12 },
  };

  const s = sizeConfig[size];

  if (variant === 'icon') {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <LogoIcon size={s.icon} />
      </span>
    );
  }

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap }}>
      <LogoIcon size={s.icon} />
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
        <span style={{
          fontFamily: "'Tajawal','Noto Sans Arabic','Cairo',sans-serif",
          fontWeight: 900,
          fontSize: s.textAr,
          background: 'linear-gradient(135deg, #C6A75E 0%, #e8d5a0 45%, #C6A75E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.02em',
          lineHeight: 1.2,
        }}>
          الرفيق
        </span>
        {variant === 'full' && (
          <span style={{
            fontFamily: "'Inter','Helvetica Neue',sans-serif",
            fontWeight: 800,
            fontSize: s.textEn,
            color: '#C6A75E',
            letterSpacing: '0.35em',
            textTransform: 'uppercase' as const,
            opacity: 0.7,
            lineHeight: 1,
            marginTop: 1,
          }}>
            RAFIIK
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * Standalone bilingual logo for footers, login pages, etc.
 * Shows Arabic + tagline + English in a stacked layout.
 */
export function BrandLogoStacked({
  className,
  showTagline = true,
  size = 'default',
}: {
  className?: string;
  showTagline?: boolean;
  size?: 'default' | 'large' | 'hero';
}) {
  const sizeConfig = {
    default: { icon: 48, textAr: 32, textEn: 11, tagAr: 10, gap: 6 },
    large: { icon: 64, textAr: 44, textEn: 14, tagAr: 12, gap: 8 },
    hero: { icon: 80, textAr: 60, textEn: 18, tagAr: 15, gap: 10 },
  };

  const s = sizeConfig[size];

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s.gap }}>
      <LogoIcon size={s.icon} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
        <span style={{
          fontFamily: "'Tajawal','Noto Sans Arabic','Cairo',sans-serif",
          fontWeight: 900,
          fontSize: s.textAr,
          background: 'linear-gradient(135deg, #C6A75E 0%, #e8d5a0 45%, #C6A75E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.03em',
          lineHeight: 1.2,
        }}>
          الرفيق
        </span>
        {showTagline && (
          <span style={{
            fontFamily: "'Tajawal','Noto Sans Arabic',sans-serif",
            fontWeight: 500,
            fontSize: s.tagAr,
            color: 'rgba(198,167,94,0.5)',
            letterSpacing: '0.1em',
            lineHeight: 1,
            marginTop: 2,
          }}>
            منصة الخدمات المتعددة
          </span>
        )}
        <span style={{
          fontFamily: "'Inter','Helvetica Neue',sans-serif",
          fontWeight: 800,
          fontSize: s.textEn,
          color: '#C6A75E',
          letterSpacing: '0.4em',
          textTransform: 'uppercase' as const,
          opacity: 0.5,
          lineHeight: 1,
          marginTop: 6,
        }}>
          RAFIIK
        </span>
      </div>
    </div>
  );
}

/**
 * Logo Icon — Stylized golden square with Arabic calligraphy accent.
 * Inspired by the brand image: a gold square icon with rounded corners.
 */
function LogoIcon({ size = 36 }: { size?: number }) {
  const r = size * 0.22; // corner radius ratio

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="الرفيق"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGoldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C6A75E" />
          <stop offset="40%" stopColor="#e8d5a0" />
          <stop offset="70%" stopColor="#C6A75E" />
          <stop offset="100%" stopColor="#8C6B2E" />
        </linearGradient>
        <linearGradient id="logoGoldBorder" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8d5a0" />
          <stop offset="50%" stopColor="#C6A75E" />
          <stop offset="100%" stopColor="#8C6B2E" />
        </linearGradient>
        <linearGradient id="logoBgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1f35" />
          <stop offset="100%" stopColor="#0a0e1a" />
        </linearGradient>
        <filter id="logoGlow">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#C6A75E" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Background Square */}
      <rect
        x="3" y="3"
        width="94" height="94"
        rx="22" ry="22"
        fill="url(#logoBgGrad)"
        stroke="url(#logoGoldBorder)"
        strokeWidth="2.5"
      />

      {/* Inner ornamental frame */}
      <rect
        x="12" y="12"
        width="76" height="76"
        rx="16" ry="16"
        fill="none"
        stroke="url(#logoGoldGrad)"
        strokeWidth="1"
        opacity="0.25"
      />

      {/* Golden Compass — Symbolizing Travel */}
      <g filter="url(#logoGlow)">
        {/* Compass Dial/Ring */}
        <circle
          cx="50" cy="50" r="32"
          fill="none"
          stroke="url(#logoGoldGrad)"
          strokeWidth="1.5"
          opacity="0.8"
        />
        
        {/* Cardinal Markers */}
        <path d="M50 18 L50 24 M50 76 L50 82 M18 50 L24 50 M76 50 L82 50" stroke="url(#logoGoldGrad)" strokeWidth="2" strokeLinecap="round" />
        
        {/* Smaller Markers */}
        <path d="M72.6 27.4 L68.4 31.6 M27.4 72.6 L31.6 68.4 M72.6 72.6 L68.4 68.4 M27.4 27.4 L31.6 31.6" stroke="url(#logoGoldGrad)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

        {/* Compass Needle - North (Gold Grad) */}
        <path
          d="M50 22 L62 50 L50 50 Z"
          fill="url(#logoGoldGrad)"
        />
        <path
          d="M50 22 L38 50 L50 50 Z"
          fill="#e8d5a0"
        />
        
        {/* Compass Needle - South (Darker/Muted Gold) */}
        <path
          d="M50 78 L62 50 L50 50 Z"
          fill="#8C6B2E"
        />
        <path
          d="M50 78 L38 50 L50 50 Z"
          fill="#C6A75E"
          opacity="0.8"
        />

        {/* Center Pivot */}
        <circle cx="50" cy="50" r="4" fill="url(#logoGoldGrad)" />
        <circle cx="50" cy="50" r="1.5" fill="#0a0e1a" />
      </g>
    </svg>
  );
}

export { LogoIcon };
