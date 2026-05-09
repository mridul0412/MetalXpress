/**
 * BhavXLogo — camera-iris with sun-core bindu (L2.1)
 *
 * Props:
 *   size      number  — px width/height (default 44)
 *   glow      bool    — drop-shadow halo (default false)
 *   gradId    string  — unique id for SVG gradients (default 'bhavxLogo')
 *
 * Single-use SVG with embedded defs so multiple instances coexist.
 */
import React, { useId } from 'react';

export default function BhavXLogo({ size = 44, glow = false, gradId }) {
  // Stable unique IDs so multiple <BhavXLogo /> on same page don't collide
  const _id = useId().replace(/[:]/g, '');
  const goldId = `bhavxGold-${gradId || _id}`;
  const binduId = `bhavxBindu-${gradId || _id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      style={glow ? { filter: 'drop-shadow(0 0 8px rgba(255,140,40,0.25))' } : undefined}
    >
      <defs>
        <linearGradient id={goldId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE9A8" />
          <stop offset="40%" stopColor="#CFB53B" />
          <stop offset="100%" stopColor="#7A5A18" />
        </linearGradient>
        <radialGradient id={binduId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFEF0" />
          <stop offset="20%" stopColor="#FFE9A8" />
          <stop offset="50%" stopColor="#FFC942" />
          <stop offset="80%" stopColor="#FF6B1A" />
          <stop offset="100%" stopColor="#C73E0A" />
        </radialGradient>
      </defs>
      {/* 8 iris blades */}
      <g fill={`url(#${goldId})`}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <path
            key={deg}
            d="M 21,7 L 43,7 L 29,22 L 26,23 Z"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
      </g>
      {/* Sun-core bindu */}
      <circle
        cx="32"
        cy="32"
        r={Math.max(2.5, size * 0.06)}
        fill={`url(#${binduId})`}
      />
    </svg>
  );
}
