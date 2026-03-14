import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import LMEStrip from '../components/LMEStrip';
import CitySelector from '../components/CitySelector';
import MetalCard from '../components/MetalCard';
import { fetchLocalRates } from '../utils/api';

export default function Home() {
  const [selectedHub, setSelectedHub] = useState(
    localStorage.getItem('mx_hub') || 'mandoli-delhi'
  );
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadRates = useCallback(async (hubSlug) => {
    if (!hubSlug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchLocalRates(hubSlug);
      setRatesData(res.data);
      setLastUpdated(res.data.lastUpdated ? new Date(res.data.lastUpdated) : new Date());
    } catch (err) {
      console.error('Error loading rates:', err);
      setError('Failed to load rates. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates(selectedHub);
  }, [selectedHub, loadRates]);

  const handleHubSelect = (slug) => {
    setSelectedHub(slug);
  };

  const hasAnyRates = ratesData?.rates?.some(m =>
    m.grades.some(g => g.rate !== null)
  );

  return (
    <div className="min-h-screen bg-bg pb-16 sm:pb-0">
      <Navbar />

      {/* Sticky: LME Strip + City Selector */}
      <div className="sticky top-[49px] z-30 bg-bg shadow-lg shadow-black/50">
        <LMEStrip />
        <div className="bg-[#111111] border-b border-[#2A2A2A]">
          <CitySelector selectedHub={selectedHub} onSelectHub={handleHubSelect} />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-3 pt-3">
        {/* Hub info + last updated */}
        {ratesData && (
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-sm font-bold text-white">
                {ratesData.hub?.city} · {ratesData.hub?.name}
              </h1>
              <p className="text-[10px] text-gray-600">Scrap Metal Spot Rates</p>
            </div>
            <div className="text-right">
              {lastUpdated && (
                <div className="text-[10px] text-gray-600">
                  Updated {lastUpdated.toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'
                  })}
                </div>
              )}
              <button
                onClick={() => loadRates(selectedHub)}
                className="text-[10px] text-[#4A90D9] hover:text-blue-400 mt-0.5"
              >
                ↺ Refresh
              </button>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-[#1A0A0A] border border-red-900 rounded-lg p-4 mb-3 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => loadRates(selectedHub)}
              className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && !ratesData && (
          <div>
            {[1, 2, 3, 4, 5].map(i => (
              <MetalCard
                key={i}
                metal={{ emoji: '', name: '', colorHex: '#333' }}
                grades={[]}
                loading={true}
              />
            ))}
          </div>
        )}

        {/* No rates empty state */}
        {!loading && !error && ratesData && !hasAnyRates && (
          <div className="bg-surface rounded-xl border border-border p-8 text-center mt-4">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-white font-bold mb-1">No rates available yet</h3>
            <p className="text-gray-500 text-sm mb-4">
              Rates for {ratesData.hub?.name} haven't been contributed yet.
            </p>
            <a
              href="/admin"
              className="inline-block bg-[#1A2A3A] border border-[#4A90D9] text-[#4A90D9] px-4 py-2 rounded text-sm font-semibold hover:bg-[#1E3A5A] transition-colors"
            >
              ➕ Contribute Rates
            </a>
          </div>
        )}

        {/* Metal rate cards */}
        {!loading && ratesData?.rates?.map(({ metal, grades }) => (
          <MetalCard
            key={metal.id}
            metal={metal}
            grades={grades}
            loading={false}
          />
        ))}

        {/* Bottom padding for mobile nav */}
        <div className="h-4" />
      </main>
    </div>
  );
}
