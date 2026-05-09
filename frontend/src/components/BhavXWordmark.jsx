/**
 * BhavXWordmark — "Bhav | X · India's Metal Exchange" lockup
 *
 * Props:
 *   size       'hero' | 'large' | 'navbar' | 'footer'  (default 'navbar')
 *   tagline    bool — show "India's Metal Exchange" subtitle (default false; auto-on for hero)
 *
 * Marcellus serif throughout. Vertical gold bar separator.
 * X in thin gold border frame. All-gold gradient.
 */
import React from 'react';

const SIZES = {
  hero:   { font: 80, gap: 22, frameY: 6, frameX: 22, barW: 2,   barH: '0.45em', tagSize: 13 },
  large:  { font: 56, gap: 16, frameY: 4, frameX: 16, barW: 1.5, barH: '0.45em', tagSize: 11 },
  navbar: { font: 22, gap: 10, frameY: 3, frameX: 9,  barW: 1.5, barH: '10px',   tagSize: 0  },
  footer: { font: 15, gap: 7,  frameY: 2, frameX: 7,  barW: 1,   barH: '7px',    tagSize: 0  },
};

const GOLD_TEXT = {
  background: 'linear-gradient(180deg, #FFE9A8 0%, #FFC942 28%, #CFB53B 60%, #8C6818 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
};

const BAR_GRADIENT = 'linear-gradient(180deg, #FFE9A8, #CFB53B 50%, #8C6818)';

export default function BhavXWordmark({ size = 'navbar', tagline }) {
  const s = SIZES[size] || SIZES.navbar;
  const showTag = tagline ?? (size === 'hero');

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: s.gap,
        fontFamily: 'Marcellus, serif', fontSize: s.font, lineHeight: 1,
        ...GOLD_TEXT,
      }}>
        <span style={{ letterSpacing: '0.02em' }}>Bhav</span>
        <span style={{
          width: s.barW, height: s.barH,
          background: BAR_GRADIENT, borderRadius: '1px', alignSelf: 'center',
        }} />
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: `${s.frameY}px ${s.frameX}px`,
          border: `${size === 'footer' ? 1 : 1.5}px solid`,
          borderImage: 'linear-gradient(180deg, #FFE9A8, #CFB53B 50%, #8C6818) 1',
          background: 'rgba(207,181,59,0.05)',
          borderRadius: 3,
        }}>
          <span style={{ fontSize: '0.92em', lineHeight: 1, letterSpacing: 0 }}>X</span>
        </span>
      </span>
      {showTag && (
        <span style={{
          fontFamily: 'Cormorant SC, serif', fontWeight: 700,
          fontSize: s.tagSize || 11, letterSpacing: '0.36em',
          color: 'rgba(207,181,59,0.7)', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ width: 28, height: 1, background: 'linear-gradient(90deg, transparent, rgba(207,181,59,0.5))' }} />
          India&apos;s Metal Exchange
          <span style={{ width: 28, height: 1, background: 'linear-gradient(90deg, rgba(207,181,59,0.5), transparent)' }} />
        </span>
      )}
    </span>
  );
}
