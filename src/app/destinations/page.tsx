'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Sparkles,
  Plus,
  Search,
  Clock,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Destination, Attraction } from '../../types';

export default function DestinationsPage() {
  const { destinations, tripTemplates } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const regions = Array.from(new Set(destinations.map((d) => d.stateOrRegion)));

  const filteredDestinations = destinations.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.stateOrRegion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.attractions.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRegion =
      selectedRegion === 'All' || d.stateOrRegion === selectedRegion;

    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-forest-900 tracking-tight">
              Destinations & Sightseeing Knowledge Base
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Curated regional repositories, verified attractions, duration estimates, and tested travel circuits across India.
          </p>
        </div>

        <Link
          href="/itineraries/builder"
          className="px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Formulate Itinerary</span>
        </Link>
      </div>

      {/* Suggested Indian Circuits Carousel / Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-600" />
          <span>Curated Regional Holiday Templates</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tripTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-card hover:border-emerald-300 transition-colors flex flex-col justify-between text-xs space-y-3"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest-50 text-forest-800">
                  {tmpl.region} • {tmpl.durationNights}N/{tmpl.durationDays}D
                </span>
                <h3 className="font-bold text-forest-900 text-sm mt-1.5">{tmpl.title}</h3>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  {tmpl.overview}
                </p>

                {/* Route ribbon */}
                <div className="mt-3 p-2.5 rounded-lg bg-stone-50 text-[11px] font-medium text-stone-700 flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-forest-900">Route:</span>
                  <span>{tmpl.suggestedRoute.join(' → ')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                <span className="text-[10px] text-stone-400 italic">Ideal: {tmpl.idealFor}</span>
                <Link
                  href={`/itineraries/builder?tmpl=${tmpl.id}`}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Build →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Destination Directory & Sightseeing Points */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-white p-4 rounded-xl border border-stone-200 shadow-card">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination or attraction name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-forest-900 outline-hidden focus:border-forest-600"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <span className="text-[11px] text-stone-400 font-medium mr-1 hidden md:inline">Region:</span>
            {['All', ...regions].map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedRegion === reg
                    ? 'bg-forest-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Cards */}
        <div className="space-y-6">
          {filteredDestinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-card overflow-hidden text-xs"
            >
              <div className="flex flex-col md:flex-row">
                {/* Photo & Overview */}
                <div className="md:w-72 h-56 md:h-auto bg-stone-100 relative flex-shrink-0">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                      {dest.stateOrRegion}
                    </span>
                    <h3 className="text-xl font-bold">{dest.name}</h3>
                    <span className="text-[11px] text-stone-300">
                      Suggested Stay: {dest.suggestedNights} Nights
                    </span>
                  </div>
                </div>

                {/* Sights Grid */}
                <div className="p-6 flex-1 space-y-4">
                  <div>
                    <h4 className="font-bold text-forest-900 text-xs mb-1">Regional Overview</h4>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {dest.overview}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-forest-900 text-xs uppercase tracking-wider">
                        Verified Sightseeing Points & Attractions ({dest.attractions.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {dest.attractions.map((att) => (
                        <div
                          key={att.id}
                          className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5 hover:border-emerald-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-forest-900 text-xs">
                              {att.name}
                            </span>
                            <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 flex-shrink-0">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Verified</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            {att.description}
                          </p>
                          <div className="text-[10px] text-stone-500 pt-1 border-t border-stone-200/60 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>Duration: ~{att.suggestedDurationHours} hrs</span>
                            </span>
                            {att.openingHoursNotes && (
                              <span className="text-stone-400 truncate max-w-[150px]">
                                {att.openingHoursNotes}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
