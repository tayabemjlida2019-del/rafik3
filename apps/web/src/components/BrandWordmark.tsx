'use client';

import React, { useState } from 'react';

/**
 * Wordmark: "الرفيق" with Maqam Echahid integrated as a letter-form.
 * - Intended for web UI (navbar/headers), not for app icon.
 * - Uses the project's Arabic font stack loaded in globals.css.
 */
export function BrandWordmark({
  className,
}: {
  className?: string;
}) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>
      {imgOk && (
        <img
          src="/brand/rafiq-wordmark.svg"
          alt="الرفيق"
          style={{ height: '100%', width: 'auto' }}
          onError={() => setImgOk(false)}
        />
      )}
      {!imgOk && (
        <svg
          viewBox="0 0 520 120"
          role="img"
          aria-label="الرفيق"
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: '100%', width: 'auto' }}
        >
        <defs>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C9A74E" />
            <stop offset="1" stopColor="#F5E6B3" />
          </linearGradient>
        </defs>
        <text x="505" y="86" textAnchor="end" direction="rtl" style={{ fontFamily: "'Noto Sans Arabic','Inter',sans-serif", fontWeight: 900, fontSize: 78 }} fill="url(#gold)">رفيق</text>
        <text x="205" y="86" textAnchor="end" direction="rtl" style={{ fontFamily: "'Noto Sans Arabic','Inter',sans-serif", fontWeight: 900, fontSize: 78 }} fill="url(#gold)">ا</text>
        <g transform="translate(215 10)">
          <g fill="none" stroke="url(#gold)" strokeLinecap="round" strokeLinejoin="round">
            <path d="M46 6 C58 22 66 42 66 64 C66 92 52 112 46 118 C40 112 26 92 26 64 C26 42 34 22 46 6 Z" strokeWidth="10" />
            <path d="M46 12 C22 22 10 44 10 68 C10 84 16 98 28 112" strokeWidth="9" opacity="0.95" />
            <path d="M46 12 C70 22 82 44 82 68 C82 84 76 98 64 112" strokeWidth="9" opacity="0.95" />
            <path d="M20 118 C32 108 40 104 46 102 C52 104 60 108 72 118" strokeWidth="8" opacity="0.85" />
          </g>
        </g>
        </svg>
      )}
    </span>
  );
}

