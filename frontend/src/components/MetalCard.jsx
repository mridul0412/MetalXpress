import React from 'react';
import RateTable from './RateTable';

const COLOR_MAP = {
  '#B87333': 'copper',
  '#CFB53B': 'brass',
  '#A8C0C0': 'aluminium',
  '#708090': 'lead',
  '#4A90D9': 'zinc',
  '#888888': 'steel',
  '#F5A623': 'other',
};

export default function MetalCard({ metal, grades, loading }) {
  const colorClass = COLOR_MAP[metal.colorHex] || 'zinc';
  const borderColor = metal.colorHex;

  if (loading) {
    return (
      <div className="metal-card" style={{ borderLeftColor: '#333', borderLeftWidth: 3 }}>
        <div className="px-4 pt-3 pb-2 border-b border-border">
          <div className="skeleton h-5 w-28" />
        </div>
        <div className="p-3 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-9 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const hasAnyRate = grades.some(g => g.rate !== null);
  const lastUpdated = grades.find(g => g.rate?.updatedAt)?.rate?.updatedAt;
  const contributor = grades.find(g => g.rate?.contributor)?.rate?.contributor;

  return (
    <div
      className="metal-card"
      style={{ borderLeftColor: borderColor, borderLeftWidth: 3 }}
    >
      {/* Metal header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="text-xl leading-none">{metal.emoji}</span>
          <div>
            <span
              className="text-sm font-bold uppercase tracking-wider leading-none"
              style={{ color: borderColor }}
            >
              {metal.name}
            </span>
            {contributor && (
              <div className="text-[9px] text-gray-600 leading-tight mt-0.5">
                via {contributor}
              </div>
            )}
          </div>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-gray-600 rate-number">
            {new Date(lastUpdated).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {/* Rate table */}
      {hasAnyRate ? (
        <RateTable grades={grades} accentColor={borderColor} />
      ) : (
        <div className="px-4 py-5 text-center text-gray-600 text-xs">
          Rates not yet available for this hub
        </div>
      )}
    </div>
  );
}
