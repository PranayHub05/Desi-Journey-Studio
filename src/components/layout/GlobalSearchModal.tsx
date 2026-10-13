'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Users,
  Map,
  Hotel as HotelIcon,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const router = useRouter();
  const {
    isSearchOpen,
    setIsSearchOpen,
    leads,
    quotations,
    hotels,
    destinations,
  } = useApp();

  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const matchedLeads = leads.filter(
      (l) =>
        l.guestName.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.destination.toLowerCase().includes(q)
    );

    const matchedQuotes = quotations.filter(
      (quo) =>
        quo.quoteNumber.toLowerCase().includes(q) ||
        quo.guestName.toLowerCase().includes(q) ||
        quo.tripTitle.toLowerCase().includes(q) ||
        quo.destinationsSummary.toLowerCase().includes(q)
    );

    const matchedHotels = hotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.destination.toLowerCase().includes(q) ||
        h.starCategory.toLowerCase().includes(q)
    );

    const matchedDestinations = destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.stateOrRegion.toLowerCase().includes(q) ||
        d.attractions.some((a) => a.name.toLowerCase().includes(q))
    );

    return {
      leads: matchedLeads,
      quotes: matchedQuotes,
      hotels: matchedHotels,
      destinations: matchedDestinations,
    };
  }, [query, leads, quotations, hotels, destinations]);

  if (!isSearchOpen) return null;

  const handleSelect = (url: string) => {
    setIsSearchOpen(false);
    setQuery('');
    router.push(url);
  };

  return (
    <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-xs flex items-start justify-center z-50 p-4 pt-20 animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-stone-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type guest name, phone, quote ID, hotel or destination..."
            className="w-full text-sm outline-hidden text-forest-900 placeholder:text-stone-400 bg-transparent font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs px-2 py-1 rounded bg-stone-100 text-stone-500 hover:bg-stone-200"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-stone-400 text-xs">
              <p className="font-medium text-stone-500">Quick Navigation Suggestions</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                <button
                  onClick={() => handleSelect('/itineraries/builder')}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-forest-50 text-stone-700 hover:text-forest-900 text-xs transition-colors"
                >
                  ✨ Launch Itinerary Studio
                </button>
                <button
                  onClick={() => handleSelect('/leads')}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-forest-50 text-stone-700 hover:text-forest-900 text-xs transition-colors"
                >
                  👥 View Leads Pipeline
                </button>
                <button
                  onClick={() => handleSelect('/hotels')}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-forest-50 text-stone-700 hover:text-forest-900 text-xs transition-colors"
                >
                  🏨 Hotel Database
                </button>
              </div>
            </div>
          ) : filteredResults ? (
            <div className="space-y-4 text-xs">
              {/* Quotations */}
              {filteredResults.quotes.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5 text-forest-600" />
                    <span>Itineraries & Quotations ({filteredResults.quotes.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredResults.quotes.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleSelect(`/itineraries/${q.id}/preview`)}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-forest-50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-forest-900 group-hover:text-forest-700">
                            {q.quoteNumber} — {q.tripTitle}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            Guest: {q.guestName} • {q.durationNights}N/{q.durationDays}D • Status: {q.status}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-forest-600 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Leads */}
              {filteredResults.leads.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-forest-600" />
                    <span>Guests & Enquiries ({filteredResults.leads.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredResults.leads.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => handleSelect('/leads')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-forest-50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-forest-900">{l.guestName}</div>
                          <div className="text-[11px] text-stone-500">
                            {l.phone} • {l.destination} • {l.status}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {l.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotels */}
              {filteredResults.hotels.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HotelIcon className="w-3.5 h-3.5 text-forest-600" />
                    <span>Hotels ({filteredResults.hotels.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredResults.hotels.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => handleSelect('/hotels')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-forest-50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-forest-900">{h.name}</div>
                          <div className="text-[11px] text-stone-500">
                            {h.destination} • {h.starCategory} • {h.rates.length} Rate Plans
                          </div>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-medium">
                          From ₹{h.rates[0]?.doubleOccupancyRate?.toLocaleString('en-IN') || '—'}/N
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Destinations */}
              {filteredResults.destinations.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-forest-600" />
                    <span>Destinations ({filteredResults.destinations.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredResults.destinations.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => handleSelect('/destinations')}
                        className="w-full text-left p-2.5 rounded-lg hover:bg-forest-50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-forest-900">{d.name}</div>
                          <div className="text-[11px] text-stone-500">
                            {d.stateOrRegion} • {d.attractions.length} Sights Verified
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-forest-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {filteredResults.quotes.length === 0 &&
                filteredResults.leads.length === 0 &&
                filteredResults.hotels.length === 0 &&
                filteredResults.destinations.length === 0 && (
                  <div className="py-8 text-center text-stone-400">
                    No results found for &ldquo;{query}&rdquo;.
                  </div>
                )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
