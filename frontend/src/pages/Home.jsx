import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import LMEStrip from '../components/LMEStrip';
import LMERatesPanel from '../components/LMERatesPanel';
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
  const [refreshing, setRefreshing] = useState(false);

  const loadRates = useCallback(async (hubSlug, isRefresh = false) => {
    if (!hubSlug) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetchLocalRates(hubSlug);
      setRatesData(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading rates:', err);
      setError('Failed to load rates. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRates(selectedHub);
  }, [selectedHub, loadRates]);

  const hasAnyRates = ratesData?.rates?.some(m =>
    m.grades.some(g => g.rate !== null)
  );

  const formatTime = (d) => {
    if (!d) return '';
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-bg pb-20 sm:pb-4">
      <Navbar />

      {/* Scrolling ticker strip */}
      <LMEStrip />

      <main className="max-w-2xl mx-auto px-3 pt-4">

        {/* Hero banner */}
        <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #1A1500 0%, #141100 50%, #0D0D0D 100%)',
            border: '1px solid #CFB53B33',
          }}>
          <div>
            <div className="text-gold font-bold text-sm leading-tight">
              ⚡ India Scrap Metal Rates
            </div>
            <div className="text-gray-500 text-[11px] mt-0.5">
              Live rates from major trading hubs
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-bold text-white">
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
            </div>
            <div className="text-[10px] text-gray-500">
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Global markets panel — collapsed by default on mobile */}
        <LMERatesPanel defaultExpanded={true} />

        {/* City/Hub selector */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="section-label">📍 Local Hub</span>
            <div className="flex-1 h-px" style={{ background: '#CFB53B22' }} />
          </div>
          <CitySelector selectedHub={selectedHub} onSelectHub={setSelectedHub} />
        </div>

        {/* Hub info + refresh */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {ratesData ? (
              <>
                <h2 className="text-sm font-bold text-white leading-tight">
                  {ratesData.hub?.city} · {ratesData.hub?.name}
                </h2>
                <p className="text-[11px] text-gray-500">Scrap Metal Spot Rates</p>
              </>
            ) : (
              <div>
                <div className="skeleton h-4 w-36 mb-1" />
                <div className="skeleton h-3 w-24" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {lastUpdated && (
              <div className="text-[10px] text-gray-600 text-right leading-tight">
                <div>Updated</div>
                <div className="text-gray-500">{formatTime(lastUpdated)}</div>
              </div>
            )}
            <button
              onClick={() => loadRates(selectedHub, true)}
              disabled={refreshing}
              className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                refreshing
                  ? 'border-border text-gray-600 cursor-not-allowed'
                  : 'border-gold text-gold hover:bg-gold hover:text-black'
              }`}
            >
              <span className={refreshing ? 'animate-spin inline-block' : ''}>↺</span>
              {refreshing ? 'Loading' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-xl p-4 mb-3 text-center border"
            style={{ background: '#1A0A0A', borderColor: '#7f1d1d' }}>
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <button
              onClick={() => loadRates(selectedHub)}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Skeleton loading */}
        {loading && !ratesData && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <MetalCard
                key={i}
                metal={{ emoji: '', name: '', colorHex: '#333' }}
                grades={[]}
                loading={true}
              />
            ))}
          </div>
        )}

        {/* No rates state */}
        {!loading && !error && ratesData && !hasAnyRates && (
          <div className="bg-surface rounded-xl border border-border p-8 text-center">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-white font-bold mb-1">No rates yet for this hub</h3>
            <p className="text-gray-500 text-sm mb-4">
              Rates for {ratesData.hub?.name} haven't been added yet.
            </p>
            <a
              href="/admin"
              className="inline-block border border-gold text-gold px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold hover:text-black transition-colors"
            >
              ➕ Add Rates (Admin)
            </a>
          </div>
        )}

        {/* Metal rate cards */}
        <div className="space-y-3">
          {!loading && ratesData?.rates?.map(({ metal, grades }) => (
            <MetalCard
              key={metal.id}
              metal={metal}
              grades={grades}
              loading={false}
            />
          ))}
        </div>

        <div className="h-2" />
      </main>
    </div>
  );
}
