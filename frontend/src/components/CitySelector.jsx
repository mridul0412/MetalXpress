import React, { useEffect, useState } from 'react';
import { fetchCities } from '../utils/api';

export default function CitySelector({ selectedHub, onSelectHub }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities()
      .then(res => {
        setCities(res.data || []);
        // Auto-select saved city or first hub
        if (!selectedHub) {
          const savedHub = localStorage.getItem('mx_hub');
          if (savedHub) {
            onSelectHub(savedHub);
          } else if (res.data?.length > 0 && res.data[0].hubs?.length > 0) {
            onSelectHub(res.data[0].hubs[0].slug);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (hubSlug) => {
    localStorage.setItem('mx_hub', hubSlug);
    onSelectHub(hubSlug);
  };

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton h-8 w-24 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 px-4 py-3 min-w-max">
        {cities.map(city => (
          <div key={city.id} className="flex gap-1">
            {city.hubs.map(hub => {
              const isSelected = selectedHub === hub.slug;
              return (
                <button
                  key={hub.id}
                  onClick={() => handleSelect(hub.slug)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all
                    ${isSelected
                      ? 'bg-[#4A90D9] text-white shadow-lg shadow-blue-900/30'
                      : 'bg-[#1A1A1A] text-gray-400 border border-[#2A2A2A] hover:border-[#4A90D9] hover:text-white'
                    }
                  `}
                >
                  <span className="hidden sm:inline">{city.name} · </span>
                  {hub.name}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
