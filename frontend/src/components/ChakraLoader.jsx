/**
 * ChakraLoader — spinning iris with pulsing sun core (3s cycle)
 * Replaces generic spinners across the app.
 *
 * Props:
 *   size   number  — px size (default 28)
 *   label  string  — optional accessible label / visible caption
 *   layout 'inline' | 'block' (default 'inline')
 */
import React, { useId } from 'react';

const STYLE_TAG_ID = 'chakra-loader-keyframes';

// Inject keyframes once globally — idempotent
function ensureStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_TAG_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_TAG_ID;
  style.textContent = `
    @keyframes chakra-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes chakra-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.88; } }
    .chakra-blades { animation: chakra-spin 3s linear infinite; transform-origin: 32px 32px; }
    .chakra-core { transform-origin: 32px 32px; animation: chakra-pulse 3s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}

export default function ChakraLoader({ size = 28, label, layout = 'inline' }) {
  ensureStyles();
  const _id = useId().replace(/[:]/g, '');
  const goldId = `chakraGold-${_id}`;
  const binduId = `chakraBindu-${_id}`;

  const wrapStyle = layout === 'block'
    ? { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 16 }
    : { display: 'inline-flex', alignItems: 'center', gap: 8, verticalAlign: 'middle' };

  return (
    <span style={wrapStyle} role="status" aria-label={label || 'Loading'}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
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
        <g className="chakra-blades" fill={`url(#${goldId})`}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
            <path key={deg} d="M 21,7 L 43,7 L 29,22 L 26,23 Z" transform={`rotate(${deg} 32 32)`} />
          ))}
        </g>
        <g className="chakra-core">
          <circle cx="32" cy="32" r={Math.max(2.5, size * 0.06)} fill={`url(#${binduId})`} />
        </g>
      </svg>
      {label && layout === 'inline' && (
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{label}</span>
      )}
      {label && layout === 'block' && (
        <span style={{
          fontFamily: 'Cormorant SC, serif', fontWeight: 700,
          fontSize: 12, letterSpacing: '0.36em', color: 'rgba(207,181,59,0.7)',
          textTransform: 'uppercase',
        }}>{label}</span>
      )}
    </span>
  );
}
