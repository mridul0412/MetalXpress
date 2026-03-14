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
      <div className="metal-card mb-3" style={{ borderLeftColor: borderColor, borderLeftWidth: 3 }}>
        <div className="p-3">
          <div className="skeleton h-5 w-32 mb-3" />
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton h-8 mb-1.5 rounded" />
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
      className="metal-card mb-3"
      style={{ borderLeftColor: borderColor, borderLeftWidth: 3 }}
    >
      {/* Metal header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">{metal.emoji}</span>
          <span
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: borderColor }}
          >
            {metal.name}
          </span>
        </div>
        {lastUpdated && (
          <span className="text-[10px] text-gray-600">
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
        <div className="px-3 py-4 text-center text-gray-600 text-xs">
          Rates not yet available for this hub
        </div>
      )}

      {/* Contributor footer */}
      {contributor && (
        <div className="px-3 pb-2 pt-1 border-t border-border">
          <span className="text-[10px] text-gray-600">
            Rate by: <span className="text-gray-500">{contributor}</span>
          </span>
        </div>
      )}
    </div>
  );
}
