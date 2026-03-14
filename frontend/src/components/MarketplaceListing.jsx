import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function MarketplaceListing({ listing, onDelete }) {
  const timeAgo = formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true });
  const expiresIn = formatDistanceToNow(new Date(listing.expiresAt), { addSuffix: true });
  const isExpired = new Date(listing.expiresAt) < new Date();

  return (
    <div
      className={`metal-card p-3 mb-3 ${isExpired ? 'opacity-50' : ''}`}
      style={{ borderLeftColor: listing.metal?.colorHex || '#4A90D9', borderLeftWidth: 3 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">{listing.metal?.emoji}</span>
            <span className="text-sm font-bold text-white">{listing.metal?.name}</span>
            {listing.grade && (
              <span className="text-xs text-gray-500">· {listing.grade.name}</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{listing.location}</div>
        </div>
        <div className="text-right">
          {listing.price ? (
            <div className="text-base font-bold text-green-400 rate-number">
              ₹{listing.price.toLocaleString('en-IN')}/kg
            </div>
          ) : (
            <div className="text-xs text-gray-500">Best Offer</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-2">
        <div>
          <span className="text-xs text-gray-500">Qty: </span>
          <span className="text-xs text-white font-semibold">
            {listing.qty.toLocaleString('en-IN')} {listing.unit}
          </span>
        </div>
        {listing.user?.name && (
          <div>
            <span className="text-xs text-gray-500">Seller: </span>
            <span className="text-xs text-white">{listing.user.name}</span>
          </div>
        )}
      </div>

      {listing.description && (
        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{listing.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href={`tel:${listing.contact}`}
            className="text-xs bg-[#1E3A1E] text-green-400 border border-green-800 px-3 py-1 rounded font-semibold hover:bg-green-900/30 transition-colors"
          >
            📞 Call {listing.contact}
          </a>
          <a
            href={`https://wa.me/91${listing.contact}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-[#1A2A1A] text-green-500 border border-green-900 px-3 py-1 rounded font-semibold hover:bg-green-900/20 transition-colors"
          >
            WhatsApp
          </a>
        </div>
        <div className="text-[10px] text-gray-600 text-right">
          <div>{timeAgo}</div>
          <div className={isExpired ? 'text-red-600' : 'text-gray-600'}>
            {isExpired ? 'Expired' : `Expires ${expiresIn}`}
          </div>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(listing.id)}
          className="mt-2 text-[10px] text-red-600 hover:text-red-500"
        >
          Remove listing
        </button>
      )}
    </div>
  );
}
