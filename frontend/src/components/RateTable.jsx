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
    <div className="divide-y divide-[#1E1E1E]">
      {grades.map(({ grade, rate }) => {
        if (!rate) return null;

        return (
          <div key={grade.id} className="flex items-center px-3 py-2 hover:bg-[#1E1E1E] transition-colors">
            {/* Grade name */}
            <div className="flex-1 min-w-0">
              <span className="text-gray-300 text-xs">{grade.name}</span>
              {rate.variantLabel && rate.variantPrice && (
                <span
                  className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono"
                  style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
                >
                  {rate.variantLabel}: {rate.variantPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Prices */}
            <div className="flex items-center gap-3 shrink-0">
              {rate.buyPrice && (
                <div className="text-right">
                  <div className="text-xs text-gray-500">Buy</div>
                  <div className="text-sm font-bold text-green-400 rate-number">
                    {rate.buyPrice.toLocaleString('en-IN')}
                    <ChangeIndicator change={rate.change} />
                  </div>
                </div>
              )}

              {rate.sellPrice && (
                <>
                  <span className="text-gray-700 text-xs">/</span>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Sell</div>
                    <div className="text-sm font-bold text-white rate-number">
                      {rate.sellPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
