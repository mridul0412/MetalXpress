import React from 'react';

function ChangeIndicator({ change }) {
  if (change === null || change === undefined) return null;
  const isUp = change > 0;
  const isDown = change < 0;
  if (!isUp && !isDown) return null;

  return (
    <span className={`text-[10px] ml-1 ${isUp ? 'text-up' : 'text-down'}`}>
      {isUp ? '▲' : '▼'}{Math.abs(change)}
    </span>
  );
}

export default function RateTable({ grades, accentColor }) {
  return (
    <div>
      {/* Header row */}
      <div className="flex items-center px-4 py-1.5 bg-surface3">
        <div className="flex-1 text-[9px] text-gray-600 uppercase tracking-widest">Grade</div>
        <div className="flex items-center gap-5 shrink-0 text-[9px] text-gray-600 uppercase tracking-widest">
          <span className="w-16 text-right">Buy ₹</span>
          <span className="w-16 text-right">Sell ₹</span>
        </div>
      </div>

      <div>
        {grades.map(({ grade, rate }) => {
          if (!rate) return null;

          return (
            <div key={grade.id}
              className="flex items-center px-4 py-2.5 border-t border-border hover:bg-surface2 transition-colors">
              {/* Grade name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-200 text-xs font-medium">{grade.name}</span>
                  {rate.variantLabel && rate.variantPrice && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                    >
                      {rate.variantLabel}: {rate.variantPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Prices */}
              <div className="flex items-center gap-5 shrink-0">
                <div className="w-16 text-right">
                  {rate.buyPrice ? (
                    <span className="text-sm font-bold text-up rate-number">
                      {rate.buyPrice.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-gray-700 text-xs">—</span>
                  )}
                  <ChangeIndicator change={rate.change} />
                </div>
                <div className="w-16 text-right">
                  {rate.sellPrice ? (
                    <span className="text-sm font-bold text-white rate-number">
                      {rate.sellPrice.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-gray-700 text-xs">—</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
